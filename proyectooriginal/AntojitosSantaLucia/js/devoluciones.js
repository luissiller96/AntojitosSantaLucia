$(document).ready(function () {
    let ticketActual = null;

    // --- Búsqueda de Ticket ---
    $('#form-buscar-ticket').submit(function (e) {
        e.preventDefault();
        const ticketId = $('#ticket_id').val();

        if (!ticketId) {
            Swal.fire('Error', 'Por favor, ingrese un número de ticket.', 'error');
            return;
        }

        $.post('../controller/devoluciones.php?op=buscar_ticket', { ticket_id: ticketId }, function (data) {
            // jQuery ya parsea la respuesta JSON automáticamente gracias al Content-Type del servidor.
            if (data.status === 'success' && data.data.length > 0) {
                renderTicketDetails(data.data);
                ticketActual = ticketId;
            } else {
                Swal.fire('No encontrado', data.message || 'No se encontró un ticket con ese número o ya fue cancelado.', 'warning');
                resetDetailsView();
            }
        });
    });

    // --- Renderizar Detalles del Ticket ---
    function renderTicketDetails(ticketData) {
        const primerItem = ticketData[0];

        $('#ticket-number-display').text(primerItem.ticket);
        $('#ticket-fecha').text(new Date(primerItem.fecha).toLocaleString());
        $('#ticket-vendedor').text(primerItem.vendedor);
        $('#ticket-pago').text(primerItem.metodo_pago);
        $('#ticket-total').text(`$${parseFloat(primerItem.total_ticket).toFixed(2)}`);
        $('#ticket-status-badge').text(primerItem.estatus).removeClass('bg-danger').addClass('bg-success');

        const itemsList = $('#ticket-items-list');
        itemsList.empty();

        ticketData.forEach(item => {
            const listItem = `
                <li class="list-group-item">
                    <div class="item-info">
                        <span class="item-name">${item.producto}</span>
                        <small class="d-block item-qty">Cantidad: ${item.cantidad}</small>
                    </div>
                    <div class="item-price">
                        $${parseFloat(item.total).toFixed(2)}
                    </div>
                </li>
            `;
            itemsList.append(listItem);
        });

        $('#ticket-details-placeholder').addClass('d-none');
        $('#ticket-details-content').removeClass('d-none');
        $('#btn-confirmar-devolucion').prop('disabled', false);
    }

    // --- Resetear Vista de Detalles ---
    function resetDetailsView() {
        $('#ticket-details-placeholder').removeClass('d-none');
        $('#ticket-details-content').addClass('d-none');
        $('#btn-confirmar-devolucion').prop('disabled', true);
        $('#motivo_devolucion').val('');
        ticketActual = null;
    }
  
function procesarDevolucion(ticketId, motivo, token) {
    $.ajax({
        url: '../controller/devoluciones.php?op=procesar_devolucion',
        type: 'POST',
        data: {
            ticket_id: ticketId,
            motivo: motivo,
            token: token
        },
        dataType: 'json',
        // ✅ Bloque SUCCESS: Se ejecuta si el servidor responde correctamente (status 200)
        success: function (data) {
            if (data.status === 'success') {
                Swal.fire('¡Éxito!', data.message || 'La devolución se procesó correctamente.', 'success')
                    .then(() => location.reload());
            } else {
                Swal.fire('Token incorrecto', data.message || 'No se pudo procesar la devolución.', 'error');
            }
        },
        // ✅ Bloque ERROR: Se ejecuta si el servidor falla (Error 500, 404, etc.)
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error en la solicitud AJAX:");
            console.error("Status: " + textStatus);
            console.error("Error Thrown: " + errorThrown);
            console.error("Respuesta del servidor:", jqXHR.responseText); // ¡Esto es lo más importante!
            
            Swal.fire(
                'Error del Servidor',
                'Ocurrió un error inesperado. Revisa la consola del navegador para más detalles (F12).',
                'error'
            );
        }
    });
}


// --- Confirmar Devolución (Lógica con Modal para Token) ---
$('#btn-confirmar-devolucion').click(function () {
    const motivo = $('#motivo_devolucion').val();

    if (!ticketActual) {
        Swal.fire('Error', 'No hay un ticket seleccionado.', 'error');
        return;
    }
    if (!motivo.trim()) {
        Swal.fire('Atención', 'Por favor, ingrese un motivo para la devolución.', 'warning');
        return;
    }

    // Primer modal: Confirmación general de la acción
    Swal.fire({
        title: '¿Confirmar Devolución?',
        text: `Se cancelará el ticket #${ticketActual}. Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        // Si el usuario confirma, pedimos el token en un segundo modal
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Token de Autorización',
                input: 'text',
                inputLabel: 'Ingresa el token de 4 dígitos para confirmar la operación',
                inputPlaceholder: '1234',
                inputAttributes: {
                    maxlength: 4,
                    autocapitalize: 'off',
                    autocorrect: 'off',
                    inputmode: 'numeric',
                    pattern: '\\d{4}'
                },
                showCancelButton: true,
                confirmButtonText: 'Validar y Devolver',
                cancelButtonText: 'Cancelar',
                preConfirm: (token) => {
                    if (!/^\d{4}$/.test(token)) {
                        Swal.showValidationMessage('El token debe ser de 4 dígitos numéricos.');
                    }
                    return token;
                }
            }).then((tokenResult) => {
                // Si el segundo modal se confirmó y se obtuvo un token, procesamos la devolución
                if (tokenResult.isConfirmed && tokenResult.value) {
                    procesarDevolucion(ticketActual, motivo, tokenResult.value);
                }
            });
        }
    });
});
});