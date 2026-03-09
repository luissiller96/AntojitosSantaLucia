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
    <div class="rep-card">
      <div class="rep-card-header">
        <span>Detalle de Ventas</span>
        <span>Total: <strong id="v-total" style="color:#007aff;">$0.00</strong></span>
      </div>
      <div class="rep-table-wrap" id="tabla-ventas">
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
        }
      });
    });
  },

  // ── Eventos ─────────────────────────────────────────────────────────────────
  bindEvents() {
    document.getElementById('btn-generar-grafica')?.addEventListener('click', () => this.cargarGrafica());
    document.getElementById('btn-filtrar-cierre')?.addEventListener('click', () => this.cargarCierre());
    document.getElementById('btn-filtrar-utilidades')?.addEventListener('click', () => this.cargarUtilidades());

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
    // Botón Exportar Excel
    document.getElementById('btn-exportar-excel')?.addEventListener('click', () => this.exportarExcelVentas());
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
    setText('kpi-ventas', fmt(r.ventas));
    setText('kpi-tickets', r.tickets || 0);
    setText('kpi-productos', r.productos || 0);
    const prom = r.tickets > 0 ? (r.ventas / r.tickets) : 0;
    setText('kpi-promedio', fmt(prom));
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

    cont.innerHTML = `
    <table class="rep-table">
      <thead><tr><th>#</th><th>Producto</th><th>Categoría</th><th>Unidades</th><th>Total Vendido</th></tr></thead>
      <tbody>
        ${rows.map((r, i) => `
        <tr>
          <td><span class="rep-rank">${i + 1}</span></td>
          <td><strong>${r.producto}</strong></td>
          <td><span class="rep-badge-cat">${r.categoria || '—'}</span></td>
          <td style="text-align:center; font-weight:700;">${r.unidades}</td>
          <td style="font-weight:700; color:#28a745;">${fmt(r.total)}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  },

  // ── Ventas ────────────────────────────────────────────────────────────────
  async cargarVentas() {
    const fi = val('v-fecha-inicio');
    const ff = val('v-fecha-fin');
    const pago = document.querySelector('.rep-btn-pago.active')?.dataset.pago || 'todas';
    const cont = document.getElementById('tabla-ventas');
    if (!cont || !fi || !ff) return;
    cont.innerHTML = '<p class="rep-loading">Cargando...</p>';

    let query = `
      SELECT ticket, fecha, vendedor, metodo_pago,
             GROUP_CONCAT(cantidad||'x '||producto, ' | ') AS articulos,
             SUM(cantidad) AS total_prod,
             MAX(total_ticket) AS total_ticket
      FROM rv_ventas
      WHERE DATE(fecha) BETWEEN $1 AND $2
        AND estatus='completado'`;
    const params = [fi, ff];
    if (pago !== 'todas') { query += ` AND metodo_pago=$3`; params.push(pago); }
    query += ` GROUP BY ticket ORDER BY fecha DESC`;

    const rows = await dbSelect(query, params);
    const totalFiltrado = rows.reduce((s, r) => s + parseFloat(r.total_ticket || 0), 0);
    setText('v-total', fmt(totalFiltrado));

    if (!rows.length) { cont.innerHTML = '<p class="rep-empty">Sin ventas en el período.</p>'; return; }

    const pagoBadge = p => {
      const cls = { efectivo: 'badge-ef', tarjeta: 'badge-tj', transferencia: 'badge-tr' }[p] || '';
      return `<span class="rep-badge-pago ${cls}">${p}</span>`;
    };

    cont.innerHTML = `
    <table class="rep-table">
      <thead><tr><th>Ticket</th><th>Fecha</th><th>Artículos</th><th>Forma Pago</th><th>Total</th></tr></thead>
      <tbody>
        ${rows.map(r => `
        <tr>
          <td style="color:#6c757d;">#${r.ticket}</td>
          <td style="white-space:nowrap;">${fmtDt(r.fecha)}</td>
          <td style="font-size:.85rem; color:#555;">${(r.articulos || '').replace(/\|/g, '<br>')}</td>
          <td>${pagoBadge(r.metodo_pago)}</td>
          <td style="font-weight:700; color:#28a745;">${fmt(r.total_ticket)}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
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

    // Totales acumulados
    const totEf = cierres.reduce((s, r) => s + parseFloat(r.ef || 0), 0);
    const totTj = cierres.reduce((s, r) => s + parseFloat(r.tj || 0), 0);
    const totTr = cierres.reduce((s, r) => s + parseFloat(r.tr || 0), 0);
    setText('c-efectivo', fmt(totEf));
    setText('c-tarjeta', fmt(totTj));
    setText('c-transf', fmt(totTr));
    setText('c-total', fmt(totEf + totTj + totTr));
    setText('totalCierresEncontrados', cierres.length);

    if (!cierres.length) { cont.innerHTML = '<p class="rep-empty">Sin cierres en el período.</p>'; return; }

    cont.innerHTML = `
    <table class="rep-table">
      <thead><tr><th>#</th><th>Apertura</th><th>Cierre</th><th>Efectivo</th><th>Tarjeta</th><th>Transf.</th><th>Total</th><th>Estatus</th></tr></thead>
      <tbody>
        ${cierres.map(r => {
      const tot = parseFloat(r.ef || 0) + parseFloat(r.tj || 0) + parseFloat(r.tr || 0);
      const estBadge = r.estatus === 'activa'
        ? '<span class="rep-badge-activa">🟢 Activa</span>'
        : '<span class="rep-badge-cerrada">✓ Cerrada</span>';
      return `<tr>
            <td>#${r.id}</td>
            <td style="white-space:nowrap;">${fmtDt(r.fecha_apertura)}</td>
            <td style="white-space:nowrap;">${r.fecha_cierre ? fmtDt(r.fecha_cierre) : '—'}</td>
            <td style="color:#28a745;">${fmt(r.ef)}</td>
            <td style="color:#007aff;">${fmt(r.tj)}</td>
            <td style="color:#ff9800;">${fmt(r.tr)}</td>
            <td style="font-weight:700;">${fmt(tot)}</td>
            <td>${estBadge}</td>
          </tr>`;
    }).join('')}
      </tbody>
    </table>`;
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
    setText('u-total', fmt(totalU));

    if (!rows.length) { cont.innerHTML = '<p class="rep-empty">Sin datos de utilidad.</p>'; return; }

    cont.innerHTML = `
    <table class="rep-table">
      <thead><tr><th>Producto</th><th>Unidades</th><th>P. Venta</th><th>P. Costo</th><th>Utilidad/u</th><th>Utilidad Total</th></tr></thead>
      <tbody>
        ${rows.map(r => {
      const pu = parseFloat(r.precio_venta || 0) - parseFloat(r.precio_compra || 0);
      const colorU = parseFloat(r.utilidad || 0) >= 0 ? '#28a745' : '#dc3545';
      return `<tr>
            <td><strong>${r.producto}</strong></td>
            <td style="text-align:center;">${r.unidades}</td>
            <td>${fmt(r.precio_venta)}</td>
            <td>${fmt(r.precio_compra)}</td>
            <td>${fmt(pu)}</td>
            <td style="font-weight:700; color:${colorU};">${fmt(r.utilidad)}</td>
          </tr>`;
    }).join('')}
      </tbody>
    </table>`;
  },
};

// ─── Micro helpers ────────────────────────────────────────────────────────────
function val(id) { return document.getElementById(id)?.value || ''; }
function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }
function waitForChartJs() {
  return new Promise(res => {
    if (window.Chart) { res(); return; }
    const t = setInterval(() => { if (window.Chart) { clearInterval(t); res(); } }, 80);
  });
}
