<?php
// Paso 1: Verificación de seguridad y permisos.
// Esta línea maneja todo: inicia la sesión, revisa si estás logueado y si tienes el rol correcto.
require_once("../includes/auth_check.php");

// Paso 2: El resto de tus inclusiones y lógica de la página van después.
require_once("../config/conexion.php");
require_once("../models/Caja.php");
require_once("../models/Usuario.php");

// 🔹 Obtener datos para la página
$vendedorID = $_SESSION["usu_id"];  // Obtener ID del usuario de la sesión

$caja = new Caja();
$productos_lista = $caja->get_productos();

$usuario = new Usuario();
$cajeros = $usuario->getCajerosActivos();
?>

<!DOCTYPE html>
<html lang="es">

<head>


  <?php include("../includes/head.php"); ?>
  <title>Caja</title>

  <link href="https://unpkg.com/tabulator-tables@5.0.7/dist/css/tabulator.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>


  <?php include("../includes/style.php"); ?>

  <link rel="stylesheet" href="../css/caja.css?v=<?php echo filemtime('../css/caja.css'); ?> ">

</head>


<body class="no-scroll">


  <?php include("../includes/bottom_nav_bar.php"); ?>



  <div class="scroll-container <?= $modo_oscuro ? 'dark-mode' : '' ?>">

    <!-- Se ha corregido la estructura HTML para que coincida con el CSS de altura completa -->
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-7">
          <div class="card shadow rounded">
            <div class="card-body">
              <div class="section-heading">
                <h2 class="card-title">Menú Principal 🍽️</h2>
              </div>

              <div class="categorias-scroll mb-3">
                <ul class="trending-filter d-flex">
                  <li><a class="is_active" href="#!" data-filter="*">Todos</a></li>
                  <li><a href="#!" data-filter=".favorito"><i class="fa fa-star text-warning"></i></a></li>
                  <?php
                  $categorias = array_unique(array_column($productos_lista, "pr_categoria"));
                  foreach ($categorias as $categoria) {
                    // Limpia la categoría para usarla como clase CSS (reemplaza espacios por guiones, elimina caracteres especiales)
                    $clase_categoria = str_replace(' ', '-', trim($categoria)); // Reemplaza espacios por guiones
                    $clase_categoria = preg_replace('/[^A-Za-z0-9\-]/', '', $clase_categoria); // Elimina caracteres no alfanuméricos ni guiones
                    echo '<li><a href="#!" data-filter=".' . htmlspecialchars($clase_categoria) . '">' . htmlspecialchars($categoria) . '</a></li>';
                  }
                  ?>
                </ul>
              </div>

              <div class="productos-scroll mt-3">
                <div class="row trending-box" id="productos-lista">
                  <?php foreach ($productos_lista as $producto) {
                    // Si el nombre contiene (Mixta), no lo mostramos en la lista general
                    if (strpos($producto["pr_nombre"], '(Mixta)') !== false) {
                        continue;
                    }

                    // ✅ CORRECCIÓN AQUÍ: Definir la variable y construir la cadena de clases dentro del mismo bloque PHP.
                    $clase_producto_categoria = str_replace(' ', '-', trim($producto["pr_categoria"]));
                    $clase_producto_categoria = preg_replace('/[^A-Za-z0-9\-]/', '', $clase_producto_categoria);

                    // Prepara los valores para los atributos data-id y onclick
                    $producto_id_html = htmlspecialchars($producto['ID'] ?? ''); // Usar ID real de la tabla rv_productos
                    $producto_pr_stock_html = htmlspecialchars($producto['pr_stock'] ?? '');
                    $producto_favorito_html = htmlspecialchars($producto["pr_favorito"] ?? '');
                    $producto_nombre_html = htmlspecialchars($producto["pr_nombre"] ?? ''); // Usar htmlspecialchars en el nombre
                    $producto_precioventa_html = htmlspecialchars($producto["pr_precioventa"] ?? ''); // Usar htmlspecialchars en el precio

                    // Construir la cadena de clases dinámicas
                    $dynamic_classes = "col-lg-4 col-md-6 mb-30 trending-items "
                      . $clase_producto_categoria . " "
                      . (($producto["pr_favorito"] == 1) ? "favorito" : "")
                      . " producto-card";
                  ?>
                  <div class=" <?php echo $dynamic_classes; ?>" data-favorito="<?php echo $producto_favorito_html; ?>"
                    data-id="<?php echo $producto_id_html; ?>" data-stock="<?php echo $producto_pr_stock_html; ?>">
                    <div class="item">
                      <div class="thumb"
                        onclick="agregarAlCarrito(<?php echo $producto_id_html; ?>,'<?php echo addslashes($producto_nombre_html); ?>', <?php echo $producto_precioventa_html; ?>)"
                        style="cursor: pointer;">
                        <div class="producto">
                          <div class="producto-imagen">
                            <img src="../assets/images/fondoproducto.png" alt="">
                            <h6 class="producto-nombre">
                              <?php echo $producto_nombre_html; ?>
                            </h6>
                          </div>
                        </div>
                        <div class="precio">
                          <span>$<?php echo number_format($producto["pr_precioventa"], 2); ?></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <?php } ?>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-5">
          <div class="card shadow rounded">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="flex-grow-1 me-2">
                  <input type="text" id="clienteNombreInput" class="form-control" placeholder="👤 Nombre del Cliente">
                </div>
                <!-- COMPACT CASH PILL -->
                <div id="cajaCompactPill" class="ms-2 d-flex align-items-center bg-light border rounded-pill px-2 py-1" style="white-space: nowrap; cursor: help;" title="Efectivo en Caja">
                  <i class="fa fa-wallet text-success me-1" style="font-size: 0.8rem;"></i>
                  <span id="cajaEfectivoStatus" class="fw-bold small" style="font-size: 0.85rem;">$0</span>
                  <button id="btnCortePreventivo" class="btn btn-link p-0 ms-1 d-none" style="line-height: 1;">
                    <i class="fa fa-cut text-warning" style="font-size: 0.9rem;"></i>
                  </button>
                </div>
                <button class="btn btn-ios btn-danger btn-sm ms-2" id="vaciarCarrito">
                  <i class="fa fa-trash"></i>
                </button>
              </div>

              <div class="cajero-scroll mb-3">
                <ul class="cajero-filter d-flex">
                  <?php
        $primero = true;
        foreach ($cajeros as $cajero) {
            // 1. Tomamos el nombre desde emp_nombre para la clase de color
            $nombre_limpio = preg_replace('/[^a-z0-9]/', '', strtolower($cajero['emp_nombre']));
            $clase_color = 'cajero-color-' . $nombre_limpio;

            // 2. La clase para el vendedor activo/inactivo se mantiene
            $class = $primero ? 'is_active vendedor-selector' : 'vendedor-selector';

            // 3. Unimos todo: la clase base, la de activo/inactivo y la de color.
            //    Usamos emp_id para el data-attribute y emp_nombre para el texto.
            echo '<li><a href="#!" class="' . $class . ' ' . $clase_color . '" data-cajero-id="' . htmlspecialchars($cajero['emp_id']) . '">' . htmlspecialchars($cajero['emp_nombre']) . '</a></li>';
            
            $primero = false;
        }
        ?>
                </ul>
              </div>
              <div id="instruccionCarrito" class="text-muted mb-2">
              </div>

              <div id="carrito" class="mt-3">
                <p class="text-muted">Tu carrito está vacío.</p>
              </div>

              <div class="payment-methods d-flex justify-content-center mt-4">
                <div class="item me-3 text-center tile-pago" data-tipo="tarjeta" style="cursor: pointer;">
                  <div class="image">
                    <i class="fa fa-credit-card fa-3x text-primary"></i>
                  </div>
                  <h5>Tarjeta</h5>
                </div>
                <div class="item me-3 text-center tile-pago" data-tipo="efectivo" style="cursor: pointer;">
                  <div class="image">
                    <i class="fa fa-wallet fa-3x text-success"></i>
                  </div>
                  <h5>Efectivo</h5>
                </div>
                <div class="item me-3 text-center tile-pago" data-tipo="transferencia" style="cursor: pointer;">
                  <div class="image">
                    <i class="fa fa-exchange-alt fa-3x text-info"></i>
                  </div>
                  <h5>Transf</h5>
                </div>
              </div>

              <hr class="my-4">

              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0 fs-3">Total:</h5>
                <h5 class="fw-bold mb-0 fs-3" id="totalCarrito">$0.00</h5>
              </div>

              <button class="btn btn-ios btn-primary w-100 mt-2" id="btnPagar">Pagar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade" id="modalPago" tabindex="-1" aria-labelledby="modalPagoLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Ingresar Monto Recibido</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-center">
          <input type="text" id="inputPago" class="form-control text-center mb-3" inputmode="numeric" pattern="[0-9]*">


          <div class="container keypad-container">
            <div class="keypad-grid">
              <button class="btn btn-num" data-num="1">1</button>
              <button class="btn btn-num" data-num="2">2</button>
              <button class="btn btn-num" data-num="3">3</button>

              <button class="btn btn-num" data-num="4">4</button>
              <button class="btn btn-num" data-num="5">5</button>
              <button class="btn btn-num" data-num="6">6</button>

              <button class="btn btn-num" data-num="7">7</button>
              <button class="btn btn-num" data-num="8">8</button>
              <button class="btn btn-num" data-num="9">9</button>

              <button class="btn btn-clear" id="btn-borrar">C</button>
              <button class="btn btn-num" data-num="0">0</button>
              <button class="btn btn-confirm" id="btn-confirmar-pago"><i class="fa fa-check"></i></button>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-center">

        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalComanda" tabindex="-1" aria-labelledby="modalComandaLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalComandaLabel">Personalizar Platillo</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted">Selecciona las opciones para el platillo: <strong
              id="platilloPersonalizarNombre"></strong></p>
          <input type="hidden" id="platilloPersonalizarId">

          <!-- Nav Tabs -->
          <ul class="nav nav-tabs mb-3" id="comandaTabs" role="tablist">
            <li class="nav-item" role="presentation" id="nav-item-mezcla" style="display: none;">
              <button class="nav-link active fw-bold text-primary" id="mezcla-tab" data-bs-toggle="tab" data-bs-target="#tab-mezcla" type="button" role="tab" aria-controls="tab-mezcla" aria-selected="true">
                <i class="fas fa-list-ol me-1"></i> Cantidades
              </button>
            </li>
            <li class="nav-item" role="presentation" id="nav-item-ingredientes">
              <button class="nav-link fw-bold text-success" id="ingredientes-tab" data-bs-toggle="tab" data-bs-target="#tab-ingredientes" type="button" role="tab" aria-controls="tab-ingredientes" aria-selected="false">
                <i class="fas fa-edit me-1"></i> Ingredientes extras
              </button>
            </li>
          </ul>

          <!-- Tab Contents -->
          <div class="tab-content" id="comandaTabsContent">
            
            <!-- TARJETA 1: Mezcla de Cantidades (Orden Mixta) -->
            <div class="tab-pane fade show active" id="tab-mezcla" role="tabpanel" aria-labelledby="mezcla-tab">
                <?php
                $productos_mixta = array_filter($productos_lista, function($p) {
                    return strpos($p['pr_nombre'], '(Mixta)') !== false;
                });
                
                if (!empty($productos_mixta)) {
                    foreach ($productos_mixta as $pm) {
                        $nombre_base = trim(str_replace('(Mixta)', '', $pm['pr_nombre']));
                        $precio = $pm['pr_precioventa'];
                        $precio_formateado = number_format($precio, 0); 
                        if (floor($precio) != $precio) {
                            $precio_formateado = number_format($precio, 2);
                        }
                        $id_real = htmlspecialchars($pm['ID']);
                        ?>
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <div>
                                <div class="fw-semibold fs-5"><?php echo htmlspecialchars($nombre_base); ?></div>
                                <div class="text-muted">$<?php echo $precio_formateado; ?> c/u</div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <button type="button" class="btn-stepper btn-stepper-minus" data-target="cantMixta_<?php echo $id_real; ?>">−</button>
                                <span class="stepper-value" id="valMixta_<?php echo $id_real; ?>">0</span>
                                <input type="hidden" id="cantMixta_<?php echo $id_real; ?>" class="cant-mixta" data-id="<?php echo $id_real; ?>" data-nombre="<?php echo htmlspecialchars($nombre_base); ?>" data-precio="<?php echo htmlspecialchars($precio); ?>" value="0">
                                <button type="button" class="btn-stepper btn-stepper-plus" data-target="cantMixta_<?php echo $id_real; ?>">+</button>
                            </div>
                        </div>
                        <?php
                    }
                } else {
                    echo '<div class="text-muted py-3 text-center">No hay productos mixtos configurados.</div>';
                }
                ?>

                <!-- Total Dinámico Mixta -->
                <div class="d-flex justify-content-between align-items-center pt-3 mt-2 bg-light p-3 rounded">
                    <h5 class="mb-0 fs-5 text-secondary">Total Mixta:</h5>
                    <h5 class="mb-0 fw-bold fs-4 text-primary" id="totalOrdenMixta">$0.00</h5>
                </div>
            </div>

            <!-- TARJETA 2: Personalizar (Omitir Ingredientes Original) -->
            <div class="tab-pane fade" id="tab-ingredientes" role="tabpanel" aria-labelledby="ingredientes-tab">
              <div class="row g-3">
                <div class="col-md-4">
                  <h6>Verduras 🥬</h6>
                  <div id="opcionesVerduras" class="ingredientes-scroll">
                  </div>
                </div>

                <div class="col-md-4">
                  <h6>Aderezos 🥫</h6>
                  <div id="opcionesAderezos" class="ingredientes-scroll">
                  </div>
                </div>

                <div class="col-md-4">
                  <h6>Otros ✨</h6>
                  <div id="opcionesOtros" class="ingredientes-scroll">
                  </div>
                  <div class="mb-2"></div>
                  <label for="observacionesTextarea" class="form-label">Observaciones extras:</label>
                  <textarea class="form-control" id="observacionesTextarea" rows="2"
                    placeholder="Ej. Sin cebolla..."></textarea>
                </div>
              </div>
              <p class="text-muted mt-3 small">Selecciona los ingredientes que deseas OMITIR o agregar como extra.</p>
            </div>
            
          </div>
        </div>
        <div class="modal-footer justify-content-center">
          <button type="button" class="btn btn-ios btn-success" id="btnAgregarPlatilloPersonalizado">Añadir al
            Carrito</button>
          <button type="button" class="btn btn-ios btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="modalTransferencia" tabindex="-1" aria-labelledby="modalTransferenciaLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modalTransferenciaLabel">Datos para Transferencia</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="text-center">Por favor, realiza la transferencia a la siguiente cuenta y después haz clic en "Pagar"
            para registrar la venta.</p>
          <hr>
          <dl class="row text-center fs-5">
            <dt class="col-sm-4">Titular:</dt>
            <dd class="col-sm-8">Angel Loera</dd>

            <dt class="col-sm-4">Banco:</dt>
            <dd class="col-sm-8">STP</dd>

            <dt class="col-sm-4">Clave:</dt>
            <dd class="col-sm-8">64 6180 1370 0491 1371</dd>
          </dl>
          <hr>
        </div>
        <div class="modal-footer justify-content-center">
          <button type="button" class="btn btn-ios btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-ios btn-primary" id="btnConfirmarTransferencia">Pagar</button>
        </div>
      </div>
    </div>
  </div>
  <?php include("../includes/scripts.php"); ?>
  <?php include("../includes/footer.php"); ?>


  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

  <script src="../js/caja.js?v=<?php echo filemtime('../js/caja.js'); ?>"></script>

</body>

</html>
