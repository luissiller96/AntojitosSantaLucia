// dashboard.js - Actualizado con nuevos KPIs
document.addEventListener('DOMContentLoaded', () => {

    const Dashboard = {
        controllerPath: '../controller/controller_dashboard.php',
        chartInstance: null,
        refreshInterval: 600000, // 10 minutos

        // Inicialización
        async init() {
            await this.loadData();
            this.setupRefresh();
            this.addEventListeners();
        },

        // Cargar datos del dashboard
        async loadData() {
            try {
                const response = await fetch(`${this.controllerPath}?op=get_dashboard_data`);
                if (!response.ok) throw new Error('Error en la respuesta del servidor');

                const result = await response.json();
                
                if (result.status === 'success') {
                    this.updateUI(result.data);
                } else {
                    throw new Error(result.message || 'Error desconocido');
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                this.showError();
            }
        },

        // Actualizar toda la UI
        updateUI(data) {
            this.hideLoader();

            if (data.kpis) {
                this.updateKPIs(data.kpis);
            }

            if (data.ventas_semana) {
                this.renderChart(data.ventas_semana);
            }

            if (data.ultimas_ventas) {
                this.renderNovedades(data.ultimas_ventas);
            }
        },

// Actualizar KPIs con animación
updateKPIs(kpis) {
    // KPIs del día
    this.animateValue('kpi-ventas-dia', 0, kpis.ventas_dia, 1000, true);
    this.animateValue('kpi-platillos-dia', 0, kpis.platillos_dia, 1000, false);
    this.animateValue('kpi-gastos-operativos-dia', 0, kpis.gastos_operativos_dia, 1000, true);
    this.animateValue('kpi-utilidad-dia', 0, kpis.utilidad_dia, 1000, true);
    
    // KPIs del mes
    this.animateValue('kpi-ventas-mes', 0, kpis.ventas_mes, 1000, true);
    this.animateValue('kpi-gastos-fijos', 0, kpis.gastos_fijos_mes, 1000, true);
    this.animateValue('kpi-utilidad-mes', 0, kpis.utilidad_mes, 1000, true);
    this.animateValue('kpi-ordenes-cocina', 0, kpis.ordenes_cocina, 1000, false);
    
    // Estado de caja
    this.updateEstadoCaja(kpis);
},

        // Actualizar estado de caja
        updateEstadoCaja(kpis) {
            const estadoElement = document.getElementById('kpi-caja-estado');
            const horaElement = document.getElementById('kpi-caja-hora');
            const montoElement = document.getElementById('kpi-caja-monto');
            const indicadorElement = document.getElementById('caja-indicador');
            
            if (kpis.caja_estado === 'abierta') {
                if (estadoElement) estadoElement.textContent = 'Abierta';
                
                if (horaElement && kpis.caja_hora_apertura) {
                    const fecha = new Date(kpis.caja_hora_apertura);
                    horaElement.textContent = fecha.toLocaleTimeString('es-MX', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                }
                
                if (montoElement) {
                    montoElement.textContent = this.formatCurrency(kpis.caja_monto_apertura);
                }
                
                if (indicadorElement) {
                    indicadorElement.classList.remove('caja-cerrada');
                    indicadorElement.classList.add('caja-abierta');
                }
            } else {
                if (estadoElement) estadoElement.textContent = 'Cerrada';
                if (horaElement) horaElement.textContent = '--:--';
                if (montoElement) montoElement.textContent = '$0.00';
                
                if (indicadorElement) {
                    indicadorElement.classList.remove('caja-abierta');
                    indicadorElement.classList.add('caja-cerrada');
                }
            }
        },

        // Animar valores numéricos
        animateValue(id, start, end, duration, isCurrency) {
            const element = document.getElementById(id);
            if (!element) return;

            const range = end - start;
            const minTimer = 50;
            let stepTime = Math.abs(Math.floor(duration / range));
            stepTime = Math.max(stepTime, minTimer);

            const startTime = new Date().getTime();
            const endTime = startTime + duration;

            const timer = setInterval(() => {
                const now = new Date().getTime();
                const remaining = Math.max((endTime - now) / duration, 0);
                const value = Math.round(end - (remaining * range));

                element.textContent = isCurrency
                    ? this.formatCurrency(value)
                    : value.toLocaleString('es-MX');

                if (value >= end) {
                    clearInterval(timer);
                    element.textContent = isCurrency
                        ? this.formatCurrency(end)
                        : end.toLocaleString('es-MX');
                }
            }, stepTime);
        },

        // Renderizar gráfica
        renderChart(salesData) {
            const ctx = document.getElementById('salesChart');
            if (!ctx) return;

            const chartCtx = ctx.getContext('2d');

            const labels = salesData.map(item => {
                const date = new Date(item.dia + 'T00:00:00');
                return date.toLocaleDateString('es-MX', {
                    weekday: 'short',
                    day: 'numeric'
                });
            });

            const dataPoints = salesData.map(item => item.total_dia);

            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            const gradient = chartCtx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(229, 118, 70, 0.8)');
            gradient.addColorStop(1, 'rgba(229, 94, 70, 0.4)');

            this.chartInstance = new Chart(chartCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ventas',
                        data: dataPoints,
                        backgroundColor: gradient,
                        borderColor: '#d45437ff',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                        barThickness: 'flex',
                        maxBarThickness: 60
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(30, 41, 59, 0.95)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                label: (context) => {
                                    return 'Ventas: ' + this.formatCurrency(context.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.04)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#64748b',
                                font: {
                                    size: 11
                                },
                                callback: (value) => this.formatCurrency(value, true)
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#64748b',
                                font: {
                                    size: 11
                                }
                            }
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
        },

        // Renderizar novedades
        renderNovedades(ventas) {
            const container = document.getElementById('last-sales-list');
            if (!container) return;

            if (!ventas || ventas.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No hay novedades por el momento</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = ventas.map(venta => {
                const paymentIcon = venta.metodo_pago?.toLowerCase() === 'efectivo'
                    ? '<i class="fas fa-money-bill-wave" style="color: #10b981;"></i>'
                    : '<i class="fas fa-credit-card" style="color: #d47037ff;"></i>';

                const statusBadge = venta.estatus
                    ? `<span class="ticket-status status-${venta.estatus}">${venta.estatus}</span>`
                    : '';

                const productsList = venta.productos && venta.productos.length > 0
                    ? `<ul class="ticket-products">
                        ${venta.productos.map(p => `
                            <li class="product-item">
                                <span class="product-qty">${p.cantidad}x</span>
                                ${p.producto}
                            </li>
                        `).join('')}
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
                                ${paymentIcon}
                                ${venta.hora_venta}
                            </span>
                            <span class="ticket-amount">${this.formatCurrency(venta.total_ticket)}</span>
                        </div>
                    </div>
                `;
            }).join('');
        },

        // Formatear moneda
        formatCurrency(value, simple = false) {
            if (simple) {
                return '$' + new Intl.NumberFormat('es-MX', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(value);
            }
            return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
                minimumFractionDigits: 2
            }).format(value);
        },

        // Ocultar loader y mostrar contenido
        hideLoader() {
            const loader = document.getElementById('dashboard-loader');
            const kpis = document.getElementById('kpis-section');
            const content = document.getElementById('content-section');

            if (loader) loader.style.display = 'none';
            if (kpis) {
                kpis.style.display = 'flex';
                kpis.classList.add('animate-fadeInUp');
            }
            if (content) {
                content.style.display = 'grid';
                content.classList.add('animate-fadeInUp');
            }
        },

        // Mostrar error
        showError() {
            const loader = document.getElementById('dashboard-loader');
            if (loader) {
                loader.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>
                        <p>Error al cargar los datos</p>
                        <button onclick="Dashboard.init()" style="
                            margin-top: 15px;
                            padding: 8px 20px;
                            background: #d45c37ff;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        ">Reintentar</button>
                    </div>
                `;
            }
        },

        // Configurar actualización automática
        setupRefresh() {
            setInterval(() => {
                this.loadData();
            }, this.refreshInterval);
        },

        // Event Listeners
        addEventListeners() {
            document.querySelectorAll('.kpi-card').forEach(card => {
                card.addEventListener('click', function () {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
            });
        }
    };

    Dashboard.init();
    window.Dashboard = Dashboard;
});