<?php
// Tu código PHP de login (se mantiene igual)
require_once("config/conexion.php");
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["enviar"]) && $_POST["enviar"] === "si") {
  require_once("models/Usuario.php");
  $usuario = new Usuario();

  $id = $_POST["id"] ?? '';
  $password = $_POST["password"] ?? '';
  $remember = isset($_POST["remember"]) ? true : false;

  $usuario->login($id, $password, $remember);
}
?>
<!DOCTYPE html>
<html lang="es" class="h-100">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso | Antojitos Santa Lucía</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/login.css?v=<?php echo filemtime('assets/css/login.css'); ?>">
</head>

<body class="h-100">
    <div class="container-fluid h-100">
        <div class="row h-100">

            <!-- Columna de Branding - Pantalla Completa -->
            <div class="col-lg-7 d-none d-lg-flex" id="branding-column">
                <div class="branding-content">
                    <h1>Antojitos Santa Lucía</h1>
                    <p>Antojitos Mexicanos</p>
                    
                    <div class="brand-features">
                        <div class="feature-item">
                            <div class="feature-icon">
                                <i class="fas fa-utensils"></i>
                            </div>
                            <span>Gestión completa de pedidos</span>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <span>Control de ventas en tiempo real</span>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                            <span>Optimizado para tablet y móvil</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Columna del Formulario - Pantalla Completa -->
            <div class="col-lg-5 col-12" id="form-column">
                <div class="login-card">
                    <div class="text-center mb-4">
                        <h2 class="fw-bold">Iniciar Sesión</h2>
                        <p class="text-muted">Accede al sistema de gestión</p>
                    </div>

                    <form action="" method="post" id="loginForm">
                        <?php
                        if (isset($_GET["m"])) {
                            $message = "";
                            $alert_type = "danger";
                            switch ($_GET["m"]) {
                                case "1":
                                    $message = "El usuario o la contraseña son incorrectos.";
                                    break;
                                case "2":
                                    $message = "Por favor, completa todos los campos.";
                                    $alert_type = "warning";
                                    break;
                                case "4":
                                    $message = "Perfil de empleado no encontrado o inactivo.";
                                    break;
                                case "5":
                                    $message = "Este usuario no tiene una sucursal asignada. Contacte al administrador.";
                                    break;
                            }
                            echo "<div class='alert alert-{$alert_type}' role='alert'>{$message}</div>";
                        }
                        ?>
                        
                        <div class="input-group mb-3">
                            <span class="input-group-text"><i class="fas fa-user"></i></span>
                            <input type="text" class="form-control form-control-lg" id="id" name="id"
                                placeholder="Ingresa tu usuario"
                                value="<?php echo isset($_COOKIE['remembered_user']) ? htmlspecialchars($_COOKIE['remembered_user']) : ''; ?>"
                                required>
                        </div>

                        <div class="input-group mb-4">
                            <span class="input-group-text"><i class="fas fa-lock"></i></span>
                            <input type="password" class="form-control form-control-lg" id="password" name="password"
                                placeholder="Ingresa tu contraseña" required>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="remember" id="remember"
                                    <?php echo isset($_COOKIE['remembered_user']) ? 'checked' : ''; ?>>
                                <label class="form-check-label" for="remember">Recordar mis datos</label>
                            </div>
                        </div>

                        <input type="hidden" name="enviar" value="si">
                        <button type="submit" class="btn btn-primary w-100 btn-lg" id="loginBtn">
                            <i class="fas fa-sign-in-alt me-2"></i>
                            Acceder al Sistema
                        </button>
                    </form>

                    <!-- Footer -->
                    <div class="text-center mt-4">
                        <small class="text-muted">
                            <i class="fas fa-shield-alt me-1"></i>
                            Sistema seguro y confiable
                        </small>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Efectos y validaciones mejorados
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('loginForm');
            const loginBtn = document.getElementById('loginBtn');

            // Animación de loading en el botón
            form.addEventListener('submit', function() {
                loginBtn.classList.add('loading');
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...';
                loginBtn.disabled = true;
            });

            // Efectos de focus en los inputs con mejor UX
            const inputGroups = document.querySelectorAll('.input-group');
            inputGroups.forEach(group => {
                const input = group.querySelector('.form-control');
                
                input.addEventListener('focus', function() {
                    group.style.transform = 'scale(1.01)';
                    group.style.transition = 'transform 0.3s ease';
                });

                input.addEventListener('blur', function() {
                    group.style.transform = 'scale(1)';
                });

                // Validación visual mejorada
                input.addEventListener('input', function() {
                    if (this.value.length > 0) {
                        this.classList.add('is-valid');
                        this.classList.remove('is-invalid');
                    } else {
                        this.classList.remove('is-valid');
                    }
                });
            });

            // Efecto de tecla Enter
            document.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !loginBtn.disabled) {
                    form.submit();
                }
            });

            // Animación de entrada para alertas
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach((alert, index) => {
                alert.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
            });
        });
    </script>
</body>

</html>