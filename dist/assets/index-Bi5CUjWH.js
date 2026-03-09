(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();async function u(a,e={},t){return window.__TAURI_INTERNALS__.invoke(a,e,t)}class T{constructor(e){this.path=e}static async load(e){const t=await u("plugin:sql|load",{db:e});return new T(t)}static get(e){return new T(e)}async execute(e,t){const[i,s]=await u("plugin:sql|execute",{db:this.path,query:e,values:t??[]});return{lastInsertId:s,rowsAffected:i}}async select(e,t){return await u("plugin:sql|select",{db:this.path,query:e,values:t??[]})}async close(e){return await u("plugin:sql|close",{db:e})}}let v=null;async function I(){return v||(v=await T.load("sqlite:antojitos.db")),v}async function r(a,e=[]){return await(await I()).select(a,e)}async function C(){const a=await I();await a.execute("PRAGMA foreign_keys = ON;"),await a.execute("PRAGMA journal_mode = WAL;"),await a.execute(`
    CREATE TABLE IF NOT EXISTS tm_usuario (
      usu_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      usu_nom   TEXT,
      usu_ape   TEXT,
      usu_correo TEXT,
      usu_pass  TEXT,
      usu_empresa TEXT,
      usu_puesto TEXT,
      usu_photoprofile TEXT,
      est       INTEGER DEFAULT 1
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS tm_empleado (
      emp_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_nombre TEXT NOT NULL,
      emp_puesto TEXT NOT NULL,
      emp_estatus INTEGER NOT NULL DEFAULT 1,
      usu_id     INTEGER,
      sucursal_id INTEGER DEFAULT 1,
      FOREIGN KEY (usu_id) REFERENCES tm_usuario(usu_id) ON DELETE CASCADE
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_categorias (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre      TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      fecha_creacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_sucursales (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_sucursal  TEXT NOT NULL,
      direccion        TEXT,
      telefono         TEXT
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_productos (
      ID                     INTEGER PRIMARY KEY AUTOINCREMENT,
      pr_PLU                 TEXT,
      pr_nombre              TEXT NOT NULL,
      pr_descripcion         TEXT,
      pr_imagen              TEXT,
      pr_precioventa         REAL NOT NULL,
      pr_preciocompra        REAL NOT NULL DEFAULT 0,
      pr_stock               INTEGER,
      categoria_id           INTEGER,
      sucursal_id            INTEGER,
      pr_promocion_porcentaje REAL DEFAULT 0,
      pr_preciooriginal      REAL,
      pr_estatus             INTEGER NOT NULL DEFAULT 1,
      es_platillo            INTEGER DEFAULT 0,
      pr_totalventas         INTEGER DEFAULT 0,
      pr_favorito            INTEGER DEFAULT 0,
      pr_stock_minimo        INTEGER DEFAULT 10,
      FOREIGN KEY (categoria_id) REFERENCES rv_categorias(id)
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_insumos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre          TEXT NOT NULL,
      descripcion     TEXT,
      unidad_medida   TEXT NOT NULL,
      stock_actual    REAL NOT NULL DEFAULT 0,
      stock_minimo    REAL DEFAULT 0,
      costo_unitario  REAL DEFAULT 0,
      estatus         INTEGER DEFAULT 1,
      fecha_registro  TEXT DEFAULT (datetime('now','localtime')),
      fecha_modificacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_producto_insumos (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id       INTEGER NOT NULL,
      insumo_id         INTEGER NOT NULL,
      cantidad_necesaria REAL NOT NULL,
      UNIQUE (producto_id, insumo_id),
      FOREIGN KEY (producto_id) REFERENCES rv_productos(ID) ON DELETE CASCADE,
      FOREIGN KEY (insumo_id)   REFERENCES rv_insumos(id)   ON DELETE CASCADE
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_producto_componentes (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_padre_id     INTEGER NOT NULL,
      producto_componente_id INTEGER NOT NULL,
      cantidad_necesaria    REAL NOT NULL,
      UNIQUE (producto_padre_id, producto_componente_id),
      FOREIGN KEY (producto_padre_id)      REFERENCES rv_productos(ID) ON DELETE CASCADE,
      FOREIGN KEY (producto_componente_id) REFERENCES rv_productos(ID) ON DELETE CASCADE
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_apertura_caja (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha_apertura        TEXT NOT NULL,
      monto_apertura        REAL NOT NULL,
      usu_id                INTEGER NOT NULL,
      fecha_cierre          TEXT,
      monto_cierre          REAL,
      total_ventas_sistema  REAL,
      diferencia_cierre     REAL,
      estatus               TEXT NOT NULL DEFAULT 'activa',
      usu_id_cierre         INTEGER,
      notas_apertura        TEXT,
      notas_cierre          TEXT,
      ventas_efectivo       REAL,
      ventas_tarjeta        REAL,
      ventas_transferencia  REAL,
      gastos_efectivo       REAL
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_ventas (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket         INTEGER NOT NULL,
      fecha          TEXT NOT NULL,
      cantidad       INTEGER NOT NULL,
      id_producto    INTEGER,
      producto       TEXT NOT NULL,
      vendedor       INTEGER NOT NULL,
      metodo_pago    TEXT,
      total          REAL NOT NULL,
      total_ticket   REAL NOT NULL,
      cliente        TEXT,
      estatus        TEXT DEFAULT 'completado',
      plataforma_origen TEXT
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_comanda (
      com_id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id               INTEGER NOT NULL,
      com_fecha               TEXT DEFAULT (datetime('now','localtime')),
      com_cantidad            INTEGER NOT NULL,
      pr_PLU                  INTEGER NOT NULL,
      pr_nombre               TEXT NOT NULL,
      com_ingredientes_omitir TEXT,
      com_comentarios         TEXT,
      com_estatus             TEXT DEFAULT 'pendiente',
      ready_at                TEXT
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_config (
      id                             INTEGER PRIMARY KEY DEFAULT 1,
      last_comanda_update_timestamp  TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_gastos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_gasto      TEXT NOT NULL,
      descripcion     TEXT,
      fecha           TEXT NOT NULL,
      comentario      TEXT,
      precio_unitario REAL,
      tipo            TEXT DEFAULT 'operativo',
      metodo_pago     TEXT DEFAULT 'efectivo',
      tipo_item       TEXT,
      item_id         INTEGER,
      cantidad_comprada REAL,
      usu_id          INTEGER
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_gastos_fijos_plantilla (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria    TEXT NOT NULL DEFAULT 'Otro',
      concepto     TEXT NOT NULL UNIQUE,
      monto_base   REAL NOT NULL DEFAULT 0,
      descripcion  TEXT,
      activo       INTEGER NOT NULL DEFAULT 1,
      fecha_creacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_gastos_fijos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      plantilla_id INTEGER,
      categoria    TEXT NOT NULL DEFAULT 'Otro',
      concepto     TEXT NOT NULL,
      monto        REAL NOT NULL,
      mes          INTEGER NOT NULL,
      anio         INTEGER NOT NULL,
      fecha_pago   TEXT,
      metodo_pago  TEXT DEFAULT 'transferencia',
      notas        TEXT,
      usu_id       INTEGER,
      fecha_registro TEXT DEFAULT (datetime('now','localtime')),
      estatus      TEXT DEFAULT 'pagado',
      FOREIGN KEY (plantilla_id) REFERENCES rv_gastos_fijos_plantilla(id) ON DELETE SET NULL
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_devoluciones (
      dev_id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id       INTEGER NOT NULL,
      motivo          TEXT NOT NULL,
      usu_id          INTEGER NOT NULL,
      fecha_devolucion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_ingredientes (
      ingrediente_id  INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_ingrediente TEXT NOT NULL,
      categoria       TEXT,
      unidad_medida   TEXT,
      es_activo       INTEGER NOT NULL DEFAULT 1
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS rv_movimientos_insumos (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      insumo_id        INTEGER NOT NULL,
      tipo_movimiento  TEXT NOT NULL,
      cantidad         REAL NOT NULL,
      stock_anterior   REAL NOT NULL,
      stock_nuevo      REAL NOT NULL,
      motivo           TEXT,
      ticket_id        INTEGER,
      producto_id      INTEGER,
      usuario_id       INTEGER DEFAULT 1,
      fecha_movimiento TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (insumo_id) REFERENCES rv_insumos(id) ON DELETE CASCADE
    );
  `),await a.execute(`
    CREATE TABLE IF NOT EXISTS token_global (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      token  TEXT NOT NULL,
      fecha_actualizacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),(await a.select("SELECT COUNT(*) as total FROM tm_usuario"))[0].total===0&&(await a.execute(`INSERT INTO tm_usuario (usu_nom, usu_ape, usu_pass, usu_empresa, usu_puesto, est) VALUES
      ('Antojitos', '', '4dmin', 'Antojitos Santa Lucía', 'Admin', 1),
      ('caja', NULL, 'c4j4', 'Antojitos Santa Lucía', 'Cajero', 1)`),await a.execute(`INSERT INTO tm_empleado (emp_nombre, emp_puesto, emp_estatus, usu_id, sucursal_id) VALUES
      ('Los Regios', 'Admin', 1, 1, 1),
      ('Caja', 'Cajero', 1, NULL, 1)`),await a.execute(`INSERT INTO rv_sucursales (nombre_sucursal, direccion) VALUES
      ('Mitras pte', 'Varenna 209, 66036 Mitras Poniente, N.L., México')`),await a.execute(`INSERT INTO rv_categorias (nombre, descripcion) VALUES
      ('Platillos', 'Platillos fuertes'),
      ('Adicionales', 'Guarniciones y extras'),
      ('Bebidas', 'Refrescos y aguas'),
      ('Mixto', NULL)`),await a.execute("INSERT INTO rv_config (id) VALUES (1)"),await a.execute("INSERT INTO token_global (token) VALUES ('0000')")),console.log("[DB] Base de datos inicializada correctamente.")}function O(a){if(!document.getElementById("login-css")){const e=document.createElement("link");e.id="login-css",e.rel="stylesheet",e.href="/assets/css/login.css",document.head.appendChild(e)}a.innerHTML=`
    <div class="container-fluid h-100">
      <div class="row h-100">

        <!-- Columna de Branding -->
        <div class="col-lg-7 d-none d-lg-flex" id="branding-column">
          <div class="branding-content">
            <h1>Antojitos Santa Lucía</h1>
            <p>Antojitos Mexicanos</p>

            <div class="brand-features">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-utensils"></i>
                </div>
                <span>Gestión completa de pedidos</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <span>Control de ventas en tiempo real</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-mobile-alt"></i>
                </div>
                <span>Optimizado para tablet y móvil</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna del Formulario -->
        <div class="col-lg-5 col-12" id="form-column">
          <div class="login-card">
            <div class="text-center mb-4">
              <h2 class="fw-bold">Iniciar Sesión</h2>
              <p class="text-muted">Accede al sistema de gestión</p>
            </div>

            <div id="login-alert" style="display:none;"></div>

            <form id="loginForm">
              <div class="input-group mb-3">
                <span class="input-group-text"><i class="fas fa-user"></i></span>
                <input type="text" class="form-control form-control-lg" id="login-usuario"
                  placeholder="Ingresa tu usuario" autocomplete="username" required />
              </div>

              <div class="input-group mb-4">
                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                <input type="password" class="form-control form-control-lg" id="login-password"
                  placeholder="Ingresa tu contraseña" autocomplete="current-password" required />
              </div>

              <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="remember" />
                  <label class="form-check-label" for="remember">Recordar mis datos</label>
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100 btn-lg" id="loginBtn">
                <i class="fas fa-sign-in-alt me-2"></i>
                Acceder al Sistema
              </button>
            </form>

            <div class="text-center mt-4">
              <small class="text-muted">
                <i class="fas fa-shield-alt me-1"></i>
                Sistema seguro y confiable
              </small>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,U()}function U(){const a=document.getElementById("loginForm");document.getElementById("loginBtn"),document.querySelectorAll(".input-group").forEach(t=>{const i=t.querySelector(".form-control");i&&(i.addEventListener("focus",()=>{t.style.transform="scale(1.01)",t.style.transition="transform 0.3s ease"}),i.addEventListener("blur",()=>{t.style.transform="scale(1)"}),i.addEventListener("input",function(){this.value.length>0?(this.classList.add("is-valid"),this.classList.remove("is-invalid")):this.classList.remove("is-valid")}))}),a.addEventListener("submit",async t=>{t.preventDefault(),await k()})}async function k(){const a=document.getElementById("login-usuario").value.trim(),e=document.getElementById("login-password").value,t=document.getElementById("loginBtn");t.classList.add("loading"),t.innerHTML='<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...',t.disabled=!0,S();try{const i=await r(`SELECT u.usu_id, u.usu_nom, u.usu_puesto, e.emp_id, e.emp_nombre
       FROM tm_usuario u
       LEFT JOIN tm_empleado e ON e.usu_id = u.usu_id
       WHERE u.usu_nom = $1 AND u.usu_pass = $2 AND u.est = 1
       LIMIT 1`,[a,e]);if(i.length===0){g("El usuario o la contraseña son incorrectos.","danger");return}const s=i[0];window._session={usu_id:s.usu_id,nombre:s.usu_nom,puesto:s.usu_puesto,emp_id:s.emp_id,emp_nombre:s.emp_nombre},window.navigateTo("/caja")}catch(i){console.error("Error en login:",i),g("Error al conectar con la base de datos.","danger")}finally{t.classList.remove("loading"),t.innerHTML='<i class="fas fa-sign-in-alt me-2"></i>Acceder al Sistema',t.disabled=!1}}function g(a,e="danger"){const t=document.getElementById("login-alert");t.innerHTML=`<div class="alert alert-${e}" role="alert">${a}</div>`,t.style.display="block"}function S(){const a=document.getElementById("login-alert");a.style.display="none",a.innerHTML=""}function D(){if(document.getElementById("bottom-nav-css"))return;const a=document.createElement("link");a.id="bottom-nav-css",a.rel="stylesheet",a.href="/assets/css/bottom_nav_bar.css",document.head.appendChild(a)}function F(a,e,t){D();const i=window._session||{},s=i.puesto||"Admin",o=i.emp_nombre||i.nombre||"Usuario",n=s==="Admin",c=s==="Cajero"||n,d=s==="Cocinero"||n;a.innerHTML=`
    <!-- Navbar superior -->
    <nav class="navbar navbar-expand-lg sticky-top shadow-sm" style="background: linear-gradient(90deg, #007bff, #0056b3);">
      <div class="container-fluid py-2">
        <a class="navbar-brand d-flex align-items-center fw-bold text-white" href="#" onclick="window.navigateTo('/dashboard')">
          <i class="fa fa-chart-line me-2"></i>Antojitos Santa Lucía
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 text-center align-items-lg-center">
            ${E("dashboard",e,"Inicio")}
            ${E("cierre_caja",e,"Apertura/Cierre")}
            ${E("caja",e,"Caja")}
            ${E("productos",e,"Productos")}
            ${E("reportes",e,"Reportes")}
            ${E("comanda",e,"Comanda")}
            ${E("display",e,"Cliente")}
            <li class="nav-item">
              <a class="btn btn-light text-primary fw-semibold rounded-pill ms-lg-3 px-4" 
                href="#" onclick="window.navigateTo('/login')">Cerrar Sesión</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Contenido de la página -->
    <div class="main-content-wrapper-bottom-nav">
      ${t}
    </div>

    <!-- Bottom Navigation Bar -->
    <nav class="bottom-nav-bar" id="bottom-nav-bar">
      <a href="#" class="nav-item active" 
        onclick="window.navigateTo('/dashboard')">
        <i class="fas fa-home"></i>
        <span>Inicio</span>
      </a>
      ${c?`
      <a href="#" class="nav-item "
        onclick="window.navigateTo('/caja')">
        <i class="fas fa-cash-register"></i>
        <span>Caja</span>
      </a>`:""}
      ${n?`
      <a href="#" class="nav-item "
        onclick="window.navigateTo('/reportes')">
        <i class="fas fa-chart-line"></i>
        <span>Reportes</span>
      </a>`:""}
      <a href="#" class="nav-item" id="settings-nav-item">
        <i class="fas fa-bars"></i>
        <span>Más</span>
      </a>
    </nav>

    <!-- Drawer lateral -->
    <div class="settings-drawer" id="settings-drawer">
      <div class="drawer-header">
        <h3>Menú</h3>
        <button class="close-drawer-button" id="close-drawer-button">&times;</button>
      </div>
      <div class="drawer-content">
        <div class="drawer-grid">
          ${d?`
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/comanda')">
            <div class="drawer-card-icon icon-comanda"><i class="fas fa-kitchen-set"></i></div>
            <span>Comanda</span>
          </a>`:""}
          ${c?`
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/productos')">
            <div class="drawer-card-icon icon-productos"><i class="fas fa-box-open"></i></div>
            <span>Productos</span>
          </a>
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/display')">
            <div class="drawer-card-icon icon-clientes"><i class="fas fa-users"></i></div>
            <span>Clientes</span>
          </a>
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/cierre_caja')">
            <div class="drawer-card-icon icon-caja"><i class="fas fa-store"></i></div>
            <span>Apertura/Cierre</span>
          </a>
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/devoluciones')">
            <div class="drawer-card-icon icon-devoluciones"><i class="fas fa-undo"></i></div>
            <span>Devoluciones</span>
          </a>`:""}
          ${n?`
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/empleados')">
            <div class="drawer-card-icon icon-empleados"><i class="fas fa-user-cog"></i></div>
            <span>Empleados</span>
          </a>
          <a href="#" class="drawer-card" onclick="closeDrawer(); window.navigateTo('/token')">
            <div class="drawer-card-icon icon-token"><i class="fas fa-key"></i></div>
            <span>Ver Token</span>
          </a>`:""}
        </div>
        <hr class="drawer-divider">
        <ul class="drawer-list">
          <li>
            <a href="#" id="toggleDarkMode">
              <div class="list-icon"><i class="fas fa-moon"></i></div>
              <span>Modo Oscuro</span>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
          </li>
          <li>
            <a href="#" onclick="closeDrawer(); window.navigateTo('/login')">
              <div class="list-icon"><i class="fas fa-sign-out-alt"></i></div>
              <span>Cerrar Sesión</span>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
          </li>
        </ul>
      </div>
      <div class="drawer-user-profile">
        <div class="user-info">
          <span class="user-name">${o}</span>
        </div>
      </div>
    </div>
    <div class="drawer-overlay" id="drawer-overlay"></div>
  `,X()}function E(a,e,t){return`<li class="nav-item">
    <a class="nav-link ${e===a?"active text-warning fw-semibold":"text-white"}"
      href="#" onclick="window.navigateTo('/${a}')">${t}</a>
  </li>`}function X(){const a=document.getElementById("settings-nav-item");a&&a.addEventListener("click",M);const e=document.getElementById("close-drawer-button");e&&e.addEventListener("click",L);const t=document.getElementById("drawer-overlay");t&&t.addEventListener("click",L);const i=document.getElementById("toggleDarkMode");i&&i.addEventListener("click",s=>{s.preventDefault(),document.body.classList.toggle("dark-mode")})}function M(){var a,e;(a=document.getElementById("settings-drawer"))==null||a.classList.add("is-open"),(e=document.getElementById("drawer-overlay"))==null||e.classList.add("is-open")}function L(){var a,e;(a=document.getElementById("settings-drawer"))==null||a.classList.remove("is-open"),(e=document.getElementById("drawer-overlay"))==null||e.classList.remove("is-open")}window.closeDrawer=L;function x(a){G("dashboard-css","/assets/css/dashboard.css"),F(a,"dashboard",B()),R.init()}function G(a,e){if(document.getElementById(a))return;const t=document.createElement("link");t.id=a,t.rel="stylesheet",t.href=e,document.head.appendChild(t)}function B(){return`
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          <i class="fas fa-chart-line"></i>
          Dashboard
        </h1>
        <p class="dashboard-subtitle">Panel de control y métricas del negocio</p>
      </div>

      <!-- Loader -->
      <div id="dashboard-loader" class="dashboard-loader">
        <div class="spinner"></div>
        <p style="margin-top: 15px; color: #64748b;">Cargando información...</p>
      </div>

      <!-- KPIs Section -->
      <div id="kpis-section" class="kpis-container" style="display: none !important;">

        <div class="kpi-card success">
          <div class="kpi-content">
            <div class="kpi-icon success"><i class="fas fa-dollar-sign"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Ventas del Día</div>
              <div class="kpi-value" id="kpi-ventas-dia">$0.00</div>
            </div>
          </div>
        </div>

        <div class="kpi-card warning">
          <div class="kpi-content">
            <div class="kpi-icon warning"><i class="fas fa-hamburger"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Platillos Hoy</div>
              <div class="kpi-value" id="kpi-platillos-dia">0</div>
            </div>
          </div>
        </div>

        <div class="kpi-card purple">
          <div class="kpi-content">
            <div class="kpi-icon purple"><i class="fas fa-calendar-alt"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Ventas del Mes</div>
              <div class="kpi-value" id="kpi-ventas-mes">$0.00</div>
            </div>
          </div>
        </div>

        <div class="kpi-card danger">
          <div class="kpi-content">
            <div class="kpi-icon danger"><i class="fas fa-fire-burner"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">En Cocina (Comandas)</div>
              <div class="kpi-value" id="kpi-ordenes-cocina">0</div>
            </div>
          </div>
        </div>

        <div class="kpi-card caja">
          <div class="kpi-content">
            <div class="kpi-icon caja"><i class="fas fa-cash-register"></i></div>
            <div class="kpi-info kpi-caja-info">
              <div class="kpi-label">Estado de Caja</div>
              <div class="kpi-caja-estado">
                <span class="caja-indicador caja-cerrada" id="caja-indicador"></span>
                <span class="kpi-value" id="kpi-caja-estado" style="font-size: 1.2rem;">Cerrada</span>
              </div>
              <div class="kpi-caja-detalle">
                <div>Apertura: <span id="kpi-caja-hora">--:--</span></div>
                <div>Monto: <span id="kpi-caja-monto">$0.00</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Content Section -->
      <div id="content-section" class="content-grid" style="display: none;">
        <div class="dashboard-card">
          <h4 class="card-title">
            <i class="fas fa-chart-area"></i>
            Ventas de los Últimos 7 Días
          </h4>
          <div class="chart-container">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        <div class="dashboard-card">
          <h4 class="card-title">
            <i class="fas fa-bell"></i>
            Últimas Ventas
          </h4>
          <div id="last-sales-list" class="novedades-container"></div>
        </div>
      </div>

    </div>
  `}const R={chartInstance:null,refreshInterval:6e5,async init(){await H(),await this.loadData(),this.setupRefresh(),this.addEventListeners()},async loadData(){try{const[a,e,t]=await Promise.all([$(),P(),K()]);this.updateUI({kpis:a,ventas_semana:e,ultimas_ventas:t})}catch(a){console.error("Error dashboard:",a),this.showError()}},updateUI(a){this.hideLoader(),a.kpis&&this.updateKPIs(a.kpis),a.ventas_semana&&this.renderChart(a.ventas_semana),a.ultimas_ventas&&this.renderNovedades(a.ultimas_ventas)},updateKPIs(a){this.animateValue("kpi-ventas-dia",0,a.ventas_dia,1e3,!0),this.animateValue("kpi-platillos-dia",0,a.platillos_dia,1e3,!1),this.animateValue("kpi-ventas-mes",0,a.ventas_mes,1e3,!0),this.animateValue("kpi-ordenes-cocina",0,a.ordenes_cocina,1e3,!1),this.updateEstadoCaja(a)},updateEstadoCaja(a){const e=document.getElementById("kpi-caja-estado"),t=document.getElementById("kpi-caja-hora"),i=document.getElementById("kpi-caja-monto"),s=document.getElementById("caja-indicador");if(a.caja_estado==="abierta"){if(e&&(e.textContent="Abierta"),t&&a.caja_hora_apertura){const o=new Date(a.caja_hora_apertura);t.textContent=o.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}i&&(i.textContent=this.formatCurrency(a.caja_monto_apertura)),s&&(s.classList.remove("caja-cerrada"),s.classList.add("caja-abierta"))}else e&&(e.textContent="Cerrada"),t&&(t.textContent="--:--"),i&&(i.textContent="$0.00"),s&&(s.classList.remove("caja-abierta"),s.classList.add("caja-cerrada"))},animateValue(a,e,t,i,s){const o=document.getElementById(a);if(!o)return;const n=t-e;if(n===0){o.textContent=s?this.formatCurrency(t):t.toLocaleString("es-MX");return}const d=Date.now()+i,p=setInterval(()=>{const m=Math.max((d-Date.now())/i,0),l=Math.round(t-m*n);o.textContent=s?this.formatCurrency(l):l.toLocaleString("es-MX"),l>=t&&(clearInterval(p),o.textContent=s?this.formatCurrency(t):t.toLocaleString("es-MX"))},50)},renderChart(a){const e=document.getElementById("salesChart");if(!e||!window.Chart)return;const t=e.getContext("2d"),i=a.map(n=>new Date(n.dia+"T00:00:00").toLocaleDateString("es-MX",{weekday:"short",day:"numeric"})),s=a.map(n=>n.total_dia);this.chartInstance&&this.chartInstance.destroy();const o=t.createLinearGradient(0,0,0,300);o.addColorStop(0,"rgba(229, 118, 70, 0.8)"),o.addColorStop(1,"rgba(229, 94, 70, 0.4)"),this.chartInstance=new window.Chart(t,{type:"bar",data:{labels:i,datasets:[{label:"Ventas",data:s,backgroundColor:o,borderColor:"#d45437ff",borderWidth:2,borderRadius:8,borderSkipped:!1,maxBarThickness:60}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{intersect:!1,mode:"index"},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(30, 41, 59, 0.95)",titleColor:"#fff",bodyColor:"#fff",padding:12,cornerRadius:8,displayColors:!1,callbacks:{label:n=>"Ventas: "+this.formatCurrency(n.parsed.y)}}},scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.04)",drawBorder:!1},ticks:{color:"#64748b",font:{size:11},callback:n=>this.formatCurrency(n,!0)}},x:{grid:{display:!1},ticks:{color:"#64748b",font:{size:11}}}},animation:{duration:1e3,easing:"easeInOutQuart"}}})},renderNovedades(a){const e=document.getElementById("last-sales-list");if(e){if(!a||a.length===0){e.innerHTML=`
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No hay novedades por el momento</p>
        </div>`;return}e.innerHTML=a.map(t=>{var n,c;const i=((n=t.metodo_pago)==null?void 0:n.toLowerCase())==="efectivo"?'<i class="fas fa-money-bill-wave" style="color: #10b981;"></i>':'<i class="fas fa-credit-card" style="color: #d47037ff;"></i>',s=t.estatus?`<span class="ticket-status status-${t.estatus}">${t.estatus}</span>`:"",o=(c=t.productos)!=null&&c.length?`<ul class="ticket-products">
            ${t.productos.map(d=>`
              <li class="product-item">
                <span class="product-qty">${d.cantidad}x</span>
                ${d.producto}
              </li>`).join("")}
           </ul>`:"";return`
        <div class="ticket-item">
          <div class="ticket-header">
            <span class="ticket-number">Ticket #${t.ticket}</span>
            ${s}
          </div>
          ${o}
          <div class="ticket-footer">
            <span class="ticket-time">
              ${i} ${t.hora_venta}
            </span>
            <span class="ticket-amount">${this.formatCurrency(t.total_ticket)}</span>
          </div>
        </div>`}).join("")}},formatCurrency(a,e=!1){return e?"$"+new Intl.NumberFormat("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0}).format(a):new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2}).format(a)},hideLoader(){const a=document.getElementById("dashboard-loader"),e=document.getElementById("kpis-section"),t=document.getElementById("content-section");a&&(a.style.display="none"),e&&(e.style.display="flex",e.classList.add("animate-fadeInUp")),t&&(t.style.display="grid",t.classList.add("animate-fadeInUp"))},showError(){const a=document.getElementById("dashboard-loader");a&&(a.innerHTML=`
        <div class="empty-state">
          <i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>
          <p>Error al cargar los datos</p>
          <button onclick="window.DashboardApp.loadData()" style="
            margin-top:15px; padding:8px 20px; background:#d45c37ff;
            color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
            Reintentar
          </button>
        </div>`)},setupRefresh(){setInterval(()=>this.loadData(),this.refreshInterval)},addEventListeners(){document.querySelectorAll(".kpi-card").forEach(a=>{a.addEventListener("click",function(){this.style.transform="scale(0.98)",setTimeout(()=>{this.style.transform=""},150)})})}};window.DashboardApp=R;function j(){return new Date().toISOString().slice(0,10)}function Y(){const a=new Date;return{mes:a.getMonth()+1,anio:a.getFullYear()}}async function $(){var N,_;const a=j(),{mes:e,anio:t}=Y(),[i]=await r(`SELECT COALESCE(SUM(total), 0) as total FROM rv_ventas
     WHERE DATE(fecha) = $1 AND estatus = 'completado'`,[a]),s=parseFloat(i.total),[o]=await r(`SELECT COALESCE(SUM(cantidad), 0) as total FROM rv_ventas
     WHERE DATE(fecha) = $1 AND estatus = 'completado'`,[a]),n=parseInt(o.total),[c]=await r(`SELECT COALESCE(SUM(total), 0) as total FROM rv_ventas
     WHERE strftime('%m', fecha) = $1 AND strftime('%Y', fecha) = $2
     AND estatus = 'completado'`,[String(e).padStart(2,"0"),String(t)]),d=parseFloat(c.total),[p]=await r(`SELECT COUNT(DISTINCT ticket) as total FROM rv_ventas
     WHERE estatus = 'pendiente' OR estatus = 'en preparacion'`,[]),m=parseInt(p.total),l=await r(`SELECT fecha_apertura, monto_apertura FROM rv_apertura_caja
     WHERE estatus = 'activa' ORDER BY fecha_apertura DESC LIMIT 1`,[]),w=l.length>0?"abierta":"cerrada",b=((N=l[0])==null?void 0:N.fecha_apertura)??null,y=parseFloat(((_=l[0])==null?void 0:_.monto_apertura)??0);return{ventas_dia:s,platillos_dia:n,ventas_mes:d,ordenes_cocina:m,caja_estado:w,caja_hora_apertura:b,caja_monto_apertura:y}}async function P(){const a=await r(`SELECT DATE(fecha) as dia, COALESCE(SUM(total), 0) as total_dia
     FROM rv_ventas
     WHERE fecha >= DATE('now', '-6 days') AND estatus = 'completado'
     GROUP BY DATE(fecha)
     ORDER BY DATE(fecha) ASC`,[]),e=[];for(let t=6;t>=0;t--){const i=new Date;i.setDate(i.getDate()-t);const s=i.toISOString().slice(0,10),o=a.find(n=>n.dia===s);e.push({dia:s,total_dia:o?parseFloat(o.total_dia):0})}return e}async function K(){const a=await r(`SELECT DISTINCT ticket FROM rv_ventas
     WHERE estatus = 'completado'
     ORDER BY fecha DESC LIMIT 5`,[]),e=[];for(const t of a){const[i]=await r(`SELECT total_ticket, metodo_pago, time(fecha) as hora_venta, estatus
       FROM rv_ventas WHERE ticket = $1 AND estatus = 'completado' LIMIT 1`,[t.ticket]),s=await r(`SELECT producto, cantidad FROM rv_ventas
       WHERE ticket = $1 AND estatus = 'completado'`,[t.ticket]);i&&e.push({ticket:t.ticket,total_ticket:parseFloat(i.total_ticket),metodo_pago:i.metodo_pago,hora_venta:i.hora_venta,estatus:i.estatus,productos:s})}return e}function H(){return new Promise(a=>{if(window.Chart)return a();const e=document.createElement("script");e.src="https://cdn.jsdelivr.net/npm/chart.js",e.onload=a,document.head.appendChild(e)})}const h=document.getElementById("app"),f={"/login":()=>O(h),"/dashboard":()=>x(h)};async function A(a){const e=f[a]||f["/login"];if(a!=="/login"&&!window._session)return f["/login"]();e()}window.navigateTo=a=>{location.hash=a};window.addEventListener("hashchange",()=>{A(location.hash.slice(1)||"/login")});(async()=>{await C();const a=location.hash.slice(1)||"/login";A(a)})();
