$(document).ready(function () {
  let lastTouchTime = 0;
  document.addEventListener(
    "touchend",
    function (event) {
      const now = new Date().getTime();
      if (now - lastTouchTime <= 100) {
        event.preventDefault(); // Evita el zoom
      }
      lastTouchTime = now;
    },
    false
  );

  var $grid = $(".trending-box").isotope({
    itemSelector: ".trending-items",
    layoutMode: "fitRows",
  });

  $(".trending-filter a").click(function (e) {
    e.preventDefault();
    $(".trending-filter a").removeClass("is_active");
    $(this).addClass("is_active");
    var filterValue = $(this).attr("data-filter");
    $grid.isotope({ filter: filterValue });
  });

  let carrito = [];
  let totalCarrito = 0;
  let metodoPago = "";

  // Helper de impresión
  window.imprimirTicket = function (html) {
    if (!html) return;
    const ventana = window.open('', '_blank', 'width=420,height=650,scrollbars=yes');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
      setTimeout(function () {
        ventana.focus();
        ventana.print();
        ventana.onafterprint = function () { ventana.close(); };
      }, 400);
    }
  };


  // --- Bloque Mejorado para Selección de Vendedor ---

  let vendedorSeleccionado = null; // Lo iniciamos como nulo para más seguridad

  // Esta función centraliza la lógica para obtener el vendedor activo
  function actualizarVendedorSeleccionado() {
    const vendedorActivo = $(".vendedor-selector.is_active");

    if (vendedorActivo.length > 0) {
      vendedorSeleccionado = vendedorActivo.data("cajero-id");
    } else {
      // Si por alguna razón ninguno está activo, seleccionamos el primero de la lista
      const primerVendedor = $(".vendedor-selector").first();
      if (primerVendedor.length > 0) {
        primerVendedor.addClass("is_active");
        vendedorSeleccionado = primerVendedor.data("cajero-id");
      }
    }

    // La línea más importante para depurar:
    console.log("Vendedor seleccionado (emp_id):", vendedorSeleccionado);
  }

  // Manejador de clic para cambiar de vendedor
  $(document).on("click", ".vendedor-selector", function (e) {
    e.preventDefault();
    $(".vendedor-selector").removeClass("is_active");
    $(this).addClass("is_active");
    actualizarVendedorSeleccionado(); // Llamamos a la función para actualizar
  });

  // Se llama una vez al cargar la página para establecer el vendedor inicial
  actualizarVendedorSeleccionado();

  window.agregarAlCarrito = function (id, nombre, precio) {
    const $productoCard = $(`.producto-card[data-id="${id}"]`);
    const stockProducto = $productoCard.data("stock");

    if (stockProducto === null || stockProducto === "NULL" || stockProducto === undefined || stockProducto === "") {
      $("#platilloPersonalizarNombre").text(nombre);
      $("#platilloPersonalizarId").val(id);
      $('#observacionesTextarea').val('');

      // Lógica de Tabs
      if (nombre.trim().toLowerCase() === "orden mixta") {
        $("#nav-item-mezcla").show();
        // Reset steppers
        $(".cant-mixta").val(0);
        $(".stepper-value").text("0");
        calcularTotalMixta();

        // Select first tab by default
        const triggerEl = document.querySelector('#comandaTabs button[data-bs-target="#tab-mezcla"]');
        if (triggerEl) bootstrap.Tab.getOrCreateInstance(triggerEl).show();
      } else {
        $("#nav-item-mezcla").hide();
        // Select ingredients tab directly
        const triggerEl = document.querySelector('#comandaTabs button[data-bs-target="#tab-ingredientes"]');
        if (triggerEl) bootstrap.Tab.getOrCreateInstance(triggerEl).show();
      }

      // Mostramos el modal inmediatamente con un loader discreto para los ingredientes
      const loaderHtml = '<div class="text-center text-muted py-2"><div class="spinner-border spinner-border-sm me-2" role="status"></div><small>Cargando opciones...</small></div>';
      $("#opcionesVerduras, #opcionesAderezos, #opcionesOtros").html(loaderHtml);
      $("#modalComanda").modal("show");

      // AJAX call
      $.ajax({
        url: '../controller/caja.php?op=get_ingredientes_modal',
        type: 'GET',
        dataType: 'json',
        success: function (ingredientes) {
          $("#opcionesVerduras, #opcionesAderezos, #opcionesOtros").empty();

          ingredientes.forEach(ing => {
            const checkboxHtml = `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${ing.nombre_ingrediente}" id="ingrediente_${ing.ingrediente_id}">
                            <label class="form-check-label" for="ingrediente_${ing.ingrediente_id}">
                                ${ing.nombre_ingrediente}
                            </label>
                        </div>`;

            if (ing.categoria === 'Verduras') {
              $("#opcionesVerduras").append(checkboxHtml);
            } else if (ing.categoria === 'Aderezos') {
              $("#opcionesAderezos").append(checkboxHtml);
            } else {
              $("#opcionesOtros").append(checkboxHtml);
            }
          });
        },
        error: function () {
          $("#opcionesVerduras, #opcionesAderezos, #opcionesOtros").html('<div class="text-danger small">Error al cargar opciones</div>');
        }
      });

    } else {
      let existe = carrito.find((item) => item.id === id);
      if (existe) {
        existe.cantidad++;
      } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
      }
      actualizarCarrito();
    }
  };

  // Stepper Logic for Orden Mixta
  function calcularTotalMixta() {
    let total = 0;
    $(".cant-mixta").each(function () {
      const cant = parseInt($(this).val()) || 0;
      const precio = parseFloat($(this).data("precio")) || 0;
      total += cant * precio;
    });
    $("#totalOrdenMixta").text('$' + total.toFixed(2));
  }

  $(document).on('click', '.btn-stepper', function () {
    const targetId = $(this).data('target');
    const $input = $('#' + targetId);
    const $display = $(this).siblings('.stepper-value');
    let val = parseInt($input.val()) || 0;

    if ($(this).hasClass('btn-stepper-plus')) {
      val++;
    } else if ($(this).hasClass('btn-stepper-minus') && val > 0) {
      val--;
    }

    $input.val(val);
    $display.text(val);
    calcularTotalMixta();
  });

  function actualizarCarrito() {
    let total = 0;
    let htmlCarrito = "";

    // Agrupar ítems por grupo_mixta para renderizado visual
    const gruposVistos = {};
    carrito.forEach((item, index) => {
      total += item.precio * item.cantidad;

      if (item.grupo_mixta) {
        // Primer ítem de este grupo: mostrar cabecera "Mixta"
        if (!gruposVistos[item.grupo_mixta]) {
          gruposVistos[item.grupo_mixta] = true;
          htmlCarrito += `<div class="text-muted small fw-bold mt-1 mb-0" style="border-top:1px dashed #ccc;padding-top:4px;">Mixta</div>`;
        }
        let opcionesHtml = '';
        if (item.opciones && item.opciones.length > 0) {
          opcionesHtml = `<small class="text-muted d-block ms-3">Sin: ${item.opciones.join(', ')}</small>`;
        }
        if (item.observaciones) {
          opcionesHtml += `<small class="text-muted d-block ms-3">Obs: ${item.observaciones}</small>`;
        }
        const subNombre = item.nombre.replace(' (Mixta)', '');
        htmlCarrito += `
          <div class="d-flex justify-content-between align-items-center mb-1 carrito-item ms-2" data-index="${index}">
            <span class="text-muted">${item.cantidad}x ${subNombre}</span>
            <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong>
          </div>
          ${opcionesHtml}`;
      } else {
        let opcionesHtml = '';
        if (item.opciones && item.opciones.length > 0) {
          opcionesHtml = `<small class="text-muted d-block ms-3">Sin: ${item.opciones.join(', ')}</small>`;
        }
        if (item.observaciones) {
          opcionesHtml += `<small class="text-muted d-block ms-3">Obs: ${item.observaciones}</small>`;
        }
        htmlCarrito += `
          <div class="d-flex justify-content-between align-items-center mb-2 carrito-item" data-index="${index}">
            <span>${item.cantidad} x ${item.nombre}</span>
            <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong>
          </div>
          ${opcionesHtml}`;
      }
    });

    $("#carrito").html(carrito.length ? htmlCarrito : '<p class="text-muted">Tu carrito está vacío.</p>');
    $("#totalCarrito").text(`$${total.toFixed(2)}`);
    totalCarrito = total;

    const $instruccionCarrito = $('#instruccionCarrito');
    if (carrito.length > 0) {
      $instruccionCarrito.hide();
    } else {
      $instruccionCarrito.html("Haz clic en un producto en el carrito para disminuir la cantidad o eliminarlo.").show();
    }
    $("#btnPagar").prop("disabled", carrito.length === 0);
  }

  $(document).on("click", ".carrito-item", function () {
    let index = $(this).data("index");
    if (index >= 0 && index < carrito.length) {
      if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
      } else {
        carrito.splice(index, 1);
      }
    }
    actualizarCarrito();
  });

  $("#vaciarCarrito").click(function () {
    limpiarCarrito();
  });

  $(".tile-pago").click(function () {
    $(".tile-pago").removeClass("active");
    $(this).addClass("active");
    metodoPago = $(this).data("tipo");
  });

  $("#btnPagar").click(function () {
    if (totalCarrito === 0) {
      Swal.fire("Carrito vacío", "Añade productos antes de pagar.", "warning");
      return;
    }
    if (!metodoPago) {
      Swal.fire("Falta método de pago", "Elige 'Tarjeta' o 'Efectivo'.", "warning");
      return;
    }
    verificarCajaActiva(function (cajaEstaActiva) {
      if (!cajaEstaActiva) return;


      // --- ✅ INICIO DE LA NUEVA LÓGICA ---
      if (metodoPago === 'tarjeta') {
        // Al quitar el cargo del 5%, pasamos directo a procesar el pago con tarjeta.
        registrarVenta();
      } else if (metodoPago === "efectivo") {
        $("#modalPago").modal("show");
      } else if (metodoPago === "transferencia") {
        $("#modalTransferencia").modal("show");
      }
      // --- FIN DE LA MODIFICACIÓN ---
    });
  });

  $(".btn-num").click(function () {
    let valor = $(this).data("num");
    $("#inputPago").val($("#inputPago").val() + valor);
  });

  $("#btn-borrar").click(function () {
    $("#inputPago").val("");
  });

  $("#btn-confirmar-pago").click(function () {
    let pago = parseFloat($("#inputPago").val());
    if (isNaN(pago) || pago < totalCarrito) {
      Swal.fire("Monto insuficiente", "El monto ingresado es menor al total.", "error");
    } else {
      window.cambio = pago - totalCarrito;
      registrarVenta();
    }
  });

  // --- INICIO DEL NUEVO CÓDIGO ---
  // Se añade el manejador para el botón de confirmar pago del modal de transferencia
  $("#btnConfirmarTransferencia").click(function () {
    // Usamos el evento 'hidden.bs.modal' para evitar conflictos visuales
    $('#modalTransferencia').one('hidden.bs.modal', function () {
      // La función registrarVenta ya se encarga de mostrar la alerta "Procesando..."
      registrarVenta();
    });
    // Le decimos al modal que comience a ocultarse
    $('#modalTransferencia').modal('hide');
  });
  // --- FIN DEL NUEVO CÓDIGO ---


  function limpiarCarrito() {
    carrito = [];
    metodoPago = "";
    $(".tile-pago").removeClass("active");
    $("#clienteNombreInput").val("");
    $("#inputPago").val("");
    window.cambio = 0;
    $("#modalPago").modal("hide");
    $("#modalTransferencia").modal("hide");
    actualizarCarrito();
    if (typeof actualizarEstadoCaja === "function") {
      actualizarEstadoCaja();
    }
  }

  function registrarVenta() {
    if (!vendedorSeleccionado) {
      Swal.fire("Selecciona un vendedor", "Debes elegir quién registra esta venta.", "warning");
      return;
    }

    if (!Array.isArray(carrito) || carrito.length === 0 || totalCarrito <= 0) {
      Swal.fire("Carrito vacío", "No hay productos en el carrito.", "warning");
      return;
    }


    // AÑADE ESTA LÍNEA para obtener el nombre del cliente
    let nombreCliente = $("#clienteNombreInput").val().trim();

    // --- CÓDIGO NUEVO AÑADIDO ---
    // 1. Muestra la alerta de "cargando" ANTES de hacer la llamada al servidor.
    //    Esto bloquea la pantalla y evita más clics.
    Swal.fire({
      title: 'Procesando Venta',
      text: 'Por favor, espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    // --- FIN DEL CÓDIGO NUEVO ---


    let productosVenta = carrito.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
      opciones: item.opciones || [],
      observaciones: item.observaciones || '',
      grupo_mixta: item.grupo_mixta || null
    }));
    // --- ✅ INICIO DE LA LÓGICA PARA ENVIAR PAGO Y CAMBIO ---
    let pagoCliente = 0;
    let cambioCliente = 0;
    const totalFinal = totalCarrito;

    if (metodoPago === 'efectivo') {
      pagoCliente = parseFloat($('#inputPago').val()) || 0;
      cambioCliente = window.cambio || (pagoCliente - totalCarrito);
    } else {
      pagoCliente = totalFinal;
      cambioCliente = 0;
    }

    let dataVenta = {
      productos: productosVenta,
      total: totalCarrito,
      tipo_pago: metodoPago,
      vendedor: vendedorSeleccionado,
      cliente: nombreCliente,
      pago: pagoCliente,
      cambio: cambioCliente
    };


    $.ajax({
      url: "../controller/ventas.php?op=registrar_venta",
      type: "POST",
      data: JSON.stringify(dataVenta),
      contentType: "application/json",
      success: function (response) { // 'response' ya es un objeto gracias al header del PHP
        console.log("✅ Respuesta del servidor:", response);

        if (response.status === "success") {

          if (response.print_html) {
            imprimirTicket(response.print_html);
          }
          // --- INICIO DE LA MODIFICACIÓN ---
          const swalConfig = {
            icon: "success",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "OK",
            cancelButtonText: '<i class="fa fa-print"></i> Re-imprimir',
          };

          if (metodoPago === "tarjeta" || metodoPago === "transferencia") {
            swalConfig.title = metodoPago === 'tarjeta' ? 'Pago con tarjeta exitoso' : 'Pago con transferencia exitoso';
            swalConfig.text = `Se pagaron $${totalCarrito.toFixed(2)} correctamente.`;
            Swal.fire(swalConfig).then((result) => {
              if (result.isDismissed && response.print_html) {
                imprimirTicket(response.print_html);
              }
              limpiarCarrito();
            });
          } else if (metodoPago === "efectivo") {
            swalConfig.title = `Cambio: $${window.cambio ? window.cambio.toFixed(2) : '0.00'}`;
            swalConfig.text = "Pago realizado con éxito";
            Swal.fire(swalConfig).then((result) => {
              if (result.isDismissed && response.print_html) {
                imprimirTicket(response.print_html);
              }
              $("#modalPago").modal("hide");
              limpiarCarrito();
              $("#inputPago").val("");
            });
          }
        } else {
          // 3. La alerta de error también reemplazará a la de "cargando".
          Swal.fire("Error", response.message || "Hubo un problema al registrar la venta.", "error");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("❌ Error en AJAX:", textStatus, errorThrown);
        // 4. Y si falla la conexión, también se reemplaza la alerta.
        Swal.fire("Error", "Error en la conexión con el servidor.", "error");
      },
    });
  }

  function verificarCajaActiva(callback) {
    $.ajax({
      url: "../controller/cierre_caja.php?op=verificar_estado_y_resumen",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success" && response.caja_activa === true) {
          callback(true);
        } else {
          Swal.fire("Caja cerrada", response.message || "No puedes realizar ventas sin una caja abierta.", "warning");
          callback(false);
        }
      },
      error: function () {
        Swal.fire("Error de conexión", "No se pudo verificar el estado de la caja.", "error");
        callback(false);
      },
    });
  }

  $('#modalPago').on('shown.bs.modal', function () {
    $('#inputPago').trigger('focus');
  });

  // Permitir escritura de números desde teclado físico en el campo de pago
  $(document).on('keydown', '#inputPago', function (e) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '.', ','];
    const isNumber = (e.key >= '0' && e.key <= '9');
    const isAllowed = allowed.includes(e.key);
    // Bloquear todo lo que no sea número ni tecla permitida
    if (!isNumber && !isAllowed) {
      e.preventDefault();
    }
    // Reemplazar coma por punto para decimales
    if (e.key === ',') {
      e.preventDefault();
      const current = $(this).val();
      if (!current.includes('.')) $(this).val(current + '.');
    }
  });


  $("#servicioExpressBtn").click(function () {
    const id = 9999;
    const nombre = "Día Servicio Express";
    const precio = 400;
    if (!carrito.find((item) => item.id === id)) {
      carrito.push({ id, nombre, precio, cantidad: 1 });
      actualizarCarrito();
    }
  });

  $("#btnAgregarPlatilloPersonalizado").click(function () {
    const id = parseInt($("#platilloPersonalizarId").val());
    const nombreBase = $("#platilloPersonalizarNombre").text();
    const isMixta = nombreBase.trim().toLowerCase() === "orden mixta";

    const $productoCard = $(`.producto-card[data-id="${id}"]`);
    let observaciones = $('#observacionesTextarea').val().trim();

    let opcionesSeleccionadas = [];
    $('#modalComanda input[type="checkbox"]:checked').each(function () {
      opcionesSeleccionadas.push($(this).val());
    });

    if (isMixta) {
      let articulosAgregados = 0;
      // Generar un ID único para esta orden mixta concreta
      const grupoMixtaId = Date.now() + '-' + Math.random().toString(36).substr(2, 5);

      $(".cant-mixta").each(function () {
        const cant = parseInt($(this).val()) || 0;

        if (cant > 0) {
          articulosAgregados++;
          const realId = parseInt($(this).data("id"));
          const itemName = $(this).data("nombre") + ' (Mixta)';
          const itemPrecio = parseFloat($(this).data("precio"));

          // Cada orden mixta se agrega como ítem nuevo (nunca se fusiona con otra mixta)
          carrito.push({
            id: realId,
            nombre: itemName,
            precio: itemPrecio,
            cantidad: cant,
            opciones: opcionesSeleccionadas,
            observaciones: observaciones,
            grupo_mixta: grupoMixtaId
          });
        }
      });

      if (articulosAgregados === 0) {
        Swal.fire("Atención", "Debes seleccionar al menos un artículo para la Orden Mixta.", "warning");
        return;
      }

    } else {
      // Flujo Normal para otros platillos
      let precio = parseFloat($productoCard.find('.precio span').text().replace('$', ''));
      let existe = carrito.find((item) =>
        item.id === id &&
        JSON.stringify(item.opciones) === JSON.stringify(opcionesSeleccionadas) &&
        item.observaciones === observaciones
      );
      if (existe) {
        existe.cantidad++;
      } else {
        carrito.push({ id, nombre: nombreBase, precio, cantidad: 1, opciones: opcionesSeleccionadas, observaciones });
      }
    }

    actualizarCarrito();
    $("#modalComanda").modal("hide");
  });

  // ===============================================
  // LÓGICA DE ESTADO DE CAJA Y CORTE PREVENTIVO
  // ===============================================

  function actualizarEstadoCaja() {
    $.ajax({
      url: "../controller/cierre_caja.php?op=verificar_estado_y_resumen",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.status === "success" && response.caja_activa) {
          const efectivoTotal = parseFloat(response.data.total_caja_esperado) || 0;
          const meta = 1500;

          // Actualizar UI Compacta
          $("#cajaEfectivoStatus").text(`$${Math.round(efectivoTotal)}`);

          const $pill = $("#cajaCompactPill");
          const $btnCut = $("#btnCortePreventivo");

          // Cambiar colores y mostrar botón según proximidad al límite
          if (efectivoTotal >= meta) {
            $pill.removeClass("bg-light border-warning").addClass("bg-danger border-danger text-white");
            $pill.find("i.fa-wallet").removeClass("text-success").addClass("text-white");
            $pill.find("#cajaEfectivoStatus").removeClass("text-dark").addClass("text-white");
            $btnCut.removeClass("d-none").find("i").removeClass("text-warning").addClass("text-white");
            $pill.attr("title", "¡LÍMITE ALCANZADO! Realizar corte");
          } else if (efectivoTotal >= meta * 0.8) {
            $pill.removeClass("bg-light bg-danger text-white").addClass("border-warning");
            $pill.find("i.fa-wallet").addClass("text-success");
            $pill.find("#cajaEfectivoStatus").addClass("text-dark");
            $btnCut.addClass("d-none");
            $pill.attr("title", "Efectivo próximo al límite");
          } else {
            $pill.removeClass("bg-danger border-warning text-white").addClass("bg-light");
            $pill.find("i.fa-wallet").addClass("text-success");
            $pill.find("#cajaEfectivoStatus").addClass("text-dark");
            $btnCut.addClass("d-none");
            $pill.attr("title", "Efectivo en Caja");
          }
        }
      }
    });
  }

  // Llamar al inicio
  actualizarEstadoCaja();
  // También deberíamos llamarlo después de cada cobro exitoso
  // Para eso, puedes llamar a esta misma función donde el cobro termina exitosamente.

  $("#btnCortePreventivo").click(function () {
    const empleadoSeleccionado = $(".vendedor-selector.is_active");

    if (empleadoSeleccionado.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un cajero',
        text: 'Debes seleccionar quién realizará el corte preventivo',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    const empNombre = empleadoSeleccionado.text().trim();

    Swal.fire({
      title: '¿Realizar Corte Preventivo?',
      html: `<strong>${empNombre}</strong> retirará $1,500.00 de la caja física para resguardo.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, retirar $1,500',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Procesando Retiro',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        $.ajax({
          url: "../controller/cierre_caja.php?op=registrar_corte_preventivo",
          type: "POST",
          data: {
            comentario: "Realizado por: " + empNombre,
            monto: 1500
          },
          dataType: "json",
          success: function (response) {
            if (response.status === "success") {
              const urlReimpresion = `../controller/imprimir_corte_preventivo.php?monto=1500&cajero=${encodeURIComponent(empNombre)}`;

              $.get(urlReimpresion, function (html) {
                if (window.imprimirTicket) {
                  window.imprimirTicket(html);
                }
              });

              Swal.fire({
                icon: 'success',
                title: 'Corte Realizado',
                html: `<strong>${empNombre}</strong> ha registrado el retiro de $1,500.00 correctamente.`,
                timer: 2500,
                showConfirmButton: false
              });

              actualizarEstadoCaja();
            } else {
              Swal.fire("Error", response.message || "No se pudo registrar el retiro.", "error");
            }
          },
          error: function () {
            Swal.fire("Error", "No se pudo comunicar con el servidor.", "error");
          }
        });
      }
    });
  });

});
