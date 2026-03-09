<?php
// /controller/imprimir_corte_preventivo.php

require_once("../config/conexion.php");
date_default_timezone_set('America/Mexico_City');

$monto = isset($_GET['monto']) ? floatval($_GET['monto']) : 1500;
$cajero = isset($_GET['cajero']) ? htmlspecialchars($_GET['cajero']) : 'No especificado';
$fecha = date("d/m/Y H:i:s");
$monto_formateado = number_format($monto, 2);

$html = <<<HTML
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'>
  <title>Corte Preventivo</title>
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
    .total-final { font-size: 30px; font-weight: bold; margin-top: 20px; margin-bottom: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="center">
    <h2>Antojitos Santa Lucía</h2>
    <h1>CORTE PREVENTIVO</h1>
  </div>

  <div class='info' style="margin-top: 15px;">
    <p>Fecha: {$fecha}</p>
    <p>Usuario: {$cajero}</p>
  </div>
  
  <hr class='sep'>
  
  <div class="center" style="margin-top: 15px;">
    <p>Motivo:</p>
    <p style="font-size: 20px;">RETIRO DE EFECTIVO PARA RESGUARDO</p>
  </div>
  
  <hr class='sep' style="margin-top: 15px;">

  <div class="total-final">
    MONTO: \${$monto_formateado}
  </div>

  <div class="center" style="margin-top: 30px; margin-bottom: 30px;">
    <p>_______________________</p>
    <p>Firma de Recibido</p>
  </div>
</body>
</html>
HTML;

echo $html;
?>
