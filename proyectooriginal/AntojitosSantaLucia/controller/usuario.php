<?php
require_once("../config/conexion.php");
require_once("../models/Usuario.php");

if (empty($_POST["id"]) && !empty($_COOKIE["recordar_usu_nom"]) && !empty($_COOKIE["recordar_pass"])) {
    $_POST["id"] = $_COOKIE["recordar_usu_nom"];
    $_POST["password"] = $_COOKIE["recordar_pass"];
}

$usuario = new Usuario();

switch ($_GET["op"]) {
    case "login":
        if (!empty($_POST["id"]) && !empty($_POST["password"])) {
            $usu_nom = $_POST["id"];
            $password = $_POST["password"];
            $recordarme = isset($_POST["remember"]) && $_POST["remember"] == "true";

            $resultado = $usuario->login($usu_nom, $password);

            if ($resultado) {
                session_start();
                $_SESSION["usu_id"] = $resultado["usu_id"];
                $_SESSION["usu_nom"] = $resultado["usu_nom"];
                $_SESSION["usu_correo"] = $resultado["usu_correo"];

                $miCajero = $usuario->getMiCajero();
                if (!empty($miCajero)) {
                    $_SESSION["emp_id"] = $miCajero[0]["emp_id"];
                    $_SESSION["emp_puesto"] = "Cajero";
                }

                if ($recordarme) {
                    // Guardar en cookies por 30 días
                    setcookie("recordar_usu_nom", $usu_nom, time() + (86400 * 30), "/");
                    setcookie("recordar_pass", $password, time() + (86400 * 30), "/");
                } else {
                    setcookie("recordar_usu_nom", "", time() - 3600, "/");
                    setcookie("recordar_pass", "", time() - 3600, "/");
                }

                echo json_encode(["status" => "success", "message" => "Inicio de sesión correcto"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Campos vacíos"]);
        }
        break;

    case "logout":
        session_start();
        session_destroy();
        echo json_encode(["status" => "success", "message" => "Sesión cerrada"]);
        break;
}
?>