<?php
require_once("../config/conexion.php");
require_once("../models/Usuario.php"); // Reutilizamos el modelo

$usuario = new Usuario();

switch ($_GET["op"]) {
    case "get_token":
        $datos = $usuario->obtenerTokenGlobal();
        if ($datos) {
            // Empaquetamos en JSON para que el frontend lo lea
            echo json_encode(["status" => "success", "token" => $datos["token"]]);
        } else {
            echo json_encode(["status" => "error", "message" => "No se pudo obtener el token."]);
        }
        break;
}
?>