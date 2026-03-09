<?php
require_once("../config/conexion.php");
require_once("../models/Ventas.php");
require_once("../models/Caja.php");
require_once("../models/Comanda.php");
require_once("../models/Usuario.php");

$ventas = new Ventas();
$caja = new Caja();
$comanda_model = new Comanda();

class TicketHTML
{
    public function generateTicket($ventaData)
    {
        $ticket_id     = htmlspecialchars($ventaData['ticket_id']);
        $fecha         = date("d/m/Y H:i:s");
        $vendedor      = htmlspecialchars($ventaData['vendedor_nombre']);
        $cliente       = !empty($ventaData['cliente']) ? htmlspecialchars($ventaData['cliente']) : 'Público General';
        $tipo_pago     = ucfirst($ventaData['tipo_pago']);
        $total         = number_format($ventaData['total'], 2);

        $filas = '';

        // --- LÓGICA DE AGRUPACIÓN PARA ORDEN MIXTA ---
        // Separar ítems mixta (tienen grupo_mixta) de ítems normales
        // y preservar el orden en que aparecen en el arreglo
        $gruposRenderizados = [];
        foreach ($ventaData['productos'] as $item) {
            $grupoMixta = $item['grupo_mixta'] ?? null;

            if ($grupoMixta) {
                // Si este grupo ya se renderizó, skip (ya lo procesamos completo abajo)
                if (in_array($grupoMixta, $gruposRenderizados)) {
                    continue;
                }
                $gruposRenderizados[] = $grupoMixta;

                // Renderizar cabecera "Mixta"
                $filas .= "
                <tr>
                    <td colspan='3' style='padding-top:6px;padding-bottom:2px;font-weight:bold;'>Mixta</td>
                </tr>";

                // Renderizar todos los sub-ítems de este grupo
                foreach ($ventaData['productos'] as $subItem) {
                    if (($subItem['grupo_mixta'] ?? null) !== $grupoMixta) continue;
                    $subNombre = htmlspecialchars(str_replace(' (Mixta)', '', $subItem['nombre']));
                    $subCantidad = intval($subItem['cantidad']);
                    $subPrecio   = number_format($subItem['precio'] * $subItem['cantidad'], 2);
                    $filas .= "
                <tr>
                    <td style='vertical-align:top;width:15%;padding-left:8px;'>{$subCantidad}x</td>
                    <td style='vertical-align:top;width:55%;word-break:break-word;'>{$subNombre}</td>
                    <td style='vertical-align:top;text-align:right;width:30%;'>\${$subPrecio}</td>
                </tr>";
                    if (!empty($subItem['observaciones'])) {
                        $obs = htmlspecialchars($subItem['observaciones']);
                        $filas .= "<tr><td></td><td colspan='2' style='font-size:14px;'>  Obs: {$obs}</td></tr>";
                    }
                    if (!empty($subItem['opciones'])) {
                        $opciones = is_array($subItem['opciones']) ? implode(', ', $subItem['opciones']) : $subItem['opciones'];
                        if (trim($opciones) !== '') {
                            $op = htmlspecialchars($opciones);
                            $filas .= "<tr><td></td><td colspan='2' style='font-size:14px;'>  Sin: {$op}</td></tr>";
                        }
                    }
                }
            } else {
                // Ítem normal (no es mixta)
                $nombre   = htmlspecialchars($item['nombre']);
                $cantidad = intval($item['cantidad']);
                $precio   = number_format($item['precio'] * $item['cantidad'], 2);

                $filas .= "
                <tr>
                    <td style='vertical-align:top;width:15%;'>{$cantidad}x</td>
                    <td style='vertical-align:top;width:55%;word-break:break-word;'>{$nombre}</td>
                    <td style='vertical-align:top;text-align:right;width:30%;'>\${$precio}</td>
                </tr>";

                if (!empty($item['observaciones'])) {
                    $obs = htmlspecialchars($item['observaciones']);
                    $filas .= "<tr><td></td><td colspan='2' style='font-size:14px;'>  Obs: {$obs}</td></tr>";
                }
                if (!empty($item['opciones'])) {
                    $opciones = is_array($item['opciones']) ? implode(', ', $item['opciones']) : $item['opciones'];
                    if (trim($opciones) !== '') {
                        $op = htmlspecialchars($opciones);
                        $filas .= "<tr><td></td><td colspan='2' style='font-size:14px;'>  Sin: {$op}</td></tr>";
                    }
                }
            }
        }

        $filasTotales = '';
        if (strtolower($ventaData['tipo_pago']) === 'efectivo' && isset($ventaData['pago'])) {
            $pago   = number_format($ventaData['pago'], 2);
            $cambio = number_format($ventaData['cambio'], 2);
            $filasTotales = "
                <p>Recibo: <span style='display:inline-block;width:70px;text-align:right;'>\${$pago}</span></p>
                <p>Cambio: <span style='display:inline-block;width:70px;text-align:right;'>\${$cambio}</span></p>";
        } else {
             $filasTotales = "
                <p>Recibo: <span style='display:inline-block;width:70px;text-align:right;'>\${$total}</span></p>";
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
    <p>Metodo Pago: {$tipo_pago}</p>
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
  
  <div class='totales-container'>
    {$filasTotales}
  </div>
  
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

switch ($_GET["op"]) {

   case "registrar_venta":
    header('Content-Type: application/json');

    $json = file_get_contents("php://input");
    $datos_originales = json_decode($json, true);

    error_log("Datos recibidos: " . print_r($datos_originales, true));

    if (!isset($datos_originales["productos"]) || 
        !isset($datos_originales["total"]) || 
        !isset($datos_originales["tipo_pago"]) || 
        !isset($datos_originales["vendedor"])) {
        
        error_log("Datos incompletos. Recibido: " . json_encode($datos_originales));
        echo json_encode([
            "status" => "error", 
            "message" => "Datos incompletos",
            "received" => array_keys($datos_originales)
        ]);
        exit();
    }

    $cliente = $datos_originales["cliente"] ?? '';
    $productos_para_bd = $datos_originales["productos"];
    $total_para_bd = floatval($datos_originales["total"]);
    $tipo_pago = $datos_originales["tipo_pago"];
    $vendedor_id = intval($datos_originales["vendedor"]);
    $plataforma_origen = $datos_originales["plataforma_origen"] ?? null;
    $pago_recibido = floatval($datos_originales["pago"] ?? 0);
    $cambio_entregado = floatval($datos_originales["cambio"] ?? 0);

    $datos_para_imprimir = $datos_originales;
    $datos_para_imprimir['total'] = $total_para_bd;
    $datos_para_imprimir['pago'] = $pago_recibido;
    $datos_para_imprimir['cambio'] = $cambio_entregado;
    $datos_para_imprimir['tipo_pago'] = $tipo_pago;

    $conectar_db = $ventas->obtenerConexionParaTransaccion();
    $conectar_db->beginTransaction();

    try {
        $stmt_ticket = $conectar_db->prepare("SELECT MAX(ticket) AS ultimo_ticket FROM rv_ventas");
        $stmt_ticket->execute();
        $row_ticket = $stmt_ticket->fetch(PDO::FETCH_ASSOC);
        $ticket_actual = $row_ticket["ultimo_ticket"] ? $row_ticket["ultimo_ticket"] + 1 : 1;
        $datos_para_imprimir['ticket_id'] = $ticket_actual;
        $fecha_actual = date("Y-m-d H:i:s");
        $productos_para_comanda = [];

foreach ($productos_para_bd as $producto) {
    $producto_id = intval($producto["id"]);
    $cantidad_vendida = intval($producto["cantidad"]);

    if ($producto_id > 0) {
        $detalles = $ventas->getProductoDetalles($producto_id);
        if (!$detalles) {
            throw new Exception("Producto no encontrado: " . $producto["nombre"]);
        }

        // ✅ 1. Descontar componentes de productos (paquetes/órdenes)
        $ventas->descontarComponentesProducto($producto_id, $cantidad_vendida);

        // ✅ 2. Descontar insumos vinculados (si tiene)
        $ventas->descontarInsumosVinculados($producto_id, $cantidad_vendida, $ticket_actual);

        // 3. Si es platillo, agregar a comanda
        if ($detalles["es_platillo"] == 1) {
            $productos_para_comanda[] = $producto;
        } else {
            // 4. Si es producto con stock, descontar
            if ($detalles["pr_stock"] !== null) {
                if ($detalles["pr_stock"] < $cantidad_vendida) {
                    throw new Exception("No hay suficiente stock para: " . $producto["nombre"]);
                }
                $caja->actualizarStock($producto_id, $cantidad_vendida);
            }
        }
    }

    $ventas->registrar_venta_producto($conectar_db, $producto, $ticket_actual, $fecha_actual, $vendedor_id, $tipo_pago, $total_para_bd, $cliente, $plataforma_origen);
}

// Insertar en comanda solo platillos
foreach ($productos_para_comanda as $producto_comanda) {
    $ingredientes_omitir = null;
    if (isset($producto_comanda["opciones"]) && !empty($producto_comanda["opciones"])) {
        $ingredientes_omitir = is_array($producto_comanda["opciones"])
            ? implode(", ", array_filter($producto_comanda["opciones"]))
            : $producto_comanda["opciones"];
    }

    $comentarios = isset($producto_comanda["observaciones"]) && trim($producto_comanda["observaciones"]) !== ""
        ? $producto_comanda["observaciones"]
        : null;

    $ventas->insertar_comanda(
        $ticket_actual,
        $producto_comanda["cantidad"],
        $producto_comanda["id"],
        $producto_comanda["nombre"],
        $ingredientes_omitir,
        $comentarios
    );
}

        $comanda_model->update_comanda_update_timestamp();
        $usuario_model = new Usuario();
        $vendedor_info = $usuario_model->getEmpleadoById($vendedor_id);
        $datos_para_imprimir['vendedor_nombre'] = $vendedor_info ? $vendedor_info['emp_nombre'] : 'N/A';

        $ticket_generator = new TicketHTML();
        $ticket_html = $ticket_generator->generateTicket($datos_para_imprimir);

        $conectar_db->commit();

        echo json_encode([
            "status" => "success",
            "message" => "Venta registrada correctamente.",
            "ticket_id" => $ticket_actual,
            "print_html" => $ticket_html
        ]);

    } catch (Exception $e) {
        $conectar_db->rollBack();
        error_log("Error al registrar venta: " . $e->getMessage());
        echo json_encode([
            "status" => "error", 
            "message" => "Error al registrar la venta: " . $e->getMessage()
        ]);
    }
    break;
    
    default:
        echo json_encode(["status" => "error", "message" => "Operación no válida."]);
        break;
}
?>
