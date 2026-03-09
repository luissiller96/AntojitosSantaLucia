-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 25-02-2026 a las 22:01:29
-- Versión del servidor: 11.8.3-MariaDB-log
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u240307858_snackrocket`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rv_ingredientes`
--

CREATE TABLE `rv_ingredientes` (
  `ingrediente_id` int(11) NOT NULL,
  `nombre_ingrediente` varchar(255) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `rv_ingredientes`
--

INSERT INTO `rv_ingredientes` (`ingrediente_id`, `nombre_ingrediente`, `categoria`, `unidad_medida`) VALUES
(1, 'Cebolla', 'Verduras', 'gramos'),
(2, 'Tomate', 'Verduras', 'gramos'),
(3, 'Lechuga', 'Verduras', 'gramos'),
(4, 'Pepinillos', 'Verduras', 'gramos'),
(5, 'Aguacate', 'Verduras', 'gramos'),
(6, 'Mayonesa', 'Aderezos', 'gramos'),
(7, 'Catsup', 'Aderezos', 'gramos'),
(8, 'Mostaza', 'Aderezos', 'gramos'),
(9, 'Salsa', 'Aderezos', 'gramos'),
(10, 'Aderezo Ranch', 'Aderezos', 'gramos'),
(11, 'Queso Extra', 'Otros', 'rebanada'),
(12, 'Tocino', 'Otros', 'tiras'),
(13, 'Papas fritas', 'Otros', 'gramos');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `rv_ingredientes`
--
ALTER TABLE `rv_ingredientes`
  ADD PRIMARY KEY (`ingrediente_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `rv_ingredientes`
--
ALTER TABLE `rv_ingredientes`
  MODIFY `ingrediente_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
