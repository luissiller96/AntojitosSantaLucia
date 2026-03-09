<?php
require_once("../config/conexion.php");
require_once("../models/Reportes.php");
// No incluyas FPDF aquí si solo lo usas dentro de una condición
// require_once("../libs/fpdf186/fpdf.php"); 

$reporte = new Reportes();

// 🚀 Manejar todas las peticiones GET basadas en el parámetro 'op'
if (isset($_GET["op"])) {
  switch ($_GET["op"]) {
    case "generar_productos_pdf":
      require_once("../libs/fpdf186/fpdf.php");
      $productos = $reporte->getListaProductos();
      if (empty($productos)) {
        die(utf8_decode("📉 No hay productos para generar el reporte."));
      }
      $pdf = new FPDF();
      $pdf->AddPage();
      $pdf->SetFont("Arial", "B", 16);
      $pdf->Cell(190, 10, utf8_decode("Reporte de Productos y Stock"), 0, 1, "C");
      $pdf->Ln(5);
      $pdf->SetFont("Arial", "B", 10);
      $pdf->Cell(30, 10, "PLU", 1);
      $pdf->Cell(70, 10, utf8_decode("Nombre"), 1);
      $pdf->Cell(30, 10, "Precio", 1);
      $pdf->Cell(30, 10, "Stock", 1);
      $pdf->Cell(30, 10, "Estado", 1);
      $pdf->Ln();
      $pdf->SetFont("Arial", "", 10);
      foreach ($productos as $producto) {
        $pdf->Cell(30, 10, utf8_decode($producto["pr_PLU"]), 1);
        $pdf->Cell(70, 10, utf8_decode(substr($producto["pr_nombre"], 0, 30)), 1);
        $pdf->Cell(30, 10, "$" . number_format($producto["pr_precioventa"], 2), 1);
        $pdf->Cell(30, 10, utf8_decode($producto["pr_stock"] ?? "N/A"), 1);
        $pdf->Cell(30, 10, utf8_decode($producto["pr_estatus"] == 1 ? "Activo" : "Inactivo"), 1);
        $pdf->Ln();
      }
      $pdf->Output("I", "Reporte_Productos_Stock.pdf");
      break;

    case "productos_mas_vendidos":
      header('Content-Type: application/json');
      $datos = $reporte->getProductosMasVendidos();
      $json_response = json_encode($datos);
      if ($json_response === false) {
          echo json_encode(["error" => "Error al codificar los datos a JSON."]);
      } else {
          echo $json_response;
      }
      break;
    


    case "devoluciones":
      echo json_encode($reporte->getHistorialDevoluciones());
      break;

    case "ventas_semanales":
      echo json_encode($reporte->getVentasSemanales());
      break;


    // ✅ Nuevo caso para obtener el reporte de utilidades
    case "utilidades":
      header('Content-Type: application/json');
      $fechaInicio = $_GET['fechaInicio'] ?? date('Y-m-d');
      $fechaFin = $_GET['fechaFin'] ?? date('Y-m-d');
      $datos = $reporte->getUtilidadesPorFecha($fechaInicio, $fechaFin);
      $json_response = json_encode($datos);
      if ($json_response === false) {
          echo json_encode(["error" => "Error al codificar los datos de utilidades a JSON."]);
      } else {
          echo $json_response;
      }
      break;

    // ✅ Nuevo caso para obtener el reporte de compras
    case "compras":
      header('Content-Type: application/json');
      $fechaInicio = $_GET['fechaInicio'] ?? date('Y-m-d');
      $fechaFin = $_GET['fechaFin'] ?? date('Y-m-d');
      $datos = $reporte->getReporteCompras($fechaInicio, $fechaFin);
      $json_response = json_encode($datos);
      if ($json_response === false) {
          echo json_encode(["error" => "Error al codificar los datos de compras a JSON."]);
      } else {
          echo $json_response;
      }
      break;


    case "generar_pdf":
      require_once("../libs/fpdf186/fpdf.php");
      $fechaInicio = $_GET["fechaInicio"] ?? "";
      $fechaFin = $_GET["fechaFin"] ?? "";
      if (empty($fechaInicio) || empty($fechaFin)) {
        die("⚠️ Error: Debes proporcionar un rango de fechas.");
      }
      $ventas = $reporte->getVentasPorFechaPDF($fechaInicio, $fechaFin);
      if (empty($ventas)) {
        die("📉 No hay ventas en el rango de fechas seleccionado.");
      }
      $pdf = new FPDF();
      $pdf->AddPage();
      $pdf->SetFont("Arial", "B", 16);
      $pdf->Cell(190, 10, "Reporte de Ventas", 0, 1, "C");
      $pdf->SetFont("Arial", "B", 12);
      $pdf->Cell(95, 10, "Fecha de Inicio: $fechaInicio", 0, 0);
      $pdf->Cell(95, 10, "Fecha de Fin: $fechaFin", 0, 1);
      $pdf->Ln(5);
      $pdf->SetFont("Arial", "B", 10);
      $pdf->Cell(40, 10, "Fecha", 1);
      $pdf->Cell(20, 10, "Ticket", 1);
      $pdf->Cell(60, 10, "Producto", 1);
      $pdf->Cell(30, 10, "Vendedor", 1);
      $pdf->Cell(15, 10, "Cant.", 1);
      $pdf->Cell(25, 10, "Total", 1);
      $pdf->Ln();
      $pdf->SetFont("Arial", "", 10);
      foreach ($ventas as $venta) {
        $pdf->Cell(40, 10, $venta["fecha_formateada"], 1);
        $pdf->Cell(20, 10, $venta["ticket"], 1);
        $pdf->Cell(60, 10, substr($venta["producto"], 0, 28), 1);
        $pdf->Cell(30, 10, substr($venta["vendedor"], 0, 15), 1);
        $pdf->Cell(15, 10, $venta["cantidad"], 1);
        $pdf->Cell(25, 10, "$" . number_format($venta["total_vendido"], 2), 1);
        $pdf->Ln();
      }
      $pdf->Output("I", "Reporte_Ventas.pdf");
      break;

    case "cierre_caja":
      $fechaInicio = $_GET["fechaInicio"] ?? date('Y-m-d');
      $fechaFin = $_GET["fechaFin"] ?? date('Y-m-d');

      // Obtenemos los dos conjuntos de datos
      $resumen = $reporte->getResumenCaja($fechaInicio, $fechaFin);
      $detalle = $reporte->getCierreCaja($fechaInicio, $fechaFin);

      // Enviamos una sola respuesta con ambos resultados
      echo json_encode([
        "resumen" => $resumen,
        "detalle" => $detalle
      ]);
      break;

      // Dentro del switch en controller/reportes.php
case "get_ventas_agrupadas":
    $fechaInicio = $_GET['fechaInicio'] ?? date('Y-m-01');
    $fechaFin = $_GET['fechaFin'] ?? date('Y-m-d');
    $filtro = $_GET['filtro'] ?? 'todas';

    $reportes = new Reportes();
    $detalle_ventas = $reportes->getVentasAgrupadas($fechaInicio, $fechaFin, $filtro);

    // Calcular el total para la card
    $total_filtrado = array_sum(array_column($detalle_ventas, 'total_ticket'));

    header('Content-Type: application/json');
    echo json_encode([
        "detalle" => $detalle_ventas,
        "total_filtrado" => $total_filtrado
    ]);
    break;
    
  }
  exit(); // Detiene el script después de manejar la petición GET
}

