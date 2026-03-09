<?php
require_once("../config/conexion.php");

class Reportes extends Conectar
{
  public function getVentasPorProducto($fechaInicio, $fechaFin)
  {
    $conectar = parent::Conexion();
    parent::set_names();
    $sql = "SELECT pr_nombre, SUM(cantidad) AS cantidad_vendida, SUM(total) AS total_vendido FROM rv_ventas INNER JOIN rv_productos ON rv_ventas.id_producto = rv_productos.ID WHERE fecha BETWEEN :fechaInicio AND :fechaFin GROUP BY pr_nombre";
    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(':fechaInicio', $fechaInicio);
    $stmt->bindValue(':fechaFin', $fechaFin);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getVentasPorTicket($fechaInicio, $fechaFin)
  {
    $conectar = parent::Conexion();
    parent::set_names();
    $sql = "SELECT ticket, fecha, SUM(total) as total_vendido FROM rv_ventas WHERE fecha BETWEEN :fechaInicio AND :fechaFin GROUP BY ticket, fecha ORDER BY fecha ASC";
    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(':fechaInicio', $fechaInicio);
    $stmt->bindValue(':fechaFin', $fechaFin);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getVentasPorFecha($fechaInicio, $fechaFin)
  {
    $conectar = parent::Conexion();
    parent::set_names();
    $sql = "SELECT DATE(fecha) as fecha, ticket, producto, cantidad, SUM(total) as total_vendido 
        FROM rv_ventas 
        WHERE DATE(fecha) BETWEEN :fechaInicio AND :fechaFin 
        GROUP BY DATE(fecha), ticket, producto 
        ORDER BY fecha ASC";
    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(':fechaInicio', $fechaInicio);
    $stmt->bindValue(':fechaFin', $fechaFin);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getProductosMasVendidos()
  {
    $conectar = parent::Conexion();
    parent::set_names();

    // ✅ CONSULTA FINAL CORREGIDA CON LA TABLA DE CATEGORÍAS
    $sql = "SELECT 
              p.pr_nombre AS producto,
              c.nombre AS categoria, -- Obtenemos el nombre de la tabla de categorías
              p.pr_totalventas AS unidades_vendidas,
              IFNULL(SUM(v.total), 0) AS total_vendido
          FROM 
              rv_productos p
          LEFT JOIN 
              rv_ventas v ON p.ID = v.id_producto
          LEFT JOIN -- Añadimos la unión a la nueva tabla de categorías
              rv_categorias c ON p.categoria_id = c.id
          GROUP BY 
              p.ID, p.pr_nombre, c.nombre, p.pr_totalventas
          ORDER BY 
              p.pr_totalventas DESC
          LIMIT 10";

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
  
  public function getVentasPorFechaPDF($fechaInicio, $fechaFin)
  {
    $conectar = parent::Conexion();
    parent::set_names();

    // ✅ CAMBIO: Aquí también hacemos JOIN con tm_empleado
    $sql = "SELECT 
                    ticket,
                    DATE_FORMAT(fecha, '%Y-%m-%d %H:%i') AS fecha_formateada,
                    producto,
                    cantidad,
                    total AS total_vendido,
                    e.emp_nombre AS vendedor
                FROM rv_ventas v
                LEFT JOIN tm_empleado e ON v.vendedor = e.emp_id
                WHERE DATE(fecha) BETWEEN :fechaInicio AND :fechaFin 
                ORDER BY fecha ASC";

    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(':fechaInicio', $fechaInicio);
    $stmt->bindValue(':fechaFin', $fechaFin);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getUltimasVentas($filtro)
  {
    $conectar = parent::Conexion();
    parent::set_names();

    // ✅ CAMBIO: Ahora hacemos JOIN con tm_empleado y usamos emp_nombre
    $sql = "SELECT v.ticket, v.fecha, v.producto, v.cantidad, v.metodo_pago, v.total, e.emp_nombre AS vendedor
            FROM rv_ventas v
            LEFT JOIN tm_empleado e ON v.vendedor = e.emp_id"; // <-- JOIN con tm_empleado en emp_id

    if ($filtro === "tarjeta") {
      $sql .= " WHERE v.metodo_pago = 'tarjeta'";
    } elseif ($filtro === "efectivo") {
      $sql .= " WHERE v.metodo_pago = 'efectivo'";
    } elseif ($filtro === "transferencia") {
      $sql .= " WHERE v.metodo_pago = 'transferencia'";
    }

    $sql .= " ORDER BY v.fecha DESC LIMIT 100"; // Aumenté el límite a 100 por si acaso
    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getVentasSemanales()
  {
    $conectar = parent::Conexion();
    parent::set_names();

    // 🔹 Obtener ventas de los últimos 7 días con formato dd/MM/aaaa
    $sql = "SELECT 
                    DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha,  -- 📌 Formato dd/MM/aaaa
                    SUM(total) AS total_vendido
                FROM rv_ventas
                WHERE DATE(fecha) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY DATE(fecha)
                ORDER BY DATE(fecha) ASC";

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return $resultados; // 📌 Devuelve los datos en el orden correcto
  }
  public function getListaProductos()
  {
    $conectar = parent::Conexion();
    parent::set_names();

    $sql = "SELECT pr_PLU, pr_nombre, pr_precioventa, pr_descripcion, pr_estatus, pr_stock 
                FROM rv_productos
                ORDER BY pr_nombre ASC"; // Ordenar por nombre

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function ventas_ticket($fechaInicio, $fechaFin)
  {
    $conectar = parent::Conexion();
    parent::set_names();

    $sql = "SELECT ticket, DATE(fecha) as fecha, MAX(total_ticket) AS total_vendido
                FROM rv_ventas
                WHERE DATE(fecha) BETWEEN :fechaInicio AND :fechaFin
                  AND estatus = 'completado'
                GROUP BY ticket, DATE(fecha)
                ORDER BY fecha ASC";

    $stmt = $conectar->prepare($sql);
    $stmt->bindParam(':fechaInicio', $fechaInicio);
    $stmt->bindParam(':fechaFin', $fechaFin);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getVentasPorDia($fechaInicio, $fechaFin)
  {
    $conectar = parent::Conexion();
    parent::set_names();

    $sql = "SELECT 
                    DATE_FORMAT(fecha, '%d/%m') AS dia, 
                    SUM(total) AS total_vendido
                FROM rv_ventas
                WHERE DATE(fecha) BETWEEN :fechaInicio AND :fechaFin
                GROUP BY DATE(fecha)
                ORDER BY DATE(fecha) ASC";

    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(':fechaInicio', $fechaInicio);
    $stmt->bindValue(':fechaFin', $fechaFin);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getHistorialDevoluciones()
  {
    $conectar = parent::Conexion();
    parent::set_names();
    
    $sql = "SELECT 
                d.dev_id, 
                d.ticket_id, 
                d.motivo, 
                DATE_FORMAT(d.fecha_devolucion, '%d/%m/%Y %H:%i') as fecha_devolucion_f,
                u.usu_nom as usuario,
                MAX(v.total_ticket) as monto_ticket,
                GROUP_CONCAT(CONCAT(v.cantidad, 'x ', v.producto) SEPARATOR '|') as productos_devueltos
            FROM 
                rv_devoluciones d
            JOIN 
                tm_usuario u ON d.usu_id = u.usu_id
            LEFT JOIN 
                rv_ventas v ON d.ticket_id = v.ticket
            GROUP BY 
                d.dev_id, d.ticket_id, d.motivo, d.fecha_devolucion, u.usu_nom
            ORDER BY 
                d.fecha_devolucion DESC";

    $stmt = $conectar->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getCierreCaja($fechaInicio, $fechaFin)
  {
    $conectar = parent::Conexion();
    parent::set_names();
    
    /*
     * Se reescribe la consulta para evitar el uso de subconsultas correlacionadas en el SELECT,
     * que parecen ser la causa del problema. Ahora se usa un LEFT JOIN con una subconsulta
     * que pre-calcula los totales por método de pago para cada cierre de caja.
     */
    $sql = "SELECT 
                ac.id,
                ac.fecha_apertura,
                ac.monto_apertura,
                ac.fecha_cierre,
                ac.monto_cierre,
                ac.total_ventas_sistema,
                ac.diferencia_cierre,
                ac.estatus,
                IFNULL(sales.total_efectivo, 0) as total_efectivo,
                IFNULL(sales.total_tarjeta, 0) as total_tarjeta,
                IFNULL(sales.total_transferencia, 0) as total_transferencia
            FROM 
                rv_apertura_caja ac
            LEFT JOIN (
                SELECT 
                    a.id as apertura_id,
                    SUM(CASE WHEN v.metodo_pago = 'efectivo' THEN v.total ELSE 0 END) as total_efectivo,
                    SUM(CASE WHEN v.metodo_pago = 'tarjeta' THEN v.total ELSE 0 END) as total_tarjeta,
                    SUM(CASE WHEN v.metodo_pago = 'transferencia' THEN v.total ELSE 0 END) as total_transferencia
                FROM 
                    rv_apertura_caja a
                JOIN 
                    rv_ventas v ON v.fecha BETWEEN a.fecha_apertura AND a.fecha_cierre
                WHERE 
                    v.estatus = 'completado'
                GROUP BY 
                    a.id
            ) AS sales ON ac.id = sales.apertura_id
            WHERE 
                DATE(ac.fecha_apertura) >= :fechaInicio
                AND DATE(ac.fecha_apertura) <= :fechaFin
                AND ac.estatus = 'cerrada'
            ORDER BY 
                ac.fecha_apertura DESC";

    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(':fechaInicio', $fechaInicio);
    $stmt->bindValue(':fechaFin', $fechaFin);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getResumenCaja($fechaInicio, $fechaFin)
  {
    $conectar = parent::Conexion();
    parent::set_names();
    $sql = "SELECT 
                (SELECT SUM(total) FROM rv_ventas WHERE metodo_pago = 'efectivo' AND DATE(fecha) BETWEEN :f1 AND :f2 AND estatus = 'completado') as total_efectivo,
                (SELECT SUM(total) FROM rv_ventas WHERE metodo_pago = 'tarjeta' AND DATE(fecha) BETWEEN :f3 AND :f4 AND estatus = 'completado') as total_tarjeta,
                (SELECT SUM(total) FROM rv_ventas WHERE metodo_pago = 'transferencia' AND DATE(fecha) BETWEEN :f7 AND :f8 AND estatus = 'completado') as total_transferencia,
                (SELECT SUM(monto_cierre) FROM rv_apertura_caja WHERE estatus = 'cerrada' AND DATE(fecha_apertura) BETWEEN :f5 AND :f6) as total_general";

    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(':f1', $fechaInicio);
    $stmt->bindValue(':f2', $fechaFin);
    $stmt->bindValue(':f3', $fechaInicio);
    $stmt->bindValue(':f4', $fechaFin);
    $stmt->bindValue(':f5', $fechaInicio);
    $stmt->bindValue(':f6', $fechaFin);
    $stmt->bindValue(':f7', $fechaInicio);
    $stmt->bindValue(':f8', $fechaFin);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function getVentasAgrupadas($fechaInicio, $fechaFin, $filtroPago)
  {
    $conectar = parent::Conexion();
    parent::set_names();

    // Construcción de la consulta base
    $sql = "SELECT 
                v.ticket,
                MAX(v.fecha) as fecha,
                MAX(v.metodo_pago) as metodo_pago,
                MAX(e.emp_nombre) as vendedor,
                SUM(v.cantidad) as total_productos,
                MAX(v.total_ticket) as total_ticket,
                GROUP_CONCAT(
                    CONCAT(v.cantidad, 'x ', v.producto, ' ($', v.total, ')') 
                    SEPARATOR '|'
                ) as productos_detalle
            FROM rv_ventas v
            LEFT JOIN tm_empleado e ON v.vendedor = e.emp_id
            WHERE DATE(v.fecha) BETWEEN :fechaInicio AND :fechaFin AND v.estatus = 'completado'";

    // Añadir filtro de método de pago si no es 'todas'
    if ($filtroPago !== 'todas') {
        $sql .= " AND v.metodo_pago = :filtroPago";
    }

    $sql .= " GROUP BY v.ticket ORDER BY MAX(v.fecha) DESC";

    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(':fechaInicio', $fechaInicio);
    $stmt->bindValue(':fechaFin', $fechaFin);

    if ($filtroPago !== 'todas') {
        $stmt->bindValue(':filtroPago', $filtroPago);
    }

    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
  
    public function getVentaParaTicket($ticketId)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        // 1. Obtener la información principal de la venta
        $sql_main = "SELECT 
                        v.ticket as ticket_id,
                        MAX(v.fecha) as fecha,
                        MAX(v.total_ticket) as total_ticket,
                        MAX(e.emp_nombre) as vendedor_nombre
                    FROM rv_ventas v
                    LEFT JOIN tm_empleado e ON v.vendedor = e.emp_id
                    WHERE v.ticket = :ticketId
                    GROUP BY v.ticket";

        $stmt_main = $conectar->prepare($sql_main);
        $stmt_main->bindValue(':ticketId', $ticketId);
        $stmt_main->execute();
        $venta = $stmt_main->fetch(PDO::FETCH_ASSOC);

        if (!$venta) {
            return null; // Si no hay venta, retorna null
        }

        // 2. Obtener los productos de esa venta
        $sql_items = "SELECT
                        producto as nombre,
                        cantidad,
                        total
                    FROM rv_ventas
                    WHERE ticket = :ticketId";

        $stmt_items = $conectar->prepare($sql_items);
        $stmt_items->bindValue(':ticketId', $ticketId);
        $stmt_items->execute();
        $productos = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

        // 3. Combinar los resultados en un solo array
        $venta['productos'] = $productos;

        return $venta;
    }

    // ✅ REPORTE 1: REPORTE DE UTILIDADES
    public function getUtilidadesPorFecha($fechaInicio, $fechaFin)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT
                    v.ticket,
                    DATE(v.fecha) as fecha_venta,
                    v.producto as nombre_producto,
                    v.cantidad,
                    p.pr_precioventa as precio_venta,
                    p.pr_preciocompra as precio_compra,
                    (p.pr_precioventa - p.pr_preciocompra) as utilidad_por_unidad,
                    (v.cantidad * (p.pr_precioventa - p.pr_preciocompra)) as utilidad_total_por_producto
                FROM
                    rv_ventas v
                JOIN
                    rv_productos p ON v.id_producto = p.ID
                WHERE
                    DATE(v.fecha) BETWEEN :fechaInicio AND :fechaFin
                ORDER BY
                    v.fecha ASC";

        $stmt = $conectar->prepare($sql);
        $stmt->bindValue(':fechaInicio', $fechaInicio);
        $stmt->bindValue(':fechaFin', $fechaFin);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ✅ REPORTE 2: REPORTE DE GASTOS (COMPRAS)
    public function getReporteCompras($fechaInicio, $fechaFin)
    {
        $conectar = parent::Conexion();
        parent::set_names();

        $sql = "SELECT
                    rg.fecha,
                    rg.descripcion,
                    ri.nombre AS nombre_insumo,
                    rg.cantidad,
                    ri.medicion AS unidad_medida,
                    rg.precio_unitario,
                    rg.total
                FROM
                    rv_gastos rg
                LEFT JOIN
                    rv_insumos ri ON rg.id_insumo = ri.id
                WHERE
                    DATE(rg.fecha) BETWEEN :fechaInicio AND :fechaFin
                ORDER BY
                    rg.fecha ASC";

        $stmt = $conectar->prepare($sql);
        $stmt->bindValue(':fechaInicio', $fechaInicio);
        $stmt->bindValue(':fechaFin', $fechaFin);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
