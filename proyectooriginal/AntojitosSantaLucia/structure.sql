SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `corp_estatus`;
CREATE TABLE `corp_estatus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_corte` int NOT NULL DEFAULT '30' COMMENT 'Día referencial de corte',
  `estatus` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = Mostrar Banner (No pagado), 1 = Ocultar Banner (Pagado)',
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rv_apertura_caja`;
CREATE TABLE `rv_apertura_caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_apertura` datetime NOT NULL,
  `monto_apertura` decimal(10,2) NOT NULL,
  `usu_id` int NOT NULL COMMENT 'ID del usuario que abre la caja',
  `fecha_cierre` datetime DEFAULT NULL,
  `monto_cierre` decimal(10,2) DEFAULT NULL COMMENT 'Conteo físico al cierre',
  `total_ventas_sistema` decimal(10,2) DEFAULT NULL COMMENT 'Total ventas según sistema',
  `diferencia_cierre` decimal(10,2) DEFAULT NULL COMMENT 'Diferencia entre físico y sistema',
  `estatus` enum('activa','cerrada') NOT NULL COMMENT 'Estado de la caja: activa o cerrada',
  `usu_id_cierre` int DEFAULT NULL COMMENT 'ID del usuario que cierra la caja',
  `notas_apertura` text COMMENT 'Notas al abrir caja',
  `notas_cierre` text COMMENT 'Observaciones al cerrar caja',
  `ventas_efectivo` decimal(10,2) DEFAULT NULL COMMENT 'Total ventas en efectivo del turno',
  `ventas_tarjeta` decimal(10,2) DEFAULT NULL COMMENT 'Total ventas con tarjeta del turno',
  `ventas_transferencia` decimal(10,2) DEFAULT NULL COMMENT 'Total ventas por transferencia del turno',
  `gastos_efectivo` decimal(10,2) DEFAULT NULL COMMENT 'Total salidas de efectivo del turno',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rv_categorias`;
