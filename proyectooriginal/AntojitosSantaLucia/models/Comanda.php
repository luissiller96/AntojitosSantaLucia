<?php
date_default_timezone_set('America/Mexico_City');
require_once("../config/conexion.php");

class Comanda extends Conectar
{
    /**
     * Obtiene todas las comandas para el tablero de cocina.
     * Incluye 'pendiente', 'en_preparacion' y 'lista' (si son recientes).
     */
 // En models/Comanda.php

public function get_comandas_activas()
{
    $conectar = parent::Conexion();
    parent::set_names();

    // CORRECCIÓN: Se agrega el LEFT JOIN para unir con rv_ventas y obtener el cliente.
    $sql = "SELECT
                c.com_id,
                c.ticket_id,
                c.com_fecha,
                c.com_cantidad,
                c.pr_PLU,
                c.pr_nombre,
                c.com_ingredientes_omitir,
                c.com_comentarios,
                c.com_estatus,
                v.cliente  -- Se obtiene el cliente desde la tabla de ventas (alias 'v')
            FROM
                rv_comanda AS c
            LEFT JOIN
                rv_ventas AS v ON c.ticket_id = v.ticket
            WHERE
                c.com_estatus IN ('pendiente', 'en_preparacion')
                OR
                (c.com_estatus = 'lista' AND DATE(c.ready_at) = CURDATE())
            /* Agrupamos por ID de comanda para evitar duplicados por el JOIN */
            GROUP BY c.com_id
            ORDER BY c.com_fecha ASC, c.ticket_id ASC";

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

    // Método para obtener los detalles de una comanda específica por su ID
    public function get_comanda_por_id($com_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT 
                    com_id, 
                    ticket_id, 
                    com_fecha, 
                    com_cantidad, 
                    pr_PLU, 
                    pr_nombre, 
                    com_ingredientes_omitir, 
                    com_comentarios, 
                    com_estatus,
                    ready_at
                FROM rv_comanda
                WHERE com_id = ?";

        $stmt = $conectar->prepare($sql);
        $stmt->bindValue(1, $com_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Actualiza el estatus de un ítem y el campo 'ready_at'
    public function update_comanda_status($com_id, $nuevo_estatus)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql_parts = ["com_estatus = ?"];
        $params = [$nuevo_estatus];

        if ($nuevo_estatus === 'lista') {
            $sql_parts[] = "ready_at = NOW()";
        } elseif ($nuevo_estatus === 'en_preparacion' || $nuevo_estatus === 'pendiente' || $nuevo_estatus === 'cancelada') {
            $sql_parts[] = "ready_at = NULL";
        }
        
        $sql = "UPDATE rv_comanda SET " . implode(", ", $sql_parts) . " WHERE com_id = ?";
        $params[] = $com_id;

        $stmt = $conectar->prepare($sql);
        
        return $stmt->execute($params);
    }

    // Actualiza el estatus de todos los ítems de un ticket
    public function update_comandas_ticket_status($ticket_id, $nuevo_estatus)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql_parts = ["com_estatus = ?"];
        $params = [$nuevo_estatus];

        if ($nuevo_estatus === 'lista') {
            $sql_parts[] = "ready_at = NOW()";
        } elseif ($nuevo_estatus === 'en_preparacion' || $nuevo_estatus === 'pendiente' || $nuevo_estatus === 'cancelada') {
            $sql_parts[] = "ready_at = NULL";
        }

        $sql = "UPDATE rv_comanda SET " . implode(", ", $sql_parts) . " WHERE ticket_id = ? AND com_estatus IN ('pendiente', 'en_preparacion')";
        $params[] = $ticket_id;
        
        $stmt = $conectar->prepare($sql);
        
        return $stmt->execute($params);
    }

    // Obtener comandas para la pantalla de clientes

// En models/Comanda.php, método get_comandas_para_cliente():

public function get_comandas_para_cliente()
{
    $conectar = parent::Conexion();
    parent::set_names();

    // ✅ CONFIGURACIÓN RECOMENDADA PARA PRODUCCIÓN:
    // 30 minutos para pedidos listos (tiempo razonable para recoger)
    $sql = "SELECT 
                com_id, 
                ticket_id, 
                com_fecha, 
                com_cantidad, 
                pr_PLU, 
                pr_nombre, 
                com_ingredientes_omitir, 
                com_comentarios, 
                com_estatus,
                ready_at
            FROM rv_comanda
            WHERE 
                (com_estatus = 'en_preparacion')
                OR 
                (com_estatus = 'lista' AND ready_at IS NOT NULL AND ready_at >= (NOW() - INTERVAL 30 MINUTE))
            ORDER BY com_estatus DESC, com_fecha ASC, ticket_id ASC"; 

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

    // Obtener el timestamp de la última actualización
    public function get_last_comanda_update_timestamp() {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT last_comanda_update_timestamp FROM rv_config WHERE id = 1";
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? $result['last_comanda_update_timestamp'] : null;
    }

    // Actualizar el timestamp de la última actualización
    public function update_comanda_update_timestamp() {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "INSERT INTO rv_config (id, last_comanda_update_timestamp) VALUES (1, NOW()) 
                ON DUPLICATE KEY UPDATE last_comanda_update_timestamp = NOW()";
        $stmt = $conectar->prepare($sql);
        return $stmt->execute();
    }
}
?>