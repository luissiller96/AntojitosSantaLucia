/**
 * reportes.js — Módulo de Reportes
 * 6 pestañas: KPIs del día, Gráfica, Más Vendidos, Ventas, Cierre de Caja, Utilidades
 * Fuente: SQLite via dbSelect. Gráfica: Chart.js (CDN). Sin jQuery/GridJS/ApexCharts.
 */

import { dbSelect } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderReportes(container) {
  injectCSS('reportes-css', '/assets/css/reportes.css');
  injectScript('https://cdn.jsdelivr.net/npm/chart.js');
  injectScript('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js'); // SheetJS para Excel
  renderLayout(container, 'reportes', getReportesHTML());
  await ReportesApp.init();
}

function injectCSS(id, href) {
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

function injectScript(src) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.src = src; s.defer = true;
  document.head.appendChild(s);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => `$${parseFloat(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDt = s => { if (!s) return '—'; const d = new Date(s); return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const monthStart = () => today().slice(0, 8) + '01';

// ─── Contador animado ─────────────────────────────────────────────────────────
function animarContador(id, valorFinal, esDinero = true) {
  const el = document.getElementById(id);
  if (!el) return;
  const duracion = 900;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duracion, 1);
    const ease = 1 - Math.pow(1 - t, 4); // easeOutQuart
    const v = parseFloat(valorFinal) * ease;
    el.textContent = esDinero
      ? `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : Math.round(v).toLocaleString('es-MX');
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Tabla con búsqueda + paginación ─────────────────────────────────────────
function renderDataTable(containerId, { cols, rows, perPage = 15 }) {
  const cont = document.getElementById(containerId);
  if (!cont) return;

  let query = '';
  let currentPage = 1;

  function getFiltered() {
    if (!query) return rows;
    return rows.filter(r =>
      cols.some(c => String(c.searchVal ? c.searchVal(r) : (r[c.key] ?? '')).toLowerCase().includes(query))
    );
  }

  function renderBody() {
    const filtered = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const pageRows = filtered.slice(start, start + perPage);

    const countEl  = cont.querySelector('.rdt-count');
    const pageInfo = cont.querySelector('.rdt-page-info');
    const prevBtn  = cont.querySelector('[data-action="prev"]');
    const nextBtn  = cont.querySelector('[data-action="next"]');
    const tbody    = cont.querySelector('tbody');
    const pag      = cont.querySelector('.rdt-pagination');

    if (countEl)  countEl.textContent  = `${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`;
    if (pageInfo) pageInfo.textContent = `Pág ${currentPage} / ${totalPages}`;
    if (prevBtn)  prevBtn.disabled = currentPage === 1;
    if (nextBtn)  nextBtn.disabled = currentPage >= totalPages;
    if (pag)      pag.style.display = totalPages > 1 ? 'flex' : 'none';

    if (tbody) {
      tbody.innerHTML = pageRows.length
        ? pageRows.map(r =>
            `<tr>${cols.map(c => `<td>${c.render ? c.render(r[c.key], r) : (r[c.key] ?? '—')}</td>`).join('')}</tr>`
          ).join('')
        : `<tr><td colspan="${cols.length}" class="rep-empty">Sin resultados</td></tr>`;
    }
  }

  // Skeleton (rendered once)
  cont.innerHTML = `
    <div class="rdt-toolbar">
      <input type="text" class="rdt-search" placeholder="🔍 Buscar...">
      <span class="rdt-count"></span>
    </div>
    <div class="rep-table-wrap">
      <table class="rep-table">
        <thead><tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
        <tbody></tbody>
      </table>
    </div>
    <div class="rdt-pagination">
      <button class="rdt-page-btn" data-action="prev">← Ant</button>
      <span class="rdt-page-info"></span>
      <button class="rdt-page-btn" data-action="next">Sig →</button>
    </div>`;

  cont.querySelector('.rdt-search')?.addEventListener('input', e => {
    query = e.target.value.toLowerCase();
    currentPage = 1;
    renderBody();
  });
  cont.querySelector('[data-action="prev"]')?.addEventListener('click', () => { currentPage--; renderBody(); });
  cont.querySelector('[data-action="next"]')?.addEventListener('click', () => { currentPage++; renderBody(); });

  renderBody();
}

// ─── HTML ─────────────────────────────────────────────────────────────────────
function getReportesHTML() {
  const hoy = today(), inicio = monthStart();
  return `
<div class="rep-container">

  <!-- Header -->
  <div class="rep-header">
    <div>
      <h1 class="rep-title">📊 Reportes</h1>
      <p class="rep-subtitle">Análisis y visualización de datos del negocio</p>
    </div>
  </div>

  <!-- KPIs del día -->
  <div class="rep-kpis" id="kpis-row">
    <div class="stats-card success"><div class="stats-icon"><i class="fas fa-dollar-sign"></i></div><p class="stats-value" id="kpi-ventas">$0.00</p><h6 class="stats-label">VENTAS HOY</h6></div>
    <div class="stats-card info">   <div class="stats-icon"><i class="fas fa-receipt"></i></div>   <p class="stats-value" id="kpi-tickets">0</p>     <h6 class="stats-label">TICKETS HOY</h6></div>
    <div class="stats-card warning"><div class="stats-icon"><i class="fas fa-utensils"></i></div>  <p class="stats-value" id="kpi-productos">0</p>   <h6 class="stats-label">PRODUCTOS VENDIDOS</h6></div>
    <div class="stats-card danger"> <div class="stats-icon"><i class="fas fa-chart-line"></i></div><p class="stats-value" id="kpi-promedio">$0.00</p><h6 class="stats-label">PROMEDIO TICKET</h6></div>
  </div>

  <!-- Tabs -->
  <div class="rep-tabs-wrap">
    <div class="rep-tabs" id="rep-tabs">
      <button class="rep-tab active" data-tab="grafica">📊 Gráfica</button>
      <button class="rep-tab" data-tab="vendidos">🏆 Más Vendidos</button>
      <button class="rep-tab" data-tab="ventas">🛒 Ventas</button>
      <button class="rep-tab" data-tab="cierre">💵 Cierre de Caja</button>
      <button class="rep-tab" data-tab="utilidades">💰 Utilidades</button>
      <button class="rep-tab" data-tab="gastos">💸 Gastos</button>
      <button class="rep-tab" data-tab="devoluciones">↩️ Devoluciones</button>
    </div>
  </div>

  <!-- Tab: Gráfica -->
  <div class="rep-panel active" id="tab-grafica">
    <div class="rep-filtros">
      <div class="rep-filtro-group">
        <label>Fecha inicio</label>
        <input type="date" id="g-fecha-inicio" class="rep-input" value="${inicio}">
      </div>
      <div class="rep-filtro-group">
        <label>Fecha fin</label>
        <input type="date" id="g-fecha-fin" class="rep-input" value="${hoy}">
      </div>
      <button class="rep-btn rep-btn-primary" id="btn-generar-grafica">
        <i class="fas fa-chart-line"></i> Generar
      </button>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">
        <span>Ventas por Fecha</span>
        <strong id="g-total-texto" style="color:#28a745;"></strong>
      </div>
      <div style="position:relative; height:320px;">
        <canvas id="ventasChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Tab: Más Vendidos -->
  <div class="rep-panel" id="tab-vendidos">
    <div class="rep-card">
      <div class="rep-card-header">Ranking de Productos Más Vendidos</div>
      <div class="rep-table-wrap" id="tabla-vendidos">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- Tab: Ventas -->
  <div class="rep-panel" id="tab-ventas">
    <div class="rep-filtros" style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; justify-content: space-between;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="v-fecha-inicio" class="rep-input" value="${inicio}"></div>
          <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="v-fecha-fin"    class="rep-input" value="${hoy}"></div>
          <div class="rep-filtro-pagos">
            <button class="rep-btn-pago active" data-pago="todas">Todas</button>
            <button class="rep-btn-pago" data-pago="efectivo">Efectivo</button>
            <button class="rep-btn-pago" data-pago="tarjeta">Tarjeta</button>
            <button class="rep-btn-pago" data-pago="transferencia">Transf.</button>
          </div>
      </div>
      <button class="rep-btn" id="btn-exportar-excel" style="background: #107c41; color: white; margin-bottom: 4px;">
        <i class="fas fa-file-excel"></i> Exportar Excel
      </button>
    </div>
    <!-- Mini KPIs Ventas -->
  <div class="rep-mini-kpis" id="ventas-mini-kpis">
    <div class="mini-kpi-card info">
      <div class="mini-kpi-icon"><i class="fas fa-calculator"></i></div>
      <div class="mini-kpi-body">
        <p class="mini-kpi-value" id="mv-total">$0.00</p>
        <span class="mini-kpi-label">Total Filtrado</span>
      </div>
    </div>
    <div class="mini-kpi-card success">
      <div class="mini-kpi-icon"><i class="fas fa-receipt"></i></div>
      <div class="mini-kpi-body">
        <p class="mini-kpi-value" id="mv-tickets">0</p>
        <span class="mini-kpi-label">Tickets</span>
      </div>
    </div>
    <div class="mini-kpi-card warning">
      <div class="mini-kpi-icon"><i class="fas fa-chart-bar"></i></div>
      <div class="mini-kpi-body">
        <p class="mini-kpi-value" id="mv-promedio">$0.00</p>
        <span class="mini-kpi-label">Ticket Promedio</span>
      </div>
    </div>
  </div>
  <div class="rep-card">
      <div class="rep-card-header">
        <span>Detalle de Ventas</span>
      </div>
      <div id="tabla-ventas">
        <p class="rep-loading">Selecciona fechas y genera el reporte.</p>
      </div>
    </div>
  </div>

  <!-- Tab: Cierre de Caja -->
  <div class="rep-panel" id="tab-cierre">
    <div class="rep-filtros">
      <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="c-fecha-inicio" class="rep-input" value="${inicio}"></div>
      <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="c-fecha-fin"    class="rep-input" value="${hoy}"></div>
      <button class="rep-btn rep-btn-primary" id="btn-filtrar-cierre">
        <i class="fas fa-filter"></i> Filtrar
      </button>
    </div>
    <!-- Mini KPIs cierre -->
    <div class="rep-kpis" style="margin-bottom:16px;">
      <div class="stats-card success"><div class="stats-icon"><i class="fas fa-money-bill-wave"></i></div><p class="stats-value" id="c-efectivo">$0.00</p><h6 class="stats-label">EFECTIVO</h6></div>
      <div class="stats-card info">   <div class="stats-icon"><i class="fas fa-credit-card"></i></div>  <p class="stats-value" id="c-tarjeta">$0.00</p><h6 class="stats-label">TARJETA</h6></div>
      <div class="stats-card warning"><div class="stats-icon"><i class="fas fa-mobile-alt"></i></div>   <p class="stats-value" id="c-transf">$0.00</p> <h6 class="stats-label">TRANSFERENCIA</h6></div>
      <div class="stats-card danger"> <div class="stats-icon"><i class="fas fa-coins"></i></div>       <p class="stats-value" id="c-total">$0.00</p>  <h6 class="stats-label">TOTAL CAJA</h6></div>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">Detalle de Cierres de Caja</div>
      <div class="rep-table-wrap" id="tabla-cierre">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- Tab: Utilidades -->
  <div class="rep-panel" id="tab-utilidades">
    <div class="rep-filtros">
      <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="u-fecha-inicio" class="rep-input" value="${inicio}"></div>
      <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="u-fecha-fin"    class="rep-input" value="${hoy}"></div>
      <button class="rep-btn rep-btn-primary" id="btn-filtrar-utilidades">
        <i class="fas fa-filter"></i> Filtrar
      </button>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">
        <span>Utilidad por Producto</span>
        <span>Total: <strong id="u-total" style="color:#28a745;">$0.00</strong></span>
      </div>
      <div class="rep-table-wrap" id="tabla-utilidades">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- Tab: Gastos -->
  <div class="rep-panel" id="tab-gastos">
    <div class="rep-filtros">
      <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="ga-fecha-inicio" class="rep-input" value="${inicio}"></div>
      <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="ga-fecha-fin"    class="rep-input" value="${hoy}"></div>
      <div class="rep-filtro-group">
        <label>Tipo</label>
        <select id="ga-tipo" class="rep-input" style="min-width:120px;">
          <option value="todos">Todos</option>
          <option value="operativo">Operativo</option>
          <option value="insumo">Insumo</option>
        </select>
      </div>
      <button class="rep-btn rep-btn-primary" id="btn-filtrar-gastos">
        <i class="fas fa-filter"></i> Filtrar
      </button>
      <button class="rep-btn" id="btn-exportar-excel-gastos" style="background:#107c41;color:white;">
        <i class="fas fa-file-excel"></i> Exportar Excel
      </button>
    </div>
    <!-- Mini KPIs gastos -->
    <div class="rep-kpis" style="margin-bottom:16px;">
      <div class="stats-card success"><div class="stats-icon"><i class="fas fa-money-bill-wave"></i></div><p class="stats-value" id="ga-efectivo">$0.00</p><h6 class="stats-label">EFECTIVO</h6></div>
      <div class="stats-card info">   <div class="stats-icon"><i class="fas fa-credit-card"></i></div>  <p class="stats-value" id="ga-tarjeta">$0.00</p> <h6 class="stats-label">TARJETA</h6></div>
      <div class="stats-card warning"><div class="stats-icon"><i class="fas fa-mobile-alt"></i></div>   <p class="stats-value" id="ga-transf">$0.00</p>  <h6 class="stats-label">TRANSFERENCIA</h6></div>
      <div class="stats-card danger"> <div class="stats-icon"><i class="fas fa-coins"></i></div>       <p class="stats-value" id="ga-total">$0.00</p>  <h6 class="stats-label">TOTAL GASTOS</h6></div>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">
        <span>Detalle de Gastos</span>
        <span id="ga-count" style="color:#6c757d;font-size:.85rem;"></span>
      </div>
      <div class="rep-table-wrap" id="tabla-gastos">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- Tab: Devoluciones -->
  <div class="rep-panel" id="tab-devoluciones">
    <div class="rep-filtros">
      <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="d-fecha-inicio" class="rep-input" value="${inicio}"></div>
      <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="d-fecha-fin"    class="rep-input" value="${hoy}"></div>
      <button class="rep-btn rep-btn-primary" id="btn-filtrar-devoluciones">
        <i class="fas fa-filter"></i> Filtrar
      </button>
      <button class="rep-btn" id="btn-exportar-excel-devoluciones" style="background:#107c41;color:white;">
        <i class="fas fa-file-excel"></i> Exportar Excel
      </button>
    </div>
    <!-- Mini KPI devoluciones -->
    <div class="rep-kpis" style="margin-bottom:16px;">
      <div class="stats-card danger"><div class="stats-icon"><i class="fas fa-undo-alt"></i></div><p class="stats-value" id="d-count">0</p><h6 class="stats-label">DEVOLUCIONES</h6></div>
      <div class="stats-card warning"><div class="stats-icon"><i class="fas fa-dollar-sign"></i></div><p class="stats-value" id="d-monto">$0.00</p><h6 class="stats-label">MONTO DEVUELTO</h6></div>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">Detalle de Devoluciones</div>
      <div class="rep-table-wrap" id="tabla-devoluciones">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

</div>`;
}

// ─── App ──────────────────────────────────────────────────────────────────────
const ReportesApp = {
  _chart: null,

  async init() {
    this.bindTabs();
    this.bindEvents();
    await this.cargarKPIs();
    await this.cargarGrafica();
  },

  // ── Tabs ────────────────────────────────────────────────────────────────────
  bindTabs() {
    document.querySelectorAll('.rep-tab').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('.rep-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.rep-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById('tab-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');

        // Carga lazy según pestaña
        switch (btn.dataset.tab) {
          case 'grafica': await this.cargarGrafica(); break;
          case 'vendidos': await this.cargarMasVendidos(); break;
          case 'ventas': await this.cargarVentas(); break;
          case 'cierre': await this.cargarCierre(); break;
          case 'utilidades': await this.cargarUtilidades(); break;
          case 'gastos': await this.cargarGastos(); break;
          case 'devoluciones': await this.cargarDevoluciones(); break;
        }
      });
    });
  },

  // ── Eventos ─────────────────────────────────────────────────────────────────
  bindEvents() {
    document.getElementById('btn-generar-grafica')?.addEventListener('click', () => this.cargarGrafica());
    document.getElementById('btn-filtrar-cierre')?.addEventListener('click', () => this.cargarCierre());
    document.getElementById('btn-filtrar-utilidades')?.addEventListener('click', () => this.cargarUtilidades());
    document.getElementById('btn-filtrar-gastos')?.addEventListener('click', () => this.cargarGastos());
    document.getElementById('btn-filtrar-devoluciones')?.addEventListener('click', () => this.cargarDevoluciones());

    // Filtros de ventas → recarga automática
    document.getElementById('v-fecha-inicio')?.addEventListener('change', () => this.cargarVentas());
    document.getElementById('v-fecha-fin')?.addEventListener('change', () => this.cargarVentas());

    // Filtros de pago
    document.querySelectorAll('.rep-btn-pago').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rep-btn-pago').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.cargarVentas();
      });
    });
    // Botones Exportar Excel
    document.getElementById('btn-exportar-excel')?.addEventListener('click', () => this.exportarExcelVentas());
    document.getElementById('btn-exportar-excel-gastos')?.addEventListener('click', () => this.exportarExcelGastos());
    document.getElementById('btn-exportar-excel-devoluciones')?.addEventListener('click', () => this.exportarExcelDevoluciones());
  },

  // ── KPIs del día ────────────────────────────────────────────────────────────
  async cargarKPIs() {
    const hoy = today();
    const rows = await dbSelect(
      `SELECT
         IFNULL(SUM(total_ticket),0) AS ventas,
         COUNT(DISTINCT ticket)      AS tickets,
         SUM(cantidad)               AS productos
       FROM rv_ventas
       WHERE DATE(fecha)=$1 AND estatus='completado'`,
      [hoy]
    );
    const r = rows[0] || {};
    const prom = r.tickets > 0 ? (parseFloat(r.ventas) / r.tickets) : 0;
    animarContador('kpi-ventas',    parseFloat(r.ventas   || 0), true);
    animarContador('kpi-tickets',   parseInt(r.tickets    || 0), false);
    animarContador('kpi-productos', parseInt(r.productos  || 0), false);
    animarContador('kpi-promedio',  prom,                        true);
  },

  // ── Gráfica de ventas ────────────────────────────────────────────────────────
  async cargarGrafica() {
    const fi = val('g-fecha-inicio');
    const ff = val('g-fecha-fin');
    if (!fi || !ff) return;

    const rows = await dbSelect(
      `SELECT DATE(fecha) AS dia, SUM(total_ticket) AS total
       FROM rv_ventas
       WHERE DATE(fecha) BETWEEN $1 AND $2
         AND estatus='completado'
       GROUP BY DATE(fecha)
       ORDER BY DATE(fecha)`,
      [fi, ff]
    );

    const labels = rows.map(r => r.dia);
    const data = rows.map(r => parseFloat(r.total || 0));
    const total = data.reduce((a, b) => a + b, 0);
    setText('g-total-texto', `Total: ${fmt(total)}`);

    // Esperar Chart.js si no está listo aún
    await waitForChartJs();

    const ctx = document.getElementById('ventasChart');
    if (!ctx) return;

    if (this._chart) { this._chart.destroy(); this._chart = null; }

    this._chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Ventas ($)',
          data,
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74,144,226,.15)',
          borderWidth: 2,
          pointBackgroundColor: '#4a90e2',
          tension: 0.35,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => fmt(ctx.raw) } }
        },
        scales: {
          y: { ticks: { callback: v => fmt(v) }, beginAtZero: true },
          x: { ticks: { maxRotation: 45 } }
        }
      }
    });
  },

  // ── Más Vendidos ──────────────────────────────────────────────────────────
  async cargarMasVendidos() {
    const cont = document.getElementById('tabla-vendidos');
    if (!cont) return;
    cont.innerHTML = '<p class="rep-loading">Cargando...</p>';

    const rows = await dbSelect(
      `SELECT
         v.producto,
         c.nombre AS categoria,
         SUM(v.cantidad)      AS unidades,
         SUM(v.total)         AS total
       FROM rv_ventas v
       LEFT JOIN rv_productos p ON p.ID = v.id_producto
       LEFT JOIN rv_categorias c ON c.id = p.categoria_id
       WHERE v.estatus='completado'
       GROUP BY v.producto
       ORDER BY unidades DESC
       LIMIT 20`,
      []
    );

    if (!rows.length) { cont.innerHTML = '<p class="rep-empty">Sin datos de ventas.</p>'; return; }

    // Agregar índice de ranking
    const rowsConRanking = rows.map((r, i) => ({ ...r, _rank: i + 1 }));

    renderDataTable('tabla-vendidos', {
      cols: [
        { label: '#',            key: '_rank',    render: v => `<span class="rep-rank">${v}</span>` },
        { label: 'Producto',     key: 'producto', render: v => `<strong>${v}</strong>` },
        { label: 'Categoría',    key: 'categoria', render: v => `<span class="rep-badge-cat">${v || '—'}</span>` },
        { label: 'Unidades',     key: 'unidades', render: v => `<span style="text-align:center;font-weight:700;display:block;">${v}</span>` },
        { label: 'Total Vendido',key: 'total',    render: v => `<strong style="color:#28a745;">${fmt(v)}</strong>` },
      ],
      rows: rowsConRanking,
      perPage: 20,
    });
  },

  // ── Ventas ────────────────────────────────────────────────────────────────
  async cargarVentas() {
    const fi = val('v-fecha-inicio');
    const ff = val('v-fecha-fin');
    const pago = document.querySelector('.rep-btn-pago.active')?.dataset.pago || 'todas';
    if (!fi || !ff) return;

    const cont = document.getElementById('tabla-ventas');
    if (cont) cont.innerHTML = '<p class="rep-loading">Cargando...</p>';

    let query = `
      SELECT ticket, fecha, vendedor, metodo_pago,
             GROUP_CONCAT(cantidad||'x '||producto, ' | ') AS articulos,
             SUM(cantidad) AS total_prod,
             MAX(total_ticket) AS total_ticket,
             MAX(tipo_orden) AS tipo_orden
      FROM rv_ventas
      WHERE DATE(fecha) BETWEEN $1 AND $2
        AND estatus='completado'`;
    const params = [fi, ff];
    if (pago !== 'todas') { query += ` AND metodo_pago=$3`; params.push(pago); }
    query += ` GROUP BY ticket ORDER BY fecha DESC`;

    const rows = await dbSelect(query, params);
    const totalFiltrado = rows.reduce((s, r) => s + parseFloat(r.total_ticket || 0), 0);
    const promedio = rows.length > 0 ? totalFiltrado / rows.length : 0;

    // Mini-KPIs animados
    animarContador('mv-total',   totalFiltrado, true);
    animarContador('mv-tickets', rows.length,   false);
    animarContador('mv-promedio', promedio,     true);

    if (!rows.length) {
      if (cont) cont.innerHTML = '<p class="rep-empty">Sin ventas en el período.</p>';
      return;
    }

    const pagoBadge = p => {
      const map = {
        efectivo:      ['badge-ef',  '<i class="fas fa-money-bill-wave"></i> Efectivo'],
        tarjeta:       ['badge-tj',  '<i class="fas fa-credit-card"></i> Tarjeta'],
        transferencia: ['badge-tr',  '<i class="fas fa-mobile-alt"></i> Transf.'],
        mixto:         ['badge-mix', '<i class="fas fa-layer-group"></i> Mixto'],
      };
      const [cls, label] = map[p] || ['', p || '—'];
      return `<span class="rep-badge-pago ${cls}">${label}</span>`;
    };
    const tipoBadge = t => {
      const map = { llevar: ['badge-llevar', 'Llevar'], comer_aqui: ['badge-aqui', 'Aquí'], domicilio: ['badge-domicilio', 'Domicilio'] };
      const [cls, label] = map[t] || ['', t || '—'];
      return `<span class="rep-badge-tipo ${cls}">${label}</span>`;
    };

    renderDataTable('tabla-ventas', {
      cols: [
        { label: 'Ticket',    key: 'ticket',      render: v => `<span style="color:#6c757d;">#${v}</span>` },
        { label: 'Fecha',     key: 'fecha',        render: v => `<span style="white-space:nowrap;">${fmtDt(v)}</span>` },
        { label: 'Artículos', key: 'articulos',    render: v => `<span style="font-size:.82rem;color:#555;">${(v||'').replace(/\|/g,'<br>')}</span>`,
          searchVal: r => r.articulos || '' },
        { label: 'Tipo',      key: 'tipo_orden',   render: v => tipoBadge(v) },
        { label: 'Pago',      key: 'metodo_pago',  render: v => pagoBadge(v) },
        { label: 'Total',     key: 'total_ticket', render: v => `<strong style="color:#28a745;">${fmt(v)}</strong>` },
        { label: '',          key: 'ticket',       render: v => `<button class="rep-btn-reimprimir" data-ticket="${v}" title="Reimprimir"><i class="fas fa-print"></i></button>` },
      ],
      rows,
      perPage: 15,
    });

    // Delegación reimprimir (sobre el contenedor estable)
    const tablaEl = document.getElementById('tabla-ventas');
    tablaEl?.addEventListener('click', async e => {
      const btn = e.target.closest('.rep-btn-reimprimir');
      if (btn) await reimprimirTicket(btn.dataset.ticket);
    });
  },

  // ── Exportación a Excel ───────────────────────────────────────────────────
  async exportarExcelVentas() {
    if (!window.XLSX) {
      alert("La librería de Excel aún se está cargando, inténtalo de nuevo en unos segundos.");
      return;
    }

    const fi = val('v-fecha-inicio');
    const ff = val('v-fecha-fin');
    const pago = document.querySelector('.rep-btn-pago.active')?.dataset.pago || 'todas';

    // Obtener datos crudos
    let query = `
          SELECT ticket, fecha, metodo_pago,
                 GROUP_CONCAT(cantidad||'x '||producto, ' | ') AS articulos,
                 MAX(total_ticket) AS total_ticket
          FROM rv_ventas
          WHERE DATE(fecha) BETWEEN $1 AND $2
            AND estatus='completado'`;
    const params = [fi, ff];
    if (pago !== 'todas') { query += ` AND metodo_pago=$3`; params.push(pago); }
    query += ` GROUP BY ticket ORDER BY fecha DESC`;

    const rows = await dbSelect(query, params);
    if (!rows.length) {
      alert("No hay ventas en este rango de fechas para exportar.");
      return;
    }

    // Formatear para Excel
    const excelData = rows.map(r => ({
      "Ticket #": r.ticket,
      "Fecha": r.fecha,
      "Forma de Pago": r.metodo_pago ? r.metodo_pago.toUpperCase() : "ND",
      "Artículos Vendidos": r.articulos,
      "Total Venta ($)": parseFloat(r.total_ticket || 0)
    }));

    try {
      // Módulos Tauri API Core
      const { save } = window.__TAURI__?.dialog || await import('@tauri-apps/plugin-dialog');
      const { writeFile } = window.__TAURI__?.fs || await import('@tauri-apps/plugin-fs');

      // Preparar el libro de excel y la hoja
      const worksheet = window.XLSX.utils.json_to_sheet(excelData);
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

      // Generar buffer Uint8Array
      const excelBuffer = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Pedir ruta al usuario usando Tauri Dialog
      let filename = `Ventas.xlsx`;
      if (fi && ff && fi === ff) {
        filename = `Reporte_Ventas_${fi}.xlsx`;
      } else if (fi && ff) {
        filename = `Reporte_Ventas_${fi}_al_${ff}.xlsx`;
      }

      const selectedPath = await save({
        defaultPath: filename,
        filters: [{
          name: "Excel Workbook",
          extensions: ["xlsx"]
        }]
      });

      if (selectedPath) {
        // Escribir el archivo
        await writeFile(selectedPath, new Uint8Array(excelBuffer));
        if (window.CajaApp && window.CajaApp.showAlert) {
          window.CajaApp.showAlert("Excel Exportado", "El archivo se ha guardado correctamente.", "success");
        } else {
          alert("Excel exportado correctamente a:\n" + selectedPath);
        }
      }
    } catch (e) {
      console.error("Error guardando Excel:", e);
      const errStr = typeof e === 'object' ? (e.message || JSON.stringify(e)) : String(e);
      alert("Error al intentar exportar el Excel:\n" + errStr);
    }
  },

  // ── Exportar Excel Gastos ─────────────────────────────────────────────────
  async exportarExcelGastos() {
    if (!window.XLSX) { alert("La librería de Excel aún se está cargando, inténtalo de nuevo."); return; }
    const fi = val('ga-fecha-inicio');
    const ff = val('ga-fecha-fin');
    const tipo = val('ga-tipo');

    let query = `
      SELECT g.id, g.fecha, g.tipo_gasto, g.descripcion, g.comentario,
             g.precio_unitario, g.metodo_pago, g.tipo, u.usu_nom AS usuario
      FROM rv_gastos g
      LEFT JOIN tm_usuario u ON u.usu_id = g.usu_id
      WHERE DATE(g.fecha) BETWEEN $1 AND $2`;
    const params = [fi, ff];
    if (tipo && tipo !== 'todos') { query += ` AND g.tipo=$3`; params.push(tipo); }
    query += ` ORDER BY g.fecha DESC`;

    const rows = await dbSelect(query, params);
    if (!rows.length) { alert("No hay gastos en este rango de fechas para exportar."); return; }

    const excelData = rows.map(r => ({
      "ID":            r.id,
      "Fecha":         r.fecha,
      "Tipo Gasto":    r.tipo_gasto || '—',
      "Descripción":   r.descripcion || '—',
      "Comentario":    r.comentario || '—',
      "Monto ($)":     parseFloat(r.precio_unitario || 0),
      "Tipo":          r.tipo || '—',
      "Método Pago":   r.metodo_pago ? r.metodo_pago.toUpperCase() : '—',
      "Usuario":       r.usuario || '—',
    }));

    try {
      const { save } = window.__TAURI__?.dialog || await import('@tauri-apps/plugin-dialog');
      const { writeFile } = window.__TAURI__?.fs || await import('@tauri-apps/plugin-fs');
      const worksheet = window.XLSX.utils.json_to_sheet(excelData);
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");
      const buf = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const filename = fi && ff && fi !== ff ? `Reporte_Gastos_${fi}_al_${ff}.xlsx` : `Reporte_Gastos_${fi || 'todos'}.xlsx`;
      const path = await save({ defaultPath: filename, filters: [{ name: "Excel Workbook", extensions: ["xlsx"] }] });
      if (path) {
        await writeFile(path, new Uint8Array(buf));
        window.CajaApp?.showAlert?.("Excel Exportado", "Gastos guardados correctamente.", "success") || alert("Excel exportado:\n" + path);
      }
    } catch (e) {
      alert("Error al exportar:\n" + (e.message || e));
    }
  },

  // ── Exportar Excel Devoluciones ───────────────────────────────────────────
  async exportarExcelDevoluciones() {
    if (!window.XLSX) { alert("La librería de Excel aún se está cargando, inténtalo de nuevo."); return; }
    const fi = val('d-fecha-inicio');
    const ff = val('d-fecha-fin');

    const rows = await dbSelect(
      `SELECT d.dev_id, d.ticket_id, d.motivo, d.fecha_devolucion,
              u.usu_nom AS usuario,
              MAX(v.total_ticket) AS total_ticket,
              GROUP_CONCAT(v.cantidad||'x '||v.producto, ' | ') AS articulos
       FROM rv_devoluciones d
       LEFT JOIN tm_usuario u ON u.usu_id = d.usu_id
       LEFT JOIN rv_ventas v ON v.ticket = d.ticket_id
       WHERE DATE(d.fecha_devolucion) BETWEEN $1 AND $2
       GROUP BY d.dev_id
       ORDER BY d.fecha_devolucion DESC`,
      [fi, ff]
    );
    if (!rows.length) { alert("No hay devoluciones en este rango de fechas para exportar."); return; }

    const excelData = rows.map(r => ({
      "# Devolución":   r.dev_id,
      "# Ticket":       r.ticket_id,
      "Fecha":          r.fecha_devolucion,
      "Artículos":      (r.articulos || '—').replace(/\|/g, ' / '),
      "Motivo":         r.motivo || '—',
      "Usuario":        r.usuario || '—',
      "Monto Ticket ($)": parseFloat(r.total_ticket || 0),
    }));

    try {
      const { save } = window.__TAURI__?.dialog || await import('@tauri-apps/plugin-dialog');
      const { writeFile } = window.__TAURI__?.fs || await import('@tauri-apps/plugin-fs');
      const worksheet = window.XLSX.utils.json_to_sheet(excelData);
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, "Devoluciones");
      const buf = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const filename = fi && ff && fi !== ff ? `Reporte_Devoluciones_${fi}_al_${ff}.xlsx` : `Reporte_Devoluciones_${fi || 'todos'}.xlsx`;
      const path = await save({ defaultPath: filename, filters: [{ name: "Excel Workbook", extensions: ["xlsx"] }] });
      if (path) {
        await writeFile(path, new Uint8Array(buf));
        window.CajaApp?.showAlert?.("Excel Exportado", "Devoluciones guardadas correctamente.", "success") || alert("Excel exportado:\n" + path);
      }
    } catch (e) {
      alert("Error al exportar:\n" + (e.message || e));
    }
  },

  // ── Cierre de Caja ────────────────────────────────────────────────────────
  async cargarCierre() {
    const fi = val('c-fecha-inicio');
    const ff = val('c-fecha-fin');
    const cont = document.getElementById('tabla-cierre');
    if (!cont) return;
    cont.innerHTML = '<p class="rep-loading">Cargando...</p>';

    const cierres = await dbSelect(
      `SELECT a.id, a.fecha_apertura, a.monto_apertura, a.estatus,
              cc.fecha_cierre, cc.monto_cierre,
              IFNULL((SELECT SUM(total) FROM rv_ventas WHERE metodo_pago='efectivo'
                        AND DATE(fecha) BETWEEN DATE(a.fecha_apertura) AND IFNULL(DATE(cc.fecha_cierre), DATE('now'))),0) AS ef,
              IFNULL((SELECT SUM(total) FROM rv_ventas WHERE metodo_pago='tarjeta'
                        AND DATE(fecha) BETWEEN DATE(a.fecha_apertura) AND IFNULL(DATE(cc.fecha_cierre), DATE('now'))),0) AS tj,
              IFNULL((SELECT SUM(total) FROM rv_ventas WHERE metodo_pago='transferencia'
                        AND DATE(fecha) BETWEEN DATE(a.fecha_apertura) AND IFNULL(DATE(cc.fecha_cierre), DATE('now'))),0) AS tr
       FROM rv_apertura_caja a
       LEFT JOIN rv_cierre_caja cc ON cc.apertura_id = a.id
       WHERE DATE(a.fecha_apertura) BETWEEN $1 AND $2
       ORDER BY a.id DESC`,
      [fi, ff]
    );

    // Totales acumulados animados
    const totEf = cierres.reduce((s, r) => s + parseFloat(r.ef || 0), 0);
    const totTj = cierres.reduce((s, r) => s + parseFloat(r.tj || 0), 0);
    const totTr = cierres.reduce((s, r) => s + parseFloat(r.tr || 0), 0);
    animarContador('c-efectivo', totEf, true);
    animarContador('c-tarjeta',  totTj, true);
    animarContador('c-transf',   totTr, true);
    animarContador('c-total',    totEf + totTj + totTr, true);
    setText('totalCierresEncontrados', cierres.length);

    if (!cierres.length) { cont.innerHTML = '<p class="rep-empty">Sin cierres en el período.</p>'; return; }

    const rowsConTot = cierres.map(r => ({
      ...r,
      _tot: parseFloat(r.ef || 0) + parseFloat(r.tj || 0) + parseFloat(r.tr || 0),
    }));

    renderDataTable('tabla-cierre', {
      cols: [
        { label: '#',        key: 'id',            render: v => `#${v}` },
        { label: 'Apertura', key: 'fecha_apertura', render: v => `<span style="white-space:nowrap;">${fmtDt(v)}</span>` },
        { label: 'Cierre',   key: 'fecha_cierre',   render: v => v ? `<span style="white-space:nowrap;">${fmtDt(v)}</span>` : '—' },
        { label: 'Efectivo', key: 'ef',             render: v => `<span style="color:#28a745;font-weight:600;">${fmt(v)}</span>` },
        { label: 'Tarjeta',  key: 'tj',             render: v => `<span style="color:#007aff;font-weight:600;">${fmt(v)}</span>` },
        { label: 'Transf.',  key: 'tr',             render: v => `<span style="color:#ff9800;font-weight:600;">${fmt(v)}</span>` },
        { label: 'Total',    key: '_tot',           render: v => `<strong>${fmt(v)}</strong>` },
        { label: 'Estatus',  key: 'estatus',        render: v => v === 'activa'
            ? '<span class="rep-badge-activa">🟢 Activa</span>'
            : '<span class="rep-badge-cerrada">✓ Cerrada</span>' },
      ],
      rows: rowsConTot,
      perPage: 15,
    });
  },

  // ── Gastos ────────────────────────────────────────────────────────────────
  async cargarGastos() {
    const fi = val('ga-fecha-inicio');
    const ff = val('ga-fecha-fin');
    const tipo = val('ga-tipo') || 'todos';
    const cont = document.getElementById('tabla-gastos');
    if (!cont || !fi || !ff) return;
    cont.innerHTML = '<p class="rep-loading">Cargando...</p>';

    let query = `
      SELECT g.id, g.fecha, g.tipo_gasto, g.descripcion, g.comentario,
             g.precio_unitario, g.tipo, g.metodo_pago,
             u.usu_nom AS usuario
      FROM rv_gastos g
      LEFT JOIN tm_usuario u ON u.usu_id = g.usu_id
      WHERE DATE(g.fecha) BETWEEN $1 AND $2`;
    const params = [fi, ff];
    if (tipo !== 'todos') { query += ` AND g.tipo = $3`; params.push(tipo); }
    query += ` ORDER BY g.fecha DESC`;

    const rows = await dbSelect(query, params);

    // Mini KPIs por método de pago
    const ef  = rows.filter(r => r.metodo_pago === 'efectivo').reduce((s, r) => s + parseFloat(r.precio_unitario || 0), 0);
    const tj  = rows.filter(r => r.metodo_pago === 'tarjeta').reduce((s, r) => s + parseFloat(r.precio_unitario || 0), 0);
    const tr  = rows.filter(r => r.metodo_pago === 'transferencia').reduce((s, r) => s + parseFloat(r.precio_unitario || 0), 0);
    const tot = rows.reduce((s, r) => s + parseFloat(r.precio_unitario || 0), 0);
    animarContador('ga-efectivo', ef,  true);
    animarContador('ga-tarjeta',  tj,  true);
    animarContador('ga-transf',   tr,  true);
    animarContador('ga-total',    tot, true);
    setText('ga-count', `${rows.length} registro${rows.length !== 1 ? 's' : ''}`);

    if (!rows.length) { cont.innerHTML = '<p class="rep-empty">Sin gastos en el período.</p>'; return; }

    const tipoBadgeG = t => {
      const cls = t === 'operativo' ? 'badge-llevar' : 'badge-aqui';
      return `<span class="rep-badge-tipo ${cls}">${t || '—'}</span>`;
    };
    const pagoBadgeG = p => {
      const map = {
        efectivo:      ['badge-ef',  '<i class="fas fa-money-bill-wave"></i> Efectivo'],
        tarjeta:       ['badge-tj',  '<i class="fas fa-credit-card"></i> Tarjeta'],
        transferencia: ['badge-tr',  '<i class="fas fa-mobile-alt"></i> Transf.'],
      };
      const [cls, label] = map[p] || ['', p || '—'];
      return `<span class="rep-badge-pago ${cls}">${label}</span>`;
    };

    renderDataTable('tabla-gastos', {
      cols: [
        { label: '#',          key: 'id',            render: v => `<span style="color:#6c757d;">#${v}</span>` },
        { label: 'Fecha',      key: 'fecha',          render: v => `<span style="white-space:nowrap;">${fmtDt(v)}</span>` },
        { label: 'Tipo Gasto', key: 'tipo_gasto',     render: v => `<strong>${v || '—'}</strong>` },
        { label: 'Descripción',key: 'descripcion',    render: v => `<span style="font-size:.84rem;">${v || '—'}</span>` },
        { label: 'Comentario', key: 'comentario',     render: v => `<span style="font-size:.84rem;color:#6c757d;">${v || '—'}</span>` },
        { label: 'Tipo',       key: 'tipo',           render: v => tipoBadgeG(v) },
        { label: 'Pago',       key: 'metodo_pago',    render: v => pagoBadgeG(v) },
        { label: 'Monto',      key: 'precio_unitario',render: v => `<strong style="color:#dc3545;">${fmt(v)}</strong>` },
        { label: 'Usuario',    key: 'usuario',        render: v => `<span style="font-size:.84rem;">${v || '—'}</span>` },
      ],
      rows,
      perPage: 15,
    });
  },

  // ── Devoluciones ──────────────────────────────────────────────────────────
  async cargarDevoluciones() {
    const fi = val('d-fecha-inicio');
    const ff = val('d-fecha-fin');
    const cont = document.getElementById('tabla-devoluciones');
    if (!cont || !fi || !ff) return;
    cont.innerHTML = '<p class="rep-loading">Cargando...</p>';

    const rows = await dbSelect(
      `SELECT d.dev_id, d.ticket_id, d.motivo, d.fecha_devolucion,
              u.usu_nom AS usuario,
              MAX(v.total_ticket) AS total_ticket,
              GROUP_CONCAT(v.cantidad||'x '||v.producto, ' | ') AS articulos
       FROM rv_devoluciones d
       LEFT JOIN tm_usuario u ON u.usu_id = d.usu_id
       LEFT JOIN rv_ventas v ON v.ticket = d.ticket_id
       WHERE DATE(d.fecha_devolucion) BETWEEN $1 AND $2
       GROUP BY d.dev_id
       ORDER BY d.fecha_devolucion DESC`,
      [fi, ff]
    );

    const montoTotal = rows.reduce((s, r) => s + parseFloat(r.total_ticket || 0), 0);
    animarContador('d-count', rows.length,  false);
    animarContador('d-monto', montoTotal,   true);

    if (!rows.length) { cont.innerHTML = '<p class="rep-empty">Sin devoluciones en el período.</p>'; return; }

    renderDataTable('tabla-devoluciones', {
      cols: [
        { label: '#Dev',         key: 'dev_id',          render: v => `<span style="color:#6c757d;">#${v}</span>` },
        { label: 'Ticket',       key: 'ticket_id',       render: v => `<strong>#${v}</strong>` },
        { label: 'Fecha',        key: 'fecha_devolucion', render: v => `<span style="white-space:nowrap;">${fmtDt(v)}</span>` },
        { label: 'Artículos',    key: 'articulos',       render: v => `<span style="font-size:.84rem;color:#555;">${(v||'—').replace(/\|/g,'<br>')}</span>`,
          searchVal: r => r.articulos || '' },
        { label: 'Motivo',       key: 'motivo',          render: v => `<span style="font-size:.84rem;">${v || '—'}</span>` },
        { label: 'Usuario',      key: 'usuario',         render: v => `<span style="font-size:.84rem;">${v || '—'}</span>` },
        { label: 'Monto ticket', key: 'total_ticket',    render: v => `<strong style="color:#dc3545;">${fmt(v)}</strong>` },
      ],
      rows,
      perPage: 15,
    });
  },

  // ── Utilidades ────────────────────────────────────────────────────────────
  async cargarUtilidades() {
    const fi = val('u-fecha-inicio');
    const ff = val('u-fecha-fin');
    const cont = document.getElementById('tabla-utilidades');
    if (!cont) return;
    cont.innerHTML = '<p class="rep-loading">Cargando...</p>';

    const rows = await dbSelect(
      `SELECT v.producto, SUM(v.cantidad) AS unidades,
              IFNULL(p.pr_precioventa,0) AS precio_venta,
              IFNULL(p.pr_preciocompra,0) AS precio_compra,
              SUM(v.cantidad)*(IFNULL(p.pr_precioventa,0)-IFNULL(p.pr_preciocompra,0)) AS utilidad
       FROM rv_ventas v
       LEFT JOIN rv_productos p ON p.ID = v.id_producto
       WHERE DATE(v.fecha) BETWEEN $1 AND $2
         AND v.estatus='completado'
       GROUP BY v.id_producto
       ORDER BY utilidad DESC`,
      [fi, ff]
    );

    const totalU = rows.reduce((s, r) => s + parseFloat(r.utilidad || 0), 0);
    animarContador('u-total', totalU, true);

    if (!rows.length) { cont.innerHTML = '<p class="rep-empty">Sin datos de utilidad.</p>'; return; }

    const rowsConPU = rows.map(r => ({
      ...r,
      _utilidad_u: parseFloat(r.precio_venta || 0) - parseFloat(r.precio_compra || 0),
    }));

    renderDataTable('tabla-utilidades', {
      cols: [
        { label: 'Producto',      key: 'producto',    render: v => `<strong>${v}</strong>` },
        { label: 'Unidades',      key: 'unidades',    render: v => `<span style="display:block;text-align:center;">${v}</span>` },
        { label: 'P. Venta',      key: 'precio_venta',  render: v => fmt(v) },
        { label: 'P. Costo',      key: 'precio_compra', render: v => fmt(v) },
        { label: 'Utilidad/u',    key: '_utilidad_u',   render: v => fmt(v) },
        { label: 'Utilidad Total',key: 'utilidad',      render: v => {
            const color = parseFloat(v || 0) >= 0 ? '#28a745' : '#dc3545';
            return `<strong style="color:${color};">${fmt(v)}</strong>`;
          }
        },
      ],
      rows: rowsConPU,
      perPage: 20,
    });
  },
};

