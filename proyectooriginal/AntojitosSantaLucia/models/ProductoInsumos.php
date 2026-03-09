<?php
class ProductoInsumos extends Conectar {
    
    /**
     * Obtener insumos de un producto
     */
    public function get_insumos_producto($producto_id) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                    pi.id,
                    pi.producto_id,
                    pi.insumo_id,
                    pi.cantidad_necesaria,
                    i.nombre as insumo_nombre,
                    i.unidad_medida,
                    i.stock_actual
                FROM rv_producto_insumos pi
                INNER JOIN rv_insumos i ON pi.insumo_id = i.id
                WHERE pi.producto_id = ?
                ORDER BY i.nombre ASC";
                
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$producto_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_insumos_producto: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Guardar insumos de un producto (elimina los anteriores y guarda los nuevos)
     */
    public function guardar_insumos_producto($producto_id, $insumos) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $conectar->beginTransaction();
            
            // Eliminar insumos anteriores
            $sql = "DELETE FROM rv_producto_insumos WHERE producto_id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$producto_id]);
            
            // Insertar nuevos insumos
            if (!empty($insumos)) {
                $sql = "INSERT INTO rv_producto_insumos (producto_id, insumo_id, cantidad_necesaria) 
                        VALUES (?, ?, ?)";
                $stmt = $conectar->prepare($sql);
                
                foreach ($insumos as $insumo) {
                    $stmt->execute([
                        $producto_id,
                        $insumo['insumo_id'],
                        $insumo['cantidad_necesaria']
                    ]);
                }
            }
            
            $conectar->commit();
            return true;
            
        } catch (Exception $e) {
            $conectar->rollBack();
            error_log("Error en guardar_insumos_producto: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verificar si hay stock suficiente de todos los insumos para vender un producto
     */
    public function verificar_stock_insumos($producto_id, $cantidad_producto) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                    i.nombre,
                    i.stock_actual,
                    pi.cantidad_necesaria,
                    (pi.cantidad_necesaria * ?) as cantidad_requerida
                FROM rv_producto_insumos pi
                INNER JOIN rv_insumos i ON pi.insumo_id = i.id
                WHERE pi.producto_id = ?";
                
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$cantidad_producto, $producto_id]);
            $insumos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $faltantes = [];
            foreach ($insumos as $insumo) {
                if ($insumo['stock_actual'] < $insumo['cantidad_requerida']) {
                    $faltantes[] = [
                        'nombre' => $insumo['nombre'],
                        'disponible' => $insumo['stock_actual'],
                        'requerido' => $insumo['cantidad_requerida']
                    ];
                }
            }
            
            return [
                'tiene_stock' => empty($faltantes),
                'faltantes' => $faltantes
            ];
            
        } catch (Exception $e) {
            error_log("Error en verificar_stock_insumos: " . $e->getMessage());
            return ['tiene_stock' => false, 'faltantes' => []];
        }
    }
    
    /**
     * Descontar insumos al vender un producto
     */
    public function descontar_insumos_venta($producto_id, $cantidad_producto, $ticket_id = null) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            require_once("Insumos.php");
            $insumos_model = new Insumos();
            
            // Obtener insumos del producto
            $insumos = $this->get_insumos_producto($producto_id);
            
            if (empty($insumos)) {
                return true; // No tiene insumos, no hay nada que descontar
            }
            
            $conectar->beginTransaction();
            
            foreach ($insumos as $insumo) {
                $cantidad_a_descontar = $insumo['cantidad_necesaria'] * $cantidad_producto;
                
                // Registrar salida del insumo
                $resultado = $insumos_model->registrar_salida(
                    $insumo['insumo_id'],
                    $cantidad_a_descontar,
                    "Venta de producto",
                    $ticket_id,
                    $producto_id
                );
                
                if (!$resultado) {
                    throw new Exception("Error al descontar insumo: " . $insumo['insumo_nombre']);
                }
            }
            
            $conectar->commit();
            return true;
            
        } catch (Exception $e) {
            $conectar->rollBack();
            error_log("Error en descontar_insumos_venta: " . $e->getMessage());
            return false;
        }
    }
}
?>