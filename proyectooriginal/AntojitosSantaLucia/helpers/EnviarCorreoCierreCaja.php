<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/conexion.php';

class EnviarCorreoCierreCaja extends Conectar
{
    private $correo_destino;
    public function __construct($correo_destino = 'luis.siller@outlook.com')
    {
        date_default_timezone_set('America/Mexico_City');
        $this->correo_destino = $correo_destino;
    }

    /**
     * Enviar correo con los 3 PDFs adjuntos y resumen en HTML
     */
    public function enviarReporteCierre($fecha_inicio, $fecha_fin, $pdf_ventas, $pdf_gastos, $pdf_inventario, $datos_caja = array())
    {
        list($fecha_inicio, $fecha_fin) = $this->normalizarRangoFechas($fecha_inicio, $fecha_fin);
        $texto_periodo = $this->formatearTextoRango($fecha_inicio, $fecha_fin);
        $mail = new PHPMailer(true);

        try {
            // Configuración del servidor SMTP
            $mail->isSMTP();
            $mail->Host = 'smtp.hostinger.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'reportes@cega.smartouch.me';
            $mail->Password = 'Lq6sUEb0>';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = 465;
            $mail->CharSet = 'UTF-8';

            // Configuración del remitente
            $mail->setFrom('reportes@cega.smartouch.me', 'Sistema Antojitos Santa Lucía');
            // Destinatario
            $mail->addAddress($this->correo_destino);

            // Adjuntar PDFs
            if (file_exists($pdf_ventas)) {
                $mail->addAttachment($pdf_ventas, basename($pdf_ventas));
            }

            if (file_exists($pdf_gastos)) {
                $mail->addAttachment($pdf_gastos, basename($pdf_gastos));
            }

            if (file_exists($pdf_inventario)) {
                $mail->addAttachment($pdf_inventario, basename($pdf_inventario));
            }

            // Obtener resumen de datos
            $resumen = $this->obtenerResumenPeriodo($fecha_inicio, $fecha_fin);

            // Asunto
            $mail->Subject = "Cierre de Caja - Antojitos Santa Lucía - {$texto_periodo}";

            // Cuerpo del correo en HTML
            $mail->isHTML(true);
            $mail->Body = $this->generarHTMLCorreo($fecha_inicio, $fecha_fin, $resumen, $datos_caja);

            // Versión texto plano
            $mail->AltBody = $this->generarTextoPlano($fecha_inicio, $fecha_fin, $resumen);

            // Enviar
            $mail->send();

            error_log("Correo de cierre de caja enviado exitosamente para periodo: {$texto_periodo}");
            return true;

        } catch (Exception $e) {
            error_log("Error al enviar correo de cierre: " . $mail->ErrorInfo);
            error_log("Excepción: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener resumen completo del día
     */
    private function obtenerResumenPeriodo($fecha_inicio, $fecha_fin)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        // Ventas del día
        $sql_ventas = "SELECT 
                        COUNT(DISTINCT ticket) as total_ordenes,
                        COALESCE(SUM(tickets_por_metodo.total_ticket), 0) as total_ventas,
                        COALESCE(SUM(CASE WHEN tickets_por_metodo.metodo_pago = 'efectivo' THEN tickets_por_metodo.total_ticket ELSE 0 END), 0) as ventas_efectivo,
                        COALESCE(SUM(CASE WHEN tickets_por_metodo.metodo_pago = 'tarjeta' THEN tickets_por_metodo.total_ticket ELSE 0 END), 0) as ventas_tarjeta,
                        COALESCE(SUM(CASE WHEN tickets_por_metodo.metodo_pago = 'transferencia' THEN tickets_por_metodo.total_ticket ELSE 0 END), 0) as ventas_transferencia
                    FROM (
                        SELECT ticket, metodo_pago, MAX(total_ticket) AS total_ticket
                        FROM rv_ventas
                        WHERE fecha BETWEEN ? AND ? AND estatus = 'completado'
                        GROUP BY ticket, metodo_pago
                    ) AS tickets_por_metodo";

        $stmt = $conectar->prepare($sql_ventas);
        $stmt->execute([$fecha_inicio, $fecha_fin]);
        $ventas = $stmt->fetch(PDO::FETCH_ASSOC);

        // Gastos operativos del día
        $sql_gastos = "SELECT 
                        COUNT(*) as total_gastos,
                        COALESCE(SUM(precio_unitario), 0) as total_monto_gastos,
                        COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN precio_unitario ELSE 0 END), 0) as gastos_efectivo
                    FROM rv_gastos
                    WHERE fecha BETWEEN ? AND ? AND tipo = 'operativo'";

        $stmt = $conectar->prepare($sql_gastos);
        $stmt->execute([$fecha_inicio, $fecha_fin]);
        $gastos = $stmt->fetch(PDO::FETCH_ASSOC);

        // Productos más vendidos
        $sql_productos = "SELECT 
                            producto,
                            SUM(cantidad) as cantidad_vendida
                        FROM rv_ventas
                        WHERE fecha BETWEEN ? AND ? AND estatus = 'completado'
                        GROUP BY producto
                        ORDER BY cantidad_vendida DESC
                        LIMIT 5";

        $stmt = $conectar->prepare($sql_productos);
        $stmt->execute([$fecha_inicio, $fecha_fin]);
        $productos_top = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Productos con stock bajo
        $sql_stock_bajo = "SELECT COUNT(*) as productos_alerta
                          FROM rv_productos
                          WHERE pr_estatus = 1 
                            AND pr_stock IS NOT NULL
                            AND pr_stock <= pr_stock_minimo";

        $stmt = $conectar->prepare($sql_stock_bajo);
        $stmt->execute();
        $stock = $stmt->fetch(PDO::FETCH_ASSOC);

        // Calcular efectivo en caja
        $efectivo_esperado = floatval($ventas['ventas_efectivo']) - floatval($gastos['gastos_efectivo']);

        return array(
            'ventas' => $ventas,
            'gastos' => $gastos,
            'productos_top' => $productos_top,
            'stock_bajo' => $stock['productos_alerta'],
            'efectivo_esperado' => $efectivo_esperado
        );
    }

