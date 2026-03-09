  <?php
  require_once("../config/conexion.php");
  require_once("../models/Ventas.php");
  require_once("../models/Caja.php");
  require_once("../models/Comanda.php");
  require_once("../models/Usuario.php"); // <-- AÑADIDO: Para obtener el nombre del vendedor


  $ventas = new Ventas();
  $caja = new Caja();
  $comanda_model = new Comanda();

  // --- INICIO: Clase para generar tickets (ESC/POS) ---
  class EscPos
  {
    // Comandos básicos de la impresora
    const ESC = "\x1b"; // ASCII: Escape
    const GS = "\x1d";  // ASCII: Group separator
    const LF = "\x0a";  // ASCII: Line feed

    protected $buffer;

    function __construct()
    {
      $this->buffer = "";
    }

    // Inicializa la impresora
    private function initialize()
    {
      $this->buffer .= self::ESC . "@";
    }

    // Añade texto al buffer
    private function text($text)
    {
      $this->buffer .= $text;
    }

    // Salto de línea
    private function feed($lines = 1)
    {
      $this->buffer .= str_repeat(self::LF, $lines);
    }

    // Cortar papel (si la impresora lo soporta)
    private function cut()
    {
      $this->buffer .= self::GS . "V" . chr(1);
    }

    // Alineación (0: Izq, 1: Centro, 2: Der)
    private function setJustification($justification)
    {
      $this->buffer .= self::ESC . "a" . chr($justification);
    }

    // Negrita (true: on, false: off)
    private function setEmphasis($isBold)
    {
      $this->buffer .= self::ESC . "E" . ($isBold ? chr(1) : chr(0));
    }

    // Doble altura y ancho (true: on, false: off)
    private function setDoubleSize($isDouble)
    {
      $size = $isDouble ? 0x11 : 0x00; // Ancho x2, Alto x2
      $this->buffer .= self::GS . '!' . chr($size);
    }

    // Genera el ticket con los datos de la venta
    public function generateTicket($ventaData)
    {
      $this->initialize();

      // Encabezado
      $this->setJustification(1); // Centrado
      $this->setDoubleSize(true);
      $this->setEmphasis(true);
      $this->text("Orden #" . $ventaData['ticket_id'] . "\n");
      $this->setEmphasis(false); // Letra normal para el nombre
      $this->text("Marcel's\n");
      $this->setDoubleSize(false);
      $this->feed(1);


      // Datos de la venta
      $this->setJustification(0); // Izquierda
      $this->text("Fecha: " . date("d/m/Y H:i:s") . "\n");
      $this->text("Vendedor: " . $ventaData['vendedor_nombre'] . "\n");
      $this->text("Cliente: " . (!empty($ventaData['cliente']) ? $ventaData['cliente'] : 'Publico General') . "\n");
      $this->text(str_repeat('-', 32) . "\n");

      // Productos
      $this->text("Cant  Producto          Total\n");
      $this->text(str_repeat('-', 32) . "\n");
      foreach ($ventaData['productos'] as $item) {
        $cantidad = str_pad($item['cantidad'] . 'x', 4);
        $nombre = substr($item['nombre'], 0, 16);
        $nombre = str_pad($nombre, 18);
        $totalItem = '$' . number_format($item['precio'] * $item['cantidad'], 2);
        $totalItem = str_pad($totalItem, 8, ' ', STR_PAD_LEFT);
        $this->text($cantidad . $nombre . $totalItem . "\n");
        if (!empty($item['observaciones'])) {
          $this->text("  Obs: " . $item['observaciones'] . "\n");
        }
      }
      $this->text(str_repeat('-', 32) . "\n");
      $this->feed(1);

      // Total (Se eliminó la línea "Orden #" duplicada)
      $this->setJustification(2);
      $this->setDoubleSize(true);
      $this->setEmphasis(true);
      $this->text("TOTAL: $" . number_format($ventaData['total'], 2) . "\n");
      $this->setEmphasis(false);
      $this->setDoubleSize(false);
      $this->feed(3);

      $this->cut(); // Corta el primer ticket
      $this->buffer .= $this->buffer;

      return $this->buffer; // Devuelve el contenido de ambos tickets juntos
    }

    // Método para obtener el buffer codificado para el URL
    public function getBase64Encoded()
    {
      return base64_encode($this->buffer);
    }
  }
  // --- FIN: Clase para generar tickets ---



  switch ($_GET["op"]) {

    case "registrar_venta":
      // Inicia la respuesta como JSON
      header('Content-Type: application/json');

      $json = file_get_contents("php://input");
      $datos_originales = json_decode($json, true);

      if (!isset($datos_originales["productos"], $datos_originales["total"], $datos_originales["tipo_pago"], $datos_originales["vendedor"])) {
        echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
        exit();
      }

      $cliente = $datos_originales["cliente"] ?? '';
      $productos_para_bd = $datos_originales["productos"];
      $total_para_bd = $datos_originales["total"];
      $tipo_pago = $datos_originales["tipo_pago"];
      $vendedor_id = $datos_originales["vendedor"];

      $datos_para_imprimir = $datos_originales;

      if ($tipo_pago === 'tarjeta') {
        $comision = $datos_originales["total"] * 0.05;
        $cargo_servicio = ['id' => null, 'nombre' => 'Cargo por servicio tarjeta', 'precio' => $comision, 'cantidad' => 1, 'opciones' => [], 'observaciones' => ''];
        $productos_para_bd[] = $cargo_servicio;
        $total_para_bd += $comision;
        $datos_para_imprimir['total'] = $total_para_bd;
      }

      $conectar_db = $ventas->obtenerConexionParaTransaccion();
      $conectar_db->beginTransaction();

      try {
        $stmt_ticket = $conectar_db->prepare("SELECT MAX(ticket) AS ultimo_ticket FROM rv_ventas");
        $stmt_ticket->execute();
        $row_ticket = $stmt_ticket->fetch(PDO::FETCH_ASSOC);
        $ticket_actual = $row_ticket["ultimo_ticket"] ? $row_ticket["ultimo_ticket"] + 1 : 1;

        $datos_para_imprimir['ticket_id'] = $ticket_actual;
        date_default_timezone_set('America/Mexico_City');
        $fecha_actual = date("Y-m-d H:i:s");

        $productos_para_comanda = []; // Se inicializa el array para la comanda

        foreach ($productos_para_bd as $producto) {
          $pr_PLU = $producto["id"];

          if ($pr_PLU !== null) {
            $stockActual = $caja->getStockProducto($pr_PLU);
            if ($stockActual !== null) {
              if ($stockActual < $producto["cantidad"]) {
                throw new Exception("No hay suficiente stock para: " . $producto["nombre"]);
              }
              $caja->actualizarStock($pr_PLU, $producto["cantidad"]);
            } else {
              $productos_para_comanda[] = $producto; // Se añade a la lista de comanda si no tiene stock
            }

            $insumos = $ventas->getInsumosPorProducto($pr_PLU);
            if (!empty($insumos)) {
              foreach ($insumos as $insumo) {
                $ventas->descontarInsumo($insumo["insumo_id"], $insumo["cantidad_usada"] * $producto["cantidad"]);
              }
            }
          }

          $ventas->registrar_venta_producto($conectar_db, $producto, $ticket_actual, $fecha_actual, $vendedor_id, $tipo_pago, $total_para_bd, $cliente);
        }

        // --- ✅ INICIO: BLOQUE DE COMANDA RESTAURADO ---
        // Se recorre la lista que llenamos antes y se inserta en la comanda
        foreach ($productos_para_comanda as $producto_comanda) {
          $ingredientes_omitir = null;
          if (!empty($producto_comanda["opciones"])) {
            $ingredientes_omitir = is_array($producto_comanda["opciones"])
              ? implode(", ", array_filter($producto_comanda["opciones"]))
              : $producto_comanda["opciones"];
          }

          $comentarios = isset($producto_comanda["observaciones"]) && trim($producto_comanda["observaciones"]) !== ''
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
        // --- ✅ FIN: BLOQUE DE COMANDA RESTAURADO ---

        $comanda_model->update_comanda_update_timestamp();

        $usuario_model = new Usuario();
        $vendedor_info = $usuario_model->getEmpleadoById($vendedor_id);
        $datos_para_imprimir['vendedor_nombre'] = $vendedor_info ? $vendedor_info['emp_nombre'] : 'N/A';

        $ticket_generator = new EscPos();
        $ticket_string = $ticket_generator->generateTicket($datos_para_imprimir);
        $base64_ticket = base64_encode($ticket_string);

        $conectar_db->commit();

        echo json_encode([
          "status" => "success",
          "message" => "Venta registrada correctamente.",
          "ticket_id" => $ticket_actual,
          "print_data" => $base64_ticket
        ]);
      } catch (Exception $e) {
        $conectar_db->rollBack();
        error_log("❌ Error al registrar venta: " . $e->getMessage());
        echo json_encode(["status" => "error", "message" => "Error al registrar la venta: " . $e->getMessage()]);
      }
      break;

    default:
      echo json_encode(["status" => "error", "message" => "Operación no válida."]);
      break;
  }
