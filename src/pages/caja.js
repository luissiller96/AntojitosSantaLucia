/**
 * caja.js - Módulo de Caja / POS
 * Clona: pages/caja.php + js/caja.js + models/Caja.php + controller/ventas.php
 * Reemplaza AJAX/jQuery/Bootstrap/SweetAlert → SQLite local + JS puro
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderCaja(container) {
  injectCSS('caja-css', '/assets/css/caja.css');

  // Cargar productos y cajeros de SQLite
  const [productos, cajeros] = await Promise.all([
    getProductos(),
    getCajeros()
  ]);

  CajaApp.productosData = productos; // Store all products for dynamic UI

  // Generar los sufijos de los padres ($0)
  const parents = productos.filter(p => Number(p.pr_precioventa) === 0);
  const childSuffixes = parents.map(p => getSuffixForParent(p.pr_nombre));
  const isChildProduct = (p) => childSuffixes.some(s => p.pr_nombre.includes(`(${s})`));

  renderLayout(container, 'caja', getCajaHTML(productos, cajeros, isChildProduct));
  CajaApp.init(productos);
}

function getSuffixForParent(parentName) {
  const name = parentName.trim();
  return name.toLowerCase() === 'orden mixta' ? 'Mixta' : name;
}

function injectCSS(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet'; link.href = href;
  document.head.appendChild(link);
}

// ─── HTML ────────────────────────────────────────────────────────────────────
function getCajaHTML(productos, cajeros, isChildProduct) {
  const categorias = [...new Set(productos.map(p => p.pr_categoria))];

  return `
  <div class="caja-wrapper">
    <div class="caja-row">

      <!-- ====== COLUMNA IZQUIERDA: MENÚ ====== -->
      <div class="caja-col-menu">
        <div class="caja-menu-title">Menú Principal 🍽️</div>

        <!-- Filtro Categorías -->
        <div class="categorias-scroll">
          <ul class="trending-filter">
            <li><a class="is_active" href="#" data-filter="*">Todos</a></li>
            <li><a href="#" data-filter=".favorito"><i class="fa fa-star" style="color:#f59e0b;"></i></a></li>
            ${categorias.map(cat => {
    const cls = slugify(cat);
    return `<li><a href="#" data-filter=".${cls}">${cat}</a></li>`;
  }).join('')}
          </ul>
        </div>

        <!-- Productos Grid -->
        <div class="productos-scroll">
          <div class="productos-grid" id="productos-lista">
            ${productos.filter(p => !isChildProduct(p)).map(p => {
    const cats = slugify(p.pr_categoria);
    const fav = p.pr_favorito == 1 ? 'favorito' : '';
    return `
              <div class="producto-card btn-accion-agregar ${cats} ${fav}"
                   data-id="${p.ID}"
                   data-stock="${p.pr_stock ?? 'NULL'}"
                   data-favorito="${p.pr_favorito}"
                   data-nombre="${escJs(p.pr_nombre)}"
                   data-precio="${p.pr_precioventa}">
                <div class="producto-imagen">
                  <img src="/assets/images/fondoproducto.png" alt="" onerror="this.style.display='none'">
                  <h6 class="producto-nombre">${p.pr_nombre}</h6>
                </div>
                <div class="producto-precio">$${Number(p.pr_precioventa).toFixed(2)}</div>
              </div>`;
  }).join('')}
          </div>
        </div>
      </div>

      <!-- ====== COLUMNA DERECHA: CARRITO ====== -->
      <div class="caja-col-carrito">

        <!-- Top Bar -->
        <div class="carrito-top-bar">
          <div class="tipo-orden-bar">
            <button class="btn-tipo-orden active" data-tipo="llevar"><i class="fa fa-shopping-bag"></i> Llevar</button>
            <button class="btn-tipo-orden" data-tipo="comer_aqui"><i class="fa fa-utensils"></i> Aquí</button>
            <button class="btn-tipo-orden" data-tipo="domicilio"><i class="fa fa-motorcycle"></i> Domicilio</button>
          </div>
          <button class="btn-pendientes" id="btnOrdenesPendientes" title="Ver órdenes pendientes">
            ⏳ <span id="badgePendientes"></span>
          </button>
          <div id="cajaCompactPill" class="caja-pill" title="Efectivo en Caja">
            <i class="fa fa-wallet pill-icon"></i>
            <span id="cajaEfectivoStatus" style="font-weight:700;">$0</span>
            <button id="btnCortePreventivo" class="btn-corte" title="Corte preventivo">
              <i class="fa fa-cut" style="color:#ffc107;font-size:.9rem;"></i>
            </button>
          </div>
          <button class="btn-vaciar" id="vaciarCarrito" title="Vaciar carrito">
            <i class="fa fa-trash"></i>
          </button>
        </div>

        <!-- Panel contextual tipo orden -->
        <div id="panel-tipo-orden">
          <div id="panel-llevar" class="orden-panel">
            <input type="number" id="sensorInput" class="sensor-input"
                   placeholder="# Sensor buscapersonas" min="1" max="9999">
          </div>
          <div id="panel-comer_aqui" class="orden-panel" style="display:none;"></div>
          <div id="panel-domicilio" class="orden-panel" style="display:none;">
            <div class="domicilio-fields">
              <input type="text" id="domCalleInput" placeholder="Calle">
              <input type="text" id="domNumInput" placeholder="Núm." style="max-width:70px;">
              <input type="text" id="domColoniaInput" placeholder="Colonia">
            </div>
            <div class="envio-row">
              <span>Envío:</span>
              <button class="btn-envio-preset" data-monto="20">$20</button>
              <button class="btn-envio-preset" data-monto="30">$30</button>
              <button class="btn-envio-preset" data-monto="50">$50</button>
              <input type="number" id="costoEnvioInput" placeholder="$0" min="0">
            </div>
          </div>
        </div>

        <!-- Vendedores / Cajeros -->
        <div class="cajero-scroll">
          <ul class="cajero-filter">
            ${cajeros.map((c, i) => {
    const cls = 'cajero-color-' + slugify(c.emp_nombre);
    const active = i === 0 ? 'is_active' : '';
    return `<li><a href="#" class="vendedor-selector ${active} ${cls}"
                         data-cajero-id="${c.emp_id}">${c.emp_nombre}</a></li>`;
  }).join('')}
          </ul>
        </div>

        <!-- Instrucción -->
        <p class="instruccion-carrito" id="instruccionCarrito" style="display:none;">
          Haz clic en un ítem del carrito para disminuir la cantidad o eliminarlo.
        </p>

        <!-- Lista Carrito -->
        <div id="carrito-lista">
          <p class="carrito-vacio">Tu carrito está vacío.</p>
        </div>

        <!-- Métodos de Pago -->
        <div class="payment-methods">
          <div class="tile-pago" data-tipo="tarjeta">
            <i class="fa fa-credit-card" style="color:#007aff;"></i>
            <h5>Tarjeta</h5>
          </div>
          <div class="tile-pago" data-tipo="efectivo">
            <i class="fa fa-wallet" style="color:#28a745;"></i>
            <h5>Efectivo</h5>
          </div>
          <div class="tile-pago" data-tipo="transferencia">
            <i class="fa fa-exchange-alt" style="color:#17a2b8;"></i>
            <h5>Transf</h5>
          </div>
        </div>

        <!-- Pago Mixto -->
        <button class="btn-pago-mixto" id="btnPagoMixto">
          <i class="fa fa-layer-group"></i> Pago Mixto
        </button>
        <div id="panel-pago-mixto" class="panel-pago-mixto" style="display:none;">
          <div class="mixto-row">
            <i class="fa fa-wallet" style="color:#28a745;"></i>
            <span>Efectivo</span>
            <input type="number" id="mixtoEfectivo" min="0" step="0.01" placeholder="$0.00">
          </div>
          <div class="mixto-row">
            <i class="fa fa-credit-card" style="color:#007aff;"></i>
            <span>Tarjeta</span>
            <input type="number" id="mixtoTarjeta" min="0" step="0.01" placeholder="$0.00">
          </div>
          <div class="mixto-row">
            <i class="fa fa-exchange-alt" style="color:#17a2b8;"></i>
            <span>Transf</span>
            <input type="number" id="mixtoTransferencia" min="0" step="0.01" placeholder="$0.00">
          </div>
          <div class="mixto-status">
            <span id="mixtoFaltanteLabel">Faltante:</span> <strong id="mixtoFaltante">$0.00</strong>
          </div>
        </div>

        <hr style="margin:8px 0; border-color:#e9ecef;">

        <!-- Total -->
        <div class="carrito-total">
          <span class="label">Total:</span>
          <span class="valor" id="totalCarrito">$0.00</span>
        </div>

        <!-- Botón Pagar -->
        <button class="btn-pagar" id="btnPagar" disabled>Pagar</button>

      </div>
    </div>
  </div>

  <!-- ====== MODAL: PAGO EFECTIVO ====== -->
  <div class="cj-modal-overlay" id="modal-pago">
    <div class="cj-modal">
      <div class="cj-modal-header">
        <h5>Ingresar Monto Recibido</h5>
        <button class="cj-modal-close" id="close-modal-pago">&times;</button>
      </div>
      <div class="cj-modal-body">
        <div class="cj-display">
          <div class="cj-display-label">Monto recibido</div>
          <div class="cj-display-value" id="inputPagoDisplay">$</div>
        </div>
        <input type="hidden" id="inputPago" value="">
        <div class="keypad-grid">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="btn-num" data-num="${n}">${n}</button>`).join('')}
          <button class="btn-clear" id="btn-borrar-pago">C</button>
          <button class="btn-num" data-num="0">0</button>
          <button class="btn-confirm" id="btn-confirmar-pago"><i class="fa fa-check"></i></button>
        </div>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: TRANSFERENCIA ====== -->
  <div class="cj-modal-overlay" id="modal-transferencia">
    <div class="cj-modal">
      <div class="cj-modal-header">
        <h5>Datos para Transferencia</h5>
        <button class="cj-modal-close" id="close-modal-transferencia">&times;</button>
      </div>
      <div class="cj-modal-body">
        <p style="text-align:center; color:#6c757d;">
          Realiza la transferencia y luego haz clic en "Pagar" para registrar la venta.
        </p>
        <hr>
        <dl style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:.95rem; text-align:center;">
          <dt style="color:#6c757d; font-weight:700;">Titular:</dt><dd>Angel Loera</dd>
          <dt style="color:#6c757d; font-weight:700;">Banco:</dt><dd>STP</dd>
          <dt style="color:#6c757d; font-weight:700;">Clave:</dt><dd>64 6180 1370 0491 1371</dd>
        </dl>
        <hr>
      </div>
      <div class="cj-modal-footer">
        <button class="cj-btn-secondary" id="cancelar-transferencia">Cancelar</button>
        <button class="cj-btn-primary"   id="confirmar-transferencia">Pagar</button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: ORDEN MIXTA ====== -->
  <div class="cj-modal-overlay" id="modal-comanda">
    <div class="cj-modal lg" style="max-width: 900px; width: 95%;">
      <div class="cj-modal-header">
        <h5>Crear <span id="platilloPersonalizarNombre"></span></h5>
        <button class="cj-modal-close" id="close-modal-comanda">&times;</button>
      </div>
      <div class="cj-modal-body" style="padding: 15px;">
        <input type="hidden" id="platilloPersonalizarId">

        <!-- Panel Mixta -->
        <div id="tab-mezcla" style="padding: 10px 0;"></div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#f8f9fa; border-radius:10px; margin-top:20px; border: 2px solid #e9ecef;">
          <span style="color:#6c757d; font-weight:700; font-size:1.1rem;">Total:</span>
          <span style="font-weight:800; font-size:1.5rem; color:#007aff;" id="totalOrdenMixta">$0.00</span>
        </div>
      </div>
      <div class="cj-modal-footer">
        <button class="cj-btn-secondary" id="cancelar-comanda">Cancelar</button>
        <button class="cj-btn-success"   id="btnAgregarPlatilloPersonalizado">Añadir al Carrito</button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL ALERT / CONFIRM ====== -->
  <div class="cj-alert-overlay" id="cj-alert-overlay">
    <div class="cj-alert-box">
      <div class="cj-alert-header" id="cj-alert-header">
        <h5 id="cj-alert-title">Aviso</h5>
        <button class="cj-modal-close" id="cj-alert-close">&times;</button>
      </div>
      <div class="cj-alert-body" id="cj-alert-body"></div>
      <div class="cj-alert-footer">
        <button class="cj-btn-secondary" id="cj-alert-cancel" style="display:none;">Cancelar</button>
        <button class="cj-btn-primary"   id="cj-alert-confirm">Aceptar</button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: ÓRDENES PENDIENTES ====== -->
  <div class="cj-modal-overlay" id="modal-pendientes">
    <div class="cj-modal" style="max-width:560px; width:95%;">
      <div class="cj-modal-header" style="background:linear-gradient(135deg,#28a745,#1e7e34);">
        <h5>🍽️ Órdenes Pendientes</h5>
        <button class="cj-modal-close" id="close-modal-pendientes">&times;</button>
      </div>
      <div class="cj-modal-body" id="pendientes-lista" style="max-height:65vh; overflow-y:auto; padding:1rem;">
        <p style="text-align:center; color:#6c757d;">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: COBRAR ORDEN PENDIENTE ====== -->
  <div class="cj-modal-overlay" id="modal-cobrar-pendiente">
    <div class="cj-modal" style="max-width:420px; width:95%;">
      <div class="cj-modal-header" style="background:linear-gradient(135deg,#28a745,#1e7e34);">
        <h5 id="cobrar-pendiente-title">Cobrar Orden</h5>
        <button class="cj-modal-close" id="close-modal-cobrar-pendiente">&times;</button>
      </div>
      <div class="cj-modal-body">
        <div id="cobrar-pendiente-items" style="font-size:.9rem; color:#444; margin-bottom:8px; max-height:180px; overflow-y:auto;"></div>
        <div style="text-align:right; font-size:1.5rem; font-weight:800; color:#333; margin-bottom:10px;" id="cobrar-pendiente-total"></div>
        <div class="cobrar-pago-panel">
          <div style="font-size:.85rem; font-weight:700; color:#555; margin-bottom:6px;">Selecciona método de pago:</div>
          <div class="payment-methods" id="cobrar-pago-methods" style="margin:0 0 6px;">
            <div class="tile-pago" data-tipo-cobro="tarjeta">
              <i class="fa fa-credit-card" style="color:#007aff;"></i>
              <h5>Tarjeta</h5>
            </div>
            <div class="tile-pago" data-tipo-cobro="efectivo">
              <i class="fa fa-wallet" style="color:#28a745;"></i>
              <h5>Efectivo</h5>
            </div>
            <div class="tile-pago" data-tipo-cobro="transferencia">
              <i class="fa fa-exchange-alt" style="color:#17a2b8;"></i>
              <h5>Transf</h5>
            </div>
          </div>
          <div class="cobrar-efectivo-row" id="cobrar-efectivo-row" style="display:none;">
            <label>Monto recibido:</label>
            <input type="number" id="cobrar-efectivo-input" placeholder="$0" min="0">
          </div>
        </div>
      </div>
      <div class="cj-modal-footer">
        <button class="cj-btn-secondary" id="cobrar-pendiente-cancelar">Cancelar</button>
        <button class="cj-btn-success" id="cobrar-pendiente-confirmar" disabled>Cobrar</button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: CORTE PREVENTIVO ====== -->
  <div class="cj-modal-overlay" id="modal-corte">
    <div class="cj-modal" style="max-width:360px; width:95%;">
      <div class="cj-modal-header" style="background:linear-gradient(135deg,#ffc107,#ff9800);">
        <h5><i class="fa fa-cut"></i> Corte Preventivo</h5>
        <button class="cj-modal-close" id="close-modal-corte">&times;</button>
      </div>
      <div class="cj-modal-body">
        <p id="corte-info-caja" style="font-size:13px;color:#6c757d;margin:0 0 12px;"></p>
        <div class="sal-form-group">
          <label style="display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px;">¿Cuánto deseas retirar? ($)</label>
          <input type="number" id="corteMontoInput" min="0.01" step="0.01" placeholder="0.00"
            style="width:100%;padding:10px 12px;border:1.5px solid #ced4da;border-radius:8px;font-size:15px;outline:none;box-sizing:border-box;">
        </div>
      </div>
      <div class="cj-modal-footer">
        <button class="btn-pago-mixto" id="corte-cancelar" style="background:#e9ecef;color:#495057;box-shadow:none;">Cancelar</button>
        <button class="btn-pago-mixto" id="corte-confirmar" style="background:linear-gradient(135deg,#ffc107,#ff9800);color:#343a40;">
          <i class="fa fa-check"></i> Retirar
        </button>
      </div>
    </div>
  </div>

  <!-- LOADING -->
  <div class="cj-loading" id="cj-loading">
    <div class="cj-spinner"></div>
    <div class="cj-loading-text" id="cj-loading-text">Procesando...</div>
  </div>
  `;
}

// ─── App Principal ────────────────────────────────────────────────────────────
const CajaApp = {
  carrito: [],
  totalCarrito: 0,
  metodoPago: '',
  vendedorSeleccionado: null,
  cambio: 0,
  currentFilter: '*',
  tipoOrden: 'llevar',
  costoEnvio: 0,
  pagoMixtoActivo: false,
  montosMixtos: { efectivo: 0, tarjeta: 0, transferencia: 0 },
  _cajaEfectivo: 0,
  _cajaFondo: 0,
  // Para el modal de cobrar pendiente
  _cobrarTicket: null,
  _cobrarMetodo: '',
  _cobrarTotal: 0,

  init(productos) {
    this.bindEvents();
    this.actualizarVendedorSeleccionado();
    this.actualizarEstadoCaja();
    this.actualizarBadgePendientes();
  },

  // ─── Filtro Categorías ─────────────────────────────────────────────────────
  bindEvents() {
    // Filtro
    document.querySelectorAll('.trending-filter a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.trending-filter a').forEach(x => x.classList.remove('is_active'));
        a.classList.add('is_active');
        this.filtrarProductos(a.dataset.filter);
      });
    });

    // Vendedores
    document.querySelectorAll('.vendedor-selector').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.vendedor-selector').forEach(x => x.classList.remove('is_active'));
        a.classList.add('is_active');
        this.actualizarVendedorSeleccionado();
      });
    });

    // Delegación de eventos para agregar productos
    const grid = document.getElementById('productos-lista');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-accion-agregar');
        if (btn) {
          this.agregarAlCarrito(
            Number(btn.dataset.id),
            btn.dataset.nombre,
            parseFloat(btn.dataset.precio)
          );
        }
      });
    }

    // Métodos de pago
    document.querySelectorAll('.tile-pago').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('.tile-pago').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        this.metodoPago = t.dataset.tipo;
      });
    });

    // Vaciar carrito
    on('vaciarCarrito', 'click', () => this.limpiarCarrito());

    // Botón Pagar
    on('btnPagar', 'click', () => this.handlePagar());

    // Numpad de efectivo
    document.querySelectorAll('.btn-num').forEach(btn => {
      btn.addEventListener('click', () => this.numpadPago(btn.dataset.num));
    });
    document.getElementById('btn-borrar-pago')?.addEventListener('click', () => {
      document.getElementById('inputPago').value = '';
      setText('inputPagoDisplay', '$');
    });
    document.getElementById('btn-confirmar-pago')?.addEventListener('click', () => this.confirmarPagoEfectivo());

    // Teclado físico para el modal de efectivo — limpiar listener previo para evitar doble disparo
    if (this._tecladoHandler) {
      document.removeEventListener('keydown', this._tecladoHandler);
    }
    this._tecladoHandler = (e) => this.handleKeydownGlobal(e);
    document.addEventListener('keydown', this._tecladoHandler);

    // Cerrar modales
    on('close-modal-pago', 'click', () => closeModal('modal-pago'));
    on('close-modal-transferencia', 'click', () => closeModal('modal-transferencia'));
    on('close-modal-comanda', 'click', () => this.cerrarComanda());
    on('cancelar-comanda', 'click', () => this.cerrarComanda());
    on('cancelar-transferencia', 'click', () => closeModal('modal-transferencia'));
    on('confirmar-transferencia', 'click', () => { closeModal('modal-transferencia'); this.registrarVenta(false); });

    // Overlay clicks
    ['modal-pago', 'modal-transferencia', 'modal-comanda'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', e => {
        if (e.target.id === id) closeModal(id);
      });
    });
    on('cj-alert-overlay', 'click', (e) => { if (e.target.id === 'cj-alert-overlay') closeAlert(); });
    on('cj-alert-close', 'click', () => closeAlert());

    // Añadir platillo personalizado (modal comanda)
    on('btnAgregarPlatilloPersonalizado', 'click', () => this.agregarPlatilloPersonalizado());

    // Tabs comanda Mixta Nueva
    const modalComanda = document.getElementById('modal-comanda');
    if (modalComanda) {
      modalComanda.addEventListener('click', (e) => {
        const btnTab = e.target.closest('.btn-mixta-tab');
        if (btnTab) {
          // Remover clases activas de todos los botones
          modalComanda.querySelectorAll('.btn-mixta-tab').forEach(b => {
            b.style.background = '#e9ecef';
            b.style.color = '#495057';
            b.style.fontWeight = 'normal';
          });
          // Activar el clickeado
          btnTab.style.background = '#007aff';
          btnTab.style.color = '#fff';
          btnTab.style.fontWeight = 'bold';

          // Ocultar todos los paneles
          modalComanda.querySelectorAll('.mixta-panel').forEach(p => p.style.display = 'none');

          // Mostrar el destino
          const target = document.getElementById(btnTab.dataset.target);
          if (target) target.style.display = 'block';
        }
      });
    }

    // Steppers Mixta — limpiar listener previo para evitar doble disparo al navegar
    if (this._stepperHandler) {
      document.removeEventListener('click', this._stepperHandler);
    }
    this._stepperHandler = (e) => {
      const btn = e.target.closest('.btn-stepper');
      if (!btn) return;
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const display = document.getElementById('val' + targetId.replace('cant', ''));
      if (!input) return;
      let val = parseInt(input.value) || 0;
      if (btn.classList.contains('btn-stepper-plus')) val++;
      else if (btn.classList.contains('btn-stepper-minus') && val > 0) val--;
      input.value = val;
      if (display) display.textContent = val;
      this.calcularTotalMixta();
    };
    document.addEventListener('click', this._stepperHandler);

    // Carrito item click → disminuir/eliminar
    document.getElementById('carrito-lista')?.addEventListener('click', (e) => {
      const item = e.target.closest('.carrito-item');
      if (!item) return;
      const idx = parseInt(item.dataset.index);
      if (idx >= 0 && idx < this.carrito.length) {
        if (this.carrito[idx].cantidad > 1) this.carrito[idx].cantidad--;
        else this.carrito.splice(idx, 1);
        this.actualizarCarrito();
      }
    });

    // Corte preventivo
    on('btnCortePreventivo', 'click', () => this.abrirModalCorte());
    on('close-modal-corte', 'click', () => closeModal('modal-corte'));
    on('corte-cancelar', 'click', () => closeModal('modal-corte'));
    on('corte-confirmar', 'click', () => this.confirmarCorte());
    document.getElementById('modal-corte')?.addEventListener('click', e => {
      if (e.target.id === 'modal-corte') closeModal('modal-corte');
    });

    // ─── Tipo de Orden ─────────────────────────────────────────────────────
    document.querySelectorAll('.btn-tipo-orden').forEach(btn => {
      btn.addEventListener('click', () => this.cambiarTipoOrden(btn.dataset.tipo));
    });

    // Sensor input: actualizar badge al escribir
    document.getElementById('sensorInput')?.addEventListener('input', () => this.actualizarCarrito());

    // Costo envío: presets
    document.querySelectorAll('.btn-envio-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const monto = parseFloat(btn.dataset.monto);
        document.querySelectorAll('.btn-envio-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('costoEnvioInput').value = monto;
        this.costoEnvio = monto;
        this.actualizarCarrito();
      });
    });

    // Costo envío: input manual
    document.getElementById('costoEnvioInput')?.addEventListener('input', (e) => {
      document.querySelectorAll('.btn-envio-preset').forEach(b => b.classList.remove('active'));
      this.costoEnvio = parseFloat(e.target.value) || 0;
      this.actualizarCarrito();
    });

    // Órdenes Pendientes
    on('btnOrdenesPendientes', 'click', () => this.abrirOrdenesPendientes());
    on('close-modal-pendientes', 'click', () => closeModal('modal-pendientes'));
    document.getElementById('modal-pendientes')?.addEventListener('click', e => {
      if (e.target.id === 'modal-pendientes') closeModal('modal-pendientes');
    });

    // Modal Cobrar Pendiente
    on('close-modal-cobrar-pendiente', 'click', () => closeModal('modal-cobrar-pendiente'));
    on('cobrar-pendiente-cancelar', 'click', () => closeModal('modal-cobrar-pendiente'));
    document.getElementById('modal-cobrar-pendiente')?.addEventListener('click', e => {
      if (e.target.id === 'modal-cobrar-pendiente') closeModal('modal-cobrar-pendiente');
    });
    document.getElementById('cobrar-pago-methods')?.addEventListener('click', e => {
      const tile = e.target.closest('.tile-pago[data-tipo-cobro]');
      if (!tile) return;
      document.querySelectorAll('#cobrar-pago-methods .tile-pago').forEach(t => t.classList.remove('active'));
      tile.classList.add('active');
      this._cobrarMetodo = tile.dataset.tipoCobro;
      const efectivoRow = document.getElementById('cobrar-efectivo-row');
      if (efectivoRow) efectivoRow.style.display = this._cobrarMetodo === 'efectivo' ? '' : 'none';
      document.getElementById('cobrar-pendiente-confirmar').disabled = false;
    });
    on('cobrar-pendiente-confirmar', 'click', () => this.confirmarCobroPendiente());

    // Pago Mixto
    on('btnPagoMixto', 'click', () => this.cambiarPagoMixto());
    ['mixtoEfectivo', 'mixtoTarjeta', 'mixtoTransferencia'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.actualizarMixtoFaltante());
    });
  },

  cambiarTipoOrden(tipo) {
    this.tipoOrden = tipo;
    this.costoEnvio = 0;

    // Botones activos
    document.querySelectorAll('.btn-tipo-orden').forEach(b => b.classList.remove('active'));
    document.querySelector(`.btn-tipo-orden[data-tipo="${tipo}"]`)?.classList.add('active');

    // Paneles contextuales
    ['llevar', 'comer_aqui', 'domicilio'].forEach(t => {
      const p = document.getElementById(`panel-${t}`);
      if (p) p.style.display = t === tipo ? '' : 'none';
    });

    // Métodos de pago: ocultar si es "Comer Aquí"
    const paymentDiv = document.querySelector('.payment-methods');
    if (paymentDiv) {
      paymentDiv.classList.toggle('oculto', tipo === 'comer_aqui');
    }

    // Reset método de pago si se cambia a comer_aqui
    if (tipo === 'comer_aqui') {
      this.metodoPago = '';
      document.querySelectorAll('.tile-pago').forEach(t => t.classList.remove('active'));
      // Desactivar pago mixto también
      if (this.pagoMixtoActivo) this.cambiarPagoMixto();
    }

    // Reset envío
    document.querySelectorAll('.btn-envio-preset').forEach(b => b.classList.remove('active'));
    const envioInput = document.getElementById('costoEnvioInput');
    if (envioInput) envioInput.value = '';

    this.actualizarCarrito();
  },

  cambiarPagoMixto() {
    this.pagoMixtoActivo = !this.pagoMixtoActivo;
    const btn = document.getElementById('btnPagoMixto');
    const panel = document.getElementById('panel-pago-mixto');
    if (this.pagoMixtoActivo) {
      btn?.classList.add('active');
      if (panel) panel.style.display = '';
      // Desactivar selección de tile-pago individual
      document.querySelectorAll('.tile-pago').forEach(t => t.classList.remove('active'));
      this.metodoPago = '';
      this.actualizarMixtoFaltante();
    } else {
      btn?.classList.remove('active');
      if (panel) panel.style.display = 'none';
      this.montosMixtos = { efectivo: 0, tarjeta: 0, transferencia: 0 };
      ['mixtoEfectivo', 'mixtoTarjeta', 'mixtoTransferencia'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    }
  },

  actualizarMixtoFaltante() {
    const ef = parseFloat(document.getElementById('mixtoEfectivo')?.value) || 0;
    const ta = parseFloat(document.getElementById('mixtoTarjeta')?.value) || 0;
    const tr = parseFloat(document.getElementById('mixtoTransferencia')?.value) || 0;
    this.montosMixtos = { efectivo: ef, tarjeta: ta, transferencia: tr };
    const suma = ef + ta + tr;
    const faltante = this.totalCarrito - suma;
    const el = document.getElementById('mixtoFaltante');
    const label = document.getElementById('mixtoFaltanteLabel');
    if (el) {
      if (faltante > 0.009) {
        if (label) label.textContent = 'Faltante:';
        el.textContent = '$' + faltante.toFixed(2);
        el.style.color = '#dc3545';
      } else if (faltante < -0.009) {
        if (label) label.textContent = 'Excede:';
        el.textContent = '$' + Math.abs(faltante).toFixed(2);
        el.style.color = '#fd7e14';
      } else {
        if (label) label.textContent = 'Faltante:';
        el.textContent = '$0.00';
        el.style.color = '#28a745';
      }
    }
  },

  filtrarProductos(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('#productos-lista .producto-card').forEach(card => {
      if (filter === '*') {
        card.style.display = '';
      } else {
        const cls = filter.replace('.', '');
        card.style.display = card.classList.contains(cls) ? '' : 'none';
      }
    });
  },

  actualizarVendedorSeleccionado() {
    const activo = document.querySelector('.vendedor-selector.is_active');
    if (activo) {
      this.vendedorSeleccionado = activo.dataset.cajeroId;
    } else {
      const primero = document.querySelector('.vendedor-selector');
      if (primero) {
        primero.classList.add('is_active');
        this.vendedorSeleccionado = primero.dataset.cajeroId;
      }
    }
  },

  // ─── Agregar al carrito ────────────────────────────────────────────────────
  agregarAlCarrito(id, nombre, precio) {
    const isParent = Number(precio) === 0;

    if (isParent) {
      this.abrirModalComandaGrupo(id, nombre);
    } else {
      let existe = this.carrito.find(i => i.id === id);
      if (existe) { existe.cantidad++; }
      else { this.carrito.push({ id, nombre, precio, cantidad: 1 }); }
      this.actualizarCarrito();
    }
  },

  abrirModalComandaGrupo(parentId, parentNombre) {
    const suffix = getSuffixForParent(parentNombre);
    const children = this.productosData.filter(p => p.pr_nombre.includes(`(${suffix})`));

    setText('platilloPersonalizarNombre', parentNombre);
    document.getElementById('platilloPersonalizarId').value = parentId;

    const tabMezcla = document.getElementById('tab-mezcla');
    
    if (children.length === 0) {
      tabMezcla.innerHTML = '<div style="text-align:center; color:#6c757d; padding:20px;">No hay productos configurados para esta categoría. Añade agregando el subfijo (' + suffix + ').</div>';
    } else {
      const grupos = {};
      children.forEach(pm => {
        const nombre = pm.pr_nombre.replace(`(${suffix})`, '').trim();
        const primeraPalabra = nombre.split(' ')[0];
        if (!grupos[primeraPalabra]) grupos[primeraPalabra] = [];
        grupos[primeraPalabra].push({ pm, nombre });
      });
      const gruposArreglo = Object.entries(grupos);
      let htmlHTML = `
              <div class="mixta-tabs-container" style="display: flex; gap: 20px; align-items: stretch; max-height: 350px;">
                <!-- Menú Lateral de Categorías -->
                <div class="mixta-sidebar" style="flex: 0 0 160px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-right: 5px;">
                  `;

      gruposArreglo.forEach(([grupo, items], index) => {
        const isActive = index === 0 ? 'background:#007aff; color:#fff; font-weight:bold;' : 'background:#e9ecef; color:#495057;';
        htmlHTML += `
                  <button type="button" class="btn-mixta-tab" data-target="panel-${grupo}" style="width: 100%; text-align: left; padding: 12px 15px; border-radius: 8px; border: none; cursor: pointer; ${isActive} transition: all 0.2s; font-size: 1rem; flex-shrink: 0;">
                    ${grupo}s (${items.length})
                  </button>`;
      });

      htmlHTML += `
                </div>
                <!-- Contenedor Principal de Artículos -->
                <div class="mixta-content" style="flex: 1; border: 1px solid #e9ecef; border-radius: 10px; background: #fff; position: relative; overflow-y: auto;">
                  `;

      gruposArreglo.forEach(([grupo, items], index) => {
        const displayStyle = index === 0 ? 'block' : 'none';
        htmlHTML += `
                  <div class="mixta-panel" id="panel-${grupo}" style="display: ${displayStyle}; padding: 15px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">`;

        items.forEach(({ pm, nombre }) => {
          const p = Number(pm.pr_precioventa).toFixed(0);
          htmlHTML += `
                      <div style="background:#f8f9fa; border:1px solid #dee2e6; border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
                        <div>
                          <div style="font-weight:600; font-size:1rem; color:#343a40;">${nombre}</div>
                          <div style="color:#6c757d; font-size:.85rem;">$${p} c/u</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; justify-content: flex-end;">
                          <button type="button" class="btn-stepper btn-stepper-minus" data-target="cantMixta_${pm.ID}" style="width:32px; height:32px; border-radius:6px; border:none; background:#e9ecef; color:#495057; font-weight:bold; cursor:pointer; font-size:1.1rem;">−</button>
                          <span class="stepper-value" id="valMixta_${pm.ID}" style="min-width:28px; text-align:center; font-weight:bold; font-size:1.1rem; color:#007aff;">0</span>
                          <input type="hidden" id="cantMixta_${pm.ID}" class="cant-mixta"
                                 data-id="${pm.ID}" data-nombre="${escJs(nombre)}" data-suffix="${escJs(suffix)}"
                                 data-precio="${pm.pr_precioventa}" value="0">
                          <button type="button" class="btn-stepper btn-stepper-plus" data-target="cantMixta_${pm.ID}" style="width:32px; height:32px; border-radius:6px; border:none; background:#007aff; color:#fff; font-weight:bold; cursor:pointer; font-size:1.1rem;">+</button>
                        </div>
                      </div>`;
        });
        htmlHTML += `
                    </div>
                  </div>`;
      });

      htmlHTML += `
                </div>
              </div>`;
      tabMezcla.innerHTML = htmlHTML;
    }

    this.calcularTotalMixta();
    openModal('modal-comanda');
  },

  activarTab(btnId, panelId) {
    // Deprecated
  },

  calcularTotalMixta() {
    let total = 0;
    document.querySelectorAll('.cant-mixta').forEach(i => {
      const c = parseInt(i.value) || 0;
      const p = parseFloat(i.dataset.precio) || 0;
      total += c * p;
    });
    setText('totalOrdenMixta', '$' + total.toFixed(2));
  },

  // ─── Renderizado carrito ───────────────────────────────────────────────────
  actualizarCarrito() {
    const lista = document.getElementById('carrito-lista');
    if (!lista) return;

    let total = 0;
    let html = '';
    const gruposVistos = {};

    // Badge de sensor (Para llevar)
    const sensorVal = (document.getElementById('sensorInput')?.value || '').trim();
    if (this.tipoOrden === 'llevar' && sensorVal) {
      html += `<div class="sensor-carrito-badge">
        <span>Sensor:</span> #${escJs(sensorVal)}
      </div>`;
    }

    // Badge de domicilio
    if (this.tipoOrden === 'domicilio') {
      const calle = document.getElementById('domCalleInput')?.value.trim() || '';
      const num = document.getElementById('domNumInput')?.value.trim() || '';
      const colonia = document.getElementById('domColoniaInput')?.value.trim() || '';
      const dir = [calle, num, colonia].filter(Boolean).join(', ');
      if (dir) {
        html += `<div class="domicilio-carrito-badge">
          🛵 <div><strong>Domicilio:</strong> ${escJs(dir)}</div>
        </div>`;
      }
    }

    this.carrito.forEach((item, idx) => {
      total += item.precio * item.cantidad;

      const optsHtml = [
        item.opciones?.length ? `<small>Sin: ${item.opciones.join(', ')}</small>` : '',
        item.observaciones ? `<small>Obs: ${item.observaciones}</small>` : '',
      ].join('');

      if (item.grupo_mixta) {
        if (!gruposVistos[item.grupo_mixta]) {
          gruposVistos[item.grupo_mixta] = true;
          const label = item.parent_nombre || 'Mixta';
          html += `<div class="mixta-header">${label}</div>`;
        }
        const suffixMatch = item.nombre.match(/\((.*?)\)$/);
        const sub = suffixMatch ? item.nombre.replace(` (${suffixMatch[1]})`, '') : item.nombre;
        html += `
          <div class="carrito-item" data-index="${idx}">
            <span style="color:#6c757d;">${item.cantidad}x ${sub}</span>
            <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong>
          </div>${optsHtml}`;
      } else {
        html += `
          <div class="carrito-item" data-index="${idx}">
            <span>${item.cantidad} x ${item.nombre}</span>
            <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong>
          </div>${optsHtml}`;
      }
    });

    // Línea de envío en carrito
    if (this.tipoOrden === 'domicilio' && this.costoEnvio > 0) {
      html += `<div class="carrito-item" style="background:#fff3e0;">
        <span style="color:#fd7e14;">🛵 Envío a domicilio</span>
        <strong style="color:#fd7e14;">$${this.costoEnvio.toFixed(2)}</strong>
      </div>`;
      total += this.costoEnvio;
    }

    lista.innerHTML = (this.carrito.length || (this.tipoOrden === 'domicilio' && this.costoEnvio > 0))
      ? (html || '<p class="carrito-vacio">Tu carrito está vacío.</p>')
      : '<p class="carrito-vacio">Tu carrito está vacío.</p>';

    setText('totalCarrito', '$' + total.toFixed(2));
    this.totalCarrito = total;

    if (this.pagoMixtoActivo) this.actualizarMixtoFaltante();

    const instruccion = document.getElementById('instruccionCarrito');
    if (instruccion) instruccion.style.display = this.carrito.length ? '' : 'none';

    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) btnPagar.disabled = this.carrito.length === 0;
  },

  // ─── Pago ─────────────────────────────────────────────────────────────────
  async handlePagar() {
    if (this.totalCarrito === 0) {
      this.showAlert('Carrito vacío', 'Añade productos antes de pagar.', 'warning');
      return;
    }

    // Verificar caja activa
    const cajaActiva = await verificarCajaActiva();
    if (!cajaActiva) {
      this.showAlert('Caja cerrada', 'No puedes realizar ventas sin una caja abierta.', 'warning');
      return;
    }

    // "Comer Aquí" → guardar como pendiente sin pedir método de pago
    if (this.tipoOrden === 'comer_aqui') {
      await this.registrarVenta(true);
      return;
    }

    // Pago mixto
    if (this.pagoMixtoActivo) {
      const { efectivo, tarjeta, transferencia } = this.montosMixtos;
      const suma = efectivo + tarjeta + transferencia;
      if (Math.abs(suma - this.totalCarrito) > 0.01) {
        this.showAlert('Montos incompletos', `La suma de los métodos ($${suma.toFixed(2)}) debe ser igual al total ($${this.totalCarrito.toFixed(2)}).`, 'warning');
        return;
      }
      await this.registrarVenta(false, true);
      return;
    }

    if (!this.metodoPago) {
      this.showAlert('Falta método de pago', "Elige 'Tarjeta', 'Efectivo' o 'Transferencia'.", 'warning');
      return;
    }

    if (this.metodoPago === 'tarjeta') {
      await this.registrarVenta();
      this.metodoPago = '';
    } else if (this.metodoPago === 'efectivo') {
      document.getElementById('inputPago').value = '';
      setText('inputPagoDisplay', '$');
      openModal('modal-pago');
    } else if (this.metodoPago === 'transferencia') {
      openModal('modal-transferencia');
    }
  },

  numpadPago(num) {
    const input = document.getElementById('inputPago');
    let val = input.value;
    if (val === '' && num === '.') val = '0.';
    else val += num;
    input.value = val;
    setText('inputPagoDisplay', '$' + val);
  },

  handleKeydownGlobal(e) {
    // Solo actuar si el modal de efectivo está visible
    const modalPago = document.getElementById('modal-pago');
    if (!modalPago || !modalPago.classList.contains('active')) return;

    // Prevenir si se está escribiendo en algún input dentro del modal (si lo hubiera en el futuro)
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.key >= '0' && e.key <= '9') {
      this.numpadPago(e.key);
    } else if (e.key === '.' || e.key === ',') {
      if (!document.getElementById('inputPago').value.includes('.')) {
        this.numpadPago('.');
      }
    } else if (e.key === 'Backspace') {
      const input = document.getElementById('inputPago');
      input.value = input.value.slice(0, -1);
      setText('inputPagoDisplay', input.value === '' ? '$' : '$' + input.value);
    } else if (e.key === 'Enter') {
      this.confirmarPagoEfectivo();
    } else if (e.key === 'Escape') {
      closeModal('modal-pago');
    }
  },

  async confirmarPagoEfectivo() {
    const pago = parseFloat(document.getElementById('inputPago').value);
    if (isNaN(pago) || pago < this.totalCarrito) {
      this.showAlert('Monto insuficiente', 'El monto ingresado es menor al total.', 'error');
      return;
    }
    this.cambio = pago - this.totalCarrito;
    this.pagoEfectivoAmount = pago;
    closeModal('modal-pago');
    await this.registrarVenta(false);
    this.metodoPago = '';
    this.pagoEfectivoAmount = 0;
  },

  // ─── Generador de Ticket HTML ──────────────────────────────────────────────
  generarHTMLTicket(data) {
    const { ticket_id, fecha, vendedor_nombre, tipo_pago, tipo_orden, sensor_num, direccion, costo_envio, total, pago, cambio, productos, montos_mixtos } = data;

    let filas = '';
    const gruposRenderizados = [];

    for (const item of productos) {
      if (item.grupo_mixta) {
        if (gruposRenderizados.includes(item.grupo_mixta)) continue;
        gruposRenderizados.push(item.grupo_mixta);

        const groupLabel = item.parent_nombre || 'Mixta';
        filas += `<tr><td colspan='3' style='padding-top:6px;padding-bottom:2px;font-weight:bold;'>${groupLabel}</td></tr>`;

        for (const subItem of productos) {
          if (subItem.grupo_mixta !== item.grupo_mixta) continue;
          const suffixMatch = (subItem.nombre || '').match(/\((.*?)\)$/);
          const subNombre = suffixMatch ? subItem.nombre.replace(` (${suffixMatch[1]})`, '') : subItem.nombre;
          const subCantidad = parseInt(subItem.cantidad);
          const subPrecio = (subItem.precio * subCantidad).toFixed(2);

          filas += `
                <tr>
                    <td style='vertical-align:top;width:15%;padding-left:8px;'>${subCantidad}x</td>
                    <td style='vertical-align:top;width:55%;word-break:break-word;'>${subNombre}</td>
                    <td style='vertical-align:top;text-align:right;width:30%;'>$${subPrecio}</td>
                </tr>`;

          if (subItem.observaciones) {
            filas += `<tr><td></td><td colspan='2' style='font-size:14px;'>  Obs: ${subItem.observaciones}</td></tr>`;
          }
          if (subItem.opciones && subItem.opciones.length > 0) {
            const op = Array.isArray(subItem.opciones) ? subItem.opciones.join(', ') : subItem.opciones;
            if (op.trim()) filas += `<tr><td></td><td colspan='2' style='font-size:14px;'>  Sin: ${op}</td></tr>`;
          }
        }
      } else {
        const nombre = item.nombre;
        const cantidad = parseInt(item.cantidad);
        const precio = (item.precio * cantidad).toFixed(2);

        filas += `
            <tr>
                <td style='vertical-align:top;width:15%;'>${cantidad}x</td>
                <td style='vertical-align:top;width:55%;word-break:break-word;'>${nombre}</td>
                <td style='vertical-align:top;text-align:right;width:30%;'>$${precio}</td>
            </tr>`;

        if (item.observaciones) {
          filas += `<tr><td></td><td colspan='2' style='font-size:14px;'>  Obs: ${item.observaciones}</td></tr>`;
        }
        if (item.opciones && item.opciones.length > 0) {
          const op = Array.isArray(item.opciones) ? item.opciones.join(', ') : item.opciones;
          if (op.trim()) filas += `<tr><td></td><td colspan='2' style='font-size:14px;'>  Sin: ${op}</td></tr>`;
        }
      }
    }

    // Fila de envío en tabla si aplica
    if (Number(costo_envio) > 0) {
      filas += `
            <tr>
                <td style='vertical-align:top;width:15%;'></td>
                <td style='vertical-align:top;width:55%;word-break:break-word;font-style:italic;'>🛵 Envío a domicilio</td>
                <td style='vertical-align:top;text-align:right;width:30%;'>$${Number(costo_envio).toFixed(2)}</td>
            </tr>`;
    }

    let filasTotales = '';
    if (tipo_pago && tipo_pago.toLowerCase() === 'mixto' && montos_mixtos) {
      const partes = [
        montos_mixtos.efectivo > 0 ? `<p>Efectivo: <span style='display:inline-block;width:70px;text-align:right;'>$${Number(montos_mixtos.efectivo).toFixed(2)}</span></p>` : '',
        montos_mixtos.tarjeta > 0 ? `<p>Tarjeta: <span style='display:inline-block;width:70px;text-align:right;'>$${Number(montos_mixtos.tarjeta).toFixed(2)}</span></p>` : '',
        montos_mixtos.transferencia > 0 ? `<p>Transf: <span style='display:inline-block;width:70px;text-align:right;'>$${Number(montos_mixtos.transferencia).toFixed(2)}</span></p>` : '',
      ].filter(Boolean).join('');
      filasTotales = partes;
    } else if (tipo_pago && tipo_pago.toLowerCase() === 'efectivo') {
      filasTotales = `
            <p>Recibo: <span style='display:inline-block;width:70px;text-align:right;'>$${Number(pago).toFixed(2)}</span></p>
            <p>Cambio: <span style='display:inline-block;width:70px;text-align:right;'>$${Number(cambio).toFixed(2)}</span></p>`;
    } else {
      filasTotales = `<p>Recibo: <span style='display:inline-block;width:70px;text-align:right;'>$${Number(total).toFixed(2)}</span></p>`;
    }

    return `
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'>
  <title>Ticket #${ticket_id}</title>
  <style>
    @page { margin: 0; size: 58mm auto; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      font-weight: bold;
      width: 58mm;
      max-width: 58mm;
      padding: 5px;
      color: #000;
      line-height: 1.2;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .left { text-align: left; }
    h1 { font-size: 18px; margin-bottom: 2px; }
    h2 { font-size: 15px; margin-bottom: 8px; }
    .sep { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    .info p { margin-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 0; table-layout: fixed; }
    th { font-size: 13px; font-weight: bold; padding: 3px 0; }
    td { font-size: 13px; padding: 3px 0; vertical-align: top; }
    td:nth-child(1) { width: 15%; }
    td:nth-child(2) { width: 55%; word-break: break-word; }
    td:nth-child(3) { width: 30%; text-align: right; }
    .totales-container { margin-top: 6px; font-size: 14px; text-align: right; }
    .totales-container p { margin-bottom: 3px; }
    .total-final { font-size: 20px; font-weight: bold; margin-top: 10px; margin-bottom: 10px; text-align: center; }
  </style>
</head>
<body>
  <div class="center">
    <h1>Ticket #${ticket_id}</h1>
    <h2>Antojitos Santa Lucía</h2>
  </div>

  ${sensor_num ? `
  <div style='text-align:center; border: 2px solid #000; border-radius:6px; padding:6px 4px; margin:6px 0;'>
    <div style='font-size:11px; font-weight:bold; letter-spacing:1px;'>SENSOR</div>
    <div style='font-size:48px; font-weight:900; line-height:1;'>#${sensor_num}</div>
  </div>` : ''}

  <div class='info'>
    <p>Fecha: ${fecha}</p>
    <p>Vendedor: ${vendedor_nombre}</p>
    <p>Tipo: ${tipo_orden === 'llevar' ? 'Para llevar' : tipo_orden === 'comer_aqui' ? 'Comer aquí' : 'Domicilio'}</p>
    <p>Metodo Pago: ${tipo_pago ? tipo_pago.toUpperCase() : 'Pendiente'}</p>
    ${direccion ? `<p>Dirección: ${direccion}</p>` : ''}
  </div>
  
  <hr class='sep'>
  
  <table>
    <thead>
      <tr>
        <th style='text-align:left;'>Cant</th>
        <th style='text-align:left;'>Producto</th>
        <th style='text-align:right;'>Total</th>
      </tr>
    </thead>
    <tbody>
      ${filas}
    </tbody>
  </table>
  
  <hr class='sep'>
  
  <div class='totales-container'>
      ${filasTotales}
  </div>
  
  <div class='total-final'>
    TOTAL: $${Number(total).toFixed(2)}
  </div>
  
  <div class="center" style="font-size: 15px; margin-top: 10px;">
    <p>¡Gracias por su preferencia!</p>
  </div>
</body>
</html>`;
  },

  // ─── Registrar Venta (reemplaza controller/ventas.php) ───────────────────
  async registrarVenta(isPendiente = false, isMixto = false) {
    if (!this.vendedorSeleccionado) {
      this.showAlert('Sin vendedor', 'Debes elegir quién registra esta venta.', 'warning');
      return;
    }

    showLoading('Procesando Venta...');

    try {
      // --- BLOQUEO DE SEGURIDAD Y LICENCIA ---
      try {
        const { invoke } = window.__TAURI__?.core || await import('@tauri-apps/api/core');

        // 1. Obtener la licencia local actual
        const [licencia] = await dbSelect(`SELECT * FROM rv_licencia_local WHERE id = 1`);
        if (!licencia) throw new Error("No se encontró archivo de licencia local.");

        // 2. Verificar Firma Criptográfica con Rust (Evita Alteración SQLite)
        const firmaValida = await invoke('verificar_firma_licencia', {
          fechaUltimoSync: licencia.fecha_ultimo_sync,
          fechaExpiracion: licencia.fecha_expiracion,
          ventasDesdeSync: licencia.ventas_desde_sync,
          firmaAValidar: licencia.firma_digital
        });

        if (!firmaValida) {
          throw new Error("Firma de seguridad inválida. Posible corrupción o manipulación de datos.");
        }

        // 3. Verificar límite de transacciones (500)
        if (licencia.ventas_desde_sync >= 500) {
          throw new Error(`Límite de ventas offline alcanzado (${licencia.ventas_desde_sync}/500). Requiere sincronización obligatoria.`);
        }

        const ahora = new Date();
        const expiracion = new Date(licencia.fecha_expiracion.replace(' ', 'T') + 'Z');

        // 4. Verificar expiración por Tiempo (7 días)
        if (ahora > expiracion) {
          throw new Error(`La licencia local ha expirado (${licencia.fecha_expiracion} UTC). Requiere conexión a internet para renovar.`);
        }

        // 5. Verificar fraude de reloj de Windows/Mac (Viaje al pasado)
        const [ultimoTicket] = await dbSelect(`SELECT fecha FROM rv_ventas ORDER BY fecha DESC LIMIT 1`);
        if (ultimoTicket && ultimoTicket.fecha) {
          const fechaUltimoTicket = new Date(ultimoTicket.fecha.replace(' ', 'T') + 'Z');
          if (ahora < fechaUltimoTicket) {
            throw new Error("El sistema requiere sincronización antes de continuar operando.");
          }
        }

      } catch (seguridadError) {
        hideLoading();
        this.showConfirm(
          'Bloqueo de Seguridad Activado',
          seguridadError.message + " ¿Ir a Sincronización?",
          'error',
          () => { window.location.href = '#/sincronizacion'; } // Redirigir si se aprueba
        );
        return; // Abortar venta
      }
      // --- FIN BLOQUEO DE SEGURIDAD ---

      // Datos tipo de orden
      const tipoOrden = this.tipoOrden;
      const sensorNum = (document.getElementById('sensorInput')?.value || '').trim();
      const calle = document.getElementById('domCalleInput')?.value.trim() || '';
      const numDir = document.getElementById('domNumInput')?.value.trim() || '';
      const colonia = document.getElementById('domColoniaInput')?.value.trim() || '';
      const direccion = tipoOrden === 'domicilio'
        ? [calle, numDir, colonia].filter(Boolean).join(', ')
        : null;
      const costoEnvio = tipoOrden === 'domicilio' ? (this.costoEnvio || 0) : 0;

      const metodoPagoFinal = isPendiente ? null : (isMixto ? 'mixto' : this.metodoPago);
      const estatusFinal = isPendiente ? 'pendiente' : 'completado';
      const pagoCliente = (!isPendiente && this.metodoPago === 'efectivo')
        ? (this.pagoEfectivoAmount || this.totalCarrito)
        : this.totalCarrito;
      const cambioCliente = (!isPendiente && this.metodoPago === 'efectivo') ? this.cambio : 0;
      const montoEfectivo = isMixto ? (this.montosMixtos.efectivo || 0) : (this.metodoPago === 'efectivo' ? this.totalCarrito : 0);
      const montoTarjeta = isMixto ? (this.montosMixtos.tarjeta || 0) : (this.metodoPago === 'tarjeta' ? this.totalCarrito : 0);
      const montoTransferencia = isMixto ? (this.montosMixtos.transferencia || 0) : (this.metodoPago === 'transferencia' ? this.totalCarrito : 0);

      // Obtener el nombre del vendedor (ya sea desde DB o del elemento DOM activo)
      let vendedorNombre = 'Vendedor';
      try {
        const vData = await dbSelect('SELECT emp_nombre FROM tm_empleado WHERE emp_id = $1', [this.vendedorSeleccionado]);
        if (vData && vData.length > 0) vendedorNombre = vData[0].emp_nombre;
      } catch (e) { }

      // Generar número de ticket
      const [ticketRow] = await dbSelect(
        `SELECT COALESCE(MAX(ticket), 0) + 1 AS next_ticket FROM rv_ventas`, []
      );
      const ticket = ticketRow.next_ticket;
      
      // Ajustar la fecha a la zona horaria local en lugar de usar UTC
      const offsetMs = new Date().getTimezoneOffset() * 60000;
      const localDate = new Date(Date.now() - offsetMs);
      const now = localDate.toISOString().replace('T', ' ').substring(0, 19);

      // Insertar cada ítem del carrito
      for (const item of this.carrito) {
        const opciones = item.opciones?.join(', ') || '';
        const obs = item.observaciones || '';
        const comComments = [opciones ? 'Sin: ' + opciones : '', obs].filter(Boolean).join('; ') || null;

        await dbExecute(
          `INSERT INTO rv_ventas
      (ticket, fecha, cantidad, id_producto, producto, vendedor,
        metodo_pago, total, total_ticket, cliente, estatus, plataforma_origen,
        tipo_orden, sensor_num, direccion, costo_envio,
        monto_efectivo, monto_tarjeta, monto_transferencia)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'desktop', $12, $13, $14, $15, $16, $17, $18)`,
          [
            ticket, now, item.cantidad, item.id, item.nombre,
            this.vendedorSeleccionado,
            metodoPagoFinal,
            (item.precio * item.cantidad),
            this.totalCarrito,
            null,
            estatusFinal,
            tipoOrden,
            sensorNum || null,
            direccion,
            costoEnvio,
            montoEfectivo,
            montoTarjeta,
            montoTransferencia,
          ]
        );

        // Comanda (si tiene ingredientes a omitir o es platillo)
        if (comComments || item.grupo_mixta) {
          await dbExecute(
            `INSERT INTO rv_comanda
      (ticket_id, com_cantidad, pr_PLU, pr_nombre,
        com_ingredientes_omitir, com_comentarios, com_estatus)
    VALUES($1, $2, $3, $4, $5, $6, 'pendiente')`,
            [ticket, item.cantidad, item.id, item.nombre, opciones || null, comComments || null]
          );
        }

        // Actualizar stock si tiene (pr_stock no NULL)
        const card = document.querySelector(`.producto-card[data-id="${item.id}"]`);
        const stock = card?.dataset.stock;
        if (stock && stock !== 'NULL') {
          await dbExecute(
            `UPDATE rv_productos SET pr_stock = pr_stock - $1 WHERE ID = $2`,
            [item.cantidad, item.id]
          );
        }
      }

      // --- ACTUALIZAR LICENCIA Y RE-FIRMAR ---
      try {
        const { invoke } = window.__TAURI__?.core || await import('@tauri-apps/api/core');
        const [licencia] = await dbSelect(`SELECT * FROM rv_licencia_local WHERE id = 1`);
        if (licencia) {
          const nuevasVentas = (licencia.ventas_desde_sync || 0) + 1;

          // Generar nueva firma desde Rust para los datos alterados
          const nuevaFirma = await invoke('generar_firma_licencia', {
            fechaUltimoSync: licencia.fecha_ultimo_sync,
            fechaExpiracion: licencia.fecha_expiracion,
            ventasDesdeSync: nuevasVentas
          });

          // Guardar localmente
          await dbExecute(
            `UPDATE rv_licencia_local 
                 SET ventas_desde_sync = $1, firma_digital = $2 
                 WHERE id = 1`,
            [nuevasVentas, nuevaFirma]
          );
        }
      } catch (errFirma) {
        console.error("Error al re-firmar la licencia local tras la venta:", errFirma);
        // Opcional: Podrías alertar aquí, pero el ticket ya se guardó. 
        // En la próxima venta, el bloqueo de seguridad detectará si la base de datos se corrompió.
      }
      // --- FIN ACTUALIZAR LICENCIA ---

      hideLoading();

      if (isPendiente) {
        this.showAlert('Orden guardada', `Mesa en espera – Ticket #${ticket}. Aparecerá en Órdenes Pendientes.`, 'success');
        this.limpiarCarrito();
        this.actualizarEstadoCaja();
        this.actualizarBadgePendientes();
        return;
      }

      // Mensaje de éxito
      if (isMixto) {
        this.showAlert('Pago mixto exitoso', `$${this.totalCarrito.toFixed(2)} – Ticket #${ticket}`, 'success');
      } else if (this.metodoPago === 'efectivo') {
        this.showAlert(
          `Cambio: $${this.cambio.toFixed(2)} `,
          `Pago realizado con éxito. Ticket #${ticket} `,
          'success'
        );
      } else {
        this.showAlert(
          this.metodoPago === 'tarjeta' ? 'Pago con tarjeta exitoso' : 'Pago con transferencia exitoso',
          `$${this.totalCarrito.toFixed(2)} – Ticket #${ticket} `,
          'success'
        );
      }

      // Armar datos para el ticket
      const datosTicket = {
        ticket_id: ticket,
        fecha: new Date().toLocaleString('es-MX'),
        vendedor_nombre: vendedorNombre,
        tipo_pago: isMixto ? 'mixto' : this.metodoPago.toUpperCase(),
        montos_mixtos: isMixto ? { ...this.montosMixtos } : null,
        tipo_orden: tipoOrden,
        sensor_num: sensorNum || null,
        direccion: direccion || null,
        costo_envio: costoEnvio,
        total: this.totalCarrito,
        pago: pagoCliente,
        cambio: cambioCliente,
        productos: this.carrito
      };

      // Mandar a imprimir!
      const htmlTicket = this.generarHTMLTicket(datosTicket);
      if (window.imprimirTicket) {
        window.imprimirTicket(htmlTicket);
      }

      this.limpiarCarrito();
      this.actualizarEstadoCaja();

    } catch (err) {
      hideLoading();
      console.error('Error registrando venta:', err);
      this.showAlert('Error', 'No se pudo registrar la venta: ' + (err.message || err), 'error');
    }
  },

  // ─── Platillo Personalizado ───────────────────────────────────────────────
  agregarPlatilloPersonalizado() {
    const parentId = document.getElementById('platilloPersonalizarId').value;
    const parentNombre = document.getElementById('platilloPersonalizarNombre').textContent;
    const parentObj = this.productosData.find(p => p.ID == parentId);
    if (!parentObj) return;

    const isParent = Number(parentObj.pr_precioventa) === 0;

    if (isParent) {
      let agregados = 0;
      const grupoId = Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      const suffix = getSuffixForParent(parentNombre);

      document.querySelectorAll('.cant-mixta').forEach(input => {
        const cant = parseInt(input.value) || 0;
        if (cant > 0) {
          agregados++;
          this.carrito.push({
            id: parseInt(input.dataset.id),
            nombre: input.dataset.nombre + ` (${suffix})`,
            precio: parseFloat(input.dataset.precio),
            cantidad: cant,
            opciones: [],
            observaciones: '',
            grupo_mixta: grupoId,
            parent_nombre: parentNombre
          });
        }
      });
      if (agregados === 0) {
        this.showAlert('Atención', `Debes seleccionar al menos un artículo para ${parentNombre}.`, 'warning');
        return;
      }
    }

    this.actualizarCarrito();
    this.cerrarComanda();
  },

  cerrarComanda() {
    closeModal('modal-comanda');
  },

  // renderIngredientes removido



  // ─── Limpiar carrito ──────────────────────────────────────────────────────
  limpiarCarrito() {
    this.carrito = [];
    this.metodoPago = '';
    this.cambio = 0;
    this.costoEnvio = 0;
    // Reset pago mixto
    if (this.pagoMixtoActivo) this.cambiarPagoMixto();
    this.montosMixtos = { efectivo: 0, tarjeta: 0, transferencia: 0 };
    document.querySelectorAll('.tile-pago').forEach(t => t.classList.remove('active'));
    const inputPago = document.getElementById('inputPago');
    if (inputPago) inputPago.value = '';
    closeModal('modal-pago');
    closeModal('modal-transferencia');
    // Resetear tipo de orden a "llevar"
    this.cambiarTipoOrden('llevar');
    const sensorInput = document.getElementById('sensorInput');
    if (sensorInput) sensorInput.value = '';
    ['domCalleInput', 'domNumInput', 'domColoniaInput', 'costoEnvioInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.querySelectorAll('.btn-envio-preset').forEach(b => b.classList.remove('active'));
    this.actualizarCarrito();
  },

  // ─── Estado Caja (indicador efectivo) ────────────────────────────────────
  async actualizarEstadoCaja() {
    try {
      const cajas = await dbSelect(
        `SELECT id, fecha_apertura, monto_apertura FROM rv_apertura_caja
         WHERE estatus = 'activa' ORDER BY fecha_apertura DESC LIMIT 1`, []
      );
      if (cajas.length === 0) {
        setText('cajaEfectivoStatus', '$0');
        return;
      }
      const caja = cajas[0];
      const [totEfectivo] = await dbSelect(
        `SELECT COALESCE(SUM(total), 0) AS ve
         FROM rv_ventas WHERE estatus = 'completado' AND LOWER(metodo_pago) = 'efectivo'
         AND fecha >= $1`, [caja.fecha_apertura]
      );
      const cortes = await dbSelect(
        `SELECT COALESCE(SUM(precio_unitario), 0) AS tc FROM rv_gastos
         WHERE (tipo_gasto = 'Corte Preventivo' OR (tipo_gasto = 'Salida de Efectivo' AND LOWER(metodo_pago) = 'efectivo'))
         AND fecha >= $1`, [caja.fecha_apertura]
      );
      const efectivo = (parseFloat(caja.monto_apertura) || 0)
        + (parseFloat(totEfectivo.ve) || 0)
        - (parseFloat(cortes[0]?.tc) || 0);

      const fondo = parseFloat(caja.monto_apertura) || 0;

      // Guardar en estado para validación en el modal de corte
      this._cajaEfectivo = efectivo;
      this._cajaFondo = fondo;

      const pill = document.getElementById('cajaCompactPill');
      const btn = document.getElementById('btnCortePreventivo');
      setText('cajaEfectivoStatus', '$' + Math.round(efectivo));
      if (efectivo > fondo) {
        pill?.classList.add('danger');
        if (btn) btn.classList.add('visible');
      } else {
        pill?.classList.remove('danger');
        if (btn) btn.classList.remove('visible');
      }
    } catch (e) { console.warn('No se pudo actualizar estado caja:', e); }
  },

  // ─── Badge de pendientes ─────────────────────────────────────────────────
  async actualizarBadgePendientes() {
    try {
      const rows = await dbSelect(
        `SELECT COUNT(DISTINCT ticket) AS cnt FROM rv_ventas WHERE estatus = 'pendiente'`
      );
      const cnt = rows[0]?.cnt || 0;
      const badge = document.getElementById('badgePendientes');
      if (badge) badge.textContent = cnt > 0 ? `(${cnt})` : '';
    } catch (_) {}
  },

  // ─── Órdenes Pendientes ──────────────────────────────────────────────────
  async abrirOrdenesPendientes() {
    openModal('modal-pendientes');
    const lista = document.getElementById('pendientes-lista');
    if (lista) lista.innerHTML = '<p style="text-align:center;color:#6c757d;">Cargando...</p>';

    try {
      // Obtener tickets pendientes agrupados
      const tickets = await dbSelect(
        `SELECT ticket, fecha, total_ticket, tipo_orden, sensor_num, direccion, costo_envio
         FROM rv_ventas WHERE estatus = 'pendiente'
         GROUP BY ticket ORDER BY fecha ASC`
      );

      if (!tickets.length) {
        lista.innerHTML = '<p style="text-align:center;color:#6c757d;padding:20px;">No hay órdenes pendientes.</p>';
        return;
      }

      let html = '';
      for (const t of tickets) {
        const items = await dbSelect(
          `SELECT cantidad, producto FROM rv_ventas WHERE ticket = $1 AND estatus = 'pendiente'`,
          [t.ticket]
        );
        const resumen = items.map(i => `${i.cantidad}x ${i.producto}`).join('<br>');
        const hora = new Date(t.fecha.replace(' ', 'T')).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        let infoExtra = '';
        if (t.tipo_orden === 'llevar' && t.sensor_num) infoExtra = `<span style="color:#007aff; font-weight:700;">Sensor #${t.sensor_num}</span> — `;
        if (t.tipo_orden === 'domicilio' && t.direccion) infoExtra = `<span style="color:#fd7e14;">🛵 ${t.direccion}</span> — `;

        html += `<div class="pendiente-card">
          <div class="pendiente-card-header">
            <span class="pendiente-ticket-num">Ticket #${t.ticket}</span>
            <span class="pendiente-hora">${infoExtra}${hora}</span>
          </div>
          <div class="pendiente-items">${resumen}</div>
          <div class="pendiente-total">Total: $${Number(t.total_ticket).toFixed(2)}</div>
          <button class="btn-cobrar-pendiente"
            data-ticket="${t.ticket}"
            data-total="${t.total_ticket}"
            data-tipo-orden="${t.tipo_orden || 'llevar'}"
            data-sensor="${t.sensor_num || ''}"
            data-dir="${t.direccion || ''}"
            data-envio="${t.costo_envio || 0}">
            💳 Cobrar
          </button>
        </div>`;
      }
      lista.innerHTML = html;

      lista.querySelectorAll('.btn-cobrar-pendiente').forEach(btn => {
        btn.addEventListener('click', () => {
          this.abrirCobrarPendiente({
            ticket: btn.dataset.ticket,
            total: parseFloat(btn.dataset.total),
            tipoOrden: btn.dataset.tipoOrden,
            sensor: btn.dataset.sensor,
            dir: btn.dataset.dir,
            envio: parseFloat(btn.dataset.envio) || 0,
            items: lista.querySelector(`.btn-cobrar-pendiente[data-ticket="${btn.dataset.ticket}"]`)
              .closest('.pendiente-card').querySelector('.pendiente-items').innerHTML,
          });
        });
      });
    } catch (err) {
      if (lista) lista.innerHTML = `<p style="color:#dc3545;">Error: ${err.message}</p>`;
    }
  },

  abrirCobrarPendiente({ ticket, total, tipoOrden, sensor, dir, envio, items }) {
    this._cobrarTicket = ticket;
    this._cobrarTotal = total;
    this._cobrarMetodo = '';

    setText('cobrar-pendiente-title', `Cobrar Ticket #${ticket}`);

    const itemsEl = document.getElementById('cobrar-pendiente-items');
    if (itemsEl) itemsEl.innerHTML = items;

    const totalEl = document.getElementById('cobrar-pendiente-total');
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    // Reset selección de método
    document.querySelectorAll('#cobrar-pago-methods .tile-pago').forEach(t => t.classList.remove('active'));
    const efectivoRow = document.getElementById('cobrar-efectivo-row');
    if (efectivoRow) efectivoRow.style.display = 'none';
    const cobrarInput = document.getElementById('cobrar-efectivo-input');
    if (cobrarInput) cobrarInput.value = '';
    document.getElementById('cobrar-pendiente-confirmar').disabled = true;

    openModal('modal-cobrar-pendiente');
  },

  async confirmarCobroPendiente() {
    if (!this._cobrarTicket || !this._cobrarMetodo) return;

    let pagoEfectivo = null;
    let cambio = 0;

    if (this._cobrarMetodo === 'efectivo') {
      pagoEfectivo = parseFloat(document.getElementById('cobrar-efectivo-input')?.value) || 0;
      if (pagoEfectivo < this._cobrarTotal) {
        this.showAlert('Monto insuficiente', 'El monto recibido es menor al total.', 'error');
        return;
      }
      cambio = pagoEfectivo - this._cobrarTotal;
    }

    showLoading('Procesando Cobro...');
    try {
      const offsetMs = new Date().getTimezoneOffset() * 60000;
      const now = new Date(Date.now() - offsetMs).toISOString().replace('T', ' ').substring(0, 19);

      await dbExecute(
        `UPDATE rv_ventas SET estatus = 'completado', metodo_pago = $1, fecha = $2
         WHERE ticket = $3 AND estatus = 'pendiente'`,
        [this._cobrarMetodo, now, this._cobrarTicket]
      );

      // Re-firmar licencia
      try {
        const { invoke } = window.__TAURI__?.core || await import('@tauri-apps/api/core');
        const [licencia] = await dbSelect(`SELECT * FROM rv_licencia_local WHERE id = 1`);
        if (licencia) {
          const nuevasVentas = (licencia.ventas_desde_sync || 0) + 1;
          const nuevaFirma = await invoke('generar_firma_licencia', {
            fechaUltimoSync: licencia.fecha_ultimo_sync,
            fechaExpiracion: licencia.fecha_expiracion,
            ventasDesdeSync: nuevasVentas
          });
          await dbExecute(
            `UPDATE rv_licencia_local SET ventas_desde_sync = $1, firma_digital = $2 WHERE id = 1`,
            [nuevasVentas, nuevaFirma]
          );
        }
      } catch (_) {}

      hideLoading();

      // Obtener datos para el ticket
      const rows = await dbSelect(
        `SELECT * FROM rv_ventas WHERE ticket = $1 LIMIT 1`, [this._cobrarTicket]
      );
      const items = await dbSelect(
        `SELECT cantidad, producto, total FROM rv_ventas WHERE ticket = $1`, [this._cobrarTicket]
      );
      const r = rows[0] || {};

      let vendedorNombre = 'Vendedor';
      try {
        const vData = await dbSelect('SELECT emp_nombre FROM tm_empleado WHERE emp_id = $1', [r.vendedor]);
        if (vData?.length) vendedorNombre = vData[0].emp_nombre;
      } catch (_) {}

      const datosTicket = {
        ticket_id: this._cobrarTicket,
        fecha: new Date().toLocaleString('es-MX'),
        vendedor_nombre: vendedorNombre,
        tipo_pago: this._cobrarMetodo.toUpperCase(),
        tipo_orden: r.tipo_orden || 'comer_aqui',
        sensor_num: r.sensor_num || null,
        direccion: r.direccion || null,
        costo_envio: parseFloat(r.costo_envio) || 0,
        total: this._cobrarTotal,
        pago: pagoEfectivo || this._cobrarTotal,
        cambio,
        productos: items.map(i => ({ nombre: i.producto, cantidad: i.cantidad, precio: i.total / i.cantidad }))
      };

      const htmlTicket = this.generarHTMLTicket(datosTicket);
      if (window.imprimirTicket) window.imprimirTicket(htmlTicket);

      if (this._cobrarMetodo === 'efectivo') {
        this.showAlert(`Cambio: $${cambio.toFixed(2)}`, `Cobro exitoso. Ticket #${this._cobrarTicket}`, 'success');
      } else {
        this.showAlert('Cobro exitoso', `Ticket #${this._cobrarTicket} – $${this._cobrarTotal.toFixed(2)}`, 'success');
      }

      closeModal('modal-cobrar-pendiente');
      closeModal('modal-pendientes');
      this.actualizarEstadoCaja();
      this.actualizarBadgePendientes();

    } catch (err) {
      hideLoading();
      this.showAlert('Error', 'No se pudo procesar el cobro: ' + (err.message || ''), 'error');
    }
  },

  // ─── Corte Preventivo ─────────────────────────────────────────────────────
  abrirModalCorte() {
    const activo = document.querySelector('.vendedor-selector.is_active');
    if (!activo) {
      this.showAlert('Selecciona un cajero', 'Debes seleccionar quién realizará el corte.', 'warning');
      return;
    }
    const efectivo = this._cajaEfectivo || 0;
    const fondo = this._cajaFondo || 0;
    const disponible = efectivo - fondo;
    const info = document.getElementById('corte-info-caja');
    if (info) info.textContent = `Efectivo en caja: $${efectivo.toLocaleString('es-MX', {minimumFractionDigits:2})} · Fondo: $${fondo.toLocaleString('es-MX', {minimumFractionDigits:2})} · Disponible: $${disponible.toLocaleString('es-MX', {minimumFractionDigits:2})}`;
    const input = document.getElementById('corteMontoInput');
    if (input) input.value = '';
    openModal('modal-corte');
    setTimeout(() => input?.focus(), 100);
  },

  async confirmarCorte() {
    const activo = document.querySelector('.vendedor-selector.is_active');
    if (!activo) { closeModal('modal-corte'); return; }

    const monto = parseFloat(document.getElementById('corteMontoInput')?.value) || 0;
    if (monto <= 0) {
      this.showAlert('Monto inválido', 'Ingresa un monto mayor a $0.', 'warning');
      return;
    }
    const disponible = (this._cajaEfectivo || 0) - (this._cajaFondo || 0);
    if (monto > disponible + 0.01) {
      this.showAlert('Monto excede disponible', `Solo puedes retirar hasta $${disponible.toLocaleString('es-MX', {minimumFractionDigits:2})}.`, 'warning');
      return;
    }

    closeModal('modal-corte');
    const empNombre = activo.textContent.trim();
    const retiroFmt = '$' + monto.toLocaleString('es-MX', {minimumFractionDigits:2});

    this.showConfirm(
      '¿Confirmar Retiro?',
      `${empNombre} retirará ${retiroFmt} de la caja.`,
      'warning',
      async () => {
        try {
          showLoading('Procesando Retiro...');
          await dbExecute(
            `INSERT INTO rv_gastos(tipo_gasto, descripcion, fecha, comentario, precio_unitario, tipo, metodo_pago, usu_id)
             VALUES('Corte Preventivo', 'Retiro de efectivo preventivo', datetime('now', 'localtime'),
               $1, $2, 'operativo', 'efectivo', $3)`,
            ['Realizado por: ' + empNombre, monto, this.vendedorSeleccionado || 1]
          );
          hideLoading();
          this.actualizarEstadoCaja();
          this.showAlert('Retiro Realizado', `${empNombre} registró el retiro de ${retiroFmt} correctamente.`, 'success');
        } catch (err) {
          hideLoading();
          this.showAlert('Error', 'No se pudo registrar el retiro: ' + (err.message || ''), 'error');
        }
      }
    );
  },

  // ─── Alert / Confirm ─────────────────────────────────────────────────────
  showAlert(title, msg, type = 'info', onClose = null) {
    const colors = {
      success: 'linear-gradient(135deg,#28a745,#20c997)',
      error: 'linear-gradient(135deg,#dc3545,#c82333)',
      warning: 'linear-gradient(135deg,#ffc107,#ff9800)',
      info: 'linear-gradient(135deg,#4a90e2,#357abd)',
    };
    const header = document.getElementById('cj-alert-header');
    const titleEl = document.getElementById('cj-alert-title');
    const bodyEl = document.getElementById('cj-alert-body');
    const cancel = document.getElementById('cj-alert-cancel');
    const confirm = document.getElementById('cj-alert-confirm');
    if (header) header.style.background = colors[type] || colors.info;
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = msg;
    if (cancel) { cancel.style.display = 'none'; cancel.onclick = null; }
    if (confirm) { confirm.textContent = 'Aceptar'; confirm.onclick = () => { closeAlert(); if (onClose) onClose(); }; }
    openModal('cj-alert-overlay');
  },

  showConfirm(title, msg, type = 'warning', onConfirm = null) {
    const colors = {
      warning: 'linear-gradient(135deg,#ffc107,#ff9800)',
      info: 'linear-gradient(135deg,#4a90e2,#357abd)',
      success: 'linear-gradient(135deg,#28a745,#20c997)',
    };
    const header = document.getElementById('cj-alert-header');
    const titleEl = document.getElementById('cj-alert-title');
    const bodyEl = document.getElementById('cj-alert-body');
    const cancel = document.getElementById('cj-alert-cancel');
    const confirm = document.getElementById('cj-alert-confirm');
    if (header) header.style.background = colors[type] || colors.warning;
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = msg;
    if (cancel) { cancel.style.display = ''; cancel.textContent = 'Cancelar'; cancel.onclick = () => closeAlert(); }
    if (confirm) { confirm.textContent = 'Confirmar'; confirm.onclick = () => { closeAlert(); if (onConfirm) onConfirm(); }; }
    openModal('cj-alert-overlay');
  },
};

// Exponer globalmente para los onclick del HTML
window.CajaApp = CajaApp;

// Helper global de impresión (Compatible con WebView2 - Iframe method)
window.imprimirTicket = function (html) {
  if (!html) return;
  // Remover iframe previo si existe
  const oldFrame = document.getElementById('print-iframe');
  if (oldFrame) { oldFrame.parentNode.removeChild(oldFrame); }

  // Crear nuevo iframe oculto
  const iframe = document.createElement('iframe');
  iframe.id = 'print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  // Esperar a que renderice y mandar a imprimir
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    // Limpieza después de imprimir (opcional, dejamos el iframe para evitar fugas si print bloquea)
    setTimeout(() => {
      const frameToRemove = document.getElementById('print-iframe');
      if (frameToRemove) frameToRemove.parentNode.removeChild(frameToRemove);
    }, 5000); // 5 segundos de margen post-print
  }, 400);
};

// ─── Queries SQLite ───────────────────────────────────────────────────────────
async function getProductos() {
  return await dbSelect(
    `SELECT p.ID, p.pr_nombre, c.nombre AS pr_categoria,
      p.pr_precioventa, p.pr_favorito, p.pr_stock
     FROM rv_productos p
     INNER JOIN rv_categorias c ON p.categoria_id = c.id
     WHERE p.pr_estatus = 1`,
    []
  );
}

async function getCajeros() {
  return await dbSelect(
    `SELECT emp_id, emp_nombre 
     FROM tm_empleado 
     WHERE emp_estatus = 1 AND (emp_puesto = 'Cajero' OR emp_puesto = 'empleado')
     ORDER BY emp_nombre`,
    []
  );
}

async function getIngredientes() {
  return await dbSelect(
    `SELECT ingrediente_id, nombre_ingrediente, categoria
     FROM rv_ingredientes WHERE es_activo = 1
     ORDER BY categoria, nombre_ingrediente`,
    []
  );
}

async function verificarCajaActiva() {
  const rows = await dbSelect(
    `SELECT id FROM rv_apertura_caja WHERE estatus = 'activa' LIMIT 1`, []
  );
  return rows.length > 0;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugify(str) {
  return (str || '').replace(/\s+/g, '-').replace(/[^A-Za-z0-9-]/g, '');
}
function escJs(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function on(id, ev, fn) {
  document.getElementById(id)?.addEventListener(ev, fn);
}
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}
function closeAlert() {
  closeModal('cj-alert-overlay');
}
function showLoading(text = 'Procesando...') {
  setText('cj-loading-text', text);
  document.getElementById('cj-loading')?.classList.add('active');
}
function hideLoading() {
  document.getElementById('cj-loading')?.classList.remove('active');
}
