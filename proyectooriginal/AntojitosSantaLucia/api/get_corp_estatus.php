<?php
/**
 * API - Estatus de Pago Corporativo
 * 0 = MOSTRAR BANNER (No pagado)
 * 1 = OCULTAR BANNER (Pagado)
 */
require_once("../config/conexion.php");

header('Content-Type: application/json');

try {
    $pdo = Conectar::obtenerConexionUnica();
    
    $stmt = $pdo->query("SELECT estatus, dia_corte FROM corp_estatus LIMIT 1");
    $registro = $stmt->fetch();
    
    if (!$registro) {
        echo json_encode(['success' => false, 'mostrar_banner' => false]);
        exit;
    }
    
    $estatus = (int)$registro['estatus'];
    
    // Si estatus es 0 -> Mostrar Banner. Si es 1 -> Ocultar.
    $mostrar_banner = ($estatus === 0);
    
    echo json_encode([
        'success' => true,
        'mostrar_banner' => $mostrar_banner,
        'estatus' => $estatus,
        'dia_corte' => (int)$registro['dia_corte']
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error BD']);
}
?>
