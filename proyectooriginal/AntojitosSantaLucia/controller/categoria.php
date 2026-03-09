<?php
session_start();
require_once("../config/conexion.php");
require_once("../models/Categorias.php");

$categorias = new Categorias();

// Obtener operación
$op = isset($_GET['op']) ? $_GET['op'] : '';

// Headers para JSON
header('Content-Type: application/json; charset=utf-8');

switch($op) {
    
    case 'guardar':
        try {
            if (!isset($_POST['nombre']) || empty($_POST['nombre'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'El nombre de la categoría es requerido'
                ]);
                exit;
            }
            
            $nombre = $_POST['nombre'];
            $id = $categorias->insert_categoria($nombre);
            
            if ($id) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Categoría creada correctamente',
                    'id' => $id,
                    'nombre' => $nombre
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al crear la categoría'
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
        break;
    
    case 'eliminar':
        try {
            if (!isset($_POST['id'])) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'ID de categoría no proporcionado'
                ]);
                exit;
            }
            
            $id = $_POST['id'];
            $resultado = $categorias->delete_categoria($id);
            
            if ($resultado) {
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Categoría eliminada correctamente'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Error al eliminar la categoría'
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
            $datos = $categorias->get_categorias();
            echo json_encode([
                'status' => 'success',
                'data' => $datos
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Error al listar categorías: ' . $e->getMessage()
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