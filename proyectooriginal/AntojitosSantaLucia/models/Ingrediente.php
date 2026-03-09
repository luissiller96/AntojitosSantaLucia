<?php

class Ingredientes extends Conectar
{
    public function __construct() {}

    // Obtener todos los ingredientes activos con información de mapeo
    public function listar()
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT 
                    i.ingrediente_id, 
                    i.nombre_ingrediente, 
                    i.categoria, 
                    i.unidad_medida, 
                    i.precio_unitario,
                    i.insumo_mapeado_id,
                    ins.nombre as nombre_insumo_mapeado,
                    ins.tipo_unidad,
                    ins.unidad_receta,
                    i.es_activo
                FROM rv_ingredientes i
                LEFT JOIN rv_insumos ins ON i.insumo_mapeado_id = ins.id
                WHERE i.es_activo = 1 
                ORDER BY i.categoria, i.nombre_ingrediente";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener ingredientes con precio para cálculos de costo
    public function get_ingredientes_con_precio()
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT 
                    ingrediente_id,
                    nombre_ingrediente,
                    categoria,
                    unidad_medida,
                    precio_unitario,
                    insumo_mapeado_id
                FROM rv_ingredientes 
                WHERE es_activo = 1 AND precio_unitario > 0
                ORDER BY categoria, nombre_ingrediente";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function obtener_estadisticas_ingredientes()
{
    $conectar = parent::Conexion();
    parent::set_names();

    // Ajusta nombres de columnas si difieren en tu esquema
    $sql = "
        SELECT
            COUNT(*)                                        AS total_ingredientes,
            SUM(CASE WHEN estatus = 1 THEN 1 ELSE 0 END)    AS activos,
            AVG(ing_precio_unitario)                        AS precio_promedio,
            MAX(ing_precio_unitario)                        AS precio_max,
            MIN(ing_precio_unitario)                        AS precio_min
        FROM rv_ingredientes
        WHERE estatus = 1
    ";

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
public function obtener_estadisticas_mapeo_ingredientes()
{
    $conectar = parent::Conexion();
    parent::set_names();

    $sql = "
        SELECT
            COUNT(*) AS total_ingredientes,
            SUM(CASE WHEN insumo_mapeado_id IS NOT NULL AND insumo_mapeado_id <> 0 THEN 1 ELSE 0 END) AS ingredientes_mapeados,
            SUM(CASE WHEN insumo_mapeado_id IS NULL OR insumo_mapeado_id = 0 THEN 1 ELSE 0 END) AS ingredientes_sin_mapear
        FROM rv_ingredientes
        WHERE es_activo = 1
    ";

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}


    // Insertar ingrediente
    public function insertar($nombre, $categoria, $unidad, $precio, $insumo_mapeado_id = null)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "INSERT INTO rv_ingredientes (nombre_ingrediente, categoria, unidad_medida, precio_unitario, insumo_mapeado_id, es_activo) 
                VALUES (?, ?, ?, ?, ?, 1)";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$nombre, $categoria, $unidad, $precio, $insumo_mapeado_id]);
        
        return $stmt->rowCount() > 0;
    }

    // Actualizar ingrediente
    public function editar($id, $nombre, $categoria, $unidad, $precio, $insumo_mapeado_id = null)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "UPDATE rv_ingredientes SET 
                    nombre_ingrediente = ?,
                    categoria = ?,
                    unidad_medida = ?,
                    precio_unitario = ?,
                    insumo_mapeado_id = ?
                WHERE ingrediente_id = ?";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$nombre, $categoria, $unidad, $precio, $insumo_mapeado_id, $id]);
        
        return $stmt->rowCount() > 0;
    }

    // Eliminar ingrediente (soft delete)
    public function eliminar($id)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "UPDATE rv_ingredientes SET es_activo = 0 WHERE ingrediente_id = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$id]);
        
        return $stmt->rowCount() > 0;
    }

    // Mapear ingrediente con insumo
    public function mapear_con_insumo($ingrediente_id, $insumo_id, $factor_conversion = 1)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $conectar->beginTransaction();
        
        try {
            // Actualizar el ingrediente
            $sql1 = "UPDATE rv_ingredientes SET insumo_mapeado_id = ? WHERE ingrediente_id = ?";
            $stmt1 = $conectar->prepare($sql1);
            $stmt1->execute([$insumo_id, $ingrediente_id]);
            
            // Insertar en tabla de mapeo
            $sql2 = "INSERT INTO rv_ingrediente_insumo_mapeo (ingrediente_id, insumo_id, factor_conversion) 
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE factor_conversion = ?, updated_at = NOW()";
            $stmt2 = $conectar->prepare($sql2);
            $stmt2->execute([$ingrediente_id, $insumo_id, $factor_conversion, $factor_conversion]);
            
            $conectar->commit();
            return true;
            
        } catch (Exception $e) {
            $conectar->rollBack();
            return false;
        }
    }
}


?>