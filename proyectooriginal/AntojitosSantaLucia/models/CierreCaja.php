<?php

date_default_timezone_set('America/Mexico_City');

class CierreCaja extends Conectar
{

    public function abrirCaja($monto, $usuario_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $fechaHora = date("Y-m-d H:i:s");

        // Verificar si ya hay una caja activa antes de abrir
        $stmt_check = $conectar->prepare("SELECT COUNT(*) FROM rv_apertura_caja WHERE estatus = 'activa'");
        $stmt_check->execute();
        if ($stmt_check->fetchColumn() > 0) {
            return ["status" => "error", "message" => "Ya existe una caja activa."];
        }

        $sql = "INSERT INTO rv_apertura_caja (fecha_apertura, monto_apertura, usu_id, estatus) 
                VALUES (?, ?, ?, 'activa')";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$fechaHora, $monto, $usuario_id]);

        return ["status" => "success", "message" => "Caja abierta correctamente"];
    }

    public function cerrarCaja($id_caja_activa, $monto_cierre_fisico, $total_ventas_sistema, $diferencia, $usu_id_cierre)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        if (!$usu_id_cierre) {
            error_log("Usuario ID no definido al cerrar caja.");
            return ["status" => "error", "message" => "Usuario no autenticado."];
        }

        $fechaHora = date("Y-m-d H:i:s");

        $conectar->beginTransaction();

