<?php
require_once("../config/conexion.php");
require_once("../models/Reportes.php");
require_once("../libs/fpdf186/fpdf.php");

$reporte = new Reportes();
$fechaInicio = $_GET["fechaInicio"] ?? "";
$fechaFin = $_GET["fechaFin"] ?? "";

if (empty($fechaInicio) || empty($fechaFin)) {
    die("⚠️ Error: Debes proporcionar un rango de fechas.");
}

// 🔹 Obtener los datos de ventas
$ventas = $reporte->getVentasPorFechaPDF($fechaInicio, $fechaFin);

// ⚠️ Si no hay ventas, detener la ejecución
if (empty($ventas)) {
    die("📉 No hay ventas en el rango de fechas seleccionado.");
}

// 🔹 Iniciar el PDF
$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont("Arial", "B", 16);
$pdf->Cell(190, 10, "Reporte de Ventas", 0, 1, "C");

$pdf->SetFont("Arial", "B", 12);
$pdf->Cell(95, 10, "Fecha de Inicio: $fechaInicio", 0, 0);
$pdf->Cell(95, 10, "Fecha de Fin: $fechaFin", 0, 1);
$pdf->Ln(5);

// Encabezados de la tabla
$pdf->SetFont("Arial", "B", 10);
$pdf->Cell(40, 10, "Fecha", 1);
$pdf->Cell(20, 10, "Ticket", 1);
$pdf->Cell(80, 10, "Producto", 1);
$pdf->Cell(20, 10, "Cantidad", 1);
$pdf->Cell(30, 10, "Total", 1);
$pdf->Ln();

// 🔹 Datos de ventas (Manejar valores nulos)
$pdf->SetFont("Arial", "", 10);
foreach ($ventas as $venta) {
    $pdf->Cell(40, 10, isset($venta["fecha"]) ? $venta["fecha"] : "N/A", 1); // Se amplía la celda de fecha
    $pdf->Cell(20, 10, isset($venta["ticket"]) ? $venta["ticket"] : "N/A", 1); // Se reduce la celda de ticket
    $pdf->Cell(80, 10, isset($venta["producto"]) ? substr($venta["producto"], 0, 35) : "N/A", 1);
    $pdf->Cell(20, 10, isset($venta["cantidad"]) ? $venta["cantidad"] : "N/A", 1);
    $pdf->Cell(30, 10, isset($venta["total_vendido"]) ? "$" . number_format($venta["total_vendido"], 2) : "N/A", 1);
    $pdf->Ln();
}

// 🔹 Descargar el PDF
header("Content-Type: application/pdf");
header("Content-Disposition: inline; filename=Reporte_Ventas.pdf");
$pdf->Output("I", "Reporte_Ventas.pdf");
exit();
