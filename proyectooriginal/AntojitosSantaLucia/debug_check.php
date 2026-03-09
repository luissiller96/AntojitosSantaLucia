<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ✅ Ruta ABSOLUTA para el archivo de log.
// Asegúrate de que esta carpeta exista y tenga permisos de escritura para el usuario de tu servidor web.
$log_file_path = '/Applications/ServBay/www/Framework7/SnackRocket/php_error_debug.log'; // CAMBIA ESTA RUTA SI ES NECESARIO


error_log("DEBUG_INIT: phpinfo() path check. Timestamp: " . date("Y-m-d H:i:s"));
echo "<h1>Debug Check Page</h1>";
echo "<p>Si ves este mensaje, PHP está ejecutándose.</p>";
echo "<p>Revisa el archivo de log en: <code>" . htmlspecialchars($log_file_path) . "</code></p>";

// Mostrar información de PHP para depuración
phpinfo();
?>