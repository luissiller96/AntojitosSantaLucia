<?php
$host = "192.241.159.227";
$user = "remote_user";
$password = 'k]K^l&Yw!J7';
$new_db = "db_eloteslosregios";
$sql_file = 'structure.sql';

try {
    $pdo = new PDO("mysql:host=$host", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Crear nueva base de datos
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$new_db` CHARACTER SET utf8 COLLATE utf8_general_ci");
    echo "Database $new_db created successfully.\n";
    
    // Conectar a la nueva base de datos
    $pdo->exec("USE `$new_db`");
    
    // Leer archivo SQL
    $sql = file_get_contents($sql_file);
    if ($sql === false) {
        die("Error reading $sql_file");
    }
    
    // Ejecutar sentencias SQL
    $pdo->exec($sql);
    echo "Imported structure and essential data into $new_db successfully.\n";
    
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
