<?php
require_once("../config/conexion.php");

class Dashboard extends Conectar
{
    public function __construct()
    {
        date_default_timezone_set('America/Mexico_City');
    }

    public function get_kpis_completos()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        // KPIs DEL DÍA
        $ventas_dia = $this->get_ventas_dia();
        $utilidad_dia = $this->get_utilidad_dia();
        $gastos_operativos_dia = $this->get_gastos_operativos_dia();

        // KPIs DEL MES
        $ventas_mes = $this->get_ventas_mes();
        $gastos_fijos_mes = $this->get_gastos_fijos_mes();
        $utilidad_mes = $this->get_utilidad_mes();

        // ESTADO DE CAJA
        $estado_caja = $this->get_estado_caja();

        // COCINA Y PLATILLOS
        $platillos_dia = $this->get_platillos_vendidos_dia();
        $ordenes_cocina = $this->get_ordenes_en_cocina();

        return [
            // KPIs diarios
            "ventas_dia" => $ventas_dia,
            "gastos_operativos_dia" => $gastos_operativos_dia,
            "utilidad_dia" => $utilidad_dia,

            // KPIs mensuales
            "ventas_mes" => $ventas_mes,
            "gastos_fijos_mes" => $gastos_fijos_mes,
            "utilidad_mes" => $utilidad_mes,

            // Estado de caja
            "caja_estado" => $estado_caja['estado'],
            "caja_hora_apertura" => $estado_caja['hora_apertura'],
            "caja_monto_apertura" => $estado_caja['monto_apertura'],

            // Cocina y Platillos
            "platillos_dia" => $platillos_dia,
            "ordenes_cocina" => $ordenes_cocina
        ];
    }

    /**
     * Gastos operativos del día
     */
    private function get_gastos_operativos_dia()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT COALESCE(SUM(precio_unitario), 0) as total
            FROM rv_gastos
            WHERE DATE(fecha) = CURDATE()
            AND tipo = 'operativo'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return floatval($resultado['total']);
    }
    /**
     * Ventas totales del día
     */
    private function get_ventas_dia()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT COALESCE(SUM(total), 0) as total
                FROM rv_ventas
                WHERE DATE(fecha) = CURDATE() 
                AND estatus = 'completado'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return floatval($resultado['total']);
    }



    /**
     * Utilidad del día
     * Fórmula: Ventas - Costos de productos - Gastos operativos - (Gastos fijos / 30)
     */
    private function get_utilidad_dia()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        // 1. Ingresos del día
        $ventas = $this->get_ventas_dia();

        // 2. Costos de productos vendidos
        $sql_costos = "SELECT COALESCE(SUM(v.cantidad * p.pr_preciocompra), 0) as costo_total
                       FROM rv_ventas v
                       INNER JOIN rv_productos p ON v.id_producto = p.ID
                       WHERE DATE(v.fecha) = CURDATE()
                       AND v.estatus = 'completado'";

        $stmt = $conectar->prepare($sql_costos);
        $stmt->execute();
        $costos = $stmt->fetch(PDO::FETCH_ASSOC);
        $costo_productos = floatval($costos['costo_total']);

        // 3. Gastos operativos del día
