<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedidos - Sabaz</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <link rel="stylesheet" href="../css/display.css?v=<?php echo filemtime('../css/display.css'); ?> ">
</head>

<body>
  <div class="container-fluid-custom">
    <div class="display-header">
      <h1 class="display-title">Sabaz</h1>
      <p class="display-subtitle">Seguimiento de Pedidos en Tiempo Real</p>

      <div class="status-indicators">
        <div class="status-legend">
          <span class="status-dot preparing"></span>
          <span>En Preparación</span>
        </div>
        <div class="status-legend">
          <span class="status-dot ready"></span>
          <span>Listo para Recoger</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="row w-100">
        <div class="col-lg-6 col-md-12">
          <div class="order-queue-section">
            <h3>En Preparación 🧑‍🍳</h3>
            <div id="preparingQueue" class="queue-grid">
              <div class="loading-container" id="loadingPreparing">
                <div class="loading-spinner"></div>
              </div>
              <p class="info-message d-none" id="noPreparingOrders">No hay pedidos en preparación.</p>
            </div>
          </div>
        </div>

        <div class="col-lg-6 col-md-12">
          <div class="order-queue-section">
            <h3>Listos para Recoger ✅</h3>
            <div id="readyQueue" class="queue-grid">
              <div class="loading-container" id="loadingReady">
                <div class="loading-spinner"></div>
              </div>
              <p class="info-message d-none" id="noReadyOrders">No hay pedidos listos por ahora.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="no-orders-container d-none" id="noOrdersOverall">
        <div class="no-orders-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="no-orders-text">No hay pedidos en este momento</div>
        <div class="no-orders-subtext">¡Gracias por tu paciencia!</div>
      </div>
    </div>
  </div>

  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="../js/display.js?v=<?php echo filemtime('../js/display.js'); ?>"></script>

  <script>
    // Efectos adicionales para tarjetas listas
    function createSparkle() {
      const readyCards = document.querySelectorAll('.order-card.status-lista');
      readyCards.forEach(card => {
        if (Math.random() > 0.8) {
          const sparkle = document.createElement('div');
          sparkle.className = 'sparkle';
          sparkle.style.left = Math.random() * 80 + 10 + '%';
          sparkle.style.top = Math.random() * 80 + 10 + '%';
          card.appendChild(sparkle);

          setTimeout(() => {
            if (sparkle.parentNode) {
              sparkle.remove();
            }
          }, 2000);
        }
      });
    }

    // Crear efectos de brillo cada 4 segundos
    setInterval(createSparkle, 4000);
  </script>
</body>

</html>