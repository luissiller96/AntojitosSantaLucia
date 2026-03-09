<?php
header('Content-Type: application/json');
require_once("../models/Dashboard.php");

$dashboard = new Dashboard();

$op = $_GET["op"] ?? '';

switch ($op) {
    
    case "get_dashboard_data":
        try {
            $datos = [
                "kpis" => $dashboard->get_kpis_completos(),
                "ventas_semana" => $dashboard->get_ventas_ultimos_7_dias(),
                "ultimas_ventas" => $dashboard->get_ultimas_ventas_con_productos()
            ];
            echo json_encode([
                "status" => "success",
                "data" => $datos
            ]);
        } catch (Exception $e) {
            error_log("Error en get_dashboard_data: " . $e->getMessage());
            echo json_encode([
                "status" => "error",
                "message" => "Error al cargar datos del dashboard"
            ]);
        }
        break;
    
    default:
        echo json_encode([
            "status" => "error",
            "message" => "Operación no válida"
        ]);
        break;
}
?>