/**
 * comanda.js - Módulo de Comanda (Vista de Cocina)
 * Tablero Kanban: Pendiente → En Preparación → Orden Lista
 * Polling automático cada 10s desde SQLite
 * Clona: pages/comanda.php + js/comanda.js
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderLayout } from './layout.js';

const POLL_INTERVAL = 60_000; // 60 segundos

export async function renderComanda(container) {
  injectCSS('comanda-css', '/assets/css/comanda.css');
  renderLayout(container, 'comanda', getComandaHTML());
  ComandaApp.init();
}

function injectCSS(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet'; link.href = href;
  document.head.appendChild(link);
}

// ─── HTML base ────────────────────────────────────────────────────────────────
function getComandaHTML() {
  return `
  <main class="comanda-board">

    <!-- Columna Pendiente -->
    <div class="kanban-column" id="columna-pendiente">
      <h2 class="column-header pendiente">
        📋 Pendiente <span class="col-count" id="count-pendiente">0</span>
      </h2>
      <div class="tasks-container" id="tasks-pendiente">
        <div class="column-empty">Sin órdenes pendientes</div>
      </div>
    </div>

    <!-- Columna En Preparación -->
    <div class="kanban-column" id="columna-preparacion">
      <h2 class="column-header preparacion">
        🍳 En Preparación <span class="col-count" id="count-preparacion">0</span>
      </h2>
      <div class="tasks-container" id="tasks-preparacion">
        <div class="column-empty">Sin órdenes en preparación</div>
      </div>
    </div>

    <!-- Columna Lista -->
    <div class="kanban-column" id="columna-lista">
      <h2 class="column-header lista">
        🔔 Orden Lista <span class="col-count" id="count-lista">0</span>
      </h2>
      <div class="tasks-container" id="tasks-lista">
        <div class="column-empty">Sin órdenes listas</div>
      </div>
      <div class="comanda-status-bar">
        <div class="pulse-dot"></div>
        <span id="cmd-last-update">Actualizando...</span>
      </div>
    </div>

  </main>

  <!-- Modal de Detalle -->
  <div class="cmd-modal-overlay" id="cmd-modal">
    <div class="cmd-modal-content">
      <button class="cmd-modal-close" id="cmd-modal-close">&times;</button>
      <div id="cmd-modal-body"></div>
    </div>
  </div>
  `;
}

// ─── App ─────────────────────────────────────────────────────────────────────
const ComandaApp = {
  _timer: null,
  _data: [],

  init() {
    // Cerrar modal
    document.getElementById('cmd-modal-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cmd-modal')?.addEventListener('click', e => {
      if (e.target.id === 'cmd-modal') this.closeModal();
    });

    this.fetchAndRender();
    this._timer = setInterval(() => this.fetchAndRender(), POLL_INTERVAL);

    // Limpiar timer si el usuario navega a otra pantalla
    window._comandaCleanup = () => {
      clearInterval(this._timer);
      this._timer = null;
    };
  },

  // ── Obtener comandas agrupadas por ticket ──────────────────────────────────
  async fetchAndRender() {
    try {
      // Traer todas las líneas de comanda activas (pendiente + en_preparacion + lista)
      const rows = await dbSelect(
        `SELECT
           c.com_id, c.ticket_id, c.com_cantidad, c.pr_nombre,
           c.com_ingredientes_omitir, c.com_comentarios,
           c.com_estatus, c.com_fecha,
           v.cliente
         FROM rv_comanda c
         LEFT JOIN (
           SELECT ticket, MAX(cliente) AS cliente
           FROM rv_ventas GROUP BY ticket
         ) v ON v.ticket = c.ticket_id
         WHERE c.com_estatus IN ('pendiente','en_preparacion')
            OR (c.com_estatus = 'lista' AND (c.ready_at IS NULL OR c.ready_at >= datetime('now', 'localtime', '-25 minutes')))
         ORDER BY c.ticket_id ASC, c.com_id ASC`,
        []
      );

      // Agrupar filas por ticket_id
      const agrupados = [];
      const mapaTickets = {};

      rows.forEach(row => {
        if (!mapaTickets[row.ticket_id]) {
          mapaTickets[row.ticket_id] = {
            ticket_id: row.ticket_id,
            com_estatus: row.com_estatus,
            com_fecha: row.com_fecha,
            cliente: row.cliente || '',
            items: [],
          };
          agrupados.push(mapaTickets[row.ticket_id]);
        }
        // El estatus del grupo es el MÁS TEMPRANO de sus ítems
        const prioridad = { pendiente: 0, en_preparacion: 1, lista: 2 };
        if (prioridad[row.com_estatus] < prioridad[mapaTickets[row.ticket_id].com_estatus]) {
          mapaTickets[row.ticket_id].com_estatus = row.com_estatus;
        }
        mapaTickets[row.ticket_id].items.push(row);
      });

      this._data = agrupados;
      this.renderBoard(agrupados);
      this.actualizarTimestamp();
    } catch (err) {
      console.error('[Comanda] Error al cargar:', err);
    }
  },

  // ── Render del tablero ─────────────────────────────────────────────────────
  renderBoard(tickets) {
    const columnas = {
      pendiente: document.getElementById('tasks-pendiente'),
      en_preparacion: document.getElementById('tasks-preparacion'),
      lista: document.getElementById('tasks-lista'),
    };

    // Limpiar
    Object.values(columnas).forEach(c => { if (c) c.innerHTML = ''; });

    // Resetear contadores
    ['pendiente', 'preparacion', 'lista'].forEach(k => {
      const el = document.getElementById('count-' + k);
      if (el) el.textContent = '0';
    });

    if (tickets.length === 0) {
      const vacio = '<div class="column-empty">Sin órdenes</div>';
      Object.values(columnas).forEach(c => { if (c) c.innerHTML = vacio; });
      return;
    }

    const contadores = { pendiente: 0, en_preparacion: 0, lista: 0 };

    tickets.forEach(ticket => {
      const html = this.createTicketHTML(ticket);
      const col = columnas[ticket.com_estatus];
      if (col) {
        col.insertAdjacentHTML('beforeend', html);
        contadores[ticket.com_estatus] = (contadores[ticket.com_estatus] || 0) + 1;
      }
    });

    // Actualizar contadores
    const elPend = document.getElementById('count-pendiente');
    const elPrep = document.getElementById('count-preparacion');
    const elList = document.getElementById('count-lista');
    if (elPend) elPend.textContent = contadores.pendiente || 0;
    if (elPrep) elPrep.textContent = contadores.en_preparacion || 0;
    if (elList) elList.textContent = contadores.lista || 0;

    // Añadir columnas vacías
    Object.entries(columnas).forEach(([key, col]) => {
      if (col && col.childElementCount === 0) {
        const labels = { pendiente: 'Sin órdenes pendientes', en_preparacion: 'Sin órdenes en preparación', lista: 'Sin órdenes listas' };
        col.innerHTML = `<div class="column-empty">${labels[key] || 'Sin órdenes'}</div>`;
      }
    });

    // Vincular botones
    this.bindCardButtons();
  },

  // ── HTML de una tarjeta ────────────────────────────────────────────────────
  createTicketHTML(ticket) {
    const itemsHTML = ticket.items.map(item => `
      <div class="ticket-item-detail">
        <span class="item-qty">(${item.com_cantidad})</span>
        <span class="item-name">${item.pr_nombre}</span>
        ${item.com_ingredientes_omitir ? `<small class="item-notes">Sin: ${item.com_ingredientes_omitir}</small>` : ''}
        ${item.com_comentarios ? `<small class="item-notes">📝 ${item.com_comentarios}</small>` : ''}
      </div>
    `).join('');

    const botonHTML = ticket.com_estatus !== 'lista'
      ? `<div class="note-actions"><button class="advance-btn" data-ticket="${ticket.ticket_id}" data-status="${ticket.com_estatus}">Avanzar →</button></div>`
      : '';

    const clienteHTML = ticket.cliente
      ? `<p class="client-name">👤 ${ticket.cliente}</p>`
      : '';

    const tiempoHTML = ticket.com_fecha
      ? `<p class="note-time ${this.esUrgente(ticket.com_fecha) ? 'urgent' : ''}">${this.tiempoTranscurrido(ticket.com_fecha)}</p>`
      : '';

    return `
    <div class="order-note-container" data-id="${ticket.ticket_id}" data-status="${ticket.com_estatus}">
      <div class="status-badge status-${ticket.com_estatus}">
        ${ticket.com_estatus.replace('_', ' ')}
      </div>
      <div class="note-header">
        <button class="info-btn" data-ticket="${ticket.ticket_id}">i</button>
        <h1>Orden #<span>${ticket.ticket_id}</span></h1>
        ${clienteHTML}
        ${tiempoHTML}
      </div>
      <div class="note-body">${itemsHTML}</div>
      ${botonHTML}
    </div>`;
  },

  // ── Listeners botones de tarjeta ───────────────────────────────────────────
  bindCardButtons() {
    document.querySelectorAll('.advance-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleAdvance(btn));
    });
    document.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ticket = this._data.find(t => t.ticket_id == btn.dataset.ticket);
        if (ticket) this.showModal(ticket);
      });
    });
  },

  // ── Avanzar estatus ────────────────────────────────────────────────────────
  async handleAdvance(btn) {
    const ticketId = btn.dataset.ticket;
    const current = btn.dataset.status;
    const next = { pendiente: 'en_preparacion', en_preparacion: 'lista' }[current];
    if (!next) return;

    btn.disabled = true;
    btn.textContent = 'Avanzando...';

    try {
      await dbExecute(
        `UPDATE rv_comanda SET com_estatus = $1 WHERE ticket_id = $2`,
        [next, ticketId]
      );
      // Si pasa a "lista", actualizar el timestamp ready_at
      if (next === 'lista') {
        await dbExecute(
          `UPDATE rv_comanda SET ready_at = datetime('now','localtime') WHERE ticket_id = $1`,
          [ticketId]
        );
      }
      await this.fetchAndRender();
    } catch (err) {
      console.error('[Comanda] Error al avanzar:', err);
      btn.disabled = false;
      btn.textContent = 'Avanzar →';
    }
  },

  // ── Modal de detalle ───────────────────────────────────────────────────────
  showModal(ticket) {
    const clienteHTML = ticket.cliente ? `<h2>👤 ${ticket.cliente}</h2>` : '';

    const itemsHTML = ticket.items.map(item => `
      <div class="modal-item">
        <div class="modal-item-header">
          <span class="qty">(${item.com_cantidad})</span>
          <span class="name">${item.pr_nombre}</span>
        </div>
        ${(item.com_ingredientes_omitir || item.com_comentarios) ? `
        <div class="modal-item-details">
          ${item.com_ingredientes_omitir ? `<p><span class="label">Sin:</span> ${item.com_ingredientes_omitir}</p>` : ''}
          ${item.com_comentarios ? `<p><span class="label">Nota:</span> ${item.com_comentarios}</p>` : ''}
        </div>` : ''}
      </div>
    `).join('');

    document.getElementById('cmd-modal-body').innerHTML = `
      <h1>Orden #${ticket.ticket_id}</h1>
      ${clienteHTML}
      ${itemsHTML}
    `;
    document.getElementById('cmd-modal')?.classList.add('active');
  },

  closeModal() {
    document.getElementById('cmd-modal')?.classList.remove('active');
  },

  // ── Helpers de tiempo ──────────────────────────────────────────────────────
  tiempoTranscurrido(fechaStr) {
    if (!fechaStr) return '';
    const diff = Math.floor((Date.now() - new Date(fechaStr).getTime()) / 1000);
    if (diff < 60) return `Hace ${diff}s`;
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}min`;
    return `Hace ${Math.floor(diff / 3600)}h`;
  },

  esUrgente(fechaStr) {
    if (!fechaStr) return false;
    const diff = (Date.now() - new Date(fechaStr).getTime()) / 1000;
    return diff > 600; // Más de 10 minutos → urgente
  },

  actualizarTimestamp() {
    const el = document.getElementById('cmd-last-update');
    if (el) {
      const ahora = new Date();
      el.textContent = `Actualizado: ${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}:${ahora.getSeconds().toString().padStart(2, '0')}`;
    }
  },
};

// Limpiar el timer si navigateTo recarga otra página
const _origNavigate = window.navigateTo;
if (_origNavigate) {
  window.navigateTo = async (path) => {
    if (typeof window._comandaCleanup === 'function') {
      window._comandaCleanup();
      window._comandaCleanup = null;
    }
    return _origNavigate(path);
  };
}
