<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once("../config/conexion.php");
require_once("../models/Insumos.php");

$insumos = new Insumos();
$op = isset($_GET["op"]) ? $_GET["op"] : '';
$usu_id_sesion = isset($_SESSION["usu_id"]) ? $_SESSION["usu_id"] : null;

switch($op) {
    
    case "listar":
        $datos = $insumos->get_insumos();
        echo json_encode($datos !== false ? $datos : []);
        break;
    
    case "mostrar":
        $datos = $insumos->get_insumo_por_id($_POST["id"]);
        echo json_encode($datos);
        break;
    
    case "guardaryeditar":
        $nombre = isset($_POST["nombre"]) ? trim($_POST["nombre"]) : '';
        $descripcion = isset($_POST["descripcion"]) ? trim($_POST["descripcion"]) : '';
        $unidad = isset($_POST["unidad_medida"]) ? trim($_POST["unidad_medida"]) : '';
        $stock_actual = isset($_POST["stock_actual"]) ? floatval($_POST["stock_actual"]) : 0;
        $stock_minimo = isset($_POST["stock_minimo"]) ? floatval($_POST["stock_minimo"]) : 0;
        $costo_unitario = isset($_POST["costo_unitario"]) ? floatval($_POST["costo_unitario"]) : 0;
        $estatus = isset($_POST["estatus"]) ? intval($_POST["estatus"]) : 1;

        if ($nombre === '' || $unidad === '') {
            echo json_encode([
                "status" => "error",
                "message" => "El nombre y la unidad de medida son obligatorios."
            ]);
            break;
        }

        if (empty($_POST["id"])) {
            // Insertar nuevo insumo
            $resultado = $insumos->insert_insumo(
                $nombre,
                $descripcion,
                $unidad,
                $stock_actual,
                $stock_minimo,
                $costo_unitario
            );
            
            if ($resultado) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Insumo registrado correctamente"
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Error al registrar el insumo"
                ]);
            }
        } else {
            // Actualizar insumo existente
            $resultado = $insumos->update_insumo(
                $_POST["id"],
                $nombre,
                $descripcion,
                $unidad,
                $stock_minimo,
                $costo_unitario,
                $estatus
            );
            
            if ($resultado) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Insumo actualizado correctamente"
                ]);
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Error al actualizar el insumo"
                ]);
            }
        }
        break;
    
    case "eliminar":
        $resultado = $insumos->delete_insumo($_POST["id"]);
        if ($resultado) {
            echo json_encode([
                "status" => "success",
                "message" => "Insumo eliminado correctamente"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Error al eliminar el insumo"
            ]);
        }
        break;
    
    case "registrar_entrada":
        $resultado = $insumos->registrar_entrada(
            $_POST["insumo_id"],
            floatval($_POST["cantidad"]),
            $_POST["motivo"],
            $usu_id_sesion
        );
        
        if ($resultado) {
            echo json_encode([
                "status" => "success",
                "message" => "Entrada registrada correctamente"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Error al registrar la entrada"
            ]);
        }
        break;
    
    case "ajustar_stock":
        $resultado = $insumos->ajustar_stock(
            $_POST["insumo_id"],
            $_POST["nuevo_stock"],
            $_POST["motivo"]
        );
        
        if ($resultado) {
            echo json_encode([
                "status" => "success",
                "message" => "Stock ajustado correctamente"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Error al ajustar el stock"
            ]);
        }
        break;
    
    case "bajo_stock":
        $datos = $insumos->get_insumos_bajo_stock();
        echo json_encode($datos);
        break;
    
    case "movimientos":
        $datos = $insumos->get_movimientos_insumo($_POST["insumo_id"]);
        echo json_encode($datos);
        break;
}
?>
