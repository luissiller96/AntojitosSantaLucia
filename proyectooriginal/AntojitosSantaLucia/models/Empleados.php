<?php
require_once("../config/conexion.php");

class Empleados extends Conectar
{
    public function listar_empleados_con_usuarios()
    {
        $conectar = parent::Conexion();
        $sql = "SELECT 
                    e.emp_id, e.emp_nombre, e.emp_puesto, e.emp_estatus, e.sucursal_id,
                    u.usu_id, u.usu_nom, u.usu_puesto, u.usu_empresa, u.usu_photoprofile
                FROM tm_empleado e
                LEFT JOIN tm_usuario u ON e.usu_id = u.usu_id
                WHERE e.emp_estatus = 1";
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function insertar_empleado($nombre, $puesto, $sucursal_id)
    {
        $conectar = parent::Conexion();
        $sql = "INSERT INTO tm_empleado (emp_nombre, emp_puesto, emp_estatus, sucursal_id)
                VALUES (?, ?, 1, ?)";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$nombre, $puesto, $sucursal_id]);
    }

    public function actualizar_empleado($id, $nombre, $puesto, $sucursal_id)
    {
        $conectar = parent::Conexion();
        $sql = "UPDATE tm_empleado
                SET emp_nombre = ?, emp_puesto = ?, sucursal_id = ?
                WHERE emp_id = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$nombre, $puesto, $sucursal_id, $id]);
    }

    public function eliminar_empleado($id)
    {
        $conectar = parent::Conexion();
        $sql = "UPDATE tm_empleado SET emp_estatus = 0 WHERE emp_id = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$id]);
    }

    public function crear_usuario($emp_id, $usu_nom, $usu_pass, $usu_puesto, $usu_empresa)
    {
        $conectar = parent::Conexion();

        $sql = "INSERT INTO tm_usuario (usu_nom, usu_pass, usu_puesto, usu_empresa, est)
                VALUES (?, ?, ?, ?, 1)";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$usu_nom, $usu_pass, $usu_puesto, $usu_empresa]);

        $usu_id = $conectar->lastInsertId();

        $sql2 = "UPDATE tm_empleado SET usu_id = ? WHERE emp_id = ?";
        $stmt2 = $conectar->prepare($sql2);
        $stmt2->execute([$usu_id, $emp_id]);
    }
    public function mostrar_empleado($emp_id)
    {
        $conectar = parent::Conexion();
        $sql = "SELECT * FROM tm_empleado WHERE emp_id = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->execute([$emp_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function obtener_sucursales()
    {
        $conectar = parent::Conexion();
        $sql = "SELECT id, nombre_sucursal FROM rv_sucursales";
        $stmt = $conectar->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    }