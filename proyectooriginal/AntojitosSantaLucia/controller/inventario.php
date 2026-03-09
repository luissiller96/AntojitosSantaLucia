<?php
require_once("../config/conexion.php");

header('Content-Type: application/json');
date_default_timezone_set('America/Mexico_City');

require_once("../models/Insumos.php");
require_once("../models/Ingredientes.php");

$insumos = new Insumos();
$ingredientes = new Ingredientes();

$op = $_REQUEST["op"] ?? '';

switch ($op) {
    
    case "dashboard_inventario":
        // Obtener datos para el dashboard de inventario
        $alertas_stock = $insumos->obtener_alertas_stock();
        $movimientos_recientes = $insumos->obtener_movimientos(null, 10);
        $insumos_lista = $insumos->listar();
        
        echo json_encode([
            'status' => 'success',
            'alertas_stock' => $alertas_stock,
            'movimientos_recientes' => $movimientos_recientes,
            'total_insumos' => count($insumos_lista),
            'insumos_bajo_stock' => count($alertas_stock)
        ]);
        break;
        
    case "compra_insumos":
        try {
            $compras = $_POST['compras'] ?? [];
            $referencia = $_POST['referencia'] ?? 'COMPRA-' . date('YmdHis');
            
            if (empty($compras)) {
                throw new Exception('No se proporcionaron datos de compra');
            }
            
            $resultados = [];
            foreach ($compras as $compra) {
                $id_insumo = $compra['id_insumo'] ?? null;
                $cantidad = $compra['cantidad'] ?? 0;
                $precio_unitario = $compra['precio_unitario'] ?? 0;
                
                if ($id_insumo && $cantidad > 0) {
                    $resultado = $insumos->actualizar_stock(
                        $id_insumo, 
                        $cantidad, 
                        'compra', 
                        $referencia
                    );
                    
                    $resultados[] = [
                        'insumo_id' => $id_insumo,
                        'cantidad' => $cantidad,
                        'resultado' => $resultado
                    ];
                }
            }
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Compras registradas correctamente',
                'referencia' => $referencia,
                'resultados' => $resultados
            ]);
            
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case "ajuste_inventario":
        try {
            $ajustes = $_POST['ajustes'] ?? [];
            $motivo = $_POST['motivo'] ?? 'ajuste_manual';
            
            if (empty($ajustes)) {
                throw new Exception('No se proporcionaron datos de ajuste');
            }
            
            $resultados = [];
            foreach ($ajustes as $ajuste) {
                $id_insumo = $ajuste['id_insumo'] ?? null;
                $cantidad_nueva = $ajuste['cantidad_nueva'] ?? 0;
                
                if ($id_insumo && $cantidad_nueva >= 0) {
                    // Obtener cantidad actual para calcular diferencia
                    $insumos_lista = $insumos->listar();
                    $insumo_actual = null;
                    
                    foreach ($insumos_lista as $ins) {
                        if ($ins['id'] == $id_insumo) {
                            $insumo_actual = $ins;
                            break;
                        }
                    }
                    
                    if ($insumo_actual) {
                        $diferencia = $cantidad_nueva - $insumo_actual['stock_interno'];
                        
                        if ($diferencia != 0) {
                            $resultado = $insumos->actualizar_stock(
                                $id_insumo, 
                                abs($diferencia), 
                                $diferencia > 0 ? 'entrada' : 'salida',
                                'AJUSTE-' . date('YmdHis')
                            );
                            
                            $resultados[] = [
                                'insumo_id' => $id_insumo,
                                'diferencia' => $diferencia,
                                'resultado' => $resultado
                            ];
                        }
                    }
                }
            }
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Ajustes aplicados correctamente',
                'resultados' => $resultados
            ]);
            
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
        break;
        
    case "mapear_ingrediente_insumo":
        $ingrediente_id = $_POST['ingrediente_id'] ?? null;
        $insumo_id = $_POST['insumo_id'] ?? null;
        $factor_conversion = $_POST['factor_conversion'] ?? 1;
        
        if ($ingrediente_id && $insumo_id) {
            $resultado = $ingredientes->mapear_con_insumo($ingrediente_id, $insumo_id, $factor_conversion);
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Mapeo realizado correctamente'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al realizar el mapeo'
                ]);
            }
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Datos incompletos para el mapeo'
            ]);
        }
        break;
        
    case "reporte_movimientos":
        $fecha_inicio = $_GET['fecha_inicio'] ?? date('Y-m-d', strtotime('-30 days'));
        $fecha_fin = $_GET['fecha_fin'] ?? date('Y-m-d');
        $insumo_id = $_GET['insumo_id'] ?? null;
        
        $movimientos = $insumos->obtener_movimientos($insumo_id, 1000);
        
        // Filtrar por fechas si es necesario
        $movimientos_filtrados = array_filter($movimientos, function($mov) use ($fecha_inicio, $fecha_fin) {
            $fecha_mov = date('Y-m-d', strtotime($mov['fecha_movimiento']));
            return $fecha_mov >= $fecha_inicio && $fecha_mov <= $fecha_fin;
        });
        
        echo json_encode([
            'status' => 'success',
            'movimientos' => array_values($movimientos_filtrados),
            'total' => count($movimientos_filtrados)
        ]);
        break;
        
    case "estadisticas_inventario":
        $insumos_lista = $insumos->listar();
        $alertas = $insumos->obtener_alertas_stock();
        $movimientos = $insumos->obtener_movimientos(null, 100);
        
        $estadisticas = [
            'total_insumos' => count($insumos_lista),
            'insumos_stock_bajo' => count($alertas),
            'insumos_stock_ok' => count($insumos_lista) - count($alertas),
            'movimientos_hoy' => count(array_filter($movimientos, function($mov) {
                return date('Y-m-d', strtotime($mov['fecha_movimiento'])) === date('Y-m-d');
            })),
            'tipos_unidades' => [
                'peso' => count(array_filter($insumos_lista, function($ins) { 
                    return $ins['tipo_unidad'] === 'peso'; 
                })),
                'liquido' => count(array_filter($insumos_lista, function($ins) { 
                    return $ins['tipo_unidad'] === 'liquido'; 
                })),
                'pieza' => count(array_filter($insumos_lista, function($ins) { 
                    return $ins['tipo_unidad'] === 'pieza'; 
                }))
            ]
        ];
        
        echo json_encode([
            'status' => 'success',
            'estadisticas' => $estadisticas
        ]);
        break;
        
    default:
        echo json_encode([
            'status' => 'error',
            'message' => 'Operación no válida'
        ]);
        break;
}
?>