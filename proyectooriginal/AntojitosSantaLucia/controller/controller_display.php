<?php
date_default_timezone_set('America/Mexico_City');
require_once("../config/conexion.php");
require_once("../models/Comanda.php"); // Usaremos el modelo Comanda para obtener los datos

$comanda = new Comanda(); // Instancia del modelo Comanda

switch ($_GET["op"]) {
    case "listar_para_cliente":
        $datos = $comanda->get_comandas_para_cliente(); // Estos datos ya vienen filtrados por 10 min y estado
        
        // Mapeo de estados internos a estados amigables para el cliente y sus emojis
        $customer_status_map = [
            'en_preparacion' => ['text' => 'Preparando tu pedido', 'emoji' => '🧑‍🍳'],
            'lista' => ['text' => '¡Listo para Recoger!', 'emoji' => '✅'],
        ];

        $tickets_final_display = [];
        $temp_tickets_grouped = []; // Usaremos esto para agrupar y determinar el estado final del ticket

        foreach ($datos as $row) {
            $ticket_id = $row['ticket_id'];
            $estatus_interno = $row['com_estatus'];

            // Inicializar el ticket en el array temporal si no existe
            if (!isset($temp_tickets_grouped[$ticket_id])) {
                $temp_tickets_grouped[$ticket_id] = [
                    'ticket_id' => $ticket_id,
                    'has_en_preparacion' => false, // Bandera si hay algún ítem en preparación
                    'has_lista' => false,         // Bandera si hay algún ítem lista
                    'total_items' => 0            // Conteo de ítems para ese ticket
                ];
            }

            // Actualizar banderas y conteo para este ticket
            $temp_tickets_grouped[$ticket_id]['total_items']++;
            if ($estatus_interno === 'en_preparacion') {
                $temp_tickets_grouped[$ticket_id]['has_en_preparacion'] = true;
            } elseif ($estatus_interno === 'lista') {
                $temp_tickets_grouped[$ticket_id]['has_lista'] = true;
            }
        }

        // 🔹 MODIFICACIÓN: Lógica simplificada para determinar el estado final del ticket
        // Un ticket está "En Preparación" si al menos un ítem está "En Preparación".
        // Un ticket está "Listo" solo si TODOS sus ítems están "Lista".
        foreach ($temp_tickets_grouped as $ticket_data) {
            $final_status_interno = '';

            // Si hay algún ítem en preparación, el ticket se considera "En Preparación"
            if ($ticket_data['has_en_preparacion']) {
                $final_status_interno = 'en_preparacion';
            } else if ($ticket_data['has_lista']) { // Si no hay en_preparacion y hay listos, entonces está listo
                $final_status_interno = 'lista';
            }
            // Los tickets que solo tienen ítems 'pendiente', 'entregada', 'cancelada'
            // no llegarían aquí gracias al filtro del modelo get_comandas_para_cliente().

            // Solo añadir si tiene un estatus relevante para el cliente
            if (isset($customer_status_map[$final_status_interno])) {
                $status_info_cliente = $customer_status_map[$final_status_interno];

                $tickets_final_display[] = [
                    'ticket_id' => $ticket_data['ticket_id'],
                    'status_interno' => $final_status_interno,
                    'status_cliente_text' => $status_info_cliente['text'],
                    'status_cliente_emoji' => $status_info_cliente['emoji']
                ];
            }
        }

        // 🔹 Ordenar los tickets finales (ej. los listos primero)
        usort($tickets_final_display, function($a, $b) {
            // 'lista' viene antes que 'en_preparacion'
            if ($a['status_interno'] === 'lista' && $b['status_interno'] === 'en_preparacion') return -1;
            if ($a['status_interno'] === 'en_preparacion' && $b['status_interno'] === 'lista') return 1;
            // Si el mismo estado, ordenar por ticket_id ascendente (el más antiguo primero)
            return $a['ticket_id'] - $b['ticket_id']; 
        });

        echo json_encode($tickets_final_display);
        break;

    // 🔹 CASO NUEVO Y CRÍTICO: Para obtener solo el timestamp de la última actualización
    case "get_last_update_timestamp":
        $timestamp = $comanda->get_last_comanda_update_timestamp();
        echo json_encode(["last_update" => $timestamp]);
        break;

    default:
        // Si la operación no es reconocida, enviar un error JSON
        echo json_encode(["status" => "error", "message" => "Operación no válida."]);
        break;
}
?>