    /**
     * Generar HTML del correo con resumen completo
     */
    private function generarHTMLCorreo($fecha_inicio, $fecha_fin, $resumen, $datos_caja)
    {
        $fecha_formato = $this->formatearTextoRango($fecha_inicio, $fecha_fin);
        $hora_cierre = date('H:i', strtotime($datos_caja['fecha_cierre'] ?? 'now'));

        $ventas = $resumen['ventas'];
        $gastos = $resumen['gastos'];
        $efectivo_esperado = $resumen['efectivo_esperado'];

        // Diferencia de caja
        $monto_cierre = isset($datos_caja['monto_cierre']) ? floatval($datos_caja['monto_cierre']) : 0;
        $monto_apertura = isset($datos_caja['monto_apertura']) ? floatval($datos_caja['monto_apertura']) : 0;
        $diferencia = isset($datos_caja['diferencia_cierre']) ? floatval($datos_caja['diferencia_cierre']) : 0;

        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    max-width: 700px;
                    margin: 0 auto;
                    background-color: #ffffff;
                }
.header {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: #ffffff;  /* Mantener blanco */
    padding: 30px;
    text-align: center;
}
.header h1 {
    margin: 0;
    font-size: 28px;
    color: #ffffff;  /* Puedes cambiarlo aquí, ej: #000000 para negro */
}
                .content {
                    padding: 30px;
                    background-color: #f8f9fa;
                }
                .section {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .section-title {
                    color: #dc3545;
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #dc3545;
                    padding-bottom: 8px;
                }
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 15px;
                }
                .kpi-box {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #dc3545;
                }
                .kpi-label {
                    font-size: 12px;
                    color: #6c757d;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                .kpi-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #212529;
                }
                .kpi-value.success {
                    color: #28a745;
                }
                .kpi-value.danger {
                    color: #dc3545;
                }
                .kpi-value.warning {
                    color: #ffc107;
                }
                .productos-list {
                    list-style: none;
                    padding: 0;
                }
                .productos-list li {
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                }
                .productos-list li:last-child {
                    border-bottom: none;
                }
                .alert {
                    background-color: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .alert-success {
                    background-color: #d4edda;
                    border-color: #28a745;
                }
                .alert-danger {
                    background-color: #f8d7da;
                    border-color: #dc3545;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #6c757d;
                    font-size: 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                table td {
                    padding: 8px;
                    border-bottom: 1px solid #e9ecef;
                }
                table td:first-child {
                    font-weight: 600;
                    color: #495057;
                }
                table td:last-child {
                    text-align: right;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🌮 Antojitos Santa Lucía</h1>
                    <p style='margin: 10px 0 0 0; font-size: 16px;'>Reporte de Cierre de Caja</p>
                    <p style='margin: 5px 0 0 0; font-size: 14px;'>Periodo: {$fecha_formato}</p>
                    <p style='margin: 2px 0 0 0; font-size: 13px;'>Cierre registrado: {$hora_cierre}</p>
                </div>
                
                <div class='content'>
                    <!-- Alerta de Diferencia -->
                    ";

        if ($diferencia != 0) {
            $alert_class = $diferencia > 0 ? 'alert-success' : 'alert-danger';
            $alert_icon = $diferencia > 0 ? '✓' : '⚠';
            $alert_text = $diferencia > 0
                ? "Sobran \$" . number_format(abs($diferencia), 2)
                : "Faltan \$" . number_format(abs($diferencia), 2);

            $html .= "
                    <div class='alert {$alert_class}'>
                        <strong>{$alert_icon} Diferencia en Caja:</strong> {$alert_text}
                    </div>";
        } else {
            $html .= "
                    <div class='alert alert-success'>
                        <strong>✓ Caja Cuadrada:</strong> Sin diferencias
                    </div>";
        }

        $html .= "
                    
                    <!-- Resumen de Ventas -->
                    <div class='section'>
                        <div class='section-title'>💰 Ventas del Día</div>
                        <div class='kpi-grid'>
                            <div class='kpi-box'>
                                <div class='kpi-label'>Total Ventas</div>
                                <div class='kpi-value success'>\$" . number_format($ventas['total_ventas'], 2) . "</div>
                            </div>
                            <div class='kpi-box'>
                                <div class='kpi-label'>Órdenes</div>
                                <div class='kpi-value'>" . number_format($ventas['total_ordenes']) . "</div>
                            </div>
                        </div>
                        <table>
                            <tr>
                                <td>Efectivo</td>
                                <td>\$" . number_format($ventas['ventas_efectivo'], 2) . "</td>
                            </tr>
                            <tr>
                                <td>Tarjeta</td>
                                <td>\$" . number_format($ventas['ventas_tarjeta'], 2) . "</td>
                            </tr>
                            <tr>
                                <td>Transferencia</td>
                                <td>\$" . number_format($ventas['ventas_transferencia'], 2) . "</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Gastos Operativos -->
                    <div class='section'>
                        <div class='section-title'>💸 Gastos Operativos</div>
                        <div class='kpi-grid'>
                            <div class='kpi-box'>
                                <div class='kpi-label'>Total Gastos</div>
                                <div class='kpi-value danger'>\$" . number_format($gastos['total_monto_gastos'], 2) . "</div>
                            </div>
                            <div class='kpi-box'>
                                <div class='kpi-label'>Cantidad</div>
                                <div class='kpi-value'>" . number_format($gastos['total_gastos']) . "</div>
                            </div>
                        </div>
                        <table>
                            <tr>
                                <td>Gastos en Efectivo</td>
                                <td>\$" . number_format($gastos['gastos_efectivo'], 2) . "</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Estado de Caja -->
                    <div class='section'>
                        <div class='section-title'>💵 Estado de Caja</div>
                        <table>
                            <tr>
                                <td>Apertura</td>
                                <td>\$" . number_format($monto_apertura, 2) . "</td>
                            </tr>
                            <tr>
                                <td>Efectivo Esperado</td>
                                <td>\$" . number_format($efectivo_esperado + $monto_apertura, 2) . "</td>
                            </tr>
                            <tr>
                                <td>Conteo Físico</td>
                                <td>\$" . number_format($monto_cierre, 2) . "</td>
                            </tr>
                            <tr style='background-color: #f8f9fa;'>
                                <td style='font-size: 16px;'><strong>Diferencia</strong></td>
                                <td style='font-size: 16px; color: " . ($diferencia >= 0 ? '#28a745' : '#dc3545') . ";'><strong>\$" . number_format($diferencia, 2) . "</strong></td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Productos Más Vendidos -->
                    <div class='section'>
                        <div class='section-title'>🏆 Top 5 Productos</div>
                        <ul class='productos-list'>";

        foreach ($resumen['productos_top'] as $producto) {
            $html .= "
                            <li>
                                <strong>{$producto['producto']}</strong>
                                <span style='float: right; color: #dc3545; font-weight: bold;'>{$producto['cantidad_vendida']} vendidos</span>
                            </li>";
        }

        $html .= "
                        </ul>
                    </div>
                    
                    <!-- Alerta de Inventario -->";

        if ($resumen['stock_bajo'] > 0) {
            $html .= "
                    <div class='alert'>
                        <strong>⚠ Alerta de Inventario:</strong> Hay {$resumen['stock_bajo']} producto(s) con stock bajo. Revisa el PDF adjunto para más detalles.
                    </div>";
        }

        $html .= "
                    
                    <!-- Archivos Adjuntos -->
                    <div class='section'>
                        <div class='section-title'>📎 Documentos Adjuntos</div>
                        <p style='color: #6c757d; margin: 0;'>
                            ✓ Reporte de Ventas Diario<br>
                            ✓ Reporte de Gastos Operativos<br>
                            ✓ Reporte de Inventario con Alertas
                        </p>
                    </div>
                    
                </div>
                
                <div class='footer'>
                    <p>Este correo fue generado automáticamente por:</p>
                    <p>Antojitos Santa Lucía - {$fecha_formato}</p>
                </div>
            </div>
        </body>
        </html>";

        return $html;
    }

    /**
     * Generar versión texto plano
     */
    private function generarTextoPlano($fecha_inicio, $fecha_fin, $resumen)
    {
        $fecha_formato = $this->formatearTextoRango($fecha_inicio, $fecha_fin);
        $ventas = $resumen['ventas'];
        $gastos = $resumen['gastos'];

        $texto = "Antojitos Santa Lucía - CIERRE DE CAJA\n";
        $texto .= "Periodo: {$fecha_formato}\n";
        $texto .= "================================\n\n";

        $texto .= "VENTAS DEL DÍA\n";
        $texto .= "Total: \$" . number_format($ventas['total_ventas'], 2) . "\n";
        $texto .= "Órdenes: " . $ventas['total_ordenes'] . "\n\n";

        $texto .= "GASTOS OPERATIVOS\n";
        $texto .= "Total: \$" . number_format($gastos['total_monto_gastos'], 2) . "\n";
        $texto .= "Cantidad: " . $gastos['total_gastos'] . "\n\n";

        $texto .= "Revisa los PDFs adjuntos para más detalles.\n\n";
        $texto .= "Antojitos Santa Lucía";

        return $texto;
    }

    private function normalizarRangoFechas($fecha_inicio = null, $fecha_fin = null)
    {
        $inicio = $this->normalizarFecha($fecha_inicio, true);
        $fin = $fecha_fin ? $this->normalizarFecha($fecha_fin, false) : date('Y-m-d 23:59:59', strtotime($inicio));

        if (strtotime($fin) < strtotime($inicio)) {
            $fin = $inicio;
        }

        return [$inicio, $fin];
    }

    private function normalizarFecha($valor, $es_inicio)
    {
        if (!$valor) {
            $valor = date('Y-m-d');
        }

        $timestamp = strtotime($valor);
        if ($timestamp === false) {
            $timestamp = time();
        }

        if (strlen(trim($valor)) <= 10) {
            return $es_inicio
                ? date('Y-m-d 00:00:00', $timestamp)
                : date('Y-m-d 23:59:59', $timestamp);
        }

        return date('Y-m-d H:i:s', $timestamp);
    }

    private function formatearTextoRango($inicio, $fin)
    {
        if (substr($inicio, 0, 10) === substr($fin, 0, 10)) {
            return date('d/m/Y', strtotime($inicio));
        }

        return date('d/m/Y H:i', strtotime($inicio)) . ' - ' . date('d/m/Y H:i', strtotime($fin));
    }
}
?>
