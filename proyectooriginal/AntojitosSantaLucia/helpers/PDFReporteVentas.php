<?php
require_once(__DIR__ . '/../vendor/autoload.php');
require_once(__DIR__ . '/../config/conexion.php');
require_once(__DIR__ . '/RangoCortesHelper.php');

class PDFReporteVentas extends Conectar
{
    private $pdf;

    public function __construct()
    {
        date_default_timezone_set('America/Mexico_City');
    }

    /**
     * Generar PDF de reporte de ventas diario
     */
    public function generarReporte($fecha_inicio = null, $fecha_fin = null)
    {
        if (!$fecha_inicio && !$fecha_fin) {
            list($fecha_inicio, $fecha_fin) = RangoCortesHelper::obtenerRangoUltimosCortes();
        }

        list($fecha_inicio, $fecha_fin) = $this->normalizarRangoFechas($fecha_inicio, $fecha_fin);
        $texto_periodo = $this->formatearTextoRango($fecha_inicio, $fecha_fin);
        $nombre_archivo = $this->construirNombreArchivo('reporte_ventas_', $fecha_inicio, $fecha_fin);

        $this->pdf = new TCPDF('P', 'mm', 'LETTER', true, 'UTF-8', false);

        // Configuración del documento
        $this->pdf->SetCreator('Sistema POS - Antojitos Santa Lucía');
        $this->pdf->SetAuthor('Antojitos Santa Lucía');
        $this->pdf->SetTitle('Reporte de Ventas - ' . $texto_periodo);
        $this->pdf->SetSubject('Ventas del periodo');

        // Márgenes
        $this->pdf->SetMargins(15, 15, 15);
        $this->pdf->SetAutoPageBreak(TRUE, 15);

        // Agregar página
        $this->pdf->AddPage();

        // Contenido del reporte
        $this->agregarEncabezado($texto_periodo);
        $this->agregarResumen($fecha_inicio, $fecha_fin);
        $this->agregarDetalleVentas($fecha_inicio, $fecha_fin);
        $this->agregarResumenMetodosPago($fecha_inicio, $fecha_fin);
        $this->agregarProductosMasVendidos($fecha_inicio, $fecha_fin);

        // Guardar archivo
        $ruta_completa = __DIR__ . '/../temp/' . $nombre_archivo;

        // Crear carpeta temp si no existe
        if (!file_exists(__DIR__ . '/../temp/')) {
            mkdir(__DIR__ . '/../temp/', 0777, true);
        }

        $this->pdf->Output($ruta_completa, 'F');

        return $ruta_completa;
    }



    private function agregarEncabezado($texto_periodo)
    {
        $fechaFormato = $texto_periodo;

        $this->pdf->SetFont('helvetica', 'B', 18);
        $this->pdf->Cell(0, 10, 'Antojitos Santa Lucía', 0, 1, 'C');  // ✅ CAMBIO AQUÍ
        // Logo (si existe)
        // $this->pdf->Image(__DIR__ . '/../assets/logo.png', 15, 15, 30);


        $this->pdf->SetFont('helvetica', '', 12);
        $this->pdf->Cell(0, 6, 'Reporte de Ventas', 0, 1, 'C');

        $this->pdf->Ln(5);
        $this->pdf->SetFont('helvetica', '', 11);
        $this->pdf->Cell(0, 6, 'Periodo: ' . $fechaFormato, 0, 1, 'C');
        $this->pdf->Ln(3);

        // Línea separadora
        $this->pdf->SetLineWidth(0.5);
        $this->pdf->Line(15, $this->pdf->GetY(), 195, $this->pdf->GetY());
        $this->pdf->Ln(5);
    }

    private function agregarResumen($fecha_inicio, $fecha_fin)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        // Obtener resumen
        $sql = "SELECT 
                    COUNT(DISTINCT ticket) as total_ordenes,
                    COALESCE(SUM(unique_tickets.total_ticket), 0) as total_ventas,
                    COALESCE(AVG(unique_tickets.total_ticket), 0) as ticket_promedio
                FROM (
                    SELECT 
                        ticket, 
                        MAX(total_ticket) AS total_ticket
                    FROM rv_ventas
                    WHERE fecha BETWEEN ? AND ? AND estatus = 'completado'
                    GROUP BY ticket
                ) as unique_tickets";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$fecha_inicio, $fecha_fin]);
        $resumen = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->pdf->SetFont('helvetica', 'B', 14);
        $this->pdf->Cell(0, 8, 'Resumen del Periodo', 0, 1, 'L');
        $this->pdf->Ln(2);

