<?php
// gestorventas/api/get_ventas_hoy.php

// Activar la visualización de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Evitar imprimir HTML antes del JSON
ob_start();

require_once(__DIR__ . "/../models/Ventas.php"); // Incluir el modelo Ventas

try {
    // Crear una instancia del modelo Ventas
    $ventas = new Ventas();

    // Obtener el total de ventas de hoy
    $total_hoy = $ventas->get_total_ventas_hoy();

    $data = array("total_hoy" => $total_hoy);

    header('Content-Type: application/json');
    echo json_encode($data);

} catch (PDOException $e) {
    $error = array("error" => "Error en la consulta: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode($error);

} finally {
    // Limpiar cualquier salida adicional que se haya almacenado en el buffer
    ob_end_flush();
}
?>
