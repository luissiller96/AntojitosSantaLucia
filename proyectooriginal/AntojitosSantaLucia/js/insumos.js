$(document).ready(function() {
    // ========================================
    // INICIALIZACIÓN DATATABLE INSUMOS
    // ========================================
let tablaInsumos;
    
    if ($('#tabla-insumos').length) {
        tablaInsumos = $('#tabla-insumos').DataTable({
            responsive: true,
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Todos"]],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            order: [[1, 'asc']],
            columnDefs: [
                { targets: -1, orderable: false }
            ]
        });
    }

    function escapeHtml(text = '') {
        return $('<div>').text(text).html();
    }

    function escapeAttr(text = '') {
        return escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function getBadgeStock(insumo) {
        const stock = parseFloat(insumo.stock_actual) || 0;
        const minimo = parseFloat(insumo.stock_minimo) || 0;
        let badgeClass = 'bg-success';
        let label = stock;

        if (stock === 0) {
            badgeClass = 'bg-danger';
        } else if (stock <= minimo * 0.5) {
            badgeClass = 'bg-danger';
            label = `<i class="fas fa-exclamation-triangle"></i> ${stock}`;
        } else if (stock <= minimo) {
            badgeClass = 'bg-warning';
        }

        return `<span class="badge ${badgeClass}">${label}</span>`;
    }

    function buildInsumoRow(insumo) {
        const nombre = escapeHtml(insumo.nombre || '');
        const descripcion = escapeHtml(insumo.descripcion || '');
        const unidad = escapeHtml(insumo.unidad_medida || '');
        const stockBadge = getBadgeStock(insumo);
        const stockMin = parseFloat(insumo.stock_minimo) || 0;
        const costo = `$${(parseFloat(insumo.costo_unitario) || 0).toFixed(2)}`;

        const dataAttrs = `
            data-id="${insumo.id}"
            data-nombre="${escapeAttr(insumo.nombre || '')}"
            data-descripcion="${escapeAttr(insumo.descripcion || '')}"
            data-unidad="${escapeAttr(insumo.unidad_medida || '')}"
            data-stock-minimo="${stockMin}"
            data-costo="${parseFloat(insumo.costo_unitario) || 0}"
            data-estatus="${insumo.estatus}"
        `;

        const acciones = `
            <button class="btn btn-sm btn-success btn-entrada-insumo" data-id="${insumo.id}" data-nombre="${escapeAttr(insumo.nombre || '')}" title="Registrar entrada">
                <i class="fas fa-plus"></i>
            </button>
            <button class="btn btn-sm btn-info btn-editar-insumo" ${dataAttrs} title="Editar insumo">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-eliminar-insumo" data-id="${insumo.id}" title="Eliminar insumo">
                <i class="fas fa-trash"></i>
            </button>
        `;

        return [
            insumo.id,
            `<strong>${nombre}</strong>`,
            descripcion,
            `<span class="badge bg-secondary">${unidad}</span>`,
            stockBadge,
            stockMin,
            costo,
            acciones
        ];
    }

    function refreshInsumosTable() {
        if (!tablaInsumos) {
            return;
        }
        $.ajax({
            url: '../controller/insumos.php?op=listar',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (!Array.isArray(data)) data = [];
                tablaInsumos.clear();
                data.forEach((insumo) => {
                    tablaInsumos.row.add(buildInsumoRow(insumo));
                });
                tablaInsumos.draw(false);
            },
            error: function () {
                console.error('Error al recargar la tabla de insumos');
            }
        });
    }

    // ========================================
    // FORMULARIO NUEVO INSUMO
    // ========================================
    
    $('#form-nuevo-insumo').submit(function(e) {
        e.preventDefault();

        const nombre = $.trim($('#nuevo-insumo-nombre').val());
        const unidad = $('#nuevo-insumo-unidad').val();
        const stockActual = parseFloat($('#nuevo-insumo-stock').val()) || 0;
        const stockMinimo = parseFloat($('#nuevo-insumo-minimo').val()) || 0;
        const costoUnitario = parseFloat($('#nuevo-insumo-costo').val()) || 0;

        if (!nombre || !unidad) {
            Swal.fire('Datos incompletos', 'Ingresa nombre y unidad de medida.', 'warning');
            return;
        }

        if (stockActual < 0 || stockMinimo < 0 || costoUnitario < 0) {
            Swal.fire('Dato inválido', 'Los valores numéricos deben ser mayores o iguales a cero.', 'warning');
            return;
        }

        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

        $.ajax({
            url: '../controller/insumos.php?op=guardaryeditar',
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
                        $('#modalNuevoInsumo').modal('hide');
                        refreshInsumosTable();
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            },
            complete: function() {
                btnSubmit.prop('disabled', false).html('<i class="fas fa-save"></i> Guardar Insumo');
            }
        });
    });

    $('#modalNuevoInsumo').on('shown.bs.modal', function () {
        $('#nuevo-insumo-nombre').trigger('focus');
    });

    // ========================================
    // EDITAR INSUMO
    // ========================================
    
    $(document).on('click', '.btn-editar-insumo', function() {
        const btn = $(this);
        
        $('#edit-insumo-id').val(btn.data('id'));
        $('#edit-insumo-nombre').val(btn.data('nombre'));
        $('#edit-insumo-descripcion').val(btn.data('descripcion'));
        $('#edit-insumo-unidad').val(btn.data('unidad'));
        $('#edit-insumo-minimo').val(btn.data('stock-minimo'));
        $('#edit-insumo-costo').val(btn.data('costo'));
        $('#edit-insumo-estatus').val(btn.data('estatus'));
        
        $('#modalEditarInsumo').modal('show');
    });

    $('#form-editar-insumo').submit(function(e) {
        e.preventDefault();
        
        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');
        
        $.ajax({
            url: '../controller/insumos.php?op=guardaryeditar',
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
                        $('#modalEditarInsumo').modal('hide');
                        refreshInsumosTable();
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            },
            complete: function() {
                btnSubmit.prop('disabled', false).html('<i class="fas fa-save"></i> Guardar Cambios');
            }
        });
    });

    // ========================================
    // ELIMINAR INSUMO
    // ========================================
    
    $(document).on('click', '.btn-eliminar-insumo', function() {
        const id = $(this).data('id');
        eliminarInsumo(id);
    });

    $('#btn-eliminar-insumo-modal').click(function() {
        const id = $('#edit-insumo-id').val();
        $('#modalEditarInsumo').modal('hide');
        eliminarInsumo(id);
    });

    function eliminarInsumo(id) {
        Swal.fire({
            title: '¿Estás seguro?',
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
                    url: '../controller/insumos.php?op=eliminar',
                    type: 'POST',
                    data: { id: id },
                    dataType: 'json',
                    success: function(response) {
                        if (response.status === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                text: 'El insumo ha sido eliminado',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => {
                                refreshInsumosTable();
                            });
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function() {
                        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
                    }
                });
            }
        });
    }

    // ========================================
    // ENTRADA DE STOCK
    // ========================================
    
    $(document).on('click', '.btn-entrada-insumo', function() {
        const btn = $(this);
        $('#entrada-insumo-id').val(btn.data('id'));
        $('#entrada-insumo-nombre').val(btn.data('nombre'));
        $('#modalEntradaStock').modal('show');
    });

    $('#form-entrada-stock').submit(function(e) {
        e.preventDefault();
        
        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Registrando...');
        
        $.ajax({
            url: '../controller/insumos.php?op=registrar_entrada',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Entrada registrada!',
                        text: response.message,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        $('#modalEntradaStock').modal('hide');
                        refreshInsumosTable();
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function() {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            },
            complete: function() {
                btnSubmit.prop('disabled', false).html('<i class="fas fa-check"></i> Registrar Entrada');
            }
        });
    });

    // ========================================
    // LIMPIAR FORMULARIOS AL CERRAR MODALES
    // ========================================
    
    $('#modalNuevoInsumo').on('hidden.bs.modal', function() {
        $('#form-nuevo-insumo')[0].reset();
    });

    $('#modalEntradaStock').on('hidden.bs.modal', function() {
        $('#form-entrada-stock')[0].reset();
    });
});
