<?php
session_start();
require_once("../config/conexion.php");
require_once("../models/Productos.php");
require_once("../models/ProductoInsumos.php");
require_once("../models/ProductoComponentes.php");

$producto_componentes = new ProductoComponentes();
$productos = new Productos();
$producto_insumos = new ProductoInsumos();

// Obtener operación
$op = isset($_GET['op']) ? $_GET['op'] : '';

// Headers para JSON
header('Content-Type: application/json; charset=utf-8');

switch($op) {
   case "guardaryeditar":
    if (empty($_POST["id"])) {
        // Insertar nuevo producto
        
        // ✅ Manejar stock NULL correctamente
        $pr_stock = null;
        if (isset($_POST["pr_stock"]) && $_POST["pr_stock"] !== 'NULL') {
            $pr_stock = $_POST["pr_stock"];
        }
        
        $resultado = $productos->insert_producto(
            $_POST["pr_nombre"],
            $_POST["categoria_id"] ?? null,
            $_POST["pr_preciooriginal"],
            $_POST["pr_preciocompra"],
            $pr_stock, // ✅ Ahora pasa NULL correctamente
            1,
            $_POST["pr_promocion_porcentaje"] ?? 0
        );
        
        if ($resultado) {
            // Guardar insumos si existen
            if (isset($_POST["insumos"]) && !empty($_POST["insumos"])) {
                $insumos = json_decode($_POST["insumos"], true);
                if (!empty($insumos) && is_array($insumos)) {
                    $producto_insumos->guardar_insumos_producto($resultado, $insumos);
                }
            }
            
            // Guardar componentes de producto si existen
            if (isset($_POST["componentes"]) && !empty($_POST["componentes"])) {
                $componentes = json_decode($_POST["componentes"], true);
                if (!empty($componentes) && is_array($componentes)) {
                    $producto_componentes->guardar_componentes_producto($resultado, $componentes);
                }
            }
            
            echo json_encode([
                "status" => "success",
                "message" => "Producto registrado correctamente",
                "producto_id" => $resultado
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Error al registrar el producto"
            ]);
        }
    } else {
        // Actualizar producto existente
        
        // ✅ Manejar stock NULL correctamente
        $pr_stock = null;
        if (isset($_POST["pr_stock"]) && $_POST["pr_stock"] !== 'NULL') {
            $pr_stock = $_POST["pr_stock"];
        }
        
        $resultado = $productos->update_producto(
            $_POST["id"],
            $_POST["pr_nombre"],
            $_POST["categoria_id"] ?? null,
            $_POST["pr_preciooriginal"],
            $_POST["pr_preciocompra"],
            $pr_stock, // ✅ Ahora pasa NULL correctamente
            $_POST["pr_estatus"],
            $_POST["pr_favorito"],
            $_POST["pr_promocion_porcentaje"] ?? 0
        );
        
        if ($resultado !== false) {
            // Guardar insumos si existen
            if (isset($_POST["insumos"])) {
                $insumos = json_decode($_POST["insumos"], true);
                if (is_array($insumos)) {
                    $producto_insumos->guardar_insumos_producto($_POST["id"], $insumos);
                }
            } else {
                $producto_insumos->guardar_insumos_producto($_POST["id"], []);
            }
            
            // Guardar componentes de producto si existen
            if (isset($_POST["componentes"])) {
                $componentes = json_decode($_POST["componentes"], true);
                if (is_array($componentes)) {
                    $producto_componentes->guardar_componentes_producto($_POST["id"], $componentes);
                }
            } else {
                $producto_componentes->guardar_componentes_producto($_POST["id"], []);
            }
            
            echo json_encode([
                "status" => "success",
                "message" => "Producto actualizado correctamente"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Error al actualizar el producto"
            ]);
        }
    }
    break;

    case "obtener_insumos":
        if (!isset($_POST["producto_id"])) {
            echo json_encode([
                "status" => "error",
                "message" => "ID de producto no proporcionado",
                "insumos" => []
            ]);
            break;
        }
        
        $insumos = $producto_insumos->get_insumos_producto($_POST["producto_id"]);
        
        if ($insumos !== false) {
            // Formatear datos para el frontend
            $insumos_formato = array_map(function($insumo) {
                return [
                    'insumo_id' => $insumo['insumo_id'],
                    'nombre' => $insumo['insumo_nombre'],
                    'unidad_medida' => $insumo['unidad_medida'],
                    'cantidad_necesaria' => $insumo['cantidad_necesaria']
                ];
            }, $insumos);
            
            echo json_encode([
                "status" => "success",
                "insumos" => $insumos_formato
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "Error al obtener insumos",
                "insumos" => []
            ]);
        }
        break;
    
    case "verificar_stock_producto":
        if (!isset($_POST["producto_id"]) || !isset($_POST["cantidad"])) {
            echo json_encode([
                "status" => "error",
                "message" => "Datos incompletos"
            ]);
            break;
        }
        
        $producto_id = $_POST["producto_id"];
        $cantidad = $_POST["cantidad"];
        
        $verificacion = $producto_insumos->verificar_stock_insumos($producto_id, $cantidad);
        
        echo json_encode([
            "status" => "success",
            "tiene_stock" => $verificacion['tiene_stock'],
            "faltantes" => $verificacion['faltantes']
        ]);
        break;
        
    case 'eliminar':
        try {
            if (!isset($_POST['id'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID del producto no proporcionado'
                ]);
                exit;
            }
            
            $id = $_POST['id'];
            $resultado = $productos->delete_producto($id);
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Producto eliminado correctamente'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al eliminar el producto'
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'listar':
        try {
            $datos = $productos->get_productos();
            echo json_encode([
                'status' => 'success',
                'data' => $datos
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al listar productos: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'obtener':
        try {
            if (!isset($_POST['id'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID del producto no proporcionado'
                ]);
                exit;
            }
            
            $id = $_POST['id'];
            $datos = $productos->get_producto_por_id($id);
            
            if ($datos) {
                echo json_encode([
                    'status' => 'success',
                    'data' => $datos
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Producto no encontrado'
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'verificar_stock':
        try {
            if (!isset($_POST['id']) || !isset($_POST['cantidad'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Datos incompletos'
                ]);
                exit;
            }
            
            $id = $_POST['id'];
            $cantidad = $_POST['cantidad'];
            $disponible = $productos->verificar_stock($id, $cantidad);
            
            echo json_encode([
                'status' => 'success',
                'disponible' => $disponible
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'actualizar_stock':
        try {
            if (!isset($_POST['id']) || !isset($_POST['cantidad'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Datos incompletos'
                ]);
                exit;
            }
            
            $id = $_POST['id'];
            $cantidad = $_POST['cantidad'];
            $productos->descontar_stock($id, $cantidad);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Stock actualizado'
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
        break;

        case "obtener_componentes":
    if (!isset($_POST["producto_id"])) {
        echo json_encode([
            "status" => "error",
            "message" => "ID de producto no proporcionado",
            "componentes" => []
        ]);
        break;
    }
    
    $componentes = $producto_componentes->get_componentes_producto($_POST["producto_id"]);
    
    if ($componentes !== false) {
        echo json_encode([
            "status" => "success",
            "componentes" => $componentes
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener componentes",
            "componentes" => []
        ]);
    }
    break;

case "obtener_productos_para_componentes":
    $productos = $producto_componentes->get_productos_disponibles();
    
    if ($productos !== false) {
        echo json_encode([
            "status" => "success",
            "productos" => $productos
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Error al obtener productos"
        ]);
    }
    break;

    
    default:
        echo json_encode([
            'status' => 'error',
            'message' => 'Operación no válida: ' . $op
        ]);
        break;
}
?>