// ─── Reimpresión de ticket ────────────────────────────────────────────────────
async function reimprimirTicket(ticketId) {
  try {
    const rows = await dbSelect(
      `SELECT v.*, e.emp_nombre FROM rv_ventas v
       LEFT JOIN tm_empleado e ON e.emp_id = v.vendedor
       WHERE v.ticket = $1`,
      [ticketId]
    );
    if (!rows.length) { alert('No se encontró el ticket #' + ticketId); return; }

    const r = rows[0];
    const vendedorNombre = r.emp_nombre || 'Vendedor';
    const total = parseFloat(r.total_ticket) || 0;
    const tipoPago = r.metodo_pago || '';
    const montosMixtos = { efectivo: parseFloat(r.monto_efectivo) || 0, tarjeta: parseFloat(r.monto_tarjeta) || 0, transferencia: parseFloat(r.monto_transferencia) || 0 };

    let filas = '';
    for (const item of rows) {
      filas += `<tr>
        <td style='vertical-align:top;width:15%;'>${item.cantidad}x</td>
        <td style='vertical-align:top;width:55%;word-break:break-word;'>${item.producto}</td>
        <td style='vertical-align:top;text-align:right;width:30%;'>$${(parseFloat(item.total) || 0).toFixed(2)}</td>
      </tr>`;
    }

    if (parseFloat(r.costo_envio) > 0) {
      filas += `<tr>
        <td></td>
        <td style='vertical-align:top;font-style:italic;'>Envío a domicilio</td>
        <td style='vertical-align:top;text-align:right;'>$${parseFloat(r.costo_envio).toFixed(2)}</td>
      </tr>`;
    }

    let filasTotales = '';
    if (tipoPago.toLowerCase() === 'mixto') {
      if (montosMixtos.efectivo > 0) filasTotales += `<p>Efectivo: <span style='display:inline-block;width:70px;text-align:right;'>$${montosMixtos.efectivo.toFixed(2)}</span></p>`;
      if (montosMixtos.tarjeta > 0)  filasTotales += `<p>Tarjeta: <span style='display:inline-block;width:70px;text-align:right;'>$${montosMixtos.tarjeta.toFixed(2)}</span></p>`;
      if (montosMixtos.transferencia > 0) filasTotales += `<p>Transf: <span style='display:inline-block;width:70px;text-align:right;'>$${montosMixtos.transferencia.toFixed(2)}</span></p>`;
    } else {
      filasTotales = `<p>Recibo: <span style='display:inline-block;width:70px;text-align:right;'>$${total.toFixed(2)}</span></p>`;
    }

    const tipoLabel = r.tipo_orden === 'llevar' ? 'Para llevar' : r.tipo_orden === 'comer_aqui' ? 'Comer aquí' : 'Domicilio';
    const fecha = new Date(r.fecha.replace(' ', 'T')).toLocaleString('es-MX');

    const html = `<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'>
<title>Ticket #${ticketId}</title><style>
@page{margin:0;size:58mm auto;}*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Courier New',monospace;font-size:13px;font-weight:bold;width:58mm;max-width:58mm;padding:5px;color:#000;line-height:1.2;}
.center{text-align:center;}.sep{border:none;border-top:1px dashed #000;margin:6px 0;}
.info p{margin-bottom:2px;}table{width:100%;border-collapse:collapse;}
td{font-size:13px;padding:3px 0;vertical-align:top;}
.totales-container{margin-top:6px;font-size:14px;text-align:right;}.totales-container p{margin-bottom:3px;}
.total-final{font-size:20px;font-weight:bold;margin-top:10px;margin-bottom:10px;text-align:center;}
</style></head><body>
<div class="center"><h1 style="font-size:18px;">Ticket #${ticketId}</h1><h2 style="font-size:15px;margin-bottom:8px;">Antojitos Santa Lucía</h2><p style="font-size:11px;">[REIMPRESIÓN]</p></div>
${r.sensor_num ? `<div style='text-align:center;border:2px solid #000;border-radius:6px;padding:6px 4px;margin:6px 0;'><div style='font-size:11px;font-weight:bold;'>SENSOR</div><div style='font-size:48px;font-weight:900;line-height:1;'>#${r.sensor_num}</div></div>` : ''}
<div class='info'>
  <p>Fecha: ${fecha}</p>
  <p>Vendedor: ${vendedorNombre}</p>
  <p>Tipo: ${tipoLabel}</p>
  <p>Metodo Pago: ${tipoPago ? tipoPago.toUpperCase() : 'N/A'}</p>
  ${r.direccion ? `<p>Dirección: ${r.direccion}</p>` : ''}
</div>
<hr class='sep'>
<table><thead><tr><th style='text-align:left;'>Cant</th><th style='text-align:left;'>Producto</th><th style='text-align:right;'>Total</th></tr></thead>
<tbody>${filas}</tbody></table>
<hr class='sep'>
<div class='totales-container'>${filasTotales}</div>
<div class='total-final'>TOTAL: $${total.toFixed(2)}</div>
<div class="center" style="font-size:15px;margin-top:10px;"><p>¡Gracias por su preferencia!</p></div>
</body></html>`;

    if (window.imprimirTicket) window.imprimirTicket(html);
    else alert('Función de impresión no disponible.');
  } catch (err) {
    alert('Error al reimprimir: ' + (err.message || err));
  }
}

// ─── Micro helpers ────────────────────────────────────────────────────────────
function val(id) { return document.getElementById(id)?.value || ''; }
function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }
function waitForChartJs() {
  return new Promise(res => {
    if (window.Chart) { res(); return; }
    const t = setInterval(() => { if (window.Chart) { clearInterval(t); res(); } }, 80);
  });
}
