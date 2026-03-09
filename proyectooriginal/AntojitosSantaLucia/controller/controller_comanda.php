<?php
// --- CONFIGURACIÓN INICIAL ---
// Es CRÍTICO que este archivo devuelva únicamente JSON. No debe haber espacios, echos o HTML antes o después.
header('Content-Type: application/json');
date_default_timezone_set('America/Mexico_City');

require_once("../models/Comanda.php");

$comanda = new Comanda();

// Obtenemos la operación a realizar (ej: 'listar_activas', 'actualizar_estatus_item', etc.)
$op = $_REQUEST["op"] ?? '';

switch ($op) {
    
// controller/controller_comanda.php

// ... (inicio del archivo y otros casos)

    case "listar_activas":
        $datos_crudos = $comanda->get_comandas_activas();
        
        $tickets_agrupados = [];

        // 1. Recorremos los datos de la base de datos ítem por ítem.
        foreach ($datos_crudos as $item) {
            $ticket_id = $item['ticket_id'];

            // 2. Si es la primera vez que vemos este ticket, creamos su "contenedor".
            if (!isset($tickets_agrupados[$ticket_id])) {
                $tickets_agrupados[$ticket_id] = [
                    'ticket_id' => $ticket_id,
                      'cliente' => $item['cliente'],
                    'com_estatus' => $item['com_estatus'], // El estatus del ticket es el de su primer ítem.
                    'com_fecha' => $item['com_fecha'],
                    'items' => [] // Un array para guardar todos sus productos.
                ];
            }

            // 3. Añadimos el producto actual al array 'items' de su ticket.
            $tickets_agrupados[$ticket_id]['items'][] = $item;
        }

        // 4. Devolvemos el array agrupado.
        echo json_encode(array_values($tickets_agrupados)); // Usamos array_values para que JS lo reciba como un array.
        break;


    // --- CASO PARA ACTUALIZAR ESTATUS (llamado por el botón 'Avanzar') ---
    case "actualizar_estatus_item":
        $com_id = $_POST["com_id"] ?? null;
        $estatus = $_POST["estatus"] ?? null; 

        if ($com_id && $estatus) {
            $resultado = $comanda->update_comanda_status(intval($com_id), $estatus);
            
            if ($resultado) {
                // ✅ AGREGAR ESTA LÍNEA: Actualizar timestamp para notificar al display
                $comanda->update_comanda_update_timestamp();
                
                // Si la actualización es exitosa, se manda una respuesta positiva.
                echo json_encode(["status" => "success", "message" => "Estatus actualizado."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error al actualizar estatus."]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
        }
        break;

    // --- OTROS CASOS QUE YA TENÍAS (funcionan perfecto) ---
    case "obtener_detalles":
        $com_id = $_POST["com_id"] ?? null; 
        if ($com_id) {
            $datos = $comanda->get_comanda_por_id(intval($com_id));
            echo json_encode(["status" => "success", "data" => $datos]);
        } else {
             echo json_encode(["status" => "error", "message" => "ID no proporcionado."]);
        }
        break;

    case "actualizar_estatus_ticket":
        $ticket_id = $_POST["ticket_id"] ?? null;
        $estatus = $_POST["estatus"] ?? null; 
        
        if ($ticket_id && $estatus) {
            $resultado = $comanda->update_comandas_ticket_status(intval($ticket_id), $estatus);
            
            if ($resultado) {
                // ✅ AGREGAR ESTA LÍNEA: Actualizar timestamp para notificar al display
                $comanda->update_comanda_update_timestamp();
                
                echo json_encode(["status" => "success", "message" => "Estatus del ticket actualizado."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Error al actualizar estatus del ticket."]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Datos de ticket incompletos."]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Operación no válida."]);
        break;
}
?>