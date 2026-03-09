<?php
// Habilitar la visualización de errores en el navegador (solo para depuración, no en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Intenta escribir un mensaje en el log de errores de PHP
error_log("TEST_LOG: Este es un mensaje de prueba desde test_log.php. La fecha es " . date("Y-m-d H:i:s"));

// Muestra un mensaje en el navegador
echo "¡Log de prueba enviado y archivo PHP procesado!";
?>