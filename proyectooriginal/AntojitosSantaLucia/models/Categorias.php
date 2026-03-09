<?php
class Categorias extends Conectar {
    
    /**
     * Obtener todas las categorías
     */
    public function get_categorias() {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT id, nombre 
                    FROM rv_categorias 
                    ORDER BY nombre ASC";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_categorias: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener categoría por ID
     */
    public function get_categoria_por_id($id) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT id, nombre 
                    FROM rv_categorias 
                    WHERE id = ?";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_categoria_por_id: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Insertar nueva categoría
     */
    public function insert_categoria($nombre) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            // Verificar si ya existe una categoría con ese nombre
            $sql = "SELECT id FROM rv_categorias WHERE nombre = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$nombre]);
            
            if ($stmt->fetch()) {
                return false; // Ya existe
            }
            
            // Insertar nueva categoría
            $sql = "INSERT INTO rv_categorias (nombre) VALUES (?)";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$nombre]);
            
            return $conectar->lastInsertId();
        } catch (Exception $e) {
            error_log("Error en insert_categoria: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Actualizar categoría
     */
    public function update_categoria($id, $nombre) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "UPDATE rv_categorias 
                    SET nombre = ? 
                    WHERE id = ?";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$nombre, $id]);
            
            return $stmt->rowCount();
        } catch (Exception $e) {
            error_log("Error en update_categoria: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Eliminar categoría
     * Los productos asociados quedarán con categoria_id = NULL
     */
    public function delete_categoria($id) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            // Primero actualizar productos para quitar la referencia
            $sql = "UPDATE rv_productos 
                    SET categoria_id = NULL 
                    WHERE categoria_id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);
            
            // Luego eliminar la categoría
            $sql = "DELETE FROM rv_categorias WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error en delete_categoria: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtener cantidad de productos por categoría
     */
    public function get_productos_por_categoria($categoria_id) {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT COUNT(*) as total 
                    FROM rv_productos 
                    WHERE categoria_id = ? 
                    AND pr_estatus = 1";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$categoria_id]);
            $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $resultado['total'];
        } catch (Exception $e) {
            error_log("Error en get_productos_por_categoria: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Obtener estadísticas de categorías
     */
    public function get_estadisticas_categorias() {
        try {
            $conectar = parent::Conexion();
            parent::set_names();
            
            $sql = "SELECT 
                        c.id,
                        c.nombre,
                        COUNT(p.ID) as total_productos,
                        SUM(CASE WHEN p.pr_estatus = 1 THEN 1 ELSE 0 END) as productos_activos,
                        SUM(CASE WHEN p.pr_stock <= 5 AND p.pr_stock IS NOT NULL THEN 1 ELSE 0 END) as productos_bajo_stock
                    FROM rv_categorias c
                    LEFT JOIN rv_productos p ON c.id = p.categoria_id
                    GROUP BY c.id, c.nombre
                    ORDER BY c.nombre ASC";
                    
            $stmt = $conectar->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_estadisticas_categorias: " . $e->getMessage());
            return false;
        }
    }
}
?>