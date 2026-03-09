<?php
require_once("../config/conexion.php");

class GastosOperativos extends Conectar
{
    public function __construct()
    {
        date_default_timezone_set('America/Mexico_City');
    }

    /**
     * Obtener todos los gastos operativos con filtros
     */
    public function get_gastos($fecha_inicio = null, $fecha_fin = null)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT 
                    g.*,
                    COALESCE(p.pr_nombre, i.nombre) as item_nombre,
                    u.usu_nom as usuario_nombre,
                    CASE 
                        WHEN g.tipo_item = 'producto' THEN 'producto'
                        WHEN g.tipo_item = 'insumo' THEN 'insumo'
                        ELSE 'ninguno'
                    END as tipo_item_real
                FROM rv_gastos g
                LEFT JOIN rv_productos p ON g.item_id = p.ID AND g.tipo_item = 'producto'
                LEFT JOIN rv_insumos i ON g.item_id = i.id AND g.tipo_item = 'insumo'
                LEFT JOIN tm_usuario u ON g.usu_id = u.usu_id
                WHERE g.tipo = 'operativo'";

        $params = [];

        if ($fecha_inicio && $fecha_fin) {
            $sql .= " AND DATE(g.fecha) BETWEEN ? AND ?";
            $params[] = $fecha_inicio;
            $params[] = $fecha_fin;
        }

        $sql .= " ORDER BY g.fecha DESC";

        $stmt = $conectar->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Insertar nuevo gasto operativo
     */
    public function insert_gasto(
        $descripcion,
        $fecha,
        $precio_unitario,
        $metodo_pago,
        $comentario,
        $usu_id,
        $tipo_item = null,          // 'producto', 'insumo' o null
        $item_id = null,            // ID del producto o insumo
        $cantidad_comprada = null   // Cantidad comprada
    ) {
        $conectar = parent::Conexion();
        parent::set_names();

        try {
            $sql = "INSERT INTO rv_gastos 
                (tipo_gasto, descripcion, fecha, comentario, precio_unitario, 
                 tipo, metodo_pago, usu_id, tipo_item, item_id, cantidad_comprada) 
                VALUES ('operativo', ?, ?, ?, ?, 'operativo', ?, ?, ?, ?, ?)";

            $stmt = $conectar->prepare($sql);
            $stmt->execute([
                $descripcion,
                $fecha,
                $comentario,
                $precio_unitario,
                $metodo_pago,
                $usu_id,
                $tipo_item,
                $item_id,
                $cantidad_comprada
            ]);

            return $conectar->lastInsertId();

        } catch (Exception $e) {
            error_log("Error en insert_gasto: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener productos E INSUMOS para select
     */
    public function get_productos_e_insumos_activos()
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql_productos = "SELECT 
                            ID as id,
                            pr_nombre as nombre, 
                            pr_stock as stock,
                            'producto' as tipo
                        FROM rv_productos 
                        WHERE pr_estatus = 1 AND pr_stock IS NOT NULL
                        ORDER BY pr_nombre";
        
        $stmt = $conectar->prepare($sql_productos);
        $stmt->execute();
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $sql_insumos = "SELECT 
                            id,
                            nombre,
                            stock_actual as stock,
                            'insumo' as tipo,
                            unidad_medida
                        FROM rv_insumos 
                        WHERE estatus = 1
                        ORDER BY nombre";
        
        $stmt = $conectar->prepare($sql_insumos);
        $stmt->execute();
        $insumos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return array_merge($productos, $insumos);
    }

    /**
     * Actualizar gasto operativo
     */
    public function update_gasto(
        $id,
        $descripcion,
        $precio_unitario,
        $metodo_pago,
        $comentario
    ) {
        $conectar = parent::Conexion();
        parent::set_names();

        try {
            $sql = "UPDATE rv_gastos 
                    SET descripcion = ?,
                        precio_unitario = ?,
                        metodo_pago = ?,
                        comentario = ?
                    WHERE id = ?";

            $stmt = $conectar->prepare($sql);
            $stmt->execute([
                $descripcion,
                $precio_unitario,
                $metodo_pago,
                $comentario,
                $id
            ]);

            return true;
        } catch (PDOException $e) {
            error_log("Error en update_gasto: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Eliminar gasto operativo
     */
    public function delete_gasto($id)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        try {
            $sql_get = "SELECT tipo_item, item_id, cantidad_comprada FROM rv_gastos WHERE id = ?";
            $stmt_get = $conectar->prepare($sql_get);
            $stmt_get->execute([$id]);
            $gasto = $stmt_get->fetch(PDO::FETCH_ASSOC);

            $conectar->beginTransaction();

            if ($gasto && $gasto['item_id'] && $gasto['cantidad_comprada']) {
                if ($gasto['tipo_item'] === 'producto') {
                    // Revertir stock de producto
                    $sql_revert = "UPDATE rv_productos 
                                  SET pr_stock = pr_stock - ? 
                                  WHERE ID = ?";
                    $stmt_revert = $conectar->prepare($sql_revert);
                    $stmt_revert->execute([$gasto['cantidad_comprada'], $gasto['item_id']]);
                } elseif ($gasto['tipo_item'] === 'insumo') {
                    // Revertir stock de insumo
                    $sql_revert = "UPDATE rv_insumos 
                                  SET stock_actual = stock_actual - ? 
                                  WHERE id = ?";
                    $stmt_revert = $conectar->prepare($sql_revert);
                    $stmt_revert->execute([$gasto['cantidad_comprada'], $gasto['item_id']]);
                }
            }

            $sql = "DELETE FROM rv_gastos WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);

            $conectar->commit();
            return true;

        } catch (Exception $e) {
            $conectar->rollBack();
            error_log("Error en delete_gasto: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener gastos del día
     */
    public function get_gastos_dia($fecha = null)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        if (!$fecha) {
            $fecha = date('Y-m-d');
        }

        $sql = "SELECT 
                    COUNT(*) as total_gastos,
                    COALESCE(SUM(precio_unitario), 0) as total_monto,
                    COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN precio_unitario ELSE 0 END), 0) as total_efectivo,
                    COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN precio_unitario ELSE 0 END), 0) as total_tarjeta,
                    COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN precio_unitario ELSE 0 END), 0) as total_transferencia
                FROM rv_gastos
                WHERE DATE(fecha) = ? AND tipo = 'operativo'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$fecha]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener gastos del mes
     */
    public function get_gastos_mes($mes = null, $anio = null)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        if (!$mes) $mes = date('n');
        if (!$anio) $anio = date('Y');

        $sql = "SELECT 
                    COUNT(*) as total_gastos,
                    COALESCE(SUM(precio_unitario), 0) as total_monto,
                    COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN precio_unitario ELSE 0 END), 0) as total_efectivo,
                    COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN precio_unitario ELSE 0 END), 0) as total_tarjeta
                FROM rv_gastos
                WHERE MONTH(fecha) = ? AND YEAR(fecha) = ? AND tipo = 'operativo'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$mes, $anio]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener últimos 30 días de gastos para gráfica
     */
    public function get_gastos_ultimos_30_dias()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT 
                    DATE(fecha) as dia,
                    COALESCE(SUM(precio_unitario), 0) as total_dia
                FROM rv_gastos
                WHERE fecha >= CURDATE() - INTERVAL 29 DAY
                AND tipo = 'operativo'
                GROUP BY DATE(fecha)
                ORDER BY DATE(fecha) ASC";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>