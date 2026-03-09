$(document).ready(function () {

    let cajaActivaId = null;
    let montoAperturaCaja = 0;
    let totalVentasSistema = 0;

    // ========================================
    // FUNCIONES AUXILIARES
    // ========================================

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    };

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleDateString('es-MX', options).replace(/ /g, '-').replace(/\./g, '');
    };

    function animateValue(id, start, end, duration, isCurrency = false) {
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
                ? formatCurrency(value)
                : value.toLocaleString('es-MX');

            if (value >= end) {
                clearInterval(timer);
                element.textContent = isCurrency
                    ? formatCurrency(end)
                    : end.toLocaleString('es-MX');
            }
        }, stepTime);
    }

    // ========================================
    // CARGAR ESTADO DE CAJA Y RESUMEN
    // ========================================

    function cargarEstadoCaja() {
        $.ajax({
            url: '../controller/cierre_caja.php?op=verificar_estado_y_resumen',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.caja_activa) {
                    mostrarCajaAbierta(response.data);
                } else {
                    mostrarCajaCerrada();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error al verificar estado de caja:", textStatus, errorThrown);
                Swal.fire("Error", "No se pudo verificar el estado de la caja.", "error");
            }
        });
    }

    function mostrarCajaAbierta(data) {
        // Actualizar estado visual
        $('#caja-status-indicator')
            .removeClass('closed')
            .addClass('open');

        $('#status-text').text('Caja Abierta');
        $('#apertura-time').text('Desde: ' + formatDate(data.fecha_apertura)).show();

        // Actualizar botones
        $('#btn-abrir-caja').prop('disabled', true);
        $('#btn-cerrar-caja').prop('disabled', false);

        // Mostrar sección de resumen
        $('#resumen-section').show();

        // Guardar datos globales
        cajaActivaId = data.id_caja;
        montoAperturaCaja = parseFloat(data.monto_apertura);
        totalVentasSistema = parseFloat(data.total_ventas);

        // Usar total esperado calculado por backend 
        const efectivoEsperado = parseFloat(data.total_caja_esperado || 0);

        // Animar KPIs
        animateValue('kpi-ventas-total', 0, data.total_ventas, 1000, true);
        animateValue('kpi-efectivo', 0, data.ventas_efectivo, 1000, true);
        animateValue('kpi-tarjeta', 0, data.ventas_tarjeta, 1000, true);
        animateValue('kpi-transferencia', 0, data.ventas_transferencia || 0, 1000, true);
        animateValue('kpi-efectivo-esperado', 0, efectivoEsperado, 1000, true);

        // Actualizar resumen detallado
        $('#resumen-apertura').text(formatCurrency(montoAperturaCaja));
        $('#resumen-ventas-efectivo').text(formatCurrency(data.ventas_efectivo));
        $('#resumen-ventas-tarjeta').text(formatCurrency(data.ventas_tarjeta));
        $('#resumen-ventas-transferencia').text(formatCurrency(data.ventas_transferencia || 0));
        $('#resumen-ventas-total').text(formatCurrency(data.total_ventas));
        $('#resumen-esperado').text(formatCurrency(efectivoEsperado));

        // Actualizar UI de Cortes Preventivos
        $('#badge-total-cortes').text(formatCurrency(data.total_cortes || 0));
        const $listaCortes = $('#lista-cortes-preventivos');
        $listaCortes.empty();

        if (data.lista_cortes && data.lista_cortes.length > 0) {
            data.lista_cortes.forEach(corte => {
                const dateObj = new Date(corte.fecha);
                const timeString = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                const userName = corte.comentario.replace('Realizado por: ', '');

                $listaCortes.append(`
                    <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                        <div>
                            <div class="fw-bold text-dark fs-6">${formatCurrency(corte.monto)}</div>
                            <div class="small text-muted"><i class="far fa-clock"></i> ${timeString}</div>
                        </div>
                        <div class="small text-end text-secondary fw-semibold">
                            <i class="fas fa-user-circle"></i> ${userName}
                        </div>
                    </div>
                `);
            });
        } else {
            $listaCortes.append('<div class="text-muted text-center py-4 fst-italic">No hay cortes registrados.</div>');
        }
    }

    function mostrarCajaCerrada() {
        // Actualizar estado visual
        $('#caja-status-indicator')
            .removeClass('open')
            .addClass('closed');

        $('#status-text').text('Caja Cerrada');
        $('#apertura-time').hide();

        // Actualizar botones
        $('#btn-abrir-caja').prop('disabled', false);
        $('#btn-cerrar-caja').prop('disabled', true);

        // Ocultar sección de resumen
        $('#resumen-section').hide();

        // Resetear valores
        cajaActivaId = null;
        montoAperturaCaja = 0;
        totalVentasSistema = 0;

        // Resetear KPIs
        $('#kpi-ventas-total').text('$0.00');
        $('#kpi-efectivo').text('$0.00');
        $('#kpi-tarjeta').text('$0.00');
        $('#kpi-transferencia').text('$0.00');
        $('#kpi-gastos').text('$0.00');
        $('#kpi-efectivo-esperado').text('$0.00');
    }

    // ========================================
    // APERTURA DE CAJA
    // ========================================

    $('#btn-abrir-caja').click(function () {
        $('#modalAperturaCaja').modal('show');
    });

    $('#btnConfirmarApertura').click(function () {
        let montoInicial = parseFloat(currentInputApertura);

        if (isNaN(montoInicial) || montoInicial < 0) {
            Swal.fire({
                icon: 'error',
                title: 'Monto Inválido',
                text: 'Por favor, ingrese un monto inicial válido.'
            });
            return;
        }

        Swal.fire({
            title: `¿Confirmar apertura de caja con ${formatCurrency(montoInicial)}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, Abrir',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $('#modalAperturaCaja').one('hidden.bs.modal', function () {
                    Swal.fire({
                        title: 'Abriendo Caja...',
                        text: 'Por favor espera un momento.',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    $.ajax({
                        url: '../controller/cierre_caja.php?op=abrir_caja',
                        type: 'POST',
                        data: { monto_apertura: montoInicial },
                        dataType: 'json',
                        success: function (response) {
                            if (response.status === "success") {
                                Swal.fire('¡Éxito!', response.message, 'success').then(() => {
                                    cargarEstadoCaja();
                                    $('.modal-backdrop').remove();
                                    $('body').removeClass('modal-open');
                                    $('body').css('padding-right', '');
                                });
                            } else {
                                Swal.fire('Error', response.message, 'error');
                            }
                        },
                        error: function () {
                            Swal.fire('Error de Conexión', 'No se pudo procesar la apertura de caja.', 'error');
                        }
                    });
                });

                $('#modalAperturaCaja').modal('hide');
            }
        });
    });


    // ========================================
    // TECLADO NUMÉRICO - APERTURA
    // ========================================

    let currentInputApertura = '';
    const inputFieldApertura = $('#inputMontoInicial');

    $('#modalAperturaCaja .btn-num').click(function () {
        const num = $(this).data('num');

        if (num === '.' && currentInputApertura.includes('.')) return;
        if (num === '0' && currentInputApertura === '0') return;

        if (currentInputApertura === '' && num !== '.') {
            currentInputApertura = num.toString();
        } else if (currentInputApertura === '' && num === '.') {
            currentInputApertura = '0.';
        } else {
            currentInputApertura += num.toString();
        }

        // ✅ Incluir el símbolo $ en la actualización
        inputFieldApertura.text('$' + currentInputApertura);
    });

    $('#modalAperturaCaja #btn-borrar').click(function () {
        currentInputApertura = '';
        inputFieldApertura.text('$0.00');
    });

    $('#modalAperturaCaja').on('shown.bs.modal', function () {
        currentInputApertura = '';
        inputFieldApertura.text('$0.00');
    });


    // ========================================
    // TECLADO NUMÉRICO - CIERRE
    // ========================================

    let currentInputCierre = '';
    const inputFieldCierre = $('#inputMontoFinalConfirmacion');

    $('#modalCierreCaja .btn-num').click(function () {
        const num = $(this).data('num');

        if (num === '.' && currentInputCierre.includes('.')) return;
        if (num === '0' && currentInputCierre === '0') return;

        if (currentInputCierre === '' && num !== '.') {
            currentInputCierre = num.toString();
        } else if (currentInputCierre === '' && num === '.') {
            currentInputCierre = '0.';
        } else {
            currentInputCierre += num.toString();
        }

        inputFieldCierre.val(currentInputCierre);
    });

    $('#modalCierreCaja #btn-borrar-cierre').click(function () {
        currentInputCierre = '';
        inputFieldCierre.val('0.00');
    });

    $('#modalCierreCaja').on('shown.bs.modal', function () {
        currentInputCierre = '';
        inputFieldCierre.val('0.00');
        inputFieldCierre.focus();
    });

    // ========================================
    // CIERRE DE CAJA
    // ========================================

    $('#btn-cerrar-caja').click(function () {
        if (!cajaActivaId) {
            Swal.fire({
                icon: 'info',
                title: 'Caja Cerrada',
                text: 'No hay una caja abierta para cerrar.'
            });
            return;
        }
        $('#modalCierreCaja').modal('show');
    });

    $('#btnConfirmarCierre').click(function () {
        let montoFinalFisico = parseFloat(currentInputCierre);
        let montoEsperado = parseFloat($('#kpi-efectivo-esperado').text().replace('$', '').replace(/,/g, ''));

        if (isNaN(montoFinalFisico) || montoFinalFisico < 0) {
            Swal.fire({
                icon: 'error',
                title: 'Monto Inválido',
                text: 'Por favor, ingrese el monto físico contado.'
            });
            return;
        }

        let diferencia = montoFinalFisico - montoEsperado;
        let mensajeDiferencia = `El sistema esperaba ${formatCurrency(montoEsperado)} y contaste ${formatCurrency(montoFinalFisico)}. `;
        let iconCierre = 'info';

        if (diferencia > 0) {
            mensajeDiferencia += `Sobran ${formatCurrency(diferencia)}.`;
            iconCierre = 'warning';
        } else if (diferencia < 0) {
            mensajeDiferencia += `Faltan ${formatCurrency(Math.abs(diferencia))}.`;
            iconCierre = 'warning';
        } else {
            mensajeDiferencia += `¡La caja cuadra perfectamente!`;
            iconCierre = 'success';
        }

        Swal.fire({
            title: 'Confirmar Cierre de Caja',
            html: mensajeDiferencia + '<br><br>¿Deseas proceder con el cierre?',
            icon: iconCierre,
            showCancelButton: true,
            confirmButtonText: 'Sí, Cerrar Caja',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Cerrando Caja...',
                    html: 'Generando reportes y enviando correo...<br><small>Esto puede tomar unos segundos</small>',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                $.ajax({
                    url: '../controller/cierre_caja.php?op=cerrar_caja',
                    type: 'POST',
                    data: {
                        id_caja_activa: cajaActivaId,
                        monto_cierre_fisico: montoFinalFisico,
                        total_ventas_sistema: totalVentasSistema,
                        diferencia_cierre: diferencia
                    },
                    dataType: 'json',
                    success: function (response) {
                        if (response.status === "success") {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Caja Cerrada!',
                                html: response.message + '<br><br><small>Se han enviado los reportes por correo</small>',
                                timer: 3000,
                                showConfirmButton: true
                            }).then(() => {
                                $('#modalCierreCaja').modal('hide');
                                cargarEstadoCaja();
                            });
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function () {
                        Swal.fire('Error', 'No se pudo procesar el cierre de caja.', 'error');
                    }
                });
            }
        });
    });


    // ========================================
    // BOTÓN DE PRUEBA DE CORREO
    // ========================================

    $('#btn-test-email').click(function () {
        Swal.fire({
            title: '¿Enviar correo de prueba?',
            text: 'Se enviará un correo de prueba con reportes del día de hoy',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, Enviar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Enviando correo...',
                    text: 'Generando reportes de prueba',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                $.ajax({
                    url: '../controller/cierre_caja.php?op=test_email',
                    type: 'POST',
                    dataType: 'json',
                    success: function (response) {
                        if (response.status === 'success') {
                            Swal.fire('¡Enviado!', 'El correo de prueba ha sido enviado correctamente', 'success');
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    },
                    error: function () {
                        Swal.fire('Error', 'No se pudo enviar el correo de prueba', 'error');
                    }
                });
            }
        });
    });



    // ========================================
    // INICIALIZACIÓN
    // ========================================

    cargarEstadoCaja();
});