<?php
require_once(__DIR__ . '/../vendor/autoload.php');
require_once(__DIR__ . '/../config/conexion.php');

class PDFInventarioAlerta extends Conectar
{
    private $pdf;
    
    public function __construct()
    {
        date_default_timezone_set('America/Mexico_City');
    }
    
    /**
     * Generar PDF de inventario con alerta de stock bajo
     */
    public function generarReporte()
    {
        $this->pdf = new TCPDF('P', 'mm', 'LETTER', true, 'UTF-8', false);
        
        // Configuración del documento
$this->pdf->SetCreator('Sistema POS - Antojitos Santa Lucía');
$this->pdf->SetAuthor('Antojitos Santa Lucía');
        $this->pdf->SetTitle('Reporte de Inventario - Stock Bajo');
        $this->pdf->SetSubject('Alerta de inventario');
        
        // Márgenes
        $this->pdf->SetMargins(15, 15, 15);
        $this->pdf->SetAutoPageBreak(TRUE, 15);
        
        // Agregar página
        $this->pdf->AddPage();
        
        // Contenido del reporte
        $this->agregarEncabezado();
        $this->agregarProductosBajoStock();
        $this->agregarResumenInventario();
        
        // Guardar archivo
        $fecha = date('Y-m-d');
        $nombre_archivo = 'inventario_alerta_' . $fecha . '.pdf';
        $ruta_completa = __DIR__ . '/../temp/' . $nombre_archivo;
        
        // Crear carpeta temp si no existe
        if (!file_exists(__DIR__ . '/../temp/')) {
            mkdir(__DIR__ . '/../temp/', 0777, true);
        }
        
        $this->pdf->Output($ruta_completa, 'F');
        
        return $ruta_completa;
    }
    
    private function agregarEncabezado()
    {
        $fechaFormato = date('d/m/Y');
        
    $this->pdf->SetFont('helvetica', 'B', 18);
    $this->pdf->Cell(0, 10, 'Antojitos Santa Lucía', 0, 1, 'C');  // ✅ CAMBIO AQUÍ
    
        $this->pdf->SetFont('helvetica', '', 12);
        $this->pdf->Cell(0, 6, 'Reporte de Inventario - Alerta de Stock Bajo', 0, 1, 'C');
        
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->Cell(0, 6, 'Generado: ' . $fechaFormato, 0, 1, 'C');
        
        $this->pdf->Ln(5);
        
        // Línea separadora
        $this->pdf->SetLineWidth(0.5);
        $this->pdf->Line(15, $this->pdf->GetY(), 195, $this->pdf->GetY());
        $this->pdf->Ln(5);
        
        // Alerta
        $this->pdf->SetFillColor(255, 193, 7);
        $this->pdf->SetTextColor(0, 0, 0);
        $this->pdf->SetFont('helvetica', 'B', 11);
        $this->pdf->Cell(0, 8, '  ⚠  PRODUCTOS CON STOCK BAJO O CRÍTICO', 0, 1, 'L', true);
        $this->pdf->Ln(3);
    }
    
private function agregarProductosBajoStock()
{
    $conectar = parent::Conexion();
    parent::set_names();
    
    // Obtener TODOS los productos activos
    $sql = "SELECT 
                p.pr_nombre,
                c.nombre as categoria,
                p.pr_stock,
                p.pr_stock_minimo,
                p.pr_precioventa,
                CASE 
                    WHEN p.pr_stock IS NULL THEN 'Sin inventario'
                    WHEN p.pr_stock = 0 THEN 'Agotado'
                    WHEN p.pr_stock <= (p.pr_stock_minimo * 0.5) THEN 'Crítico'
                    WHEN p.pr_stock <= p.pr_stock_minimo THEN 'Bajo'
                    ELSE 'Normal'
                END as nivel_alerta
            FROM rv_productos p
            LEFT JOIN rv_categorias c ON p.categoria_id = c.id
            WHERE p.pr_estatus = 1 
                AND p.pr_stock IS NOT NULL
            ORDER BY 
                CASE 
                    WHEN p.pr_stock = 0 THEN 1
                    WHEN p.pr_stock <= (p.pr_stock_minimo * 0.5) THEN 2
                    WHEN p.pr_stock <= p.pr_stock_minimo THEN 3
                    ELSE 4
                END,
                p.pr_stock ASC";
    
    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($productos) == 0) {
        $this->pdf->SetFont('helvetica', 'I', 11);
        $this->pdf->Cell(0, 8, 'No hay productos con inventario registrado.', 0, 1, 'C');
        return;
    }
    
    // Contador de alertas
    $criticos = 0;
    $bajos = 0;
    $agotados = 0;
    $normales = 0;
    
    foreach ($productos as $producto) {
        if ($producto['nivel_alerta'] == 'Agotado') $agotados++;
        elseif ($producto['nivel_alerta'] == 'Crítico') $criticos++;
        elseif ($producto['nivel_alerta'] == 'Bajo') $bajos++;
        elseif ($producto['nivel_alerta'] == 'Normal') $normales++;
    }
    
