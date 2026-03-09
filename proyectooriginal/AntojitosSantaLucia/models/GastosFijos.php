<?php
require_once("../config/conexion.php");

class GastosFijos extends Conectar
{
    public function __construct()
    {
        date_default_timezone_set('America/Mexico_City');
    }

    /**
     * Obtener todas las plantillas activas
     */
    public function get_plantillas()
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT * FROM rv_gastos_fijos_plantilla 
                WHERE activo = 1 
                ORDER BY categoria, concepto";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Insertar nueva plantilla
     */
    public function insert_plantilla($categoria, $concepto, $monto_base, $descripcion = '')
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        try {
            $sql = "INSERT INTO rv_gastos_fijos_plantilla 
                    (categoria, concepto, monto_base, descripcion, activo) 
                    VALUES (?, ?, ?, ?, 1)";
            
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$categoria, $concepto, $monto_base, $descripcion]);
            
            return $conectar->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error en insert_plantilla: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualizar plantilla
     */
    public function update_plantilla($id, $categoria, $concepto, $monto_base, $descripcion = '')
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        try {
            $sql = "UPDATE rv_gastos_fijos_plantilla 
                    SET categoria = ?, 
                        concepto = ?, 
                        monto_base = ?, 
                        descripcion = ?
                    WHERE id = ?";
            
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$categoria, $concepto, $monto_base, $descripcion, $id]);
            
            return true;
        } catch (PDOException $e) {
            error_log("Error en update_plantilla: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Desactivar plantilla (soft delete)
     */
    public function delete_plantilla($id)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        try {
            $sql = "UPDATE rv_gastos_fijos_plantilla SET activo = 0 WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);
            return true;
        } catch (PDOException $e) {
            error_log("Error en delete_plantilla: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener gastos fijos de un mes específico
     */
    public function get_gastos_mes($mes, $anio)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT 
                    gf.*,
                    p.concepto as plantilla_nombre
                FROM rv_gastos_fijos gf
                LEFT JOIN rv_gastos_fijos_plantilla p ON gf.plantilla_id = p.id
                WHERE gf.mes = ? AND gf.anio = ?
                ORDER BY gf.categoria, gf.concepto";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$mes, $anio]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Verificar si ya existen gastos fijos para un mes
     */
    public function existe_mes_registrado($mes, $anio)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT COUNT(*) as total FROM rv_gastos_fijos 
                WHERE mes = ? AND anio = ?";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$mes, $anio]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $resultado['total'] > 0;
    }

    /**
     * Generar gastos del mes desde plantillas
     * Si el mes ya tiene gastos registrados, no hace nada
     */
    public function generar_gastos_desde_plantillas($mes, $anio, $usu_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        // Verificar si ya existen gastos para este mes
        if ($this->existe_mes_registrado($mes, $anio)) {
            return [
                'status' => 'info',
                'message' => 'Ya existen gastos registrados para este mes'
            ];
        }
        
        try {
            $conectar->beginTransaction();
            
            // Obtener todas las plantillas activas
            $plantillas = $this->get_plantillas();
            
            if (empty($plantillas)) {
                $conectar->rollBack();
                return [
                    'status' => 'error',
                    'message' => 'No hay plantillas activas para generar gastos'
                ];
            }
            
            $sql = "INSERT INTO rv_gastos_fijos 
                    (plantilla_id, categoria, concepto, monto, mes, anio, usu_id, estatus) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')";
            
            $stmt = $conectar->prepare($sql);
            
            $count = 0;
            foreach ($plantillas as $plantilla) {
                $stmt->execute([
                    $plantilla['id'],
                    $plantilla['categoria'],
                    $plantilla['concepto'],
                    $plantilla['monto_base'],
                    $mes,
                    $anio,
                    $usu_id
                ]);
                $count++;
            }
            
            $conectar->commit();
            
            return [
                'status' => 'success',
                'message' => "Se generaron {$count} gastos fijos para el mes",
                'count' => $count
            ];
        } catch (Exception $e) {
            $conectar->rollBack();
            error_log("Error en generar_gastos_desde_plantillas: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Error al generar gastos: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Actualizar un gasto fijo específico
     */
    public function update_gasto_fijo($id, $monto, $fecha_pago, $metodo_pago, $notas, $estatus)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        try {
            $sql = "UPDATE rv_gastos_fijos 
                    SET monto = ?, 
                        fecha_pago = ?, 
                        metodo_pago = ?, 
                        notas = ?,
                        estatus = ?
                    WHERE id = ?";
            
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$monto, $fecha_pago, $metodo_pago, $notas, $estatus, $id]);
            
            return true;
        } catch (PDOException $e) {
            error_log("Error en update_gasto_fijo: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Eliminar un gasto fijo
     */
    public function delete_gasto_fijo($id)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        try {
            $sql = "DELETE FROM rv_gastos_fijos WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);
            return true;
        } catch (PDOException $e) {
            error_log("Error en delete_gasto_fijo: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener resumen de gastos fijos por categoría
     */
    public function get_resumen_por_categoria($mes, $anio)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT 
                    categoria,
                    COUNT(*) as total_gastos,
                    SUM(monto) as total_monto,
                    SUM(CASE WHEN estatus = 'pagado' THEN monto ELSE 0 END) as total_pagado,
                    SUM(CASE WHEN estatus = 'pendiente' THEN monto ELSE 0 END) as total_pendiente
                FROM rv_gastos_fijos
                WHERE mes = ? AND anio = ?
                GROUP BY categoria
                ORDER BY categoria";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$mes, $anio]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener historial de gastos fijos (últimos 12 meses)
     */
    public function get_historial_12_meses()
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT 
                    anio,
                    mes,
                    SUM(monto) as total_mes,
                    COUNT(*) as num_gastos
                FROM rv_gastos_fijos
                WHERE estatus = 'pagado'
                GROUP BY anio, mes
                ORDER BY anio DESC, mes DESC
                LIMIT 12";
        
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Marcar gasto como pagado
     */
    public function marcar_como_pagado($id, $fecha_pago, $metodo_pago)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        try {
            $sql = "UPDATE rv_gastos_fijos 
                    SET estatus = 'pagado', 
                        fecha_pago = ?,
                        metodo_pago = ?
                    WHERE id = ?";
            
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$fecha_pago, $metodo_pago, $id]);
            return true;
        } catch (PDOException $e) {
            error_log("Error en marcar_como_pagado: " . $e->getMessage());
            return false;
        }
    }
}
?>