// 3. Gastos operativos del día
        $sql_gastos_op = "SELECT COALESCE(SUM(precio_unitario), 0) as gastos_operativos
                  FROM rv_gastos
                  WHERE DATE(fecha) = CURDATE()
                  AND tipo = 'operativo'";

        $stmt = $conectar->prepare($sql_gastos_op);
        $stmt->execute();
        $gastos_op = $stmt->fetch(PDO::FETCH_ASSOC);
        $gastos_operativos = floatval($gastos_op['gastos_operativos']);

        // 4. Gastos fijos del mes actual divididos entre 30
        $mes_actual = date('n');
        $anio_actual = date('Y');

        $sql_fijos = "SELECT COALESCE(SUM(monto), 0) as gastos_fijos
                      FROM rv_gastos_fijos
                      WHERE mes = ? AND anio = ? 
                      AND estatus = 'pagado'";

        $stmt = $conectar->prepare($sql_fijos);
        $stmt->execute([$mes_actual, $anio_actual]);
        $fijos = $stmt->fetch(PDO::FETCH_ASSOC);
        $gastos_fijos_diarios = floatval($fijos['gastos_fijos']) / 30;

        // 5. Calcular utilidad
        $utilidad = $ventas - $costo_productos - $gastos_operativos - $gastos_fijos_diarios;

        return round($utilidad, 2);
    }

    /**
     * Ventas acumuladas del mes
     */
    private function get_ventas_mes()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT COALESCE(SUM(total), 0) as total
                FROM rv_ventas
                WHERE MONTH(fecha) = MONTH(CURDATE())
                AND YEAR(fecha) = YEAR(CURDATE())
                AND estatus = 'completado'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return floatval($resultado['total']);
    }

    /**
     * Gastos operativos del mes
     */
    private function get_gastos_operativos_mes()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT COALESCE(SUM(precio_unitario), 0) as total
            FROM rv_gastos
            WHERE MONTH(fecha) = MONTH(CURDATE())
            AND YEAR(fecha) = YEAR(CURDATE())
            AND tipo = 'operativo'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return floatval($resultado['total']);
    }
    /**
     * Gastos fijos del mes
     */
    private function get_gastos_fijos_mes()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $mes_actual = date('n');
        $anio_actual = date('Y');

        $sql = "SELECT COALESCE(SUM(monto), 0) as total
                FROM rv_gastos_fijos
                WHERE mes = ? AND anio = ?
                AND estatus = 'pagado'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute([$mes_actual, $anio_actual]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return floatval($resultado['total']);
    }

    /**
     * Utilidad del mes
     */
    private function get_utilidad_mes()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        // 1. Ventas del mes
        $ventas = $this->get_ventas_mes();

        // 2. Costos de productos vendidos en el mes
        $sql_costos = "SELECT COALESCE(SUM(v.cantidad * p.pr_preciocompra), 0) as costo_total
                       FROM rv_ventas v
                       INNER JOIN rv_productos p ON v.id_producto = p.ID
                       WHERE MONTH(v.fecha) = MONTH(CURDATE())
                       AND YEAR(v.fecha) = YEAR(CURDATE())
                       AND v.estatus = 'completado'";

        $stmt = $conectar->prepare($sql_costos);
        $stmt->execute();
        $costos = $stmt->fetch(PDO::FETCH_ASSOC);
        $costo_productos = floatval($costos['costo_total']);

        // 3. Gastos operativos del mes
        $gastos_operativos = $this->get_gastos_operativos_mes();

        // 4. Gastos fijos del mes
        $gastos_fijos = $this->get_gastos_fijos_mes();

        // 5. Calcular utilidad
        $utilidad = $ventas - $costo_productos - $gastos_operativos - $gastos_fijos;

        return round($utilidad, 2);
    }

    /**
     * Estado actual de la caja
     */
    private function get_estado_caja()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT 
                    id,
                    fecha_apertura,
                    monto_apertura,
                    estatus
                FROM rv_apertura_caja
                WHERE estatus = 'activa'
                ORDER BY fecha_apertura DESC
                LIMIT 1";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $caja = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($caja) {
            return [
                'estado' => 'abierta',
                'hora_apertura' => $caja['fecha_apertura'],
                'monto_apertura' => floatval($caja['monto_apertura'])
            ];
        }

        return [
            'estado' => 'cerrada',
            'hora_apertura' => null,
            'monto_apertura' => 0
        ];
    }

    /**
     * Total de platillos/productos vendidos en el día
     */
    private function get_platillos_vendidos_dia()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT COALESCE(SUM(cantidad), 0) as total_platillos
                FROM rv_ventas
                WHERE DATE(fecha) = CURDATE() 
                AND estatus = 'completado'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return intval($resultado['total_platillos']);
    }

    /**
     * Total de órdenes pendientes en cocina
     */
    private function get_ordenes_en_cocina()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT COUNT(DISTINCT ticket) as ordenes_pendientes
                FROM rv_ventas
                WHERE estatus = 'pendiente' OR estatus = 'en preparacion'";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return intval($resultado['ordenes_pendientes']);
    }

    /**
     * Mantiene la función original de ventas de últimos 7 días para la gráfica
     */
    public function get_ventas_ultimos_7_dias()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT 
                    DATE(fecha) as dia, 
                    SUM(total) as total_dia
                FROM rv_ventas
                WHERE fecha >= CURDATE() - INTERVAL 6 DAY
                AND estatus = 'completado'
                GROUP BY DATE(fecha)
                ORDER BY DATE(fecha) ASC";

        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Mantiene la función de últimas ventas con productos
     */
    public function get_ultimas_ventas_con_productos()
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql_tickets = "SELECT DISTINCT ticket
                        FROM rv_ventas
                        WHERE estatus = 'completado'
                        ORDER BY fecha DESC
                        LIMIT 5";
        $stmt_tickets = $conectar->prepare($sql_tickets);
        $stmt_tickets->execute();
        $tickets = $stmt_tickets->fetchAll(PDO::FETCH_ASSOC);

        $ventas_agrupadas = [];

        foreach ($tickets as $t) {
            $ticket_id = $t['ticket'];

            $sql_info = "SELECT total_ticket, metodo_pago, TIME(fecha) as hora_venta, estatus
                         FROM rv_ventas
                         WHERE ticket = ? AND estatus = 'completado'
                         LIMIT 1";
            $stmt_info = $conectar->prepare($sql_info);
            $stmt_info->bindValue(1, $ticket_id);
            $stmt_info->execute();
            $info_ticket = $stmt_info->fetch(PDO::FETCH_ASSOC);

            $sql_productos = "SELECT producto, cantidad
                              FROM rv_ventas
                              WHERE ticket = ? AND estatus = 'completado'";
            $stmt_productos = $conectar->prepare($sql_productos);
            $stmt_productos->bindValue(1, $ticket_id);
            $stmt_productos->execute();
            $productos = $stmt_productos->fetchAll(PDO::FETCH_ASSOC);

            if ($info_ticket) {
                $ventas_agrupadas[] = [
                    "ticket" => $ticket_id,
                    "total_ticket" => $info_ticket['total_ticket'],
                    "metodo_pago" => $info_ticket['metodo_pago'],
                    "hora_venta" => $info_ticket['hora_venta'],
                    "estatus" => $info_ticket['estatus'],
                    "productos" => $productos
                ];
            }
        }

        return $ventas_agrupadas;
    }
}
?>