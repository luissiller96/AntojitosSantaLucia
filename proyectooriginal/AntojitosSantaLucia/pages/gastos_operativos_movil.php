<?php
require_once("../includes/auth_check.php");
require_once("../config/conexion.php");
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <title>Registrar Gasto - Antojitos Santa Lucía</title>

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <!-- CSS Móvil -->
    <link rel="stylesheet" href="../css/gastos_operativos_movil.css?v=<?php echo time(); ?>">
</head>

<body>
    <!-- Header Móvil -->
    <div class="mobile-header">
        <button class="btn-back" onclick="window.history.back()">
            <i class="fas fa-arrow-left"></i>
        </button>
        <h1 class="header-title">Registrar Gasto</h1>
        <button class="btn-menu" id="btn-historial">
            <i class="fas fa-history"></i>
        </button>
    </div>

    <!-- Formulario Principal -->
    <div class="mobile-container">
        <form id="form-gasto-movil">
            
            <!-- Descripción -->
            <div class="form-group-mobile">
                <label class="form-label-mobile">
                    <i class="fas fa-edit"></i> Concepto
                </label>
                <input type="text" class="form-control-mobile" id="m-descripcion" 
                       name="descripcion" placeholder="¿Qué compraste?" required autofocus>
            </div>

            <!-- Monto -->
            <div class="form-group-mobile">
                <label class="form-label-mobile">
                    <i class="fas fa-dollar-sign"></i> Monto
                </label>
                <div class="input-currency">
                    <span class="currency-symbol">$</span>
                    <input type="number" class="form-control-mobile form-control-currency" 
                           id="m-monto" name="precio_unitario" placeholder="0.00" 
                           step="0.01" min="0.01" required>
                </div>
            </div>

            <!-- Método de Pago -->
            <div class="form-group-mobile">
                <label class="form-label-mobile">
                    <i class="fas fa-credit-card"></i> Método de Pago
                </label>
                <div class="payment-methods">
                    <button type="button" class="btn-payment active" data-method="efectivo">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Efectivo</span>
                    </button>
                    <button type="button" class="btn-payment" data-method="tarjeta">
                        <i class="fas fa-credit-card"></i>
                        <span>Tarjeta</span>
                    </button>
                    <button type="button" class="btn-payment" data-method="transferencia">
                        <i class="fas fa-exchange-alt"></i>
                        <span>Transfer.</span>
                    </button>
                </div>
                <input type="hidden" id="m-metodo" name="metodo_pago" value="efectivo">
            </div>

            <!-- Producto (Opcional) -->
            <div class="form-group-mobile">
                <label class="form-label-mobile">
                    <i class="fas fa-box"></i> Producto (Opcional)
                </label>
                <select class="form-control-mobile" id="m-producto" name="producto_id">
                    <option value="">-- Sin producto --</option>
                </select>
            </div>

            <!-- Cantidad Producto (condicional) -->
            <div class="form-group-mobile d-none" id="campo-cantidad-mobile">
                <label class="form-label-mobile">
                    <i class="fas fa-boxes"></i> Cantidad
                </label>
                <input type="number" class="form-control-mobile" id="m-cantidad-producto" 
                       name="cantidad_producto" placeholder="Cantidad" min="1">
            </div>

            <!-- Comentarios (Expandible) -->
            <div class="form-group-mobile">
                <button type="button" class="btn-expand" id="btn-expand-comentarios">
                    <i class="fas fa-comment"></i> Agregar comentario
                </button>
                <div class="expandable-content d-none" id="comentarios-section">
                    <textarea class="form-control-mobile" id="m-comentarios" 
                              name="comentario" rows="3" placeholder="Notas adicionales..."></textarea>
                </div>
            </div>

            <!-- Botón Guardar -->
            <button type="submit" class="btn-save-mobile" id="btn-guardar">
                <i class="fas fa-save"></i> Guardar Gasto
            </button>

        </form>
    </div>

    <!-- Historial Rápido (Modal) -->
    <div class="modal fade" id="modalHistorial" tabindex="-1">
        <div class="modal-dialog modal-fullscreen">
            <div class="modal-content">
                <div class="modal-header-mobile">
                    <h5 class="modal-title">Últimos Gastos</h5>
                    <button type="button" class="btn-close-mobile" data-bs-dismiss="modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body-mobile">
                    <div id="historial-lista">
                        <!-- Se carga dinámicamente -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast de Confirmación -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="successToast" class="toast align-items-center text-white bg-success border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-check-circle"></i> Gasto registrado correctamente
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <script>
        // Configuración de fecha automática
        const fechaActual = new Date().toISOString().slice(0, 16);
    </script>
    
    <script src="../js/gastos_operativos_movil.js?v=<?php echo time(); ?>"></script>
</body>

</html>