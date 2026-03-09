<?php
class Insumos extends Conectar
{

    /**
     * Obtener todos los insumos
     */
    public function get_insumos()
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $sql = "SELECT 
                    id,
                    nombre,
                    descripcion,
                    unidad_medida,
                    stock_actual,
                    stock_minimo,
                    costo_unitario,
                    estatus,
                    fecha_registro
                FROM rv_insumos
                ORDER BY nombre ASC";

            $stmt = $conectar->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_insumos: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener un insumo por ID
     */
    public function get_insumo_por_id($id)
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $sql = "SELECT * FROM rv_insumos WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_insumo_por_id: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Insertar nuevo insumo
     */
    public function insert_insumo($nombre, $descripcion, $unidad_medida, $stock_actual, $stock_minimo, $costo_unitario)
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $stock_actual = max(0, floatval($stock_actual));
            $stock_minimo = max(0, floatval($stock_minimo));
            $costo_unitario = max(0, floatval($costo_unitario));

            $sql = "INSERT INTO rv_insumos (
                    nombre,
                    descripcion,
                    unidad_medida,
                    stock_actual,
                    stock_minimo,
                    costo_unitario,
                    estatus
                ) VALUES (?, ?, ?, ?, ?, ?, 1)";

            $stmt = $conectar->prepare($sql);
            $stmt->execute([
                $nombre,
                $descripcion,
                $unidad_medida,
                $stock_actual,
                $stock_minimo,
                $costo_unitario
            ]);

            return $conectar->lastInsertId();
        } catch (Exception $e) {
            error_log("Error en insert_insumo: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualizar insumo existente
     */
    public function update_insumo($id, $nombre, $descripcion, $unidad_medida, $stock_minimo, $costo_unitario, $estatus)
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $stock_minimo = max(0, floatval($stock_minimo));
            $costo_unitario = max(0, floatval($costo_unitario));

            $sql = "UPDATE rv_insumos 
                    SET nombre = ?,
                        descripcion = ?,
                        unidad_medida = ?,
                        stock_minimo = ?,
                        costo_unitario = ?,
                        estatus = ?
                    WHERE id = ?";

            $stmt = $conectar->prepare($sql);
            $stmt->execute([
                $nombre,
                $descripcion,
                $unidad_medida,
                $stock_minimo,
                $costo_unitario,
                $estatus,
                $id
            ]);

            return true;
        } catch (Exception $e) {
            error_log("Error en update_insumo: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Eliminar insumo
     */
    public function delete_insumo($id)
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $sql = "DELETE FROM rv_insumos WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$id]);

            return true;
        } catch (Exception $e) {
            error_log("Error en delete_insumo: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Registrar entrada de stock (compra de insumos)
     */
    public function registrar_entrada($insumo_id, $cantidad, $motivo, $usuario_id = null)
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $cantidad = max(0, floatval($cantidad));
            $usuario = $usuario_id ?? 0;

            // Obtener stock actual
            $sql = "SELECT stock_actual FROM rv_insumos WHERE id = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$insumo_id]);
        $insumo = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$insumo) {
            throw new Exception("Insumo no encontrado");
        }

        $stock_anterior = $insumo['stock_actual'];
        $stock_nuevo = $stock_anterior + $cantidad;

        $conectar->beginTransaction();

        // Actualizar stock
        $sql = "UPDATE rv_insumos SET stock_actual = ? WHERE id = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$stock_nuevo, $insumo_id]);

        // Registrar movimiento
        $sql = "INSERT INTO rv_movimientos_insumos 
                (insumo_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, usuario_id, fecha_movimiento)
                VALUES (?, 'entrada', ?, ?, ?, ?, ?, NOW())";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([
            $insumo_id,
            $cantidad,
            $stock_anterior,
            $stock_nuevo,
            $motivo,
            $usuario
        ]);

        $conectar->commit();
        return true;

    } catch (Exception $e) {
        if (isset($conectar)) {
            $conectar->rollBack();
        }
        error_log("Error en registrar_entrada: " . $e->getMessage());
        return false;
    }
}

    /**
     * Registrar salida de stock (uso de insumos)
     */
    public function registrar_salida($insumo_id, $cantidad, $motivo = 'Uso de insumo', $ticket_id = null, $producto_id = null)
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $conectar->beginTransaction();

            // Obtener stock actual
            $sql = "SELECT stock_actual FROM rv_insumos WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$insumo_id]);
            $insumo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$insumo) {
                throw new Exception("Insumo no encontrado");
            }

            $stock_anterior = $insumo['stock_actual'];
            $stock_nuevo = max(0, $stock_anterior - $cantidad); // No permitir negativos

            // Actualizar stock
            $sql = "UPDATE rv_insumos SET stock_actual = ? WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$stock_nuevo, $insumo_id]);

            // Registrar movimiento
            $sql = "INSERT INTO rv_movimientos_insumos 
                    (insumo_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, ticket_id, producto_id, usuario_id) 
                    VALUES (?, 'salida', ?, ?, ?, ?, ?, ?, 1)";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$insumo_id, $cantidad, $stock_anterior, $stock_nuevo, $motivo, $ticket_id, $producto_id]);

            $conectar->commit();
            return true;

        } catch (Exception $e) {
            $conectar->rollBack();
            error_log("Error en registrar_salida: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Ajustar stock manualmente
     */
    public function ajustar_stock($insumo_id, $nuevo_stock, $motivo = 'Ajuste manual')
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $conectar->beginTransaction();

            // Obtener stock actual
            $sql = "SELECT stock_actual FROM rv_insumos WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$insumo_id]);
            $insumo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$insumo) {
                throw new Exception("Insumo no encontrado");
            }

            $stock_anterior = $insumo['stock_actual'];
            $diferencia = $nuevo_stock - $stock_anterior;

            // Actualizar stock
            $sql = "UPDATE rv_insumos SET stock_actual = ? WHERE id = ?";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$nuevo_stock, $insumo_id]);

            // Registrar movimiento
            $sql = "INSERT INTO rv_movimientos_insumos 
                    (insumo_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, usuario_id) 
                    VALUES (?, 'ajuste', ?, ?, ?, ?, 1)";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$insumo_id, abs($diferencia), $stock_anterior, $nuevo_stock, $motivo]);

            $conectar->commit();
            return true;

        } catch (Exception $e) {
            $conectar->rollBack();
            error_log("Error en ajustar_stock: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener insumos con stock bajo
     */
    public function get_insumos_bajo_stock()
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $sql = "SELECT 
                    id,
                    nombre,
                    unidad_medida,
                    stock_actual,
                    stock_minimo,
                    CASE 
                        WHEN stock_actual = 0 THEN 'agotado'
                        WHEN stock_actual <= (stock_minimo * 0.5) THEN 'critico'
                        WHEN stock_actual <= stock_minimo THEN 'bajo'
                        ELSE 'normal'
                    END as nivel_alerta
                FROM rv_insumos
                WHERE estatus = 1 
                    AND stock_actual <= stock_minimo
                ORDER BY stock_actual ASC";

            $stmt = $conectar->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_insumos_bajo_stock: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener historial de movimientos de un insumo
     */
    public function get_movimientos_insumo($insumo_id, $limite = 50)
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $sql = "SELECT 
                    m.*,
                    i.nombre as insumo_nombre,
                    p.pr_nombre as producto_nombre
                FROM rv_movimientos_insumos m
                INNER JOIN rv_insumos i ON m.insumo_id = i.id
                LEFT JOIN rv_productos p ON m.producto_id = p.ID
                WHERE m.insumo_id = ?
                ORDER BY m.fecha_movimiento DESC
                LIMIT ?";

            $stmt = $conectar->prepare($sql);
            $stmt->execute([$insumo_id, $limite]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en get_movimientos_insumo: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verificar si hay stock suficiente
     */
    public function verificar_stock_disponible($insumo_id, $cantidad_necesaria)
    {
        try {
            $conectar = parent::Conexion();
            parent::set_names();

            $sql = "SELECT stock_actual FROM rv_insumos WHERE id = ? AND estatus = 1";
            $stmt = $conectar->prepare($sql);
            $stmt->execute([$insumo_id]);
            $insumo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$insumo) {
                return false;
            }

            return $insumo['stock_actual'] >= $cantidad_necesaria;
        } catch (Exception $e) {
            error_log("Error en verificar_stock_disponible: " . $e->getMessage());
            return false;
        }
    }
}
?>
