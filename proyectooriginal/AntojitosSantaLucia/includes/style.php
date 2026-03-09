<style>
body {
  background-color: #f0f2f5;
  /* Mantenemos el fondo suave */
  font-family: 'SF Pro Display', 'Roboto', sans-serif;
}

/* El card-body principal dentro del scroll-container */
.scroll-container .card-body {
  padding: 30px;
}

/* El card-body principal dentro del scroll-container */
.scroll-container .card-bodyX {
  top: 10px;
}

/* Título principal de la página */
.card-title {
  font-size: 2.2em;
  font-weight: 800;
  /* Más grueso para más impacto */
  color: #1c1e21;
  margin-bottom: 30px;
  text-align: center;
}

/* === 2. NUEVO ESTILO PARA PESTAÑAS (Segmented Control) === */
.nav-tabs {
  border: none;
  background-color: #e9e9ed;
  /* Fondo del control más integrado */
  border-radius: 12px;
  padding: 5px;
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  margin-bottom: 30px;
}

.nav-tabs::-webkit-scrollbar {
  display: none;
}

.nav-tabs .nav-item {
  margin: 0;
}

.nav-tabs .nav-link {
  background: transparent;
  color: #333;
  font-weight: 600;
  border: none;
  text-align: center;
  border-radius: 9px;
  padding: 10px 20px;
  white-space: nowrap;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-tabs .nav-link.active {
  background-color: #ffffff;
  color: #007aff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12), 0 3px 1px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

.nav-tabs .nav-link:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.6);
}

/* === 3. ESTILO PARA PANELES DE CONTENIDO Y FORMULARIOS === */
.tab-content .tab-pane {
  background-color: #ffffff;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tab-content .tab-container {
  background-color: #ffffff;
  border-radius: 15px;
  top: 100px;

  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tab-pane h4 {
  font-size: 1.5em;
  font-weight: 700;
  color: #1a1a1a;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 25px;
}

/* Contenedor para los filtros de fecha */
.filters-bar {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

/* Inputs y Selects dentro de los reportes */
.form-control,
.form-select {
  border-radius: 10px;
  padding: 10px 15px;
  border: 1px solid #ced4da;
  background-color: #fff;
}

.form-control:focus,
.form-select:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 0.2rem rgba(0, 122, 255, 0.2);
}

label.form-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #495057;
}

/* === 4. BOTONES Y OTROS ELEMENTOS === */
.btn-ios {
  font-size: 1rem;
  padding: 12px 25px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
}

.btn-ios:active {
  transform: scale(0.98);
}

/* Botones principales con gradiente */
.btn-ios.btn-primary {
  background: linear-gradient(45deg, #007aff, #0056b3);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
}

.btn-ios.btn-danger {
  background: linear-gradient(45deg, #ff3b30, #c70039);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 59, 48, 0.3);
}

/* Estilo para los filtros de venta (Tarjeta/Efectivo) */
.filtro-ventas {
  background-color: #e9ecef;
  color: #495057;
  box-shadow: none;
}

.filtro-ventas.active {
  background-color: #343a40;
  color: white;
}

/* === 5. ESTILOS PARA GRÁFICAS Y TABLAS (Tabulator) === */
#ventasPorTicketChart,
#tablaProductosMasVendidos,
#tablaUltimasVentas {
  margin-top: 20px;
}

.tabulator {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.tabulator .tabulator-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tabulator .tabulator-header .tabulator-col {
  background-color: #f8f9fa;
  font-weight: 600;
}


.input-group-text {
  background-color: transparent;
  border: none;
}
</style>