// 🚀 Manejar peticiones POST para reportes JSON (gráficas)
$fechaInicio = trim($_POST["fechaInicio"] ?? "");
$fechaFin = trim($_POST["fechaFin"] ?? "");
$tipoReporte = trim($_POST["tipoReporte"] ?? "");

if (empty($fechaInicio) || empty($fechaFin) || empty($tipoReporte)) {
  echo json_encode(["error" => "⚠️ Debes seleccionar un tipo de reporte y un rango de fechas válido."]);
  exit();
}

$resultado = []; // Inicializamos la variable resultado

switch ($tipoReporte) {
  case 'ventas_ticket':
    // Este caso parece tener un formato de fecha distinto, asegúrate que el JS lo envíe como d/m/Y
    $fechaInicioDT = DateTime::createFromFormat('d/m/Y', $fechaInicio);
    $fechaFinDT = DateTime::createFromFormat('d/m/Y', $fechaFin);

    if (!$fechaInicioDT || !$fechaFinDT) {
      echo json_encode(["error" => "Formato de fecha inválido. Se esperaba d/m/Y."]);
      exit;
    }

    $datos = $reporte->ventas_ticket($fechaInicioDT->format('Y-m-d'), $fechaFinDT->format('Y-m-d'));
    if (!$datos) {
      echo json_encode(["error" => "No se encontraron datos para el rango de fechas."]);
      exit;
    }
    $resultado = $datos;
    break;

  case "ventas_fecha":
    $resultado = $reporte->getVentasPorDia($fechaInicio, $fechaFin);
    break;

  default:
    echo json_encode(["error" => "❌ Tipo de reporte inválido."]);
    exit();
}

if (empty($resultado)) {
  echo json_encode(["error" => "📉 No se encontraron datos para el rango de fechas seleccionado."]);
  exit();
}

header('Content-Type: application/json');
echo json_encode($resultado);