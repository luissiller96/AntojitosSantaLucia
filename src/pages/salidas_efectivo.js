/**
 * salidas_efectivo.js - Módulo de Salidas de Efectivo
 * Permite registrar gastos operativos con método de pago (efectivo repercute en caja).
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderSalidasEfectivo(container) {
  injectCSS('salidas-css', '/assets/css/salidas_efectivo.css');
  renderLayout(container, 'salidas_efectivo', getSalidasHTML());
  SalidasApp.init();
}

function injectCSS(id, href) {
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

// ─── HTML ────────────────────────────────────────────────────────────────────
function getSalidasHTML() {
  return `
<div class="sal-container">
  <div class="sal-header">
    <div>
      <h1 class="sal-title"><i class="fas fa-hand-holding-usd"></i> Salidas</h1>
      <p class="sal-subtitle">Registro de gastos operativos (efectivo afecta el corte de caja)</p>
    </div>
    <button class="sal-btn-nueva" id="btnNuevaSalida">
      <i class="fa fa-plus"></i> Nueva Salida
    </button>
  </div>

  <!-- Tabla de salidas -->
  <div class="sal-table-card">
    <div id="sal-lista">
      <p class="sal-placeholder">Cargando...</p>
    </div>
  </div>
</div>

<!-- MODAL: Nueva Salida -->
<div class="sal-modal-overlay" id="sal-modal-nueva">
  <div class="sal-modal">
    <div class="sal-modal-header">
      <h5><i class="fa fa-minus-circle" style="color:#e17055;"></i> Registrar Salida</h5>
      <button class="sal-modal-close" id="sal-close-nueva">&times;</button>
    </div>
    <div class="sal-modal-body">
      <div class="sal-form-group">
        <label>Tipo de Pago</label>
        <div class="sal-metodo-btns">
          <button class="sal-metodo-btn active" data-metodo="efectivo">
            <i class="fa fa-wallet"></i> Efectivo
          </button>
          <button class="sal-metodo-btn" data-metodo="tarjeta">
            <i class="fa fa-credit-card"></i> Tarjeta
          </button>
          <button class="sal-metodo-btn" data-metodo="transferencia">
            <i class="fa fa-exchange-alt"></i> Transferencia
          </button>
        </div>
        <p class="sal-metodo-hint" id="salMetodoHint">Afecta el balance de efectivo en caja</p>
      </div>
      <div class="sal-form-group">
        <label>Monto ($)</label>
        <input type="number" id="salMonto" min="0.01" step="0.01" placeholder="0.00" class="sal-input">
      </div>
      <div class="sal-form-group">
        <label>Motivo / Descripción</label>
        <input type="text" id="salMotivo" placeholder="Ej: Compra de insumos, Pago a proveedor..." class="sal-input" maxlength="200">
      </div>
    </div>
    <div class="sal-modal-footer">
      <button class="sal-btn sal-btn-cancel" id="sal-cancelar-nueva">Cancelar</button>
      <button class="sal-btn sal-btn-confirm" id="sal-confirmar-nueva">
        <i class="fa fa-check"></i> Registrar
      </button>
    </div>
  </div>
</div>
`;
}

// ─── App ──────────────────────────────────────────────────────────────────────
const SalidasApp = {
  metodoPago: 'efectivo',

  async init() {
    this.metodoPago = 'efectivo';
    this.bindEvents();
    await this.cargarSalidas();
  },

  bindEvents() {
    document.getElementById('btnNuevaSalida')?.addEventListener('click', () => this.abrirModal());
    document.getElementById('sal-close-nueva')?.addEventListener('click', () => this.cerrarModal());
    document.getElementById('sal-cancelar-nueva')?.addEventListener('click', () => this.cerrarModal());
    document.getElementById('sal-confirmar-nueva')?.addEventListener('click', () => this.registrarSalida());
    document.getElementById('sal-modal-nueva')?.addEventListener('click', (e) => {
      if (e.target.id === 'sal-modal-nueva') this.cerrarModal();
    });

    // Selector de método de pago
    document.querySelectorAll('.sal-metodo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sal-metodo-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.metodoPago = btn.dataset.metodo;
        const hint = document.getElementById('salMetodoHint');
        if (hint) {
          hint.textContent = this.metodoPago === 'efectivo'
            ? 'Afecta el balance de efectivo en caja'
            : 'No afecta el balance de efectivo en caja';
        }
      });
    });
  },

  async cargarSalidas() {
    const lista = document.getElementById('sal-lista');
    if (!lista) return;

    try {
      const rows = await dbSelect(
        `SELECT id, fecha, descripcion, precio_unitario, metodo_pago
         FROM rv_gastos
         WHERE tipo_gasto = 'Salida de Efectivo'
         ORDER BY fecha DESC
         LIMIT 100`
      );

      if (!rows.length) {
        lista.innerHTML = '<p class="sal-placeholder">No hay salidas registradas aún.</p>';
        return;
      }

      const metodoBadge = (m) => {
        if (!m || m === 'efectivo') return '<span class="sal-badge sal-badge-efectivo"><i class="fa fa-wallet"></i> Efectivo</span>';
        if (m === 'tarjeta') return '<span class="sal-badge sal-badge-tarjeta"><i class="fa fa-credit-card"></i> Tarjeta</span>';
        return '<span class="sal-badge sal-badge-transferencia"><i class="fa fa-exchange-alt"></i> Transf.</span>';
      };

      let html = `
      <table class="sal-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Motivo</th>
            <th>Tipo</th>
            <th style="text-align:right;">Monto</th>
          </tr>
        </thead>
        <tbody>
      `;

      for (const r of rows) {
        const fecha = r.fecha
          ? new Date(r.fecha.replace(' ', 'T')).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
          : '—';
        html += `
          <tr>
            <td class="sal-td-fecha">${fecha}</td>
            <td>${r.descripcion || '—'}</td>
            <td>${metodoBadge(r.metodo_pago)}</td>
            <td style="text-align:right; font-weight:700; color:#e17055;">-$${Number(r.precio_unitario).toFixed(2)}</td>
          </tr>`;
      }

      html += '</tbody></table>';
      lista.innerHTML = html;
    } catch (err) {
      lista.innerHTML = `<p class="sal-placeholder" style="color:#dc3545;">Error al cargar: ${err.message}</p>`;
    }
  },

  abrirModal() {
    // Reset método a efectivo
    this.metodoPago = 'efectivo';
    document.querySelectorAll('.sal-metodo-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.sal-metodo-btn[data-metodo="efectivo"]')?.classList.add('active');
    const hint = document.getElementById('salMetodoHint');
    if (hint) hint.textContent = 'Afecta el balance de efectivo en caja';

    document.getElementById('salMonto').value = '';
    document.getElementById('salMotivo').value = '';
    document.getElementById('sal-modal-nueva')?.classList.add('active');
    setTimeout(() => document.getElementById('salMonto')?.focus(), 100);
  },

  cerrarModal() {
    document.getElementById('sal-modal-nueva')?.classList.remove('active');
  },

  async registrarSalida() {
    const monto = parseFloat(document.getElementById('salMonto')?.value) || 0;
    const motivo = document.getElementById('salMotivo')?.value.trim() || '';

    if (monto <= 0) {
      this.showAlert('Ingresa un monto válido mayor a $0.', 'warning');
      return;
    }
    if (!motivo) {
      this.showAlert('Escribe el motivo de la salida.', 'warning');
      return;
    }

    // Verificar caja activa
    try {
      const cajas = await dbSelect(`SELECT id FROM rv_apertura_caja WHERE estatus = 'activa' LIMIT 1`);
      if (!cajas.length) {
        this.showAlert('No hay una caja activa. Abre la caja antes de registrar salidas.', 'warning');
        return;
      }
    } catch (_) {}

    try {
      const usuId = window._session?.usu_id || window._session?.emp_id || 1;
      const offsetMs = new Date().getTimezoneOffset() * 60000;
      const now = new Date(Date.now() - offsetMs).toISOString().replace('T', ' ').substring(0, 19);

      await dbExecute(
        `INSERT INTO rv_gastos (tipo_gasto, descripcion, precio_unitario, fecha, metodo_pago, tipo, usu_id)
         VALUES ('Salida de Efectivo', $1, $2, $3, $4, 'operativo', $5)`,
        [motivo, monto, now, this.metodoPago, usuId]
      );

      this.showAlert(`Salida de $${monto.toFixed(2)} registrada correctamente.`, 'success');
      this.cerrarModal();
      await this.cargarSalidas();
    } catch (err) {
      this.showAlert('Error al registrar: ' + (err.message || err), 'error');
    }
  },

  showAlert(msg, type) {
    if (window.showToast) {
      window.showToast(msg, type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'green');
    } else {
      alert(msg);
    }
  }
};
