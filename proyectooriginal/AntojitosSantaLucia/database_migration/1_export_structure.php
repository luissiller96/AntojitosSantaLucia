<?php
$host = "192.241.159.227";
$user = "remote_user";
$password = 'k]K^l&Yw!J7';
$db = "db_cega";

$export_file = 'structure.sql';
$fp = fopen($export_file, 'w');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set charset
    $pdo->exec("SET NAMES 'utf8'");
    
    // Traer tablas y vistas
    $tablesAndViews = [
        'corp_estatus', 'rv_apertura_caja', 'rv_categorias', 'rv_comanda', 'rv_config', 
        'rv_devoluciones', 'rv_gastos', 'rv_gastos_fijos', 'rv_gastos_fijos_plantilla', 
        'rv_insumos', 'rv_movimientos_insumos', 'rv_producto_componentes', 'rv_producto_insumos', 
        'rv_productos', 'rv_sucursales', 'rv_ventas', 'tm_empleado', 'tm_usuario', 'token_global', 'vf_corp'
    ];
    $views = ['vw_resumen_gastos_mensuales'];
    
    fwrite($fp, "SET FOREIGN_KEY_CHECKS=0;\n\n");

    // Estructuras de tablas
    foreach ($tablesAndViews as $table) {
        $stmt = $pdo->query("SHOW CREATE TABLE `$table`");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $createTableSQL = $row['Create Table'] ?? $row['Create View'];
        fwrite($fp, "DROP TABLE IF EXISTS `$table`;\n");
        fwrite($fp, $createTableSQL . ";\n\n");
    }

    // Estructura de vistas (al final)
    foreach ($views as $view) {
        $stmt = $pdo->query("SHOW CREATE VIEW `$view`");
        if($stmt){
             $row = $stmt->fetch(PDO::FETCH_ASSOC);
             $createViewSQL = $row['Create View'];
             fwrite($fp, "DROP VIEW IF EXISTS `$view`;\n");
             fwrite($fp, $createViewSQL . ";\n\n");
        }
    }

    // Volcado de datos esenciales (usuarios y configuración básica)
    $essential_tables = ['tm_usuario', 'tm_empleado', 'rv_sucursales', 'corp_estatus', 'rv_config', 'token_global']; 
    
    foreach ($essential_tables as $table) {
        $rows = $pdo->query("SELECT * FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);
        if (count($rows) > 0) {
            foreach ($rows as $row) {
                $columns = array_keys($row);
                $values = array_values($row);
                
                $values = array_map(function($val) use ($pdo) {
                     return $val === null ? "NULL" : $pdo->quote($val);
                }, $values);
                
                $sql = "INSERT INTO `$table` (`" . implode("`, `", $columns) . "`) VALUES (" . implode(", ", $values) . ");\n";
                fwrite($fp, $sql);
            }
            fwrite($fp, "\n");
        }
    }

    fwrite($fp, "SET FOREIGN_KEY_CHECKS=1;\n\n");
    fclose($fp);
    echo "Expotracion a structure.sql exitosa\n";

} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
