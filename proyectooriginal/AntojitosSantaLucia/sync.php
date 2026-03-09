<?php
/**
 * smartouch.me/sync.php
 * Sincronizador de Datos + Validador Centralizado de Licencias
 */
 
// Configuración de Errores y CORS para reportar problemas reales
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

$empresa_local = $data['empresa'] ?? ''; // El identificador enviado desde la computadora local
$token_local   = $data['token'] ?? '';     // Token configurado en el Escritorio

if (empty($empresa_local)) {
    echo json_encode(['success' => false, 'error' => 'Identificador de empresa faltante en la solicitud.']);
    exit;
}

// Configuración de BD Nube (Obtenidas de conexion.php)
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
    
    // Buscamos a la empresa en nuestra tabla maestra
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
    $hoy->setTime(0,0,0); // Ignoramos la hora para comparar puramente la fecha
    $fechaPago = new DateTime($licencia['fecha_proximo_pago']);
    $fechaPago->setTime(0,0,0);
    
    // Si hoy es mayor a la fecha del próximo pago, se bloquea la sinc.
    if ($hoy > $fechaPago) {
        // Auto-cambiamos estatus a suspendido en la BD para reflejarlo
        $pdo->query("UPDATE clientes_licencias SET estatus='suspendido_por_pago' WHERE nombre_empresa='$empresa_local'");
        
        echo json_encode([
            'success' => false, 
            'error' => 'Tu mes de servicio ha caducado (Venció el '.$fechaPago->format('d/m/Y').'). La caja ha sido bloqueada hasta recibir el pago.'
        ]);
        exit;
    }

    // Si pasamos Regla A, B y C -> ¡El cliente SI TIENE PERMISO!
    // Actualizamos su última vez visto para que sepas que se conectó bien.
    $pdo->query("UPDATE clientes_licencias SET ultimo_sync_exitoso=CURRENT_TIMESTAMP WHERE nombre_empresa='$empresa_local'");

    // =========================================================================
    // 3. SINCRONIZACIÓN DE DATOS REPRODUCIDOS EN MYSQL EN LA NUBE
    // =========================================================================
    $tablasProcesadas = [];
    
    // Lista controlada de tablas permitidas a sobre-escribir / insertar
    $tablasPermitidas = [
        'rv_ventas' => [
            'campos' => ['ticket', 'id_producto', 'producto', 'total', 'tipo', 'cantidad', 'metodo_pago', 'fecha', 'vendedor', 'total_ticket', 'comanda', 'estatus'],
            'pkey' => ['ticket', 'id_producto'] // Simple suposición IGNORE funcionará
        ],
        'rv_apertura_caja' => [
            'campos' => ['id', 'fecha_apertura', 'monto_apertura', 'usuario_apertura', 'estatus', 'observaciones'],
            'pkey'   => ['id']
        ],
        'rv_gastos' => [
            'campos' => ['id', 'monto', 'motivo', 'fecha', 'usuario_id'],
            'pkey'   => ['id']
        ]
    ];

    foreach ($tablasPermitidas as $nombreTabla => $config) {
        if (!isset($data[$nombreTabla]) || !is_array($data[$nombreTabla])) {
            continue; // La app de Tauri no envió esta tabla
        }

        $registros = $data[$nombreTabla];
        $insertados = 0;

        if (count($registros) > 0) {
            $campos = $config['campos'];
            $camposStr = implode(', ', $campos);
            $placeholders = implode(', ', array_fill(0, count($campos), '?'));
            
            // Usamos IGNORE para que si el ticket ya existe en la nube, no crashee y pase al siguiente
            $sql = "INSERT IGNORE INTO $nombreTabla ($camposStr) VALUES ($placeholders)";
            $stmtInsert = $pdo->prepare($sql);

            foreach ($registros as $fila) {
                $valores = [];
                foreach ($campos as $campo) {
                    $valores[] = isset($fila[$campo]) ? $fila[$campo] : null;
                }
                
                try {
                    $stmtInsert->execute($valores);
                    if ($stmtInsert->rowCount() > 0) {
                        $insertados++;
                    }
                } catch(Exception $e) {
                   // ignorar fila individual si falla
                }
            }
        }

        $tablasProcesadas[$nombreTabla] = [
            'recibidos' => count($registros),
            'insertados' => $insertados
        ];
    }

    // Al devolver success:true, el EXE en la computadora local se auto-regalará 7 días más.
    echo json_encode([
        'success' => true,
        'tablas' => $tablasProcesadas 
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión Nube: ' . $e->getMessage()]);
}