    // Mostrar resumen de alertas
    $this->pdf->SetFont('helvetica', 'B', 10);
    $this->pdf->Cell(0, 6, "Total de productos: " . count($productos), 0, 1, 'L');
    $this->pdf->SetFont('helvetica', '', 9);
    $this->pdf->Cell(0, 5, "• Agotados: $agotados  |  Críticos: $criticos  |  Stock Bajo: $bajos  |  Normales: $normales", 0, 1, 'L');
    $this->pdf->Ln(3);
    
    // Tabla de productos
    $this->pdf->SetFillColor(220, 53, 69);
    $this->pdf->SetTextColor(255, 255, 255);
    $this->pdf->SetFont('helvetica', 'B', 9);
    
    $w = array(70, 35, 25, 25, 35);
    $this->pdf->Cell($w[0], 7, 'Producto', 1, 0, 'C', true);
    $this->pdf->Cell($w[1], 7, 'Categoría', 1, 0, 'C', true);
    $this->pdf->Cell($w[2], 7, 'Stock', 1, 0, 'C', true);
    $this->pdf->Cell($w[3], 7, 'Mínimo', 1, 0, 'C', true);
    $this->pdf->Cell($w[4], 7, 'Estado', 1, 1, 'C', true);
    
    $this->pdf->SetTextColor(0, 0, 0);
    $this->pdf->SetFont('helvetica', '', 8);
    
    foreach ($productos as $producto) {
        // Color de fondo según nivel de alerta
        $fill_color = $this->getColorAlerta($producto['nivel_alerta']);
        $this->pdf->SetFillColor($fill_color[0], $fill_color[1], $fill_color[2]);
        
        $this->pdf->Cell($w[0], 6, $producto['pr_nombre'], 1, 0, 'L', true);
        $this->pdf->Cell($w[1], 6, $producto['categoria'] ?? 'Sin categoría', 1, 0, 'C', true);
        $this->pdf->Cell($w[2], 6, $producto['pr_stock'], 1, 0, 'C', true);
        $this->pdf->Cell($w[3], 6, $producto['pr_stock_minimo'], 1, 0, 'C', true);
        
        // Estado con estilo
        $this->pdf->SetFont('helvetica', 'B', 8);
        $this->pdf->Cell($w[4], 6, $producto['nivel_alerta'], 1, 1, 'C', true);
        $this->pdf->SetFont('helvetica', '', 8);
    }
    
    $this->pdf->Ln(5);
}
    private function agregarResumenInventario()
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        // Obtener estadísticas generales
        $sql = "SELECT 
                    COUNT(*) as total_productos,
                    SUM(CASE WHEN pr_stock IS NOT NULL THEN 1 ELSE 0 END) as con_inventario,
                    SUM(CASE WHEN pr_stock <= pr_stock_minimo AND pr_stock IS NOT NULL THEN 1 ELSE 0 END) as con_alerta,
                    SUM(CASE WHEN pr_stock = 0 THEN 1 ELSE 0 END) as agotados
                FROM rv_productos
                WHERE pr_estatus = 1";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->pdf->SetFont('helvetica', 'B', 12);
        $this->pdf->Cell(0, 8, 'Resumen General de Inventario', 0, 1, 'L');
        $this->pdf->Ln(2);
        
        // Tabla de resumen
        $this->pdf->SetFillColor(220, 53, 69);
        $this->pdf->SetTextColor(255, 255, 255);
        $this->pdf->SetFont('helvetica', 'B', 10);
        
        $w = array(95, 95);
        $this->pdf->Cell($w[0], 7, 'Concepto', 1, 0, 'C', true);
        $this->pdf->Cell($w[1], 7, 'Cantidad', 1, 1, 'C', true);
        
        $this->pdf->SetTextColor(0, 0, 0);
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->SetFillColor(240, 240, 240);
        
        $datos = array(
            array('Total de Productos Activos', $stats['total_productos']),
            array('Productos con Inventario', $stats['con_inventario']),
            array('Productos con Alerta', $stats['con_alerta']),
            array('Productos Agotados', $stats['agotados'])
        );
        
        $fill = false;
        foreach ($datos as $row) {
            $this->pdf->Cell($w[0], 6, $row[0], 1, 0, 'L', $fill);
            $this->pdf->Cell($w[1], 6, $row[1], 1, 1, 'R', $fill);
            $fill = !$fill;
        }
        
        $this->pdf->Ln(5);
        
        // Nota al pie
        $this->pdf->SetFont('helvetica', 'I', 8);
        $this->pdf->SetTextColor(100, 100, 100);
        $this->pdf->MultiCell(0, 4, 'Nota: Este reporte se genera automáticamente al cierre de caja. Se recomienda revisar y reabastecer los productos con alerta lo antes posible para evitar faltantes durante la operación.', 0, 'L');
    }
    
private function getColorAlerta($nivel)
{
    switch ($nivel) {
        case 'Agotado':
            return array(220, 53, 69); // Rojo
        case 'Crítico':
            return array(255, 152, 0); // Naranja
        case 'Bajo':
            return array(255, 235, 59); // Amarillo
        case 'Normal':
            return array(200, 230, 201); // Verde claro
        default:
            return array(255, 255, 255); // Blanco
    }
}
}
?>