<?php
require_once("../config/conexion.php");
if (!isset($_SESSION["usu_id"])) {
  header("Location: ../index.php");
  exit();
}

// 🔹 Obtener productos desde la base de datos
require_once("../models/Caja.php");

$vendedorID = $_SESSION["usu_id"];  // Guardamos el ID del usuario en una variable
$caja = new Caja();
$productos_lista = $caja->get_productos(); // Asegúrate de que esto sigue trayendo 'pr_stock'

// 🔹 Obtener barberos activos
require_once("../models/Usuario.php");
$usuario = new Usuario();
$barberos = $usuario->getBarberosActivos();

?>

<!DOCTYPE html>
<html lang="es">

<head>
  <?php include("../includes/head.php"); ?>
</head>

<body>
  <?php include("../includes/bottom_nav_bar.php"); ?>



  <div class="scroll-container">
    <div class="card-body">


      <div class="section trending">
        <div class="container">
          <div class="row">
            <div class="mb-3"></div>

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
                        // ✅ CORRECCIÓN AQUÍ: Definir la variable y construir la cadena de clases dentro del mismo bloque PHP.
                        $clase_producto_categoria = str_replace(' ', '-', trim($producto["pr_categoria"]));
                        $clase_producto_categoria = preg_replace('/[^A-Za-z0-9\-]/', '', $clase_producto_categoria);

                        // Prepara los valores para los atributos data-id y onclick
                        $producto_id_html = htmlspecialchars($producto['ID']); // Usar ID real de la tabla rv_productos
                        $producto_pr_stock_html = htmlspecialchars($producto['pr_stock']);
                        $producto_favorito_html = htmlspecialchars($producto["pr_favorito"]);
                        $producto_nombre_html = htmlspecialchars($producto["pr_nombre"]); // Usar htmlspecialchars en el nombre
                        $producto_precioventa_html = htmlspecialchars($producto["pr_precioventa"]); // Usar htmlspecialchars en el precio

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
                              onclick="agregarAlCarrito(<?php echo $producto_id_html; ?>,'<?php echo $producto_nombre_html; ?>', <?php echo $producto_precioventa_html; ?>)"
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
                    <h2 class="card-title mb-0">Carrito de compras 🛒</h2> <button class="btn btn-ios btn-danger btn-sm"
                      id="vaciarCarrito">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>

                  <div class="categorias-scroll mb-3">
                    <ul class="trending-filter d-flex">
                      <?php
                      $primero = true;
                      foreach ($barberos as $barbero) {
                        $class = $primero ? 'is_active vendedor-selector' : 'vendedor-selector';
                        echo '<li><a href="#!" class="' . $class . '" data-barbero-id="' . htmlspecialchars($barbero['usu_id']) . '">' . htmlspecialchars($barbero['usu_nom']) . '</a></li>';
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
          <input type="text" id="inputPago" class="form-control text-center mb-3">

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

          <div class="row g-3">
            <div class="col-md-4">
              <h6>Verduras 🥬</h6>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Cebolla" id="vegCebolla">
                <label class="form-check-label" for="vegCebolla">Cebolla</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Tomate" id="vegTomate">
                <label class="form-check-label" for="vegTomate">Tomate</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Lechuga" id="vegLechuga">
                <label class="form-check-label" for="vegLechuga">Lechuga</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Pepinillos" id="vegPepinillos">
                <label class="form-check-label" for="vegPepinillos">Pepinillos</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Aguacate" id="vegAguacate">
                <label class="form-check-label" for="vegAguacate">Aguacate</label>
              </div>
            </div>

            <div class="col-md-4">
              <h6>Aderezos 🥫</h6>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Mayonesa" id="dreMayonesa">
                <label class="form-check-label" for="dreMayonesa">Mayonesa</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Catsup" id="dreCatsup">
                <label class="form-check-label" for="dreCatsup">Catsup</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Mostaza" id="dreMostaza">
                <label class="form-check-label" for="dreMostaza">Mostaza</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Salsa BBQ" id="dreBBQ">
                <label class="form-check-label" for="dreBBQ">Salsa BBQ</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Aderezo Ranch" id="dreRanch">
                <label class="form-check-label" for="dreRanch">Aderezo Ranch</label>
              </div>
            </div>

            <div class="col-md-4">
              <h6>Otros ✨</h6>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Queso Extra" id="otherQueso">
                <label class="form-check-label" for="otherQueso">Queso Extra</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Bacon" id="otherBacon">
                <label class="form-check-label" for="otherBacon">Bacon</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="Papas fritas" id="otherPapas">
                <label class="form-check-label" for="otherPapas">Papas fritas</label>
              </div>
              <div class="mb-2"></div>
              <label for="observacionesTextarea" class="form-label">Observaciones:</label>
              <textarea class="form-control" id="observacionesTextarea" rows="3"
                placeholder="Ej. Sin cebolla, extra picante..."></textarea>
            </div>
          </div>
          <p class="text-muted mt-3">Nota: Solo los platillos marcados como "no stock" o servicio abrirán esta ventana.
          </p>
        </div>
        <div class="modal-footer justify-content-center">
          <button type="button" class="btn btn-ios btn-success" id="btnAgregarPlatilloPersonalizado">Añadir al
            Carrito</button>
          <button type="button" class="btn btn-ios btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>

  <?php include("../includes/scripts.php"); ?>
  <script src="../js/caja.js?v=<?php echo filemtime('../js/caja.js'); ?>"></script>

</body>

</html>