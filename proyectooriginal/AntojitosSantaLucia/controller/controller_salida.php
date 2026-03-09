<?php
// controller/controller_salida.php
require_once("../config/conexion.php");
require_once("../models/Salida.php");
require_once("../models/Productos.php"); 

$salida = new Salida();

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action'])) {
    $action = $_POST['action'];

    switch ($action) {
           case 'registrar_gasto':
        // Instanciamos AMBOS modelos que necesitamos.
        $salida = new Salida();
        $productos = new Productos(); 
        
        // Iniciamos una transacción para asegurar que todas las operaciones se completen con éxito.
        $db = $salida->get_conectar(); // Asumimos que tienes un método para obtener la conexión PDO
        $db->beginTransaction();

        try {
            $tipo_gasto = $_POST['tipo_gasto'];
            $comentario = $_POST['comentario'] ?? '';
            $productos_afectados_total = 0;

            if ($tipo_gasto === 'insumo' && !empty($_POST['insumos'])) {
                // Iteramos sobre cada insumo comprado
                foreach ($_POST['insumos'] as $insumo_data) {
                    $id_insumo = intval($insumo_data['id']);
                    $cantidad = floatval($insumo_data['cantidad']);
                    $precio_unitario = floatval($insumo_data['monto']);

                    // 1. Actualizamos el stock Y el precio del insumo usando la nueva función.
                    $salida->actualizarInsumoPorCompra($id_insumo, $cantidad, $precio_unitario);

                    // 2. Registramos el gasto en el historial.
                    $insumo_info = $productos->get_insumo_by_id($id_insumo); // Obtenemos el nombre para la descripción
                    $descripcion_gasto = "Compra de " . $insumo_info['nombre'];
                    $salida->agregarGasto($tipo_gasto, $descripcion_gasto, $comentario, $id_insumo, $cantidad, $precio_unitario);

                    // 3. ✨ INICIA LA CADENA DE ACTUALIZACIÓN DE COSTOS ✨
                    // Buscamos todos los productos que usan este insumo.
                    $productos_a_recalcular = $productos->obtener_productos_por_insumo($id_insumo);

                    if (!empty($productos_a_recalcular)) {
                        // Recalculamos el costo para cada producto afectado.
                        foreach ($productos_a_recalcular as $producto_id) {
                            $productos->recalcular_costo_producto($producto_id);
                        }
                        $productos_afectados_total += count($productos_a_recalcular);
                    }
                }
                
                // Mensaje de éxito detallado
                $message = "Compra registrada con éxito.";
                if ($productos_afectados_total > 0) {
                    $message .= " Se actualizaron los costos de {$productos_afectados_total} producto(s) afectado(s).";
                }

            } else {
                // Lógica para otros tipos de gastos (sin cambios)
                $descripcion = $_POST['descripcion'];
                $monto = $_POST['monto'];
                $salida->agregarGasto($tipo_gasto, $descripcion, $comentario, null, 1, $monto);
                $message = "Gasto registrado correctamente.";
            }

            // Si todo salió bien, confirmamos los cambios en la base de datos.
            $db->commit();
            echo json_encode(['status' => 'success', 'message' => $message]);

        } catch (Exception $e) {
            // Si algo falla, revertimos todos los cambios.
            $db->rollBack();
            echo json_encode(['status' => 'error', 'message' => 'Error: ' . $e->getMessage()]);
        }
        break;

        case 'obtener_gastos':
            $gastos = $salida->obtenerUltimosGastos();
            echo json_encode($gastos);
            break;
    }
}
?>