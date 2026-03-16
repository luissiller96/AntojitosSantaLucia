-- MySQL dump 10.13  Distrib 8.0.45, for macos15 (arm64)
--
-- Host: localhost    Database: db_antojitossantalucia
-- ------------------------------------------------------
-- Server version	8.4.6-0ubuntu0.25.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clientes_licencias`
--

DROP TABLE IF EXISTS `clientes_licencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes_licencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_autorizacion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estatus` enum('activo','inactivo','suspendido_por_pago') COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `fecha_proximo_pago` date NOT NULL,
  `contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_sync_exitoso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_empresa` (`nombre_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes_licencias`
--

LOCK TABLES `clientes_licencias` WRITE;
/*!40000 ALTER TABLE `clientes_licencias` DISABLE KEYS */;
INSERT INTO `clientes_licencias` VALUES (1,'Antojitos Santa Lucia','SU_TOKEN_REMPLAZAR','activo','2026-04-16','Luis Siller','2026-03-09 16:17:37','2026-03-16 00:52:41');
/*!40000 ALTER TABLE `clientes_licencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `corp_estatus`
--

DROP TABLE IF EXISTS `corp_estatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `corp_estatus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dia_corte` int NOT NULL DEFAULT '30' COMMENT 'Día referencial de corte',
  `estatus` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 = Mostrar Banner (No pagado), 1 = Ocultar Banner (Pagado)',
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corp_estatus`
--

