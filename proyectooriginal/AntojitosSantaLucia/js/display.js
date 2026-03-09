$(document).ready(function () {
    console.log("🚀 Display JavaScript iniciado con optimización dinámica");

    const CUSTOMER_STATUS_MAP = {
        'en_preparacion': { text: 'Preparando tu pedido', emoji: '🧑‍🍳', class: 'status-en_preparacion' },
        'lista': { text: '¡Listo para recoger!', emoji: '✅', class: 'status-lista' }
    };

    // ✅ OPTIMIZACIÓN DINÁMICA: Diferentes intervalos según la actividad
    const INTERVALO_CON_PEDIDOS = 30 * 1000; // 30 segundos cuando hay pedidos
    const INTERVALO_SIN_PEDIDOS = 2 * 60 * 1000; // 2 minutos cuando no hay pedidos
    const INTERVALO_INICIAL = 60 * 1000; // 1 minuto para la primera carga
    
    let INTERVALO_ACTUAL = INTERVALO_INICIAL;
    let lastKnownTimestamp = null; 
    let intervalChecker;
    let estadoAnterior = null; // Para detectar cambios de estado (con/sin pedidos)

    const $mainDisplayRow = $('.main-content > .row.w-100'); 
    const $preparingQueue = $('#preparingQueue');
    const $readyQueue = $('#readyQueue');

    console.log("🔍 Elementos encontrados:");
    console.log("mainDisplayRow:", $mainDisplayRow.length);
    console.log("preparingQueue:", $preparingQueue.length);
    console.log("readyQueue:", $readyQueue.length);

    // ✅ NUEVA FUNCIÓN: Ajustar intervalo según actividad
    function ajustarIntervaloSegunActividad(hayPedidos) {
        const nuevoIntervalo = hayPedidos ? INTERVALO_CON_PEDIDOS : INTERVALO_SIN_PEDIDOS;
        const estadoActual = hayPedidos ? 'CON_PEDIDOS' : 'SIN_PEDIDOS';
        
        // Solo cambiar si el estado cambió o es la primera vez
        if (nuevoIntervalo !== INTERVALO_ACTUAL || estadoAnterior !== estadoActual) {
            console.log(`📊 Optimización dinámica activada:`);
            console.log(`   Estado: ${estadoActual}`);
            console.log(`   Intervalo anterior: ${INTERVALO_ACTUAL/1000}s`);
            console.log(`   Nuevo intervalo: ${nuevoIntervalo/1000}s`);
            console.log(`   Ahorro de consultas: ${hayPedidos ? 'Modo activo' : 'Modo ahorro máximo'}`);
            
            // Limpiar intervalo actual
            if (intervalChecker) {
                clearInterval(intervalChecker);
                console.log("🔄 Intervalo anterior cancelado");
            }
            
            // Establecer nuevo intervalo
            INTERVALO_ACTUAL = nuevoIntervalo;
            estadoAnterior = estadoActual;
            intervalChecker = setInterval(checkForUpdatesAndRender, INTERVALO_ACTUAL);
            
            // Mostrar notificación visual (opcional)
            mostrarNotificacionIntervalo(estadoActual, nuevoIntervalo);
        }
    }

    // ✅ NUEVA FUNCIÓN: Mostrar notificación visual del cambio de intervalo
    function mostrarNotificacionIntervalo(estado, intervalo) {
        const tiempoTexto = intervalo >= 60000 ? `${intervalo/60000} min` : `${intervalo/1000}s`;
        const mensaje = estado === 'CON_PEDIDOS' 
            ? `⚡ Modo activo: verificando cada ${tiempoTexto}`
            : `💤 Modo ahorro: verificando cada ${tiempoTexto}`;
        
        // Crear notificación temporal
        const $notificacion = $(`
            <div id="intervalo-notification" style="
                position: fixed;
                top: 60px;
                right: 10px;
                background: ${estado === 'CON_PEDIDOS' ? '#28a745' : '#6c757d'};
                color: white;
                padding: 10px 15px;
                border-radius: 25px;
                font-size: 12px;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                animation: slideInRight 0.5s ease-out;
            ">
                ${mensaje}
            </div>
        `);
        
        // Agregar CSS de animación si no existe
        if (!$('#dynamic-styles').length) {
            $('head').append(`
                <style id="dynamic-styles">
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                </style>
            `);
        }
        
        // Remover notificación anterior si existe
        $('#intervalo-notification').remove();
        
        // Agregar nueva notificación
        $('body').append($notificacion);
        
        // Remover después de 4 segundos
        setTimeout(() => {
            $notificacion.css('animation', 'fadeOut 0.5s ease-out');
            setTimeout(() => $notificacion.remove(), 500);
        }, 4000);
    }

    function checkForUpdatesAndRender() {
        console.log("⏰ Verificando actualizaciones...");
        
        if ($preparingQueue.is(':empty') && $readyQueue.is(':empty') && $('#noOrdersOverall').hasClass('d-none')) {
             $('#loadingPreparing').removeClass('d-none');
             $('#loadingReady').removeClass('d-none');
             $('#noOrdersOverall').addClass('d-none'); 
             $('#noPreparingOrders').addClass('d-none');
             $('#noReadyOrders').addClass('d-none');
        }

        $.ajax({
            url: '../controller/controller_display.php?op=get_last_update_timestamp', 
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log("📅 Respuesta timestamp completa:", response);
                
                const currentTimestamp = String(response.last_update).trim();
                const lastTimestamp = lastKnownTimestamp ? String(lastKnownTimestamp).trim() : null;

                console.log("🔍 Comparación detallada:");
                console.log("Timestamp anterior:", lastTimestamp);
                console.log("Timestamp actual  :", currentTimestamp);
                console.log("Son iguales?:", currentTimestamp === lastTimestamp);
                console.log("Es primera vez?:", lastKnownTimestamp === null);

                if (lastKnownTimestamp === null || currentTimestamp !== lastTimestamp) {
                    console.log("🔄 ¡CAMBIO DETECTADO! Actualizando datos...");
                    console.log("Motivo:", lastKnownTimestamp === null ? "Primera carga" : "Timestamp diferente");
                    
                    lastKnownTimestamp = currentTimestamp;
                    loadAndRenderOrders(); 
                } else {
                    console.log("✅ Sin cambios en timestamp - No se actualiza");
                    console.log(`📊 Próxima verificación en ${INTERVALO_ACTUAL/1000}s`);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("❌ Error al verificar timestamp:", textStatus, errorThrown);
                console.error("Status:", jqXHR.status);
                console.error("Response:", jqXHR.responseText);
                
                if (Math.random() < 0.1) {
                    console.log("🔄 Fallback: Forzando actualización por error");
                    loadAndRenderOrders();
                }
            }
        });
    }

    function loadAndRenderOrders() {
        console.log("📊 Cargando pedidos...");
        
        $.ajax({
            url: '../controller/controller_display.php?op=listar_para_cliente', 
            type: 'GET',
            dataType: 'json',
            success: function (newOrdersData) {
                console.log("📦 Datos recibidos:", newOrdersData);
                console.log("Total pedidos:", newOrdersData.length);
                
                $('#loadingPreparing').addClass('d-none');
                $('#loadingReady').addClass('d-none');
                
                renderDisplaySnapshot(newOrdersData); 
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("❌ Error al cargar pedidos:", textStatus, errorThrown);
                console.error("Status:", jqXHR.status);
                console.error("Response:", jqXHR.responseText);
                
                $('#loadingPreparing').addClass('d-none');
                $('#loadingReady').addClass('d-none');
            }
        });
    }

    function renderDisplaySnapshot(newOrdersData) {
        console.log("🎨 Renderizando display con datos:", newOrdersData);
        
        const preparingTickets = new Map();
        const readyTickets = new Map();

        newOrdersData.forEach((ticket, index) => {
            console.log(`Procesando ticket ${index}:`, ticket);
            
            if (ticket.status_interno === 'en_preparacion') {
                preparingTickets.set(ticket.ticket_id, ticket);
                console.log("➕ Ticket agregado a preparación:", ticket.ticket_id);
            } else if (ticket.status_interno === 'lista') {
                readyTickets.set(ticket.ticket_id, ticket);
                console.log("✅ Ticket agregado a listos:", ticket.ticket_id);
            }
        });

        console.log("📋 Resumen final:");
        console.log("Tickets en preparación:", preparingTickets.size);
        console.log("Tickets listos:", readyTickets.size);

        // ✅ OPTIMIZACIÓN DINÁMICA: Ajustar intervalo según si hay pedidos
        const hayPedidos = newOrdersData.length > 0;
        ajustarIntervaloSegunActividad(hayPedidos);

        const $tempContainer = $('<div></div>').css({
            position: 'absolute', 
            left: '-9999px',     
        });

        const $newPreparingQueueCol = $(`
            <div class="col-lg-6 col-md-12">
                <div class="order-queue-section">
                    <h3>En Preparación 🧑‍🍳</h3>
                    <div id="preparingQueue_temp" class="queue-grid"></div>
                </div>
            </div>
        `);
        const $newReadyQueueCol = $(`
            <div class="col-lg-6 col-md-12">
                <div class="order-queue-section">
                    <h3>Listos para Recoger ✅</h3>
                    <div id="readyQueue_temp" class="queue-grid"></div>
                </div>
            </div>
        `);

        const $newPreparingQueue = $newPreparingQueueCol.find('#preparingQueue_temp');
        const $newReadyQueue = $newReadyQueueCol.find('#readyQueue_temp');

        if (preparingTickets.size > 0) {
            console.log("🔨 Creando tarjetas de preparación...");
            preparingTickets.forEach(ticketData => {
                const $card = createOrderCard(ticketData);
                $newPreparingQueue.append($card);
                console.log("✅ Tarjeta creada para ticket:", ticketData.ticket_id);
            });
        } else {
            console.log("📝 Sin pedidos en preparación, mostrando mensaje");
            $newPreparingQueue.append('<p class="info-message" id="noPreparingOrders_temp">No hay pedidos en preparación.</p>');
        }

        if (readyTickets.size > 0) {
            console.log("🔨 Creando tarjetas de listos...");
            readyTickets.forEach(ticketData => {
                const $card = createOrderCard(ticketData);
                $newReadyQueue.append($card);
                console.log("✅ Tarjeta creada para ticket:", ticketData.ticket_id);
            });
        } else {
            console.log("📝 Sin pedidos listos, mostrando mensaje");
            $newReadyQueue.append('<p class="info-message" id="noReadyOrders_temp">No hay pedidos listos por ahora.</p>');
        }

        $tempContainer.append($newPreparingQueueCol);
        $tempContainer.append($newReadyQueueCol);

        $('body').append($tempContainer);

        $tempContainer.get(0).offsetHeight; 

        console.log("🔄 Aplicando cambios al DOM...");
        console.log("mainDisplayRow encontrado:", $mainDisplayRow.length);
        
        if ($mainDisplayRow.length === 0) {
            console.error("❌ No se encontró mainDisplayRow, usando fallback");
            const $fallbackRow = $('.row.w-100').first();
            console.log("Usando fallback:", $fallbackRow.length);
            
            if ($fallbackRow.length > 0) {
                $fallbackRow.fadeOut(100, function() {
                    $(this).empty(); 
                    $(this).append($newPreparingQueueCol);
                    $(this).append($newReadyQueueCol);
                    updateElements();
                    $(this).fadeIn(100);
                    $tempContainer.remove();
                    console.log("🎉 Renderizado completado con fallback!");
                    activateSpecialEffects();
                });
            }
        } else {
            $mainDisplayRow.fadeOut(100, function() {
                $(this).empty(); 
                $(this).append($newPreparingQueueCol);
                $(this).append($newReadyQueueCol);
                updateElements();
                $(this).fadeIn(100);
                $tempContainer.remove();
                console.log("🎉 Renderizado completado!");
                activateSpecialEffects();
            });
        }

        function updateElements() {
            $('#preparingQueue_temp').attr('id', 'preparingQueue');
            $('#readyQueue_temp').attr('id', 'readyQueue');
            $('#noPreparingOrders_temp').attr('id', 'noPreparingOrders').toggleClass('d-none', preparingTickets.size > 0);
            $('#noReadyOrders_temp').attr('id', 'noReadyOrders').toggleClass('d-none', readyTickets.size > 0);
            
            if (preparingTickets.size === 0 && readyTickets.size === 0) {
                console.log("📭 Sin pedidos, mostrando mensaje general");
                $('#noOrdersOverall').removeClass('d-none');
            } else {
                console.log("📦 Hay pedidos, ocultando mensaje general");
                $('#noOrdersOverall').addClass('d-none');
            }
        }
    }

    function createOrderCard(ticketData) {
        console.log("🎫 Creando tarjeta para:", ticketData);
        
        const statusInfo = CUSTOMER_STATUS_MAP[ticketData.status_interno];
        
        let iconClass = 'fas fa-utensils';
        let statusText = statusInfo.text;
        
        if (ticketData.status_interno === 'lista') {
            iconClass = 'fas fa-bell';
            statusText = '¡Listo para recoger!';
        }
        
        const $card = $(`
            <div class="order-card ${statusInfo.class}" data-ticket-id="${ticketData.ticket_id}">
                <div class="ticket-number">${ticketData.ticket_id}</div>
                <div class="order-status">
                    <i class="${iconClass} status-icon"></i>
                    <span>${statusText}</span>
                </div>
            </div>
        `);
        
        animateCardEntrance($card);
        
        console.log("✅ Tarjeta creada exitosamente");
        return $card;
    }

    // Resto de funciones sin cambios...
    function animateCardEntrance($card) {
        $card.css({
            opacity: 0,
            transform: 'translateY(30px) scale(0.95)'
        });
        
        setTimeout(() => {
            $card.css({
                opacity: 1,
                transform: 'translateY(0) scale(1)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            });
        }, Math.random() * 200 + 100);
    }

    function activateSpecialEffects() {
        createSparkleEffects();
        
        $('.order-card.status-lista').each(function(index) {
            const $card = $(this);
            setTimeout(() => {
                $card.addClass('celebration-pulse');
            }, index * 200);
        });
    }

    function createSparkleEffects() {
        const readyCards = $('.order-card.status-lista');
        readyCards.each(function() {
            const $card = $(this);
            
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if ($card.is(':visible') && $card.hasClass('status-lista')) {
                        createSingleSparkle($card);
                    }
                }, Math.random() * 2000);
            }
        });
    }

    function createSingleSparkle($card) {
        const sparkle = $('<div class="sparkle"></div>');
        sparkle.css({
            left: Math.random() * 80 + 10 + '%',
            top: Math.random() * 80 + 10 + '%'
        });
        
        $card.append(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 2000);
    }

    function animateCardExit($card, callback) {
        $card.addClass('fade-out');
        setTimeout(() => {
            if (callback) callback();
        }, 500);
    }

    function startPeriodicEffects() {
        setInterval(() => {
            const readyCards = $('.order-card.status-lista');
            if (readyCards.length > 0) {
                readyCards.each(function() {
                    if (Math.random() > 0.7) {
                        createSingleSparkle($(this));
                    }
                });
            }
        }, 4000);
    }

    // ✅ BOTONES DE DEBUG MEJORADOS
    console.log("🔧 Agregando controles de debug...");
    
    const $debugContainer = $(`
        <div id="debug-controls" style="
            position: fixed;
            top: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            z-index: 9999;
        ">
            <button id="force-update-btn" style="
                background: #ff4757;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 11px;
                cursor: pointer;
            ">🔄 Forzar Actualización</button>
            
            <button id="toggle-interval-btn" style="
                background: #3742fa;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 11px;
                cursor: pointer;
            ">⚡ Cambiar a 5s</button>
            
            <div id="status-display" style="
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 5px 8px;
                border-radius: 5px;
                font-size: 10px;
                text-align: center;
            ">
                Iniciando...
            </div>
        </div>
    `);
    
    $('body').append($debugContainer);
    
    $('#force-update-btn').click(function() {
        console.log("🔧 Actualización manual forzada");
        loadAndRenderOrders();
    });
    
    // Toggle entre modo debug (5s) y modo normal
    let modoDebug = false;
    $('#toggle-interval-btn').click(function() {
        modoDebug = !modoDebug;
        
        if (modoDebug) {
            clearInterval(intervalChecker);
            INTERVALO_ACTUAL = 5000; // 5 segundos para debug
            intervalChecker = setInterval(checkForUpdatesAndRender, INTERVALO_ACTUAL);
            $(this).text('💤 Volver a Auto').css('background', '#ff6348');
            $('#status-display').text('DEBUG: 5s').css('background', '#ff6348');
        } else {
            // Volver al modo automático
            ajustarIntervaloSegunActividad($('.order-card').length > 0);
            $(this).text('⚡ Cambiar a 5s').css('background', '#3742fa');
        }
    });

    // Actualizar status display
    function actualizarStatusDisplay() {
        const tiempoTexto = INTERVALO_ACTUAL >= 60000 ? `${INTERVALO_ACTUAL/60000}min` : `${INTERVALO_ACTUAL/1000}s`;
        const estado = $('.order-card').length > 0 ? 'CON PEDIDOS' : 'SIN PEDIDOS';
        $('#status-display').text(`${estado}: ${tiempoTexto}`);
    }

    setInterval(actualizarStatusDisplay, 2000);

    console.log("🚀 Iniciando verificación inicial con optimización dinámica...");
    checkForUpdatesAndRender();
    intervalChecker = setInterval(checkForUpdatesAndRender, INTERVALO_ACTUAL);
    
    startPeriodicEffects();

    $(window).on('beforeunload', function() {
        if (typeof intervalChecker !== 'undefined' && intervalChecker) {
            clearInterval(intervalChecker);
        }
    });

});