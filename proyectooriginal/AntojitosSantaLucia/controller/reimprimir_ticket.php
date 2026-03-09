<?php
// /controller/reimprimir_ticket.php

// 1. INCLUIR DEPENDENCIAS
require_once("../config/conexion.php");
require_once("../models/Reportes.php");

// 2. DEFINICIÓN DE LA CLASE EscPos (CORREGIDA)
class TicketHTML
{
    public function generateTicket($ventaData)
    {
        $ticket_id     = htmlspecialchars($ventaData['ticket_id']);
        // Usar la fecha de la venta original, no la actual
        $fecha         = date("d/m/Y H:i:s", strtotime($ventaData['fecha']));
        $vendedor      = htmlspecialchars($ventaData['vendedor_nombre']);
        $cliente       = !empty($ventaData['cliente']) ? htmlspecialchars($ventaData['cliente']) : 'Público General';
        // En reportes, $ventaData puede no traer tipo_pago pero intentemos usarlo, sino omitir o poner NA
        $tipo_pago     = isset($ventaData['tipo_pago']) ? ucfirst($ventaData['tipo_pago']) : 'N/A';
        $total         = number_format($ventaData['total_ticket'], 2);

        $filas = '';

        // Separar ítems mixta de normales
        $itemsNormales = [];
        $itemsMixta    = [];
        foreach ($ventaData['productos'] as $item) {
            if (strpos($item['nombre'], '(Mixta)') !== false) {
                $itemsMixta[] = $item;
            } else {
                $itemsNormales[] = $item;
            }
        }

        // Renderizar ítems normales primero
        foreach ($itemsNormales as $item) {
            $nombre      = htmlspecialchars($item['nombre']);
            $cantidad    = intval($item['cantidad']);
            $precioFila  = number_format($item['total'], 2);

            $filas .= "
                <tr>
                    <td style='vertical-align:top;width:15%;'>{$cantidad}x</td>
                    <td style='vertical-align:top;width:55%;word-break:break-word;'>{$nombre}</td>
                    <td style='vertical-align:top;text-align:right;width:30%;'>\${$precioFila}</td>
                </tr>";
        }

        // Renderizar ítems mixta agrupados bajo una cabecera "Mixta"
        if (!empty($itemsMixta)) {
            $filas .= "
                <tr>
                    <td colspan='3' style='padding-top:6px;padding-bottom:2px;font-weight:bold;'>Mixta</td>
                </tr>";
            foreach ($itemsMixta as $item) {
                $subNombre  = htmlspecialchars(str_replace(' (Mixta)', '', $item['nombre']));
                $subCantidad = intval($item['cantidad']);
                $subPrecio   = number_format($item['total'], 2);

                $filas .= "
                <tr>
                    <td style='vertical-align:top;width:15%;padding-left:8px;'>{$subCantidad}x</td>
                    <td style='vertical-align:top;width:55%;word-break:break-word;'>{$subNombre}</td>
                    <td style='vertical-align:top;text-align:right;width:30%;'>\${$subPrecio}</td>
                </tr>";
            }
        }

        $html = <<<HTML
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'>
  <title>Ticket #{$ticket_id}</title>
  <style>
    @page { margin: 0; size: 80mm auto; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 17px;
      font-weight: bold;
      width: 80mm;
      padding: 10px;
      color: #000;
      line-height: 1.3;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .left { text-align: left; }
    h1 { font-size: 26px; margin-bottom: 2px; }
    h2 { font-size: 22px; margin-bottom: 10px; }
    .sep { border: none; border-top: 2px dashed #000; margin: 8px 0; }
    .info p { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 0; }
    th { font-size: 17px; font-weight: bold; padding: 4px 0; }
    td { font-size: 17px; padding: 4px 0; vertical-align: top; }
    .totales-container { margin-top: 8px; font-size: 17px; text-align: right; }
    .totales-container p { margin-bottom: 4px; }
    .total-final { font-size: 30px; font-weight: bold; margin-top: 15px; margin-bottom: 15px; text-align: center; }
  </style>
</head>
<body>
  <div class="center">
    <h1>Ticket #{$ticket_id}</h1>
    <h2>Antojitos Santa Lucía</h2>
  </div>

  <div class='info'>
    <p>Fecha: {$fecha}</p>
    <p>Vendedor: {$vendedor}</p>
    <p>Cliente: {$cliente}</p>
    <p>** REIMPRESION **</p>
  </div>
  
  <hr class='sep'>
  
  <table>
    <thead>
      <tr>
        <th class="left" style='width:15%;'>Cant</th>
        <th class="left" style='width:55%;'>Producto</th>
        <th class="right" style='width:30%;'>Total</th>
      </tr>
    </thead>
  </table>
  
  <hr class='sep' style='margin-top: 0;'>
  
  <table>
    <tbody>{$filas}</tbody>
  </table>
  
  <hr class='sep'>
  
  <div class='total-final'>
    TOTAL: \${$total}
  </div>
  
  <div class="center" style="font-size: 15px; margin-top: 20px;">
    <p>¡Gracias por su preferencia!</p>
  </div>
</body>
</html>
HTML;

        return $html;
    }
}

// 3. LÓGICA DEL SCRIPT
header('Content-Type: application/json');

if (!isset($_POST['ticket_id'])) {
    echo json_encode(['success' => false, 'error' => 'No se proporcionó un ID de ticket.']);
    exit;
}

$ticketId = $_POST['ticket_id'];

try {
    $reportesModel = new Reportes();
    // Reutilizando el método que ya extrae la data del ticket
    $ventaData = $reportesModel->getVentaParaTicket($ticketId);

    if (!$ventaData || empty($ventaData['productos'])) {
        echo json_encode(['success' => false, 'error' => 'No se encontraron datos para el ticket ' . $ticketId]);
        exit;
    }

    $ticketHtmlGen = new TicketHTML();
    $htmlTicket = $ticketHtmlGen->generateTicket($ventaData);

    // Devolvemos el HTML en print_html para reutilizar la lógica del JS frontal
    echo json_encode(['success' => true, 'print_html' => $htmlTicket]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>