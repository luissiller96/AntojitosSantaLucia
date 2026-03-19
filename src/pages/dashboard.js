/**
 * dashboard.js - Panel de control y métricas
 * Reemplaza: pages/dashboard.php + js/dashboard.js + controller/controller_dashboard.php + models/Dashboard.php
 */

import { dbSelect } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderDashboard(container) {
  // Inyectar CSS
  injectCSS('dashboard-css', '/assets/css/dashboard.css');

  // Montar layout con el HTML de la página
  renderLayout(container, 'dashboard', getDashboardHTML());

  // Inicializar lógica (await para que los errores sean visibles)
  await DashboardApp.init();
}

function injectCSS(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function getDashboardHTML() {
  return `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          <i class="fas fa-chart-line"></i>
          Dashboard
        </h1>
        <p class="dashboard-subtitle">Panel de control y métricas del negocio</p>
      </div>

      <!-- Loader -->
      <div id="dashboard-loader" class="dashboard-loader">
        <div class="spinner"></div>
        <p style="margin-top: 15px; color: #64748b;">Cargando información...</p>
      </div>

      <!-- KPIs Section -->
      <div id="kpis-section" class="kpis-container" style="display: none;">

        <div class="kpi-card success">
          <div class="kpi-content">
            <div class="kpi-icon success"><i class="fas fa-dollar-sign"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Ventas del Día</div>
              <div class="kpi-value" id="kpi-ventas-dia">$0.00</div>
            </div>
          </div>
        </div>

        <div class="kpi-card warning">
          <div class="kpi-content">
            <div class="kpi-icon warning"><i class="fas fa-hamburger"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Platillos Hoy</div>
              <div class="kpi-value" id="kpi-platillos-dia">0</div>
            </div>
          </div>
        </div>

        <div class="kpi-card purple">
          <div class="kpi-content">
            <div class="kpi-icon purple"><i class="fas fa-calendar-alt"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Ventas del Mes</div>
              <div class="kpi-value" id="kpi-ventas-mes">$0.00</div>
            </div>
          </div>
        </div>

        <div class="kpi-card danger">
          <div class="kpi-content">
            <div class="kpi-icon danger"><i class="fas fa-fire-burner"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">En Cocina (Comandas)</div>
              <div class="kpi-value" id="kpi-ordenes-cocina">0</div>
            </div>
          </div>
        </div>

        <div class="kpi-card salidas">
          <div class="kpi-content">
            <div class="kpi-icon salidas"><i class="fas fa-hand-holding-usd"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Salidas Hoy</div>
              <div class="kpi-value" id="kpi-salidas-dia">$0.00</div>
            </div>
          </div>
        </div>

        <div class="kpi-card salidas-mes">
          <div class="kpi-content">
            <div class="kpi-icon salidas-mes"><i class="fas fa-file-invoice-dollar"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Salidas del Mes</div>
              <div class="kpi-value" id="kpi-salidas-mes">$0.00</div>
            </div>
          </div>
        </div>

        <div class="kpi-card caja">
          <div class="kpi-content">
            <div class="kpi-icon caja"><i class="fas fa-cash-register"></i></div>
            <div class="kpi-info kpi-caja-info">
              <div class="kpi-label">Estado de Caja</div>
              <div class="kpi-caja-estado">
                <span class="caja-indicador caja-cerrada" id="caja-indicador"></span>
                <span class="kpi-value" id="kpi-caja-estado" style="font-size: 1.2rem;">Cerrada</span>
              </div>
              <div class="kpi-caja-detalle">
                <div>Apertura: <span id="kpi-caja-hora">--:--</span></div>
                <div>Monto: <span id="kpi-caja-monto">$0.00</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Content Section -->
      <div id="content-section" class="content-grid" style="display: none;">
        <div class="dashboard-card">
          <h4 class="card-title">
            <i class="fas fa-chart-area"></i>
            Ventas de los Últimos 7 Días
          </h4>
          <div class="chart-container">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        <div class="dashboard-card">
          <h4 class="card-title">
            <i class="fas fa-bell"></i>
            Últimas Ventas
          </h4>
          <div id="last-sales-list" class="novedades-container"></div>
        </div>
      </div>

    </div>
  `;
}

// ─── Lógica del Dashboard ────────────────────────────────────────────────────

const DashboardApp = {
  chartInstance: null,
  refreshInterval: 600000,

  async init() {
    // Debug: mostrar estado inicial
    const loader = document.getElementById('dashboard-loader');
    if (loader) {
      loader.style.cssText = 'background:#fff !important; padding:30px; min-height:200px;';
      loader.innerHTML = `<p style="color:#333;font-family:monospace;">⏳ Iniciando dashboard...</p>`;
    }

    try {
      if (loader) loader.innerHTML = `<p style="color:#333;font-family:monospace;">⏳ Cargando Chart.js...</p>`;
      await loadChartJS();
      if (loader) loader.innerHTML = `<p style="color:#333;font-family:monospace;">⏳ Ejecutando queries...</p>`;
      await this.loadData();
      this.setupRefresh();
      this.addEventListeners();
    } catch (err) {
      this.showError(err);
    }
  },

  async loadData() {
    try {
      const [kpis, ventasSemana, ultimasVentas] = await Promise.all([
        getKpisCompletos(),
        getVentas7Dias(),
        getUltimasVentas(),
      ]);
      this.updateUI({ kpis, ventas_semana: ventasSemana, ultimas_ventas: ultimasVentas });
    } catch (err) {
      console.error('Error dashboard:', err);
      this.showError(err);
    }
  },

  updateUI(data) {
    this.hideLoader();
    if (data.kpis) this.updateKPIs(data.kpis);
    if (data.ventas_semana) this.renderChart(data.ventas_semana);
    if (data.ultimas_ventas) this.renderNovedades(data.ultimas_ventas);
  },

  updateKPIs(kpis) {
    this.animateValue('kpi-ventas-dia', 0, kpis.ventas_dia, 1000, true);
    this.animateValue('kpi-platillos-dia', 0, kpis.platillos_dia, 1000, false);
    this.animateValue('kpi-ventas-mes', 0, kpis.ventas_mes, 1000, true);
    this.animateValue('kpi-ordenes-cocina', 0, kpis.ordenes_cocina, 1000, false);
    this.animateValue('kpi-salidas-dia', 0, kpis.salidas_dia, 1000, true);
    this.animateValue('kpi-salidas-mes', 0, kpis.salidas_mes, 1000, true);
    this.updateEstadoCaja(kpis);
  },

  updateEstadoCaja(kpis) {
    const estadoEl = document.getElementById('kpi-caja-estado');
    const horaEl = document.getElementById('kpi-caja-hora');
    const montoEl = document.getElementById('kpi-caja-monto');
    const indicadorEl = document.getElementById('caja-indicador');

    if (kpis.caja_estado === 'abierta') {
      if (estadoEl) estadoEl.textContent = 'Abierta';
      if (horaEl && kpis.caja_hora_apertura) {
        const fecha = new Date(kpis.caja_hora_apertura);
        horaEl.textContent = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      }
      if (montoEl) montoEl.textContent = this.formatCurrency(kpis.caja_monto_apertura);
      if (indicadorEl) {
        indicadorEl.classList.remove('caja-cerrada');
        indicadorEl.classList.add('caja-abierta');
      }
    } else {
      if (estadoEl) estadoEl.textContent = 'Cerrada';
      if (horaEl) horaEl.textContent = '--:--';
      if (montoEl) montoEl.textContent = '$0.00';
      if (indicadorEl) {
        indicadorEl.classList.remove('caja-abierta');
        indicadorEl.classList.add('caja-cerrada');
      }
    }
  },

  animateValue(id, start, end, duration, isCurrency) {
    const el = document.getElementById(id);
    if (!el) return;
    const range = end - start;
    if (range === 0) {
      el.textContent = isCurrency ? this.formatCurrency(end) : end.toLocaleString('es-MX');
      return;
    }
    const startTime = Date.now();
    const endTime = startTime + duration;
    const timer = setInterval(() => {
      const remaining = Math.max((endTime - Date.now()) / duration, 0);
      const value = Math.round(end - remaining * range);
      el.textContent = isCurrency ? this.formatCurrency(value) : value.toLocaleString('es-MX');
      if (value >= end) {
        clearInterval(timer);
        el.textContent = isCurrency ? this.formatCurrency(end) : end.toLocaleString('es-MX');
      }
    }, 50);
  },

  renderChart(salesData) {
    const ctx = document.getElementById('salesChart');
    if (!ctx || !window.Chart) return;
    const chartCtx = ctx.getContext('2d');

    const labels = salesData.map(item => {
      const date = new Date(item.dia + 'T00:00:00');
      return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
    });
    const dataPoints = salesData.map(item => item.total_dia);

    if (this.chartInstance) this.chartInstance.destroy();

    const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(229, 118, 70, 0.8)');
    gradient.addColorStop(1, 'rgba(229, 94, 70, 0.4)');

    this.chartInstance = new window.Chart(chartCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ventas',
          data: dataPoints,
          backgroundColor: gradient,
          borderColor: '#d45437ff',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          maxBarThickness: 60,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            titleColor: '#fff', bodyColor: '#fff',
            padding: 12, cornerRadius: 8, displayColors: false,
            callbacks: {
              label: (ctx) => 'Ventas: ' + this.formatCurrency(ctx.parsed.y),
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
            ticks: {
              color: '#64748b', font: { size: 11 },
              callback: (v) => this.formatCurrency(v, true),
            },
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } },
          },
        },
        animation: { duration: 1000, easing: 'easeInOutQuart' },
      },
    });
  },

  renderNovedades(ventas) {
    const container = document.getElementById('last-sales-list');
    if (!container) return;

    if (!ventas || ventas.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No hay novedades por el momento</p>
        </div>`;
      return;
    }

    container.innerHTML = ventas.map(venta => {
      const paymentIcon = venta.metodo_pago?.toLowerCase() === 'efectivo'
        ? '<i class="fas fa-money-bill-wave" style="color: #10b981;"></i>'
        : '<i class="fas fa-credit-card" style="color: #d47037ff;"></i>';

      const statusBadge = venta.estatus
        ? `<span class="ticket-status status-${venta.estatus}">${venta.estatus}</span>`
        : '';

      const productsList = venta.productos?.length
        ? `<ul class="ticket-products">
            ${venta.productos.map(p => `
              <li class="product-item">
                <span class="product-qty">${p.cantidad}x</span>
                ${p.producto}
              </li>`).join('')}
           </ul>`
        : '';

      return `
        <div class="ticket-item">
          <div class="ticket-header">
            <span class="ticket-number">Ticket #${venta.ticket}</span>
            ${statusBadge}
          </div>
          ${productsList}
          <div class="ticket-footer">
            <span class="ticket-time">
              ${paymentIcon} ${venta.hora_venta}
            </span>
            <span class="ticket-amount">${this.formatCurrency(venta.total_ticket)}</span>
          </div>
        </div>`;
    }).join('');
  },

  formatCurrency(value, simple = false) {
    if (simple) {
      return '$' + new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: 0, maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', minimumFractionDigits: 2,
    }).format(value);
  },

  hideLoader() {
    const loader = document.getElementById('dashboard-loader');
    const kpis = document.getElementById('kpis-section');
    const content = document.getElementById('content-section');
    if (loader) loader.style.display = 'none';
    if (kpis) { kpis.style.display = 'flex'; kpis.classList.add('animate-fadeInUp'); }
    if (content) { content.style.display = 'grid'; content.classList.add('animate-fadeInUp'); }
  },

  showError(err) {
    const loader = document.getElementById('dashboard-loader');
    if (loader) {
      loader.style.background = '#fff';
      loader.style.padding = '40px';
      loader.innerHTML = `
        <div style="color:#ef4444;font-family:monospace;">
          <h3 style="color:#ef4444;margin-bottom:12px;">❌ Error al cargar datos</h3>
          <pre style="background:#1e293b;color:#f87171;padding:16px;border-radius:8px;font-size:12px;overflow:auto;text-align:left;">${err?.stack || err?.message || String(err)}</pre>
          <button id="btnRetryDashboard" style="
            margin-top:15px; padding:8px 20px; background:#d45c37ff;
            color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
            Reintentar
          </button>
        </div>`;
    }
  },

  setupRefresh() {
    setInterval(() => this.loadData(), this.refreshInterval);
  },

  addEventListeners() {
    document.querySelectorAll('.kpi-card').forEach(card => {
      card.addEventListener('click', function () {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => { this.style.transform = ''; }, 150);
      });
    });

    // Delegación para botón de reintento (creado dinámicamente)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btnRetryDashboard')) {
        this.loadData();
      }
    });
  },
};

window.DashboardApp = DashboardApp;

// ─── Queries SQLite (equivalentes a models/Dashboard.php) ────────────────────

function today() {
  // Usar fecha local (no UTC) para coincidir con cómo se guardan los registros
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD en hora local
}

function currentMonth() {
  const d = new Date();
  return { mes: d.getMonth() + 1, anio: d.getFullYear() };
}

async function getKpisCompletos() {
  const hoy = today();
  const { mes, anio } = currentMonth();

  // Ventas del día
  const [r1] = await dbSelect(
    `SELECT COALESCE(SUM(sub.total_ticket), 0) as total
     FROM (SELECT ticket, MAX(total_ticket) AS total_ticket FROM rv_ventas
           WHERE DATE(fecha) = $1 AND estatus = 'completado' GROUP BY ticket) sub`,
    [hoy]
  );
  const ventas_dia = parseFloat(r1.total);

  // Platillos hoy
  const [r2] = await dbSelect(
    `SELECT COALESCE(SUM(cantidad), 0) as total FROM rv_ventas
     WHERE DATE(fecha) = $1 AND estatus = 'completado'`,
    [hoy]
  );
  const platillos_dia = parseInt(r2.total);

  // Ventas del mes
  const [r3] = await dbSelect(
    `SELECT COALESCE(SUM(sub.total_ticket), 0) as total
     FROM (SELECT ticket, MAX(total_ticket) AS total_ticket FROM rv_ventas
           WHERE strftime('%m', fecha) = $1 AND strftime('%Y', fecha) = $2
           AND estatus = 'completado' GROUP BY ticket) sub`,
    [String(mes).padStart(2, '0'), String(anio)]
  );
  const ventas_mes = parseFloat(r3.total);

  // Órdenes en cocina
  const [r4] = await dbSelect(
    `SELECT COUNT(DISTINCT ticket) as total FROM rv_ventas
     WHERE estatus = 'pendiente' OR estatus = 'en preparacion'`,
    []
  );
  const ordenes_cocina = parseInt(r4.total);

  // Estado de caja
  const cajaRows = await dbSelect(
    `SELECT fecha_apertura, monto_apertura FROM rv_apertura_caja
     WHERE estatus = 'activa' ORDER BY fecha_apertura DESC LIMIT 1`,
    []
  );
  const caja_estado = cajaRows.length > 0 ? 'abierta' : 'cerrada';
  const caja_hora_apertura = cajaRows[0]?.fecha_apertura ?? null;
  const caja_monto_apertura = parseFloat(cajaRows[0]?.monto_apertura ?? 0);

  // Salidas de efectivo del día
  const [r5] = await dbSelect(
    `SELECT COALESCE(SUM(precio_unitario), 0) as total FROM rv_gastos
     WHERE tipo_gasto = 'Salida de Efectivo' AND DATE(fecha) = $1`,
    [hoy]
  );
  const salidas_dia = parseFloat(r5.total);

  // Salidas de efectivo del mes
  const [r6] = await dbSelect(
    `SELECT COALESCE(SUM(precio_unitario), 0) as total FROM rv_gastos
     WHERE tipo_gasto = 'Salida de Efectivo'
     AND strftime('%m', fecha) = $1 AND strftime('%Y', fecha) = $2`,
    [String(mes).padStart(2, '0'), String(anio)]
  );
  const salidas_mes = parseFloat(r6.total);

  return {
    ventas_dia, platillos_dia, ventas_mes, ordenes_cocina,
    caja_estado, caja_hora_apertura, caja_monto_apertura,
    salidas_dia, salidas_mes,
  };
}

async function getVentas7Dias() {
  // SQLite: generar los últimos 7 días y hacer LEFT JOIN
  const rows = await dbSelect(
    `SELECT DATE(fecha) as dia, COALESCE(SUM(total), 0) as total_dia
     FROM rv_ventas
     WHERE fecha >= DATE('now', '-6 days') AND estatus = 'completado'
     GROUP BY DATE(fecha)
     ORDER BY DATE(fecha) ASC`,
    []
  );

  // Rellenar días sin ventas con 0
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dia = d.toISOString().slice(0, 10);
    const found = rows.find(r => r.dia === dia);
    result.push({ dia, total_dia: found ? parseFloat(found.total_dia) : 0 });
  }
  return result;
}

async function getUltimasVentas() {
  // Obtener los últimos 5 tickets
  const tickets = await dbSelect(
    `SELECT DISTINCT ticket FROM rv_ventas
     WHERE estatus = 'completado'
     ORDER BY fecha DESC LIMIT 5`,
    []
  );

  const ventas = [];
  for (const t of tickets) {
    const [info] = await dbSelect(
      `SELECT total_ticket, metodo_pago, time(fecha) as hora_venta, estatus
       FROM rv_ventas WHERE ticket = $1 AND estatus = 'completado' LIMIT 1`,
      [t.ticket]
    );
    const productos = await dbSelect(
      `SELECT producto, cantidad FROM rv_ventas
       WHERE ticket = $1 AND estatus = 'completado'`,
      [t.ticket]
    );
    if (info) {
      ventas.push({
        ticket: t.ticket,
        total_ticket: parseFloat(info.total_ticket),
        metodo_pago: info.metodo_pago,
        hora_venta: info.hora_venta,
        estatus: info.estatus,
        productos,
      });
    }
  }
  return ventas;
}

// ─── Carga dinámica de Chart.js ───────────────────────────────────────────────
function loadChartJS() {
  return new Promise((resolve) => {
    if (window.Chart) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = resolve;
    script.onerror = () => {
      console.warn('Chart.js no pudo cargarse (sin internet o CSP).');
      resolve(); // Continuar aunque no haya gráfica
    };
    document.head.appendChild(script);
  });
}
