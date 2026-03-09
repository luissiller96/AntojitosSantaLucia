<?php
require_once(__DIR__ . '/../vendor/autoload.php');
require_once(__DIR__ . '/../config/conexion.php');
require_once(__DIR__ . '/RangoCortesHelper.php');

class PDFGastosOperativos extends Conectar
{
    private $pdf;

    public function __construct()
    {
        date_default_timezone_set('America/Mexico_City');
    }

    /**
     * Generar PDF de gastos operativos diarios
     */
    public function generarReporte($fecha_inicio = null, $fecha_fin = null)
    {
        if (!$fecha_inicio && !$fecha_fin) {
            list($fecha_inicio, $fecha_fin) = RangoCortesHelper::obtenerRangoUltimosCortes();
        }
        list($fecha_inicio, $fecha_fin) = $this->normalizarRangoFechas($fecha_inicio, $fecha_fin);
        $texto_periodo = $this->formatearTextoRango($fecha_inicio, $fecha_fin);
        $nombre_archivo = $this->construirNombreArchivo('gastos_operativos_', $fecha_inicio, $fecha_fin);

        $this->pdf = new TCPDF('P', 'mm', 'LETTER', true, 'UTF-8', false);

        // Configuración del documento
$this->pdf->SetCreator('Sistema POS - Antojitos Santa Lucía');
$this->pdf->SetAuthor('Antojitos Santa Lucía');
        $this->pdf->SetTitle('Gastos Operativos - ' . $texto_periodo);
        $this->pdf->SetSubject('Gastos del periodo');

        // Márgenes
        $this->pdf->SetMargins(15, 15, 15);
        $this->pdf->SetAutoPageBreak(TRUE, 15);

        // Agregar página
        $this->pdf->AddPage();

        // Contenido del reporte
        $this->agregarEncabezado($texto_periodo);
        $this->agregarResumen($fecha_inicio, $fecha_fin);
        $this->agregarDetalleGastos($fecha_inicio, $fecha_fin);
        $this->agregarResumenMetodosPago($fecha_inicio, $fecha_fin);

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

        $this->pdf->SetFont('helvetica', '', 12);
        $this->pdf->Cell(0, 6, 'Reporte de Gastos Operativos', 0, 1, 'C');

        $this->pdf->SetFont('helvetica', 'B', 12);
        $this->pdf->Cell(0, 6, 'Periodo: ' . $fechaFormato, 0, 1, 'C');

        $this->pdf->Ln(5);

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
                    COUNT(*) as total_gastos,
                    COALESCE(SUM(precio_unitario), 0) as total_monto,
                    COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN precio_unitario ELSE 0 END), 0) as efectivo,
                    COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN precio_unitario ELSE 0 END), 0) as tarjeta,
                    COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN precio_unitario ELSE 0 END), 0) as transferencia
                FROM rv_gastos
                WHERE fecha BETWEEN ? AND ? AND tipo = 'operativo'";

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
            array('Total de Gastos Registrados', number_format($resumen['total_gastos'])),
            array('Total en Efectivo', '$' . number_format($resumen['efectivo'], 2)),
            array('Total en Tarjeta', '$' . number_format($resumen['tarjeta'], 2)),
            array('Total en Transferencia', '$' . number_format($resumen['transferencia'], 2)),
            array('TOTAL GENERAL', '$' . number_format($resumen['total_monto'], 2))
        );

        $fill = false;
        foreach ($datos as $i => $row) {
            if ($i == count($datos) - 1) {
                $this->pdf->SetFont('helvetica', 'B', 11);
                $this->pdf->SetFillColor(220, 53, 69);
                $this->pdf->SetTextColor(255, 255, 255);
                $this->pdf->Cell($w[0], 8, $row[0], 1, 0, 'L', true);
                $this->pdf->Cell($w[1], 8, $row[1], 1, 1, 'R', true);
            } else {
                $this->pdf->Cell($w[0], 7, $row[0], 1, 0, 'L', $fill);
                $this->pdf->Cell($w[1], 7, $row[1], 1, 1, 'R', $fill);
                $fill = !$fill;
            }
        }

        $this->pdf->Ln(5);
    }

    private function agregarDetalleGastos($fecha_inicio, $fecha_fin)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        // Obtener gastos
        $sql = "SELECT 
                    TIME(fecha) as hora,
                    descripcion,
                    metodo_pago,
                    precio_unitario as total,
                    comentario
                FROM rv_gastos
                WHERE fecha BETWEEN ? AND ? AND tipo = 'operativo'
                ORDER BY fecha ASC";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$fecha_inicio, $fecha_fin]);
        $gastos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($gastos) == 0) {
            $this->pdf->SetFont('helvetica', 'I', 11);
            $this->pdf->Cell(0, 8, 'No hay gastos operativos registrados para este día.', 0, 1, 'C');
            return;
        }

        $this->pdf->SetFont('helvetica', 'B', 14);
        $this->pdf->Cell(0, 8, 'Detalle de Gastos', 0, 1, 'L');
        $this->pdf->Ln(2);

        // Tabla de gastos
        $this->pdf->SetFillColor(220, 53, 69);
        $this->pdf->SetTextColor(255, 255, 255);
        $this->pdf->SetFont('helvetica', 'B', 9);

        $w = array(20, 75, 30, 30, 35);
        $this->pdf->Cell($w[0], 7, 'Hora', 1, 0, 'C', true);
        $this->pdf->Cell($w[1], 7, 'Descripción', 1, 0, 'C', true);
        $this->pdf->Cell($w[2], 7, 'Método', 1, 0, 'C', true);
        $this->pdf->Cell($w[3], 7, 'Monto', 1, 1, 'C', true);

        $this->pdf->SetTextColor(0, 0, 0);
        $this->pdf->SetFont('helvetica', '', 8);

        $fill = false;
        foreach ($gastos as $gasto) {
            $y_before = $this->pdf->GetY();

            $this->pdf->Cell($w[0], 6, $gasto['hora'], 1, 0, 'C', $fill);

            // Descripción con posible multilínea
            $descripcion = $gasto['descripcion'];
            if (strlen($descripcion) > 50) {
                $descripcion = substr($descripcion, 0, 47) . '...';
            }
            $this->pdf->Cell($w[1], 6, $descripcion, 1, 0, 'L', $fill);

            $this->pdf->Cell($w[2], 6, ucfirst($gasto['metodo_pago']), 1, 0, 'C', $fill);
            $this->pdf->Cell($w[3], 6, '$' . number_format($gasto['total'], 2), 1, 1, 'R', $fill);

            // Si hay comentario, agregar en una nueva fila
            if (!empty($gasto['comentario'])) {
                $this->pdf->SetFont('helvetica', 'I', 7);
                $this->pdf->SetTextColor(100, 100, 100);
                $this->pdf->Cell($w[0], 4, '', 0, 0, 'C', $fill);
                $comentario = substr($gasto['comentario'], 0, 80);
                $this->pdf->Cell($w[1] + $w[2] + $w[3], 4, 'Nota: ' . $comentario, 0, 1, 'L', $fill);
                $this->pdf->SetTextColor(0, 0, 0);
                $this->pdf->SetFont('helvetica', '', 8);
            }

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
                    COUNT(*) as cantidad,
                    COALESCE(SUM(precio_unitario), 0) as total
                FROM rv_gastos
                WHERE fecha BETWEEN ? AND ? AND tipo = 'operativo'
                GROUP BY metodo_pago
                ORDER BY total DESC";

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
        $this->pdf->Cell($w[1], 7, 'Cantidad', 1, 0, 'C', true);
        $this->pdf->Cell($w[2], 7, 'Total', 1, 1, 'C', true);

        $this->pdf->SetTextColor(0, 0, 0);
        $this->pdf->SetFont('helvetica', '', 10);

        $fill = false;
        foreach ($metodos as $metodo) {
            $this->pdf->Cell($w[0], 6, ucfirst($metodo['metodo_pago']), 1, 0, 'L', $fill);
            $this->pdf->Cell($w[1], 6, $metodo['cantidad'], 1, 0, 'C', $fill);
            $this->pdf->Cell($w[2], 6, '$' . number_format($metodo['total'], 2), 1, 1, 'R', $fill);
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
