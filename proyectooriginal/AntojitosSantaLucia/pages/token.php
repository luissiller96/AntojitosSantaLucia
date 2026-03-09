<?php
// Esta sola línea reemplaza toda tu lógica de verificación anterior.
require_once("../includes/auth_check.php");

// Puedes incluir la conexión a la BD después si la página la necesita.
require_once("../config/conexion.php");
?>

<!DOCTYPE html>
<html lang="es">

<head>
  <?php include("../includes/head.php"); ?>
  <title>Token Global - SnackRocket</title>
  <?php include("../includes/style.php"); ?>
  <style>
  /* Estilos para la tarjeta del token (puedes ajustar a tu gusto) */
  .token-card {
    max-width: 450px;
    margin: 3rem auto;
    text-align: center;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .token-display {
    font-size: 4.5rem;
    font-weight: 700;
    letter-spacing: 12px;
    color: #007bff;
    background-color: #f1f8ff;
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
  }

  .dark-mode .token-card {
    background-color: #2a2a2a;
  }

  .dark-mode .token-display {
    color: #58a6ff;
    background-color: #1c1c1c;
  }
  </style>
</head>

<body class="no-scroll">

  <?php include("../includes/bottom_nav_bar.php"); ?>

  <div class="scroll-container <?= $modo_oscuro ? 'dark-mode' : '' ?>">
    <div class="container-fluid py-4">
      <h4 class="card-title text-center mb-4">Token de Autorización Global 🔑</h4>
      <div class="token-card">
        <p class="text-muted">
          Este es el token activo para autorizar devoluciones en todo el sistema. Cambia cada vez que cualquier
          administrador inicia sesión.
        </p>
        <div id="token-display" class="token-display">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
        <p><strong>Compártelo con el personal que lo necesite.</strong></p>
      </div>
    </div>
  </div>

  <?php include("../includes/scripts.php"); ?>
  <script>
  $(document).ready(function() {
    $.post('../controller/token.php?op=get_token', function(response) {
      // El Content-Type del servidor debería ser application/json,
      // pero si no, JSON.parse es necesario.
      let data = typeof response === 'string' ? JSON.parse(response) : response;
      if (data.status === 'success') {
        $('#token-display').text(data.token);
      } else {
        $('#token-display').text('Error');
        Swal.fire('Error', data.message, 'error');
      }
    });
  });
  </script>
</body>

</html>