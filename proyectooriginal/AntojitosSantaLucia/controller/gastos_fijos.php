<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once("../config/conexion.php");
require_once("../models/GastosFijos.php");

$gastos_fijos = new GastosFijos();

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
    
    // ==========================================
    // PLANTILLAS
    // ==========================================
    
    case 'listar_plantillas':
        try {
            $plantillas = $gastos_fijos->get_plantillas();
            echo json_encode([
                'status' => 'success',
                'data' => $plantillas
            ]);
        } catch (Exception $e) {
            error_log("Error en listar_plantillas: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al obtener plantillas'
            ]);
        }
        break;
    
    case 'guardar_plantilla':
        try {
            $id = isset($_POST['id']) ? $_POST['id'] : null;
            $categoria = $_POST['categoria'] ?? '';
            $concepto = $_POST['concepto'] ?? '';
            $monto_base = $_POST['monto_base'] ?? 0;
            $descripcion = $_POST['descripcion'] ?? '';
            
            if (empty($concepto) || empty($categoria)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Categoría y concepto son requeridos'
                ]);
                exit;
            }
            
            if (empty($id)) {
                // Insertar nueva plantilla
                $resultado = $gastos_fijos->insert_plantilla($categoria, $concepto, $monto_base, $descripcion);
                
                if ($resultado) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Plantilla creada correctamente',
                        'id' => $resultado
                    ]);
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Error al crear la plantilla'
                    ]);
                }
            } else {
                // Actualizar plantilla existente
                $resultado = $gastos_fijos->update_plantilla($id, $categoria, $concepto, $monto_base, $descripcion);
                
                if ($resultado) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Plantilla actualizada correctamente'
                    ]);
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Error al actualizar la plantilla'
                    ]);
                }
            }
        } catch (Exception $e) {
            error_log("Error en guardar_plantilla: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al guardar plantilla: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'eliminar_plantilla':
        try {
            $id = $_POST['id'] ?? null;
            
            if (!$id) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de plantilla no proporcionado'
                ]);
                exit;
            }
            
            $resultado = $gastos_fijos->delete_plantilla($id);
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Plantilla eliminada correctamente'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al eliminar la plantilla'
                ]);
            }
        } catch (Exception $e) {
            error_log("Error en eliminar_plantilla: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al eliminar plantilla'
            ]);
        }
        break;
    
    // ==========================================
    // GASTOS FIJOS MENSUALES
    // ==========================================
    
    case 'listar_gastos_mes':
        try {
            $mes = $_GET['mes'] ?? date('n');
            $anio = $_GET['anio'] ?? date('Y');
            
            $gastos = $gastos_fijos->get_gastos_mes($mes, $anio);
            $resumen = $gastos_fijos->get_resumen_por_categoria($mes, $anio);
            
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'gastos' => $gastos,
                    'resumen' => $resumen
                ]
            ]);
        } catch (Exception $e) {
            error_log("Error en listar_gastos_mes: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al obtener gastos del mes'
            ]);
        }
        break;
    
    case 'generar_mes':
        try {
            $mes = $_POST['mes'] ?? date('n');
            $anio = $_POST['anio'] ?? date('Y');
            
            $resultado = $gastos_fijos->generar_gastos_desde_plantillas($mes, $anio, $usu_id);
            echo json_encode($resultado);
        } catch (Exception $e) {
            error_log("Error en generar_mes: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al generar gastos del mes'
            ]);
        }
        break;
    
    case 'actualizar_gasto':
        try {
            $id = $_POST['id'] ?? null;
            $monto = $_POST['monto'] ?? 0;
            $fecha_pago = $_POST['fecha_pago'] ?? null;
            $metodo_pago = $_POST['metodo_pago'] ?? 'transferencia';
            $notas = $_POST['notas'] ?? '';
            $estatus = $_POST['estatus'] ?? 'pendiente';
            
            if (!$id) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de gasto no proporcionado'
                ]);
                exit;
            }
            
            $resultado = $gastos_fijos->update_gasto_fijo($id, $monto, $fecha_pago, $metodo_pago, $notas, $estatus);
            
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
            error_log("Error en actualizar_gasto: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al actualizar gasto'
            ]);
        }
        break;
    
    case 'marcar_pagado':
        try {
            $id = $_POST['id'] ?? null;
            $fecha_pago = $_POST['fecha_pago'] ?? date('Y-m-d');
            $metodo_pago = $_POST['metodo_pago'] ?? 'transferencia';
            
            if (!$id) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de gasto no proporcionado'
                ]);
                exit;
            }
            
            $resultado = $gastos_fijos->marcar_como_pagado($id, $fecha_pago, $metodo_pago);
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Gasto marcado como pagado'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al marcar como pagado'
                ]);
            }
        } catch (Exception $e) {
            error_log("Error en marcar_pagado: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al marcar como pagado'
            ]);
        }
        break;
    
    case 'eliminar_gasto':
        try {
            $id = $_POST['id'] ?? null;
            
            if (!$id) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de gasto no proporcionado'
                ]);
                exit;
            }
            
            $resultado = $gastos_fijos->delete_gasto_fijo($id);
            
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
            error_log("Error en eliminar_gasto: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al eliminar gasto'
            ]);
        }
        break;
    
    case 'historial':
        try {
            $historial = $gastos_fijos->get_historial_12_meses();
            echo json_encode([
                'status' => 'success',
                'data' => $historial
            ]);
        } catch (Exception $e) {
            error_log("Error en historial: " . $e->getMessage());
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al obtener historial'
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