LOCK TABLES `corp_estatus` WRITE;
/*!40000 ALTER TABLE `corp_estatus` DISABLE KEYS */;
INSERT INTO `corp_estatus` VALUES (1,30,1,'2026-02-22 20:35:29');
/*!40000 ALTER TABLE `corp_estatus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_apertura_caja`
--

DROP TABLE IF EXISTS `rv_apertura_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_apertura_caja`
--

LOCK TABLES `rv_apertura_caja` WRITE;
/*!40000 ALTER TABLE `rv_apertura_caja` DISABLE KEYS */;
INSERT INTO `rv_apertura_caja` VALUES (1,'2026-03-06 11:13:22',100.00,1,NULL,NULL,NULL,NULL,'activa',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'2026-02-25 19:53:42',500.00,1,NULL,NULL,NULL,NULL,'activa',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `rv_apertura_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_categorias`
--

DROP TABLE IF EXISTS `rv_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rv_categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_categorias`
--

LOCK TABLES `rv_categorias` WRITE;
/*!40000 ALTER TABLE `rv_categorias` DISABLE KEYS */;
INSERT INTO `rv_categorias` VALUES (1,'Platillos','Platillos fuertes','2026-02-25 04:31:18'),(2,'Adicionales','Guarniciones y extras','2026-02-25 04:31:18'),(3,'Bebidas','Refrescos y aguas','2026-02-25 04:31:18'),(4,'Mixto',NULL,'2026-02-25 16:42:41');
/*!40000 ALTER TABLE `rv_categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_comanda`
--

DROP TABLE IF EXISTS `rv_comanda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_comanda`
--

LOCK TABLES `rv_comanda` WRITE;
/*!40000 ALTER TABLE `rv_comanda` DISABLE KEYS */;
INSERT INTO `rv_comanda` VALUES (17,1,'2026-02-25 19:54:32',3,14,'Sope (Mixta)',NULL,NULL,'en_preparacion',NULL),(18,1,'2026-02-25 19:54:32',1,15,'Flauta (Mixta)',NULL,NULL,'en_preparacion',NULL),(19,1,'2026-02-25 19:54:32',1,16,'Taco (Mixta)',NULL,NULL,'en_preparacion',NULL),(20,2,'2026-02-25 19:59:46',4,14,'Sope (Mixta)',NULL,NULL,'pendiente',NULL),(21,2,'2026-02-25 19:59:46',4,15,'Flauta (Mixta)',NULL,NULL,'pendiente',NULL),(22,2,'2026-02-25 19:59:46',2,16,'Taco (Mixta)',NULL,NULL,'pendiente',NULL),(23,3,'2026-02-25 20:08:00',1,6,'Sopes de Chicharrón (4 pzs)',NULL,NULL,'pendiente',NULL),(24,4,'2026-02-25 23:14:17',4,14,'Sope (Mixta)',NULL,NULL,'pendiente',NULL),(25,4,'2026-02-25 23:14:17',2,15,'Flauta (Mixta)',NULL,NULL,'pendiente',NULL),(26,4,'2026-02-25 23:14:17',2,16,'Taco (Mixta)',NULL,NULL,'pendiente',NULL),(27,5,'2026-02-25 23:16:26',1,14,'Sope (Mixta)',NULL,NULL,'pendiente',NULL),(28,5,'2026-02-25 23:16:26',1,15,'Flauta (Mixta)',NULL,NULL,'pendiente',NULL),(29,5,'2026-02-25 23:16:27',2,16,'Taco (Mixta)',NULL,NULL,'pendiente',NULL),(30,6,'2026-02-25 23:19:03',1,14,'Sope (Mixta)',NULL,NULL,'pendiente',NULL),(31,6,'2026-02-25 23:19:03',1,15,'Flauta (Mixta)',NULL,NULL,'pendiente',NULL),(32,6,'2026-02-25 23:19:03',3,17,'Enchilada (Mixta)',NULL,NULL,'pendiente',NULL),(33,7,'2026-02-26 17:29:13',1,2,'Enchiladas (6 pzs) - Con cebolla',NULL,NULL,'pendiente',NULL),(34,8,'2026-02-26 17:30:20',2,6,'Sopes de Chicharrón (4 pzs)',NULL,NULL,'pendiente',NULL),(35,8,'2026-02-26 17:30:20',1,3,'Flautas de Res (5 pzs)',NULL,NULL,'pendiente',NULL),(36,9,'2026-02-26 17:31:33',3,3,'Flautas de Res (5 pzs)',NULL,NULL,'pendiente',NULL),(37,9,'2026-02-26 17:31:33',2,14,'Sope (Mixta)',NULL,NULL,'pendiente',NULL),(38,9,'2026-02-26 17:31:33',2,15,'Flauta (Mixta)',NULL,NULL,'pendiente',NULL),(39,9,'2026-02-26 17:31:33',1,16,'Taco (Mixta)',NULL,NULL,'pendiente',NULL),(40,9,'2026-02-26 17:31:33',3,15,'Flauta (Mixta)',NULL,NULL,'pendiente',NULL),(41,10,'2026-02-26 18:00:53',2,14,'Sope (Mixta)',NULL,NULL,'pendiente',NULL),(42,10,'2026-02-26 18:00:53',1,15,'Flauta (Mixta)',NULL,NULL,'pendiente',NULL),(43,10,'2026-02-26 18:00:53',1,16,'Taco (Mixta)',NULL,NULL,'pendiente',NULL),(44,10,'2026-02-26 18:00:53',1,14,'Sope (Mixta)',NULL,NULL,'pendiente',NULL),(45,10,'2026-02-26 18:00:54',2,15,'Flauta (Mixta)',NULL,NULL,'pendiente',NULL),(46,10,'2026-02-26 18:00:54',3,16,'Taco (Mixta)',NULL,NULL,'pendiente',NULL),(47,11,'2026-02-26 18:23:08',1,3,'Flautas de Res (5 pzs)',NULL,NULL,'pendiente',NULL),(48,22,'2026-03-09 14:57:31',1,3,'Flautas de Res (5 pzs)',NULL,NULL,'pendiente',NULL),(49,23,'2026-03-09 14:58:43',1,3,'Flautas de Res (5 pzs)',NULL,NULL,'pendiente',NULL),(50,24,'2026-03-09 15:00:13',1,6,'Sopes de Chicharrón (4 pzs)',NULL,NULL,'pendiente',NULL),(51,26,'2026-03-09 16:05:29',1,6,'Sopes de Chicharrón (4 pzs)',NULL,NULL,'pendiente',NULL),(52,27,'2026-03-09 16:06:25',1,6,'Sopes de Chicharrón (4 pzs)',NULL,NULL,'pendiente',NULL),(53,28,'2026-03-09 16:08:18',1,6,'Sopes de Chicharrón (4 pzs)',NULL,NULL,'pendiente',NULL);
/*!40000 ALTER TABLE `rv_comanda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_config`
--

DROP TABLE IF EXISTS `rv_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rv_config` (
  `id` int NOT NULL DEFAULT '1',
  `last_comanda_update_timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_config`
--

LOCK TABLES `rv_config` WRITE;
/*!40000 ALTER TABLE `rv_config` DISABLE KEYS */;
INSERT INTO `rv_config` VALUES (1,'2026-03-09 16:08:18');
/*!40000 ALTER TABLE `rv_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_devoluciones`
--

DROP TABLE IF EXISTS `rv_devoluciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rv_devoluciones` (
  `dev_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `motivo` text NOT NULL,
  `usu_id` int NOT NULL COMMENT 'ID del usuario que procesó la devolución',
  `fecha_devolucion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`dev_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_devoluciones`
--

LOCK TABLES `rv_devoluciones` WRITE;
/*!40000 ALTER TABLE `rv_devoluciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `rv_devoluciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_gastos`
--

DROP TABLE IF EXISTS `rv_gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_gastos`
--

LOCK TABLES `rv_gastos` WRITE;
/*!40000 ALTER TABLE `rv_gastos` DISABLE KEYS */;
INSERT INTO `rv_gastos` VALUES (2,'corte_preventivo','CORTE PREVENTIVO CAJA','2026-02-26 17:32:59','Realizado por: Caja',1500.00,'operativo','efectivo',NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `rv_gastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_gastos_fijos`
--

DROP TABLE IF EXISTS `rv_gastos_fijos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_gastos_fijos`
--

LOCK TABLES `rv_gastos_fijos` WRITE;
/*!40000 ALTER TABLE `rv_gastos_fijos` DISABLE KEYS */;
/*!40000 ALTER TABLE `rv_gastos_fijos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_gastos_fijos_plantilla`
--

DROP TABLE IF EXISTS `rv_gastos_fijos_plantilla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_gastos_fijos_plantilla`
--

LOCK TABLES `rv_gastos_fijos_plantilla` WRITE;
/*!40000 ALTER TABLE `rv_gastos_fijos_plantilla` DISABLE KEYS */;
/*!40000 ALTER TABLE `rv_gastos_fijos_plantilla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_ingredientes`
--

DROP TABLE IF EXISTS `rv_ingredientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rv_ingredientes` (
  `ingrediente_id` int NOT NULL AUTO_INCREMENT,
  `nombre_ingrediente` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidad_medida` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ingrediente_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_ingredientes`
--

LOCK TABLES `rv_ingredientes` WRITE;
/*!40000 ALTER TABLE `rv_ingredientes` DISABLE KEYS */;
INSERT INTO `rv_ingredientes` VALUES (1,'Cebolla','Verduras','gramos',1),(2,'Tomate','Verduras','gramos',1),(3,'Lechuga','Verduras','gramos',1),(4,'Pepinillos','Verduras','gramos',1),(5,'Aguacate','Verduras','gramos',1),(6,'Mayonesa','Aderezos','gramos',1),(7,'Catsup','Aderezos','gramos',1),(8,'Mostaza','Aderezos','gramos',1),(9,'Salsa','Aderezos','gramos',1),(10,'Aderezo Ranch','Aderezos','gramos',1),(11,'Queso','Otros','rebanada',1),(12,'Tocino','Otros','tiras',1),(13,'Papas fritas','Otros','gramos',1);
/*!40000 ALTER TABLE `rv_ingredientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_insumos`
--

DROP TABLE IF EXISTS `rv_insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rv_insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `unidad_medida` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'unidad, paquete, caja, kg, litro, etc',
  `stock_actual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_minimo` decimal(10,2) DEFAULT '0.00',
  `costo_unitario` decimal(10,2) DEFAULT '0.00',
  `estatus` tinyint(1) DEFAULT '1' COMMENT '1=Activo, 0=Inactivo',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_estatus` (`estatus`),
  KEY `idx_stock` (`stock_actual`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_insumos`
--

LOCK TABLES `rv_insumos` WRITE;
/*!40000 ALTER TABLE `rv_insumos` DISABLE KEYS */;
/*!40000 ALTER TABLE `rv_insumos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_movimientos_insumos`
--

DROP TABLE IF EXISTS `rv_movimientos_insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rv_movimientos_insumos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `insumo_id` int NOT NULL,
  `tipo_movimiento` enum('entrada','salida','ajuste') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `stock_anterior` decimal(10,2) NOT NULL,
  `stock_nuevo` decimal(10,2) NOT NULL,
  `motivo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_movimientos_insumos`
--

LOCK TABLES `rv_movimientos_insumos` WRITE;
/*!40000 ALTER TABLE `rv_movimientos_insumos` DISABLE KEYS */;
/*!40000 ALTER TABLE `rv_movimientos_insumos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_producto_componentes`
--

DROP TABLE IF EXISTS `rv_producto_componentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_producto_componentes`
--

LOCK TABLES `rv_producto_componentes` WRITE;
/*!40000 ALTER TABLE `rv_producto_componentes` DISABLE KEYS */;
/*!40000 ALTER TABLE `rv_producto_componentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_producto_insumos`
--

DROP TABLE IF EXISTS `rv_producto_insumos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_producto_insumos`
--

LOCK TABLES `rv_producto_insumos` WRITE;
/*!40000 ALTER TABLE `rv_producto_insumos` DISABLE KEYS */;
/*!40000 ALTER TABLE `rv_producto_insumos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_productos`
--

DROP TABLE IF EXISTS `rv_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de todos los productos y platillos que se venden.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_productos`
--

LOCK TABLES `rv_productos` WRITE;
/*!40000 ALTER TABLE `rv_productos` DISABLE KEYS */;
INSERT INTO `rv_productos` (`ID`, `pr_PLU`, `pr_nombre`, `pr_descripcion`, `pr_imagen`, `pr_precioventa`, `pr_preciocompra`, `pr_stock`, `categoria_id`, `sucursal_id`, `pr_promocion_porcentaje`, `pr_preciooriginal`, `pr_estatus`, `es_platillo`, `pr_totalventas`, `pr_favorito`, `pr_stock_minimo`) VALUES (1,NULL,'Enchiladas (6 pzs) - Sin cebolla',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,0,0,10),(2,NULL,'Enchiladas (6 pzs) - Con cebolla',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,1,0,10),(3,NULL,'Flautas de Res (5 pzs)',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,7,0,10),(4,NULL,'Tacos Dorados de Deshebrada (5 pzs)',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,0,0,10),(5,NULL,'Tacos Suaves de Deshebrada (5 pzs)',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,0,0,10),(6,NULL,'Sopes de Chicharrón (4 pzs)',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,7,0,10),(7,NULL,'Sopes de Deshebrada (4 pzs)',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,0,0,10),(8,NULL,'Sopes de Picadillo (4 pzs)',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,0,0,10),(9,NULL,'Sopes de Frijoles con Queso (4 pzs)',NULL,NULL,90.00,0.00,NULL,1,1,0.00,NULL,1,1,0,0,10),(10,NULL,'Orden de Papa',NULL,NULL,40.00,0.00,NULL,2,1,0.00,NULL,1,1,0,0,10),(11,NULL,'Guacamole Extra',NULL,NULL,20.00,0.00,NULL,2,1,0.00,NULL,1,1,0,0,10),(12,NULL,'Refresco',NULL,NULL,25.00,0.00,99,3,1,0.00,NULL,1,0,1,0,10),(13,NULL,'Orden Mixta','','',0.00,0.00,NULL,4,1,0.00,0.00,1,0,0,0,10),(14,NULL,'Sope (Mixta)',NULL,NULL,23.00,0.00,NULL,1,1,0.00,NULL,1,1,18,0,10),(15,NULL,'Flauta (Mixta)',NULL,NULL,18.00,0.00,NULL,1,1,0.00,NULL,1,1,17,0,10),(16,NULL,'Taco (Mixta)',NULL,NULL,18.00,0.00,NULL,1,1,0.00,NULL,1,1,12,0,10),(17,NULL,'Enchilada (Mixta)',NULL,NULL,18.00,0.00,NULL,1,1,0.00,NULL,1,1,3,0,10);
/*!40000 ALTER TABLE `rv_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_sucursales`
--

DROP TABLE IF EXISTS `rv_sucursales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rv_sucursales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_sucursal` varchar(100) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_sucursales`
--

LOCK TABLES `rv_sucursales` WRITE;
/*!40000 ALTER TABLE `rv_sucursales` DISABLE KEYS */;
INSERT INTO `rv_sucursales` VALUES (1,'Mitras pte','Varenna 209, 66036 Mitras Poniente, N.L., México\n',NULL);
/*!40000 ALTER TABLE `rv_sucursales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rv_ventas`
--

DROP TABLE IF EXISTS `rv_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `tipo_orden` varchar(50) DEFAULT 'llevar',
  `sensor_num` varchar(50) DEFAULT NULL,
  `direccion` text,
  `costo_envio` decimal(10,2) DEFAULT '0.00',
  `monto_efectivo` decimal(10,2) DEFAULT '0.00',
  `monto_tarjeta` decimal(10,2) DEFAULT '0.00',
  `monto_transferencia` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rv_ventas`
--

LOCK TABLES `rv_ventas` WRITE;
/*!40000 ALTER TABLE `rv_ventas` DISABLE KEYS */;
INSERT INTO `rv_ventas` VALUES (17,1,'2026-02-25 19:54:29',3,14,'Sope (Mixta)',7,'efectivo',69.00,105.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(18,1,'2026-02-25 19:54:29',1,15,'Flauta (Mixta)',7,'efectivo',18.00,105.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(19,1,'2026-02-25 19:54:29',1,16,'Taco (Mixta)',7,'efectivo',18.00,105.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(20,2,'2026-02-25 19:59:44',4,14,'Sope (Mixta)',7,'efectivo',92.00,200.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(21,2,'2026-02-25 19:59:44',4,15,'Flauta (Mixta)',7,'efectivo',72.00,200.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(22,2,'2026-02-25 19:59:44',2,16,'Taco (Mixta)',7,'efectivo',36.00,200.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(23,3,'2026-02-25 20:07:59',1,6,'Sopes de Chicharrón (4 pzs)',7,'transferencia',90.00,90.00,'jose','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(24,4,'2026-02-25 23:14:15',4,14,'Sope (Mixta)',7,'efectivo',92.00,164.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(25,4,'2026-02-25 23:14:15',2,15,'Flauta (Mixta)',7,'efectivo',36.00,164.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(26,4,'2026-02-25 23:14:15',2,16,'Taco (Mixta)',7,'efectivo',36.00,164.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(27,5,'2026-02-25 23:16:20',1,14,'Sope (Mixta)',7,'efectivo',23.00,77.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(28,5,'2026-02-25 23:16:20',1,15,'Flauta (Mixta)',7,'efectivo',18.00,77.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(29,5,'2026-02-25 23:16:20',2,16,'Taco (Mixta)',7,'efectivo',36.00,77.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(30,6,'2026-02-25 23:19:00',1,14,'Sope (Mixta)',7,'efectivo',23.00,95.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(31,6,'2026-02-25 23:19:00',1,15,'Flauta (Mixta)',7,'efectivo',18.00,95.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(32,6,'2026-02-25 23:19:00',3,17,'Enchilada (Mixta)',7,'efectivo',54.00,95.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(33,7,'2026-02-26 17:29:13',1,2,'Enchiladas (6 pzs) - Con cebolla',7,'efectivo',90.00,90.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(34,8,'2026-02-26 17:30:19',2,6,'Sopes de Chicharrón (4 pzs)',7,'transferencia',180.00,270.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(35,8,'2026-02-26 17:30:19',1,3,'Flautas de Res (5 pzs)',7,'transferencia',90.00,270.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(36,9,'2026-02-26 17:31:30',3,3,'Flautas de Res (5 pzs)',7,'efectivo',270.00,424.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(37,9,'2026-02-26 17:31:30',2,14,'Sope (Mixta)',7,'efectivo',46.00,424.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(38,9,'2026-02-26 17:31:30',2,15,'Flauta (Mixta)',7,'efectivo',36.00,424.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(39,9,'2026-02-26 17:31:30',1,16,'Taco (Mixta)',7,'efectivo',18.00,424.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(40,9,'2026-02-26 17:31:30',3,15,'Flauta (Mixta)',7,'efectivo',54.00,424.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(41,10,'2026-02-26 18:00:50',2,14,'Sope (Mixta)',7,'efectivo',46.00,195.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(42,10,'2026-02-26 18:00:50',1,15,'Flauta (Mixta)',7,'efectivo',18.00,195.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(43,10,'2026-02-26 18:00:50',1,16,'Taco (Mixta)',7,'efectivo',18.00,195.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(44,10,'2026-02-26 18:00:50',1,14,'Sope (Mixta)',7,'efectivo',23.00,195.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(45,10,'2026-02-26 18:00:50',2,15,'Flauta (Mixta)',7,'efectivo',36.00,195.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(46,10,'2026-02-26 18:00:50',3,16,'Taco (Mixta)',7,'efectivo',54.00,195.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(47,11,'2026-02-26 18:23:07',1,3,'Flautas de Res (5 pzs)',7,'efectivo',90.00,90.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(48,12,'2026-03-06 17:34:49',1,3,'Flautas de Res (5 pzs)',1,'efectivo',90.00,130.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(49,12,'2026-03-06 17:34:49',1,10,'Orden de Papa',1,'efectivo',40.00,130.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(50,13,'2026-03-06 17:48:28',1,6,'Sopes de Chicharrón (4 pzs)',1,'efectivo',90.00,90.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(51,14,'2026-03-06 17:50:07',1,12,'Refresco',1,'tarjeta',25.00,184.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(52,14,'2026-03-06 17:50:07',3,14,'Sope (Mixta)',1,'tarjeta',69.00,184.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(53,14,'2026-03-06 17:50:07',3,15,'Flauta (Mixta)',1,'tarjeta',54.00,184.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(54,14,'2026-03-06 17:50:07',1,16,'Taco (Mixta)',1,'tarjeta',18.00,184.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(55,14,'2026-03-06 17:50:07',1,17,'Enchilada (Mixta)',1,'tarjeta',18.00,184.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(56,15,'2026-03-06 17:50:49',4,14,'Sope (Mixta)',1,'tarjeta',92.00,128.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(57,15,'2026-03-06 17:50:49',2,17,'Enchilada (Mixta)',1,'tarjeta',36.00,128.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(58,16,'2026-03-06 18:16:31',1,9,'Sopes de Frijoles con Queso (4 pzs)',1,'transferencia',90.00,190.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(59,16,'2026-03-06 18:16:31',2,14,'Sope (Mixta)',1,'transferencia',46.00,190.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(60,16,'2026-03-06 18:16:31',3,17,'Enchilada (Mixta)',1,'transferencia',54.00,190.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(61,17,'2026-03-06 18:18:59',1,12,'Refresco',1,'efectivo',25.00,25.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(62,18,'2026-03-06 19:28:50',1,15,'Flauta (Mixta)',2,'efectivo',18.00,18.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(63,19,'2026-03-06 19:31:59',1,8,'Sopes de Picadillo (4 pzs)',2,'efectivo',90.00,90.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(64,20,'2026-03-06 19:33:28',1,12,'Refresco',2,'efectivo',25.00,115.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(65,20,'2026-03-06 19:33:28',1,9,'Sopes de Frijoles con Queso (4 pzs)',2,'efectivo',90.00,115.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(66,21,'2026-03-09 15:49:36',1,8,'Sopes de Picadillo (4 pzs)',2,'tarjeta',90.00,180.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(67,21,'2026-03-09 15:49:36',1,8,'Sopes de Picadillo (4 pzs)',2,'tarjeta',90.00,180.00,NULL,'completado','desktop','llevar',NULL,NULL,0.00,0.00,0.00,0.00),(68,22,'2026-03-09 14:57:30',1,3,'Flautas de Res (5 pzs)',7,'tarjeta',90.00,90.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(69,23,'2026-03-09 14:58:42',1,3,'Flautas de Res (5 pzs)',7,'tarjeta',90.00,90.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(70,24,'2026-03-09 15:00:12',1,6,'Sopes de Chicharrón (4 pzs)',7,'tarjeta',90.00,90.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(71,25,'2026-03-09 16:03:49',1,12,'Refresco',7,'tarjeta',25.00,25.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(72,26,'2026-03-09 16:05:28',1,6,'Sopes de Chicharrón (4 pzs)',7,'tarjeta',90.00,90.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(73,27,'2026-03-09 16:06:24',1,6,'Sopes de Chicharrón (4 pzs)',7,'tarjeta',90.00,90.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00),(74,28,'2026-03-09 16:08:18',1,6,'Sopes de Chicharrón (4 pzs)',7,'tarjeta',90.00,90.00,'','completado',NULL,'llevar',NULL,NULL,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `rv_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tm_empleado`
--

DROP TABLE IF EXISTS `tm_empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tm_empleado`
--

LOCK TABLES `tm_empleado` WRITE;
/*!40000 ALTER TABLE `tm_empleado` DISABLE KEYS */;
INSERT INTO `tm_empleado` VALUES (1,'Antojitos','Admin',1,1,1),(7,'Cajas','Cajero',1,NULL,1);
/*!40000 ALTER TABLE `tm_empleado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tm_usuario`
--

DROP TABLE IF EXISTS `tm_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tm_usuario`
--

LOCK TABLES `tm_usuario` WRITE;
/*!40000 ALTER TABLE `tm_usuario` DISABLE KEYS */;
INSERT INTO `tm_usuario` VALUES (1,'Antojitos','',NULL,'4dmin','Antojitos Santa Lucia','Admin','laurel.jpg',1),(3,'caja',NULL,NULL,'c4j4','Antojitos Santa Lucia','Cajero',NULL,1);
/*!40000 ALTER TABLE `tm_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_global`
--

DROP TABLE IF EXISTS `token_global`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_global` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(4) NOT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_global`
--

LOCK TABLES `token_global` WRITE;
/*!40000 ALTER TABLE `token_global` DISABLE KEYS */;
INSERT INTO `token_global` VALUES (1,'8603','2026-03-09 21:00:00');
/*!40000 ALTER TABLE `token_global` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vf_corp`
--

DROP TABLE IF EXISTS `vf_corp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vf_corp` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `corporacion` varchar(255) DEFAULT NULL,
  `fechapago` date DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `nivel` int DEFAULT NULL,
  `estatus` int DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vf_corp`
--

LOCK TABLES `vf_corp` WRITE;
/*!40000 ALTER TABLE `vf_corp` DISABLE KEYS */;
/*!40000 ALTER TABLE `vf_corp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_resumen_gastos_mensuales`
--

DROP TABLE IF EXISTS `vw_resumen_gastos_mensuales`;
/*!50001 DROP VIEW IF EXISTS `vw_resumen_gastos_mensuales`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_resumen_gastos_mensuales` AS SELECT 
 1 AS `anio`,
 1 AS `mes`,
 1 AS `total_renta`,
 1 AS `total_sueldos`,
 1 AS `total_servicios`,
 1 AS `total_otros`,
 1 AS `total_gastos_fijos`,
 1 AS `promedio_diario`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_resumen_gastos_mensuales`
--

/*!50001 DROP VIEW IF EXISTS `vw_resumen_gastos_mensuales`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`remote_user`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_resumen_gastos_mensuales` AS select `gf`.`anio` AS `anio`,`gf`.`mes` AS `mes`,coalesce(sum((case when (`gf`.`categoria` = 'Renta') then `gf`.`monto` else 0 end)),0) AS `total_renta`,coalesce(sum((case when (`gf`.`categoria` = 'Sueldos') then `gf`.`monto` else 0 end)),0) AS `total_sueldos`,coalesce(sum((case when (`gf`.`categoria` = 'Servicios') then `gf`.`monto` else 0 end)),0) AS `total_servicios`,coalesce(sum((case when (`gf`.`categoria` = 'Otro') then `gf`.`monto` else 0 end)),0) AS `total_otros`,coalesce(sum(`gf`.`monto`),0) AS `total_gastos_fijos`,coalesce((sum(`gf`.`monto`) / 30),0) AS `promedio_diario` from `rv_gastos_fijos` `gf` where (`gf`.`estatus` = 'pagado') group by `gf`.`anio`,`gf`.`mes` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-15 19:41:44
