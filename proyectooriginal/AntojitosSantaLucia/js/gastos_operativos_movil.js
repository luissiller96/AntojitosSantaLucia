$(document).ready(function() {
    // ========================================
    // VARIABLES GLOBALES
    // ========================================
    let metodoSeleccionado = 'efectivo';

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    cargarProductos();

    // ========================================
    // EVENTOS DE BOTONES DE PAGO
    // ========================================

    $('.btn-payment').click(function() {
        $('.btn-payment').removeClass('active');
        $(this).addClass('active');
        metodoSeleccionado = $(this).data('method');
        $('#m-metodo').val(metodoSeleccionado);
    });

    // ========================================
    // MOSTRAR/OCULTAR SECCIONES
    // ========================================

    // Expandir comentarios
    $('#btn-expand-comentarios').click(function() {
        const icon = $(this).find('i');
        const text = $(this);
        
        if ($('#comentarios-section').hasClass('d-none')) {
            $('#comentarios-section').removeClass('d-none');
            icon.removeClass('fa-comment').addClass('fa-chevron-up');
            text.html('<i class="fas fa-chevron-up"></i> Ocultar comentario');
        } else {
            $('#comentarios-section').addClass('d-none');
            icon.removeClass('fa-chevron-up').addClass('fa-comment');
            text.html('<i class="fas fa-comment"></i> Agregar comentario');
        }
    });

    // Mostrar campo de cantidad si se selecciona producto
    $('#m-producto').change(function() {
        if ($(this).val()) {
            $('#campo-cantidad-mobile').removeClass('d-none');
            $('#m-cantidad-producto').attr('required', true);
        } else {
            $('#campo-cantidad-mobile').addClass('d-none');
            $('#m-cantidad-producto').attr('required', false).val('');
        }
    });

    // ========================================
    // CARGAR PRODUCTOS
    // ========================================

    function cargarProductos() {
        $.ajax({
            url: '../controller/gastos_operativos.php?op=listar_productos',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    const select = $('#m-producto');
                    select.empty();
                    select.append('<option value="">-- Sin producto --</option>');
                    
                    response.data.forEach(producto => {
                        select.append(`
                            <option value="${producto.ID}">
                                ${producto.pr_nombre} (Stock: ${producto.pr_stock || 0})
                            </option>
                        `);
                    });
                }
            },
            error: function() {
                console.error('Error al cargar productos');
            }
        });
    }

    // ========================================
    // ENVIAR FORMULARIO
    // ========================================

    $('#form-gasto-movil').submit(function(e) {
        e.preventDefault();

        const btnGuardar = $('#btn-guardar');
        
        // Validaciones
        const descripcion = $('#m-descripcion').val().trim();
        const monto = parseFloat($('#m-monto').val());

        if (!descripcion) {
            mostrarAlerta('Por favor ingresa una descripción', 'warning');
            return;
        }

        if (!monto || monto <= 0) {
            mostrarAlerta('El monto debe ser mayor a cero', 'warning');
            return;
        }

        const productoId = $('#m-producto').val();
        const cantidadProducto = $('#m-cantidad-producto').val();

        if (productoId && (!cantidadProducto || cantidadProducto <= 0)) {
            mostrarAlerta('Especifica la cantidad del producto', 'warning');
            return;
        }

        // Deshabilitar botón
        btnGuardar.addClass('loading');
        btnGuardar.prop('disabled', true);

        // Preparar datos
        const formData = new FormData();
        formData.append('tipo_gasto', 'operativo');
        formData.append('descripcion', descripcion);
        formData.append('fecha', new Date().toISOString().slice(0, 19).replace('T', ' '));
        formData.append('cantidad', 1);
        formData.append('precio_unitario', monto);
        formData.append('metodo_pago', metodoSeleccionado);
        formData.append('comentario', $('#m-comentarios').val().trim());
        
        if (productoId) {
            formData.append('producto_id', productoId);
            formData.append('cantidad_producto', cantidadProducto);
        }

        // Enviar
        $.ajax({
            url: '../controller/gastos_operativos.php?op=guardar',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    // Mostrar toast de éxito
                    const toast = new bootstrap.Toast(document.getElementById('successToast'));
                    toast.show();
                    
                    // Limpiar formulario
                    limpiarFormulario();
                    
                    // Hacer vibración de éxito (si está disponible)
                    if ('vibrate' in navigator) {
                        navigator.vibrate(100);
                    }
                } else {
                    mostrarAlerta(response.message || 'Error al guardar', 'error');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                mostrarAlerta('Error de conexión. Intenta nuevamente', 'error');
            },
            complete: function() {
                btnGuardar.removeClass('loading');
                btnGuardar.prop('disabled', false);
            }
        });
    });

    // ========================================
    // HISTORIAL
    // ========================================

    $('#btn-historial').click(function() {
        cargarHistorial();
        $('#modalHistorial').modal('show');
    });

    function cargarHistorial() {
        const hoy = new Date().toISOString().split('T')[0];
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        const fechaInicio = hace7Dias.toISOString().split('T')[0];

        $.ajax({
            url: `../controller/gastos_operativos.php?op=listar&fecha_inicio=${fechaInicio}&fecha_fin=${hoy}`,
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.status === 'success') {
                    renderHistorial(response.data);
                } else {
                    $('#historial-lista').html(`
                        <div class="empty-state-mobile">
                            <i class="fas fa-inbox"></i>
                            <p>No hay gastos recientes</p>
                        </div>
                    `);
                }
            },
            error: function() {
                $('#historial-lista').html(`
                    <div class="empty-state-mobile">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error al cargar historial</p>
                    </div>
                `);
            }
        });
    }

    function renderHistorial(gastos) {
        const container = $('#historial-lista');
        container.empty();

        if (gastos.length === 0) {
            container.html(`
                <div class="empty-state-mobile">
                    <i class="fas fa-inbox"></i>
                    <p>No hay gastos recientes</p>
                </div>
            `);
            return;
        }

        // Mostrar solo los últimos 10
        const gastosRecientes = gastos.slice(0, 10);

        gastosRecientes.forEach(gasto => {
            const fecha = new Date(gasto.fecha);
            const fechaFormato = fecha.toLocaleDateString('es-MX', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const metodoBadge = getMetodoBadge(gasto.metodo_pago);

            const item = `
                <div class="historial-item">
                    <div class="historial-header">
                        <div class="historial-descripcion">${gasto.descripcion}</div>
                        <div class="historial-monto">${formatCurrency(gasto.total)}</div>
                    </div>
                    <div class="historial-meta">
                        <div class="historial-fecha">
                            <i class="fas fa-clock"></i>
                            ${fechaFormato}
                        </div>
                        ${metodoBadge}
                    </div>
                    ${gasto.producto_nombre ? `
                        <div style="margin-top: 8px; font-size: 0.85rem; color: var(--success);">
                            <i class="fas fa-box"></i> ${gasto.producto_nombre}
                        </div>
                    ` : ''}
                </div>
            `;
            container.append(item);
        });
    }

    // ========================================
    // FUNCIONES AUXILIARES
    // ========================================

    function limpiarFormulario() {
        $('#form-gasto-movil')[0].reset();
        $('#m-metodo').val('efectivo');
        $('.btn-payment').removeClass('active');
        $('.btn-payment[data-method="efectivo"]').addClass('active');
        metodoSeleccionado = 'efectivo';
        
        // Ocultar campos opcionales
        $('#comentarios-section').addClass('d-none');
        $('#campo-cantidad-mobile').addClass('d-none');
        
        // Reset botón de comentarios
        $('#btn-expand-comentarios').html('<i class="fas fa-comment"></i> Agregar comentario');
        
        // Focus en descripción
        $('#m-descripcion').focus();
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    }

    function getMetodoBadge(metodo) {
        const badges = {
            'efectivo': '<span class="badge-metodo badge-efectivo"><i class="fas fa-money-bill"></i> Efectivo</span>',
            'tarjeta': '<span class="badge-metodo badge-tarjeta"><i class="fas fa-credit-card"></i> Tarjeta</span>',
            'transferencia': '<span class="badge-metodo badge-transferencia"><i class="fas fa-exchange-alt"></i> Transfer.</span>'
        };
        return badges[metodo] || badges['efectivo'];
    }

    function mostrarAlerta(mensaje, tipo = 'info') {
        const iconos = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };

        Swal.fire({
            icon: tipo,
            text: mensaje,
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    // ========================================
    // MEJORAS DE UX MÓVIL
    // ========================================

    // Auto-focus en monto al terminar de escribir descripción
    $('#m-descripcion').blur(function() {
        if ($(this).val().trim()) {
            setTimeout(() => {
                $('#m-monto').focus();
            }, 100);
        }
    });

    // Prevenir zoom en inputs en iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        $('input, select, textarea').css('font-size', '16px');
    }

    // Soporte para PWA - Detectar si está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App instalada como PWA');
        // Ocultar botón de back si está en PWA
        $('.btn-back').hide();
    }
});