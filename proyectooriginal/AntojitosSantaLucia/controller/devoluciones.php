<?php

session_start(); // <-- AÑADE ESTA LÍNEA

require_once("../config/conexion.php");
require_once("../models/Devoluciones.php");
require_once("../models/Usuario.php"); // Asegúrate de que este modelo esté incluido


$devoluciones = new Devoluciones();

header('Content-Type: application/json');

switch ($_GET["op"]) {
  case "buscar_ticket":
        // Verificamos que el ticket_id fue enviado.
        if (isset($_POST["ticket_id"])) {
            $datos = $devoluciones->get_venta_by_ticket($_POST["ticket_id"]);
            if (!empty($datos)) {
                // Si se encontraron datos, se envían en la respuesta.
                echo json_encode([
                    "status" => "success",
                    "data" => $datos
                ]);
            } else {
                // Si no, se envía un mensaje de error.
                echo json_encode([
                    "status" => "error",
                    "message" => "No se encontró un ticket activo con ese número o ya fue cancelado."
                ]);
            }
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "No se proporcionó un número de ticket."
            ]);
        }
        break;
        
 case "procesar_devolucion":
    // 1. Verificar que lleguen todos los datos necesarios, incluyendo el token
    if (!isset($_POST['ticket_id'], $_POST['motivo'], $_POST['token'])) {
      echo json_encode(["status" => "error", "message" => "Faltan datos para procesar la devolución."]);
      exit();
    }
    
    $ticket_id = $_POST['ticket_id'];
    $motivo = $_POST['motivo'];
    $token_ingresado = $_POST['token'];
    $usu_id_devolucion = $_SESSION['usu_id'];

    // 2. VALIDACIÓN DEL TOKEN
    $esValido = $devoluciones->verificarTokenGlobal($token_ingresado);

    // Si el token NO es válido, detener todo
    if (!$esValido) {
      echo json_encode(["status" => "error", "message" => "Token de autorización inválido o incorrecto."]);
      exit();
    }

    // 3. SI EL TOKEN ES VÁLIDO, proceder con la devolución
    $actualizado = $devoluciones->cancelar_venta($ticket_id);

    if ($actualizado) {
      // Guardar el registro de la devolución en la tabla
      $devoluciones->registrar_devolucion($ticket_id, $motivo, $usu_id_devolucion);
      echo json_encode(["status" => "success", "message" => "Devolución procesada correctamente."]);
    } else {
      echo json_encode(["status" => "error", "message" => "No se pudo actualizar el estado de la venta."]);
    }
    break;



  default:
    echo json_encode(["status" => "error", "message" => "Operación no válida."]);
    break;
}