<?php
require_once("../config/conexion.php");

class Devoluciones extends Conectar
{
    /**
     * Obtiene todos los productos de una venta por su número de ticket,
     * siempre y cuando la venta no haya sido cancelada previamente.
     */
public function get_venta_by_ticket($ticket_id)
{
    $conectar = parent::Conexion();
    parent::set_names();
    // Consulta final y corregida, uniendo rv_ventas.vendedor con tm_empleado.emp_id
    $sql = "SELECT v.*, e.emp_nombre as vendedor 
            FROM rv_ventas v
            JOIN tm_empleado e ON v.vendedor = e.emp_id
            WHERE v.ticket = ? AND v.estatus = 'completado'";
    $stmt = $conectar->prepare($sql);
    $stmt->bindValue(1, $ticket_id);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
    /**
     * Cambia el estatus de todos los registros de un ticket a 'cancelado'.
     */
    public function cancelar_venta($ticket_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        $sql = "UPDATE rv_ventas SET estatus = 'cancelado' WHERE ticket = ?";
        $stmt = $conectar->prepare($sql);
        $stmt->bindValue(1, $ticket_id);
        $stmt->execute();
        return $stmt->rowCount() > 0; // Devuelve true si se afectaron filas, false si no.
    }

    /**
     * Registra una devolución en la nueva tabla rv_devoluciones.
     */
    public function registrar_devolucion($ticket_id, $motivo, $usu_id)
    {
        $conectar = parent::Conexion();
        parent::set_names();
        $sql = "INSERT INTO rv_devoluciones (ticket_id, motivo, usu_id, fecha_devolucion) 
                VALUES (?, ?, ?, NOW())";
        $stmt = $conectar->prepare($sql);
        $stmt->bindValue(1, $ticket_id);
        $stmt->bindValue(2, $motivo);
        $stmt->bindValue(3, $usu_id);
        return $stmt->execute();
    }

    public function verificarTokenGlobal($token_ingresado) {
    // Reutilizamos la función que ya creamos en el modelo Usuario
    $usuarioModel = new Usuario();
    $datos_token_actual = $usuarioModel->obtenerTokenGlobal();

    if ($datos_token_actual && $datos_token_actual['token'] === $token_ingresado) {
        return true; // El token coincide
    }
    return false; // No coincide o no se encontró
}
}
?>