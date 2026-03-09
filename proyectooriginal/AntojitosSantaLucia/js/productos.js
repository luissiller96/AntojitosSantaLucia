// ========================================
// GESTIÃ"N DE INSUMOS EN PRODUCTOS
// (MOVER AL INICIO - FUERA DEL DOCUMENT READY)
// ========================================

// Arrays globales para guardar insumos Y COMPONENTES temporalmente
let insumosProductoNuevo = [];
let insumosProductoEdit = [];
let todosLosInsumos = [];

// ✅ NUEVO: Arrays para componentes de productos
let componentesProductoNuevo = [];
let componentesProductoEdit = [];
let todosLosProductosParaComponentes = [];


// ✅ AGREGAR ESTA FUNCIÓN AQUÍ (junto con las otras funciones globales)
function cerrarModalInsumos() {
    var modalInsumos = bootstrap.Modal.getInstance(document.getElementById('modalAgregarInsumoProducto'));
    if (modalInsumos) {
        modalInsumos.hide();
    }
}


function seleccionarInsumo(id, nombre, unidad) {
    Swal.fire({
        title: `Cantidad de ${nombre}`,
        html: `
            <div class="mb-3">
                <label class="form-label mb-2">¿Cuántos <strong>${nombre}</strong> necesita este producto?</label>
                <div class="input-group input-group-lg">
                    <button type="button" class="btn btn-outline-secondary" id="swal-restar-cantidad-selector">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" id="swal-cantidad" class="form-control text-center" 
                           placeholder="Cantidad" step="0.01" min="0.01" value="1" inputmode="decimal">
                    <button type="button" class="btn btn-outline-secondary" id="swal-sumar-cantidad-selector">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <small class="text-muted d-block mt-2">Unidad: ${unidad}. Puedes escribir la cantidad o usar los botones.</small>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn btn-primary btn-lg',
            cancelButton: 'btn btn-secondary btn-lg'
        },
        didOpen: () => {
            const input = document.getElementById('swal-cantidad');
            const btnRestar = document.getElementById('swal-restar-cantidad-selector');
            const btnSumar = document.getElementById('swal-sumar-cantidad-selector');
            const min = parseFloat(input.min) || 0.01;
            const stepChange = 1;

            const formatValue = (value) => {
                return Number.isInteger(value) ? value.toString() : value.toFixed(2);
            };

            const updateValue = (delta) => {
                let actual = parseFloat(input.value);
                if (isNaN(actual)) actual = min;
                actual = Math.max(min, actual + delta);
                input.value = formatValue(actual);
            };

            btnRestar.addEventListener('click', () => updateValue(-stepChange));
            btnSumar.addEventListener('click', () => updateValue(stepChange));
            setTimeout(() => {
                input.focus();
                input.select();
            }, 50);
        },
        preConfirm: () => {
            const cantidad = document.getElementById('swal-cantidad').value;
            if (!cantidad || cantidad <= 0) {
                Swal.showValidationMessage('Por favor ingresa una cantidad válida');
                return false;
            }
            return cantidad;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const cantidad = parseFloat(result.value);
            const tipoModal = $('#tipo-modal-insumo').val();

            agregarInsumoALista(id, nombre, unidad, cantidad, tipoModal);

            // Cerrar el modal de insumos correctamente
            cerrarModalInsumos();

            Swal.fire({
                icon: 'success',
                title: 'Insumo agregado',
                text: `${cantidad} ${unidad} de ${nombre}`,
                timer: 1500,
                showConfirmButton: false
            });
        }
    });

    setTimeout(() => {
        const input = document.getElementById('swal-cantidad');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
}

function agregarInsumoALista(id, nombre, unidad, cantidad, tipo) {
    const insumo = {
        insumo_id: id,
        nombre: nombre,
        unidad_medida: unidad,
        cantidad_necesaria: cantidad
    };

    if (tipo === 'nuevo') {
        const existe = insumosProductoNuevo.find(i => i.insumo_id === id);
        if (existe) {
            Swal.fire('Atención', 'Este insumo ya fue agregado', 'warning');
            return;
        }
        insumosProductoNuevo.push(insumo);
        renderizarInsumosNuevo();
    } else {
        const existe = insumosProductoEdit.find(i => i.insumo_id === id);
        if (existe) {
            Swal.fire('Atención', 'Este insumo ya fue agregado', 'warning');
            return;
        }
        insumosProductoEdit.push(insumo);
        renderizarInsumosEdit();
    }
}

function renderizarInsumosNuevo() {
    const contenedor = $('#contenedor-insumos-nuevo');

    if (insumosProductoNuevo.length === 0) {
        contenedor.html('<p class="text-muted text-center mb-0">No hay insumos agregados</p>');
        return;
    }

    let html = '<div class="row g-2">';
    insumosProductoNuevo.forEach((insumo, index) => {
        html += crearCardInsumo(insumo, index, 'nuevo');
    });
    html += '</div>';

    contenedor.html(html);
}

function renderizarInsumosEdit() {
    const contenedor = $('#contenedor-insumos-edit');

    if (insumosProductoEdit.length === 0) {
        contenedor.html('<p class="text-muted text-center mb-0">No hay insumos agregados</p>');
        return;
    }

    let html = '<div class="row g-2">';
    insumosProductoEdit.forEach((insumo, index) => {
        html += crearCardInsumo(insumo, index, 'edit');
    });
    html += '</div>';

    contenedor.html(html);
}

function crearCardInsumo(insumo, index, tipo) {
    return `
        <div class="col-12">
            <div class="card border-primary" style="transition: all 0.3s;">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">
                                <i class="fas fa-box text-primary"></i> 
                                <strong>${insumo.nombre}</strong>
                            </h6>
                            <div class="d-flex gap-3 align-items-center">
                                <span class="badge bg-primary">${insumo.cantidad_necesaria} ${insumo.unidad_medida}</span>
                                <button type="button" class="btn btn-sm btn-outline-primary btn-editar-cantidad-insumo" 
                                        data-index="${index}" data-tipo="${tipo}">
                                    <i class="fas fa-edit"></i> Cambiar cantidad
                                </button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-danger btn-eliminar-insumo-lista" 
                                data-index="${index}" data-tipo="${tipo}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function mostrarGridInsumos(filtro = '') {
    let html = '<div class="row g-3">';

    const insumosFiltrados = todosLosInsumos.filter(insumo =>
        insumo.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        (insumo.descripcion && insumo.descripcion.toLowerCase().includes(filtro.toLowerCase()))
    );

    if (insumosFiltrados.length === 0) {
        html = '<p class="text-muted text-center">No se encontraron insumos</p>';
    } else {
        insumosFiltrados.forEach(insumo => {
            html += `
                <div class="col-md-6">
                    <div class="card h-100 shadow-sm hover-card" style="cursor: pointer; transition: all 0.3s;" onclick="seleccionarInsumo(${insumo.id}, '${insumo.nombre.replace(/'/g, "\\'")}', '${insumo.unidad_medida}')">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-title mb-1"><i class="fas fa-box text-primary"></i> ${insumo.nombre}</h6>
                                    <p class="card-text text-muted small mb-2">${insumo.descripcion || 'Sin descripción'}</p>
                                    <span class="badge bg-secondary">${insumo.unidad_medida}</span>
                                    <span class="badge ${insumo.stock_actual > insumo.stock_minimo ? 'bg-success' : 'bg-warning'}">
                                        Stock: ${insumo.stock_actual}
                                    </span>
                                </div>
                                <i class="fas fa-plus-circle text-primary fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    $('#grid-insumos-disponibles').html(html);
}

function cargarInsumosDisponibles() {
    $.ajax({
        url: '../controller/insumos.php?op=listar',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            todosLosInsumos = Array.isArray(data) ? data : [];
            console.log('Insumos cargados:', todosLosInsumos.length);
            mostrarGridInsumos();
        },
        error: function () {
            console.error('Error al cargar insumos');
            todosLosInsumos = [];
        }
    });
}

function cargarInsumosProducto(productoId) {
    $.ajax({
        url: '../controller/productos.php?op=obtener_insumos',
        type: 'POST',
        data: { producto_id: productoId },
        dataType: 'json',
        success: function (response) {
            if (response.status === 'success') {
                insumosProductoEdit = response.insumos || [];
                renderizarInsumosEdit();
            } else {
                insumosProductoEdit = [];
                renderizarInsumosEdit();
            }
        },
        error: function () {
            console.error('Error al cargar insumos del producto');
            insumosProductoEdit = [];
            renderizarInsumosEdit();
        }
    });
}

// ========================================
// DOCUMENT READY
// ========================================

$(document).ready(function () {
    // Cargar insumos al iniciar
    cargarInsumosDisponibles();
    cargarProductosParaComponentes();

    let tablaProductos;
    let modalIngredientes = null;

    tablaProductos = $('#tabla-productos').DataTable({
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

    function calcularPrecioUtilidad(precioCompra, precioVenta, promocion, prefijo = '') {
        precioCompra = parseFloat(precioCompra) || 0;
        precioVenta = parseFloat(precioVenta) || 0;
        promocion = parseFloat(promocion) || 0;

        const precioFinal = promocion > 0 ? precioVenta * (1 - promocion / 100) : precioVenta;
        const utilidad = precioFinal - precioCompra;

        $(`#${prefijo}info-precio-final`).text(`Precio final: $${precioFinal.toFixed(2)}`);
        $(`#${prefijo}info-utilidad`).text(`Utilidad: $${utilidad.toFixed(2)}`);

        return { precioFinal, utilidad };
    }

    function limpiarFormulario(formId) {
        $(formId)[0].reset();
        $('#info-precio-final').text('Precio final: $0.00');
        $('#info-utilidad').text('Utilidad: $0.00');
        $('#nuevo-stock').prop('disabled', false);
        $('#nuevo-sin-stock').prop('checked', false);
    }

    $('#nuevo-sin-stock').change(function () {
        if ($(this).is(':checked')) {
            $('#nuevo-stock').val('').prop('disabled', true);
        } else {
            $('#nuevo-stock').prop('disabled', false);
        }
    });

    $('#edit-sin-stock').change(function () {
        if ($(this).is(':checked')) {
            $('#edit-stock').val('').prop('disabled', true);
        } else {
            $('#edit-stock').prop('disabled', false);
        }
    });

    $('#nuevo-precio-compra, #nuevo-precio-venta, #nuevo-promocion').on('input', function () {
        const precioCompra = $('#nuevo-precio-compra').val();
        const precioVenta = $('#nuevo-precio-venta').val();
        const promocion = $('#nuevo-promocion').val();
        calcularPrecioUtilidad(precioCompra, precioVenta, promocion);
    });

    $('#edit-precio-compra, #edit-precio-venta, #edit-promocion').on('input', function () {
        const precioCompra = $('#edit-precio-compra').val();
        const precioVenta = $('#edit-precio-venta').val();
        const promocion = $('#edit-promocion').val();
        calcularPrecioUtilidad(precioCompra, precioVenta, promocion, 'edit-');
    });


    // ✅ NUEVO: Botones para abrir modal de componentes
    $('#btn-abrir-selector-componente-nuevo').click(function (e) {
        e.preventDefault();
        $('#tipo-modal-componente').val('nuevo');
        mostrarGridComponentes();

        var modalComponentes = new bootstrap.Modal(document.getElementById('modalAgregarComponenteProducto'));
        modalComponentes.show();
    });

    $('#btn-abrir-selector-componente-edit').click(function (e) {
        e.preventDefault();
        $('#tipo-modal-componente').val('edit');
        mostrarGridComponentes();

        var modalComponentes = new bootstrap.Modal(document.getElementById('modalAgregarComponenteProducto'));
        modalComponentes.show();
    });

    $('#buscar-componente-selector').on('keyup', function () {
        const filtro = $(this).val();
        mostrarGridComponentes(filtro);
    });

    // ✅ NUEVO: Editar cantidad de componente
    $(document).on('click', '.btn-editar-cantidad-componente', function () {
        const index = $(this).data('index');
        const tipo = $(this).data('tipo');
        const componentes = tipo === 'nuevo' ? componentesProductoNuevo : componentesProductoEdit;
        const componente = componentes[index];

        Swal.fire({
            title: `Editar cantidad de ${componente.nombre}`,
            html: `
                <div class="mb-3">
                    <div class="input-group input-group-lg">
                        <button type="button" class="btn btn-outline-secondary" id="swal-restar-cantidad-componente">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" id="swal-nueva-cantidad-componente" class="form-control text-center"
                               value="${componente.cantidad_necesaria}" step="1" min="1" inputmode="numeric">
                        <button type="button" class="btn btn-outline-secondary" id="swal-sumar-cantidad-componente">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <small class="text-muted d-block mt-2">Usa los botones o escribe la cantidad necesaria.</small>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                const input = document.getElementById('swal-nueva-cantidad-componente');
                const btnRestar = document.getElementById('swal-restar-cantidad-componente');
                const btnSumar = document.getElementById('swal-sumar-cantidad-componente');
                const min = parseFloat(input.min) || 1;
                const stepChange = 1;

                const formatValue = (value) => Number.isInteger(value) ? value.toString() : value.toFixed(0);

                const updateValue = (delta) => {
                    let actual = parseFloat(input.value);
                    if (isNaN(actual)) actual = min;
                    actual = Math.max(min, actual + delta);
                    input.value = formatValue(actual);
                };

                btnRestar.addEventListener('click', () => updateValue(-stepChange));
                btnSumar.addEventListener('click', () => updateValue(stepChange));
                setTimeout(() => input.focus(), 50);
            },
            preConfirm: () => {
                const cantidad = document.getElementById('swal-nueva-cantidad-componente').value;
                if (!cantidad || cantidad <= 0) {
                    Swal.showValidationMessage('Por favor ingresa una cantidad válida');
                    return false;
                }
                return cantidad;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                componente.cantidad_necesaria = parseFloat(result.value);

                if (tipo === 'nuevo') {
                    renderizarComponentesNuevo();
                } else {
                    renderizarComponentesEdit();
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Cantidad actualizada',
                    timer: 1000,
                    showConfirmButton: false
                });
            }
        });
    });

    // ✅ NUEVO: Eliminar componente de la lista
    $(document).on('click', '.btn-eliminar-componente-lista', function () {
        const index = $(this).data('index');
        const tipo = $(this).data('tipo');

        if (tipo === 'nuevo') {
            componentesProductoNuevo.splice(index, 1);
            renderizarComponentesNuevo();
        } else {
            componentesProductoEdit.splice(index, 1);
            renderizarComponentesEdit();
        }
    });

    $('#form-nuevo-producto').submit(function (e) {
        e.preventDefault();

        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

        let formData = $(this).serialize();

        // ✅ FIX: Manejar correctamente el stock NULL
        if ($('#nuevo-sin-stock').is(':checked')) {
            // Eliminar pr_stock del formData si existe y agregar explícitamente NULL
            formData = formData.replace(/&?pr_stock=[^&]*/g, '');
            formData += '&pr_stock=NULL';
        }

        formData += '&insumos=' + encodeURIComponent(JSON.stringify(insumosProductoNuevo));
        formData += '&componentes=' + encodeURIComponent(JSON.stringify(componentesProductoNuevo));

        $.ajax({
            url: '../controller/productos.php?op=guardaryeditar',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: response.message,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        $('#modalNuevoProducto').modal('hide');
                        if (typeof window.saveInventarioStateAndReload === 'function') {
                            window.saveInventarioStateAndReload();
                        } else {
                            location.reload();
                        }
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            },
            complete: function () {
                btnSubmit.prop('disabled', false).html('<i class="fas fa-save"></i> Guardar Producto');
            }
        });
    });

    $(document).on('click', '.btn-editar', function () {
        const btn = $(this);
        const productoId = btn.data('id');

        $('#edit-id').val(productoId);
        $('#edit-nombre').val(btn.data('nombre'));
        $('#edit-categoria').val(btn.data('categoria-id'));
        $('#edit-precio-venta').val(btn.data('preciooriginal'));
        $('#edit-precio-compra').val(btn.data('preciocompra'));
        $('#edit-promocion').val(btn.data('promocion'));
        $('#edit-estatus').val(btn.data('estatus'));
        $('#edit-favorito').val(btn.data('favorito'));

        const stock = btn.data('stock');
        if (stock === null || stock === 'NULL' || stock === '') {
            $('#edit-stock').val('').prop('disabled', true);
            $('#edit-sin-stock').prop('checked', true);
        } else {
            $('#edit-stock').val(stock).prop('disabled', false);
            $('#edit-sin-stock').prop('checked', false);
        }

        calcularPrecioUtilidad(
            btn.data('preciocompra'),
            btn.data('preciooriginal'),
            btn.data('promocion'),
            'edit-'
        );
        cargarInsumosProducto(productoId);
        cargarComponentesProducto(productoId); // ✅ NUEVO

        $('#modalEditarProducto').modal('show');
    });

    $('#form-editar-producto').submit(function (e) {
        e.preventDefault();

        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Guardando...');

        let formData = $(this).serialize();

        // ✅ FIX: Manejar correctamente el stock NULL
        if ($('#edit-sin-stock').is(':checked')) {
            // Eliminar pr_stock del formData si existe y agregar explícitamente NULL
            formData = formData.replace(/&?pr_stock=[^&]*/g, '');
            formData += '&pr_stock=NULL';
        }

        formData += '&insumos=' + encodeURIComponent(JSON.stringify(insumosProductoEdit));
        formData += '&componentes=' + encodeURIComponent(JSON.stringify(componentesProductoEdit));

        $.ajax({
            url: '../controller/productos.php?op=guardaryeditar',
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Actualizado!',
                        text: response.message,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        $('#modalEditarProducto').modal('hide');
                        if (typeof window.saveInventarioStateAndReload === 'function') {
                            window.saveInventarioStateAndReload();
                        } else {
                            location.reload();
                        }
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            },
            complete: function () {
                btnSubmit.prop('disabled', false).html('<i class="fas fa-save"></i> Guardar Cambios');
            }
        });
    });

    // Resto del código de eliminación, categorías, filtros, etc...
    // (El código que ya tenías sigue igual)

    const $btnNuevoInsumo = $('#btn-nuevo-insumo-directo');
    if ($btnNuevoInsumo.length) {
        $btnNuevoInsumo.on('click', function (e) {
            e.preventDefault();
            if ($('#form-nuevo-insumo').length) {
                $('#form-nuevo-insumo')[0].reset();
            }
            $('#modalNuevoInsumo').modal('show');
            setTimeout(() => $('#nuevo-insumo-nombre').trigger('focus'), 200);
        });
    }

    function abrirSelectorInsumos(tipo) {
        $('#tipo-modal-insumo').val(tipo);
        $('#buscar-insumo-selector').val('');
        $('#grid-insumos-disponibles').html('<p class="text-center text-muted py-3"><i class="fas fa-spinner fa-spin"></i> Cargando insumos...</p>');

        var modalInsumos = new bootstrap.Modal(document.getElementById('modalAgregarInsumoProducto'));
        modalInsumos.show();

        $.ajax({
            url: '../controller/insumos.php?op=listar',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                todosLosInsumos = Array.isArray(data) ? data : [];
                mostrarGridInsumos();
            },
            error: function () {
                $('#grid-insumos-disponibles').html('<p class="text-center text-danger"><i class="fas fa-exclamation-triangle"></i> Error al cargar insumos</p>');
            }
        });
    }

    $('#btn-abrir-selector-nuevo').click(function (e) {
        e.preventDefault();
        abrirSelectorInsumos('nuevo');
    });

    $('#btn-abrir-selector-edit').click(function (e) {
        e.preventDefault();
        abrirSelectorInsumos('edit');
    });


    $(document).on('click', '.btn-ver-ingredientes', function () {
        const productoId = $(this).data('id');
        const nombreProducto = $(this).data('nombre') || 'Producto';
        const nombreSeguro = $('<div>').text(nombreProducto).html();

        if (!modalIngredientes) {
            modalIngredientes = new bootstrap.Modal(document.getElementById('modalVerIngredientes'));
        }

        $('#modalIngredientesTitulo').html(`<i class="fas fa-carrot text-warning"></i> Ingredientes de ${nombreSeguro}`);
        $('#lista-ingredientes-modal').html('<p class="text-muted mb-0"><i class="fas fa-spinner fa-spin me-2"></i>Cargando ingredientes...</p>');
        modalIngredientes.show();

        $.ajax({
            url: '../controller/productos.php?op=obtener_insumos',
            type: 'POST',
            data: { producto_id: productoId },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success' && Array.isArray(response.insumos) && response.insumos.length > 0) {
                    const lista = response.insumos.map((insumo) => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span><i class="fas fa-leaf text-success me-2"></i> ${insumo.nombre}</span>
                            <span class="badge bg-primary">${parseFloat(insumo.cantidad_necesaria).toFixed(2)} ${insumo.unidad_medida}</span>
                        </li>`).join('');
                    $('#lista-ingredientes-modal').html(`<ul class="list-group">${lista}</ul>`);
                } else {
                    $('#lista-ingredientes-modal').html('<p class="text-muted text-center mb-0">Este producto no tiene ingredientes vinculados.</p>');
                }
            },
            error: function () {
                $('#lista-ingredientes-modal').html('<p class="text-danger text-center mb-0">No se pudieron cargar los ingredientes.</p>');
            }
        });
    });


    // ✅ Limpiar componentes al cerrar modales
    $('#modalNuevoProducto').on('hidden.bs.modal', function () {
        insumosProductoNuevo = [];
        componentesProductoNuevo = []; // ✅ NUEVO
        renderizarInsumosNuevo();
        renderizarComponentesNuevo(); // ✅ NUEVO
        limpiarFormulario('#form-nuevo-producto');
    });

    $('#modalEditarProducto').on('hidden.bs.modal', function () {
        insumosProductoEdit = [];
        componentesProductoEdit = []; // ✅ NUEVO
        renderizarInsumosEdit();
        renderizarComponentesEdit(); // ✅ NUEVO
    });


    $('#buscar-insumo-selector').on('keyup', function () {
        const filtro = $(this).val();
        mostrarGridInsumos(filtro);
    });


    $(document).on('click', '.btn-editar-cantidad-insumo', function () {
        const index = $(this).data('index');
        const tipo = $(this).data('tipo');
        const insumos = tipo === 'nuevo' ? insumosProductoNuevo : insumosProductoEdit;
        const insumo = insumos[index];

        Swal.fire({
            title: `Editar cantidad de ${insumo.nombre}`,
            html: `
                <div class="mb-3">
                    <div class="input-group input-group-lg">
                        <button type="button" class="btn btn-outline-secondary" id="swal-restar-cantidad">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" id="swal-nueva-cantidad" class="form-control text-center" 
                               value="${insumo.cantidad_necesaria}" step="0.01" min="0.01" inputmode="decimal">
                        <button type="button" class="btn btn-outline-secondary" id="swal-sumar-cantidad">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <small class="text-muted d-block mt-2">Unidad: ${insumo.unidad_medida}. Puedes escribir la cantidad o usar los botones.</small>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Actualizar',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                const input = document.getElementById('swal-nueva-cantidad');
                const btnRestar = document.getElementById('swal-restar-cantidad');
                const btnSumar = document.getElementById('swal-sumar-cantidad');
                const stepChange = 1;
                const min = parseFloat(input.min) || 0.01;

                const formatValue = (value) => {
                    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
                };

                const updateValue = (delta) => {
                    let actual = parseFloat(input.value);
                    if (isNaN(actual)) actual = min;
                    actual = Math.max(min, actual + delta);
                    input.value = formatValue(actual);
                };

                btnRestar.addEventListener('click', () => updateValue(-stepChange));
                btnSumar.addEventListener('click', () => updateValue(stepChange));
                setTimeout(() => input.focus(), 50);
            },
            preConfirm: () => {
                const cantidad = document.getElementById('swal-nueva-cantidad').value;
                if (!cantidad || cantidad <= 0) {
                    Swal.showValidationMessage('Por favor ingresa una cantidad válida');
                    return false;
                }
                return cantidad;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                insumo.cantidad_necesaria = parseFloat(result.value);

                if (tipo === 'nuevo') {
                    renderizarInsumosNuevo();
                } else {
                    renderizarInsumosEdit();
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Cantidad actualizada',
                    timer: 1000,
                    showConfirmButton: false
                });
            }
        });

        setTimeout(() => {
            const input = document.getElementById('swal-nueva-cantidad');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    });

    $(document).on('click', '.btn-eliminar-insumo-lista', function () {
        const index = $(this).data('index');
        const tipo = $(this).data('tipo');

        if (tipo === 'nuevo') {
            insumosProductoNuevo.splice(index, 1);
            renderizarInsumosNuevo();
        } else {
            insumosProductoEdit.splice(index, 1);
            renderizarInsumosEdit();
        }
    });

    $('#modalNuevoProducto').on('hidden.bs.modal', function () {
        insumosProductoNuevo = [];
        renderizarInsumosNuevo();
        limpiarFormulario('#form-nuevo-producto');
    });

    $('#modalEditarProducto').on('hidden.bs.modal', function () {
        insumosProductoEdit = [];
        renderizarInsumosEdit();
    });

    $('#modalAgregarInsumoProducto').on('hidden.bs.modal', function () {
        $('#buscar-insumo-selector').val('');
        mostrarGridInsumos();
    });

    // ========================================
    // ELIMINAR PRODUCTO
    // ========================================

    $(document).on('click', '.btn-eliminar', function () {
        const id = $(this).data('id');

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
                eliminarProducto(id);
            }
        });
    });

    $('#btn-eliminar-modal').click(function () {
        const id = $('#edit-id').val();

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
                $('#modalEditarProducto').modal('hide');
                eliminarProducto(id);
            }
        });
    });

    function eliminarProducto(id) {
        $.ajax({
            url: '../controller/productos.php?op=eliminar',
            type: 'POST',
            data: { id: id },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El producto ha sido eliminado',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        if (typeof window.saveInventarioStateAndReload === 'function') {
                            window.saveInventarioStateAndReload();
                        } else {
                            location.reload();
                        }
                    });
                } else {
                    Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            }
        });
    }

    // ========================================
    // GESTIÓN DE CATEGORÍAS
    // ========================================

    $('#form-nueva-categoria').submit(function (e) {
        e.preventDefault();

        const btnSubmit = $(this).find('button[type="submit"]');
        btnSubmit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');

        $.ajax({
            url: '../controller/categoria.php?op=guardar',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    const nuevaFila = `
                        <tr>
                            <td>${response.nombre}</td>
                            <td>
                                <button class="btn btn-sm btn-danger btn-eliminar-categoria" data-id="${response.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    $('#tabla-categorias').append(nuevaFila);
                    $('#form-nueva-categoria')[0].reset();

                    Swal.fire({
                        icon: 'success',
                        title: 'Categoría agregada',
                        timer: 1000,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
            },
            complete: function () {
                btnSubmit.prop('disabled', false).html('<i class="fas fa-plus"></i> Agregar');
            }
        });
    });

    $(document).on('click', '.btn-eliminar-categoria', function () {
        const id = $(this).data('id');
        const fila = $(this).closest('tr');

        Swal.fire({
            title: '¿Eliminar categoría?',
            text: 'Los productos de esta categoría quedarán sin categoría',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '../controller/categoria.php?op=eliminar',
                    type: 'POST',
                    data: { id: id },
                    dataType: 'json',
                    success: function (response) {
                        if (response.status === 'success') {
                            fila.fadeOut(300, function () {
                                $(this).remove();
                            });
                            Swal.fire({
                                icon: 'success',
                                title: 'Categoría eliminada',
                                timer: 1000,
                                showConfirmButton: false
                            });
                        }
                    }
                });
            }
        });
    });

    // ========================================
    // FILTROS Y BÚSQUEDA
    // ========================================

    $('#buscar-producto').on('keyup', function () {
        tablaProductos.search($(this).val()).draw();
    });

    $('#filtro-categoria').change(function () {
        const categoria = $(this).val();
        if (categoria) {
            tablaProductos.column(2).search(categoria).draw();
        } else {
            tablaProductos.column(2).search('').draw();
        }
    });

    $('#filtro-estado').change(function () {
        const estado = $(this).val();
        if (estado === '1') {
            tablaProductos.column(6).search('Activo').draw();
        } else if (estado === '0') {
            tablaProductos.column(6).search('Inactivo').draw();
        } else {
            tablaProductos.column(6).search('').draw();
        }
    });

    $('#btn-limpiar-filtros').click(function () {
        $('#buscar-producto').val('');
        $('#filtro-categoria').val('');
        $('#filtro-estado').val('');
        tablaProductos.search('').columns().search('').draw();
    });



});

