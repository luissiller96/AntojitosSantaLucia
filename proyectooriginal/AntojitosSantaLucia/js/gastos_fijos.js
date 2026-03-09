$(document).ready(function() {
    // ========================================
    // VARIABLES GLOBALES
    // ========================================
    let mesActual = new Date().getMonth() + 1;
    let anioActual = new Date().getFullYear();
    let tablaPlantillas;
    let tablaGastos;

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    // Inicializar selectores de mes y año
    $('#select-mes').val(mesActual);
    $('#select-anio').val(anioActual);

    // Cargar datos iniciales
    cargarPlantillas();
    cargarGastosMes(mesActual, anioActual);

    // ========================================
    // GESTIÓN DE PLANTILLAS
    // ========================================

    function cargarPlantillas() {
        $.ajax({
            url: '../controller/gastos_fijos.php?op=listar_plantillas',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    renderTablaPlantillas(response.data);
                } else {
                    Swal.fire('Error', 'No se pudieron cargar las plantillas', 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Error de conexión al cargar plantillas', 'error');
            }
        });
    }

    function renderTablaPlantillas(plantillas) {
        if (tablaPlantillas) {
            tablaPlantillas.destroy();
        }

        const tbody = $('#tabla-plantillas tbody');
        tbody.empty();

        if (plantillas.length === 0) {
            tbody.html(`
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>No hay plantillas registradas</p>
                    </td>
                </tr>
            `);
            return;
        }

        plantillas.forEach(plantilla => {
            const badge = getBadgeCategoria(plantilla.categoria);
            const row = `
                <tr>
                    <td>${badge}</td>
                    <td>${plantilla.concepto}</td>
                    <td>${plantilla.descripcion || '-'}</td>
                    <td class="text-end">
                        <strong>${formatCurrency(plantilla.monto_base)}</strong>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-info btn-editar-plantilla" 
                                data-id="${plantilla.id}"
                                data-categoria="${plantilla.categoria}"
                                data-concepto="${plantilla.concepto}"
                                data-monto="${plantilla.monto_base}"
                                data-descripcion="${plantilla.descripcion || ''}"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar-plantilla" 
                                data-id="${plantilla.id}"
                                title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        tablaPlantillas = $('#tabla-plantillas').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            pageLength: 25,
            order: [[0, 'asc'], [1, 'asc']]
        });
    }

    // Abrir modal nueva plantilla
    $('#btn-nueva-plantilla').click(function() {
        $('#form-plantilla')[0].reset();
        $('#plantilla-id').val('');
        $('#modal-plantilla-title').text('Nueva Plantilla');
        $('#modalPlantilla').modal('show');
    });

    // Editar plantilla
    $(document).on('click', '.btn-editar-plantilla', function() {
        const btn = $(this);
        $('#plantilla-id').val(btn.data('id'));
        $('#plantilla-categoria').val(btn.data('categoria'));
        $('#plantilla-concepto').val(btn.data('concepto'));
        $('#plantilla-monto').val(btn.data('monto'));
        $('#plantilla-descripcion').val(btn.data('descripcion'));
        $('#modal-plantilla-title').text('Editar Plantilla');
        $('#modalPlantilla').modal('show');
    });

    // Guardar plantilla
    $('#form-plantilla').submit(function(e) {
        e.preventDefault();

        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

        $.ajax({
            url: '../controller/gastos_fijos.php?op=guardar_plantilla',
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
                        $('#modalPlantilla').modal('hide');
                        cargarPlantillas();
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

    // Eliminar plantilla
    $(document).on('click', '.btn-eliminar-plantilla', function() {
        const id = $(this).data('id');

        Swal.fire({
            title: '¿Eliminar plantilla?',
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
                    url: '../controller/gastos_fijos.php?op=eliminar_plantilla',
                    type: 'POST',
                    data: { id: id },
                    dataType: 'json',
                    success: function(response) {
                        if (response.status === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminada',
                                text: response.message,
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => {
                                cargarPlantillas();
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

    // ========================================
    // GESTIÓN DE GASTOS MENSUALES
    // ========================================

    function cargarGastosMes(mes, anio) {
        $.ajax({
            url: `../controller/gastos_fijos.php?op=listar_gastos_mes&mes=${mes}&anio=${anio}`,
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    renderTablaGastos(response.data.gastos);
                    renderResumen(response.data.resumen, mes, anio);
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
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i>
                        <p>No hay gastos registrados para este mes</p>
                        <button class="btn btn-primary btn-sm mt-2" id="btn-generar-desde-vacio">
                            <i class="fas fa-magic"></i> Generar desde plantillas
                        </button>
                    </td>
                </tr>
            `);
            return;
        }

        gastos.forEach(gasto => {
            const badge = getBadgeCategoria(gasto.categoria);
            const estatusBadge = getBadgeEstatus(gasto.estatus);
            const metodoPago = gasto.metodo_pago ? gasto.metodo_pago.toUpperCase() : '-';
            const fechaPago = gasto.fecha_pago || '-';

            const row = `
                <tr class="${gasto.estatus === 'pendiente' ? 'table-warning' : ''}">
                    <td>${badge}</td>
                    <td>${gasto.concepto}</td>
                    <td class="text-end">
                        <strong>${formatCurrency(gasto.monto)}</strong>
                    </td>
                    <td class="text-center">${metodoPago}</td>
                    <td class="text-center">${fechaPago}</td>
                    <td class="text-center">${estatusBadge}</td>
                    <td class="text-center">
                        ${gasto.estatus === 'pendiente' ? `
                            <button class="btn btn-sm btn-success btn-marcar-pagado" 
                                    data-id="${gasto.id}"
                                    title="Marcar como pagado">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-info btn-editar-gasto" 
                                data-id="${gasto.id}"
                                data-concepto="${gasto.concepto}"
                                data-monto="${gasto.monto}"
                                data-fecha="${gasto.fecha_pago || ''}"
                                data-metodo="${gasto.metodo_pago || 'transferencia'}"
                                data-notas="${gasto.notas || ''}"
                                data-estatus="${gasto.estatus}"
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-eliminar-gasto" 
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
            order: [[0, 'asc'], [1, 'asc']]
        });
    }

    function renderResumen(resumen, mes, anio) {
        const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        $('#mes-anio-actual').text(`${meses[mes]} ${anio}`);

        const container = $('#resumen-container');
        container.empty();

        if (resumen.length === 0) {
            container.html('<p class="text-muted text-center">No hay datos para mostrar</p>');
            return;
        }

        let totalGeneral = 0;

        resumen.forEach(cat => {
            totalGeneral += parseFloat(cat.total_monto);
            const badge = getBadgeCategoria(cat.categoria);
            
            const card = `
                <div class="col-md-6 col-lg-3 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                ${badge}
                                <span class="text-muted">${cat.total_gastos} gastos</span>
                            </div>
                            <h4 class="mb-1">${formatCurrency(cat.total_monto)}</h4>
                            <small class="text-success">Pagado: ${formatCurrency(cat.total_pagado)}</small><br>
                            <small class="text-warning">Pendiente: ${formatCurrency(cat.total_pendiente)}</small>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });

        // Card de total
        const totalCard = `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card h-100 bg-primary text-white">
                    <div class="card-body">
                        <h6 class="mb-2">TOTAL MENSUAL</h6>
                        <h3 class="mb-0">${formatCurrency(totalGeneral)}</h3>
                        <small>Promedio diario: ${formatCurrency(totalGeneral / 30)}</small>
                    </div>
                </div>
            </div>
        `;
        container.append(totalCard);
    }

    // Cambiar mes/año
    $('#select-mes, #select-anio').change(function() {
        mesActual = parseInt($('#select-mes').val());
        anioActual = parseInt($('#select-anio').val());
        cargarGastosMes(mesActual, anioActual);
    });

    // Generar gastos desde plantillas
    $('#btn-generar-mes, #tabla-gastos').on('click', '#btn-generar-desde-vacio', function() {
        Swal.fire({
            title: '¿Generar gastos del mes?',
            text: `Se crearán los gastos fijos para ${mesActual}/${anioActual} desde las plantillas`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, generar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '../controller/gastos_fijos.php?op=generar_mes',
                    type: 'POST',
                    data: { mes: mesActual, anio: anioActual },
                    dataType: 'json',
                    success: function(response) {
                        if (response.status === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Generado!',
                                text: response.message,
                                timer: 2000,
                                showConfirmButton: false
                            }).then(() => {
                                cargarGastosMes(mesActual, anioActual);
                            });
                        } else {
                            Swal.fire('Información', response.message, 'info');
                        }
                    },
                    error: function() {
                        Swal.fire('Error', 'Error de conexión', 'error');
                    }
                });
            }
        });
    });

    // Marcar como pagado
    $(document).on('click', '.btn-marcar-pagado', function() {
        const id = $(this).data('id');

        Swal.fire({
            title: 'Marcar como pagado',
            html: `
                <input type="date" id="swal-fecha" class="swal2-input" value="${new Date().toISOString().split('T')[0]}">
                <select id="swal-metodo" class="swal2-input">
                    <option value="transferencia">Transferencia</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Marcar pagado',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    fecha: document.getElementById('swal-fecha').value,
                    metodo: document.getElementById('swal-metodo').value
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '../controller/gastos_fijos.php?op=marcar_pagado',
                    type: 'POST',
                    data: {
                        id: id,
                        fecha_pago: result.value.fecha,
                        metodo_pago: result.value.metodo
                    },
                    dataType: 'json',
                    success: function(response) {
                        if (response.status === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Pagado!',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => {
                                cargarGastosMes(mesActual, anioActual);
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

    // Editar gasto
    $(document).on('click', '.btn-editar-gasto', function() {
        const btn = $(this);
        $('#gasto-id').val(btn.data('id'));
        $('#gasto-concepto').val(btn.data('concepto')).prop('disabled', true);
        $('#gasto-monto').val(btn.data('monto'));
        $('#gasto-fecha').val(btn.data('fecha'));
        $('#gasto-metodo').val(btn.data('metodo'));
        $('#gasto-notas').val(btn.data('notas'));
        $('#gasto-estatus').val(btn.data('estatus'));
        $('#modalEditarGasto').modal('show');
    });

    // Guardar edición de gasto
    $('#form-editar-gasto').submit(function(e) {
        e.preventDefault();

        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

        $.ajax({
            url: '../controller/gastos_fijos.php?op=actualizar_gasto',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Actualizado!',
                        text: response.message,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        $('#modalEditarGasto').modal('hide');
                        cargarGastosMes(mesActual, anioActual);
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'Error de conexión', 'error');
            },
            complete: function() {
                btnSubmit.prop('disabled', false).html('<i class="fas fa-save"></i> Guardar Cambios');
            }
        });
    });

    // Eliminar gasto
    $(document).on('click', '.btn-eliminar-gasto', function() {
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
                    url: '../controller/gastos_fijos.php?op=eliminar_gasto',
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
                                cargarGastosMes(mesActual, anioActual);
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

    // ========================================
    // FUNCIONES AUXILIARES
    // ========================================

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    }

    function getBadgeCategoria(categoria) {
        const badges = {
            'Renta': '<span class="badge bg-primary">Renta</span>',
            'Sueldos': '<span class="badge bg-success">Sueldos</span>',
            'Servicios': '<span class="badge bg-warning">Servicios</span>',
            'Otro': '<span class="badge bg-secondary">Otro</span>'
        };
        return badges[categoria] || badges['Otro'];
    }

    function getBadgeEstatus(estatus) {
        const badges = {
            'pagado': '<span class="badge bg-success">Pagado</span>',
            'pendiente': '<span class="badge bg-warning">Pendiente</span>',
            'cancelado': '<span class="badge bg-danger">Cancelado</span>'
        };
        return badges[estatus] || badges['pendiente'];
    }
});