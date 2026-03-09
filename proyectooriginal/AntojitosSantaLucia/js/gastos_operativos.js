$(document).ready(function() {
    // ========================================
    // VARIABLES GLOBALES
    // ========================================
    let tablaGastos;
    let chartInstance = null;
    const hoy = new Date().toISOString().split('T')[0];

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    // Configurar fechas por defecto (últimos 7 días)
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    $('#filtro-fecha-inicio').val(hace7Dias.toISOString().split('T')[0]);
    $('#filtro-fecha-fin').val(hoy);
    
    // Configurar fecha actual en el formulario
    $('#gasto-fecha').val(new Date().toISOString().slice(0, 16));

    // Cargar datos iniciales
    cargarProductosEInsumos();
    cargarGastos();
    cargarResumenDia();
    cargarGrafica30Dias();

    // ========================================
    // CARGAR DATOS
    // ========================================

    function cargarGastos() {
        const fechaInicio = $('#filtro-fecha-inicio').val();
        const fechaFin = $('#filtro-fecha-fin').val();

        $.ajax({
            url: `../controller/gastos_operativos.php?op=listar&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    renderTablaGastos(response.data);
                } else {
                    Swal.fire('Error', 'No se pudieron cargar los gastos', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Error de conexión', 'error');
            }
        });
    }

    function renderTablaGastos(gastos) {
        if (tablaGastos) {
            tablaGastos.destroy();
        }

        const tbody = $('#tabla-gastos tbody');
        tbody.empty();

        if (gastos.length === 0) {
            tbody.html(`
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>No hay gastos registrados</p>
                    </td>
                </tr>
            `);
            return;
        }

        gastos.forEach(gasto => {
            const fecha = new Date(gasto.fecha);
            const fechaFormato = fecha.toLocaleDateString('es-MX', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const metodoPagoBadge = getMetodoPagoBadge(gasto.metodo_pago);
            
            // Mostrar info del item (producto o insumo)
            let itemInfo = '';
            if (gasto.item_nombre && gasto.cantidad_comprada) {
                const tipoIcon = gasto.tipo_item_real === 'producto' ? 'fa-box' : 'fa-warehouse';
                const tipoColor = gasto.tipo_item_real === 'producto' ? 'text-primary' : 'text-success';
                itemInfo = `<small class="${tipoColor}">
                    <i class="fas ${tipoIcon}"></i> 
                    ${gasto.item_nombre} (${gasto.cantidad_comprada})
                </small><br>`;
            }

            const row = `
                <tr>
                    <td>${fechaFormato}</td>
                    <td>
                        <strong>${gasto.descripcion}</strong><br>
                        ${itemInfo}
                        ${gasto.comentario ? `<small class="text-muted"><i class="fas fa-comment"></i> ${gasto.comentario}</small>` : ''}
                    </td>
                    <td class="text-center">${metodoPagoBadge}</td>
                    <td class="text-end">
                        <strong class="text-danger">${formatCurrency(gasto.precio_unitario)}</strong>
                    </td>
                    <td class="text-center">
                        <small class="text-muted">${gasto.usuario_nombre || 'Sistema'}</small>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-info btn-editar" 
                                data-id="${gasto.id}"
                                data-descripcion="${gasto.descripcion}"
                                data-precio="${gasto.precio_unitario}"
                                data-metodo="${gasto.metodo_pago}"
                                data-comentario="${gasto.comentario || ''}"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar" 
                                data-id="${gasto.id}"
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        tablaGastos = $('#tabla-gastos').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            pageLength: 25,
            order: [[0, 'desc']]
        });
    }

    function cargarProductosEInsumos() {
        $.ajax({
            url: '../controller/gastos_operativos.php?op=listar_productos',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    const select = $('#gasto-item');
                    select.empty();
                    select.append('<option value="">-- Gasto sin producto/insumo --</option>');
                    
                    // Separar productos e insumos
                    const productos = response.data.filter(item => item.tipo === 'producto');
                    const insumos = response.data.filter(item => item.tipo === 'insumo');
                    
                    // Agregar productos
                    if (productos.length > 0) {
                        select.append('<optgroup label="━━ PRODUCTOS ━━">');
                        productos.forEach(producto => {
                            select.append(`<option value="producto_${producto.id}" data-tipo="producto">
                                ${producto.nombre} (Stock: ${producto.stock || 0})
                            </option>`);
                        });
                        select.append('</optgroup>');
                    }
                    
                    // Agregar insumos
                    if (insumos.length > 0) {
                        select.append('<optgroup label="━━ INSUMOS ━━">');
                        insumos.forEach(insumo => {
                            select.append(`<option value="insumo_${insumo.id}" data-tipo="insumo">
                                ${insumo.nombre} (Stock: ${insumo.stock || 0} ${insumo.unidad_medida || ''})
                            </option>`);
                        });
                        select.append('</optgroup>');
                    }
                }
            },
            error: function() {
                console.error('Error al cargar productos e insumos');
            }
        });
    }

    function cargarResumenDia() {
        $.ajax({
            url: '../controller/gastos_operativos.php?op=resumen_dia',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    const data = response.data;
                    
                    animateValue('kpi-gastos-hoy', 0, data.total_monto, 1000);
                    animateValue('kpi-cantidad-gastos', 0, data.total_gastos, 800);
                    animateValue('kpi-efectivo', 0, data.total_efectivo, 1000);
                    animateValue('kpi-tarjeta', 0, data.total_tarjeta, 1000);
                }
            },
            error: function() {
                console.error('Error al cargar resumen del día');
            }
        });
    }

    function cargarGrafica30Dias() {
        $.ajax({
            url: '../controller/gastos_operativos.php?op=grafica_30_dias',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    renderGrafica(response.data);
                }
            },
            error: function() {
                console.error('Error al cargar datos de gráfica');
            }
        });
    }

    function renderGrafica(data) {
        const ctx = document.getElementById('chartGastos');
        if (!ctx) return;

        const labels = data.map(item => {
            const date = new Date(item.dia + 'T00:00:00');
            return date.toLocaleDateString('es-MX', {
                month: 'short',
                day: 'numeric'
            });
        });

        const valores = data.map(item => item.total_dia);

        if (chartInstance) {
            chartInstance.destroy();
        }

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gastos Operativos',
                    data: valores,
                    backgroundColor: gradient,
                    borderColor: '#dc3545',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                return 'Gastos: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.04)'
                        },
                        ticks: {
                            callback: (value) => '$' + value.toLocaleString('es-MX')
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // ========================================
    // EVENTOS DE FORMULARIO
    // ========================================

    // Mostrar/ocultar campo de cantidad comprada
    $('#gasto-item').change(function() {
        if ($(this).val()) {
            $('#campo-cantidad-comprada').removeClass('d-none');
            $('#gasto-cantidad-comprada').prop('required', true);
        } else {
            $('#campo-cantidad-comprada').addClass('d-none');
            $('#gasto-cantidad-comprada').prop('required', false).val('');
        }
    });

    // Nuevo gasto
    $('#btn-nuevo-gasto').click(function() {
        $('#form-gasto')[0].reset();
        $('#gasto-id').val('');
        $('#gasto-fecha').val(new Date().toISOString().slice(0, 16));
        $('#campo-cantidad-comprada').addClass('d-none');
        $('#modal-title').text('Nuevo Gasto Operativo');
        $('#modalGasto').modal('show');
    });

    // Guardar gasto
    $('#form-gasto').submit(function(e) {
        e.preventDefault();

        const id = $('#gasto-id').val();
        const url = id 
            ? '../controller/gastos_operativos.php?op=actualizar'
            : '../controller/gastos_operativos.php?op=guardar';

        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

        $.ajax({
            url: url,
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: response.message,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        $('#modalGasto').modal('hide');
                        cargarGastos();
                        cargarResumenDia();
                        cargarGrafica30Dias();
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Error de conexión', 'error');
            },
            complete: function() {
                btnSubmit.prop('disabled', false).html('<i class="fas fa-save"></i> Guardar');
            }
        });
    });

    // Editar gasto
    $(document).on('click', '.btn-editar', function() {
        const btn = $(this);
        
        $('#gasto-id').val(btn.data('id'));
        $('#gasto-descripcion').val(btn.data('descripcion'));
        $('#gasto-precio').val(btn.data('precio'));
        $('#gasto-metodo').val(btn.data('metodo'));
        $('#gasto-comentario').val(btn.data('comentario'));
        
        $('#modal-title').text('Editar Gasto Operativo');
        $('#campo-cantidad-comprada').addClass('d-none');
        $('#modalGasto').modal('show');
    });

    // Eliminar gasto
    $(document).on('click', '.btn-eliminar', function() {
        const id = $(this).data('id');

        Swal.fire({
            title: '¿Eliminar gasto?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '../controller/gastos_operativos.php?op=eliminar',
                    type: 'POST',
                    data: { id: id },
                    dataType: 'json',
                    success: function(response) {
                        if (response.status === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => {
                                cargarGastos();
                                cargarResumenDia();
                                cargarGrafica30Dias();
                            });
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function() {
                        Swal.fire('Error', 'Error de conexión', 'error');
                    }
                });
            }
        });
    });

    // Filtros de fecha
    $('#filtro-fecha-inicio, #filtro-fecha-fin').change(function() {
        cargarGastos();
    });

    $('#btn-limpiar-filtros').click(function() {
        $('#filtro-fecha-inicio').val(hace7Dias.toISOString().split('T')[0]);
        $('#filtro-fecha-fin').val(hoy);
        cargarGastos();
    });

    // ========================================
    // FUNCIONES AUXILIARES
    // ========================================

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    }

    function getMetodoPagoBadge(metodo) {
        const badges = {
            'efectivo': '<span class="badge bg-success"><i class="fas fa-money-bill"></i> Efectivo</span>',
            'tarjeta': '<span class="badge bg-primary"><i class="fas fa-credit-card"></i> Tarjeta</span>',
            'transferencia': '<span class="badge bg-info"><i class="fas fa-exchange-alt"></i> Transferencia</span>'
        };
        return badges[metodo] || badges['efectivo'];
    }

    function animateValue(id, start, end, duration) {
        const element = document.getElementById(id);
        if (!element) return;

        const isKpi = id.includes('kpi-gastos') || id.includes('efectivo') || id.includes('tarjeta');
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

            element.textContent = isKpi
                ? formatCurrency(value)
                : value.toLocaleString('es-MX');

            if (value >= end) {
                clearInterval(timer);
                element.textContent = isKpi
                    ? formatCurrency(end)
                    : end.toLocaleString('es-MX');
            }
        }, stepTime);
    }
});