<?php
// Esta sola línea reemplaza toda tu lógica de verificación anterior.
require_once("../includes/auth_check.php");

// Puedes incluir la conexión a la BD después si la página la necesita.
require_once("../config/conexion.php");
?>

<!DOCTYPE html>
<html lang="es">

<head>
  <?php
  // 2. Carga los metadatos y librerías comunes (Bootstrap, etc.)
  include("../includes/head.php");
  ?>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@700&family=Poppins:wght@400;600;700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="../css/stylecomanda.css?v=<?php echo filemtime('../css/stylecomanda.css'); ?> ">

  <title>Comanda de Cocina - SnackRocket</title>
</head>

<body>
  <?php
  // 4. Incluye la barra de navegación que usas en todo el sitio.
  include("../includes/bottom_nav_bar.php");
  ?>

  <main class="kanban-board">

    <div class="kanban-column" id="columna-pendiente">
      <h2 class="column-header pendiente">📋 Pendiente</h2>
      <div class="tasks-container">
      </div>
    </div>

    <div class="kanban-column" id="columna-preparacion">
      <h2 class="column-header preparacion">🍳 En Preparación</h2>
      <div class="tasks-container">
      </div>
    </div>

    <div class="kanban-column" id="columna-lista">
      <h2 class="column-header lista">🔔 Orden Lista</h2>
      <div class="tasks-container">
      </div>
    </div>

  </main>


  <div id="detalle-modal" class="modal-overlay" style="display:none;">
    <div class="modal-content">
      <button class="modal-close-btn">&times;</button>
      <div id="modal-body-content">
      </div>
    </div>
  </div>

  <?php
  // 6. Carga los scripts comunes (jQuery, etc.)
  include("../includes/scripts.php");
  ?>

  <script src="../js/comanda.js?v=<?php echo filemtime('../js/comanda.js'); ?>"></script>
</body>




</html>