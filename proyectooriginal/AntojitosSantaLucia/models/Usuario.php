
<?php
class Usuario extends Conectar
{
// Reemplaza tu función login() actual por esta en models/Usuario.php

public function login($id, $password, $remember = false)
{
    $conectar = parent::Conexion();
    parent::set_names();

    // Verificación de campos vacíos
    if (empty($id) || empty($password)) {
        header("Location: ../index.php?m=2");
        exit();
    }

    // 1. Se valida que el usuario y la contraseña existan en la tabla de logins
    $sql_user = "SELECT * FROM tm_usuario WHERE usu_nom = ? AND est = 1";
    $stmt_user = $conectar->prepare($sql_user);
    $stmt_user->bindValue(1, $id); // $id ahora representa el nombre de usuario
    $stmt_user->execute();
    $usuario = $stmt_user->fetch(PDO::FETCH_ASSOC);

    // 2. Si las credenciales de login son correctas...
    if ($usuario && $usuario["usu_pass"] === $password) {
        
        // 3. ...buscamos su perfil de empleado correspondiente en la nueva tabla
        // ✅ MODIFICACIÓN: Se añade la columna sucursal_id a la consulta
        $sql_emp = "SELECT emp_id, emp_nombre, emp_puesto, sucursal_id FROM tm_empleado WHERE usu_id = ? AND emp_estatus = 1";
        $stmt_emp = $conectar->prepare($sql_emp);
        $stmt_emp->bindValue(1, $usuario["usu_id"]);
        $stmt_emp->execute();
        $empleado = $stmt_emp->fetch(PDO::FETCH_ASSOC);

        // 4. Si se encuentra un empleado activo, creamos la sesión completa
        // ✅ MODIFICACIÓN: Verificamos también que el empleado tenga una sucursal asignada
        if ($empleado && !empty($empleado["sucursal_id"])) {
            session_regenerate_id(true);
            
            // Guardamos los datos importantes en la sesión
            $_SESSION["usu_id"] = $usuario["usu_id"];
            $_SESSION["emp_id"] = $empleado["emp_id"];
            $_SESSION["emp_nombre"] = $empleado["emp_nombre"];
            $_SESSION["emp_puesto"] = $empleado["emp_puesto"];
            
            // ✅ NUEVO: Guardamos el ID de la sucursal en la sesión. ¡Este es el paso clave!
            // Este ID se usará en todo el sistema para filtrar datos.
            $_SESSION["sucursal_id"] = $empleado["sucursal_id"];

            $_SESSION["usu_correo"] = $usuario["usu_correo"];

            // 5. Se genera y guarda el nuevo token global
            $this->generarYGuardarTokenGlobal();

            // 6. Se maneja la cookie de "Recuérdame"
            if ($remember) {
                setcookie("remembered_user", $id, time() + (30 * 24 * 60 * 60), "/");
            } else {
                setcookie("remembered_user", "", time() - 3600, "/");
            }

            // 7. Finalmente, se redirige al dashboard
            header("Location: pages/dashboard.php");
            exit();

        } else if ($empleado && empty($empleado["sucursal_id"])) {
            // El empleado existe pero no tiene una sucursal asignada
            header("Location: ../index.php?m=5"); // Error: Empleado sin sucursal
            exit();
        } else {
            // El usuario de login existe pero no tiene un perfil de empleado activo
            header("Location: ../index.php?m=4"); // Error: Perfil de empleado no encontrado o inactivo
            exit();
        }
    }

    // Si el usuario o la contraseña del paso 1 son incorrectos
    header("Location: ../index.php?m=1"); // Error: Credenciales incorrectas
    exit();
}

public function getMiCajero()
{
    $conectar = parent::Conexion();
    parent::set_names();

    $sql = "SELECT emp_id, emp_nombre 
            FROM tm_empleado 
            WHERE usu_id = ? AND sucursal_id = ? AND emp_estatus = 1";

    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(1, $_SESSION["usu_id"]);
    $stmt->bindValue(2, $_SESSION["sucursal_id"]);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

public function getCajerosActivos()
{
    $conectar = parent::Conexion();
    parent::set_names();
    // Aseguramos que seleccionamos emp_id
    $sql = "SELECT emp_id, emp_nombre FROM tm_empleado WHERE emp_puesto = 'Cajero' AND emp_estatus = 1 AND sucursal_id = ?";
    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(1, $_SESSION["sucursal_id"]);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

     public function getUsuarioById($usu_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        
        $sql = "SELECT usu_id, usu_nom FROM tm_usuario WHERE usu_id = ? AND sucursal_id = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->bindValue(1, $usu_id);
        $stmt->bindValue(2, $_SESSION["sucursal_id"]);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Dentro de la clase Usuario en models/Usuario.php

/**
 * Genera un nuevo token y sobrescribe el token global en la base de datos.
 */
public function generarYGuardarTokenGlobal()
{
    $token = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    
    $conectar = parent::conexion();
    parent::set_names();

    $sql = "UPDATE token_global SET token = ? WHERE id = 1";
    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(1, $token);
    $stmt->execute();
}

/**
 * Obtiene el token global actual de la base de datos.
 */
public function obtenerTokenGlobal()
{
    $conectar = parent::conexion();
    parent::set_names();
    $sql = "SELECT token FROM token_global WHERE id = 1";
    $sql = $conectar->prepare($sql);
    $sql->execute();
    return $sql->fetch(PDO::FETCH_ASSOC);
}


public function getEmpleadoById($emp_id)
{
    $conectar = parent::Conexion();
    parent::set_names();
    
    // Esta función busca en la tabla de empleados por su ID de empleado (emp_id)
    $sql = "SELECT emp_id, emp_nombre FROM tm_empleado WHERE emp_id = ? AND sucursal_id = ?";
    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(1, $emp_id);
    $stmt->bindValue(2, $_SESSION["sucursal_id"]);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
}
} 
?>