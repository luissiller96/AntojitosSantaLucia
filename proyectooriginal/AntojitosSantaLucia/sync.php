<?php
/**
 * smartouch.me/sync.php
 * Sincronizador de Datos + Validador Centralizado de Licencias
 */

// Configuración de Errores y CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// 1. OBTENER DATOS DE LA APP DE ESCRITORIO
$jsonRaw = file_get_contents('php://input');
$data = json_decode($jsonRaw, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos.']);
    exit;
}

$empresa_local = $data['empresa'] ?? '';
$token_local   = $data['token'] ?? '';

if (empty($empresa_local)) {
    echo json_encode(['success' => false, 'error' => 'Identificador de empresa faltante en la solicitud.']);
    exit;
}

// Configuración de BD Nube
$dbHost = '192.241.159.227';
$dbName = 'db_antojitossantalucia';
$dbUser = 'remote_user';
$dbPass = 'k]K^l&Yw!J7';

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // =========================================================================
    // 2. CONTROL DE LICENCIAMIENTO 🔐
    // =========================================================================

    $stmtLic = $pdo->prepare("SELECT estatus, fecha_proximo_pago FROM clientes_licencias WHERE nombre_empresa = :empresa");
    $stmtLic->execute(['empresa' => $empresa_local]);
    $licencia = $stmtLic->fetch(PDO::FETCH_ASSOC);

    // Regla A: El cliente no existe en nuestra base de datos en la nube
    if (!$licencia) {
        echo json_encode([
            'success' => false,
            'error' => 'Error de Licencia: Empresa no registrada en el control central. Contacte a soporte.'
        ]);
        exit;
    }

    // Regla B: El usuario (Luis) le puso estatus de 'suspendido' o 'inactivo' por falta de pago
    if ($licencia['estatus'] !== 'activo') {
        echo json_encode([
            'success' => false,
            'error' => 'Tu licencia se encuentra SUSPENDIDA por falta de pago. Por favor contacta a soporte corporativo.'
        ]);
        exit;
    }

    // Regla C: Su estatus es activo, pero la fecha máxima de pago ya se venció
    $hoy = new DateTime();
    $hoy->setTime(0, 0, 0);
    $fechaPago = new DateTime($licencia['fecha_proximo_pago']);
    $fechaPago->setTime(0, 0, 0);

    if ($hoy > $fechaPago) {
        $pdo->query("UPDATE clientes_licencias SET estatus='suspendido_por_pago' WHERE nombre_empresa='$empresa_local'");

        echo json_encode([
            'success' => false,
            'error' => 'Tu mes de servicio ha caducado (Venció el ' . $fechaPago->format('d/m/Y') . '). La caja ha sido bloqueada hasta recibir el pago.'
        ]);
        exit;
    }

    // Si pasamos A, B y C → el cliente SÍ tiene permiso
    $pdo->query("UPDATE clientes_licencias SET ultimo_sync_exitoso=CURRENT_TIMESTAMP WHERE nombre_empresa='$empresa_local'");

    // =========================================================================
    // 3. SINCRONIZACIÓN — RÉPLICA EXACTA LOCAL → NUBE
    //    Estrategia: INSERT ... ON DUPLICATE KEY UPDATE
    //    Si el registro ya existe en nube, lo actualiza (no solo ignora).
    //    Orden de tablas respeta dependencias de FK.
    // =========================================================================

    // Desactivar FK checks durante la sincronización para evitar errores de orden
    $pdo->query("SET FOREIGN_KEY_CHECKS = 0");

    $tablasProcesadas = [];

    /**
     * Campos reales de cada tabla (coinciden con el schema local SQLite).
     * NOTA: pr_utilidad en rv_productos es columna VIRTUAL/GENERADA → no se incluye.
     * pkey = nombre exacto de la columna PRIMARY KEY.
     */
    $tablasPermitidas = [

        // --- Catálogos base (sin dependencias) ---
        'rv_sucursales' => [
            'campos' => ['id', 'nombre_sucursal', 'direccion', 'telefono'],
            'pkey'   => 'id'
        ],
        'rv_categorias' => [
            'campos' => ['id', 'nombre', 'descripcion', 'fecha_creacion'],
            'pkey'   => 'id'
        ],
        'rv_ingredientes' => [
            'campos' => ['ingrediente_id', 'nombre_ingrediente', 'categoria', 'unidad_medida', 'es_activo'],
            'pkey'   => 'ingrediente_id'
        ],
        'rv_gastos_fijos_plantilla' => [
            'campos' => ['id', 'categoria', 'concepto', 'monto_base', 'descripcion', 'activo', 'fecha_creacion'],
            'pkey'   => 'id'
        ],

        // --- Usuarios y empleados ---
        'tm_usuario' => [
            'campos' => ['usu_id', 'usu_nom', 'usu_ape', 'usu_correo', 'usu_pass', 'usu_empresa', 'usu_puesto', 'usu_photoprofile', 'est'],
            'pkey'   => 'usu_id'
        ],
        'tm_empleado' => [
            'campos' => ['emp_id', 'emp_nombre', 'emp_puesto', 'emp_estatus', 'usu_id', 'sucursal_id'],
            'pkey'   => 'emp_id'
        ],

        // --- Insumos (antes que movimientos y producto_insumos) ---
        'rv_insumos' => [
            'campos' => ['id', 'nombre', 'descripcion', 'unidad_medida', 'stock_actual', 'stock_minimo', 'costo_unitario', 'estatus', 'fecha_registro', 'fecha_modificacion'],
            'pkey'   => 'id'
        ],

        // --- Productos (depende de categorias y sucursales) ---
        'rv_productos' => [
            // pr_utilidad es columna VIRTUAL, no se inserta
            'campos' => ['ID', 'pr_PLU', 'pr_nombre', 'pr_descripcion', 'pr_imagen', 'pr_precioventa', 'pr_preciocompra', 'pr_stock', 'categoria_id', 'sucursal_id', 'pr_promocion_porcentaje', 'pr_preciooriginal', 'pr_estatus', 'es_platillo', 'pr_totalventas', 'pr_favorito', 'pr_stock_minimo'],
            'pkey'   => 'ID'
        ],

        // --- Relaciones de productos ---
        'rv_producto_componentes' => [
            'campos' => ['id', 'producto_padre_id', 'producto_componente_id', 'cantidad_necesaria'],
            'pkey'   => 'id'
        ],
        'rv_producto_insumos' => [
            'campos' => ['id', 'producto_id', 'insumo_id', 'cantidad_necesaria'],
            'pkey'   => 'id'
        ],

        // --- Operaciones de caja y ventas ---
        'rv_apertura_caja' => [
            'campos' => ['id', 'fecha_apertura', 'monto_apertura', 'usu_id', 'fecha_cierre', 'monto_cierre', 'total_ventas_sistema', 'diferencia_cierre', 'estatus', 'usu_id_cierre', 'notas_apertura', 'notas_cierre', 'ventas_efectivo', 'ventas_tarjeta', 'ventas_transferencia', 'gastos_efectivo'],
            'pkey'   => 'id'
        ],
        'rv_ventas' => [
            'campos' => ['id', 'ticket', 'fecha', 'cantidad', 'id_producto', 'producto', 'vendedor', 'metodo_pago', 'total', 'total_ticket', 'cliente', 'estatus', 'plataforma_origen', 'tipo_orden', 'sensor_num', 'direccion', 'costo_envio', 'monto_efectivo', 'monto_tarjeta', 'monto_transferencia'],
            'pkey'   => 'id'
        ],
        'rv_comanda' => [
            'campos' => ['com_id', 'ticket_id', 'com_fecha', 'com_cantidad', 'pr_PLU', 'pr_nombre', 'com_ingredientes_omitir', 'com_comentarios', 'com_estatus', 'ready_at'],
            'pkey'   => 'com_id'
        ],
        'rv_devoluciones' => [
            'campos' => ['dev_id', 'ticket_id', 'motivo', 'usu_id', 'fecha_devolucion'],
            'pkey'   => 'dev_id'
        ],

        // --- Gastos ---
        'rv_gastos' => [
            'campos' => ['id', 'tipo_gasto', 'descripcion', 'fecha', 'comentario', 'precio_unitario', 'tipo', 'metodo_pago', 'tipo_item', 'item_id', 'cantidad_comprada', 'usu_id'],
            'pkey'   => 'id'
        ],
        'rv_gastos_fijos' => [
            'campos' => ['id', 'plantilla_id', 'categoria', 'concepto', 'monto', 'mes', 'anio', 'fecha_pago', 'metodo_pago', 'notas', 'usu_id', 'fecha_registro', 'estatus'],
            'pkey'   => 'id'
        ],

        // --- Movimientos de insumos (al final por FK a rv_insumos) ---
        'rv_movimientos_insumos' => [
            'campos' => ['id', 'insumo_id', 'tipo_movimiento', 'cantidad', 'stock_anterior', 'stock_nuevo', 'motivo', 'ticket_id', 'producto_id', 'usuario_id', 'fecha_movimiento'],
            'pkey'   => 'id'
        ],
    ];

    foreach ($tablasPermitidas as $nombreTabla => $config) {
        if (!isset($data[$nombreTabla]) || !is_array($data[$nombreTabla])) {
            continue; // La app de Tauri no envió esta tabla
        }

        $registros = $data[$nombreTabla];
        $upsertados = 0;

        if (count($registros) > 0) {
            $campos = $config['campos'];
            $pkey   = $config['pkey'];

            $camposStr    = implode(', ', array_map(fn($c) => "`$c`", $campos));
            $placeholders = implode(', ', array_fill(0, count($campos), '?'));

            // ON DUPLICATE KEY UPDATE: actualiza todos los campos excepto la PK
            $updateParts = [];
            foreach ($campos as $campo) {
                if ($campo !== $pkey) {
                    $updateParts[] = "`$campo` = VALUES(`$campo`)";
                }
            }
            $updateClause = implode(', ', $updateParts);

            $sql = "INSERT INTO `$nombreTabla` ($camposStr) VALUES ($placeholders) ON DUPLICATE KEY UPDATE $updateClause";
            $stmtInsert = $pdo->prepare($sql);

            foreach ($registros as $fila) {
                $valores = [];
                foreach ($campos as $campo) {
                    $valores[] = isset($fila[$campo]) ? $fila[$campo] : null;
                }

                try {
                    $stmtInsert->execute($valores);
                    // rowCount: 1 = insertado, 2 = actualizado, 0 = sin cambio
                    if ($stmtInsert->rowCount() > 0) {
                        $upsertados++;
                    }
                } catch (Exception $e) {
                    // Ignorar fila individual si falla
                }
            }
        }

        $tablasProcesadas[$nombreTabla] = [
            'recibidos'  => count($registros),
            'upsertados' => $upsertados
        ];
    }

    // Restaurar FK checks
    $pdo->query("SET FOREIGN_KEY_CHECKS = 1");

    echo json_encode([
        'success' => true,
        'tablas'  => $tablasProcesadas
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión Nube: ' . $e->getMessage()]);
}
