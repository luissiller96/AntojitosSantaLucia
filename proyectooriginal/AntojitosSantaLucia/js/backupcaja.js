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

  // ✅ Inicializar Isotope para el filtrado de productos
  var $grid = $(".trending-box").isotope({
    itemSelector: ".trending-items",
    layoutMode: "fitRows",
  });

  // ✅ Filtrado por categoría
  $(".trending-filter a").click(function () {
    $(".trending-filter a").removeClass("is_active");
    $(this).addClass("is_active");

    var filterValue = $(this).attr("data-filter");
    $grid.isotope({
      filter: filterValue,
    });
  });

  // ✅ Inicializar carrito
  let carrito = [];
  let totalCarrito = 0;
  let metodoPago = ""; // Guardar el método de pago seleccionado

  // ✅ Agregar producto al carrito
  window.agregarAlCarrito = function (id, nombre, precio) {
    let existe = carrito.find((item) => item.id === id);
    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    actualizarCarrito();
  };

  // ✅ Actualizar carrito
  function actualizarCarrito() {
    let total = 0;
    let htmlCarrito = "";

    carrito.forEach((item, index) => {
      total += item.precio * item.cantidad;
      htmlCarrito += `
        <div class="d-flex justify-content-between align-items-center mb-2 carrito-item" 
             data-index="${index}">
          <span>${item.cantidad} x ${item.nombre}</span>
          <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong>
        </div>`;
    });

    $("#carrito").html(
      carrito.length
        ? htmlCarrito
        : '<p class="text-muted">Tu carrito está vacío.</p>'
    );
    $("#totalCarrito").text(`$${total.toFixed(2)}`);
    totalCarrito = total;
  }

  // ✅ Eliminar un solo producto con clic en el carrito
  $(document).on("click", ".carrito-item", function () {
    let index = $(this).data("index");

    // 🔹 Verificar que el índice existe en el array
    if (index >= 0 && index < carrito.length) {
      if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
      } else {
        carrito.splice(index, 1); // Eliminar completamente si la cantidad es 1
      }
    }

    actualizarCarrito();
  });

  // ✅ Vaciar el carrito completamente
  $("#vaciarCarrito").click(function () {
    carrito = [];
    actualizarCarrito();
    metodoPago = ""; // Reiniciar el método de pago
    $(".tile-pago").removeClass("active"); // Desactiva los botones de pago
  });

  // ✅ Selección del método de pago
  $(".tile-pago").click(function () {
    $(".tile-pago").removeClass("active"); // Quita la selección anterior
    $(this).addClass("active"); // Agrega la selección actual
    metodoPago = $(this).data("tipo"); // Guarda el método de pago
  });

  // ✅ Abrir el modal SOLO si el método de pago es "efectivo"
  $("#btnPagar").click(function () {
    if (totalCarrito === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Añade productos antes de pagar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (!metodoPago) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un método de pago",
        text: "Elige 'Tarjeta' o 'Efectivo'.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (metodoPago === "tarjeta") {
      registrarVenta();

      Swal.fire({
        icon: "success",
        title: "Pago con tarjeta exitoso",
        text: `Se pagaron $${totalCarrito.toFixed(2)} correctamente.`,
        confirmButtonText: "Aceptar",
      }).then(() => {
        limpiarCarrito();
      });
    } else if (metodoPago === "efectivo") {
      $("#modalPago").modal("show");
    }
  });

  // ✅ Agregar números al input de pago
  $(".btn-num").click(function () {
    let valor = $(this).data("num");
    $("#inputPago").val($("#inputPago").val() + valor);
  });

  // ✅ Borrar input de pago
  $("#btn-borrar").click(function () {
    $("#inputPago").val("");
  });

  // ✅ Confirmar pago en efectivo
  $("#btn-confirmar-pago").click(function () {
    let pago = parseFloat($("#inputPago").val());

    if (isNaN(pago) || pago < totalCarrito) {
      Swal.fire({
        icon: "error",
        title: "Monto insuficiente",
        text: "El monto ingresado es menor al total.",
        confirmButtonText: "Aceptar",
      });
    } else {
      let cambio = pago - totalCarrito;

      registrarVenta();

      Swal.fire({
        icon: "success",
        title: `Cambio: $${cambio.toFixed(2)}`,
        text: "Pago realizado con éxito",
        confirmButtonText: "Aceptar",
      }).then(() => {
        $("#modalPago").modal("hide");
        limpiarCarrito();
        $("#inputPago").val("");
      });
    }
  });

  // ✅ Función para limpiar el carrito después del pago
  function limpiarCarrito() {
    carrito = [];
    totalCarrito = 0;
    metodoPago = "";
    $(".tile-pago").removeClass("active"); // Desactiva los botones de pago
    $("#carrito").html('<p class="text-muted">Tu carrito está vacío.</p>');
    $("#totalCarrito").text("$0.00");
  }

  //REGISTRAR PAGO

  function registrarVenta() {
    // Obtener los productos del carrito
    let productosVenta = carrito.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
    }));

    // Datos de la venta
    let dataVenta = {
      productos: productosVenta,
      total: totalCarrito,
      tipo_pago: metodoPago,
      vendedor: "1", // 🔹 Por ahora, usamos un ID fijo de prueba (cambiar cuando haya sesiones)
    };

    console.log("✅ Enviando datos a ventas.php:", dataVenta);

    $.ajax({
      url: "../controller/ventas.php?op=registrar_venta",
      type: "POST",
      data: JSON.stringify(dataVenta),
      contentType: "application/json",
      success: function (response) {
        console.log("✅ Respuesta del servidor:", response);

        try {
          response = JSON.parse(response);
          if (response.status === "success") {
            limpiarCarrito(); // Limpia el carrito después de la venta
          }
        } catch (e) {
          console.error("❌ Error al procesar respuesta del servidor:", e);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error("❌ Error en AJAX:", textStatus, errorThrown);
      },
    });
  }
  // 📌 Filtrar Favoritos
  $("#btnFavoritos").click(function () {
    $(".trending-items").each(function () {
      const esFavorito = $(this).data("favorito") == 1;

      if (esFavorito) {
        $(this).show(); // Mostrar
      } else {
        $(this).hide(); // Ocultar
      }
    });
  });
});