// ========================================
// GESTIÓN DE COMPONENTES DE PRODUCTOS
// ========================================

function cerrarModalComponentes() {
    var modalComponentes = bootstrap.Modal.getInstance(document.getElementById('modalAgregarComponenteProducto'));
    if (modalComponentes) {
        modalComponentes.hide();
    }
}

function seleccionarComponente(id, nombre, stock, precio) {
    Swal.fire({
        title: `Cantidad de ${nombre}`,
        html: `
            <div class="mb-3">
                <label class="form-label mb-2">¿Cuántos <strong>${nombre}</strong> necesita este producto?</label>
                <div class="input-group input-group-lg">
                    <button type="button" class="btn btn-outline-secondary" id="swal-restar-cantidad-selector-componente">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" id="swal-cantidad-componente" class="form-control text-center" 
                           placeholder="Cantidad" step="1" min="1" value="1" inputmode="numeric">
                    <button type="button" class="btn btn-outline-secondary" id="swal-sumar-cantidad-selector-componente">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <small class="text-muted d-block mt-2">Stock disponible: ${stock || 'N/A'} | Precio: $${precio}</small>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        customClass: {
            confirmButton: 'btn btn-primary btn-lg',
            cancelButton: 'btn btn-secondary btn-lg'
        },
        didOpen: () => {
            const input = document.getElementById('swal-cantidad-componente');
            const btnRestar = document.getElementById('swal-restar-cantidad-selector-componente');
            const btnSumar = document.getElementById('swal-sumar-cantidad-selector-componente');
            const min = parseFloat(input.min) || 1;
            const stepChange = 1;

            const formatValue = (value) => Number.isInteger(value) ? value.toString() : value.toFixed(0);

            const updateValue = (delta) => {
                let actual = parseFloat(input.value);
                if (isNaN(actual)) actual = min;
                actual = Math.max(min, actual + delta);
                input.value = formatValue(actual);
            };

            btnRestar.addEventListener('click', () => updateValue(-stepChange));
            btnSumar.addEventListener('click', () => updateValue(stepChange));
            setTimeout(() => {
                input.focus();
                input.select();
            }, 50);
        },
        preConfirm: () => {
            const cantidad = document.getElementById('swal-cantidad-componente').value;
            if (!cantidad || cantidad <= 0) {
                Swal.showValidationMessage('Por favor ingresa una cantidad válida');
                return false;
            }
            return cantidad;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const cantidad = parseFloat(result.value);
            const tipoModal = $('#tipo-modal-componente').val();

            agregarComponenteALista(id, nombre, stock, precio, cantidad, tipoModal);

            cerrarModalComponentes();

            Swal.fire({
                icon: 'success',
                title: 'Componente agregado',
                text: `${cantidad} x ${nombre}`,
                timer: 1500,
                showConfirmButton: false
            });
        }
    });

    setTimeout(() => {
        const input = document.getElementById('swal-cantidad-componente');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
}

function agregarComponenteALista(id, nombre, stock, precio, cantidad, tipo) {
    const componente = {
        producto_id: id,
        nombre: nombre,
        stock: stock,
        precio: precio,
        cantidad_necesaria: cantidad
    };

    if (tipo === 'nuevo') {
        const existe = componentesProductoNuevo.find(c => c.producto_id === id);
        if (existe) {
            Swal.fire('Atención', 'Este componente ya fue agregado', 'warning');
            return;
        }
        componentesProductoNuevo.push(componente);
        renderizarComponentesNuevo();
    } else {
        const existe = componentesProductoEdit.find(c => c.producto_id === id);
        if (existe) {
            Swal.fire('Atención', 'Este componente ya fue agregado', 'warning');
            return;
        }
        componentesProductoEdit.push(componente);
        renderizarComponentesEdit();
    }
}

function renderizarComponentesNuevo() {
    const contenedor = $('#contenedor-componentes-nuevo');

    if (componentesProductoNuevo.length === 0) {
        contenedor.html('<p class="text-muted text-center mb-0">No hay componentes agregados</p>');
        return;
    }

    let html = '<div class="row g-2">';
    componentesProductoNuevo.forEach((componente, index) => {
        html += crearCardComponente(componente, index, 'nuevo');
    });
    html += '</div>';

    contenedor.html(html);
}

function renderizarComponentesEdit() {
    const contenedor = $('#contenedor-componentes-edit');

    if (componentesProductoEdit.length === 0) {
        contenedor.html('<p class="text-muted text-center mb-0">No hay componentes agregados</p>');
        return;
    }

    let html = '<div class="row g-2">';
    componentesProductoEdit.forEach((componente, index) => {
        html += crearCardComponente(componente, index, 'edit');
    });
    html += '</div>';

    contenedor.html(html);
}

function crearCardComponente(componente, index, tipo) {
    return `
        <div class="col-12">
            <div class="card border-success" style="transition: all 0.3s;">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">
                                <i class="fas fa-cubes text-success"></i> 
                                <strong>${componente.nombre}</strong>
                            </h6>
                            <div class="d-flex gap-3 align-items-center">
                                <span class="badge bg-success">${componente.cantidad_necesaria} unidades</span>
                                <small class="text-muted">Stock: ${componente.stock || 'N/A'}</small>
                                <button type="button" class="btn btn-sm btn-outline-success btn-editar-cantidad-componente" 
                                        data-index="${index}" data-tipo="${tipo}">
                                    <i class="fas fa-edit"></i> Cambiar cantidad
                                </button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-danger btn-eliminar-componente-lista" 
                                data-index="${index}" data-tipo="${tipo}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function mostrarGridComponentes(filtro = '') {
    let html = '<div class="row g-3">';

    const productosFiltrados = todosLosProductosParaComponentes.filter(producto =>
        producto.pr_nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    if (productosFiltrados.length === 0) {
        html = '<p class="text-muted text-center">No se encontraron productos</p>';
    } else {
        productosFiltrados.forEach(producto => {
            const stockBadge = producto.pr_stock !== null
                ? `<span class="badge ${producto.pr_stock > 10 ? 'bg-success' : 'bg-warning'}">Stock: ${producto.pr_stock}</span>`
                : '<span class="badge bg-info">Sin stock</span>';

            html += `
                <div class="col-md-6">
                    <div class="card h-100 shadow-sm hover-card" style="cursor: pointer; transition: all 0.3s;" 
                         onclick="seleccionarComponente(${producto.producto_id}, '${producto.pr_nombre.replace(/'/g, "\\'")}', ${producto.pr_stock}, ${producto.pr_precioventa})">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="card-title mb-1"><i class="fas fa-cubes text-success"></i> ${producto.pr_nombre}</h6>
                                    ${stockBadge}
                                    <span class="badge bg-secondary">$${producto.pr_precioventa}</span>
                                </div>
                                <i class="fas fa-plus-circle text-success fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    $('#grid-componentes-disponibles').html(html);
}

function cargarProductosParaComponentes() {
    $.ajax({
        url: '../controller/productos.php?op=obtener_productos_para_componentes',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.status === 'success') {
                todosLosProductosParaComponentes = response.productos;
                console.log('Productos para componentes cargados:', todosLosProductosParaComponentes.length);
            }
        },
        error: function () {
            console.error('Error al cargar productos para componentes');
            Swal.fire('Error', 'No se pudieron cargar los productos disponibles', 'error');
        }
    });
}

function cargarComponentesProducto(productoId) {
    $.ajax({
        url: '../controller/productos.php?op=obtener_componentes',
        type: 'POST',
        data: { producto_id: productoId },
        dataType: 'json',
        success: function (response) {
            if (response.status === 'success') {
                componentesProductoEdit = response.componentes.map(c => ({
                    producto_id: c.producto_componente_id,
                    nombre: c.pr_nombre,
                    stock: c.pr_stock,
                    precio: c.pr_precioventa,
                    cantidad_necesaria: c.cantidad_necesaria
                }));
                renderizarComponentesEdit();
            } else {
                componentesProductoEdit = [];
                renderizarComponentesEdit();
            }
        },
        error: function () {
            console.error('Error al cargar componentes del producto');
            componentesProductoEdit = [];
            renderizarComponentesEdit();
        }
    });
}
