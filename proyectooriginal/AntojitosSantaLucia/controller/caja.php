<?php
require_once("../config/conexion.php");
require_once("../models/Caja.php");
// 🔹 Eliminar require_once("../models/CierreCaja.php"); si estaba aquí, no es necesario.

$caja = new Caja();

switch ($_GET["op"]) {
    case "listar_productos":
        $datos = $caja->get_productos();
        echo json_encode($datos);
        break;

    case "get_ingredientes_modal":
        $datos = $caja->get_ingredientes_para_modal();
        echo json_encode($datos);
        break;

    // ▲▲▲ FIN DEL NUEVO CÓDIGO ▲▲▲
    }
    
?>
