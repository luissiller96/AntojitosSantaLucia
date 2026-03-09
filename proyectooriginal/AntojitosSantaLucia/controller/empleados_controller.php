<?php
require_once("../config/conexion.php");
require_once("../models/Empleados.php");

$empleados = new Empleados();

switch ($_GET["op"]) {
    case "listar":
        $datos = $empleados->listar_empleados_con_usuarios();
        $data = [];

        foreach ($datos as $row) {
            $data[] = [
                $row["emp_nombre"],
                $row["emp_puesto"],
                $row["usu_nom"] ?? "<em>Sin usuario</em>",
                $row["usu_puesto"] ?? "-",
                $row["usu_empresa"] ?? "-",
                $row["emp_estatus"] == 1 ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>',
                '<button class="btn btn-sm btn-primary" onclick="editarEmpleado(' . $row["emp_id"] . ')"><i class="fa fa-edit"></i></button>',
                '<button class="btn btn-sm btn-danger" onclick="eliminarEmpleado(' . $row["emp_id"] . ')"><i class="fa fa-trash"></i></button>',
                is_null($row["usu_id"])
                    ? '<button class="btn btn-sm btn-secondary" onclick="crearUsuario(' . $row["emp_id"] . ')">Crear Usuario</button>'
                    : ''
            ];
        }

        echo json_encode([
            "sEcho" => 1,
            "iTotalRecords" => count($data),
            "iTotalDisplayRecords" => count($data),
            "aaData" => $data
        ]);
        break;

    case "guardar_empleado":
        $emp_id = $_POST["emp_id"] ?? null;
        $nombre = $_POST["emp_nombre"];
        $puesto = $_POST["emp_puesto"];
        $sucursal = $_POST["sucursal_id"];

        if (empty($emp_id)) {
            $empleados->insertar_empleado($nombre, $puesto, $sucursal);
            echo json_encode(["status" => "success", "message" => "Empleado registrado correctamente"]);
        } else {
            $empleados->actualizar_empleado($emp_id, $nombre, $puesto, $sucursal);
            echo json_encode(["status" => "success", "message" => "Empleado actualizado correctamente"]);
        }
        break;

    case "eliminar_empleado":
        $empleados->eliminar_empleado($_POST["emp_id"]);
        echo json_encode(["status" => "success", "message" => "Empleado dado de baja"]);
        break;

    case "crear_usuario":
        $emp_id = $_POST["emp_id"];
        $usu_nom = $_POST["usu_nom"];
        $usu_pass = $_POST["usu_pass"];
        $usu_puesto = $_POST["usu_puesto"];
        $usu_empresa = $_POST["usu_empresa"];

        $empleados->crear_usuario($emp_id, $usu_nom, $usu_pass, $usu_puesto, $usu_empresa);
        echo json_encode(["status" => "success", "message" => "Usuario creado y vinculado"]);
        break;

    case "mostrar":
        $datos = $empleados->mostrar_empleado($_POST["emp_id"]);
        echo json_encode($datos[0]);
        break;

    case "sucursales":
        $result = $empleados->obtener_sucursales();
        echo json_encode($result);
        break;
}