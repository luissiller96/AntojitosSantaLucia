<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// 1. Si no hay un usuario logueado, lo saca al login
if (!isset($_SESSION['usu_id'])) {
    header("Location: ../index.php");
    exit();
}

// 2. Obtenemos los datos de la sesión
$pagina_actual = basename($_SERVER['PHP_SELF']);
$puesto_usuario = $_SESSION['emp_puesto'] ?? 'Invitado';

// 3. Definimos la lista de permisos correcta
$permisos = [
    'Admin' => [
        'dashboard.php', 'caja.php', 'reportes.php', 'comanda.php', 'productos.php', 
        'display.php', 'cierre_caja.php', 'devoluciones.php', 'empleados.php', 'token.php', 'gastos_fijos.php', 'gastos_operativos.php', 'gastos_operativos_movil.php'
        // El Admin puede ver todo
    ],
    'Cajero' => [
        'dashboard.php',      // <-- Permiso clave que probablemente faltaba o estaba mal escrito
        'caja.php',
        'cierre_caja.php',
        'devoluciones.php',
        'productos.php'
    ],
    'Cocinero' => [
        'dashboard.php',
        'comanda.php',
        'display.php'        // Asumiendo que display.php es Clientes
    ]
];

// 4. Verificamos si el rol del usuario tiene permiso para la página actual
$autorizado = false;
if (isset($permisos[$puesto_usuario]) && in_array($pagina_actual, $permisos[$puesto_usuario])) {
    $autorizado = true;
}

// 5. Si no está autorizado, lo redirigimos a su dashboard
if (!$autorizado) {
    header("Location: dashboard.php");
    exit();
}
?>