/**
 * devoluciones.js - Módulo de Devoluciones y Token
 * Portado a SQLite y Vainilla JS.
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderDevoluciones(container) {
  injectCSS('devoluciones-css', '/assets/css/devoluciones.css');
  renderLayout(container, 'devoluciones', getDevolucionesHTML());
  DevolucionesApp.init();
}

function injectCSS(id, href) {
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

// ─── HTML ────────────────────────────────────────────────────────────────────
function getDevolucionesHTML() {
  return `
<div class="dev-container">
  <div class="dev-header">
    <h1 class="dev-title">🔄 Devoluciones</h1>
    <p class="dev-subtitle">Cancelar tickets de venta completados</p>
  </div>

  <div class="dev-grid">
    <!-- Buscador -->
    <div class="dev-search-card">
      <h3>Buscar Venta</h3>
      <div class="dev-form-group">
        <label>Número de Ticket:</label>
        <input type="number" id="ticket_id" class="dev-input" placeholder="Ej: 123" autocomplete="off">
      </div>
      <button class="dev-btn btn-primary" id="btn-buscar">
        <i class="fa fa-search"></i> Buscar Ticket
      </button>
    </div>

    <!-- Detalles -->
    <div class="dev-details-card">
      <div id="dev-placeholder" class="dev-placeholder">
        <i class="fa fa-receipt"></i>
        <p>Busque un ticket para ver sus detalles</p>
      </div>

      <div id="dev-content" class="dev-content" style="display:none;">
        <div class="dev-content-header">
          <h3>Ticket #<span id="lbl-ticket"></span></h3>
          <span class="dev-badge" id="lbl-status">Completado</span>
        </div>
        
        <div class="dev-info-grid">
          <div><strong>Fecha:</strong> <span id="lbl-fecha"></span></div>
          <div><strong>Vendedor:</strong> <span id="lbl-vendedor"></span></div>
          <div><strong>Metodo Pago:</strong> <span id="lbl-pago"></span></div>
          <div class="dev-total"><strong>Total:</strong> <span id="lbl-total"></span></div>
        </div>

        <h4>Productos:</h4>
        <ul class="dev-items-list" id="lista-productos"></ul>

        <hr class="dev-divider">

        <div class="dev-action-area">
          <div style="flex:1;">
            <label>Motivo de la Devolución:</label>
            <input type="text" id="motivo_devolucion" class="dev-input" placeholder="Ej: Error en cobro...">
          </div>
          <button class="dev-btn btn-danger" id="btn-iniciar-devolucion">
            Confirmar Devolución
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal Token -->
<div class="dev-modal-overlay" id="modal-token">
  <div class="dev-modal">
    <h3>Token de Autorización</h3>
    <p>Ingresa el token numérico (4 dígitos) de autorización para cancelar el ticket #<span id="lbl-ticket-modal"></span></p>
    
    <input type="password" id="input-token" class="dev-input text-center" maxlength="4" placeholder="••••" autocomplete="off" inputmode="numeric">
    <p id="token-error" class="dev-error" style="display:none;">Token inválido.</p>
    
    <div class="dev-modal-actions">
      <button class="dev-btn btn-secundario" id="btn-cancel-token">Cancelar</button>
      <button class="dev-btn btn-danger" id="btn-confirm-token">Validar y Devolver</button>
    </div>
  </div>
</div>
`;
}

// ─── LÓGICA ──────────────────────────────────────────────────────────────────
const DevolucionesApp = {
  _ticketActual: null,
  _ticketTotal: 0,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('btn-buscar').addEventListener('click', () => this.buscarTicket());

    document.getElementById('ticket_id').addEventListener('keypress', e => {
      if (e.key === 'Enter') this.buscarTicket();
    });

    document.getElementById('btn-iniciar-devolucion').addEventListener('click', () => this.iniciarDevolucion());

    // Modal tokens
    document.getElementById('btn-cancel-token').addEventListener('click', () => this.cerrarModal());
    document.getElementById('btn-confirm-token').addEventListener('click', () => this.procesarDevolucion());

    document.getElementById('input-token').addEventListener('keypress', e => {
      if (e.key === 'Enter') this.procesarDevolucion();
    });
  },

  // 1. Buscar ticket en SQLite
  async buscarTicket() {
    const id = document.getElementById('ticket_id').value.trim();
    if (!id) return this.showAlert('Ingrese un número de ticket.', 'error');

    const rows = await dbSelect(
      `SELECT ticket, fecha, vendedor, metodo_pago, total_ticket, estatus, cantidad, producto, total
       FROM rv_ventas
       WHERE ticket = $1`,
      [id]
    );

    if (rows.length === 0) {
      this.resetDetalles();
      return this.showAlert('No se encontró el ticket.', 'error');
    }

    const info = rows[0];
    if (info.estatus === 'cancelado') {
      this.resetDetalles();
      return this.showAlert('El ticket ya fue cancelado previamente.', 'warning');
    }

    // 2. Renderizar info
    this._ticketActual = id;
    this._ticketTotal = info.total_ticket;

    document.getElementById('lbl-ticket').textContent = info.ticket;
    document.getElementById('lbl-fecha').textContent = new Date(info.fecha).toLocaleString();
    document.getElementById('lbl-vendedor').textContent = info.vendedor;
    document.getElementById('lbl-pago').textContent = info.metodo_pago;
    document.getElementById('lbl-total').textContent = '$' + parseFloat(info.total_ticket).toFixed(2);

    const lista = document.getElementById('lista-productos');
    lista.innerHTML = rows.map(r => `
      <li>
        <div>
          <strong>${r.producto}</strong><br>
          <small>Cant: ${r.cantidad}</small>
        </div>
        <div style="font-weight:bold;">$${parseFloat(r.total).toFixed(2)}</div>
      </li>
    `).join('');

    document.getElementById('dev-placeholder').style.display = 'none';
    document.getElementById('dev-content').style.display = 'block';
    document.getElementById('motivo_devolucion').value = '';
  },

  resetDetalles() {
    this._ticketActual = null;
    document.getElementById('dev-placeholder').style.display = 'flex';
    document.getElementById('dev-content').style.display = 'none';
  },

  // 3. Iniciar devolución (abrir modal)
  iniciarDevolucion() {
    const motivo = document.getElementById('motivo_devolucion').value.trim();
    if (!motivo) return this.showAlert('Ingrese el motivo de la devolución.', 'warning');

    document.getElementById('lbl-ticket-modal').textContent = this._ticketActual;
    document.getElementById('input-token').value = '';
    document.getElementById('token-error').style.display = 'none';
    document.getElementById('modal-token').classList.add('active');
    setTimeout(() => document.getElementById('input-token').focus(), 100);
  },

  cerrarModal() {
    document.getElementById('modal-token').classList.remove('active');
  },

  // 4. Validar token y ejecutar
  async procesarDevolucion() {
    const token = document.getElementById('input-token').value.trim();
    if (token.length < 4) {
      this.mostrarErrorToken('El token debe tener 4 dígitos.');
      return;
    }

    // Validar token en token_global
    const tokenRows = await dbSelect(`SELECT token FROM token_global WHERE id = 1 AND token = $1`, [token]);

    if (tokenRows.length === 0) {
      this.mostrarErrorToken('Token incorrecto o expirado.');
      return;
    }

    const adminId = window._session?.usu_id || 1; // ID del usuario actual
    const motivo = document.getElementById('motivo_devolucion').value.trim();

    try {
      // Registrar la cancelación
      await dbExecute(`UPDATE rv_ventas SET estatus = 'cancelado' WHERE ticket = $1`, [this._ticketActual]);

      // Registrar en historial de devoluciones
      await dbExecute(
        `INSERT INTO rv_devoluciones (ticket_id, motivo, usu_id) VALUES ($1, $2, $3)`,
        [this._ticketActual, motivo, adminId]
      );

      this.cerrarModal();
      this.resetDetalles();
      document.getElementById('ticket_id').value = '';

      // Mostrar toast nativo
      this.showAlert('Ticket cancelado con éxito.', 'success');

    } catch (err) {
      console.error(err);
      this.showAlert('Hubo un error al procesar la devolución.', 'error');
    }
  },

  mostrarErrorToken(msg) {
    const err = document.getElementById('token-error');
    err.textContent = msg;
    err.style.display = 'block';
  },

  showAlert(msg, type) {
    // Reutilizar el sistema de notificaciones globales si existe, o usar un alert vainilla nativo por ahora.
    if (window.showToast) {
      window.showToast(msg, type === 'error' ? 'red' : (type === 'warning' ? 'orange' : 'green'));
    } else {
      alert((type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : '⚠️ ') + msg);
    }
  }
};
