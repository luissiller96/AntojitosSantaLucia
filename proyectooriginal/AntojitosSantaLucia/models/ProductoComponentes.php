<?php
class ProductoComponentes extends Conectar {
    
    /**
     * Obtener componentes de un producto (para mostrar en el modal)
     */
    public function get_componentes_producto($producto_id) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                        pc.id,
                        pc.producto_componente_id,
                        pc.cantidad_necesaria,
                        p.pr_nombre,
                        p.pr_stock,
                        p.pr_precioventa
                    FROM rv_producto_componentes pc
                    INNER JOIN rv_productos p ON pc.producto_componente_id = p.ID
                    WHERE pc.producto_padre_id = ?";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$producto_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_componentes_producto: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Guardar componentes de un producto
     */
    public function guardar_componentes_producto($producto_id, $componentes) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            // Primero eliminar componentes existentes
            $sql_delete = "DELETE FROM rv_producto_componentes WHERE producto_padre_id = ?";
            $stmt_delete = $conectar->prepare($sql_delete);
            $stmt_delete->execute([$producto_id]);
            
            // Insertar nuevos componentes
            if (!empty($componentes)) {
                $sql_insert = "INSERT INTO rv_producto_componentes (producto_padre_id, producto_componente_id, cantidad_necesaria) 
                               VALUES (?, ?, ?)";
                $stmt_insert = $conectar->prepare($sql_insert);
                
                foreach ($componentes as $componente) {
                    $stmt_insert->execute([
                        $producto_id,
                        $componente['producto_id'],
                        $componente['cantidad_necesaria']
                    ]);
                }
            }
            
            return true;
        } catch (Exception $e) {
            error_log("Error en guardar_componentes_producto: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verificar si hay stock suficiente de los componentes
     */
    public function verificar_stock_componentes($producto_id, $cantidad_venta) {
        try {
            $componentes = $this->get_componentes_producto($producto_id);
            
            $faltantes = [];
            foreach ($componentes as $componente) {
                $cantidad_necesaria = $componente['cantidad_necesaria'] * $cantidad_venta;
                
                if ($componente['pr_stock'] !== null && $componente['pr_stock'] < $cantidad_necesaria) {
                    $faltantes[] = [
                        'nombre' => $componente['pr_nombre'],
                        'necesita' => $cantidad_necesaria,
                        'tiene' => $componente['pr_stock']
                    ];
                }
            }
            
            return [
                'tiene_stock' => empty($faltantes),
                'faltantes' => $faltantes
            ];
        } catch (Exception $e) {
            error_log("Error en verificar_stock_componentes: " . $e->getMessage());
            return ['tiene_stock' => false, 'faltantes' => []];
        }
    }
    
    /**
     * Obtener todos los productos disponibles para usar como componentes
     */
    public function get_productos_disponibles() {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                        ID as producto_id,
                        pr_nombre,
                        pr_stock,
                        pr_precioventa
                    FROM rv_productos 
                    WHERE pr_estatus = 1 
                    AND pr_stock IS NOT NULL
                    ORDER BY pr_nombre ASC";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_productos_disponibles: " . $e->getMessage());
            return false;
        }
    }
}
?>