        // Tabla de resumen
        $this->pdf->SetFillColor(220, 53, 69);
        $this->pdf->SetTextColor(255, 255, 255);
        $this->pdf->SetFont('helvetica', 'B', 11);

        $w = array(95, 95);
        $this->pdf->Cell($w[0], 8, 'Concepto', 1, 0, 'C', true);
        $this->pdf->Cell($w[1], 8, 'Valor', 1, 1, 'C', true);

        $this->pdf->SetTextColor(0, 0, 0);
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->SetFillColor(240, 240, 240);

        $datos = array(
            array('Total de Órdenes', number_format($resumen['total_ordenes'])),
            array('Total de Ventas', '$' . number_format($resumen['total_ventas'], 2)),
            array('Ticket Promedio', '$' . number_format($resumen['ticket_promedio'], 2))
        );

        $fill = false;
        foreach ($datos as $row) {
            $this->pdf->Cell($w[0], 7, $row[0], 1, 0, 'L', $fill);
            $this->pdf->Cell($w[1], 7, $row[1], 1, 1, 'R', $fill);
            $fill = !$fill;
        }

        $this->pdf->Ln(5);
    }

    private function agregarDetalleVentas($fecha_inicio, $fecha_fin)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        // Obtener ventas agrupadas por ticket
        $sql = "SELECT 
                    ticket,
                    TIME(MIN(fecha)) as hora,
                    metodo_pago,
                    MAX(total_ticket) as total,
                    GROUP_CONCAT(CONCAT(cantidad, 'x ', producto) SEPARATOR ', ') as productos
                FROM rv_ventas
                WHERE fecha BETWEEN ? AND ? AND estatus = 'completado'
                GROUP BY ticket, metodo_pago
                ORDER BY MIN(fecha) DESC
                LIMIT 50";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$fecha_inicio, $fecha_fin]);
        $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($ventas) == 0) {
            return;
        }

        $this->pdf->SetFont('helvetica', 'B', 14);
        $this->pdf->Cell(0, 8, 'Detalle de Ventas (Últimas 50)', 0, 1, 'L');
        $this->pdf->Ln(2);

        // Tabla de ventas
        $this->pdf->SetFillColor(220, 53, 69);
        $this->pdf->SetTextColor(255, 255, 255);
        $this->pdf->SetFont('helvetica', 'B', 9);

        $w = array(20, 25, 95, 25, 25);
        $this->pdf->Cell($w[0], 7, 'Ticket', 1, 0, 'C', true);
        $this->pdf->Cell($w[1], 7, 'Hora', 1, 0, 'C', true);
        $this->pdf->Cell($w[2], 7, 'Productos', 1, 0, 'C', true);
        $this->pdf->Cell($w[3], 7, 'Método', 1, 0, 'C', true);
        $this->pdf->Cell($w[4], 7, 'Total', 1, 1, 'C', true);

        $this->pdf->SetTextColor(0, 0, 0);
        $this->pdf->SetFont('helvetica', '', 8);

        $fill = false;
        foreach ($ventas as $venta) {
            $this->pdf->Cell($w[0], 6, '#' . $venta['ticket'], 1, 0, 'C', $fill);
            $this->pdf->Cell($w[1], 6, $venta['hora'], 1, 0, 'C', $fill);

            // Productos (puede ser largo, usar MultiCell simulado)
            $productos = substr($venta['productos'], 0, 60) . (strlen($venta['productos']) > 60 ? '...' : '');
            $this->pdf->Cell($w[2], 6, $productos, 1, 0, 'L', $fill);

            $this->pdf->Cell($w[3], 6, ucfirst($venta['metodo_pago']), 1, 0, 'C', $fill);
            $this->pdf->Cell($w[4], 6, '$' . number_format($venta['total'], 2), 1, 1, 'R', $fill);
            $fill = !$fill;
        }

        $this->pdf->Ln(5);
    }

    private function agregarResumenMetodosPago($fecha_inicio, $fecha_fin)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT 
                    metodo_pago,
                    COUNT(DISTINCT ticket) as num_tickets,
                    SUM(total_ticket) as total
                FROM (
                    SELECT 
                        ticket, 
                        metodo_pago, 
                        MAX(total_ticket) as total_ticket 
                    FROM rv_ventas 
                    WHERE fecha BETWEEN ? AND ? AND estatus = 'completado' 
                    GROUP BY ticket, metodo_pago
                ) as ventas_por_ticket
                GROUP BY metodo_pago";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$fecha_inicio, $fecha_fin]);
        $metodos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($metodos) == 0) {
            return;
        }

        $this->pdf->SetFont('helvetica', 'B', 14);
        $this->pdf->Cell(0, 8, 'Resumen por Método de Pago', 0, 1, 'L');
        $this->pdf->Ln(2);

        $this->pdf->SetFillColor(220, 53, 69);
        $this->pdf->SetTextColor(255, 255, 255);
        $this->pdf->SetFont('helvetica', 'B', 10);

        $w = array(63, 63, 64);
        $this->pdf->Cell($w[0], 7, 'Método de Pago', 1, 0, 'C', true);
        $this->pdf->Cell($w[1], 7, 'Tickets', 1, 0, 'C', true);
        $this->pdf->Cell($w[2], 7, 'Total', 1, 1, 'C', true);

        $this->pdf->SetTextColor(0, 0, 0);
        $this->pdf->SetFont('helvetica', '', 10);

        $fill = false;
        foreach ($metodos as $metodo) {
            $this->pdf->Cell($w[0], 6, ucfirst($metodo['metodo_pago']), 1, 0, 'L', $fill);
            $this->pdf->Cell($w[1], 6, $metodo['num_tickets'], 1, 0, 'C', $fill);
            $this->pdf->Cell($w[2], 6, '$' . number_format($metodo['total'], 2), 1, 1, 'R', $fill);
            $fill = !$fill;
        }

        $this->pdf->Ln(5);
    }

    private function agregarProductosMasVendidos($fecha_inicio, $fecha_fin)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT 
                    producto,
                    SUM(cantidad) as cantidad_vendida,
                    COALESCE(SUM(total), 0) as total_vendido
                FROM rv_ventas
                WHERE fecha BETWEEN ? AND ? AND estatus = 'completado'
                GROUP BY producto
                ORDER BY cantidad_vendida DESC
                LIMIT 10";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$fecha_inicio, $fecha_fin]);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($productos) == 0) {
            return;
        }

        $this->pdf->SetFont('helvetica', 'B', 14);
        $this->pdf->Cell(0, 8, 'Top 10 Productos Más Vendidos', 0, 1, 'L');
        $this->pdf->Ln(2);

        $this->pdf->SetFillColor(220, 53, 69);
        $this->pdf->SetTextColor(255, 255, 255);
        $this->pdf->SetFont('helvetica', 'B', 10);

        $w = array(95, 47.5, 47.5);
        $this->pdf->Cell($w[0], 7, 'Producto', 1, 0, 'C', true);
        $this->pdf->Cell($w[1], 7, 'Cantidad', 1, 0, 'C', true);
        $this->pdf->Cell($w[2], 7, 'Total', 1, 1, 'C', true);

        $this->pdf->SetTextColor(0, 0, 0);
        $this->pdf->SetFont('helvetica', '', 10);

        $fill = false;
        foreach ($productos as $producto) {
            $this->pdf->Cell($w[0], 6, $producto['producto'], 1, 0, 'L', $fill);
            $this->pdf->Cell($w[1], 6, $producto['cantidad_vendida'], 1, 0, 'C', $fill);
            $this->pdf->Cell($w[2], 6, '$' . number_format($producto['total_vendido'], 2), 1, 1, 'R', $fill);
            $fill = !$fill;
        }
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

        return 'Del ' . date('d/m/Y H:i', strtotime($inicio)) . ' al ' . date('d/m/Y H:i', strtotime($fin));
    }

    private function construirNombreArchivo($prefijo, $inicio, $fin)
    {
        if (substr($inicio, 0, 10) === substr($fin, 0, 10)) {
            return $prefijo . substr($inicio, 0, 10) . '.pdf';
        }

        return $prefijo . date('Ymd_His', strtotime($inicio)) . '_a_' . date('Ymd_His', strtotime($fin)) . '.pdf';
    }
}
?>
