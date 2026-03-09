$(document).ready(function () {
  // =================================================================
  // 1. INICIALIZACIÓN Y VARIABLES GLOBALES
  // =================================================================
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  const fechaHoy = `${anio}-${mes}-${dia}`;
  const fechaInicioMes = `${anio}-${mes}-01`;

  let ventasPorTicketChart = null;
  let tablaVentas = null;
  let tablaProductosVendidos = null;
  let tablaCierre = null;

  // ✅ Nuevas variables para los reportes de utilidades y compras
  let tablaUtilidades = null;
  let tablaCompras = null;

  // Asignar fechas por defecto a los diferentes filtros
  $("#fechaInicioPDF, #fechaInicio").val(fechaInicioMes);
  $("#fechaFinPDF, #fechaFin").val(fechaHoy);
  $('#fechaInicioVentas').val(fechaInicioMes);
  $('#fechaFinVentas').val(fechaHoy);
  $('#fechaInicioCierre').val(fechaInicioMes);
  $('#fechaFinCierre').val(fechaHoy);
  // ✅ Asignar fechas a los nuevos filtros
  $('#fechaInicioUtilidad').val(fechaInicioMes);
  $('#fechaFinUtilidad').val(fechaHoy);
  $('#fechaInicioCompras').val(fechaInicioMes);
  $('#fechaFinCompras').val(fechaHoy);

  // =================================================================
  // 2. FUNCIONES AUXILIARES PARA CIERRE DE CAJA MEJORADO
  // =================================================================

  // Función para formatear moneda
  function formatCurrency(amount) {
    return `$${parseFloat(amount || 0).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Función para formatear fecha y hora
  function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Función para calcular duración del turno
  function calcularDuracionTurno(inicio, fin) {
    if (!inicio || !fin) return '-';
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    const diffMs = fechaFin - fechaInicio;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  }

  // Función para determinar clase de diferencia
  function getDiferenciaClass(diferencia) {
    const diff = parseFloat(diferencia);
    if (diff > 0) return 'diferencia-positiva-mejorada';
    if (diff < 0) return 'diferencia-negativa-mejorada';
    return 'diferencia-cero-mejorada';
  }

  // Función para actualizar cards con animación
  function updateSummaryCard(selector, value) {
    const element = $(selector);
    element.addClass('updating');
    element.text(formatCurrency(value));
    setTimeout(() => {
      element.removeClass('updating');
    }, 500);
  }

  // Función auxiliar para resetear las cards
  function resetSummaryCards() {
    $('#resumenEfectivo, #resumenTarjeta, #resumenTransferencia, #resumenTotal, #resumenDiferencias').text('$0.00');
    $('#totalCierresEncontrados').text('0');
  }

  // =================================================================
  // 3. DEFINICIÓN DE FUNCIONES DE REPORTES
  // =================================================================

  /** 📊 Carga la gráfica de ventas */
  function cargarGraficaVentas(tipoReporte, fechaInicio, fechaFin) {
    if (!tipoReporte || !fechaInicio || !fechaFin) {
      Swal.fire("Error", "Debes seleccionar el tipo de reporte y las fechas.", "error");
      return;
    }
    $.ajax({
      url: "../controller/reportes.php",
      type: "POST",
      data: { tipoReporte, fechaInicio, fechaFin },
      dataType: "json",
      success: function (data) {
        try {
          if (data.error) {
            Swal.fire("Error", data.error, "error");
            return;
          }
          let dias = data.map((item) => item.dia);
          let ventas = data.map((item) => parseFloat(item.total_vendido));
          let totalVentas = ventas.reduce((acc, val) => acc + val, 0);
          $("#totalVentasTexto").text(`Total: $${totalVentas.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          let options = {
            series: [{ name: "Total Vendido", data: ventas }],
            chart: { type: "line", height: 350, zoom: { enabled: false }, toolbar: { show: false } },
            stroke: { curve: "smooth", width: 3 },
            dataLabels: {
              enabled: true,
              formatter: (val) => `$${val.toFixed(2)}`,
              offsetY: -10,
              style: { fontSize: "10px", colors: ["#000"] },
              background: { enabled: true, foreColor: "#fff", padding: 4, borderRadius: 4, borderWidth: 1, borderColor: "#007bff", opacity: 0.9 }
            },
            xaxis: { categories: dias, labels: { style: { fontSize: "10px", colors: "#888" } } },
            yaxis: { title: { text: "Ventas ($)" } },
            tooltip: { y: { formatter: (val) => `$${val.toFixed(2)}` } },
            markers: { size: 4, colors: ["#007bff"], strokeWidth: 2 },
            colors: ["#007bff"],
          };
          if (ventasPorTicketChart) ventasPorTicketChart.destroy();
          ventasPorTicketChart = new ApexCharts(document.querySelector("#ventasPorTicketChart"), options);
          ventasPorTicketChart.render();
        } catch (e) {
          console.error("Error al parsear JSON:", e);
          Swal.fire("Error", "Error al procesar la respuesta del servidor.", "error");
        }
      },
      error: () => Swal.fire("Error", "Error al generar el reporte.", "error"),
    });
  }

  // ✅ Nueva función para cargar el reporte de utilidades
  function cargarUtilidades(fechaInicio, fechaFin) {
    const container = document.getElementById("tablaUtilidades");
    if (tablaUtilidades) {
      tablaUtilidades.destroy();
      tablaUtilidades = null;
    }
    container.innerHTML = '<p class="text-center text-muted">Cargando reporte de utilidades...</p>';

    $.ajax({
      url: `../controller/reportes.php?op=utilidades&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.error) {
          Swal.fire("Error", response.error, "error");
          container.innerHTML = `<p class="text-danger text-center">${response.error}</p>`;
          $('#totalUtilidades').text('$0.00');
          return;
        }

        const totalUtilidad = response.reduce((acc, item) => acc + parseFloat(item.utilidad_total_por_producto), 0);
        $('#totalUtilidades').text(`$${totalUtilidad.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        container.innerHTML = '';

        tablaUtilidades = new gridjs.Grid({
          columns: [
            { name: 'Ticket', width: '80px' },
            { name: 'Fecha', width: '150px' },
            { name: 'Producto', width: '200px' },
            { name: 'Cantidad', width: '80px' },
            { name: 'Precio Venta', width: '120px', formatter: (cell) => `$${parseFloat(cell || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            { name: 'Precio Compra', width: '120px', formatter: (cell) => `$${parseFloat(cell || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            { name: 'Utilidad/Unidad', width: '120px', formatter: (cell) => `$${parseFloat(cell || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            { name: 'Total Utilidad', width: '120px', formatter: (cell) => `$${parseFloat(cell || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
          ],
          data: response.map(item => [
            item.ticket,
            item.fecha_venta,
            item.nombre_producto,
            item.cantidad,
            item.precio_venta,
            item.precio_compra,
            item.utilidad_por_unidad,
            item.utilidad_total_por_producto,
          ]),
          sort: true,
          pagination: { limit: 10 },
          search: true,
          language: {
            'search': { 'placeholder': '🔍 Buscar...' },
            'pagination': { 'previous': 'Anterior', 'next': 'Siguiente', 'results': () => 'registros' }
          }
        }).render(container);
      },
      error: () => {
        $('#totalUtilidades').text('$0.00');
        container.innerHTML = '<p class="text-danger text-center">No se pudo cargar el reporte de utilidades.</p>';
      }
    });
  }

  // ✅ Nueva función para cargar el reporte de compras
  function cargarCompras(fechaInicio, fechaFin) {
    const container = document.getElementById("tablaCompras");
    if (tablaCompras) {
      tablaCompras.destroy();
      tablaCompras = null;
    }
    container.innerHTML = '<p class="text-center text-muted">Cargando reporte de compras...</p>';

    $.ajax({
      url: `../controller/reportes.php?op=compras&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.error) {
          Swal.fire("Error", response.error, "error");
          container.innerHTML = `<p class="text-danger text-center">${response.error}</p>`;
          $('#totalCompras').text('$0.00');
          return;
        }

        const totalCompras = response.reduce((acc, item) => acc + parseFloat(item.total), 0);
        $('#totalCompras').text(`$${totalCompras.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        container.innerHTML = '';

        tablaCompras = new gridjs.Grid({
          columns: [
            { name: 'Fecha', width: '150px' },
            { name: 'Insumo', width: '200px', formatter: (cell, row) => cell || row.cells[1].data },
            { name: 'Cant.', width: '80px' },
            { name: 'Unidad', width: '80px' },
            { name: 'Pr. Un.', width: '100px', formatter: (cell) => `$${parseFloat(cell || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            { name: 'Total', width: '120px', formatter: (cell) => `$${parseFloat(cell || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            { name: 'Comentario', width: '200px' }
          ],
          data: response.map(item => [
            item.fecha,
            item.nombre_insumo || item.descripcion,
            item.cantidad,
            item.unidad_medida || 'N/A',
            item.precio_unitario,
            item.total,
            item.comentario
          ]),
          sort: true,
          pagination: { limit: 10 },
          search: true,
          language: {
            'search': { 'placeholder': '🔍 Buscar...' },
            'pagination': { 'previous': 'Anterior', 'next': 'Siguiente', 'results': () => 'registros' }
          }
        }).render(container);
      },
      error: () => {
        $('#totalCompras').text('$0.00');
        container.innerHTML = '<p class="text-danger text-center">No se pudo cargar el reporte de compras.</p>';
      }
    });
  }

  function cargarProductosMasVendidos() {
    const container = document.getElementById("tablaProductosMasVendidos");
    if (tablaProductosVendidos) {
      tablaProductosVendidos.destroy();
      tablaProductosVendidos = null;
    }
    container.innerHTML = '<p class="text-center text-muted">Cargando productos más vendidos...</p>';

    $.ajax({
      url: "../controller/reportes.php?op=productos_mas_vendidos",
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.error) {
          Swal.fire("Error", response.error, "error");
          container.innerHTML = `<p class="text-danger text-center">${response.error}</p>`;
          return;
        }

        container.innerHTML = '';
        tablaProductosVendidos = new gridjs.Grid({
          columns: [
            { name: 'Producto', width: '300px' },
            { name: 'Categoría', width: '150px' },
            { name: 'Unidades Vendidas', width: '150px' },
            { name: 'Total Vendido', width: '150px', formatter: (cell) => `$${parseFloat(cell).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` }
          ],
          data: response.map(item => [
            item.producto,
            item.categoria,
            item.unidades_vendidas,
            item.total_vendido
          ]),
          sort: true,
          pagination: { limit: 10 },
          search: true,
          language: {
            'search': { 'placeholder': '🔍 Buscar...' },
            'pagination': { 'previous': 'Anterior', 'next': 'Siguiente', 'results': () => 'registros' }
          }
        }).render(container);
      },
      error: function () {
        container.innerHTML = '<p class="text-danger text-center">No se pudo cargar el reporte de productos.</p>';
      }
    });
  }

  // --- Lógica para la pestaña de Ventas ---
  function cargarVentas() {
    const fechaInicio = $("#fechaInicioVentas").val();
    const fechaFin = $("#fechaFinVentas").val();
    const filtroPago = $(".filtro-ventas.active").data("filtro");
    const container = document.getElementById("tablaVentas");

    if (tablaVentas) {
      tablaVentas.destroy();
      tablaVentas = null;
    }
    container.innerHTML = '<p class="text-center text-muted">Cargando reporte...</p>';

    $.ajax({
      url: `../controller/reportes.php?op=get_ventas_agrupadas&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&filtro=${filtroPago}`,
      type: "GET",
      dataType: "json",
      success: function (response) {
        if (response.error) {
          Swal.fire("Error", response.error, "error");
          container.innerHTML = `<p class="text-danger text-center">${response.error}</p>`;
          return;
        }
        $('#totalVentasFiltradas').text(`$${parseFloat(response.total_filtrado || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

        container.innerHTML = '';

        tablaVentas = new gridjs.Grid({
          columns: [
            { name: 'Ticket', width: '80px' },
            { name: 'Fecha', width: '150px' },
            { name: 'Vendedor', width: '120px' },
            {
              name: 'Artículos', width: '350px', formatter: (cell) => {
                if (!cell) return '';
                const productos = cell.split('|');
                const normales = [];
                const mixtas = [];

                productos.forEach(p => {
                  if (p.includes('(Mixta)')) {
                    mixtas.push(p.replace('(Mixta)', '').trim());
                  } else {
                    normales.push(p);
                  }
                });

                let html = '<ul class="product-list">';
                normales.forEach(p => {
                  html += `<li>${p.replace(/(\(\$.*?\))/g, '<span class="badge bg-secondary text-white">$1</span>')}</li>`;
                });
                if (mixtas.length > 0) {
                  html += `<li><strong>Mixta</strong><ul class="product-list" style="margin-left:10px;">`;
                  mixtas.forEach(p => {
                    html += `<li>${p.replace(/(\(\$.*?\))/g, '<span class="badge bg-secondary text-white">$1</span>')}</li>`;
                  });
                  html += `</ul></li>`;
                }
                return gridjs.html(html + '</ul>');
              }

            },
            { name: 'Cant.', width: '80px' },
            {
              name: 'Método', width: '120px', formatter: (cell) => {
                let badgeClass = '';
                switch (cell) {
                  case 'efectivo': badgeClass = 'badge-pago badge-pago-efectivo'; break;
                  case 'tarjeta': badgeClass = 'badge-pago badge-pago-tarjeta'; break;
                  case 'transferencia': badgeClass = 'badge-pago badge-pago-transferencia'; break;
                  default: badgeClass = 'badge bg-secondary';
                }
                return gridjs.html(`<span class="${badgeClass}">${cell}</span>`);
              }
            },
            { name: 'Total', width: '120px', formatter: (cell) => `$${parseFloat(cell).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
            {
              name: 'Acción',
              width: '70px',
              sort: false,
              formatter: (cell, row) => {
                const ticketId = row.cells?.[0]?.data;
                if (!ticketId) return '';

                return gridjs.html(`
                    <button class="btn btn-outline-secondary btn-sm rounded-circle btn-reimprimir" data-ticket-id="${ticketId}" title="Re-imprimir Ticket">
                        <i class="fa fa-print"></i>
                    </button>
                `);
              }
            }
          ],
          data: response.detalle.map(item => [
            item.ticket,
            new Date(item.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }),
            item.vendedor,
            item.productos_detalle,
            item.total_productos,
            item.metodo_pago,
            item.total_ticket,
            null
          ]),
          language: {
            'search': { 'placeholder': '🔍 Buscar...' },
            'pagination': { 'previous': 'Anterior', 'next': 'Siguiente', 'results': () => 'registros' }
          }
        }).render(container);
      },
      error: () => {
        $('#totalVentasFiltradas').text('$0.00');
        container.innerHTML = '<p class="text-danger text-center">No se pudo cargar el reporte.</p>';
      }
    });
  }

  // --- Devoluciones ---
  function cargarDevoluciones() {
    const container = document.getElementById("tablaDevoluciones");
    if (container.innerHTML.trim() !== "") return;

    $.ajax({
      url: "../controller/reportes.php?op=devoluciones",
      type: "GET",
      dataType: "json",
      success: function (data) {
        new gridjs.Grid({
          columns: [
            { name: "Ticket", width: '8%' },
            {
              name: "Monto",
              width: '12%',
              formatter: (cell) => `$${parseFloat(cell || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
            },
            {
              name: 'Productos Devueltos',
              width: '35%',
              formatter: (cell) => {
                if (!cell) return '';
                const productos = cell.split('|');
                let html = '<ul class="product-list-sm">';
                productos.forEach(p => { html += `<li>${p}</li>`; });
                return gridjs.html(html + '</ul>');
              }
            },
            { name: "Motivo", width: '20%' },
            { name: "Procesado Por", width: '15%' },
            { name: "Fecha", width: '15%' }
          ],
          data: data.map(item => [item.ticket_id, item.monto_ticket, item.productos_devueltos, item.motivo, item.usuario, item.fecha_devolucion_f]),
          sort: true,
          pagination: { limit: 10 },
          search: true,
          language: {
            'search': { 'placeholder': '🔍 Buscar...' },
            'pagination': { 'previous': 'Anterior', 'next': 'Siguiente', 'results': () => 'registros' }
          }
        }).render(container);
      },
      error: function () {
        container.innerHTML = "<p class='text-danger text-center'>No se pudo cargar el reporte de devoluciones.</p>";
      }
    });
  }

  // =================================================================
  // FUNCIÓN PRINCIPAL MEJORADA PARA CARGAR CIERRE DE CAJA
  // =================================================================

  function cargarCierreCaja(fechaInicio, fechaFin) {
    const container = document.getElementById("tablaCierreCaja");

    if (tablaCierre) {
      tablaCierre.destroy();
      tablaCierre = null;
    }

    // Estado de carga mejorado
    container.innerHTML = `
      <div class="loading-state-cierre">
        <div class="spinner-border loading-spinner-cierre text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mb-0">
          <i class="fas fa-database me-2"></i>
          Cargando datos de cierre de caja...
        </p>
      </div>
    `;

    $.ajax({
      url: `../controller/reportes.php?op=cierre_caja&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      type: "GET",
      dataType: "json",
      success: function (data) {
        if (data.error) {
          Swal.fire("Error", data.error, "error");
          container.innerHTML = `
            <div class="text-center py-5">
              <i class="fas fa-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
              <p class="text-danger mt-3">${data.error}</p>
            </div>
          `;
          // Resetear valores
          resetSummaryCards();
          return;
        }

        const resumen = data.resumen;

        // Actualizar cards de resumen con animación
        updateSummaryCard('#resumenEfectivo', resumen.total_efectivo || 0);
        updateSummaryCard('#resumenTarjeta', resumen.total_tarjeta || 0);
        updateSummaryCard('#resumenTransferencia', resumen.total_transferencia || 0);
        updateSummaryCard('#resumenTotal', resumen.total_general || 0);

        // Calcular total de diferencias
        const totalDiferencias = data.detalle.reduce((acc, item) =>
          acc + parseFloat(item.diferencia_cierre || 0), 0);
        updateSummaryCard('#resumenDiferencias', totalDiferencias);

        // Actualizar contador de cierres
        $('#totalCierresEncontrados').text(data.detalle.length);

        container.innerHTML = '';

        // Crear tabla mejorada con GridJS
        tablaCierre = new gridjs.Grid({
          columns: [
            {
              name: 'ID',
              width: '60px',
              formatter: (cell) => gridjs.html(`<span class="badge bg-primary rounded-pill">#${cell}</span>`)
            },
            {
              name: 'Apertura',
              width: '140px',
              formatter: (cell) => formatDateTime(cell)
            },
            {
              name: 'Cierre',
              width: '140px',
              formatter: (cell) => formatDateTime(cell)
            },
            {
              name: 'Duración',
              width: '80px',
              formatter: (cell, row) => {
                const inicio = row.cells[1].data;
                const fin = row.cells[2].data;
                const duracion = calcularDuracionTurno(inicio, fin);
                return gridjs.html(`<span class="badge bg-secondary">${duracion}</span>`);
              }
            },
            {
              name: 'Inicial',
              width: '100px',
              formatter: (cell) => gridjs.html(`
                <span class="text-muted fw-semibold">${formatCurrency(cell)}</span>
              `)
            },
            {
              name: 'Efectivo',
              width: '110px',
              formatter: (cell) => gridjs.html(`
                <span class="badge-pago-efectivo-tabla">
                  💵 ${formatCurrency(cell)}
                </span>
              `)
            },
            {
              name: 'Tarjeta',
              width: '110px',
              formatter: (cell) => gridjs.html(`
                <span class="badge-pago-tarjeta-tabla">
                  💳 ${formatCurrency(cell)}
                </span>
              `)
            },
            {
              name: 'Transferencia',
              width: '120px',
              formatter: (cell) => gridjs.html(`
                <span class="badge-pago-transferencia-tabla">
                  📱 ${formatCurrency(cell)}
                </span>
              `)
            },
            {
              name: 'Sistema',
              width: '110px',
              formatter: (cell) => gridjs.html(`
                <span class="fw-semibold text-info">${formatCurrency(cell)}</span>
              `)
            },
            {
              name: 'Final',
              width: '110px',
              formatter: (cell) => gridjs.html(`
                <span class="fw-bold text-success">${formatCurrency(cell)}</span>
              `)
            },
            {
              name: 'Diferencia',
              width: '100px',
              formatter: (cell) => {
                const className = getDiferenciaClass(cell);
                return gridjs.html(`<span class="${className}">${formatCurrency(cell)}</span>`);
              }
            },
            {
              name: 'Estado',
              width: '90px',
              formatter: (cell) => {
                if (cell === 'cerrada') {
                  return gridjs.html(`
                    <span class="badge-cerrada-mejorado">
                      <i class="fas fa-check"></i> Cerrada
                    </span>
                  `);
                } else {
                  return gridjs.html(`
                    <span class="badge-activa-mejorado">
                      <i class="fas fa-clock"></i> Activa
                    </span>
                  `);
                }
              }
            }
          ],
          data: data.detalle.map(item => [
            item.id,
            item.fecha_apertura,
            item.fecha_cierre,
            null, // La duración se calcula en el formatter
            item.monto_apertura,
            item.total_efectivo,
            item.total_tarjeta,
            item.total_transferencia,
            item.total_ventas_sistema,
            item.monto_cierre,
            item.diferencia_cierre,
            item.estatus
          ]),
          sort: true,
          pagination: {
            limit: 10,
            summary: true
          },
          search: {
            placeholder: '🔍 Buscar en cierres de caja...'
          },
          language: {
            'search': {
              'placeholder': '🔍 Buscar en cierres de caja...'
            },
            'pagination': {
              'previous': 'Anterior',
              'next': 'Siguiente',
              'showing': 'Mostrando',
              'of': 'de',
              'to': 'a',
              'results': 'registros'
            },
            'noRecordsFound': 'No se encontraron cierres de caja para las fechas seleccionadas'
          },
          style: {
            table: {
              'font-size': '14px'
            },
            th: {
              'background-color': '#f8f9fa',
              'color': '#495057',
              'font-weight': '600'
            }
          }
        }).render(container);
      },
      error: function (xhr, status, error) {
        console.error("❌ Error al cargar el reporte de cierre de caja:", error);
        container.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
            <p class="text-danger mt-3">Error al cargar los datos. Por favor, intenta nuevamente.</p>
          </div>
        `;
        resetSummaryCards();
      }
    });
  }

  // =================================================================
  // 4. MANEJADORES DE EVENTOS (CLICKS Y TABS)
  // =================================================================

  // --- Reporte Gráfico ---
  $("#generarReporte").click(function () {
    const tipoSeleccionado = $("#tipoReporte").val();
    const fechaInicio = $("#fechaInicio").val();
    const fechaFin = $("#fechaFin").val();
    cargarGraficaVentas(tipoSeleccionado, fechaInicio, fechaFin);
  });

  $('a[href="#productosMasVendidos"]').on("shown.bs.tab", () => cargarProductosMasVendidos());

  // --- Lógica para la nueva pestaña de Ventas ---
  $('a[href="#ventas"]').on("shown.bs.tab", function () {
    cargarVentas();
  });

  $(".filtro-ventas").click(function () {
    const $botones = $(".filtro-ventas");
    const $botonClickeado = $(this);

    $botones.removeClass("active");
    $botones.each(function () {
      const $btn = $(this);
      const solidClass = $btn.data('color-class');
      const outlineClass = 'btn-outline-' + solidClass.split('-')[1];
      $btn.removeClass(solidClass).addClass(outlineClass);
    });

    $botonClickeado.addClass("active");
    const solidClass = $botonClickeado.data('color-class');
    const outlineClass = 'btn-outline-' + solidClass.split('-')[1];
    $botonClickeado.removeClass(outlineClass).addClass(solidClass);

    cargarVentas();
  });

  // --- Devoluciones ---
  $('a[href="#devoluciones"]').on("shown.bs.tab", function () {
    cargarDevoluciones();
  });

  // --- Exportar a PDF (Ventas y Productos) ---
  $("#btnGenerarPDF").click(function () {
    const fechaInicio = $("#fechaInicioPDF").val();
    const fechaFin = $("#fechaFinPDF").val();
    if (!fechaInicio || !fechaFin) {
      Swal.fire("Error", "Debes seleccionar ambas fechas.", "error");
      return;
    }
    const url = `../controller/reportes.php?op=generar_pdf&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    window.open(url, "_blank");
  });

  $("#btnGenerarProductosPDF").click(function () {
    window.open('../controller/reportes.php?op=generar_productos_pdf', "_blank");
  });

  // --- Cierre de Caja (MEJORADO) ---
  $('a[href="#cierreCaja"]').on('shown.bs.tab', function () {
    $('#fechaInicioCierre').val(fechaInicioMes);
    $('#fechaFinCierre').val(fechaHoy);
    cargarCierreCaja(fechaInicioMes, fechaHoy);
  });

  $("#btnFiltrarCierre").click(function () {
    const fechaInicio = $("#fechaInicioCierre").val();
    const fechaFin = $("#fechaFinCierre").val();

    if (!fechaInicio || !fechaFin) {
      Swal.fire("Error", "Por favor selecciona ambas fechas.", "warning");
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Swal.fire("Error", "La fecha de inicio no puede ser mayor que la fecha de fin.", "warning");
      return;
    }

    cargarCierreCaja(fechaInicio, fechaFin);
  });

  // ✅ Nuevo manejador de eventos para el reporte de utilidades
  $('a[href="#utilidades"]').on('shown.bs.tab', function () {
    const fechaInicio = $('#fechaInicioUtilidad').val() || fechaInicioMes;
    const fechaFin = $('#fechaFinUtilidad').val() || fechaHoy;
    cargarUtilidades(fechaInicio, fechaFin);
  });

  $("#fechaInicioUtilidad, #fechaFinUtilidad").change(function () {
    const fechaInicio = $("#fechaInicioUtilidad").val();
    const fechaFin = $("#fechaFinUtilidad").val();
    if (fechaInicio && fechaFin) {
      cargarUtilidades(fechaInicio, fechaFin);
    }
  });

  // ✅ Nuevo manejador de eventos para el reporte de compras
  $('a[href="#compras"]').on('shown.bs.tab', function () {
    const fechaInicio = $('#fechaInicioCompras').val() || fechaInicioMes;
    const fechaFin = $('#fechaFinCompras').val() || fechaHoy;
    cargarCompras(fechaInicio, fechaFin);
  });

  $("#fechaInicioCompras, #fechaFinCompras").change(function () {
    const fechaInicio = $("#fechaInicioCompras").val();
    const fechaFin = $("#fechaFinCompras").val();
    if (fechaInicio && fechaFin) {
      cargarCompras(fechaInicio, fechaFin);
    }
  });

  // Eventos para cambios en fechas de ventas
  $("#fechaInicioVentas, #fechaFinVentas").change(() => cargarVentas());

  // === REIMPRESIÓN DE TICKETS ===
  // Función auxiliar para imprimir el HTML nativamente en ventana nueva
  function imprimirTicketReporte(html) {
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
  }

  // Evento delegado para el botón de reimprimir dentro de la tabla generada por GridJS
  $(document).on('click', '.btn-reimprimir', function (e) {
    e.preventDefault();
    const ticketId = $(this).data('ticket-id');

    if (!ticketId) return;

    Swal.fire({
      title: '¿Reimprimir ticket?',
      text: `Se reimprimirá el ticket # ${ticketId}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-print"></i> Reimprimir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {

        Swal.fire({
          title: 'Cargando...',
          text: 'Obteniendo datos del ticket',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        $.ajax({
          url: '../controller/reimprimir_ticket.php',
          type: 'POST',
          data: { ticket_id: ticketId },
          dataType: 'json',
          success: function (response) {
            Swal.close();
            if (response.success && response.print_html) {
              // Llamar a la función para imprimir
              imprimirTicketReporte(response.print_html);
            } else {
              Swal.fire('Error', response.error || 'No se pudo generar el ticket', 'error');
            }
          },
          error: function () {
            Swal.fire('Error', 'Error de conexión con el servidor', 'error');
          }
        });
      }
    });
  });

  // Carga inicial de la gráfica al entrar a la página
  cargarGraficaVentas('ventas_fecha', fechaInicioMes, fechaHoy);

});