CREATE TABLE `rv_categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rv_comanda`;
CREATE TABLE `rv_comanda` (
  `com_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL COMMENT 'Referencia al ID del ticket de venta o un identificador único de la venta',
  `com_fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `com_cantidad` int NOT NULL,
  `pr_PLU` int NOT NULL COMMENT 'ID del producto del que se omiten ingredientes',
  `pr_nombre` varchar(255) NOT NULL COMMENT 'Nombre del producto',
  `com_ingredientes_omitir` text COMMENT 'Ingredientes a omitir, formato JSON o texto plano',
  `com_comentarios` text COMMENT 'Observaciones adicionales sobre el pedido',
  `com_estatus` enum('pendiente','en_preparacion','lista','entregada','cancelada') DEFAULT 'pendiente' COMMENT 'Estado de la comanda para cocina',
  `ready_at` datetime DEFAULT NULL,
  PRIMARY KEY (`com_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rv_config`;
CREATE TABLE `rv_config` (
  `id` int NOT NULL DEFAULT '1',
  `last_comanda_update_timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rv_devoluciones`;
CREATE TABLE `rv_devoluciones` (
  `dev_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `motivo` text NOT NULL,
  `usu_id` int NOT NULL COMMENT 'ID del usuario que procesó la devolución',
  `fecha_devolucion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`dev_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rv_gastos`;
CREATE TABLE `rv_gastos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_gasto` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `comentario` text,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `tipo` enum('operativo','insumo') DEFAULT 'operativo' COMMENT 'Tipo de gasto: operativo diario o compra de insumo',
  `metodo_pago` enum('efectivo','tarjeta','transferencia') DEFAULT 'efectivo',
  `tipo_item` enum('producto','insumo') DEFAULT NULL COMMENT 'Tipo: producto o insumo',
  `item_id` int DEFAULT NULL COMMENT 'ID del producto o insumo',
  `cantidad_comprada` decimal(10,2) DEFAULT NULL COMMENT 'Cantidad comprada',
  `usu_id` int DEFAULT NULL COMMENT 'Usuario que registró el gasto',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rv_gastos_fijos`;
CREATE TABLE `rv_gastos_fijos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plantilla_id` int DEFAULT NULL COMMENT 'Referencia a la plantilla si aplica',
  `categoria` enum('Renta','Sueldos','Servicios','Otro') NOT NULL DEFAULT 'Otro',
  `concepto` varchar(255) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `mes` tinyint NOT NULL COMMENT '1-12',
  `anio` year NOT NULL,
  `fecha_pago` date DEFAULT NULL COMMENT 'Fecha real del pago',
  `metodo_pago` enum('efectivo','tarjeta','transferencia') DEFAULT 'transferencia',
  `notas` text,
  `usu_id` int DEFAULT NULL COMMENT 'Usuario que registró',
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `estatus` enum('pendiente','pagado','cancelado') DEFAULT 'pagado',
  PRIMARY KEY (`id`),
  KEY `idx_mes_anio` (`mes`,`anio`),
  KEY `idx_categoria` (`categoria`),
  KEY `fk_plantilla` (`plantilla_id`),
  CONSTRAINT `fk_gasto_fijo_plantilla` FOREIGN KEY (`plantilla_id`) REFERENCES `rv_gastos_fijos_plantilla` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Registro mensual de gastos fijos';

DROP TABLE IF EXISTS `rv_gastos_fijos_plantilla`;
CREATE TABLE `rv_gastos_fijos_plantilla` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria` enum('Renta','Sueldos','Servicios','Otro') NOT NULL DEFAULT 'Otro',
  `concepto` varchar(255) NOT NULL COMMENT 'Ej: Renta Local, Sueldo Gerente, Luz, Agua',
  `monto_base` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Monto típico mensual',
  `descripcion` text,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_concepto` (`concepto`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Plantillas de gastos fijos mensuales recurrentes';

DROP TABLE IF EXISTS `rv_insumos`;
CREATE TABLE `rv_insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `unidad_medida` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'unidad, paquete, caja, kg, litro, etc',
  `stock_actual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_minimo` decimal(10,2) DEFAULT '0.00',
  `costo_unitario` decimal(10,2) DEFAULT '0.00',
  `estatus` tinyint(1) DEFAULT '1' COMMENT '1=Activo, 0=Inactivo',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_estatus` (`estatus`),
  KEY `idx_stock` (`stock_actual`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `rv_movimientos_insumos`;
CREATE TABLE `rv_movimientos_insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `insumo_id` int NOT NULL,
  `tipo_movimiento` enum('entrada','salida','ajuste') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `stock_anterior` decimal(10,2) NOT NULL,
  `stock_nuevo` decimal(10,2) NOT NULL,
  `motivo` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ticket_id` int DEFAULT NULL COMMENT 'ID del ticket si fue por venta',
  `producto_id` int DEFAULT NULL COMMENT 'ID del producto vendido',
  `usuario_id` int DEFAULT '1',
  `fecha_movimiento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_insumo` (`insumo_id`),
  KEY `idx_tipo` (`tipo_movimiento`),
  KEY `idx_fecha` (`fecha_movimiento`),
  KEY `idx_ticket` (`ticket_id`),
  CONSTRAINT `rv_movimientos_insumos_ibfk_1` FOREIGN KEY (`insumo_id`) REFERENCES `rv_insumos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2573 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `rv_producto_componentes`;
CREATE TABLE `rv_producto_componentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_padre_id` int NOT NULL COMMENT 'ID del paquete (Orden 5 Tacos)',
  `producto_componente_id` int NOT NULL COMMENT 'ID del producto individual (Taco)',
  `cantidad_necesaria` decimal(10,2) NOT NULL COMMENT 'Cuántos se necesitan (5)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_producto_componente` (`producto_padre_id`,`producto_componente_id`),
  KEY `producto_componente_id` (`producto_componente_id`),
  CONSTRAINT `rv_producto_componentes_ibfk_1` FOREIGN KEY (`producto_padre_id`) REFERENCES `rv_productos` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `rv_producto_componentes_ibfk_2` FOREIGN KEY (`producto_componente_id`) REFERENCES `rv_productos` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `rv_producto_insumos`;
CREATE TABLE `rv_producto_insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `insumo_id` int NOT NULL,
  `cantidad_necesaria` decimal(10,2) NOT NULL COMMENT 'Cantidad de insumo que necesita 1 unidad del producto',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_producto_insumo` (`producto_id`,`insumo_id`),
  KEY `idx_producto` (`producto_id`),
  KEY `idx_insumo` (`insumo_id`),
  CONSTRAINT `rv_producto_insumos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `rv_productos` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `rv_producto_insumos_ibfk_2` FOREIGN KEY (`insumo_id`) REFERENCES `rv_insumos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `rv_productos`;
CREATE TABLE `rv_productos` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `pr_PLU` varchar(20) DEFAULT NULL,
  `pr_nombre` varchar(255) NOT NULL,
  `pr_descripcion` text,
  `pr_imagen` varchar(255) DEFAULT NULL,
  `pr_precioventa` decimal(10,2) NOT NULL,
  `pr_preciocompra` decimal(10,2) NOT NULL COMMENT 'Costo total calculado (Base + Componentes)',
  `pr_stock` int DEFAULT NULL COMMENT 'Stock solo para productos simples (es_platillo=0)',
  `categoria_id` int DEFAULT NULL,
  `sucursal_id` int DEFAULT NULL,
  `pr_promocion_porcentaje` decimal(5,2) DEFAULT '0.00',
  `pr_preciooriginal` decimal(10,2) DEFAULT NULL,
  `pr_utilidad` decimal(10,2) GENERATED ALWAYS AS ((`pr_precioventa` - `pr_preciocompra`)) VIRTUAL,
  `pr_estatus` tinyint(1) NOT NULL DEFAULT '1',
  `es_platillo` tinyint(1) DEFAULT '0',
  `pr_totalventas` int DEFAULT '0',
  `pr_favorito` int DEFAULT '0',
  `pr_stock_minimo` int DEFAULT '10' COMMENT 'Alerta de stock bajo para reportes',
  PRIMARY KEY (`ID`),
  KEY `fk_producto_categoria_idx` (`categoria_id`),
  KEY `fk_producto_sucursal_idx` (`sucursal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de todos los productos y platillos que se venden.';

DROP TABLE IF EXISTS `rv_sucursales`;
CREATE TABLE `rv_sucursales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_sucursal` varchar(100) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rv_ventas`;
CREATE TABLE `rv_ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket` int NOT NULL,
  `fecha` datetime NOT NULL,
  `cantidad` int NOT NULL,
  `id_producto` int DEFAULT NULL,
  `producto` varchar(255) NOT NULL,
  `vendedor` int NOT NULL,
  `metodo_pago` enum('tarjeta','efectivo','transferencia') DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `total_ticket` decimal(10,2) NOT NULL,
  `cliente` varchar(255) DEFAULT NULL,
  `estatus` enum('completado','cancelado') DEFAULT 'completado',
  `plataforma_origen` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=980 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `tm_empleado`;
CREATE TABLE `tm_empleado` (
  `emp_id` int NOT NULL AUTO_INCREMENT,
  `emp_nombre` varchar(150) NOT NULL,
  `emp_puesto` varchar(50) NOT NULL,
  `emp_estatus` int NOT NULL DEFAULT '1',
  `usu_id` int DEFAULT NULL,
  `sucursal_id` int DEFAULT '1',
  PRIMARY KEY (`emp_id`),
  KEY `fk_usuario` (`usu_id`),
  CONSTRAINT `fk_usuario` FOREIGN KEY (`usu_id`) REFERENCES `tm_usuario` (`usu_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `tm_usuario`;
CREATE TABLE `tm_usuario` (
  `usu_id` int NOT NULL AUTO_INCREMENT,
  `usu_nom` varchar(50) DEFAULT NULL,
  `usu_ape` varchar(50) DEFAULT NULL,
  `usu_correo` varchar(150) DEFAULT NULL,
  `usu_pass` varchar(12) DEFAULT NULL,
  `usu_empresa` varchar(150) DEFAULT NULL,
  `usu_puesto` varchar(35) DEFAULT NULL,
  `usu_photoprofile` varchar(150) DEFAULT NULL,
  `est` int DEFAULT NULL,
  PRIMARY KEY (`usu_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `token_global`;
CREATE TABLE `token_global` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(4) NOT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `vf_corp`;
CREATE TABLE `vf_corp` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `corporacion` varchar(255) DEFAULT NULL,
  `fechapago` date DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `nivel` int DEFAULT NULL,
  `estatus` int DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP VIEW IF EXISTS `vw_resumen_gastos_mensuales`;
CREATE ALGORITHM=UNDEFINED DEFINER=`remote_user`@`%` SQL SECURITY DEFINER VIEW `vw_resumen_gastos_mensuales` AS select `gf`.`anio` AS `anio`,`gf`.`mes` AS `mes`,coalesce(sum((case when (`gf`.`categoria` = 'Renta') then `gf`.`monto` else 0 end)),0) AS `total_renta`,coalesce(sum((case when (`gf`.`categoria` = 'Sueldos') then `gf`.`monto` else 0 end)),0) AS `total_sueldos`,coalesce(sum((case when (`gf`.`categoria` = 'Servicios') then `gf`.`monto` else 0 end)),0) AS `total_servicios`,coalesce(sum((case when (`gf`.`categoria` = 'Otro') then `gf`.`monto` else 0 end)),0) AS `total_otros`,coalesce(sum(`gf`.`monto`),0) AS `total_gastos_fijos`,coalesce((sum(`gf`.`monto`) / 30),0) AS `promedio_diario` from `rv_gastos_fijos` `gf` where (`gf`.`estatus` = 'pagado') group by `gf`.`anio`,`gf`.`mes`;

INSERT INTO `tm_usuario` (`usu_id`, `usu_nom`, `usu_ape`, `usu_correo`, `usu_pass`, `usu_empresa`, `usu_puesto`, `usu_photoprofile`, `est`) VALUES ('1', 'cega', '', NULL, '4dmin', 'CEGA', 'Admin', 'laurel.jpg', '1');
INSERT INTO `tm_usuario` (`usu_id`, `usu_nom`, `usu_ape`, `usu_correo`, `usu_pass`, `usu_empresa`, `usu_puesto`, `usu_photoprofile`, `est`) VALUES ('3', 'caja', NULL, NULL, 'c4j4', 'CEGA', 'Cajero', NULL, '1');

INSERT INTO `tm_empleado` (`emp_id`, `emp_nombre`, `emp_puesto`, `emp_estatus`, `usu_id`, `sucursal_id`) VALUES ('1', 'Tacos Kike', 'Admin', '1', '1', '1');
INSERT INTO `tm_empleado` (`emp_id`, `emp_nombre`, `emp_puesto`, `emp_estatus`, `usu_id`, `sucursal_id`) VALUES ('7', 'Caja', 'Cajero', '1', NULL, '1');

INSERT INTO `rv_sucursales` (`id`, `nombre_sucursal`, `direccion`, `telefono`) VALUES ('1', 'Mitras pte', 'Varenna 209, 66036 Mitras Poniente, N.L., México\n', NULL);

INSERT INTO `corp_estatus` (`id`, `dia_corte`, `estatus`, `fecha_actualizacion`) VALUES ('1', '30', '1', '2026-02-22 20:35:29');

INSERT INTO `rv_config` (`id`, `last_comanda_update_timestamp`) VALUES ('1', '2026-02-22 14:37:18');

INSERT INTO `token_global` (`id`, `token`, `fecha_actualizacion`) VALUES ('1', '6759', '2026-02-22 20:34:34');

SET FOREIGN_KEY_CHECKS=1;

