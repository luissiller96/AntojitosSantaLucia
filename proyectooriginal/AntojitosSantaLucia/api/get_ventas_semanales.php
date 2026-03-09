<?php
// gestorventas/api/get_ventas_semanales.php

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

    // Obtener las ventas de los últimos 7 dias
    $data = $ventas->get_ventas_ultimos_7_dias();

    // Verificar si $data es un array
    if (!is_array($data)) {
        throw new Exception("La función get_ventas_ultimos_7_dias() no devolvió un array.");
    }
    //Verificamos si hay datos
    $fechas_con_ventas = array_column($data, 'fecha_venta');
    // Llenar con ceros los días sin ventas
    for ($i = 6; $i >= 0; $i--) {
        $fecha = date('Y-m-d', strtotime("-$i days"));
        if (!in_array($fecha, $fechas_con_ventas)) {
            $data[] = array(
                "fecha_venta" => $fecha,
                "total_venta" => 0
            );
        }
    }
    //Ordenamos el array
    usort($data, function($a, $b) {
    return strtotime($a["fecha_venta"]) - strtotime($b["fecha_venta"]);
    });

    header('Content-Type: application/json');
    echo json_encode($data);

} catch (PDOException $e) {
    $error = array("error" => "Error en la consulta: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode($error);
} catch(Exception $e){
    $error = array("error" => "Error en la consulta: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode($error);
} finally {
    // Limpiar cualquier salida adicional que se haya almacenado en el buffer
    ob_end_flush();
}
?>
