<?php
class Productos extends Conectar {
    
    /**
     * Obtener todos los productos con información de categoría
     */
    public function get_productos() {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                    p.ID, 
                    p.pr_nombre, 
                    p.categoria_id,
                    c.nombre AS pr_categoria,
                    p.pr_preciooriginal,
                    p.pr_precioventa, 
                    p.pr_preciocompra, 
                    p.pr_utilidad, 
                    p.pr_stock, 
                    p.pr_estatus, 
                    p.pr_favorito,
                    p.pr_promocion_porcentaje,
                    p.pr_totalventas
                FROM rv_productos p
                LEFT JOIN rv_categorias c ON p.categoria_id = c.id
                ORDER BY p.ID DESC";
                
            $stmt = $conectar->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_productos: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener un producto por ID
     */
    public function get_producto_por_id($id) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                    p.*,
                    c.nombre AS categoria_nombre
                FROM rv_productos p
                LEFT JOIN rv_categorias c ON p.categoria_id = c.id
                WHERE p.ID = ?";
                
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_producto_por_id: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Insertar nuevo producto
     */
    public function insert_producto($pr_nombre, $categoria_id, $pr_preciooriginal, 
                                   $pr_preciocompra, $pr_stock, $pr_estatus, $pr_promocion_porcentaje) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            // Calcular precio de venta con promoción
            $pr_precioventa = $pr_preciooriginal;
            if ($pr_promocion_porcentaje > 0) {
                $pr_precioventa = $pr_preciooriginal * (1 - ($pr_promocion_porcentaje / 100));
            }
            
            $sql = "INSERT INTO rv_productos (
                    pr_nombre, 
                    categoria_id, 
                    pr_preciooriginal,
                    pr_precioventa, 
                    pr_preciocompra, 
                    pr_stock, 
                    pr_estatus,
                    pr_promocion_porcentaje,
                    pr_descripcion,
                    pr_imagen,
                    pr_favorito,
                    pr_totalventas,
                    sucursal_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', '', 0, 0, 1)";
                
            $stmt = $conectar->prepare($sql);
            $stmt->execute([
                $pr_nombre,
                $categoria_id,
                $pr_preciooriginal,
                $pr_precioventa,
                $pr_preciocompra,
                $pr_stock,
                $pr_estatus,
                $pr_promocion_porcentaje
            ]);
            
            return $conectar->lastInsertId();
        } catch (Exception $e) {
            error_log("Error en insert_producto: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Actualizar producto existente
     */
    public function update_producto($id, $pr_nombre, $categoria_id, $pr_preciooriginal,
                                   $pr_preciocompra, $pr_stock, $pr_estatus, $pr_favorito, $pr_promocion_porcentaje) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            // Calcular precio de venta con promoción
            $pr_precioventa = $pr_preciooriginal;
            if ($pr_promocion_porcentaje > 0) {
                $pr_precioventa = $pr_preciooriginal * (1 - ($pr_promocion_porcentaje / 100));
            }
            
            $sql = "UPDATE rv_productos 
                    SET pr_nombre = ?,
                        categoria_id = ?,
                        pr_preciooriginal = ?,
                        pr_precioventa = ?,
                        pr_preciocompra = ?,
                        pr_stock = ?,
                        pr_estatus = ?,
                        pr_favorito = ?,
                        pr_promocion_porcentaje = ?
                    WHERE ID = ?";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute([
                $pr_nombre,
                $categoria_id,
                $pr_preciooriginal,
                $pr_precioventa,
                $pr_preciocompra,
                $pr_stock,
                $pr_estatus,
                $pr_favorito,
                $pr_promocion_porcentaje,
                $id
            ]);
            
