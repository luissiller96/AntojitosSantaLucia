<?php
date_default_timezone_set('America/Mexico_City');
require_once("../config/conexion.php");

class Ventas extends Conectar
{
    public function obtenerConexionParaTransaccion()
    {
        return parent::Conexion();
    }

    public function registrar_venta_producto($conectar, $producto_data, $ticket, $fecha_actual, $vendedor, $tipo_pago, $total_ticket_global, $cliente, $plataforma_origen = null)
    {
        date_default_timezone_set('America/Mexico_City');
        parent::set_names();

        try {
            $stmt = $conectar->prepare("INSERT INTO rv_ventas (ticket, fecha, cantidad, id_producto, producto, vendedor, metodo_pago, total, total_ticket, cliente, estatus, plataforma_origen) 
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completado', ?)");

            $stmt->execute([
                $ticket,
                $fecha_actual,
                $producto_data["cantidad"],
                $producto_data["id"],
                $producto_data["nombre"],
                $vendedor,
                $tipo_pago,
                $producto_data["precio"] * $producto_data["cantidad"],
                $total_ticket_global,
                $cliente,
                $plataforma_origen
            ]);

            $stmt_update = $conectar->prepare("UPDATE rv_productos SET pr_totalventas = pr_totalventas + ? WHERE ID = ?");
            $stmt_update->execute([$producto_data["cantidad"], $producto_data["id"]]);

            return true;
        } catch (Exception $e) {
            error_log("Error en registrar_venta_producto(): " . $e->getMessage());
            throw $e;
        }
    }

    public function insertar_comanda($ticket_id, $cantidad, $producto_id, $pr_nombre, $ingredientes_omitir = null, $comentarios = null)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        try {
            $sql = "INSERT INTO rv_comanda (
                        ticket_id, 
                        com_cantidad, 
                        pr_PLU, 
                        pr_nombre, 
                        com_ingredientes_omitir, 
                        com_comentarios, 
                        com_estatus
                    ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente')";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute([
                $ticket_id,
                $cantidad,
                $producto_id,
                $pr_nombre,
                $ingredientes_omitir,
                $comentarios
            ]);

            return true;
        } catch (Exception $e) {
            error_log("Error en insertar_comanda(): " . $e->getMessage());
            throw $e;
        }
    }

    public function getProductoDetalles($producto_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT 
                    es_platillo, 
                    pr_stock,
                    pr_nombre
                FROM rv_productos 
                WHERE ID = ?";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$producto_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener insumos vinculados a un producto desde rv_producto_insumos
     */
    public function getInsumosVinculados($producto_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT 
                    pi.insumo_id, 
                    pi.cantidad_necesaria, 
                    i.nombre,
                    i.unidad_medida,
                    i.stock_actual
                FROM rv_producto_insumos pi
                INNER JOIN rv_insumos i ON pi.insumo_id = i.id
                WHERE pi.producto_id = ?";
                    
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$producto_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Descontar insumos vinculados al vender un producto
     */
    public function descontarInsumosVinculados($producto_id, $cantidad_vendida, $ticket_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $insumos = $this->getInsumosVinculados($producto_id);

        if (empty($insumos)) {
            return true; // No tiene insumos vinculados
        }

        foreach ($insumos as $insumo) {
            $cantidad_a_descontar = $insumo['cantidad_necesaria'] * $cantidad_vendida;
            
            if ($insumo['stock_actual'] < $cantidad_a_descontar) {
                throw new Exception("Stock insuficiente del insumo: " . $insumo['nombre']);
            }

            $sql = "UPDATE rv_insumos SET stock_actual = stock_actual - ? WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$cantidad_a_descontar, $insumo['insumo_id']]);

            $sql_mov = "INSERT INTO rv_movimientos_insumos 
                        (insumo_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, ticket_id, producto_id, usuario_id)
                        VALUES (?, 'salida', ?, ?, ?, 'Venta de producto', ?, ?, 1)";
            
            $stock_anterior = $insumo['stock_actual'];
            $stock_nuevo = $stock_anterior - $cantidad_a_descontar;
            
            $stmt_mov = $conectar->prepare($sql_mov);
            $stmt_mov->execute([
                $insumo['insumo_id'],
                $cantidad_a_descontar,
                $stock_anterior,
                $stock_nuevo,
                $ticket_id,
                $producto_id
            ]);
        }

        return true;
    }

    /**
 * Obtener componentes de productos (para paquetes/órdenes)
 */
public function getComponentesProducto($producto_id)
{
    $conectar = parent::Conexion();
    parent::set_names();

    $sql = "SELECT 
                pc.producto_componente_id,
                pc.cantidad_necesaria,
                p.pr_nombre,
                p.pr_stock
            FROM rv_producto_componentes pc
            INNER JOIN rv_productos p ON pc.producto_componente_id = p.ID
            WHERE pc.producto_padre_id = ?";
                
    $stmt = $conectar->prepare($sql);
    $stmt->execute([$producto_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Descontar stock de productos componentes
 */
public function descontarComponentesProducto($producto_id, $cantidad_vendida)
{
    $conectar = parent::Conexion();
    parent::set_names();

    $componentes = $this->getComponentesProducto($producto_id);

    if (empty($componentes)) {
        return true; // No tiene componentes
    }

    foreach ($componentes as $componente) {
        $cantidad_a_descontar = $componente['cantidad_necesaria'] * $cantidad_vendida;
        
        // Verificar stock antes de descontar
        if ($componente['pr_stock'] !== null && $componente['pr_stock'] < $cantidad_a_descontar) {
            throw new Exception("Stock insuficiente de: " . $componente['pr_nombre'] . " (necesitas {$cantidad_a_descontar}, tienes {$componente['pr_stock']})");
        }

        // Descontar del stock del producto componente
        if ($componente['pr_stock'] !== null) {
            $sql = "UPDATE rv_productos SET pr_stock = pr_stock - ? WHERE ID = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$cantidad_a_descontar, $componente['producto_componente_id']]);
        }
    }

    return true;
}

}
?>
