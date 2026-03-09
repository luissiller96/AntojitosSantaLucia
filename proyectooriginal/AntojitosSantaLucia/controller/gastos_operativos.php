<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once("../config/conexion.php");
require_once("../models/GastosOperativos.php");
require_once("../models/Productos.php");
require_once("../models/Insumos.php");

$gastos_operativos = new GastosOperativos();
$productos_model = new Productos();
$insumos_model = new Insumos();

// Obtener usuario de la sesión
$usu_id = isset($_SESSION["usu_id"]) ? $_SESSION["usu_id"] : null;

if (!$usu_id) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Usuario no autenticado'
    ]);
    exit;
}

$op = isset($_GET['op']) ? $_GET['op'] : '';

switch($op) {
    
    case 'listar':
        try {
            $fecha_inicio = $_GET['fecha_inicio'] ?? null;
            $fecha_fin = $_GET['fecha_fin'] ?? null;
            
            $gastos = $gastos_operativos->get_gastos($fecha_inicio, $fecha_fin);
            
            echo json_encode([
                'status' => 'success',
                'data' => $gastos
            ]);
        } catch (Exception $e) {
            error_log("Error en listar: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al obtener gastos operativos'
            ]);
        }
        break;
    
    case 'guardar':
        try {
            $descripcion = $_POST['descripcion'] ?? '';
            $fecha = $_POST['fecha'] ?? date('Y-m-d H:i:s');
            $precio_unitario = $_POST['precio_unitario'] ?? 0;
            $metodo_pago = $_POST['metodo_pago'] ?? 'efectivo';
            $comentario = $_POST['comentario'] ?? '';
            $item_seleccionado = $_POST['item_seleccionado'] ?? null; // "producto_5" o "insumo_7"
            $cantidad_comprada = !empty($_POST['cantidad_comprada']) ? $_POST['cantidad_comprada'] : null;
            
            // Validaciones
            if (empty($descripcion)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'La descripción es requerida'
                ]);
                exit;
            }
            
            if ($precio_unitario <= 0) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'El monto debe ser mayor a cero'
                ]);
                exit;
            }
            
            // Procesar item seleccionado
            $tipo_item = null;
            $item_id = null;
            
            if ($item_seleccionado && $cantidad_comprada) {
                // Formato esperado: "producto_5" o "insumo_7"
                $partes = explode('_', $item_seleccionado);
                
                if (count($partes) === 2) {
                    $tipo_item = $partes[0]; // 'producto' o 'insumo'
                    $item_id = intval($partes[1]); // ID numérico
                    
                    // Validar que la cantidad sea válida
                    if ($cantidad_comprada <= 0) {
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'La cantidad debe ser mayor a cero'
                        ]);
                        exit;
                    }
                    
                    // Actualizar stock según el tipo
                    if ($tipo_item === 'producto') {
                        $producto = $productos_model->get_producto_por_id($item_id);
                        if (!$producto) {
                            throw new Exception("Producto no encontrado");
                        }
                        
                        $stock_actual = $producto['pr_stock'] ?? 0;
                        $nuevo_stock = $stock_actual + $cantidad_comprada;
                        
                        $resultado_update = $productos_model->actualizar_stock_directo($item_id, $nuevo_stock);
                        
                        if (!$resultado_update) {
                            throw new Exception("Error al actualizar stock del producto");
                        }
                        
                        error_log("Stock actualizado - Producto ID: $item_id, Stock anterior: $stock_actual, Nuevo: $nuevo_stock");
                        
                    } elseif ($tipo_item === 'insumo') {
                        $insumo = $insumos_model->get_insumo_por_id($item_id);
                        if (!$insumo) {
                            throw new Exception("Insumo no encontrado");
                        }
                        
                        $resultado_entrada = $insumos_model->registrar_entrada(
                            $item_id,
                            $cantidad_comprada,
                            "Compra - " . $descripcion,
                            $usu_id
                        );
                        
                        if (!$resultado_entrada) {
                            throw new Exception("Error al actualizar stock del insumo");
                        }
                        
                        error_log("Stock de insumo actualizado - Insumo ID: $item_id, Cantidad: $cantidad_comprada");
                    }
                }
            }
            
            // Registrar el gasto
            $resultado = $gastos_operativos->insert_gasto(
                $descripcion,
                $fecha,
                $precio_unitario,
                $metodo_pago,
                $comentario,
                $usu_id,
                $tipo_item,
                $item_id,
                $cantidad_comprada
            );
            
            if ($resultado) {
                $mensaje = 'Gasto registrado correctamente';
                if ($tipo_item && $item_id) {
                    $mensaje .= ' y stock actualizado';
                }
                
                echo json_encode([
                    'status' => 'success',
                    'message' => $mensaje,
                    'id' => $resultado
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al registrar el gasto'
                ]);
            }
        } catch (Exception $e) {
            error_log("Error en guardar: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al guardar: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'actualizar':
        try {
            $id = $_POST['id'] ?? null;
            $descripcion = $_POST['descripcion'] ?? '';
            $precio_unitario = $_POST['precio_unitario'] ?? 0;
            $metodo_pago = $_POST['metodo_pago'] ?? 'efectivo';
            $comentario = $_POST['comentario'] ?? '';
            
            if (!$id) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de gasto no proporcionado'
                ]);
                exit;
            }
            
            if (empty($descripcion)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'La descripción es requerida'
                ]);
                exit;
            }
            
            $resultado = $gastos_operativos->update_gasto(
                $id,
                $descripcion,
                $precio_unitario,
                $metodo_pago,
                $comentario
            );
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Gasto actualizado correctamente'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al actualizar el gasto'
                ]);
            }
        } catch (Exception $e) {
            error_log("Error en actualizar: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al actualizar'
            ]);
        }
        break;
    
    case 'eliminar':
        try {
            $id = $_POST['id'] ?? null;
            
            if (!$id) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de gasto no proporcionado'
                ]);
                exit;
            }
            
            $resultado = $gastos_operativos->delete_gasto($id);
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Gasto eliminado correctamente'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al eliminar el gasto'
                ]);
            }
        } catch (Exception $e) {
            error_log("Error en eliminar: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al eliminar'
            ]);
        }
        break;
    
    case 'resumen_dia':
        try {
            $fecha = $_GET['fecha'] ?? date('Y-m-d');
            $resumen = $gastos_operativos->get_gastos_dia($fecha);
            
            echo json_encode([
                'status' => 'success',
                'data' => $resumen
            ]);
        } catch (Exception $e) {
            error_log("Error en resumen_dia: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al obtener resumen'
            ]);
        }
        break;
    
    case 'resumen_mes':
        try {
            $mes = $_GET['mes'] ?? date('n');
            $anio = $_GET['anio'] ?? date('Y');
            $resumen = $gastos_operativos->get_gastos_mes($mes, $anio);
            
            echo json_encode([
                'status' => 'success',
                'data' => $resumen
            ]);
        } catch (Exception $e) {
            error_log("Error en resumen_mes: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al obtener resumen'
            ]);
        }
        break;
    
    case 'listar_productos':
        try {
            $items = $gastos_operativos->get_productos_e_insumos_activos();
            
            echo json_encode([
                'status' => 'success',
                'data' => $items
            ]);
        } catch (Exception $e) {
            error_log("Error en listar_productos: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al obtener productos e insumos'
            ]);
        }
        break;
    
    case 'grafica_30_dias':
        try {
            $datos = $gastos_operativos->get_gastos_ultimos_30_dias();
            
            echo json_encode([
                'status' => 'success',
                'data' => $datos
            ]);
        } catch (Exception $e) {
            error_log("Error en grafica_30_dias: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al obtener datos de gráfica'
            ]);
        }
        break;
    
    default:
        echo json_encode([
            'status' => 'error',
            'message' => 'Operación no válida'
        ]);
        break;
}
?>