<?php
require_once("../includes/auth_check.php");
require_once("../config/conexion.php");
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <?php include("../includes/head.php"); ?>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Antojitos Santa Lucía</title>

    <!-- CSS del Dashboard -->
    <link rel="stylesheet" href="../css/dashboard.css?v=<?php echo filemtime('../css/dashboard.css'); ?>">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">

    <?php include("../includes/style.php"); ?>
</head>

<body>
    <!-- Banner de Aviso de Pago -->
    <div id="banner-pago" class="banner-pago" style="display: none;">
        <div class="banner-pago-content">
            <i class="fas fa-exclamation-triangle banner-pago-icon"></i>
            <div class="banner-pago-text">
                <strong>Aviso de Pago</strong>
                <span>La fecha de pago ha vencido. Por favor, comuníquese con el administrador.</span>
            </div>
            <button type="button" class="banner-pago-close" id="cerrar-banner-pago" aria-label="Cerrar">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>

    <div class="dashboard-container">
        <!-- Header -->
        <div class="dashboard-header">
            <h1 class="dashboard-title">
                <i class="fas fa-chart-line"></i>
                Dashboard
            </h1>
            <p class="dashboard-subtitle">Panel de control y métricas del negocio</p>
        </div>

        <!-- Loader -->
        <div id="dashboard-loader" class="dashboard-loader">
            <div class="spinner"></div>
            <p style="margin-top: 15px; color: #64748b;">Cargando información...</p>
        </div>

<!-- KPIs Section -->
<div id="kpis-section" class="kpis-container" style="display: none !important;">
    
    <!-- KPI: Ventas del Día -->
    <div class="kpi-card success">
        <div class="kpi-content">
            <div class="kpi-icon success">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="kpi-info">
                <div class="kpi-label">Ventas del Día</div>
                <div class="kpi-value" id="kpi-ventas-dia">$0.00</div>
            </div>
        </div>
    </div>

    <!-- KPI: Platillos Hoy -->
    <div class="kpi-card warning">
        <div class="kpi-content">
            <div class="kpi-icon warning">
                <i class="fas fa-hamburger"></i>
            </div>
            <div class="kpi-info">
                <div class="kpi-label">Platillos Hoy</div>
                <div class="kpi-value" id="kpi-platillos-dia">0</div>
            </div>
        </div>
    </div>

    <!-- KPI: Gastos Operativos del Día -->
    <?php /* ?>
    <div class="kpi-card danger">
        <div class="kpi-content">
            <div class="kpi-icon danger">
                <i class="fas fa-receipt"></i>
            </div>
            <div class="kpi-info">
                <div class="kpi-label">Gastos Operativos Hoy</div>
                <div class="kpi-value" id="kpi-gastos-operativos-dia">$0.00</div>
            </div>
        </div>
    </div>
    <?php */ ?>

    <!-- KPI: Utilidad del Día -->
    <?php /* ?>
    <div class="kpi-card utilidad">
        <div class="kpi-content">
            <div class="kpi-icon utilidad">
                <i class="fas fa-chart-pie"></i>
            </div>
            <div class="kpi-info">
                <div class="kpi-label">Utilidad Hoy</div>
                <div class="kpi-value" id="kpi-utilidad-dia">$0.00</div>
            </div>
        </div>
    </div>
    <?php */ ?>

    <!-- KPI: Ventas del Mes -->
    <div class="kpi-card purple">
        <div class="kpi-content">
            <div class="kpi-icon purple">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="kpi-info">
                <div class="kpi-label">Ventas del Mes</div>
                <div class="kpi-value" id="kpi-ventas-mes">$0.00</div>
            </div>
        </div>
    </div>

    <!-- KPI: En Cocina -->
    <div class="kpi-card danger">
        <div class="kpi-content">
            <div class="kpi-icon danger">
                <i class="fas fa-fire-burner"></i>
            </div>
            <div class="kpi-info">
                <div class="kpi-label">En Cocina (Comandas)</div>
                <div class="kpi-value" id="kpi-ordenes-cocina">0</div>
            </div>
        </div>
    </div>

    <!-- KPI: Gastos Fijos Mes -->
    <?php /* ?>
    <div class="kpi-card warning">
        <div class="kpi-content">
            <div class="kpi-icon warning">
                <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div class="kpi-info">
                <div class="kpi-label">Gastos Fijos Mes</div>
                <div class="kpi-value" id="kpi-gastos-fijos">$0.00</div>
            </div>
        </div>
    </div>
    <?php */ ?>

    <!-- KPI: Utilidad del Mes -->
    <?php /* ?>
    <div class="kpi-card success">
        <div class="kpi-content">
            <div class="kpi-icon success">
                <i class="fas fa-money-bill-trend-up"></i>
            </div>
            <div class="kpi-info">
                <div class="kpi-label">Utilidad Mensual</div>
                <div class="kpi-value" id="kpi-utilidad-mes">$0.00</div>
            </div>
        </div>
    </div>
    <?php */ ?>

    <!-- KPI: Estado de Caja -->
    <div class="kpi-card caja">
        <div class="kpi-content">
            <div class="kpi-icon caja">
                <i class="fas fa-cash-register"></i>
            </div>
            <div class="kpi-info kpi-caja-info">
                <div class="kpi-label">Estado de Caja</div>
                <div class="kpi-caja-estado">
                    <span class="caja-indicador" id="caja-indicador"></span>
                    <span class="kpi-value" id="kpi-caja-estado" style="font-size: 1.2rem;">Cerrada</span>
                </div>
                <div class="kpi-caja-detalle">
                    <div>Apertura: <span id="kpi-caja-hora">--:--</span></div>
                    <div>Monto: <span id="kpi-caja-monto">$0.00</span></div>
                </div>
            </div>
        </div>
    </div>

</div>
        <!-- Content Section -->
        <div id="content-section" class="content-grid" style="display: none;">
            <!-- Gráfica de Ventas -->
            <div class="dashboard-card">
                <h4 class="card-title">
                    <i class="fas fa-chart-area"></i>
                    Ventas de los Últimos 7 Días
                </h4>
                <div class="chart-container">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>

            <!-- Novedades -->
            <div class="dashboard-card">
                <h4 class="card-title">
                    <i class="fas fa-bell"></i>
                    Últimas Ventas
                </h4>
                <div id="last-sales-list" class="novedades-container">
                    <!-- Las ventas se cargarán aquí dinámicamente -->
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <?php include("../includes/scripts.php"); ?>

    <!-- Dashboard JavaScript -->
    <script src="../js/dashboard.js?v=<?php echo filemtime('../js/dashboard.js'); ?>"></script>

    <!-- Banner de Pago Script -->
    <script>
    $(document).ready(function() {
        // Consultar el estatus del pago
        $.ajax({
            url: '../api/get_corp_estatus.php',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.mostrar_banner) {
                    $('#banner-pago').fadeIn(300);
                }
            },
            error: function() { console.log('Error check pago'); }
        });

        // Funcionalidad cerrar (Solo oculta temporalmente)
        $('#cerrar-banner-pago').on('click', function() {
            $('#banner-pago').fadeOut(300);
        });
    });
    </script>

    <!-- Footer y Bottom Nav -->
    <?php include("../includes/footer.php"); ?>
    <?php include("../includes/bottom_nav_bar.php"); ?>
</body>

</html>