            return $stmt->rowCount();
        } catch (Exception $e) {
            error_log("Error en update_producto: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Eliminar producto
     */
    public function delete_producto($id) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "DELETE FROM rv_productos WHERE ID = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error en delete_producto: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verificar disponibilidad de stock
     * Retorna true si hay stock suficiente o si es un servicio (stock NULL)
     */
    public function verificar_stock($id_producto, $cantidad) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT pr_stock FROM rv_productos WHERE ID = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id_producto]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$producto) {
                return false;
            }
            
            // Si el stock es NULL (servicio), siempre hay disponibilidad
            if ($producto['pr_stock'] === null) {
                return true;
            }
            
            // Verificar si hay stock suficiente
            return $producto['pr_stock'] >= $cantidad;
        } catch (Exception $e) {
            error_log("Error en verificar_stock: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Descontar stock después de una venta
     * No hace nada si es un servicio (stock NULL)
     */
    public function descontar_stock($id_producto, $cantidad_vendida) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            // Primero verificar el stock actual
            $sql = "SELECT pr_stock FROM rv_productos WHERE ID = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id_producto]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$producto) {
                return false;
            }
            
            // Si es un servicio (stock NULL), no descontar
            if ($producto['pr_stock'] === null) {
                return true;
            }
            
            // Descontar stock (no permitir valores negativos)
            $nuevo_stock = max(0, $producto['pr_stock'] - $cantidad_vendida);
            
            $sql = "UPDATE rv_productos 
                    SET pr_stock = ?,
                        pr_totalventas = pr_totalventas + ?
                    WHERE ID = ?";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$nuevo_stock, $cantidad_vendida, $id_producto]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error en descontar_stock: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener productos con bajo stock
     */
    public function get_productos_bajo_stock($limite = 10) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                    p.ID,
                    p.pr_nombre,
                    p.pr_stock,
                    c.nombre AS categoria
                FROM rv_productos p
                LEFT JOIN rv_categorias c ON p.categoria_id = c.id
                WHERE p.pr_stock IS NOT NULL 
                    AND p.pr_stock <= ?
                    AND p.pr_estatus = 1
                    AND p.sucursal_id = 1
                ORDER BY p.pr_stock ASC";
                
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$limite]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_productos_bajo_stock: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Buscar productos por nombre o PLU
     */
    public function buscar_productos($termino) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $termino = "%{$termino}%";
            
            $sql = "SELECT 
                    p.ID,
                    p.pr_PLU,
                    p.pr_nombre,
                    p.pr_precioventa,
                    p.pr_stock,
                    c.nombre AS categoria
                FROM rv_productos p
                LEFT JOIN rv_categorias c ON p.categoria_id = c.id
                WHERE (p.pr_nombre LIKE ? OR p.pr_PLU LIKE ?)
                    AND p.pr_estatus = 1
                    AND p.sucursal_id = 1
                ORDER BY p.pr_nombre ASC
                LIMIT 10";
                
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$termino, $termino]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en buscar_productos: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener productos más vendidos
     */
    public function get_productos_mas_vendidos($limite = 10) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                    p.ID,
                    p.pr_nombre,
                    p.pr_totalventas,
                    p.pr_precioventa,
                    c.nombre AS categoria
                FROM rv_productos p
                LEFT JOIN rv_categorias c ON p.categoria_id = c.id
                WHERE p.pr_estatus = 1
                    AND p.sucursal_id = 1
                    AND p.pr_totalventas > 0
                ORDER BY p.pr_totalventas DESC
                LIMIT ?";
                
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$limite]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_productos_mas_vendidos: " . $e->getMessage());
            return false;
        }
    }

/**
 * Actualizar stock directamente (para gastos operativos)
 */
public function actualizar_stock_directo($producto_id, $nuevo_stock)
{
    try {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "UPDATE rv_productos SET pr_stock = ? WHERE ID = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$nuevo_stock, $producto_id]);
        
        return true;
    } catch (Exception $e) {
        error_log("Error en actualizar_stock_directo: " . $e->getMessage());
        return false;
    }
}
}
?>