        try {
            // Verificar si hay una caja activa con el ID proporcionado
            $stmt_check_active = $conectar->prepare("SELECT * FROM rv_apertura_caja WHERE id = ? AND estatus = 'activa'");
            $stmt_check_active->execute([$id_caja_activa]);
            $apertura_activa = $stmt_check_active->fetch(PDO::FETCH_ASSOC);

            if (!$apertura_activa) {
                throw new Exception("No se encontró una caja activa con ese ID para cerrar o ya está cerrada.");
            }

            $fecha_apertura = $apertura_activa['fecha_apertura'];

            // Obtener totales por método de pago
            $sql_metodos = "SELECT 
                            COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total_ticket ELSE 0 END), 0) as ventas_efectivo,
                            COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total_ticket ELSE 0 END), 0) as ventas_tarjeta,
                            COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN total_ticket ELSE 0 END), 0) as ventas_transferencia
                        FROM (
                            SELECT 
                                ticket, 
                                metodo_pago, 
                                MAX(total_ticket) as total_ticket 
                            FROM rv_ventas 
                            WHERE fecha >= ? AND fecha <= ? AND estatus = 'completado' 
                            GROUP BY ticket, metodo_pago
                        ) as ventas_por_ticket";
            $stmt_metodos = $conectar->prepare($sql_metodos);
            $stmt_metodos->execute([$fecha_apertura, $fechaHora]);
            $metodos = $stmt_metodos->fetch(PDO::FETCH_ASSOC);

            // Obtener gastos en efectivo del turno
            $sql_gastos = "SELECT COALESCE(SUM(precio_unitario), 0) as gastos_efectivo
              FROM rv_gastos
              WHERE fecha >= ? AND fecha <= ? 
              AND tipo = 'operativo' 
              AND metodo_pago = 'efectivo'";
            $stmt_gastos = $conectar->prepare($sql_gastos);
            $stmt_gastos->execute([$fecha_apertura, $fechaHora]);
            $gastos = $stmt_gastos->fetch(PDO::FETCH_ASSOC);

            // Actualizar la fila de apertura de caja a 'cerrada'
            $sql_apertura = "UPDATE rv_apertura_caja SET 
                                fecha_cierre = ?, 
                                monto_cierre = ?, 
                                total_ventas_sistema = ?, 
                                diferencia_cierre = ?, 
                                estatus = 'cerrada',
                                usu_id_cierre = ?,
                                ventas_efectivo = ?,
                                ventas_tarjeta = ?,
                                ventas_transferencia = ?,
                                gastos_efectivo = ?
                            WHERE id = ? AND estatus = 'activa'";

            $stmt_apertura = $conectar->prepare($sql_apertura);
            $stmt_apertura->execute([
                $fechaHora,
                $monto_cierre_fisico,
                $total_ventas_sistema,
                $diferencia,
                $usu_id_cierre,
                $metodos['ventas_efectivo'],
                $metodos['ventas_tarjeta'],
                $metodos['ventas_transferencia'],
                $gastos['gastos_efectivo'],
                $id_caja_activa
            ]);

            if ($stmt_apertura->rowCount() === 0) {
                throw new Exception("No se pudo actualizar el registro de la caja activa.");
            }

            $conectar->commit();

            // GENERAR Y ENVIAR REPORTES (cargar helpers solo aquí)
            try {
                $this->generarYEnviarReportes($fecha_apertura, $fechaHora, [
                    'id_caja' => $id_caja_activa,
                    'fecha_cierre' => $fechaHora,
                    'fecha_apertura' => $fecha_apertura,
                    'monto_apertura' => $apertura_activa['monto_apertura'],
                    'monto_cierre' => $monto_cierre_fisico,
                    'diferencia_cierre' => $diferencia
                ]);
            } catch (Exception $e) {
                error_log("Error al generar reportes: " . $e->getMessage());
                // No falla el cierre si falla el envío de correo
            }

            return ["status" => "success", "message" => "Caja cerrada correctamente."];

        } catch (Exception $e) {
            $conectar->rollBack();
            error_log("Error al cerrar caja: " . $e->getMessage());
            return ["status" => "error", "message" => "Error al cerrar caja: " . $e->getMessage()];
        }
    }

    /**
     * Generar los 3 PDFs y enviar correo
     */
    private function generarYEnviarReportes($fecha_inicio, $fecha_fin, $datos_caja)
    {
        try {
            // Cargar los helpers solo cuando se necesiten
            require_once(__DIR__ . '/../helpers/PDFReporteVentas.php');
            require_once(__DIR__ . '/../helpers/PDFGastosOperativos.php');
            require_once(__DIR__ . '/../helpers/PDFInventarioAlerta.php');
            require_once(__DIR__ . '/../helpers/EnviarCorreoCierreCaja.php');

            error_log("Iniciando generación de reportes para periodo: {$fecha_inicio} - {$fecha_fin}");

            // 1. Generar PDF de Ventas
            $pdfVentas = new PDFReporteVentas();
            $ruta_ventas = $pdfVentas->generarReporte($fecha_inicio, $fecha_fin);
            error_log("PDF Ventas generado: {$ruta_ventas}");

            // 2. Generar PDF de Gastos Operativos
            $pdfGastos = new PDFGastosOperativos();
            $ruta_gastos = $pdfGastos->generarReporte($fecha_inicio, $fecha_fin);
            error_log("PDF Gastos generado: {$ruta_gastos}");

            // 3. Generar PDF de Inventario
            $pdfInventario = new PDFInventarioAlerta();
            $ruta_inventario = $pdfInventario->generarReporte();
            error_log("PDF Inventario generado: {$ruta_inventario}");

            // 4. Enviar correo con los 3 PDFs
            $mailer = new EnviarCorreoCierreCaja('luis.siller@outlook.com');

            $resultado = $mailer->enviarReporteCierre(
                $fecha_inicio,
                $fecha_fin,
                $ruta_ventas,
                $ruta_gastos,
                $ruta_inventario,
                $datos_caja
            );

            if ($resultado) {
                error_log("Correo enviado exitosamente");
            } else {
                error_log("Error al enviar correo");
            }

            // 5. Limpiar archivos temporales después de enviar
            if (file_exists($ruta_ventas))
                unlink($ruta_ventas);
            if (file_exists($ruta_gastos))
                unlink($ruta_gastos);
            if (file_exists($ruta_inventario))
                unlink($ruta_inventario);

            return $resultado;

        } catch (Exception $e) {
            error_log("Error en generarYEnviarReportes: " . $e->getMessage());
            return false;
        }
    }

    public function obtenerDatosCierre($fecha_apertura, $monto_apertura)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT
                    COALESCE(SUM(ventas_por_ticket.total_ticket), 0) AS total_ventas,
                    COALESCE(SUM(CASE WHEN ventas_por_ticket.metodo_pago = 'efectivo' THEN ventas_por_ticket.total_ticket ELSE 0 END), 0) AS ventas_efectivo,
                    COALESCE(SUM(CASE WHEN ventas_por_ticket.metodo_pago = 'tarjeta' THEN ventas_por_ticket.total_ticket ELSE 0 END), 0) AS ventas_tarjeta,
                    COALESCE(SUM(CASE WHEN ventas_por_ticket.metodo_pago = 'transferencia' THEN ventas_por_ticket.total_ticket ELSE 0 END), 0) AS ventas_transferencia
                FROM (
                    SELECT 
                        ticket, 
                        metodo_pago, 
                        MAX(total_ticket) AS total_ticket
                    FROM rv_ventas
                    WHERE fecha >= ? AND estatus = 'completado'
                    GROUP BY ticket, metodo_pago
                ) AS ventas_por_ticket";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$fecha_apertura]);
        $ventas = $stmt->fetch(PDO::FETCH_ASSOC);

        // Obtener gastos operativos en efectivo
        // Excluir cortes_preventivos para no contarlos dos veces (ya se restan en $total_cortes)
        $sql_gastos = "SELECT COALESCE(SUM(precio_unitario), 0) as salidas_extras
              FROM rv_gastos
              WHERE fecha >= ? 
              AND tipo = 'operativo' 
              AND tipo_gasto != 'corte_preventivo'
              AND metodo_pago = 'efectivo'";

        $stmt_gastos = $conectar->prepare($sql_gastos);
        $stmt_gastos->execute([$fecha_apertura]);
        $gastos = $stmt_gastos->fetch(PDO::FETCH_ASSOC);

        // Obtener cortes preventivos
        $sql_cortes = "SELECT COALESCE(SUM(precio_unitario), 0) as total_cortes
              FROM rv_gastos
              WHERE fecha >= ? 
              AND tipo_gasto = 'corte_preventivo' 
              AND metodo_pago = 'efectivo'";
        $stmt_cortes = $conectar->prepare($sql_cortes);
        $stmt_cortes->execute([$fecha_apertura]);
        $cortes = $stmt_cortes->fetch(PDO::FETCH_ASSOC);

        // Listar cortes preventivos para el panel UI
        $sql_lista_cortes = "SELECT precio_unitario as monto, fecha, comentario 
                             FROM rv_gastos 
                             WHERE fecha >= ? AND tipo_gasto = 'corte_preventivo' 
                             ORDER BY fecha ASC";
        $stmt_lista_cortes = $conectar->prepare($sql_lista_cortes);
        $stmt_lista_cortes->execute([$fecha_apertura]);
        $lista_cortes = $stmt_lista_cortes->fetchAll(PDO::FETCH_ASSOC);

        $entradas_extras = 0;
        $salidas_extras = floatval($gastos['salidas_extras']);
        $total_cortes = floatval($cortes['total_cortes']);

        return [
            "status" => "success",
            "monto_apertura" => floatval($monto_apertura),
            "total_ventas" => floatval($ventas["total_ventas"]),
            "ventas_efectivo" => floatval($ventas["ventas_efectivo"]),
            "ventas_tarjeta" => floatval($ventas["ventas_tarjeta"]),
            "ventas_transferencia" => floatval($ventas["ventas_transferencia"]),
            "entradas_extras" => floatval($entradas_extras),
            "salidas_extras" => $salidas_extras,
            "total_cortes" => $total_cortes,
            "lista_cortes" => $lista_cortes,
            "total_caja_esperado" => floatval($monto_apertura + $ventas["ventas_efectivo"] + $entradas_extras - $salidas_extras - $total_cortes)
        ];
    }

    public function registrarCortePreventivo($monto, $comentario, $usu_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        try {
            $sql = "INSERT INTO rv_gastos 
                    (tipo_gasto, descripcion, fecha, comentario, precio_unitario, 
                     metodo_pago, usu_id) 
                    VALUES ('corte_preventivo', 'CORTE PREVENTIVO CAJA', NOW(), ?, ?, 
                            'efectivo', ?)";

            $stmt = $conectar->prepare($sql);
            $stmt->execute([
                $comentario,
                $monto,
                $usu_id
            ]);

            return true;
        } catch (Exception $e) {
            error_log("Error en registrarCortePreventivo: " . $e->getMessage());
            return false;
        }
    }

    public function verificarCajaActivaStatus()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT id, fecha_apertura, monto_apertura, usu_id 
                FROM rv_apertura_caja 
                WHERE estatus = 'activa' 
                ORDER BY fecha_apertura DESC 
                LIMIT 1";
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $caja = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($caja) {
            return ["status" => "activa", "data" => $caja];
        } else {
            return ["status" => "cerrada", "message" => "No hay una caja activa."];
        }
    }
}
?>
