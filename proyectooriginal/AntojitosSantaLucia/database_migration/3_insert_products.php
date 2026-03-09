<?php
$host = "192.241.159.227";
$user = "remote_user";
$password = 'k]K^l&Yw!J7';
$db = "db_eloteslosregios";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("SET NAMES 'utf8'");
    
    // Limpiar categorias por si se habian insertado antes
    $pdo->exec("SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE rv_categorias; SET FOREIGN_KEY_CHECKS=1;");
    
    // Categorias
    $categorias = [
        'Elote Clásico',
        'Especialidad',
        'Para el Antojo',
        'Bebidas'
    ];
    
    $cat_ids = [];
    foreach ($categorias as $cat) {
        $stmt = $pdo->prepare("INSERT INTO rv_categorias (nombre, descripcion) VALUES (?, ?)");
        $stmt->execute([$cat, $cat]);
        $cat_ids[$cat] = $pdo->lastInsertId();
    }
    
    // Productos a insertar
    // Precios y categorias estimadas del PDF
    $productos = [
        ['nombre' => 'Elote chico', 'precio' => 55, 'cat' => 'Elote Clásico'],
        ['nombre' => 'Elote mediano', 'precio' => 60, 'cat' => 'Elote Clásico'],
        ['nombre' => 'Elote grande', 'precio' => 70, 'cat' => 'Elote Clásico'],
        ['nombre' => 'Elote medio litro', 'precio' => 85, 'cat' => 'Elote Clásico'],
        ['nombre' => 'Elote entero', 'precio' => 65, 'cat' => 'Elote Clásico'],
        
        ['nombre' => 'Tostitos preparados', 'precio' => 70, 'cat' => 'Especialidad', 'desc' => 'con elote, mayonesa, crema, queso amarillo y queso panela'],
        ['nombre' => 'Tostitos divorciados', 'precio' => 80, 'cat' => 'Especialidad', 'desc' => 'dos tipos de papitas con elote, mayonesa, crema, queso amarillo y queso panela'],
        ['nombre' => 'Maruchan preparada', 'precio' => 85, 'cat' => 'Especialidad', 'desc' => 'con elote, mayonesa, crema, queso amarillo y queso panela'],
        ['nombre' => 'Volcan regio', 'precio' => 65, 'cat' => 'Especialidad', 'desc' => 'una papita de tu eleccion con maruchan, elote, mayonesa...'],
        ['nombre' => 'Trocitos regios', 'precio' => 70, 'cat' => 'Especialidad', 'desc' => 'dos elotes enteros partidos en trocitos con una base de elote desgranado...'],
        ['nombre' => 'Rompe dietas', 'precio' => 150, 'cat' => 'Especialidad', 'desc' => 'maruchan, tres papitas de tu eleccion, elote, mayonesa...'],
        
        ['nombre' => 'Fresas con crema', 'precio' => 80, 'cat' => 'Para el Antojo'],
        ['nombre' => 'Nachos con queso y elote', 'precio' => 120, 'cat' => 'Para el Antojo'],
        ['nombre' => 'Nieve estilo jalisco vaso 10 oz', 'precio' => 110, 'cat' => 'Para el Antojo'],
        ['nombre' => 'Nieve estilo jalisco vaso 12 oz', 'precio' => 220, 'cat' => 'Para el Antojo'],
        ['nombre' => 'Nieve estilo jalisco medio litro', 'precio' => 250, 'cat' => 'Para el Antojo'], // Estimado
        
        ['nombre' => 'Refresco', 'precio' => 45, 'cat' => 'Bebidas'],
        ['nombre' => 'Agua natural', 'precio' => 15, 'cat' => 'Bebidas'],
    ]; // El usuario podra modificar los precios en su POS si hubo desajuste
    
    // Limpiamos rv_productos por si habia algo de la clonacion sin datos
    $pdo->exec("SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE rv_productos; SET FOREIGN_KEY_CHECKS=1;");
    
    $stmt_prod = $pdo->prepare("INSERT INTO rv_productos (categoria_id, pr_nombre, pr_descripcion, pr_precioventa, pr_preciocompra, es_platillo, pr_estatus) VALUES (?, ?, ?, ?, 0, 1, 1)");
    
    foreach ($productos as $prod) {
        $cat_id = $cat_ids[$prod['cat']];
        $desc = isset($prod['desc']) ? $prod['desc'] : '';
        $stmt_prod->execute([$cat_id, $prod['nombre'], $desc, $prod['precio']]);
    }
    
    echo "Categorias y Productos base insertados correctamente.\n";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
