<?php
require_once("../config/conexion.php");
require_once("../models/Reportes.php");

$reportes = new Reportes();

if (isset($_GET["op"])) {
    switch ($_GET["op"]) {
        case 'get_utilidades':
            if (!isset($_GET["fechaInicio"]) || !isset($_GET["fechaFin"])) {
                echo json_encode(["error" => "Fechas no proporcionadas"]);
                return;
            }

            $fechaInicio = $_GET["fechaInicio"];
            $fechaFin = $_GET["fechaFin"];
            $utilidades = $reportes->getUtilidadesPorFecha($fechaInicio, $fechaFin);

            $totalUtilidad = 0;
            foreach ($utilidades as $item) {
                $totalUtilidad += $item['utilidad_total_por_producto'];
            }

            echo json_encode(['detalle' => $utilidades, 'total_utilidad' => $totalUtilidad]);
            break;
    }
}
?>