/**
 * cierre_caja.js - Módulo de Apertura y Cierre de Caja
 * Clona: pages/cierre_caja.php + js/cierre_caja.js + controller/cierre_caja.php
 * Reemplaza AJAX → SQLite local via dbSelect / dbExecute
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderCierreCaja(container) {
    injectCSS('cierre-caja-css', '/assets/css/cierre_caja.css');
    renderLayout(container, 'cierre_caja', getCierreCajaHTML());
    await CierreCajaApp.init();
}

function injectCSS(id, href) {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// ─── HTML (clonado de cierre_caja.php) ───────────────────────────────────────
function getCierreCajaHTML() {
    return `
    <div class="cierre-caja-container">

      <!-- Header -->
      <div class="cc-header-section">
        <h1 class="cc-page-title">
          <i class="fas fa-cash-register"></i>
          Cierre de Caja
        </h1>
        <p class="cc-page-subtitle">Control y gestión de apertura y cierre de caja</p>
      </div>

      <!-- Estado de Caja -->
      <div class="cc-estado-card">
        <div class="cc-status-indicator closed" id="caja-status-indicator">
          <i class="fas fa-lock"></i>
        </div>
        <div class="cc-status-text" id="status-text">Caja Cerrada</div>
        <div class="cc-apertura-time" id="apertura-time" style="display:none;">Desde: --:--</div>

        <div class="cc-action-buttons">
          <button class="cc-btn cc-btn-abrir"  id="btn-abrir-caja">
            <i class="fas fa-lock-open"></i> Abrir Caja
          </button>
          <button class="cc-btn cc-btn-cerrar" id="btn-cerrar-caja" disabled>
            <i class="fas fa-lock"></i> Cerrar Caja
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="cc-kpis-grid">
        <div class="cc-kpi-card ventas">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon ventas"><i class="fas fa-dollar-sign"></i></div>
            <div>
              <div class="cc-kpi-label">Ventas Total</div>
              <div class="cc-kpi-value" id="kpi-ventas-total">$0.00</div>
            </div>
          </div>
        </div>
        <div class="cc-kpi-card efectivo">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon efectivo"><i class="fas fa-money-bill-wave"></i></div>
            <div>
              <div class="cc-kpi-label">Ventas Efectivo</div>
              <div class="cc-kpi-value" id="kpi-efectivo">$0.00</div>
            </div>
          </div>
        </div>
        <div class="cc-kpi-card tarjeta">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon tarjeta"><i class="fas fa-credit-card"></i></div>
            <div>
              <div class="cc-kpi-label">Ventas Tarjeta</div>
              <div class="cc-kpi-value" id="kpi-tarjeta">$0.00</div>
            </div>
          </div>
        </div>
        <div class="cc-kpi-card transferencia">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon transferencia"><i class="fas fa-mobile-alt"></i></div>
            <div>
              <div class="cc-kpi-label">Ventas Transferencia</div>
              <div class="cc-kpi-value" id="kpi-transferencia">$0.00</div>
            </div>
          </div>
        </div>
        <div class="cc-kpi-card diferencia">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon diferencia"><i class="fas fa-calculator"></i></div>
            <div>
              <div class="cc-kpi-label">Efectivo Esperado</div>
              <div class="cc-kpi-value" id="kpi-efectivo-esperado">$0.00</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen + Cortes Preventivos (visible solo si caja abierta) -->
      <div id="resumen-section" style="display:none;">
        <div class="cc-resumen-row">
          <!-- Resumen Detallado -->
          <div class="cc-resumen-section">
            <div class="cc-resumen-title">
              <span><i class="fas fa-chart-pie"></i> Resumen Detallado del Turno</span>
            </div>
            <div class="cc-resumen-grid">
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Monto de Apertura</span>
                <span class="cc-resumen-item-value" id="resumen-apertura">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Ventas en Efectivo</span>
                <span class="cc-resumen-item-value" id="resumen-ventas-efectivo">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Ventas con Tarjeta</span>
                <span class="cc-resumen-item-value" id="resumen-ventas-tarjeta">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Ventas con Transferencia</span>
                <span class="cc-resumen-item-value" id="resumen-ventas-transferencia">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Total Ventas</span>
                <span class="cc-resumen-item-value" id="resumen-ventas-total">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Salidas de Efectivo</span>
                <span class="cc-resumen-item-value" style="color:#e17055;" id="resumen-salidas-efectivo">$0.00</span>
              </div>
              <div class="cc-resumen-item highlight">
                <span class="cc-resumen-item-label">Efectivo Esperado en Caja</span>
                <span class="cc-resumen-item-value" id="resumen-esperado">$0.00</span>
              </div>
            </div>
          </div>

          <!-- Cortes y Salidas -->
          <div class="cc-resumen-section">
            <div class="cc-resumen-title">
              <span><i class="fas fa-cut"></i> Cortes Preventivos</span>
              <span class="cc-badge" id="badge-total-cortes">$0.00</span>
            </div>
            <div class="cc-cortes-list" id="lista-cortes-preventivos">
              <div style="text-align:center; color:#6c757d; padding:24px;">Cargando cortes...</div>
            </div>

            <div class="cc-resumen-title" style="margin-top:16px;">
              <span><i class="fas fa-hand-holding-usd"></i> Salidas de Efectivo</span>
              <span class="cc-badge cc-badge-salidas" id="badge-total-salidas">$0.00</span>
            </div>
            <div class="cc-cortes-list" id="lista-salidas-efectivo">
              <div style="text-align:center; color:#6c757d; padding:24px;">Cargando salidas...</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal: Apertura de Caja -->
    <div class="cc-modal-overlay" id="modal-apertura">
      <div class="cc-modal">
        <div class="cc-modal-header apertura">
          <h5>Apertura de Caja</h5>
          <button class="cc-modal-close" id="close-modal-apertura">&times;</button>
        </div>
        <div class="cc-modal-body">
          <div class="cc-numpad-container">
            <div class="cc-display">
              <div class="cc-display-label">Monto Inicial</div>
              <div class="cc-display-value" id="inputMontoInicial">$0.00</div>
            </div>
            <div class="cc-numpad" id="numpad-apertura">
              <button class="cc-btn-num" data-num="1">1</button>
              <button class="cc-btn-num" data-num="2">2</button>
              <button class="cc-btn-num" data-num="3">3</button>
              <button class="cc-btn-num" data-num="4">4</button>
              <button class="cc-btn-num" data-num="5">5</button>
              <button class="cc-btn-num" data-num="6">6</button>
              <button class="cc-btn-num" data-num="7">7</button>
              <button class="cc-btn-num" data-num="8">8</button>
              <button class="cc-btn-num" data-num="9">9</button>
              <button class="cc-btn-num" data-num=".">.</button>
              <button class="cc-btn-num" data-num="0">0</button>
              <button class="cc-btn-num" data-num="00">00</button>
              <button class="cc-btn-borrar" id="btn-borrar-apertura">
                <i class="fas fa-backspace"></i> Borrar
              </button>
            </div>
          </div>
        </div>
        <div class="cc-modal-footer">
          <button class="cc-btn-secondary"       id="btn-cancelar-apertura">Cancelar</button>
          <button class="cc-btn-confirm-apertura" id="btnConfirmarApertura">
            <i class="fas fa-check"></i> Confirmar Apertura
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Cierre de Caja -->
    <div class="cc-modal-overlay" id="modal-cierre">
      <div class="cc-modal">
        <div class="cc-modal-header cierre">
          <h5>Cierre de Caja</h5>
          <button class="cc-modal-close" id="close-modal-cierre">&times;</button>
        </div>
        <div class="cc-modal-body">
          <div class="cc-numpad-container">
            <div class="cc-display cierre">
              <div class="cc-display-label">Conteo Físico de Efectivo</div>
              <div class="cc-display-value" id="inputMontoFinalConfirmacion">0.00</div>
            </div>
            <div class="cc-numpad" id="numpad-cierre">
              <button class="cc-btn-num" data-num="1">1</button>
              <button class="cc-btn-num" data-num="2">2</button>
              <button class="cc-btn-num" data-num="3">3</button>
              <button class="cc-btn-num" data-num="4">4</button>
              <button class="cc-btn-num" data-num="5">5</button>
              <button class="cc-btn-num" data-num="6">6</button>
              <button class="cc-btn-num" data-num="7">7</button>
              <button class="cc-btn-num" data-num="8">8</button>
              <button class="cc-btn-num" data-num="9">9</button>
              <button class="cc-btn-num" data-num=".">.</button>
              <button class="cc-btn-num" data-num="0">0</button>
              <button class="cc-btn-num" data-num="00">00</button>
              <button class="cc-btn-borrar" id="btn-borrar-cierre">
                <i class="fas fa-backspace"></i> Borrar
              </button>
            </div>
          </div>
        </div>
        <div class="cc-modal-footer">
          <button class="cc-btn-secondary"     id="btn-cancelar-cierre">Cancelar</button>
          <button class="cc-btn-confirm-cierre" id="btnConfirmarCierre">
            <i class="fas fa-lock"></i> Cerrar Caja
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de alerta simple (reemplaza SweetAlert) -->
    <div class="cc-modal-overlay" id="modal-alert">
      <div class="cc-modal" style="max-width:340px;">
        <div class="cc-modal-header apertura" id="alert-header">
          <h5 id="alert-title">Aviso</h5>
          <button class="cc-modal-close" id="close-modal-alert">&times;</button>
        </div>
        <div class="cc-modal-body">
          <p id="alert-body" style="font-size:1rem; line-height:1.5;"></p>
        </div>
        <div class="cc-modal-footer">
          <button class="cc-btn-secondary" id="alert-cancel" style="display:none;">Cancelar</button>
          <button class="cc-btn-confirm-apertura" id="alert-confirm">Aceptar</button>
        </div>
      </div>
    </div>
  `;
}

// ─── Lógica principal ─────────────────────────────────────────────────────────

const CierreCajaApp = {
    cajaActivaId: null,
    montoAperturaCaja: 0,
    totalVentasSistema: 0,
    efectivoEsperado: 0,

    // Inputs del numpad
    inputApertura: '',
    inputCierre: '',

    async init() {
        this.bindEvents();
        await this.cargarEstadoCaja();
    },

    // ──────────────────────────────────────────────────────────────────────────
    // CARGA DE ESTADO
    // ──────────────────────────────────────────────────────────────────────────
    async cargarEstadoCaja() {
        try {
            const data = await verificarEstadoYResumen();
            if (data.caja_activa) {
                this.mostrarCajaAbierta(data);
            } else {
                this.mostrarCajaCerrada();
            }
        } catch (err) {
            console.error('Error al cargar estado de caja:', err);
            this.showAlert('Error', 'No se pudo verificar el estado de la caja.', 'error');
        }
    },

    mostrarCajaAbierta(data) {
        // Indicador visual
        const ind = document.getElementById('caja-status-indicator');
        if (ind) { ind.classList.remove('closed'); ind.classList.add('open'); ind.innerHTML = '<i class="fas fa-lock-open"></i>'; }
        setText('status-text', 'Caja Abierta');
        const apTime = document.getElementById('apertura-time');
        if (apTime) { apTime.textContent = 'Desde: ' + formatDate(data.fecha_apertura); apTime.style.display = ''; }

        // Botones
        setDisabled('btn-abrir-caja', true);
        setDisabled('btn-cerrar-caja', false);

        // Mostrar resumen
        const rs = document.getElementById('resumen-section');
        if (rs) rs.style.display = '';

        // Guardar estado
        this.cajaActivaId = data.id_caja;
        this.montoAperturaCaja = parseFloat(data.monto_apertura) || 0;
        this.totalVentasSistema = parseFloat(data.total_ventas) || 0;
        this.efectivoEsperado = parseFloat(data.total_caja_esperado) || 0;
        this._ventasEfectivo = parseFloat(data.ventas_efectivo) || 0;
        this._ventasTarjeta = parseFloat(data.ventas_tarjeta) || 0;
        this._ventasTransferencia = parseFloat(data.ventas_transferencia) || 0;
        this._totalSalidas = parseFloat(data.total_salidas) || 0;

        // KPIs
        animateValue('kpi-ventas-total', 0, data.total_ventas, 1000, true);
        animateValue('kpi-efectivo', 0, data.ventas_efectivo, 1000, true);
        animateValue('kpi-tarjeta', 0, data.ventas_tarjeta, 1000, true);
        animateValue('kpi-transferencia', 0, data.ventas_transferencia || 0, 1000, true);
        animateValue('kpi-efectivo-esperado', 0, this.efectivoEsperado, 1000, true);

        // Resumen detallado
        setText('resumen-apertura', formatCurrency(this.montoAperturaCaja));
        setText('resumen-ventas-efectivo', formatCurrency(data.ventas_efectivo));
        setText('resumen-ventas-tarjeta', formatCurrency(data.ventas_tarjeta));
        setText('resumen-ventas-transferencia', formatCurrency(data.ventas_transferencia || 0));
        setText('resumen-ventas-total', formatCurrency(data.total_ventas));
        setText('resumen-salidas-efectivo', '-' + formatCurrency(data.total_salidas || 0));
        setText('resumen-esperado', formatCurrency(this.efectivoEsperado));

        // Cortes preventivos
        setText('badge-total-cortes', formatCurrency(data.total_cortes || 0));
        const lista = document.getElementById('lista-cortes-preventivos');
        if (lista) {
            if (data.lista_cortes && data.lista_cortes.length > 0) {
                lista.innerHTML = data.lista_cortes.map(corte => {
                    const t = new Date(corte.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                    const user = (corte.comentario || '').replace('Realizado por: ', '');
                    return `
            <div class="cc-corte-item">
              <div>
                <div class="cc-corte-monto">${formatCurrency(corte.monto)}</div>
                <div class="cc-corte-hora"><i class="far fa-clock"></i> ${t}</div>
              </div>
              <div class="cc-corte-user"><i class="fas fa-user-circle"></i> ${user}</div>
            </div>`;
                }).join('');
            } else {
                lista.innerHTML = '<div style="text-align:center; color:#6c757d; padding:24px; font-style:italic;">No hay cortes registrados.</div>';
            }
        }

        // Salidas de efectivo
        setText('badge-total-salidas', formatCurrency(data.total_salidas || 0));
        const listaSalidas = document.getElementById('lista-salidas-efectivo');
        if (listaSalidas) {
            if (data.lista_salidas && data.lista_salidas.length > 0) {
                listaSalidas.innerHTML = data.lista_salidas.map(s => {
                    const t = new Date(s.fecha.replace(' ', 'T')).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                    return `
            <div class="cc-corte-item">
              <div>
                <div class="cc-corte-monto" style="color:#e17055;">${formatCurrency(s.monto)}</div>
                <div class="cc-corte-hora"><i class="far fa-clock"></i> ${t}</div>
              </div>
              <div class="cc-corte-user" style="font-size:11px;max-width:120px;text-align:right;">${s.descripcion || '—'}</div>
            </div>`;
                }).join('');
            } else {
                listaSalidas.innerHTML = '<div style="text-align:center; color:#6c757d; padding:16px; font-style:italic;">No hay salidas registradas.</div>';
            }
        }
    },

    mostrarCajaCerrada() {
        const ind = document.getElementById('caja-status-indicator');
        if (ind) { ind.classList.remove('open'); ind.classList.add('closed'); ind.innerHTML = '<i class="fas fa-lock"></i>'; }
        setText('status-text', 'Caja Cerrada');
        const apTime = document.getElementById('apertura-time');
        if (apTime) apTime.style.display = 'none';

        setDisabled('btn-abrir-caja', false);
        setDisabled('btn-cerrar-caja', true);

        const rs = document.getElementById('resumen-section');
        if (rs) rs.style.display = 'none';

        this.cajaActivaId = null;
        this.montoAperturaCaja = 0;
        this.totalVentasSistema = 0;
        this.efectivoEsperado = 0;

        ['kpi-ventas-total', 'kpi-efectivo', 'kpi-tarjeta', 'kpi-transferencia', 'kpi-efectivo-esperado']
            .forEach(id => setText(id, '$0.00'));
    },

    // ──────────────────────────────────────────────────────────────────────────
    // EVENTOS
    // ──────────────────────────────────────────────────────────────────────────
    bindEvents() {
        // Abrir modal apertura
        on('btn-abrir-caja', 'click', () => openModal('modal-apertura'));

        // Cerrar modales
        on('close-modal-apertura', 'click', () => closeModal('modal-apertura'));
        on('btn-cancelar-apertura', 'click', () => closeModal('modal-apertura'));
        on('close-modal-cierre', 'click', () => closeModal('modal-cierre'));
        on('btn-cancelar-cierre', 'click', () => closeModal('modal-cierre'));
        on('close-modal-alert', 'click', () => closeModal('modal-alert'));

        // Cerrar al hacer click en overlay
        ['modal-apertura', 'modal-cierre', 'modal-alert'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', (e) => {
                if (e.target.id === id) closeModal(id);
            });
        });

        // Abrir modal cierre
        on('btn-cerrar-caja', 'click', () => {
            if (!this.cajaActivaId) {
                this.showAlert('Caja Cerrada', 'No hay una caja abierta para cerrar.', 'info');
                return;
            }
            this.inputCierre = '';
            setText('inputMontoFinalConfirmacion', '0.00');
            openModal('modal-cierre');
        });

        // Numpad apertura
        document.getElementById('numpad-apertura')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.cc-btn-num');
            if (!btn) return;
            const num = btn.dataset.num;
            this.inputApertura = appendNumpad(this.inputApertura, num);
            setText('inputMontoInicial', '$' + (this.inputApertura || '0.00'));
        });
        on('btn-borrar-apertura', 'click', () => {
            this.inputApertura = '';
            setText('inputMontoInicial', '$0.00');
        });

        // Al abrir modal apertura → resetear
        document.getElementById('modal-apertura')?.addEventListener('transitionend', () => { });
        on('modal-apertura', 'click', () => { }); // noop para activar listener anterior

        // Numpad cierre
        document.getElementById('numpad-cierre')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.cc-btn-num');
            if (!btn) return;
            const num = btn.dataset.num;
            this.inputCierre = appendNumpad(this.inputCierre, num);
            setText('inputMontoFinalConfirmacion', this.inputCierre || '0.00');
        });
        on('btn-borrar-cierre', 'click', () => {
            this.inputCierre = '';
            setText('inputMontoFinalConfirmacion', '0.00');
        });

        // Confirmar apertura
        on('btnConfirmarApertura', 'click', () => this.confirmarApertura());

        // Confirmar cierre
        on('btnConfirmarCierre', 'click', () => this.confirmarCierre());
    },

    // ──────────────────────────────────────────────────────────────────────────
    // APERTURA
    // ──────────────────────────────────────────────────────────────────────────
    async confirmarApertura() {
        const monto = parseFloat(this.inputApertura) || 0;
        if (monto < 0) {
            this.showAlert('Monto Inválido', 'Por favor, ingrese un monto inicial válido.', 'error');
            return;
        }

        closeModal('modal-apertura');
        this.showConfirm(
            '¿Confirmar apertura?',
            `¿Abrir caja con ${formatCurrency(monto)}?`,
            'question',
            async () => {
                try {
                    await abrirCaja(monto);
                    await this.cargarEstadoCaja();
                    this.showAlert('¡Éxito!', 'Caja abierta correctamente.', 'success');
                } catch (err) {
                    this.showAlert('Error', err.message || 'No se pudo abrir la caja.', 'error');
                }
            }
        );
    },

    // ──────────────────────────────────────────────────────────────────────────
    // CIERRE
    // ──────────────────────────────────────────────────────────────────────────
    async confirmarCierre() {
        const montoFisico = parseFloat(this.inputCierre) || 0;
        if (montoFisico < 0) {
            this.showAlert('Monto Inválido', 'Por favor, ingrese el monto físico contado.', 'error');
            return;
        }

        const diferencia = montoFisico - this.efectivoEsperado;
        let msg = `El sistema esperaba ${formatCurrency(this.efectivoEsperado)} y contaste ${formatCurrency(montoFisico)}. `;
        let tipo = 'info';

        if (diferencia > 0) {
            msg += `Sobran ${formatCurrency(diferencia)}.`;
            tipo = 'warning';
        } else if (diferencia < 0) {
            msg += `Faltan ${formatCurrency(Math.abs(diferencia))}.`;
            tipo = 'warning';
        } else {
            msg += '¡La caja cuadra perfectamente!';
            tipo = 'success';
        }

        closeModal('modal-cierre');
        this.showConfirm('Confirmar Cierre de Caja', msg + '\n\n¿Deseas proceder con el cierre?', tipo, async () => {
            try {
                await cerrarCaja(this.cajaActivaId, montoFisico, this.totalVentasSistema, diferencia, {
                    ventas_efectivo: this._ventasEfectivo || 0,
                    ventas_tarjeta: this._ventasTarjeta || 0,
                    ventas_transferencia: this._ventasTransferencia || 0,
                    gastos_efectivo: this._totalSalidas || 0,
                });
                await this.cargarEstadoCaja();
                this.showAlert('¡Caja Cerrada!', 'El cierre se realizó correctamente.', 'success');
            } catch (err) {
                this.showAlert('Error', err.message || 'No se pudo procesar el cierre de caja.', 'error');
            }
        });
    },

    // ──────────────────────────────────────────────────────────────────────────
    // ALERT / CONFIRM reutilizables (reemplazan SweetAlert)
    // ──────────────────────────────────────────────────────────────────────────
    showAlert(title, message, type = 'info', onClose = null) {
        const headerColors = {
            success: 'linear-gradient(135deg, #28a745, #20c997)',
            error: 'linear-gradient(135deg, #dc3545, #c82333)',
            warning: 'linear-gradient(135deg, #ffc107, #ff9800)',
            info: 'linear-gradient(135deg, #4a90e2, #357abd)',
            question: 'linear-gradient(135deg, #4a90e2, #357abd)',
        };
        const header = document.getElementById('alert-header');
        const titleEl = document.getElementById('alert-title');
        const bodyEl = document.getElementById('alert-body');
        const cancel = document.getElementById('alert-cancel');
        const confirm = document.getElementById('alert-confirm');

        if (header) header.style.background = headerColors[type] || headerColors.info;
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.textContent = message;
        if (cancel) { cancel.style.display = 'none'; cancel.onclick = null; }
        if (confirm) { confirm.textContent = 'Aceptar'; confirm.onclick = () => { closeModal('modal-alert'); if (onClose) onClose(); }; }

        openModal('modal-alert');
    },

    showConfirm(title, message, type = 'question', onConfirm = null) {
        const headerColors = {
            question: 'linear-gradient(135deg, #4a90e2, #357abd)',
            warning: 'linear-gradient(135deg, #ffc107, #ff9800)',
            success: 'linear-gradient(135deg, #28a745, #20c997)',
            info: 'linear-gradient(135deg, #4a90e2, #357abd)',
        };
        const header = document.getElementById('alert-header');
        const titleEl = document.getElementById('alert-title');
        const bodyEl = document.getElementById('alert-body');
        const cancel = document.getElementById('alert-cancel');
        const confirm = document.getElementById('alert-confirm');

        if (header) header.style.background = headerColors[type] || headerColors.question;
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) { bodyEl.textContent = message; bodyEl.style.whiteSpace = 'pre-line'; }
        if (cancel) {
            cancel.style.display = '';
            cancel.textContent = 'Cancelar';
            cancel.onclick = () => closeModal('modal-alert');
        }
        if (confirm) {
            confirm.textContent = 'Confirmar';
            confirm.onclick = () => {
                closeModal('modal-alert');
                if (onConfirm) onConfirm();
            };
        }
        openModal('modal-alert');
    },
};

window.CierreCajaApp = CierreCajaApp;

// ─── Queries SQLite (reemplaza controller/cierre_caja.php) ───────────────────

async function verificarEstadoYResumen() {
    // 1. Caja activa
    const cajas = await dbSelect(
        `SELECT id, fecha_apertura, monto_apertura, estatus
     FROM rv_apertura_caja
     WHERE estatus = 'activa'
     ORDER BY fecha_apertura DESC LIMIT 1`,
        []
    );

    if (cajas.length === 0) return { caja_activa: false };

    const caja = cajas[0];
    const idCaja = caja.id;

    // 2. KPIs de ventas desde que abrió la caja
    // ventas_efectivo incluye pagos directos en efectivo + porción efectivo de pagos mixtos
    const [totales] = await dbSelect(
        `SELECT
       COALESCE(SUM(total_ticket), 0) AS total_ventas,
       COALESCE(SUM(
         CASE
           WHEN LOWER(metodo_pago)='efectivo' THEN total
           WHEN LOWER(metodo_pago)='mixto'    THEN monto_efectivo
           ELSE 0
         END
       ), 0) AS ventas_efectivo,
       COALESCE(SUM(
         CASE
           WHEN LOWER(metodo_pago)='tarjeta' THEN total
           WHEN LOWER(metodo_pago)='mixto'   THEN monto_tarjeta
           ELSE 0
         END
       ), 0) AS ventas_tarjeta,
       COALESCE(SUM(
         CASE
           WHEN LOWER(metodo_pago)='transferencia' THEN total
           WHEN LOWER(metodo_pago)='mixto'         THEN monto_transferencia
           ELSE 0
         END
       ), 0) AS ventas_transferencia
     FROM rv_ventas
     WHERE estatus = 'completado'
       AND fecha >= $1`,
        [caja.fecha_apertura]
    );

    const mntoApertura = parseFloat(caja.monto_apertura) || 0;
    const ventasEfectivo = parseFloat(totales.ventas_efectivo) || 0;

    // 3. Cortes preventivos
    const cortesRows = await dbSelect(
        `SELECT precio_unitario as monto, fecha, comentario
     FROM rv_gastos
     WHERE tipo_gasto = 'Corte Preventivo'
       AND fecha >= $1
     ORDER BY fecha ASC`,
        [caja.fecha_apertura]
    );
    const totalCortes = cortesRows.reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);

    // 4. Salidas de efectivo (solo las pagadas en efectivo)
    const salidasRows = await dbSelect(
        `SELECT precio_unitario as monto, fecha, descripcion
     FROM rv_gastos
     WHERE tipo_gasto = 'Salida de Efectivo'
       AND LOWER(metodo_pago) = 'efectivo'
       AND fecha >= $1
     ORDER BY fecha ASC`,
        [caja.fecha_apertura]
    );
    const totalSalidas = salidasRows.reduce((s, r) => s + (parseFloat(r.monto) || 0), 0);

    // Efectivo esperado = apertura + ventas efectivo - cortes - salidas efectivo
    const efectivoEsperado = mntoApertura + ventasEfectivo - totalCortes - totalSalidas;

    return {
        caja_activa: true,
        id_caja: idCaja,
        fecha_apertura: caja.fecha_apertura,
        monto_apertura: mntoApertura,
        total_ventas: parseFloat(totales.total_ventas) || 0,
        ventas_efectivo: ventasEfectivo,
        ventas_tarjeta: parseFloat(totales.ventas_tarjeta) || 0,
        ventas_transferencia: parseFloat(totales.ventas_transferencia) || 0,
        total_caja_esperado: efectivoEsperado,
        total_cortes: totalCortes,
        lista_cortes: cortesRows,
        total_salidas: totalSalidas,
        lista_salidas: salidasRows,
    };
}

async function abrirCaja(montoApertura) {
    // Verificar que no haya caja activa
    const activa = await dbSelect(
        `SELECT id FROM rv_apertura_caja WHERE estatus = 'activa' LIMIT 1`, []
    );
    if (activa.length > 0) throw new Error('Ya hay una caja abierta.');

    const session = window._session || {};
    await dbExecute(
        `INSERT INTO rv_apertura_caja (fecha_apertura, monto_apertura, usu_id, estatus)
     VALUES (datetime('now','localtime'), $1, $2, 'activa')`,
        [montoApertura, session.usu_id || 1]
    );
}

async function cerrarCaja(idCaja, montoCierre, totalVentas, diferencia, extras = {}) {
    await dbExecute(
        `UPDATE rv_apertura_caja SET
       estatus              = 'cerrada',
       fecha_cierre         = datetime('now','localtime'),
       monto_cierre         = $1,
       total_ventas_sistema = $2,
       diferencia_cierre    = $3,
       ventas_efectivo      = $5,
       ventas_tarjeta       = $6,
       ventas_transferencia = $7,
       gastos_efectivo      = $8
     WHERE id = $4`,
        [montoCierre, totalVentas, diferencia, idCaja,
         extras.ventas_efectivo || 0, extras.ventas_tarjeta || 0,
         extras.ventas_transferencia || 0, extras.gastos_efectivo || 0]
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);
}

function formatDate(isoStr) {
    if (!isoStr) return '--:--';
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

function appendNumpad(current, num) {
    if (num === '.' && current.includes('.')) return current;
    if (num === '0' && current === '0') return current;
    if (current === '' && num !== '.') return num.toString();
    if (current === '' && num === '.') return '0.';
    return current + num.toString();
}

function animateValue(id, start, end, duration, isCurrency = false) {
    const el = document.getElementById(id);
    if (!el) return;
    const range = end - start;
    if (range === 0) { el.textContent = isCurrency ? formatCurrency(end) : end; return; }
    const startTime = Date.now();
    const endTime = startTime + duration;
    const timer = setInterval(() => {
        const remaining = Math.max((endTime - Date.now()) / duration, 0);
        const value = Math.round(end - remaining * range);
        el.textContent = isCurrency ? formatCurrency(value) : value;
        if (value >= end) { clearInterval(timer); el.textContent = isCurrency ? formatCurrency(end) : end; }
    }, 50);
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setDisabled(id, val) {
    const el = document.getElementById(id);
    if (el) el.disabled = val;
}

function on(id, event, handler) {
    document.getElementById(id)?.addEventListener(event, handler);
}

function openModal(id) {
    document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}
