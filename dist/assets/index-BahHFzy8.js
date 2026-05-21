(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function a(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(i){if(i.ep)return;i.ep=!0;const n=a(i);fetch(i.href,n)}})();const We="modulepreload",Ye=function(e){return"/"+e},$e={},B=function(t,a,o){let i=Promise.resolve();if(a&&a.length>0){let s=function(l){return Promise.all(l.map(v=>Promise.resolve(v).then(d=>({status:"fulfilled",value:d}),d=>({status:"rejected",reason:d}))))};document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),c=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));i=s(a.map(l=>{if(l=Ye(l),l in $e)return;$e[l]=!0;const v=l.endsWith(".css"),d=v?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${d}`))return;const p=document.createElement("link");if(p.rel=v?"stylesheet":We,v||(p.as="script"),p.crossOrigin="",p.href=l,c&&p.setAttribute("nonce",c),document.head.appendChild(p),v)return new Promise((u,m)=>{p.addEventListener("load",u),p.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${l}`)))})}))}function n(s){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=s,window.dispatchEvent(r),!r.defaultPrevented)throw s}return i.then(s=>{for(const r of s||[])r.status==="rejected"&&n(r.reason);return t().catch(n)})};function $(e,t,a,o){if(typeof t=="function"?e!==t||!o:!t.has(e))throw new TypeError("Cannot read private member from an object whose class did not declare it");return a==="m"?o:a==="a"?o.call(e):o?o.value:t.get(e)}function Z(e,t,a,o,i){if(typeof t=="function"?e!==t||!0:!t.has(e))throw new TypeError("Cannot write private member to an object whose class did not declare it");return t.set(e,a),a}var W,j,J,de,me;const _e="__TAURI_TO_IPC_KEY__";function De(e,t=!1){return window.__TAURI_INTERNALS__.transformCallback(e,t)}class Fe{constructor(t){W.set(this,void 0),j.set(this,0),J.set(this,[]),de.set(this,void 0),Z(this,W,t||(()=>{})),this.id=De(a=>{const o=a.index;if("end"in a){o==$(this,j,"f")?this.cleanupCallback():Z(this,de,o);return}const i=a.message;if(o==$(this,j,"f")){for($(this,W,"f").call(this,i),Z(this,j,$(this,j,"f")+1);$(this,j,"f")in $(this,J,"f");){const n=$(this,J,"f")[$(this,j,"f")];$(this,W,"f").call(this,n),delete $(this,J,"f")[$(this,j,"f")],Z(this,j,$(this,j,"f")+1)}$(this,j,"f")===$(this,de,"f")&&this.cleanupCallback()}else $(this,J,"f")[o]=i})}cleanupCallback(){window.__TAURI_INTERNALS__.unregisterCallback(this.id)}set onmessage(t){Z(this,W,t)}get onmessage(){return $(this,W,"f")}[(W=new WeakMap,j=new WeakMap,J=new WeakMap,de=new WeakMap,_e)](){return`__CHANNEL__:${this.id}`}toJSON(){return this[_e]()}}class Te{constructor(t,a,o){this.plugin=t,this.event=a,this.channelId=o}async unregister(){return U(`plugin:${this.plugin}|remove_listener`,{event:this.event,channelId:this.channelId})}}async function Ke(e,t,a){const o=new Fe(a);try{return await U(`plugin:${e}|register_listener`,{event:t,handler:o}),new Te(e,t,o.id)}catch{return await U(`plugin:${e}|registerListener`,{event:t,handler:o}),new Te(e,t,o.id)}}async function Je(e){return U(`plugin:${e}|check_permissions`)}async function Qe(e){return U(`plugin:${e}|request_permissions`)}async function U(e,t={},a){return window.__TAURI_INTERNALS__.invoke(e,t,a)}function Ze(e,t="asset"){return window.__TAURI_INTERNALS__.convertFileSrc(e,t)}class et{get rid(){return $(this,me,"f")}constructor(t){me.set(this,void 0),Z(this,me,t)}async close(){return U("plugin:resources|close",{rid:this.rid})}}me=new WeakMap;function tt(){return!!(globalThis||window).isTauri}const ee=Object.freeze(Object.defineProperty({__proto__:null,Channel:Fe,PluginListener:Te,Resource:et,SERIALIZE_TO_IPC_FN:_e,addPluginListener:Ke,checkPermissions:Je,convertFileSrc:Ze,invoke:U,isTauri:tt,requestPermissions:Qe,transformCallback:De},Symbol.toStringTag,{value:"Module"}));class fe{constructor(t){this.path=t}static async load(t){const a=await U("plugin:sql|load",{db:t});return new fe(a)}static get(t){return new fe(t)}async execute(t,a){const[o,i]=await U("plugin:sql|execute",{db:this.path,query:t,values:a??[]});return{lastInsertId:i,rowsAffected:o}}async select(t,a){return await U("plugin:sql|select",{db:this.path,query:t,values:a??[]})}async close(t){return await U("plugin:sql|close",{db:t})}}let he=null;async function Ie(){return he||(he=await fe.load("sqlite:antojitos.db")),he}async function f(e,t=[]){return await(await Ie()).select(e,t)}async function w(e,t=[]){return await(await Ie()).execute(e,t)}async function at(){var a;const e=await Ie();await e.execute("PRAGMA foreign_keys = ON;"),await e.execute("PRAGMA journal_mode = WAL;"),await e.execute(`
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
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS tm_empleado (
      emp_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_nombre TEXT NOT NULL,
      emp_puesto TEXT NOT NULL,
      emp_estatus INTEGER NOT NULL DEFAULT 1,
      usu_id     INTEGER,
      sucursal_id INTEGER DEFAULT 1,
      FOREIGN KEY (usu_id) REFERENCES tm_usuario(usu_id) ON DELETE CASCADE
    );
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_categorias (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre      TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      fecha_creacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_sucursales (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_sucursal  TEXT NOT NULL,
      direccion        TEXT,
      telefono         TEXT
    );
  `),await e.execute(`
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
  `),await e.execute(`
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
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_producto_insumos (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id       INTEGER NOT NULL,
      insumo_id         INTEGER NOT NULL,
      cantidad_necesaria REAL NOT NULL,
      UNIQUE (producto_id, insumo_id),
      FOREIGN KEY (producto_id) REFERENCES rv_productos(ID) ON DELETE CASCADE,
      FOREIGN KEY (insumo_id)   REFERENCES rv_insumos(id)   ON DELETE CASCADE
    );
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_producto_componentes (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_padre_id     INTEGER NOT NULL,
      producto_componente_id INTEGER NOT NULL,
      cantidad_necesaria    REAL NOT NULL,
      UNIQUE (producto_padre_id, producto_componente_id),
      FOREIGN KEY (producto_padre_id)      REFERENCES rv_productos(ID) ON DELETE CASCADE,
      FOREIGN KEY (producto_componente_id) REFERENCES rv_productos(ID) ON DELETE CASCADE
    );
  `),await e.execute(`
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
  `),await e.execute(`
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
  `),await e.execute(`
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
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_config (
      id                             INTEGER PRIMARY KEY DEFAULT 1,
      last_comanda_update_timestamp  TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await e.execute(`
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
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_gastos_fijos_plantilla (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria    TEXT NOT NULL DEFAULT 'Otro',
      concepto     TEXT NOT NULL UNIQUE,
      monto_base   REAL NOT NULL DEFAULT 0,
      descripcion  TEXT,
      activo       INTEGER NOT NULL DEFAULT 1,
      fecha_creacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await e.execute(`
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
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_devoluciones (
      dev_id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id       INTEGER NOT NULL,
      motivo          TEXT NOT NULL,
      usu_id          INTEGER NOT NULL,
      fecha_devolucion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_ingredientes (
      ingrediente_id  INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_ingrediente TEXT NOT NULL,
      categoria       TEXT,
      unidad_medida   TEXT,
      es_activo       INTEGER NOT NULL DEFAULT 1
    );
  `),await e.execute(`
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
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS token_global (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      token  TEXT NOT NULL,
      fecha_actualizacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `),await e.execute(`
    CREATE TABLE IF NOT EXISTS rv_licencia_local (
      id                 INTEGER PRIMARY KEY DEFAULT 1,
      fecha_ultimo_sync  TEXT NOT NULL,
      fecha_expiracion   TEXT NOT NULL,
      ventas_desde_sync  INTEGER NOT NULL DEFAULT 0,
      firma_digital      TEXT NOT NULL
    );
  `);try{const o=await e.select("SELECT COUNT(*) as c FROM rv_licencia_local");if(!o||o[0].c===0||o[0].c==="0"){const{invoke:i}=((a=window.__TAURI__)==null?void 0:a.core)||await B(()=>Promise.resolve().then(()=>ee),void 0),n=new Date,s=new Date(n.getTime()+10080*60*1e3),r=n.toISOString().replace("T"," ").substring(0,19),c=s.toISOString().replace("T"," ").substring(0,19),l=0,v=await i("generar_firma_licencia",{fechaUltimoSync:r,fechaExpiracion:c,ventasDesdeSync:l});await e.execute(`INSERT INTO rv_licencia_local 
        (id, fecha_ultimo_sync, fecha_expiracion, ventas_desde_sync, firma_digital) 
        VALUES (1, $1, $2, $3, $4)`,[r,c,l,v])}}catch(o){console.error("Error inicializando licencia:",o)}await e.execute(`INSERT OR IGNORE INTO tm_usuario (usu_id, usu_nom, usu_ape, usu_pass, usu_empresa, usu_puesto, est) VALUES
    (1,'Antojitos','','4dmin','Antojitos Santa Lucía','Admin',1),
    (3,'caja',NULL,'c4j4','Antojitos Santa Lucía','Cajero',1)`),await e.execute(`INSERT OR IGNORE INTO tm_empleado (emp_id, emp_nombre, emp_puesto, emp_estatus, usu_id, sucursal_id) VALUES
    (1,'Los Regios','Admin',1,1,1),
    (7,'Caja','Cajero',1,NULL,1)`),await e.execute(`INSERT OR IGNORE INTO rv_sucursales (id, nombre_sucursal, direccion) VALUES
    (1,'Mitras pte','Varenna 209, 66036 Mitras Poniente, N.L., México')`),await e.execute(`INSERT OR IGNORE INTO rv_categorias (id, nombre, descripcion) VALUES
    (1,'Platillos','Platillos fuertes'),
    (2,'Adicionales','Guarniciones y extras'),
    (3,'Bebidas','Refrescos y aguas'),
    (4,'Mixto',NULL)`),await e.execute(`INSERT OR IGNORE INTO rv_productos
    (ID,pr_nombre,pr_precioventa,pr_preciocompra,pr_stock,categoria_id,pr_estatus,es_platillo,pr_totalventas,pr_favorito,pr_stock_minimo)
    VALUES
    (1,'Enchiladas (6 pzs) - Sin cebolla',90,0,NULL,1,1,1,0,0,10),
    (2,'Enchiladas (6 pzs) - Con cebolla',90,0,NULL,1,1,1,1,0,10),
    (3,'Flautas de Res (5 pzs)',90,0,NULL,1,1,1,5,0,10),
    (4,'Tacos Dorados de Deshebrada (5 pzs)',90,0,NULL,1,1,1,0,0,10),
    (5,'Tacos Suaves de Deshebrada (5 pzs)',90,0,NULL,1,1,1,0,0,10),
    (6,'Sopes de Chicharrón (4 pzs)',90,0,NULL,1,1,1,3,0,10),
    (7,'Sopes de Deshebrada (4 pzs)',90,0,NULL,1,1,1,0,0,10),
    (8,'Sopes de Picadillo (4 pzs)',90,0,NULL,1,1,1,0,0,10),
    (9,'Sopes de Frijoles con Queso (4 pzs)',90,0,NULL,1,1,1,0,0,10),
    (10,'Orden de Papa',40,0,NULL,2,1,1,0,0,10),
    (11,'Guacamole Extra',20,0,NULL,2,1,1,0,0,10),
    (12,'Refresco',25,0,100,3,1,0,0,0,10),
    (13,'Orden Mixta',0,0,NULL,4,1,0,0,0,10),
    (14,'Sope (Mixta)',23,0,NULL,1,1,1,18,0,10),
    (15,'Flauta (Mixta)',18,0,NULL,1,1,1,17,0,10),
    (16,'Taco (Mixta)',18,0,NULL,1,1,1,12,0,10),
    (17,'Enchilada (Mixta)',18,0,NULL,1,1,1,3,0,10)`),await e.execute(`INSERT OR IGNORE INTO rv_ingredientes (ingrediente_id,nombre_ingrediente,categoria,unidad_medida,es_activo) VALUES
    (1,'Cebolla','Verduras','gramos',1),
    (2,'Tomate','Verduras','gramos',1),
    (3,'Lechuga','Verduras','gramos',1),
    (4,'Pepinillos','Verduras','gramos',1),
    (5,'Aguacate','Verduras','gramos',1),
    (6,'Mayonesa','Aderezos','gramos',1),
    (7,'Catsup','Aderezos','gramos',1),
    (8,'Mostaza','Aderezos','gramos',1),
    (9,'Salsa','Aderezos','gramos',1),
    (10,'Aderezo Ranch','Aderezos','gramos',1),
    (11,'Queso','Otros','rebanada',1),
    (12,'Tocino','Otros','tiras',1),
    (13,'Papas fritas','Otros','gramos',1)`),await e.execute(`INSERT OR IGNORE INTO rv_apertura_caja
    (id,fecha_apertura,monto_apertura,usu_id,estatus)
    VALUES (2,'2026-02-25 19:53:42',500,1,'activa')`),await e.execute(`INSERT OR IGNORE INTO rv_ventas
    (id,ticket,fecha,cantidad,id_producto,producto,vendedor,metodo_pago,total,total_ticket,cliente,estatus)
    VALUES
    (17,1,'2026-02-25 19:54:29',3,14,'Sope (Mixta)',7,'efectivo',69,105,'','completado'),
    (18,1,'2026-02-25 19:54:29',1,15,'Flauta (Mixta)',7,'efectivo',18,105,'','completado'),
    (19,1,'2026-02-25 19:54:29',1,16,'Taco (Mixta)',7,'efectivo',18,105,'','completado'),
    (20,2,'2026-02-25 19:59:44',4,14,'Sope (Mixta)',7,'efectivo',92,200,'','completado'),
    (21,2,'2026-02-25 19:59:44',4,15,'Flauta (Mixta)',7,'efectivo',72,200,'','completado'),
    (22,2,'2026-02-25 19:59:44',2,16,'Taco (Mixta)',7,'efectivo',36,200,'','completado'),
    (23,3,'2026-02-25 20:07:59',1,6,'Sopes de Chicharrón (4 pzs)',7,'transferencia',90,90,'jose','completado'),
    (24,4,'2026-02-25 23:14:15',4,14,'Sope (Mixta)',7,'efectivo',92,164,'','completado'),
    (25,4,'2026-02-25 23:14:15',2,15,'Flauta (Mixta)',7,'efectivo',36,164,'','completado'),
    (26,4,'2026-02-25 23:14:15',2,16,'Taco (Mixta)',7,'efectivo',36,164,'','completado'),
    (27,5,'2026-02-25 23:16:20',1,14,'Sope (Mixta)',7,'efectivo',23,77,'','completado'),
    (28,5,'2026-02-25 23:16:20',1,15,'Flauta (Mixta)',7,'efectivo',18,77,'','completado'),
    (29,5,'2026-02-25 23:16:20',2,16,'Taco (Mixta)',7,'efectivo',36,77,'','completado'),
    (30,6,'2026-02-25 23:19:00',1,14,'Sope (Mixta)',7,'efectivo',23,95,'','completado'),
    (31,6,'2026-02-25 23:19:00',1,15,'Flauta (Mixta)',7,'efectivo',18,95,'','completado'),
    (32,6,'2026-02-25 23:19:00',3,17,'Enchilada (Mixta)',7,'efectivo',54,95,'','completado'),
    (33,7,'2026-02-26 17:29:13',1,2,'Enchiladas (6 pzs) - Con cebolla',7,'efectivo',90,90,'','completado'),
    (34,8,'2026-02-26 17:30:19',2,6,'Sopes de Chicharrón (4 pzs)',7,'transferencia',180,270,'','completado'),
    (35,8,'2026-02-26 17:30:19',1,3,'Flautas de Res (5 pzs)',7,'transferencia',90,270,'','completado'),
    (36,9,'2026-02-26 17:31:30',3,3,'Flautas de Res (5 pzs)',7,'efectivo',270,424,'','completado'),
    (37,9,'2026-02-26 17:31:30',2,14,'Sope (Mixta)',7,'efectivo',46,424,'','completado'),
    (38,9,'2026-02-26 17:31:30',2,15,'Flauta (Mixta)',7,'efectivo',36,424,'','completado'),
    (39,9,'2026-02-26 17:31:30',1,16,'Taco (Mixta)',7,'efectivo',18,424,'','completado'),
    (40,9,'2026-02-26 17:31:30',3,15,'Flauta (Mixta)',7,'efectivo',54,424,'','completado'),
    (41,10,'2026-02-26 18:00:50',2,14,'Sope (Mixta)',7,'efectivo',46,195,'','completado'),
    (42,10,'2026-02-26 18:00:50',1,15,'Flauta (Mixta)',7,'efectivo',18,195,'','completado'),
    (43,10,'2026-02-26 18:00:50',1,16,'Taco (Mixta)',7,'efectivo',18,195,'','completado'),
    (44,10,'2026-02-26 18:00:50',1,14,'Sope (Mixta)',7,'efectivo',23,195,'','completado'),
    (45,10,'2026-02-26 18:00:50',2,15,'Flauta (Mixta)',7,'efectivo',36,195,'','completado'),
    (46,10,'2026-02-26 18:00:50',3,16,'Taco (Mixta)',7,'efectivo',54,195,'','completado'),
    (47,11,'2026-02-26 18:23:07',1,3,'Flautas de Res (5 pzs)',7,'efectivo',90,90,'','completado')`),await e.execute(`INSERT OR IGNORE INTO rv_gastos
    (id,tipo_gasto,descripcion,fecha,comentario,precio_unitario,tipo,metodo_pago,usu_id)
    VALUES (2,'Corte Preventivo','CORTE PREVENTIVO CAJA','2026-02-26 17:32:59','Realizado por: Caja',1500,'operativo','efectivo',1)`),await e.execute("INSERT OR IGNORE INTO rv_config (id) VALUES (1)"),await e.execute("INSERT OR IGNORE INTO token_global (id, token) VALUES (1,'6376')");const t=["ALTER TABLE rv_ventas ADD COLUMN tipo_orden TEXT DEFAULT 'llevar'","ALTER TABLE rv_ventas ADD COLUMN sensor_num TEXT","ALTER TABLE rv_ventas ADD COLUMN direccion TEXT","ALTER TABLE rv_ventas ADD COLUMN costo_envio REAL DEFAULT 0","ALTER TABLE rv_ventas ADD COLUMN monto_efectivo REAL DEFAULT 0","ALTER TABLE rv_ventas ADD COLUMN monto_tarjeta REAL DEFAULT 0","ALTER TABLE rv_ventas ADD COLUMN monto_transferencia REAL DEFAULT 0"];for(const o of t)try{await e.execute(o)}catch{}console.log("[DB] Base de datos inicializada correctamente.")}function ot(){if(document.getElementById("bottom-nav-css"))return;const e=document.createElement("link");e.id="bottom-nav-css",e.rel="stylesheet",e.href="/assets/css/bottom_nav_bar.css",document.head.appendChild(e)}function z(e,t,a){ot();const o=window._session||{},i=o.puesto||"Admin",n=o.emp_nombre||o.nombre||"Usuario",s=i==="Admin"||i==="Administrativo"||i==="administrador",r=i==="Cajero"||s,c=i==="Cocinero"||s;e.innerHTML=`
    <!-- Contenido de la página -->
    <div class="main-content-wrapper-bottom-nav">
      ${a}
    </div>

    <!-- Bottom Navigation Bar -->
    <nav class="bottom-nav-bar" id="bottom-nav-bar">
      <div class="nav-item route-link ${t==="dashboard"?"active":""}" style="cursor:pointer;" data-path="/dashboard">
        <i class="fas fa-home"></i>
        <span>Inicio</span>
      </div>
      ${r?`
      <div class="nav-item route-link ${t==="caja"?"active":""}" style="cursor:pointer;" data-path="/caja">
        <i class="fas fa-cash-register"></i>
        <span>Caja</span>
      </div>`:""}
      ${s?`
      <div class="nav-item route-link ${t==="reportes"?"active":""}" style="cursor:pointer;" data-path="/reportes">
        <i class="fas fa-chart-line"></i>
        <span>Reportes</span>
      </div>`:""}
      <div class="nav-item" id="settings-nav-item" style="cursor:pointer;">
        <i class="fas fa-bars"></i>
        <span>Más</span>
      </div>
    </nav>

    <!-- Drawer lateral -->
    <div class="settings-drawer" id="settings-drawer">
      <div class="drawer-header">
        <h3>Menú</h3>
        <button class="close-drawer-button" id="close-drawer-button">&times;</button>
      </div>
      <div class="drawer-content">
        <div class="drawer-grid">
          ${c?`
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/comanda">
            <div class="drawer-card-icon icon-comanda"><i class="fas fa-kitchen-set"></i></div>
            <span>Comanda</span>
          </div>`:""}
          ${r?`
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/productos">
            <div class="drawer-card-icon icon-productos"><i class="fas fa-box-open"></i></div>
            <span>Productos</span>
          </div>`:""}
          ${c?`
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/display">
            <div class="drawer-card-icon icon-clientes"><i class="fas fa-users"></i></div>
            <span>Clientes</span>
          </div>`:""}
          ${r?`
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/cierre_caja">
            <div class="drawer-card-icon icon-caja"><i class="fas fa-store"></i></div>
            <span>Apertura/Cierre</span>
          </div>
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/devoluciones">
            <div class="drawer-card-icon icon-devoluciones"><i class="fas fa-undo"></i></div>
            <span>Devoluciones</span>
          </div>
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/salidas_efectivo">
            <div class="drawer-card-icon icon-salidas"><i class="fas fa-hand-holding-usd"></i></div>
            <span>Salidas</span>
          </div>`:""}
          ${s?`
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/token">
            <div class="drawer-card-icon icon-token"><i class="fas fa-key"></i></div>
            <span>Ver Token</span>
          </div>
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/empleados">
            <div class="drawer-card-icon icon-empleados"><i class="fas fa-user-cog"></i></div>
            <span>Empleados</span>
          </div>
          <div class="drawer-card route-link" style="cursor:pointer;" data-path="/sincronizacion">
            <div class="drawer-card-icon icon-sync"><i class="fas fa-cloud-upload-alt"></i></div>
            <span>Sincronización</span>
          </div>`:""}
        </div>
        <hr class="drawer-divider">
        <ul class="drawer-list">
          <li>
            <div id="toggleDarkMode" style="cursor:pointer; display:flex; align-items:center; width:100%; padding: 12px 0;">
              <div class="list-icon"><i class="fas fa-moon"></i></div>
              <span>Modo Oscuro</span>
              <i class="fas fa-chevron-right arrow-icon" style="margin-left:auto;"></i>
            </div>
          </li>
          <li>
            <div class="route-link" style="cursor:pointer; display:flex; align-items:center; width:100%; padding: 12px 0;" data-path="/ayuda">
              <div class="list-icon"><i class="fas fa-question-circle"></i></div>
              <span>Ayuda y soporte técnico</span>
              <i class="fas fa-chevron-right arrow-icon" style="margin-left:auto;"></i>
            </div>
          </li>
          <li>
            <div class="route-link" style="cursor:pointer; display:flex; align-items:center; width:100%; padding: 12px 0;" data-path="/login">
              <div class="list-icon"><i class="fas fa-sign-out-alt"></i></div>
              <span>Cerrar Sesión</span>
              <i class="fas fa-chevron-right arrow-icon" style="margin-left:auto;"></i>
            </div>
          </li>
        </ul>
      </div>
      <div class="drawer-user-profile">
        <div class="user-info">
          <span class="user-name">${n}</span>
        </div>
      </div>
    </div>
    <div class="drawer-overlay" id="drawer-overlay"></div>
  `,it()}function it(){const e=document.getElementById("settings-nav-item");e&&e.addEventListener("click",i=>{i.preventDefault(),st()});const t=document.getElementById("close-drawer-button");t&&t.addEventListener("click",ve);const a=document.getElementById("drawer-overlay");a&&a.addEventListener("click",ve),document.querySelectorAll(".route-link").forEach(i=>{i.addEventListener("click",n=>{n.preventDefault();const s=i.getAttribute("data-path");s&&(i.closest("#settings-drawer")&&ve(),window.navigateTo(s))})});const o=document.getElementById("toggleDarkMode");o&&o.addEventListener("click",i=>{i.preventDefault(),document.body.classList.toggle("dark-mode")})}function st(){var e,t;(e=document.getElementById("settings-drawer"))==null||e.classList.add("is-open"),(t=document.getElementById("drawer-overlay"))==null||t.classList.add("is-open")}function ve(){var e,t;(e=document.getElementById("settings-drawer"))==null||e.classList.remove("is-open"),(t=document.getElementById("drawer-overlay"))==null||t.classList.remove("is-open")}window.closeDrawer=ve;async function Pe(e){nt("dashboard-css","/assets/css/dashboard.css"),z(e,"dashboard",rt()),await Ue.init()}function nt(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function rt(){return`
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
      <div id="kpis-section" class="kpis-container" style="display: none;">

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

        <div class="kpi-card salidas">
          <div class="kpi-content">
            <div class="kpi-icon salidas"><i class="fas fa-hand-holding-usd"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Salidas Hoy</div>
              <div class="kpi-value" id="kpi-salidas-dia">$0.00</div>
            </div>
          </div>
        </div>

        <div class="kpi-card salidas-mes">
          <div class="kpi-content">
            <div class="kpi-icon salidas-mes"><i class="fas fa-file-invoice-dollar"></i></div>
            <div class="kpi-info">
              <div class="kpi-label">Salidas del Mes</div>
              <div class="kpi-value" id="kpi-salidas-mes">$0.00</div>
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
  `}const Ue={chartInstance:null,refreshInterval:6e5,async init(){const e=document.getElementById("dashboard-loader");e&&(e.style.cssText="background:#fff !important; padding:30px; min-height:200px;",e.innerHTML='<p style="color:#333;font-family:monospace;">⏳ Iniciando dashboard...</p>');try{e&&(e.innerHTML='<p style="color:#333;font-family:monospace;">⏳ Cargando Chart.js...</p>'),await mt(),e&&(e.innerHTML='<p style="color:#333;font-family:monospace;">⏳ Ejecutando queries...</p>'),await this.loadData(),this.setupRefresh(),this.addEventListeners()}catch(t){this.showError(t)}},async loadData(){try{const[e,t,a]=await Promise.all([lt(),pt(),ut()]);this.updateUI({kpis:e,ventas_semana:t,ultimas_ventas:a})}catch(e){console.error("Error dashboard:",e),this.showError(e)}},updateUI(e){this.hideLoader(),e.kpis&&this.updateKPIs(e.kpis),e.ventas_semana&&this.renderChart(e.ventas_semana),e.ultimas_ventas&&this.renderNovedades(e.ultimas_ventas)},updateKPIs(e){this.animateValue("kpi-ventas-dia",0,e.ventas_dia,1e3,!0),this.animateValue("kpi-platillos-dia",0,e.platillos_dia,1e3,!1),this.animateValue("kpi-ventas-mes",0,e.ventas_mes,1e3,!0),this.animateValue("kpi-ordenes-cocina",0,e.ordenes_cocina,1e3,!1),this.animateValue("kpi-salidas-dia",0,e.salidas_dia,1e3,!0),this.animateValue("kpi-salidas-mes",0,e.salidas_mes,1e3,!0),this.updateEstadoCaja(e)},updateEstadoCaja(e){const t=document.getElementById("kpi-caja-estado"),a=document.getElementById("kpi-caja-hora"),o=document.getElementById("kpi-caja-monto"),i=document.getElementById("caja-indicador");if(e.caja_estado==="abierta"){if(t&&(t.textContent="Abierta"),a&&e.caja_hora_apertura){const n=new Date(e.caja_hora_apertura);a.textContent=n.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}o&&(o.textContent=this.formatCurrency(e.caja_monto_apertura)),i&&(i.classList.remove("caja-cerrada"),i.classList.add("caja-abierta"))}else t&&(t.textContent="Cerrada"),a&&(a.textContent="--:--"),o&&(o.textContent="$0.00"),i&&(i.classList.remove("caja-abierta"),i.classList.add("caja-cerrada"))},animateValue(e,t,a,o,i){const n=document.getElementById(e);if(!n)return;const s=a-t;if(s===0){n.textContent=i?this.formatCurrency(a):a.toLocaleString("es-MX");return}const c=Date.now()+o,l=setInterval(()=>{const v=Math.max((c-Date.now())/o,0),d=Math.round(a-v*s);n.textContent=i?this.formatCurrency(d):d.toLocaleString("es-MX"),d>=a&&(clearInterval(l),n.textContent=i?this.formatCurrency(a):a.toLocaleString("es-MX"))},50)},renderChart(e){const t=document.getElementById("salesChart");if(!t||!window.Chart)return;const a=t.getContext("2d"),o=e.map(s=>new Date(s.dia+"T00:00:00").toLocaleDateString("es-MX",{weekday:"short",day:"numeric"})),i=e.map(s=>s.total_dia);this.chartInstance&&this.chartInstance.destroy();const n=a.createLinearGradient(0,0,0,300);n.addColorStop(0,"rgba(229, 118, 70, 0.8)"),n.addColorStop(1,"rgba(229, 94, 70, 0.4)"),this.chartInstance=new window.Chart(a,{type:"bar",data:{labels:o,datasets:[{label:"Ventas",data:i,backgroundColor:n,borderColor:"#d45437ff",borderWidth:2,borderRadius:8,borderSkipped:!1,maxBarThickness:60}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{intersect:!1,mode:"index"},plugins:{legend:{display:!1},tooltip:{backgroundColor:"rgba(30, 41, 59, 0.95)",titleColor:"#fff",bodyColor:"#fff",padding:12,cornerRadius:8,displayColors:!1,callbacks:{label:s=>"Ventas: "+this.formatCurrency(s.parsed.y)}}},scales:{y:{beginAtZero:!0,grid:{color:"rgba(0,0,0,0.04)",drawBorder:!1},ticks:{color:"#64748b",font:{size:11},callback:s=>this.formatCurrency(s,!0)}},x:{grid:{display:!1},ticks:{color:"#64748b",font:{size:11}}}},animation:{duration:1e3,easing:"easeInOutQuart"}}})},renderNovedades(e){const t=document.getElementById("last-sales-list");if(t){if(!e||e.length===0){t.innerHTML=`
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No hay novedades por el momento</p>
        </div>`;return}t.innerHTML=e.map(a=>{var s,r;const o=((s=a.metodo_pago)==null?void 0:s.toLowerCase())==="efectivo"?'<i class="fas fa-money-bill-wave" style="color: #10b981;"></i>':'<i class="fas fa-credit-card" style="color: #d47037ff;"></i>',i=a.estatus?`<span class="ticket-status status-${a.estatus}">${a.estatus}</span>`:"",n=(r=a.productos)!=null&&r.length?`<ul class="ticket-products">
            ${a.productos.map(c=>`
              <li class="product-item">
                <span class="product-qty">${c.cantidad}x</span>
                ${c.producto}
              </li>`).join("")}
           </ul>`:"";return`
        <div class="ticket-item">
          <div class="ticket-header">
            <span class="ticket-number">Ticket #${a.ticket}</span>
            ${i}
          </div>
          ${n}
          <div class="ticket-footer">
            <span class="ticket-time">
              ${o} ${a.hora_venta}
            </span>
            <span class="ticket-amount">${this.formatCurrency(a.total_ticket)}</span>
          </div>
        </div>`}).join("")}},formatCurrency(e,t=!1){return t?"$"+new Intl.NumberFormat("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0}).format(e):new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2}).format(e)},hideLoader(){const e=document.getElementById("dashboard-loader"),t=document.getElementById("kpis-section"),a=document.getElementById("content-section");e&&(e.style.display="none"),t&&(t.style.display="flex",t.classList.add("animate-fadeInUp")),a&&(a.style.display="grid",a.classList.add("animate-fadeInUp"))},showError(e){const t=document.getElementById("dashboard-loader");t&&(t.style.background="#fff",t.style.padding="40px",t.innerHTML=`
        <div style="color:#ef4444;font-family:monospace;">
          <h3 style="color:#ef4444;margin-bottom:12px;">❌ Error al cargar datos</h3>
          <pre style="background:#1e293b;color:#f87171;padding:16px;border-radius:8px;font-size:12px;overflow:auto;text-align:left;">${(e==null?void 0:e.stack)||(e==null?void 0:e.message)||String(e)}</pre>
          <button id="btnRetryDashboard" style="
            margin-top:15px; padding:8px 20px; background:#d45c37ff;
            color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
            Reintentar
          </button>
        </div>`)},setupRefresh(){setInterval(()=>this.loadData(),this.refreshInterval)},addEventListeners(){document.querySelectorAll(".kpi-card").forEach(e=>{e.addEventListener("click",function(){this.style.transform="scale(0.98)",setTimeout(()=>{this.style.transform=""},150)})}),document.addEventListener("click",e=>{e.target.closest("#btnRetryDashboard")&&this.loadData()})}};window.DashboardApp=Ue;function ct(){const e=new Date,t=e.getFullYear(),a=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0");return`${t}-${a}-${o}`}function dt(){const e=new Date;return{mes:e.getMonth()+1,anio:e.getFullYear()}}async function lt(){var T,y;const e=ct(),{mes:t,anio:a}=dt(),[o]=await f(`SELECT COALESCE(SUM(sub.total_ticket - sub.costo_envio), 0) as total
     FROM (SELECT ticket, MAX(total_ticket) AS total_ticket, COALESCE(MAX(costo_envio), 0) AS costo_envio FROM rv_ventas
           WHERE DATE(fecha) = $1 AND estatus = 'completado' GROUP BY ticket) sub`,[e]),i=parseFloat(o.total),[n]=await f(`SELECT COALESCE(SUM(cantidad), 0) as total FROM rv_ventas
     WHERE DATE(fecha) = $1 AND estatus = 'completado'`,[e]),s=parseInt(n.total),[r]=await f(`SELECT COALESCE(SUM(sub.total_ticket - sub.costo_envio), 0) as total
     FROM (SELECT ticket, MAX(total_ticket) AS total_ticket, COALESCE(MAX(costo_envio), 0) AS costo_envio FROM rv_ventas
           WHERE strftime('%m', fecha) = $1 AND strftime('%Y', fecha) = $2
           AND estatus = 'completado' GROUP BY ticket) sub`,[String(t).padStart(2,"0"),String(a)]),c=parseFloat(r.total),[l]=await f(`SELECT COUNT(DISTINCT ticket) as total FROM rv_ventas
     WHERE estatus = 'pendiente' OR estatus = 'en preparacion'`,[]),v=parseInt(l.total),d=await f(`SELECT fecha_apertura, monto_apertura FROM rv_apertura_caja
     WHERE estatus = 'activa' ORDER BY fecha_apertura DESC LIMIT 1`,[]),p=d.length>0?"abierta":"cerrada",u=((T=d[0])==null?void 0:T.fecha_apertura)??null,m=parseFloat(((y=d[0])==null?void 0:y.monto_apertura)??0),[h]=await f(`SELECT COALESCE(SUM(precio_unitario), 0) as total FROM rv_gastos
     WHERE tipo_gasto = 'Salida de Efectivo' AND DATE(fecha) = $1`,[e]),g=parseFloat(h.total),[b]=await f(`SELECT COALESCE(SUM(precio_unitario), 0) as total FROM rv_gastos
     WHERE tipo_gasto = 'Salida de Efectivo'
     AND strftime('%m', fecha) = $1 AND strftime('%Y', fecha) = $2`,[String(t).padStart(2,"0"),String(a)]),E=parseFloat(b.total);return{ventas_dia:i,platillos_dia:s,ventas_mes:c,ordenes_cocina:v,caja_estado:p,caja_hora_apertura:u,caja_monto_apertura:m,salidas_dia:g,salidas_mes:E}}async function pt(){const e=await f(`SELECT DATE(fecha) as dia, COALESCE(SUM(total), 0) as total_dia
     FROM rv_ventas
     WHERE fecha >= DATE('now', '-6 days') AND estatus = 'completado'
     GROUP BY DATE(fecha)
     ORDER BY DATE(fecha) ASC`,[]),t=[];for(let a=6;a>=0;a--){const o=new Date;o.setDate(o.getDate()-a);const i=o.toISOString().slice(0,10),n=e.find(s=>s.dia===i);t.push({dia:i,total_dia:n?parseFloat(n.total_dia):0})}return t}async function ut(){const e=await f(`SELECT DISTINCT ticket FROM rv_ventas
     WHERE estatus = 'completado'
     ORDER BY fecha DESC LIMIT 5`,[]),t=[];for(const a of e){const[o]=await f(`SELECT total_ticket, COALESCE(costo_envio, 0) as costo_envio, metodo_pago, time(fecha) as hora_venta, estatus
       FROM rv_ventas WHERE ticket = $1 AND estatus = 'completado' LIMIT 1`,[a.ticket]),i=await f(`SELECT producto, cantidad FROM rv_ventas
       WHERE ticket = $1 AND estatus = 'completado'`,[a.ticket]);o&&t.push({ticket:a.ticket,total_ticket:parseFloat(o.total_ticket)-parseFloat(o.costo_envio),metodo_pago:o.metodo_pago,hora_venta:o.hora_venta,estatus:o.estatus,productos:i})}return t}function mt(){return new Promise(e=>{if(window.Chart)return e();const t=document.createElement("script");t.src="https://cdn.jsdelivr.net/npm/chart.js",t.onload=e,t.onerror=()=>{console.warn("Chart.js no pudo cargarse (sin internet o CSP)."),e()},document.head.appendChild(t)})}function we(e){if(!document.getElementById("login-css")){const t=document.createElement("link");t.id="login-css",t.rel="stylesheet",t.href="/assets/css/login.css",document.head.appendChild(t)}e.innerHTML=`
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
  `,vt()}function vt(){const e=document.getElementById("loginForm");document.getElementById("loginBtn"),document.querySelectorAll(".input-group").forEach(a=>{const o=a.querySelector(".form-control");o&&(o.addEventListener("focus",()=>{a.style.transform="scale(1.01)",a.style.transition="transform 0.3s ease"}),o.addEventListener("blur",()=>{a.style.transform="scale(1)"}),o.addEventListener("input",function(){this.value.length>0?(this.classList.add("is-valid"),this.classList.remove("is-invalid")):this.classList.remove("is-valid")}))}),e.addEventListener("submit",async a=>{a.preventDefault(),await ft()})}async function ft(){const e=document.getElementById("login-usuario").value.trim(),t=document.getElementById("login-password").value,a=document.getElementById("loginBtn");a.classList.add("loading"),a.innerHTML='<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...',a.disabled=!0,gt();try{const o=await f(`SELECT u.usu_id, u.usu_nom, u.usu_puesto, e.emp_id, e.emp_nombre
       FROM tm_usuario u
       LEFT JOIN tm_empleado e ON e.usu_id = u.usu_id
       WHERE u.usu_nom = $1 AND u.usu_pass = $2 AND u.est = 1
       LIMIT 1`,[e,t]);if(o.length===0){Ne("El usuario o la contraseña son incorrectos.","danger");return}const i=o[0];if(window._session={usu_id:i.usu_id,nombre:i.usu_nom,puesto:i.usu_puesto,emp_id:i.emp_id,emp_nombre:i.emp_nombre},["Admin","Administrativo","administrador"].includes(i.usu_puesto)){const s=Math.floor(1e3+Math.random()*9e3).toString();(await f("SELECT id FROM token_global WHERE id = 1",[])).length>0?await w("UPDATE token_global SET token = ?, fecha_actualizacion = datetime('now','localtime') WHERE id = 1",[s]):await w("INSERT INTO token_global (id, token) VALUES (1, ?)",[s]),console.log("Nuevo Token Global Generado:",s)}const n=document.getElementById("app");try{await Pe(n)}catch(s){n.innerHTML=`<div style="padding:40px;font-family:monospace;background:#1e293b;color:#f87171;min-height:100vh;">
        <h2 style="color:#fb923c;">❌ Error al cargar Dashboard</h2>
        <pre style="background:#0f172a;padding:20px;border-radius:8px;overflow:auto;">${(s==null?void 0:s.stack)||(s==null?void 0:s.message)||String(s)}</pre>
      </div>`}}catch(o){console.error("Error en login:",o),Ne("Error al conectar con la base de datos.","danger")}finally{a.classList.remove("loading"),a.innerHTML='<i class="fas fa-sign-in-alt me-2"></i>Acceder al Sistema',a.disabled=!1}}function Ne(e,t="danger"){const a=document.getElementById("login-alert");a.innerHTML=`<div class="alert alert-${t}" role="alert">${e}</div>`,a.style.display="block"}function gt(){const e=document.getElementById("login-alert");e.style.display="none",e.innerHTML=""}async function ht(e){Et("cierre-caja-css","/assets/css/cierre_caja.css"),z(e,"cierre_caja",bt()),await ze.init()}function Et(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function bt(){return`
    <div class="cierre-caja-container">

      <!-- Header -->
      <div class="cc-header-section">
        <h1 class="cc-page-title">
          <i class="fas fa-cash-register"></i>
          Cierre de Caja
        </h1>
        <p class="cc-page-subtitle">Control y gestión de apertura y cierre de caja</p>
      </div>

      <!-- Estado de Caja -->
      <div class="cc-estado-card">
        <div class="cc-status-indicator closed" id="caja-status-indicator">
          <i class="fas fa-lock"></i>
        </div>
        <div class="cc-status-text" id="status-text">Caja Cerrada</div>
        <div class="cc-apertura-time" id="apertura-time" style="display:none;">Desde: --:--</div>

        <div class="cc-action-buttons">
          <button class="cc-btn cc-btn-abrir"  id="btn-abrir-caja">
            <i class="fas fa-lock-open"></i> Abrir Caja
          </button>
          <button class="cc-btn cc-btn-cerrar" id="btn-cerrar-caja" disabled>
            <i class="fas fa-lock"></i> Cerrar Caja
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="cc-kpis-grid">
        <div class="cc-kpi-card ventas">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon ventas"><i class="fas fa-dollar-sign"></i></div>
            <div>
              <div class="cc-kpi-label">Ventas Total</div>
              <div class="cc-kpi-value" id="kpi-ventas-total">$0.00</div>
            </div>
          </div>
        </div>
        <div class="cc-kpi-card efectivo">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon efectivo"><i class="fas fa-money-bill-wave"></i></div>
            <div>
              <div class="cc-kpi-label">Ventas Efectivo</div>
              <div class="cc-kpi-value" id="kpi-efectivo">$0.00</div>
            </div>
          </div>
        </div>
        <div class="cc-kpi-card tarjeta">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon tarjeta"><i class="fas fa-credit-card"></i></div>
            <div>
              <div class="cc-kpi-label">Ventas Tarjeta</div>
              <div class="cc-kpi-value" id="kpi-tarjeta">$0.00</div>
            </div>
          </div>
        </div>
        <div class="cc-kpi-card transferencia">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon transferencia"><i class="fas fa-mobile-alt"></i></div>
            <div>
              <div class="cc-kpi-label">Ventas Transferencia</div>
              <div class="cc-kpi-value" id="kpi-transferencia">$0.00</div>
            </div>
          </div>
        </div>
        <div class="cc-kpi-card diferencia">
          <div class="cc-kpi-content">
            <div class="cc-kpi-icon diferencia"><i class="fas fa-calculator"></i></div>
            <div>
              <div class="cc-kpi-label">Efectivo Esperado</div>
              <div class="cc-kpi-value" id="kpi-efectivo-esperado">$0.00</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen + Cortes Preventivos (visible solo si caja abierta) -->
      <div id="resumen-section" style="display:none;">
        <div class="cc-resumen-row">
          <!-- Resumen Detallado -->
          <div class="cc-resumen-section">
            <div class="cc-resumen-title">
              <span><i class="fas fa-chart-pie"></i> Resumen Detallado del Turno</span>
            </div>
            <div class="cc-resumen-grid">
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Monto de Apertura</span>
                <span class="cc-resumen-item-value" id="resumen-apertura">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Ventas en Efectivo</span>
                <span class="cc-resumen-item-value" id="resumen-ventas-efectivo">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Ventas con Tarjeta</span>
                <span class="cc-resumen-item-value" id="resumen-ventas-tarjeta">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Ventas con Transferencia</span>
                <span class="cc-resumen-item-value" id="resumen-ventas-transferencia">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Total Ventas</span>
                <span class="cc-resumen-item-value" id="resumen-ventas-total">$0.00</span>
              </div>
              <div class="cc-resumen-item">
                <span class="cc-resumen-item-label">Salidas de Efectivo</span>
                <span class="cc-resumen-item-value" style="color:#e17055;" id="resumen-salidas-efectivo">$0.00</span>
              </div>
              <div class="cc-resumen-item highlight">
                <span class="cc-resumen-item-label">Efectivo Esperado en Caja</span>
                <span class="cc-resumen-item-value" id="resumen-esperado">$0.00</span>
              </div>
            </div>
          </div>

          <!-- Cortes y Salidas -->
          <div class="cc-resumen-section">
            <div class="cc-resumen-title">
              <span><i class="fas fa-cut"></i> Cortes Preventivos</span>
              <span class="cc-badge" id="badge-total-cortes">$0.00</span>
            </div>
            <div class="cc-cortes-list" id="lista-cortes-preventivos">
              <div style="text-align:center; color:#6c757d; padding:24px;">Cargando cortes...</div>
            </div>

            <div class="cc-resumen-title" style="margin-top:16px;">
              <span><i class="fas fa-hand-holding-usd"></i> Salidas de Efectivo</span>
              <span class="cc-badge cc-badge-salidas" id="badge-total-salidas">$0.00</span>
            </div>
            <div class="cc-cortes-list" id="lista-salidas-efectivo">
              <div style="text-align:center; color:#6c757d; padding:24px;">Cargando salidas...</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal: Apertura de Caja -->
    <div class="cc-modal-overlay" id="modal-apertura">
      <div class="cc-modal">
        <div class="cc-modal-header apertura">
          <h5>Apertura de Caja</h5>
          <button class="cc-modal-close" id="close-modal-apertura">&times;</button>
        </div>
        <div class="cc-modal-body">
          <div class="cc-numpad-container">
            <div class="cc-display">
              <div class="cc-display-label">Monto Inicial</div>
              <div class="cc-display-value" id="inputMontoInicial">$0.00</div>
            </div>
            <div class="cc-numpad" id="numpad-apertura">
              <button class="cc-btn-num" data-num="1">1</button>
              <button class="cc-btn-num" data-num="2">2</button>
              <button class="cc-btn-num" data-num="3">3</button>
              <button class="cc-btn-num" data-num="4">4</button>
              <button class="cc-btn-num" data-num="5">5</button>
              <button class="cc-btn-num" data-num="6">6</button>
              <button class="cc-btn-num" data-num="7">7</button>
              <button class="cc-btn-num" data-num="8">8</button>
              <button class="cc-btn-num" data-num="9">9</button>
              <button class="cc-btn-num" data-num=".">.</button>
              <button class="cc-btn-num" data-num="0">0</button>
              <button class="cc-btn-num" data-num="00">00</button>
              <button class="cc-btn-borrar" id="btn-borrar-apertura">
                <i class="fas fa-backspace"></i> Borrar
              </button>
            </div>
          </div>
        </div>
        <div class="cc-modal-footer">
          <button class="cc-btn-secondary"       id="btn-cancelar-apertura">Cancelar</button>
          <button class="cc-btn-confirm-apertura" id="btnConfirmarApertura">
            <i class="fas fa-check"></i> Confirmar Apertura
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Cierre de Caja -->
    <div class="cc-modal-overlay" id="modal-cierre">
      <div class="cc-modal">
        <div class="cc-modal-header cierre">
          <h5>Cierre de Caja</h5>
          <button class="cc-modal-close" id="close-modal-cierre">&times;</button>
        </div>
        <div class="cc-modal-body">
          <div class="cc-numpad-container">
            <div class="cc-display cierre">
              <div class="cc-display-label">Conteo Físico de Efectivo</div>
              <div class="cc-display-value" id="inputMontoFinalConfirmacion">0.00</div>
            </div>
            <div class="cc-numpad" id="numpad-cierre">
              <button class="cc-btn-num" data-num="1">1</button>
              <button class="cc-btn-num" data-num="2">2</button>
              <button class="cc-btn-num" data-num="3">3</button>
              <button class="cc-btn-num" data-num="4">4</button>
              <button class="cc-btn-num" data-num="5">5</button>
              <button class="cc-btn-num" data-num="6">6</button>
              <button class="cc-btn-num" data-num="7">7</button>
              <button class="cc-btn-num" data-num="8">8</button>
              <button class="cc-btn-num" data-num="9">9</button>
              <button class="cc-btn-num" data-num=".">.</button>
              <button class="cc-btn-num" data-num="0">0</button>
              <button class="cc-btn-num" data-num="00">00</button>
              <button class="cc-btn-borrar" id="btn-borrar-cierre">
                <i class="fas fa-backspace"></i> Borrar
              </button>
            </div>
          </div>
        </div>
        <div class="cc-modal-footer">
          <button class="cc-btn-secondary"     id="btn-cancelar-cierre">Cancelar</button>
          <button class="cc-btn-confirm-cierre" id="btnConfirmarCierre">
            <i class="fas fa-lock"></i> Cerrar Caja
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de alerta simple (reemplaza SweetAlert) -->
    <div class="cc-modal-overlay" id="modal-alert">
      <div class="cc-modal" style="max-width:340px;">
        <div class="cc-modal-header apertura" id="alert-header">
          <h5 id="alert-title">Aviso</h5>
          <button class="cc-modal-close" id="close-modal-alert">&times;</button>
        </div>
        <div class="cc-modal-body">
          <p id="alert-body" style="font-size:1rem; line-height:1.5;"></p>
        </div>
        <div class="cc-modal-footer">
          <button class="cc-btn-secondary" id="alert-cancel" style="display:none;">Cancelar</button>
          <button class="cc-btn-confirm-apertura" id="alert-confirm">Aceptar</button>
        </div>
      </div>
    </div>
  `}const ze={cajaActivaId:null,montoAperturaCaja:0,totalVentasSistema:0,efectivoEsperado:0,inputApertura:"",inputCierre:"",async init(){this.bindEvents(),await this.cargarEstadoCaja()},async cargarEstadoCaja(){try{const e=await yt();e.caja_activa?this.mostrarCajaAbierta(e):this.mostrarCajaCerrada()}catch(e){console.error("Error al cargar estado de caja:",e),this.showAlert("Error","No se pudo verificar el estado de la caja.","error")}},mostrarCajaAbierta(e){const t=document.getElementById("caja-status-indicator");t&&(t.classList.remove("closed"),t.classList.add("open"),t.innerHTML='<i class="fas fa-lock-open"></i>'),S("status-text","Caja Abierta");const a=document.getElementById("apertura-time");a&&(a.textContent="Desde: "+wt(e.fecha_apertura),a.style.display=""),le("btn-abrir-caja",!0),le("btn-cerrar-caja",!1);const o=document.getElementById("resumen-section");o&&(o.style.display=""),this.cajaActivaId=e.id_caja,this.montoAperturaCaja=parseFloat(e.monto_apertura)||0,this.totalVentasSistema=parseFloat(e.total_ventas)||0,this.efectivoEsperado=parseFloat(e.total_caja_esperado)||0,this._ventasEfectivo=parseFloat(e.ventas_efectivo)||0,this._ventasTarjeta=parseFloat(e.ventas_tarjeta)||0,this._ventasTransferencia=parseFloat(e.ventas_transferencia)||0,this._totalSalidas=parseFloat(e.total_salidas)||0,oe("kpi-ventas-total",0,e.total_ventas,1e3,!0),oe("kpi-efectivo",0,e.ventas_efectivo,1e3,!0),oe("kpi-tarjeta",0,e.ventas_tarjeta,1e3,!0),oe("kpi-transferencia",0,e.ventas_transferencia||0,1e3,!0),oe("kpi-efectivo-esperado",0,this.efectivoEsperado,1e3,!0),S("resumen-apertura",C(this.montoAperturaCaja)),S("resumen-ventas-efectivo",C(e.ventas_efectivo)),S("resumen-ventas-tarjeta",C(e.ventas_tarjeta)),S("resumen-ventas-transferencia",C(e.ventas_transferencia||0)),S("resumen-ventas-total",C(e.total_ventas)),S("resumen-salidas-efectivo","-"+C(e.total_salidas||0)),S("resumen-esperado",C(this.efectivoEsperado)),S("badge-total-cortes",C(e.total_cortes||0));const i=document.getElementById("lista-cortes-preventivos");i&&(e.lista_cortes&&e.lista_cortes.length>0?i.innerHTML=e.lista_cortes.map(s=>{const r=new Date(s.fecha).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),c=(s.comentario||"").replace("Realizado por: ","");return`
            <div class="cc-corte-item">
              <div>
                <div class="cc-corte-monto">${C(s.monto)}</div>
                <div class="cc-corte-hora"><i class="far fa-clock"></i> ${r}</div>
              </div>
              <div class="cc-corte-user"><i class="fas fa-user-circle"></i> ${c}</div>
            </div>`}).join(""):i.innerHTML='<div style="text-align:center; color:#6c757d; padding:24px; font-style:italic;">No hay cortes registrados.</div>'),S("badge-total-salidas",C(e.total_salidas||0));const n=document.getElementById("lista-salidas-efectivo");n&&(e.lista_salidas&&e.lista_salidas.length>0?n.innerHTML=e.lista_salidas.map(s=>{const r=new Date(s.fecha.replace(" ","T")).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});return`
            <div class="cc-corte-item">
              <div>
                <div class="cc-corte-monto" style="color:#e17055;">${C(s.monto)}</div>
                <div class="cc-corte-hora"><i class="far fa-clock"></i> ${r}</div>
              </div>
              <div class="cc-corte-user" style="font-size:11px;max-width:120px;text-align:right;">${s.descripcion||"—"}</div>
            </div>`}).join(""):n.innerHTML='<div style="text-align:center; color:#6c757d; padding:16px; font-style:italic;">No hay salidas registradas.</div>')},mostrarCajaCerrada(){const e=document.getElementById("caja-status-indicator");e&&(e.classList.remove("open"),e.classList.add("closed"),e.innerHTML='<i class="fas fa-lock"></i>'),S("status-text","Caja Cerrada");const t=document.getElementById("apertura-time");t&&(t.style.display="none"),le("btn-abrir-caja",!1),le("btn-cerrar-caja",!0);const a=document.getElementById("resumen-section");a&&(a.style.display="none"),this.cajaActivaId=null,this.montoAperturaCaja=0,this.totalVentasSistema=0,this.efectivoEsperado=0,["kpi-ventas-total","kpi-efectivo","kpi-tarjeta","kpi-transferencia","kpi-efectivo-esperado"].forEach(o=>S(o,"$0.00"))},bindEvents(){var e,t,a;O("btn-abrir-caja","click",()=>pe("modal-apertura")),O("close-modal-apertura","click",()=>F("modal-apertura")),O("btn-cancelar-apertura","click",()=>F("modal-apertura")),O("close-modal-cierre","click",()=>F("modal-cierre")),O("btn-cancelar-cierre","click",()=>F("modal-cierre")),O("close-modal-alert","click",()=>F("modal-alert")),["modal-apertura","modal-cierre","modal-alert"].forEach(o=>{var i;(i=document.getElementById(o))==null||i.addEventListener("click",n=>{n.target.id===o&&F(o)})}),O("btn-cerrar-caja","click",()=>{if(!this.cajaActivaId){this.showAlert("Caja Cerrada","No hay una caja abierta para cerrar.","info");return}this.inputCierre="",S("inputMontoFinalConfirmacion","0.00"),pe("modal-cierre")}),(e=document.getElementById("numpad-apertura"))==null||e.addEventListener("click",o=>{const i=o.target.closest(".cc-btn-num");if(!i)return;const n=i.dataset.num;this.inputApertura=Re(this.inputApertura,n),S("inputMontoInicial","$"+(this.inputApertura||"0.00"))}),O("btn-borrar-apertura","click",()=>{this.inputApertura="",S("inputMontoInicial","$0.00")}),(t=document.getElementById("modal-apertura"))==null||t.addEventListener("transitionend",()=>{}),O("modal-apertura","click",()=>{}),(a=document.getElementById("numpad-cierre"))==null||a.addEventListener("click",o=>{const i=o.target.closest(".cc-btn-num");if(!i)return;const n=i.dataset.num;this.inputCierre=Re(this.inputCierre,n),S("inputMontoFinalConfirmacion",this.inputCierre||"0.00")}),O("btn-borrar-cierre","click",()=>{this.inputCierre="",S("inputMontoFinalConfirmacion","0.00")}),O("btnConfirmarApertura","click",()=>this.confirmarApertura()),O("btnConfirmarCierre","click",()=>this.confirmarCierre())},async confirmarApertura(){const e=parseFloat(this.inputApertura)||0;if(e<0){this.showAlert("Monto Inválido","Por favor, ingrese un monto inicial válido.","error");return}F("modal-apertura"),this.showConfirm("¿Confirmar apertura?",`¿Abrir caja con ${C(e)}?`,"question",async()=>{try{await _t(e),await this.cargarEstadoCaja(),this.showAlert("¡Éxito!","Caja abierta correctamente.","success")}catch(t){this.showAlert("Error",t.message||"No se pudo abrir la caja.","error")}})},async confirmarCierre(){const e=parseFloat(this.inputCierre)||0;if(e<0){this.showAlert("Monto Inválido","Por favor, ingrese el monto físico contado.","error");return}const t=e-this.efectivoEsperado;let a=`El sistema esperaba ${C(this.efectivoEsperado)} y contaste ${C(e)}. `,o="info";t>0?(a+=`Sobran ${C(t)}.`,o="warning"):t<0?(a+=`Faltan ${C(Math.abs(t))}.`,o="warning"):(a+="¡La caja cuadra perfectamente!",o="success"),F("modal-cierre"),this.showConfirm("Confirmar Cierre de Caja",a+`

¿Deseas proceder con el cierre?`,o,async()=>{try{await Tt(this.cajaActivaId,e,this.totalVentasSistema,t,{ventas_efectivo:this._ventasEfectivo||0,ventas_tarjeta:this._ventasTarjeta||0,ventas_transferencia:this._ventasTransferencia||0,gastos_efectivo:this._totalSalidas||0}),await this.cargarEstadoCaja(),this.showAlert("¡Caja Cerrada!","El cierre se realizó correctamente.","success")}catch(i){this.showAlert("Error",i.message||"No se pudo procesar el cierre de caja.","error")}})},showAlert(e,t,a="info",o=null){const i={success:"linear-gradient(135deg, #28a745, #20c997)",error:"linear-gradient(135deg, #dc3545, #c82333)",warning:"linear-gradient(135deg, #ffc107, #ff9800)",info:"linear-gradient(135deg, #4a90e2, #357abd)",question:"linear-gradient(135deg, #4a90e2, #357abd)"},n=document.getElementById("alert-header"),s=document.getElementById("alert-title"),r=document.getElementById("alert-body"),c=document.getElementById("alert-cancel"),l=document.getElementById("alert-confirm");n&&(n.style.background=i[a]||i.info),s&&(s.textContent=e),r&&(r.textContent=t),c&&(c.style.display="none",c.onclick=null),l&&(l.textContent="Aceptar",l.onclick=()=>{F("modal-alert"),o&&o()}),pe("modal-alert")},showConfirm(e,t,a="question",o=null){const i={question:"linear-gradient(135deg, #4a90e2, #357abd)",warning:"linear-gradient(135deg, #ffc107, #ff9800)",success:"linear-gradient(135deg, #28a745, #20c997)",info:"linear-gradient(135deg, #4a90e2, #357abd)"},n=document.getElementById("alert-header"),s=document.getElementById("alert-title"),r=document.getElementById("alert-body"),c=document.getElementById("alert-cancel"),l=document.getElementById("alert-confirm");n&&(n.style.background=i[a]||i.question),s&&(s.textContent=e),r&&(r.textContent=t,r.style.whiteSpace="pre-line"),c&&(c.style.display="",c.textContent="Cancelar",c.onclick=()=>F("modal-alert")),l&&(l.textContent="Confirmar",l.onclick=()=>{F("modal-alert"),o&&o()}),pe("modal-alert")}};window.CierreCajaApp=ze;async function yt(){const e=await f(`SELECT id, fecha_apertura, monto_apertura, estatus
     FROM rv_apertura_caja
     WHERE estatus = 'activa'
     ORDER BY fecha_apertura DESC LIMIT 1`,[]);if(e.length===0)return{caja_activa:!1};const t=e[0],a=t.id,o=await f(`SELECT
           ticket,
           MAX(total_ticket) AS total_ticket,
           COALESCE(MAX(costo_envio), 0) AS costo_envio,
           LOWER(MAX(metodo_pago)) AS metodo_pago,
           COALESCE(MAX(monto_efectivo), 0) AS monto_efectivo,
           COALESCE(MAX(monto_tarjeta), 0) AS monto_tarjeta,
           COALESCE(MAX(monto_transferencia), 0) AS monto_transferencia
         FROM rv_ventas
         WHERE estatus = 'completado' AND fecha >= $1
         GROUP BY ticket`,[t.fecha_apertura]);let i=0,n=0,s=0,r=0,c=0;for(const h of o){const g=parseFloat(h.total_ticket)||0,b=parseFloat(h.costo_envio)||0,E=g-b;i+=E;let T=0;if(h.metodo_pago==="efectivo")n+=E,T=g;else if(h.metodo_pago==="tarjeta")s+=E,T=0;else if(h.metodo_pago==="transferencia")r+=E,T=0;else if(h.metodo_pago==="mixto"){const y=g>0?E/g:0,M=parseFloat(h.monto_efectivo)||0;n+=M*y,s+=(parseFloat(h.monto_tarjeta)||0)*y,r+=(parseFloat(h.monto_transferencia)||0)*y,T=M}c+=T-b}const l=parseFloat(t.monto_apertura)||0,v=await f(`SELECT precio_unitario as monto, fecha, comentario
     FROM rv_gastos
     WHERE tipo_gasto = 'Corte Preventivo'
       AND fecha >= $1
     ORDER BY fecha ASC`,[t.fecha_apertura]),d=v.reduce((h,g)=>h+(parseFloat(g.monto)||0),0),p=await f(`SELECT precio_unitario as monto, fecha, descripcion
     FROM rv_gastos
     WHERE tipo_gasto = 'Salida de Efectivo'
       AND LOWER(metodo_pago) = 'efectivo'
       AND fecha >= $1
     ORDER BY fecha ASC`,[t.fecha_apertura]),u=p.reduce((h,g)=>h+(parseFloat(g.monto)||0),0),m=l+c-d-u;return{caja_activa:!0,id_caja:a,fecha_apertura:t.fecha_apertura,monto_apertura:l,total_ventas:i,ventas_efectivo:n,ventas_tarjeta:s,ventas_transferencia:r,total_caja_esperado:m,total_cortes:d,lista_cortes:v,total_salidas:u,lista_salidas:p}}async function _t(e){if((await f("SELECT id FROM rv_apertura_caja WHERE estatus = 'activa' LIMIT 1",[])).length>0)throw new Error("Ya hay una caja abierta.");const a=window._session||{};await w(`INSERT INTO rv_apertura_caja (fecha_apertura, monto_apertura, usu_id, estatus)
     VALUES (datetime('now','localtime'), $1, $2, 'activa')`,[e,a.usu_id||1])}async function Tt(e,t,a,o,i={}){await w(`UPDATE rv_apertura_caja SET
       estatus              = 'cerrada',
       fecha_cierre         = datetime('now','localtime'),
       monto_cierre         = $1,
       total_ventas_sistema = $2,
       diferencia_cierre    = $3,
       ventas_efectivo      = $5,
       ventas_tarjeta       = $6,
       ventas_transferencia = $7,
       gastos_efectivo      = $8
     WHERE id = $4`,[t,a,o,e,i.ventas_efectivo||0,i.ventas_tarjeta||0,i.ventas_transferencia||0,i.gastos_efectivo||0])}function C(e){return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(e||0)}function wt(e){return e?new Date(e).toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!0}):"--:--"}function Re(e,t){return t==="."&&e.includes(".")||t==="0"&&e==="0"?e:e===""&&t!=="."?t.toString():e===""&&t==="."?"0.":e+t.toString()}function oe(e,t,a,o,i=!1){const n=document.getElementById(e);if(!n)return;const s=a-t;if(s===0){n.textContent=i?C(a):a;return}const c=Date.now()+o,l=setInterval(()=>{const v=Math.max((c-Date.now())/o,0),d=Math.round(a-v*s);n.textContent=i?C(d):d,d>=a&&(clearInterval(l),n.textContent=i?C(a):a)},50)}function S(e,t){const a=document.getElementById(e);a&&(a.textContent=t)}function le(e,t){const a=document.getElementById(e);a&&(a.disabled=t)}function O(e,t,a){var o;(o=document.getElementById(e))==null||o.addEventListener(t,a)}function pe(e){var t;(t=document.getElementById(e))==null||t.classList.add("active")}function F(e){var t;(t=document.getElementById(e))==null||t.classList.remove("active")}async function xt(e){Lt("caja-css","/assets/css/caja.css");const[t,a]=await Promise.all([It(),Ct()]);Le.productosData=t;const i=t.filter(s=>Number(s.pr_precioventa)===0).map(s=>xe(s.pr_nombre));z(e,"caja",kt(t,a,s=>i.some(r=>s.pr_nombre.includes(`(${r})`)))),Le.init(t)}function xe(e){const t=e.trim();return t.toLowerCase()==="orden mixta"?"Mixta":t}function Lt(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function kt(e,t,a){return`
  <div class="caja-wrapper">
    <div class="caja-row">

      <!-- ====== COLUMNA IZQUIERDA: MENÚ ====== -->
      <div class="caja-col-menu">
        <div class="caja-menu-title">Menú Principal 🍽️</div>

        <!-- Filtro Categorías -->
        <div class="categorias-scroll">
          <ul class="trending-filter">
            <li><a class="is_active" href="#" data-filter="*">Todos</a></li>
            <li><a href="#" data-filter=".favorito"><i class="fa fa-star" style="color:#f59e0b;"></i></a></li>
            ${[...new Set(e.map(i=>i.pr_categoria))].map(i=>`<li><a href="#" data-filter=".${Ee(i)}">${i}</a></li>`).join("")}
          </ul>
        </div>

        <!-- Productos Grid -->
        <div class="productos-scroll">
          <div class="productos-grid" id="productos-lista">
            ${e.filter(i=>!a(i)).map(i=>{const n=Ee(i.pr_categoria),s=i.pr_favorito==1?"favorito":"";return`
              <div class="producto-card btn-accion-agregar ${n} ${s}"
                   data-id="${i.ID}"
                   data-stock="${i.pr_stock??"NULL"}"
                   data-favorito="${i.pr_favorito}"
                   data-nombre="${re(i.pr_nombre)}"
                   data-precio="${i.pr_precioventa}">
                <div class="producto-imagen">
                  <img src="/assets/images/fondoproducto.png" alt="" onerror="this.style.display='none'">
                  <h6 class="producto-nombre">${i.pr_nombre}</h6>
                </div>
                <div class="producto-precio">$${Number(i.pr_precioventa).toFixed(2)}</div>
              </div>`}).join("")}
          </div>
        </div>
      </div>

      <!-- ====== COLUMNA DERECHA: CARRITO ====== -->
      <div class="caja-col-carrito">

        <!-- Top Bar -->
        <div class="carrito-top-bar">
          <div class="tipo-orden-bar">
            <button class="btn-tipo-orden active" data-tipo="llevar"><i class="fa fa-shopping-bag"></i> Llevar</button>
            <button class="btn-tipo-orden" data-tipo="comer_aqui"><i class="fa fa-utensils"></i> Aquí</button>
            <button class="btn-tipo-orden" data-tipo="domicilio"><i class="fa fa-motorcycle"></i> Domicilio</button>
          </div>
          <button class="btn-pendientes" id="btnOrdenesPendientes" title="Ver órdenes pendientes">
            ⏳ <span id="badgePendientes"></span>
          </button>
          <div id="cajaCompactPill" class="caja-pill" title="Efectivo en Caja">
            <i class="fa fa-wallet pill-icon"></i>
            <span id="cajaEfectivoStatus" style="font-weight:700;">$0</span>
            <button id="btnCortePreventivo" class="btn-corte" title="Corte preventivo">
              <i class="fa fa-cut" style="color:#ffc107;font-size:.9rem;"></i>
            </button>
          </div>
          <button class="btn-vaciar" id="vaciarCarrito" title="Vaciar carrito">
            <i class="fa fa-trash"></i>
          </button>
        </div>

        <!-- Panel contextual tipo orden -->
        <div id="panel-tipo-orden">
          <div id="panel-llevar" class="orden-panel">
            <input type="number" id="sensorInput" class="sensor-input"
                   placeholder="# Sensor buscapersonas" min="1" max="9999">
          </div>
          <div id="panel-comer_aqui" class="orden-panel" style="display:none;"></div>
          <div id="panel-domicilio" class="orden-panel" style="display:none;">
            <div class="domicilio-fields">
              <input type="text" id="domCalleInput" placeholder="Calle">
              <input type="text" id="domNumInput" placeholder="Núm." style="max-width:70px;">
              <input type="text" id="domColoniaInput" placeholder="Colonia">
            </div>
            <div class="envio-row">
              <span>Envío:</span>
              <input type="number" id="costoEnvioInput" placeholder="$0" min="0" style="flex: 1; text-align: left; padding: 6px 12px; font-size: 14px;">
            </div>
          </div>
        </div>

        <!-- Vendedores / Cajeros -->
        <div class="cajero-scroll">
          <ul class="cajero-filter">
            ${t.map((i,n)=>{const s="cajero-color-"+Ee(i.emp_nombre);return`<li><a href="#" class="vendedor-selector ${n===0?"is_active":""} ${s}"
                         data-cajero-id="${i.emp_id}">${i.emp_nombre}</a></li>`}).join("")}
          </ul>
        </div>

        <!-- Instrucción -->
        <p class="instruccion-carrito" id="instruccionCarrito" style="display:none;">
          Haz clic en un ítem del carrito para disminuir la cantidad o eliminarlo.
        </p>

        <!-- Lista Carrito -->
        <div id="carrito-lista">
          <p class="carrito-vacio">Tu carrito está vacío.</p>
        </div>

        <!-- Métodos de Pago -->
        <div class="payment-methods">
          <div class="tile-pago" data-tipo="tarjeta">
            <i class="fa fa-credit-card" style="color:#007aff;"></i>
            <h5>Tarjeta</h5>
          </div>
          <div class="tile-pago" data-tipo="efectivo">
            <i class="fa fa-wallet" style="color:#28a745;"></i>
            <h5>Efectivo</h5>
          </div>
          <div class="tile-pago" data-tipo="transferencia">
            <i class="fa fa-exchange-alt" style="color:#17a2b8;"></i>
            <h5>Transf</h5>
          </div>
        </div>

        <!-- Pago Mixto -->
        <button class="btn-pago-mixto" id="btnPagoMixto">
          <i class="fa fa-layer-group"></i> Pago Mixto
        </button>
        <div id="panel-pago-mixto" class="panel-pago-mixto" style="display:none;">
          <div class="mixto-row">
            <i class="fa fa-wallet" style="color:#28a745;"></i>
            <span>Efectivo</span>
            <input type="number" id="mixtoEfectivo" min="0" step="0.01" placeholder="$0.00">
          </div>
          <div class="mixto-row">
            <i class="fa fa-credit-card" style="color:#007aff;"></i>
            <span>Tarjeta</span>
            <input type="number" id="mixtoTarjeta" min="0" step="0.01" placeholder="$0.00">
          </div>
          <div class="mixto-row">
            <i class="fa fa-exchange-alt" style="color:#17a2b8;"></i>
            <span>Transf</span>
            <input type="number" id="mixtoTransferencia" min="0" step="0.01" placeholder="$0.00">
          </div>
          <div class="mixto-status">
            <span id="mixtoFaltanteLabel">Faltante:</span> <strong id="mixtoFaltante">$0.00</strong>
          </div>
        </div>

        <hr style="margin:8px 0; border-color:#e9ecef;">

        <!-- Total -->
        <div class="carrito-total">
          <span class="label">Total:</span>
          <span class="valor" id="totalCarrito">$0.00</span>
        </div>

        <!-- Botón Pagar -->
        <button class="btn-pagar" id="btnPagar" disabled>Pagar</button>

      </div>
    </div>
  </div>

  <!-- ====== MODAL: PAGO EFECTIVO ====== -->
  <div class="cj-modal-overlay" id="modal-pago">
    <div class="cj-modal">
      <div class="cj-modal-header">
        <h5>Ingresar Monto Recibido</h5>
        <button class="cj-modal-close" id="close-modal-pago">&times;</button>
      </div>
      <div class="cj-modal-body">
        <div class="cj-display">
          <div class="cj-display-label">Monto recibido</div>
          <div class="cj-display-value" id="inputPagoDisplay">$</div>
        </div>
        <input type="hidden" id="inputPago" value="">
        <div class="keypad-grid">
          ${[1,2,3,4,5,6,7,8,9].map(i=>`<button class="btn-num" data-num="${i}">${i}</button>`).join("")}
          <button class="btn-clear" id="btn-borrar-pago">C</button>
          <button class="btn-num" data-num="0">0</button>
          <button class="btn-confirm" id="btn-confirmar-pago"><i class="fa fa-check"></i></button>
        </div>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: TRANSFERENCIA ====== -->
  <div class="cj-modal-overlay" id="modal-transferencia">
    <div class="cj-modal">
      <div class="cj-modal-header">
        <h5>Datos para Transferencia</h5>
        <button class="cj-modal-close" id="close-modal-transferencia">&times;</button>
      </div>
      <div class="cj-modal-body">
        <p style="text-align:center; color:#6c757d;">
          Realiza la transferencia y luego haz clic en "Pagar" para registrar la venta.
        </p>
        <hr>
        <dl style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:.95rem; text-align:center;">
          <dt style="color:#6c757d; font-weight:700;">Titular:</dt><dd>Angel Loera</dd>
          <dt style="color:#6c757d; font-weight:700;">Banco:</dt><dd>STP</dd>
          <dt style="color:#6c757d; font-weight:700;">Clave:</dt><dd>64 6180 1370 0491 1371</dd>
        </dl>
        <hr>
      </div>
      <div class="cj-modal-footer">
        <button class="cj-btn-secondary" id="cancelar-transferencia">Cancelar</button>
        <button class="cj-btn-primary"   id="confirmar-transferencia">Pagar</button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: ORDEN MIXTA ====== -->
  <div class="cj-modal-overlay" id="modal-comanda">
    <div class="cj-modal lg" style="max-width: 900px; width: 95%;">
      <div class="cj-modal-header">
        <h5>Crear <span id="platilloPersonalizarNombre"></span></h5>
        <button class="cj-modal-close" id="close-modal-comanda">&times;</button>
      </div>
      <div class="cj-modal-body" style="padding: 15px;">
        <input type="hidden" id="platilloPersonalizarId">

        <!-- Panel Mixta -->
        <div id="tab-mezcla" style="padding: 10px 0;"></div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:#f8f9fa; border-radius:10px; margin-top:20px; border: 2px solid #e9ecef;">
          <span style="color:#6c757d; font-weight:700; font-size:1.1rem;">Total:</span>
          <span style="font-weight:800; font-size:1.5rem; color:#007aff;" id="totalOrdenMixta">$0.00</span>
        </div>
      </div>
      <div class="cj-modal-footer">
        <button class="cj-btn-secondary" id="cancelar-comanda">Cancelar</button>
        <button class="cj-btn-success"   id="btnAgregarPlatilloPersonalizado">Añadir al Carrito</button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL ALERT / CONFIRM ====== -->
  <div class="cj-alert-overlay" id="cj-alert-overlay">
    <div class="cj-alert-box">
      <div class="cj-alert-header" id="cj-alert-header">
        <h5 id="cj-alert-title">Aviso</h5>
        <button class="cj-modal-close" id="cj-alert-close">&times;</button>
      </div>
      <div class="cj-alert-body" id="cj-alert-body"></div>
      <div class="cj-alert-footer">
        <button class="cj-btn-secondary" id="cj-alert-cancel" style="display:none;">Cancelar</button>
        <button class="cj-btn-primary"   id="cj-alert-confirm">Aceptar</button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: ÓRDENES PENDIENTES ====== -->
  <div class="cj-modal-overlay" id="modal-pendientes">
    <div class="cj-modal" style="max-width:560px; width:95%;">
      <div class="cj-modal-header" style="background:linear-gradient(135deg,#28a745,#1e7e34);">
        <h5>🍽️ Órdenes Pendientes</h5>
        <button class="cj-modal-close" id="close-modal-pendientes">&times;</button>
      </div>
      <div class="cj-modal-body" id="pendientes-lista" style="max-height:65vh; overflow-y:auto; padding:1rem;">
        <p style="text-align:center; color:#6c757d;">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: COBRAR ORDEN PENDIENTE ====== -->
  <div class="cj-modal-overlay" id="modal-cobrar-pendiente">
    <div class="cj-modal" style="max-width:420px; width:95%;">
      <div class="cj-modal-header" style="background:linear-gradient(135deg,#28a745,#1e7e34);">
        <h5 id="cobrar-pendiente-title">Cobrar Orden</h5>
        <button class="cj-modal-close" id="close-modal-cobrar-pendiente">&times;</button>
      </div>
      <div class="cj-modal-body">
        <div id="cobrar-pendiente-items" style="font-size:.9rem; color:#444; margin-bottom:8px; max-height:180px; overflow-y:auto;"></div>
        <div style="text-align:right; font-size:1.5rem; font-weight:800; color:#333; margin-bottom:10px;" id="cobrar-pendiente-total"></div>
        <div class="cobrar-pago-panel">
          <div style="font-size:.85rem; font-weight:700; color:#555; margin-bottom:6px;">Selecciona método de pago:</div>
          <div class="payment-methods" id="cobrar-pago-methods" style="margin:0 0 6px;">
            <div class="tile-pago" data-tipo-cobro="tarjeta">
              <i class="fa fa-credit-card" style="color:#007aff;"></i>
              <h5>Tarjeta</h5>
            </div>
            <div class="tile-pago" data-tipo-cobro="efectivo">
              <i class="fa fa-wallet" style="color:#28a745;"></i>
              <h5>Efectivo</h5>
            </div>
            <div class="tile-pago" data-tipo-cobro="transferencia">
              <i class="fa fa-exchange-alt" style="color:#17a2b8;"></i>
              <h5>Transf</h5>
            </div>
          </div>
          <div class="cobrar-efectivo-row" id="cobrar-efectivo-row" style="display:none;">
            <label>Monto recibido:</label>
            <input type="number" id="cobrar-efectivo-input" placeholder="$0" min="0">
          </div>
        </div>
      </div>
      <div class="cj-modal-footer">
        <button class="cj-btn-secondary" id="cobrar-pendiente-cancelar">Cancelar</button>
        <button class="cj-btn-success" id="cobrar-pendiente-confirmar" disabled>Cobrar</button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL: CORTE PREVENTIVO ====== -->
  <div class="cj-modal-overlay" id="modal-corte">
    <div class="cj-modal" style="max-width:360px; width:95%;">
      <div class="cj-modal-header" style="background:linear-gradient(135deg,#ffc107,#ff9800);">
        <h5><i class="fa fa-cut"></i> Corte Preventivo</h5>
        <button class="cj-modal-close" id="close-modal-corte">&times;</button>
      </div>
      <div class="cj-modal-body">
        <p id="corte-info-caja" style="font-size:13px;color:#6c757d;margin:0 0 12px;"></p>
        <div class="sal-form-group">
          <label style="display:block;font-size:12px;font-weight:600;color:#6c757d;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px;">¿Cuánto deseas retirar? ($)</label>
          <input type="number" id="corteMontoInput" min="0.01" step="0.01" placeholder="0.00"
            style="width:100%;padding:10px 12px;border:1.5px solid #ced4da;border-radius:8px;font-size:15px;outline:none;box-sizing:border-box;">
        </div>
      </div>
      <div class="cj-modal-footer">
        <button class="btn-pago-mixto" id="corte-cancelar" style="background:#e9ecef;color:#495057;box-shadow:none;">Cancelar</button>
        <button class="btn-pago-mixto" id="corte-confirmar" style="background:linear-gradient(135deg,#ffc107,#ff9800);color:#343a40;">
          <i class="fa fa-check"></i> Retirar
        </button>
      </div>
    </div>
  </div>

  <!-- LOADING -->
  <div class="cj-loading" id="cj-loading">
    <div class="cj-spinner"></div>
    <div class="cj-loading-text" id="cj-loading-text">Procesando...</div>
  </div>
  `}const Le={carrito:[],totalCarrito:0,metodoPago:"",vendedorSeleccionado:null,cambio:0,currentFilter:"*",tipoOrden:"llevar",costoEnvio:0,pagoMixtoActivo:!1,montosMixtos:{efectivo:0,tarjeta:0,transferencia:0},_cajaEfectivo:0,_cajaFondo:0,_cobrarTicket:null,_cobrarMetodo:"",_cobrarTotal:0,init(e){this.bindEvents(),this.actualizarVendedorSeleccionado(),this.actualizarEstadoCaja(),this.actualizarBadgePendientes()},bindEvents(){var a,o,i,n,s,r,c,l,v;document.querySelectorAll(".trending-filter a").forEach(d=>{d.addEventListener("click",p=>{p.preventDefault(),document.querySelectorAll(".trending-filter a").forEach(u=>u.classList.remove("is_active")),d.classList.add("is_active"),this.filtrarProductos(d.dataset.filter)})}),document.querySelectorAll(".vendedor-selector").forEach(d=>{d.addEventListener("click",p=>{p.preventDefault(),document.querySelectorAll(".vendedor-selector").forEach(u=>u.classList.remove("is_active")),d.classList.add("is_active"),this.actualizarVendedorSeleccionado()})});const e=document.getElementById("productos-lista");e&&e.addEventListener("click",d=>{const p=d.target.closest(".btn-accion-agregar");p&&this.agregarAlCarrito(Number(p.dataset.id),p.dataset.nombre,parseFloat(p.dataset.precio))}),document.querySelectorAll(".tile-pago").forEach(d=>{d.addEventListener("click",()=>{document.querySelectorAll(".tile-pago").forEach(p=>p.classList.remove("active")),d.classList.add("active"),this.metodoPago=d.dataset.tipo})}),k("vaciarCarrito","click",()=>this.limpiarCarrito()),k("btnPagar","click",()=>this.handlePagar()),document.querySelectorAll(".btn-num").forEach(d=>{d.addEventListener("click",()=>this.numpadPago(d.dataset.num))}),(a=document.getElementById("btn-borrar-pago"))==null||a.addEventListener("click",()=>{document.getElementById("inputPago").value="",P("inputPagoDisplay","$")}),(o=document.getElementById("btn-confirmar-pago"))==null||o.addEventListener("click",()=>this.confirmarPagoEfectivo()),this._tecladoHandler&&document.removeEventListener("keydown",this._tecladoHandler),this._tecladoHandler=d=>this.handleKeydownGlobal(d),document.addEventListener("keydown",this._tecladoHandler),k("close-modal-pago","click",()=>L("modal-pago")),k("close-modal-transferencia","click",()=>L("modal-transferencia")),k("close-modal-comanda","click",()=>this.cerrarComanda()),k("cancelar-comanda","click",()=>this.cerrarComanda()),k("cancelar-transferencia","click",()=>L("modal-transferencia")),k("confirmar-transferencia","click",()=>{L("modal-transferencia"),this.registrarVenta(!1)}),["modal-pago","modal-transferencia","modal-comanda"].forEach(d=>{var p;(p=document.getElementById(d))==null||p.addEventListener("click",u=>{u.target.id===d&&L(d)})}),k("cj-alert-overlay","click",d=>{d.target.id==="cj-alert-overlay"&&ie()}),k("cj-alert-close","click",()=>ie()),k("btnAgregarPlatilloPersonalizado","click",()=>this.agregarPlatilloPersonalizado());const t=document.getElementById("modal-comanda");t&&t.addEventListener("click",d=>{const p=d.target.closest(".btn-mixta-tab");if(p){t.querySelectorAll(".btn-mixta-tab").forEach(m=>{m.style.background="#e9ecef",m.style.color="#495057",m.style.fontWeight="normal"}),p.style.background="#007aff",p.style.color="#fff",p.style.fontWeight="bold",t.querySelectorAll(".mixta-panel").forEach(m=>m.style.display="none");const u=document.getElementById(p.dataset.target);u&&(u.style.display="block")}}),this._stepperHandler&&document.removeEventListener("click",this._stepperHandler),this._stepperHandler=d=>{const p=d.target.closest(".btn-stepper");if(!p)return;const u=p.dataset.target,m=document.getElementById(u),h=document.getElementById("val"+u.replace("cant",""));if(!m)return;let g=parseInt(m.value)||0;p.classList.contains("btn-stepper-plus")?g++:p.classList.contains("btn-stepper-minus")&&g>0&&g--,m.value=g,h&&(h.textContent=g),this.calcularTotalMixta()},document.addEventListener("click",this._stepperHandler),(i=document.getElementById("carrito-lista"))==null||i.addEventListener("click",d=>{const p=d.target.closest(".carrito-item");if(!p)return;const u=parseInt(p.dataset.index);u>=0&&u<this.carrito.length&&(this.carrito[u].cantidad>1?this.carrito[u].cantidad--:this.carrito.splice(u,1),this.actualizarCarrito())}),k("btnCortePreventivo","click",()=>this.abrirModalCorte()),k("close-modal-corte","click",()=>L("modal-corte")),k("corte-cancelar","click",()=>L("modal-corte")),k("corte-confirmar","click",()=>this.confirmarCorte()),(n=document.getElementById("modal-corte"))==null||n.addEventListener("click",d=>{d.target.id==="modal-corte"&&L("modal-corte")}),document.querySelectorAll(".btn-tipo-orden").forEach(d=>{d.addEventListener("click",()=>this.cambiarTipoOrden(d.dataset.tipo))}),(s=document.getElementById("sensorInput"))==null||s.addEventListener("input",()=>this.actualizarCarrito()),document.querySelectorAll(".btn-envio-preset").forEach(d=>{d.addEventListener("click",()=>{const p=parseFloat(d.dataset.monto);document.querySelectorAll(".btn-envio-preset").forEach(u=>u.classList.remove("active")),d.classList.add("active"),document.getElementById("costoEnvioInput").value=p,this.costoEnvio=p,this.actualizarCarrito()})}),(r=document.getElementById("costoEnvioInput"))==null||r.addEventListener("input",d=>{document.querySelectorAll(".btn-envio-preset").forEach(p=>p.classList.remove("active")),this.costoEnvio=parseFloat(d.target.value)||0,this.actualizarCarrito()}),k("btnOrdenesPendientes","click",()=>this.abrirOrdenesPendientes()),k("close-modal-pendientes","click",()=>L("modal-pendientes")),(c=document.getElementById("modal-pendientes"))==null||c.addEventListener("click",d=>{d.target.id==="modal-pendientes"&&L("modal-pendientes")}),k("close-modal-cobrar-pendiente","click",()=>L("modal-cobrar-pendiente")),k("cobrar-pendiente-cancelar","click",()=>L("modal-cobrar-pendiente")),(l=document.getElementById("modal-cobrar-pendiente"))==null||l.addEventListener("click",d=>{d.target.id==="modal-cobrar-pendiente"&&L("modal-cobrar-pendiente")}),(v=document.getElementById("cobrar-pago-methods"))==null||v.addEventListener("click",d=>{const p=d.target.closest(".tile-pago[data-tipo-cobro]");if(!p)return;document.querySelectorAll("#cobrar-pago-methods .tile-pago").forEach(m=>m.classList.remove("active")),p.classList.add("active"),this._cobrarMetodo=p.dataset.tipoCobro;const u=document.getElementById("cobrar-efectivo-row");u&&(u.style.display=this._cobrarMetodo==="efectivo"?"":"none"),document.getElementById("cobrar-pendiente-confirmar").disabled=!1}),k("cobrar-pendiente-confirmar","click",()=>this.confirmarCobroPendiente()),k("btnPagoMixto","click",()=>this.cambiarPagoMixto()),["mixtoEfectivo","mixtoTarjeta","mixtoTransferencia"].forEach(d=>{var p;(p=document.getElementById(d))==null||p.addEventListener("input",()=>this.actualizarMixtoFaltante())})},cambiarTipoOrden(e){var o;this.tipoOrden=e,this.costoEnvio=0,document.querySelectorAll(".btn-tipo-orden").forEach(i=>i.classList.remove("active")),(o=document.querySelector(`.btn-tipo-orden[data-tipo="${e}"]`))==null||o.classList.add("active"),["llevar","comer_aqui","domicilio"].forEach(i=>{const n=document.getElementById(`panel-${i}`);n&&(n.style.display=i===e?"":"none")});const t=document.querySelector(".payment-methods");t&&t.classList.toggle("oculto",e==="comer_aqui"),e==="comer_aqui"&&(this.metodoPago="",document.querySelectorAll(".tile-pago").forEach(i=>i.classList.remove("active")),this.pagoMixtoActivo&&this.cambiarPagoMixto()),document.querySelectorAll(".btn-envio-preset").forEach(i=>i.classList.remove("active"));const a=document.getElementById("costoEnvioInput");a&&(a.value=""),this.actualizarCarrito()},cambiarPagoMixto(){this.pagoMixtoActivo=!this.pagoMixtoActivo;const e=document.getElementById("btnPagoMixto"),t=document.getElementById("panel-pago-mixto");this.pagoMixtoActivo?(e==null||e.classList.add("active"),t&&(t.style.display=""),document.querySelectorAll(".tile-pago").forEach(a=>a.classList.remove("active")),this.metodoPago="",this.actualizarMixtoFaltante()):(e==null||e.classList.remove("active"),t&&(t.style.display="none"),this.montosMixtos={efectivo:0,tarjeta:0,transferencia:0},["mixtoEfectivo","mixtoTarjeta","mixtoTransferencia"].forEach(a=>{const o=document.getElementById(a);o&&(o.value="")}))},actualizarMixtoFaltante(){var r,c,l;const e=parseFloat((r=document.getElementById("mixtoEfectivo"))==null?void 0:r.value)||0,t=parseFloat((c=document.getElementById("mixtoTarjeta"))==null?void 0:c.value)||0,a=parseFloat((l=document.getElementById("mixtoTransferencia"))==null?void 0:l.value)||0;this.montosMixtos={efectivo:e,tarjeta:t,transferencia:a};const o=e+t+a,i=this.totalCarrito-o,n=document.getElementById("mixtoFaltante"),s=document.getElementById("mixtoFaltanteLabel");n&&(i>.009?(s&&(s.textContent="Faltante:"),n.textContent="$"+i.toFixed(2),n.style.color="#dc3545"):i<-.009?(s&&(s.textContent="Excede:"),n.textContent="$"+Math.abs(i).toFixed(2),n.style.color="#fd7e14"):(s&&(s.textContent="Faltante:"),n.textContent="$0.00",n.style.color="#28a745"))},filtrarProductos(e){this.currentFilter=e,document.querySelectorAll("#productos-lista .producto-card").forEach(t=>{if(e==="*")t.style.display="";else{const a=e.replace(".","");t.style.display=t.classList.contains(a)?"":"none"}})},actualizarVendedorSeleccionado(){const e=document.querySelector(".vendedor-selector.is_active");if(e)this.vendedorSeleccionado=e.dataset.cajeroId;else{const t=document.querySelector(".vendedor-selector");t&&(t.classList.add("is_active"),this.vendedorSeleccionado=t.dataset.cajeroId)}},agregarAlCarrito(e,t,a){if(Number(a)===0)this.abrirModalComandaGrupo(e,t);else{let i=this.carrito.find(n=>n.id===e);i?i.cantidad++:this.carrito.push({id:e,nombre:t,precio:a,cantidad:1}),this.actualizarCarrito()}},abrirModalComandaGrupo(e,t){const a=xe(t),o=this.productosData.filter(n=>n.pr_nombre.includes(`(${a})`));P("platilloPersonalizarNombre",t),document.getElementById("platilloPersonalizarId").value=e;const i=document.getElementById("tab-mezcla");if(o.length===0)i.innerHTML='<div style="text-align:center; color:#6c757d; padding:20px;">No hay productos configurados para esta categoría. Añade agregando el subfijo ('+a+").</div>";else{const n={};o.forEach(c=>{const l=c.pr_nombre.replace(`(${a})`,"").trim(),v=l.split(" ")[0];n[v]||(n[v]=[]),n[v].push({pm:c,nombre:l})});const s=Object.entries(n);let r=`
              <div class="mixta-tabs-container" style="display: flex; gap: 20px; align-items: stretch; max-height: 350px;">
                <!-- Menú Lateral de Categorías -->
                <div class="mixta-sidebar" style="flex: 0 0 160px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; padding-right: 5px;">
                  `;s.forEach(([c,l],v)=>{r+=`
                  <button type="button" class="btn-mixta-tab" data-target="panel-${c}" style="width: 100%; text-align: left; padding: 12px 15px; border-radius: 8px; border: none; cursor: pointer; ${v===0?"background:#007aff; color:#fff; font-weight:bold;":"background:#e9ecef; color:#495057;"} transition: all 0.2s; font-size: 1rem; flex-shrink: 0;">
                    ${c}s (${l.length})
                  </button>`}),r+=`
                </div>
                <!-- Contenedor Principal de Artículos -->
                <div class="mixta-content" style="flex: 1; border: 1px solid #e9ecef; border-radius: 10px; background: #fff; position: relative; overflow-y: auto;">
                  `,s.forEach(([c,l],v)=>{r+=`
                  <div class="mixta-panel" id="panel-${c}" style="display: ${v===0?"block":"none"}; padding: 15px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">`,l.forEach(({pm:p,nombre:u})=>{const m=Number(p.pr_precioventa).toFixed(0);r+=`
                      <div style="background:#f8f9fa; border:1px solid #dee2e6; border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
                        <div>
                          <div style="font-weight:600; font-size:1rem; color:#343a40;">${u}</div>
                          <div style="color:#6c757d; font-size:.85rem;">$${m} c/u</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; justify-content: flex-end;">
                          <button type="button" class="btn-stepper btn-stepper-minus" data-target="cantMixta_${p.ID}" style="width:32px; height:32px; border-radius:6px; border:none; background:#e9ecef; color:#495057; font-weight:bold; cursor:pointer; font-size:1.1rem;">−</button>
                          <span class="stepper-value" id="valMixta_${p.ID}" style="min-width:28px; text-align:center; font-weight:bold; font-size:1.1rem; color:#007aff;">0</span>
                          <input type="hidden" id="cantMixta_${p.ID}" class="cant-mixta"
                                 data-id="${p.ID}" data-nombre="${re(u)}" data-suffix="${re(a)}"
                                 data-precio="${p.pr_precioventa}" value="0">
                          <button type="button" class="btn-stepper btn-stepper-plus" data-target="cantMixta_${p.ID}" style="width:32px; height:32px; border-radius:6px; border:none; background:#007aff; color:#fff; font-weight:bold; cursor:pointer; font-size:1.1rem;">+</button>
                        </div>
                      </div>`}),r+=`
                    </div>
                  </div>`}),r+=`
                </div>
              </div>`,i.innerHTML=r}this.calcularTotalMixta(),G("modal-comanda")},activarTab(e,t){},calcularTotalMixta(){let e=0;document.querySelectorAll(".cant-mixta").forEach(t=>{const a=parseInt(t.value)||0,o=parseFloat(t.dataset.precio)||0;e+=a*o}),P("totalOrdenMixta","$"+e.toFixed(2))},actualizarCarrito(){var r,c,l,v;const e=document.getElementById("carrito-lista");if(!e)return;let t=0,a="";const o={},i=(((r=document.getElementById("sensorInput"))==null?void 0:r.value)||"").trim();if(this.tipoOrden==="llevar"&&i&&(a+=`<div class="sensor-carrito-badge">
        <span>Sensor:</span> #${re(i)}
      </div>`),this.tipoOrden==="domicilio"){const d=((c=document.getElementById("domCalleInput"))==null?void 0:c.value.trim())||"",p=((l=document.getElementById("domNumInput"))==null?void 0:l.value.trim())||"",u=((v=document.getElementById("domColoniaInput"))==null?void 0:v.value.trim())||"",m=[d,p,u].filter(Boolean).join(", ");m&&(a+=`<div class="domicilio-carrito-badge">
          🛵 <div><strong>Domicilio:</strong> ${re(m)}</div>
        </div>`)}this.carrito.forEach((d,p)=>{var m;t+=d.precio*d.cantidad;const u=[(m=d.opciones)!=null&&m.length?`<small>Sin: ${d.opciones.join(", ")}</small>`:"",d.observaciones?`<small>Obs: ${d.observaciones}</small>`:""].join("");if(d.grupo_mixta){if(!o[d.grupo_mixta]){o[d.grupo_mixta]=!0;const b=d.parent_nombre||"Mixta";a+=`<div class="mixta-header">${b}</div>`}const h=d.nombre.match(/\((.*?)\)$/),g=h?d.nombre.replace(` (${h[1]})`,""):d.nombre;a+=`
          <div class="carrito-item" data-index="${p}">
            <span style="color:#6c757d;">${d.cantidad}x ${g}</span>
            <strong>$${(d.precio*d.cantidad).toFixed(2)}</strong>
          </div>${u}`}else a+=`
          <div class="carrito-item" data-index="${p}">
            <span>${d.cantidad} x ${d.nombre}</span>
            <strong>$${(d.precio*d.cantidad).toFixed(2)}</strong>
          </div>${u}`}),this.tipoOrden==="domicilio"&&this.costoEnvio>0&&(a+=`<div class="carrito-item" style="background:#fff3e0;">
        <span style="color:#fd7e14;">🛵 Envío a domicilio</span>
        <strong style="color:#fd7e14;">$${this.costoEnvio.toFixed(2)}</strong>
      </div>`,t+=this.costoEnvio),e.innerHTML=(this.carrito.length||this.tipoOrden==="domicilio"&&this.costoEnvio>0)&&a||'<p class="carrito-vacio">Tu carrito está vacío.</p>',P("totalCarrito","$"+t.toFixed(2)),this.totalCarrito=t,this.pagoMixtoActivo&&this.actualizarMixtoFaltante();const n=document.getElementById("instruccionCarrito");n&&(n.style.display=this.carrito.length?"":"none");const s=document.getElementById("btnPagar");s&&(s.disabled=this.carrito.length===0)},async handlePagar(){if(this.totalCarrito===0){this.showAlert("Carrito vacío","Añade productos antes de pagar.","warning");return}if(!await At()){this.showAlert("Caja cerrada","No puedes realizar ventas sin una caja abierta.","warning");return}if(this.tipoOrden==="comer_aqui"){await this.registrarVenta(!0);return}if(this.pagoMixtoActivo){const{efectivo:t,tarjeta:a,transferencia:o}=this.montosMixtos,i=t+a+o;if(Math.abs(i-this.totalCarrito)>.01){this.showAlert("Montos incompletos",`La suma de los métodos ($${i.toFixed(2)}) debe ser igual al total ($${this.totalCarrito.toFixed(2)}).`,"warning");return}await this.registrarVenta(!1,!0);return}if(!this.metodoPago){this.showAlert("Falta método de pago","Elige 'Tarjeta', 'Efectivo' o 'Transferencia'.","warning");return}this.metodoPago==="tarjeta"?(await this.registrarVenta(),this.metodoPago=""):this.metodoPago==="efectivo"?(document.getElementById("inputPago").value="",P("inputPagoDisplay","$"),G("modal-pago")):this.metodoPago==="transferencia"&&G("modal-transferencia")},numpadPago(e){const t=document.getElementById("inputPago");let a=t.value;a===""&&e==="."?a="0.":a+=e,t.value=a,P("inputPagoDisplay","$"+a)},handleKeydownGlobal(e){const t=document.getElementById("modal-pago");if(!(!t||!t.classList.contains("active"))&&!["INPUT","TEXTAREA"].includes(e.target.tagName))if(e.key>="0"&&e.key<="9")this.numpadPago(e.key);else if(e.key==="."||e.key===",")document.getElementById("inputPago").value.includes(".")||this.numpadPago(".");else if(e.key==="Backspace"){const a=document.getElementById("inputPago");a.value=a.value.slice(0,-1),P("inputPagoDisplay",a.value===""?"$":"$"+a.value)}else e.key==="Enter"?this.confirmarPagoEfectivo():e.key==="Escape"&&L("modal-pago")},async confirmarPagoEfectivo(){const e=parseFloat(document.getElementById("inputPago").value);if(isNaN(e)||e<this.totalCarrito){this.showAlert("Monto insuficiente","El monto ingresado es menor al total.","error");return}this.cambio=e-this.totalCarrito,this.pagoEfectivoAmount=e,L("modal-pago"),await this.registrarVenta(!1),this.metodoPago="",this.pagoEfectivoAmount=0},generarHTMLTicket(e){const{ticket_id:t,fecha:a,vendedor_nombre:o,tipo_pago:i,tipo_orden:n,sensor_num:s,direccion:r,costo_envio:c,total:l,pago:v,cambio:d,productos:p,montos_mixtos:u}=e;let m="";const h=[];for(const E of p)if(E.grupo_mixta){if(h.includes(E.grupo_mixta))continue;h.push(E.grupo_mixta);const T=E.parent_nombre||"Mixta";m+=`<tr class='group-header'><td colspan='3'>${T}</td></tr>`;for(const y of p){if(y.grupo_mixta!==E.grupo_mixta)continue;const M=(y.nombre||"").match(/\((.*?)\)$/),H=M?y.nombre.replace(` (${M[1]})`,""):y.nombre,X=parseInt(y.cantidad),ge=(y.precio*X).toFixed(2);if(m+=`<tr>
            <td class='col-qty'>${X}x</td>
            <td class='col-name'>${H}</td>
            <td class='col-price'>$${ge}</td>
          </tr>`,y.observaciones&&(m+=`<tr class='note'><td></td><td colspan='2'>*** Obs: ${y.observaciones}</td></tr>`),y.opciones&&y.opciones.length>0){const D=Array.isArray(y.opciones)?y.opciones.join(", "):y.opciones;D.trim()&&(m+=`<tr class='note'><td></td><td colspan='2'>*** Sin: ${D}</td></tr>`)}}}else{const T=E.nombre,y=parseInt(E.cantidad),M=(E.precio*y).toFixed(2);if(m+=`<tr>
          <td class='col-qty'>${y}x</td>
          <td class='col-name'>${T}</td>
          <td class='col-price'>$${M}</td>
        </tr>`,E.observaciones&&(m+=`<tr class='note'><td></td><td colspan='2'>*** Obs: ${E.observaciones}</td></tr>`),E.opciones&&E.opciones.length>0){const H=Array.isArray(E.opciones)?E.opciones.join(", "):E.opciones;H.trim()&&(m+=`<tr class='note'><td></td><td colspan='2'>*** Sin: ${H}</td></tr>`)}}Number(c)>0&&(m+=`<tr>
        <td class='col-qty'></td>
        <td class='col-name' style='font-style:italic;'>Envio a domicilio</td>
        <td class='col-price'>$${Number(c).toFixed(2)}</td>
      </tr>`);const g=E=>`$${Number(E).toFixed(2)}`;let b="";return i&&i.toLowerCase()==="mixto"&&u?b=[u.efectivo>0?`<p><span>Efectivo:</span><span>${g(u.efectivo)}</span></p>`:"",u.tarjeta>0?`<p><span>Tarjeta:</span><span>${g(u.tarjeta)}</span></p>`:"",u.transferencia>0?`<p><span>Transferencia:</span><span>${g(u.transferencia)}</span></p>`:""].filter(Boolean).join(""):i&&i.toLowerCase()==="efectivo"?b=`
        <p><span>Recibo:</span><span>${g(v)}</span></p>
        <p><span>Cambio:</span><span>${g(d)}</span></p>`:b=`<p><span>Recibo:</span><span>${g(l)}</span></p>`,`
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'>
  <title>Ticket #${t}</title>
  <style>
    @page { margin: 0; size: 58mm auto; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      font-weight: bold;
      width: 48mm;
      margin: 0 auto;
      padding: 2px 0;
      color: #000;
      line-height: 1.25;
    }
    .center { text-align: center; }
    h1 { font-size: 18px; font-weight: 900; margin-bottom: 1px; }
    h2 { font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .sep { border: none; border-top: 1px dashed #000; margin: 5px 0; }
    .info p { font-size: 13px; margin-bottom: 1px; }
    /* Tabla de productos */
    table { width: 100%; border-collapse: collapse; table-layout: auto; }
    thead th { font-size: 12px; font-weight: 900; padding: 2px 0; text-transform: uppercase; letter-spacing: .1px; }
    thead th:first-child { text-align: left; }
    thead th:last-child { text-align: right; }
    td { font-size: 13px; padding: 2px 0; vertical-align: top; }
    .col-qty { width: 24px; white-space: nowrap; padding-right: 2px; }
    .col-name { word-break: break-word; }
    .col-price { width: 50px; text-align: right; white-space: nowrap; }
    .note td { font-size: 12px; padding: 0 0 1px; font-weight: normal; }
    .group-header td { font-size: 13px; font-weight: 900; padding-top: 5px; padding-bottom: 1px; }
    /* Totales */
    .totales { margin-top: 5px; font-size: 14px; }
    .totales p { display: flex; justify-content: space-between; margin-bottom: 2px; }
    .totales p span { font-variant-numeric: tabular-nums; }
    .total-final { font-size: 18px; font-weight: 900; text-align: center; margin: 7px 0 4px; letter-spacing: .3px; }
    .footer { font-size: 13px; text-align: center; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="center">
    <h1>Ticket #${t}</h1>
    <h2>Antojitos Santa Lucía</h2>
  </div>

  ${s?`
  <div style='text-align:center;border:2px solid #000;border-radius:5px;padding:5px 4px;margin:5px 0;'>
    <div style='font-size:10px;font-weight:900;letter-spacing:1px;'>SENSOR</div>
    <div style='font-size:46px;font-weight:900;line-height:1;'>#${s}</div>
  </div>`:""}

  <div class='info'>
    <p>Fecha: ${a}</p>
    <p>Vendedor: ${o}</p>
    <p>Tipo: ${n==="llevar"?"Para llevar":n==="comer_aqui"?"Comer aquí":"Domicilio"}</p>
    <p>Método de pago: ${i?i.toUpperCase():"Pendiente"}</p>
    ${r?`<p>Dirección:</p><p>${r}</p>`:""}
  </div>

  <hr class='sep'>

  <table>
    <thead>
      <tr>
        <th class='col-qty'>Cant</th>
        <th class='col-name'>Producto</th>
        <th class='col-price'>Total</th>
      </tr>
    </thead>
    <tbody>
      ${m}
    </tbody>
  </table>

  <hr class='sep'>

  <div class='total-final'>TOTAL: $${Number(l).toFixed(2)}</div>

  <div class='totales'>
    ${b}
  </div>

  <div class='footer'>
    <p>¡Gracias por su preferencia!</p>
  </div>
</body>
</html>`},generarHTMLComandaInterna({ticket_id:e,fecha:t,productos:a}){let o="";const i=[];for(const n of a)if(n.grupo_mixta){if(i.includes(n.grupo_mixta))continue;i.push(n.grupo_mixta);const s=n.parent_nombre||"Orden Mixta";o+=`<tr><td colspan='2' style='padding-top:6px;padding-bottom:2px;font-weight:bold;text-decoration:underline;'>${s}</td></tr>`;for(const r of a){if(r.grupo_mixta!==n.grupo_mixta)continue;const c=(r.nombre||"").match(/\((.*?)\)$/),l=c?r.nombre.replace(` (${c[1]})`,""):r.nombre;if(o+=`<tr><td style='width:22%;vertical-align:top;'>${parseInt(r.cantidad)}x</td><td style='vertical-align:top;word-break:break-word;'>${l}</td></tr>`,r.opciones&&r.opciones.length>0){const v=Array.isArray(r.opciones)?r.opciones.join(", "):r.opciones;v.trim()&&(o+=`<tr><td></td><td style='font-size:16px;'>  *** SIN: ${v}</td></tr>`)}r.observaciones&&(o+=`<tr><td></td><td style='font-size:16px;'>  Obs: ${r.observaciones}</td></tr>`)}}else{if(o+=`<tr><td style='width:22%;vertical-align:top;'>${parseInt(n.cantidad)}x</td><td style='vertical-align:top;word-break:break-word;'>${n.nombre}</td></tr>`,n.opciones&&n.opciones.length>0){const s=Array.isArray(n.opciones)?n.opciones.join(", "):n.opciones;s.trim()&&(o+=`<tr><td></td><td style='font-size:16px;'>  *** SIN: ${s}</td></tr>`)}n.observaciones&&(o+=`<tr><td></td><td style='font-size:16px;'>  Obs: ${n.observaciones}</td></tr>`)}return`
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'>
  <title>Comanda #${e}</title>
  <style>
    @page { margin: 0; size: 58mm auto; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      font-weight: bold;
      width: 48mm;
      margin: 0 auto;
      padding: 2px 0;
      color: #000;
      line-height: 1.25; /* tight line-height */
    }
    .center { text-align: center; }
    .sep { border: none; border-top: 2px dashed #000; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 2px 0; vertical-align: top; font-size: 14px; }
  </style>
</head>
<body>
  <div class="center">
    <div style='font-size:12px;letter-spacing:1px;'>— COMANDA INTERNA —</div>
    <div style='font-size:36px;font-weight:900;line-height:1.1;margin:4px 0;'>#${e}</div>
    <div style='font-size:12px;'>${t}</div>
    <div style='font-size:13px;margin-top:2px;'>■ COMER AQUÍ ■</div>
  </div>

  <hr class='sep'>

  <table>
    <tbody>${o}</tbody>
  </table>

  <hr class='sep'>

  <div class='center' style='font-size:11px;margin-top:4px;'>
    — uso interno —
  </div>
</body>
</html>`},generarHTMLTicketCorte({fecha:e,hora:t,empNombre:a,monto:o,fondo:i,caja_antes:n}){return`
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'>
  <title>Corte Preventivo</title>
  <style>
    @page { margin: 0; size: 58mm auto; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      font-weight: bold;
      width: 48mm;
      margin: 0 auto;
      padding: 2px 0;
      color: #000;
      line-height: 1.3;
    }
    .center { text-align: center; }
    .sep { border: none; border-top: 2px dashed #000; margin: 6px 0; }
    .monto { font-size: 20px; font-weight: 900; text-align: center; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="center">
    <div style='font-size:15px;font-weight:900;'>COMPROBANTE RETIRO</div>
    <div style='font-size:12px;margin-top:2px;'>CORTE PREVENTIVO</div>
  </div>
  
  <hr class='sep'>
  
  <div>
    <p>Fecha: ${e}</p>
    <p>Hora: ${t}</p>
    <p>Cajero: ${a}</p>
  </div>
  
  <hr class='sep'>
  
  <div class="monto">
    RETIRO: $${Number(o).toFixed(2)}
  </div>
  
  <hr class='sep'>
  
  <div style="font-size:12px; margin-top:5px;">
    <p>Fondo de caja: $${Number(i).toFixed(2)}</p>
    <p>Efectivo (antes): $${Number(n).toFixed(2)}</p>
  </div>
  
  <div class="center" style="margin-top:20px;">
    <p>_______________________</p>
    <p style="font-size:11px; margin-top:2px;">Firma / Recibido</p>
  </div>
</body>
</html>`},async registrarVenta(e=!1,t=!1){var a,o,i,n,s,r,c;if(!this.vendedorSeleccionado){this.showAlert("Sin vendedor","Debes elegir quién registra esta venta.","warning");return}be("Procesando Venta...");try{try{const{invoke:_}=((a=window.__TAURI__)==null?void 0:a.core)||await B(()=>Promise.resolve().then(()=>ee),void 0),[x]=await f("SELECT * FROM rv_licencia_local WHERE id = 1");if(!x)throw new Error("No se encontró archivo de licencia local.");if(!await _("verificar_firma_licencia",{fechaUltimoSync:x.fecha_ultimo_sync,fechaExpiracion:x.fecha_expiracion,ventasDesdeSync:x.ventas_desde_sync,firmaAValidar:x.firma_digital}))throw new Error("Firma de seguridad inválida. Posible corrupción o manipulación de datos.");if(x.ventas_desde_sync>=500)throw new Error(`Límite de ventas offline alcanzado (${x.ventas_desde_sync}/500). Requiere sincronización obligatoria.`);const q=new Date,ae=new Date(x.fecha_expiracion.replace(" ","T")+"Z");if(q>ae)throw new Error(`La licencia local ha expirado (${x.fecha_expiracion} UTC). Requiere conexión a internet para renovar.`);const[K]=await f("SELECT fecha FROM rv_ventas ORDER BY fecha DESC LIMIT 1");if(K&&K.fecha){const qe=new Date(K.fecha.replace(" ","T")+"Z");if(q<qe)throw new Error("El sistema requiere sincronización antes de continuar operando.")}}catch(_){Y(),this.showConfirm("Bloqueo de Seguridad Activado",_.message+" ¿Ir a Sincronización?","error",()=>{window.location.href="#/sincronizacion"});return}const l=this.tipoOrden,v=(((o=document.getElementById("sensorInput"))==null?void 0:o.value)||"").trim(),d=((i=document.getElementById("domCalleInput"))==null?void 0:i.value.trim())||"",p=((n=document.getElementById("domNumInput"))==null?void 0:n.value.trim())||"",u=((s=document.getElementById("domColoniaInput"))==null?void 0:s.value.trim())||"",m=l==="domicilio"?[d,p,u].filter(Boolean).join(", "):null,h=l==="domicilio"&&this.costoEnvio||0,g=e?null:t?"mixto":this.metodoPago,b=e?"pendiente":"completado",E=!e&&this.metodoPago==="efectivo"?this.pagoEfectivoAmount||this.totalCarrito:this.totalCarrito,T=!e&&this.metodoPago==="efectivo"?this.cambio:0,y=t?this.montosMixtos.efectivo||0:this.metodoPago==="efectivo"?this.totalCarrito:0,M=t?this.montosMixtos.tarjeta||0:this.metodoPago==="tarjeta"?this.totalCarrito:0,H=t?this.montosMixtos.transferencia||0:this.metodoPago==="transferencia"?this.totalCarrito:0;let X="Vendedor";try{const _=await f("SELECT emp_nombre FROM tm_empleado WHERE emp_id = $1",[this.vendedorSeleccionado]);_&&_.length>0&&(X=_[0].emp_nombre)}catch{}const[ge]=await f("SELECT COALESCE(MAX(ticket), 0) + 1 AS next_ticket FROM rv_ventas",[]),D=ge.next_ticket,Xe=new Date().getTimezoneOffset()*6e4,Ve=new Date(Date.now()-Xe).toISOString().replace("T"," ").substring(0,19);for(const _ of this.carrito){const x=((r=_.opciones)==null?void 0:r.join(", "))||"",te=_.observaciones||"",q=[x?"Sin: "+x:"",te].filter(Boolean).join("; ")||null;await w(`INSERT INTO rv_ventas
      (ticket, fecha, cantidad, id_producto, producto, vendedor,
        metodo_pago, total, total_ticket, cliente, estatus, plataforma_origen,
        tipo_orden, sensor_num, direccion, costo_envio,
        monto_efectivo, monto_tarjeta, monto_transferencia)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'desktop', $12, $13, $14, $15, $16, $17, $18)`,[D,Ve,_.cantidad,_.id,_.nombre,this.vendedorSeleccionado,g,_.precio*_.cantidad,this.totalCarrito,null,b,l,v||null,m,h,y,M,H]),(q||_.grupo_mixta)&&await w(`INSERT INTO rv_comanda
      (ticket_id, com_cantidad, pr_PLU, pr_nombre,
        com_ingredientes_omitir, com_comentarios, com_estatus)
    VALUES($1, $2, $3, $4, $5, $6, 'pendiente')`,[D,_.cantidad,_.id,_.nombre,x||null,q||null]);const ae=document.querySelector(`.producto-card[data-id="${_.id}"]`),K=ae==null?void 0:ae.dataset.stock;K&&K!=="NULL"&&await w("UPDATE rv_productos SET pr_stock = pr_stock - $1 WHERE ID = $2",[_.cantidad,_.id])}try{const{invoke:_}=((c=window.__TAURI__)==null?void 0:c.core)||await B(()=>Promise.resolve().then(()=>ee),void 0),[x]=await f("SELECT * FROM rv_licencia_local WHERE id = 1");if(x){const te=(x.ventas_desde_sync||0)+1,q=await _("generar_firma_licencia",{fechaUltimoSync:x.fecha_ultimo_sync,fechaExpiracion:x.fecha_expiracion,ventasDesdeSync:te});await w(`UPDATE rv_licencia_local 
                 SET ventas_desde_sync = $1, firma_digital = $2 
                 WHERE id = 1`,[te,q])}}catch(_){console.error("Error al re-firmar la licencia local tras la venta:",_)}if(Y(),e){if(window.imprimirTicket){const _=this.generarHTMLComandaInterna({ticket_id:D,fecha:new Date().toLocaleString("es-MX",{hour12:!1}),productos:this.carrito});window.imprimirTicket(_)}this.showAlert("Orden guardada",`Mesa en espera – Ticket #${D}. Aparecerá en Órdenes Pendientes.`,"success"),this.limpiarCarrito(),this.actualizarEstadoCaja(),this.actualizarBadgePendientes();return}const Ge={ticket_id:D,fecha:new Date().toLocaleString("es-MX"),vendedor_nombre:X,tipo_pago:t?"mixto":this.metodoPago.toUpperCase(),montos_mixtos:t?{...this.montosMixtos}:null,tipo_orden:l,sensor_num:v||null,direccion:m||null,costo_envio:h,total:this.totalCarrito,pago:E,cambio:T,productos:this.carrito},Se=this.generarHTMLTicket(Ge);if(window.imprimirTicket&&window.imprimirTicket(Se),t?this.showAlert("Pago mixto exitoso",`$${this.totalCarrito.toFixed(2)} – Ticket #${D}`,"success"):this.metodoPago==="efectivo"?this.showAlert(`Cambio: $${this.cambio.toFixed(2)} `,`Pago realizado con éxito. Ticket #${D} `,"success"):this.showAlert(this.metodoPago==="tarjeta"?"Pago con tarjeta exitoso":"Pago con transferencia exitoso",`$${this.totalCarrito.toFixed(2)} – Ticket #${D} `,"success"),l==="domicilio"){const _=document.querySelector(".cj-alert-footer");if(_&&!_.querySelector("#btn-copia-ticket")){const x=document.createElement("button");x.id="btn-copia-ticket",x.className="cj-btn-secondary",x.textContent="🖨 Copia",x.onclick=()=>{window.imprimirTicket&&window.imprimirTicket(Se)},_.insertBefore(x,_.firstChild)}}this.limpiarCarrito(),this.actualizarEstadoCaja()}catch(l){Y(),console.error("Error registrando venta:",l),this.showAlert("Error","No se pudo registrar la venta: "+(l.message||l),"error")}},agregarPlatilloPersonalizado(){const e=document.getElementById("platilloPersonalizarId").value,t=document.getElementById("platilloPersonalizarNombre").textContent,a=this.productosData.find(i=>i.ID==e);if(!a)return;if(Number(a.pr_precioventa)===0){let i=0;const n=Date.now()+"-"+Math.random().toString(36).substr(2,5),s=xe(t);if(document.querySelectorAll(".cant-mixta").forEach(r=>{const c=parseInt(r.value)||0;c>0&&(i++,this.carrito.push({id:parseInt(r.dataset.id),nombre:r.dataset.nombre+` (${s})`,precio:parseFloat(r.dataset.precio),cantidad:c,opciones:[],observaciones:"",grupo_mixta:n,parent_nombre:t}))}),i===0){this.showAlert("Atención",`Debes seleccionar al menos un artículo para ${t}.`,"warning");return}}this.actualizarCarrito(),this.cerrarComanda()},cerrarComanda(){L("modal-comanda")},limpiarCarrito(){this.carrito=[],this.metodoPago="",this.cambio=0,this.costoEnvio=0,this.pagoMixtoActivo&&this.cambiarPagoMixto(),this.montosMixtos={efectivo:0,tarjeta:0,transferencia:0},document.querySelectorAll(".tile-pago").forEach(a=>a.classList.remove("active"));const e=document.getElementById("inputPago");e&&(e.value=""),L("modal-pago"),L("modal-transferencia"),this.cambiarTipoOrden("llevar");const t=document.getElementById("sensorInput");t&&(t.value=""),["domCalleInput","domNumInput","domColoniaInput","costoEnvioInput"].forEach(a=>{const o=document.getElementById(a);o&&(o.value="")}),document.querySelectorAll(".btn-envio-preset").forEach(a=>a.classList.remove("active")),this.actualizarCarrito()},async actualizarEstadoCaja(){var e;try{const t=await f(`SELECT id, fecha_apertura, monto_apertura FROM rv_apertura_caja
         WHERE estatus = 'activa' ORDER BY fecha_apertura DESC LIMIT 1`,[]);if(t.length===0){P("cajaEfectivoStatus","$0");return}const a=t[0],[o]=await f(`SELECT COALESCE(SUM(total), 0) AS ve
         FROM rv_ventas WHERE estatus = 'completado' AND LOWER(metodo_pago) = 'efectivo'
         AND fecha >= $1`,[a.fecha_apertura]),i=await f(`SELECT COALESCE(SUM(precio_unitario), 0) AS tc FROM rv_gastos
         WHERE (tipo_gasto = 'Corte Preventivo' OR (tipo_gasto = 'Salida de Efectivo' AND LOWER(metodo_pago) = 'efectivo'))
         AND fecha >= $1`,[a.fecha_apertura]),n=(parseFloat(a.monto_apertura)||0)+(parseFloat(o.ve)||0)-(parseFloat((e=i[0])==null?void 0:e.tc)||0),s=parseFloat(a.monto_apertura)||0;this._cajaEfectivo=n,this._cajaFondo=s;const r=document.getElementById("cajaCompactPill"),c=document.getElementById("btnCortePreventivo");P("cajaEfectivoStatus","$"+Math.round(n)),n>s?(r==null||r.classList.add("danger"),c&&c.classList.add("visible")):(r==null||r.classList.remove("danger"),c&&c.classList.remove("visible"))}catch(t){console.warn("No se pudo actualizar estado caja:",t)}},async actualizarBadgePendientes(){var e;try{const a=((e=(await f("SELECT COUNT(DISTINCT ticket) AS cnt FROM rv_ventas WHERE estatus = 'pendiente'"))[0])==null?void 0:e.cnt)||0,o=document.getElementById("badgePendientes");o&&(o.textContent=a>0?`(${a})`:"")}catch{}},async abrirOrdenesPendientes(){G("modal-pendientes");const e=document.getElementById("pendientes-lista");e&&(e.innerHTML='<p style="text-align:center;color:#6c757d;">Cargando...</p>');try{const t=await f(`SELECT ticket, fecha, total_ticket, tipo_orden, sensor_num, direccion, costo_envio
         FROM rv_ventas WHERE estatus = 'pendiente'
         GROUP BY ticket ORDER BY fecha ASC`);if(!t.length){e.innerHTML='<p style="text-align:center;color:#6c757d;padding:20px;">No hay órdenes pendientes.</p>';return}let a="";for(const o of t){const n=(await f("SELECT cantidad, producto FROM rv_ventas WHERE ticket = $1 AND estatus = 'pendiente'",[o.ticket])).map(c=>`${c.cantidad}x ${c.producto}`).join("<br>"),s=new Date(o.fecha.replace(" ","T")).toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});let r="";o.tipo_orden==="llevar"&&o.sensor_num&&(r=`<span style="color:#007aff; font-weight:700;">Sensor #${o.sensor_num}</span> — `),o.tipo_orden==="domicilio"&&o.direccion&&(r=`<span style="color:#fd7e14;">🛵 ${o.direccion}</span> — `),a+=`<div class="pendiente-card">
          <div class="pendiente-card-header">
            <span class="pendiente-ticket-num">Ticket #${o.ticket}</span>
            <span class="pendiente-hora">${r}${s}</span>
          </div>
          <div class="pendiente-items">${n}</div>
          <div class="pendiente-total">Total: $${Number(o.total_ticket).toFixed(2)}</div>
          <button class="btn-cobrar-pendiente"
            data-ticket="${o.ticket}"
            data-total="${o.total_ticket}"
            data-tipo-orden="${o.tipo_orden||"llevar"}"
            data-sensor="${o.sensor_num||""}"
            data-dir="${o.direccion||""}"
            data-envio="${o.costo_envio||0}">
            💳 Cobrar
          </button>
        </div>`}e.innerHTML=a,e.querySelectorAll(".btn-cobrar-pendiente").forEach(o=>{o.addEventListener("click",()=>{this.abrirCobrarPendiente({ticket:o.dataset.ticket,total:parseFloat(o.dataset.total),tipoOrden:o.dataset.tipoOrden,sensor:o.dataset.sensor,dir:o.dataset.dir,envio:parseFloat(o.dataset.envio)||0,items:e.querySelector(`.btn-cobrar-pendiente[data-ticket="${o.dataset.ticket}"]`).closest(".pendiente-card").querySelector(".pendiente-items").innerHTML})})})}catch(t){e&&(e.innerHTML=`<p style="color:#dc3545;">Error: ${t.message}</p>`)}},abrirCobrarPendiente({ticket:e,total:t,tipoOrden:a,sensor:o,dir:i,envio:n,items:s}){this._cobrarTicket=e,this._cobrarTotal=t,this._cobrarMetodo="",P("cobrar-pendiente-title",`Cobrar Ticket #${e}`);const r=document.getElementById("cobrar-pendiente-items");r&&(r.innerHTML=s);const c=document.getElementById("cobrar-pendiente-total");c&&(c.textContent=`$${t.toFixed(2)}`),document.querySelectorAll("#cobrar-pago-methods .tile-pago").forEach(d=>d.classList.remove("active"));const l=document.getElementById("cobrar-efectivo-row");l&&(l.style.display="none");const v=document.getElementById("cobrar-efectivo-input");v&&(v.value=""),document.getElementById("cobrar-pendiente-confirmar").disabled=!0,G("modal-cobrar-pendiente")},async confirmarCobroPendiente(){var a,o;if(!this._cobrarTicket||!this._cobrarMetodo)return;let e=null,t=0;if(this._cobrarMetodo==="efectivo"){if(e=parseFloat((a=document.getElementById("cobrar-efectivo-input"))==null?void 0:a.value)||0,e<this._cobrarTotal){this.showAlert("Monto insuficiente","El monto recibido es menor al total.","error");return}t=e-this._cobrarTotal}be("Procesando Cobro...");try{const i=new Date().getTimezoneOffset()*6e4,n=new Date(Date.now()-i).toISOString().replace("T"," ").substring(0,19);await w(`UPDATE rv_ventas SET estatus = 'completado', metodo_pago = $1, fecha = $2
         WHERE ticket = $3 AND estatus = 'pendiente'`,[this._cobrarMetodo,n,this._cobrarTicket]);try{const{invoke:p}=((o=window.__TAURI__)==null?void 0:o.core)||await B(()=>Promise.resolve().then(()=>ee),void 0),[u]=await f("SELECT * FROM rv_licencia_local WHERE id = 1");if(u){const m=(u.ventas_desde_sync||0)+1,h=await p("generar_firma_licencia",{fechaUltimoSync:u.fecha_ultimo_sync,fechaExpiracion:u.fecha_expiracion,ventasDesdeSync:m});await w("UPDATE rv_licencia_local SET ventas_desde_sync = $1, firma_digital = $2 WHERE id = 1",[m,h])}}catch{}Y();const s=await f("SELECT * FROM rv_ventas WHERE ticket = $1 LIMIT 1",[this._cobrarTicket]),r=await f("SELECT cantidad, producto, total FROM rv_ventas WHERE ticket = $1",[this._cobrarTicket]),c=s[0]||{};let l="Vendedor";try{const p=await f("SELECT emp_nombre FROM tm_empleado WHERE emp_id = $1",[c.vendedor]);p!=null&&p.length&&(l=p[0].emp_nombre)}catch{}const v={ticket_id:this._cobrarTicket,fecha:new Date().toLocaleString("es-MX"),vendedor_nombre:l,tipo_pago:this._cobrarMetodo.toUpperCase(),tipo_orden:c.tipo_orden||"comer_aqui",sensor_num:c.sensor_num||null,direccion:c.direccion||null,costo_envio:parseFloat(c.costo_envio)||0,total:this._cobrarTotal,pago:e||this._cobrarTotal,cambio:t,productos:r.map(p=>({nombre:p.producto,cantidad:p.cantidad,precio:p.total/p.cantidad}))},d=this.generarHTMLTicket(v);window.imprimirTicket&&window.imprimirTicket(d),this._cobrarMetodo==="efectivo"?this.showAlert(`Cambio: $${t.toFixed(2)}`,`Cobro exitoso. Ticket #${this._cobrarTicket}`,"success"):this.showAlert("Cobro exitoso",`Ticket #${this._cobrarTicket} – $${this._cobrarTotal.toFixed(2)}`,"success"),L("modal-cobrar-pendiente"),L("modal-pendientes"),this.actualizarEstadoCaja(),this.actualizarBadgePendientes()}catch(i){Y(),this.showAlert("Error","No se pudo procesar el cobro: "+(i.message||""),"error")}},abrirModalCorte(){if(!document.querySelector(".vendedor-selector.is_active")){this.showAlert("Selecciona un cajero","Debes seleccionar quién realizará el corte.","warning");return}const t=this._cajaEfectivo||0,a=this._cajaFondo||0,o=t-a,i=document.getElementById("corte-info-caja");i&&(i.textContent=`Efectivo en caja: $${t.toLocaleString("es-MX",{minimumFractionDigits:2})} · Fondo: $${a.toLocaleString("es-MX",{minimumFractionDigits:2})} · Disponible: $${o.toLocaleString("es-MX",{minimumFractionDigits:2})}`);const n=document.getElementById("corteMontoInput");n&&(n.value=""),G("modal-corte"),setTimeout(()=>n==null?void 0:n.focus(),100)},async confirmarCorte(){var n;const e=document.querySelector(".vendedor-selector.is_active");if(!e){L("modal-corte");return}const t=parseFloat((n=document.getElementById("corteMontoInput"))==null?void 0:n.value)||0;if(t<=0){this.showAlert("Monto inválido","Ingresa un monto mayor a $0.","warning");return}const a=(this._cajaEfectivo||0)-(this._cajaFondo||0);if(t>a+.01){this.showAlert("Monto excede disponible",`Solo puedes retirar hasta $${a.toLocaleString("es-MX",{minimumFractionDigits:2})}.`,"warning");return}L("modal-corte");const o=e.textContent.trim(),i="$"+t.toLocaleString("es-MX",{minimumFractionDigits:2});this.showConfirm("¿Confirmar Retiro?",`${o} retirará ${i} de la caja.`,"warning",async()=>{try{be("Procesando Retiro...");const s=this._cajaEfectivo||0,r=this._cajaFondo||0;await w(`INSERT INTO rv_gastos(tipo_gasto, descripcion, fecha, comentario, precio_unitario, tipo, metodo_pago, usu_id)
             VALUES('Corte Preventivo', 'Retiro de efectivo preventivo', datetime('now', 'localtime'),
               $1, $2, 'operativo', 'efectivo', $3)`,["Realizado por: "+o,t,this.vendedorSeleccionado||1]),Y(),this.actualizarEstadoCaja();const c=new Date,l=c.toLocaleDateString("es-MX"),v=c.toLocaleTimeString("es-MX",{hour12:!0}),d=this.generarHTMLTicketCorte({fecha:l,hora:v,empNombre:o,monto:t,fondo:r,caja_antes:s});window.imprimirTicket&&window.imprimirTicket(d),this.showAlert("Retiro Realizado",`${o} registró el retiro de ${i} correctamente.`,"success")}catch(s){Y(),this.showAlert("Error","No se pudo registrar el retiro: "+(s.message||""),"error")}})},showAlert(e,t,a="info",o=null){var v;const i={success:"linear-gradient(135deg,#28a745,#20c997)",error:"linear-gradient(135deg,#dc3545,#c82333)",warning:"linear-gradient(135deg,#ffc107,#ff9800)",info:"linear-gradient(135deg,#4a90e2,#357abd)"},n=document.getElementById("cj-alert-header"),s=document.getElementById("cj-alert-title"),r=document.getElementById("cj-alert-body"),c=document.getElementById("cj-alert-cancel"),l=document.getElementById("cj-alert-confirm");n&&(n.style.background=i[a]||i.info),s&&(s.textContent=e),r&&(r.textContent=t),c&&(c.style.display="none",c.onclick=null),l&&(l.textContent="Aceptar",l.onclick=()=>{ie(),o&&o()}),(v=document.getElementById("btn-copia-ticket"))==null||v.remove(),G("cj-alert-overlay")},showConfirm(e,t,a="warning",o=null){const i={warning:"linear-gradient(135deg,#ffc107,#ff9800)",info:"linear-gradient(135deg,#4a90e2,#357abd)",success:"linear-gradient(135deg,#28a745,#20c997)"},n=document.getElementById("cj-alert-header"),s=document.getElementById("cj-alert-title"),r=document.getElementById("cj-alert-body"),c=document.getElementById("cj-alert-cancel"),l=document.getElementById("cj-alert-confirm");n&&(n.style.background=i[a]||i.warning),s&&(s.textContent=e),r&&(r.textContent=t),c&&(c.style.display="",c.textContent="Cancelar",c.onclick=()=>ie()),l&&(l.textContent="Confirmar",l.onclick=()=>{ie(),o&&o()}),G("cj-alert-overlay")}};window.CajaApp=Le;window.imprimirTicket=function(e){if(!e)return;const t=document.getElementById("print-iframe");t&&t.parentNode.removeChild(t);const a=document.createElement("iframe");a.id="print-iframe",a.style.position="fixed",a.style.right="0",a.style.bottom="0",a.style.width="0",a.style.height="0",a.style.border="0",document.body.appendChild(a);const o=a.contentWindow.document;o.open(),o.write(e),o.close(),setTimeout(()=>{a.contentWindow.focus(),a.contentWindow.print(),setTimeout(()=>{const i=document.getElementById("print-iframe");i&&i.parentNode.removeChild(i)},5e3)},400)};async function It(){return await f(`SELECT p.ID, p.pr_nombre, c.nombre AS pr_categoria,
      p.pr_precioventa, p.pr_favorito, p.pr_stock
     FROM rv_productos p
     INNER JOIN rv_categorias c ON p.categoria_id = c.id
     WHERE p.pr_estatus = 1`,[])}async function Ct(){return await f(`SELECT emp_id, emp_nombre 
     FROM tm_empleado 
     WHERE emp_estatus = 1 AND (emp_puesto = 'Cajero' OR emp_puesto = 'empleado')
     ORDER BY emp_nombre`,[])}async function At(){return(await f("SELECT id FROM rv_apertura_caja WHERE estatus = 'activa' LIMIT 1",[])).length>0}function Ee(e){return(e||"").replace(/\s+/g,"-").replace(/[^A-Za-z0-9-]/g,"")}function re(e){return(e||"").replace(/'/g,"\\'").replace(/"/g,"&quot;")}function P(e,t){const a=document.getElementById(e);a&&(a.textContent=t)}function k(e,t,a){var o;(o=document.getElementById(e))==null||o.addEventListener(t,a)}function G(e){var t;(t=document.getElementById(e))==null||t.classList.add("active")}function L(e){var t;(t=document.getElementById(e))==null||t.classList.remove("active")}function ie(){L("cj-alert-overlay")}function be(e="Procesando..."){var t;P("cj-loading-text",e),(t=document.getElementById("cj-loading"))==null||t.classList.add("active")}function Y(){var e;(e=document.getElementById("cj-loading"))==null||e.classList.remove("active")}async function St(e){$t("productos-css","/assets/css/productos.css"),z(e,"productos",Nt()),await Rt.init()}function $t(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function Nt(){return`
  <div class="prod-container">

    <!-- Header -->
    <div class="prod-header">
      <div>
        <h1 class="prod-title"><i class="fas fa-box-open"></i> Productos</h1>
        <p class="prod-subtitle">Gestión del catálogo de platillos y artículos</p>
      </div>
      <button class="prod-btn prod-btn-primary" id="btn-nuevo-producto">
        <i class="fas fa-plus"></i> Nuevo Producto
      </button>
    </div>

    <!-- Filtros + Buscador -->
    <div class="prod-toolbar">
      <div class="prod-search-wrap">
        <i class="fas fa-search prod-search-icon"></i>
        <input type="text" id="prod-search" class="prod-search" placeholder="Buscar producto...">
      </div>
      <div class="prod-filter-wrap">
        <select id="prod-filter-cat" class="prod-select">
          <option value="">Todas las categorías</option>
        </select>
        <select id="prod-filter-estatus" class="prod-select">
          <option value="">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="prod-table-wrap">
      <table class="prod-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio Venta</th>
            <th>Stock</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="prod-tbody">
          <tr><td colspan="7" class="prod-loading">
            <div class="prod-spinner"></div> Cargando productos...
          </td></tr>
        </tbody>
      </table>
    </div>

  </div>

  <!-- ====== MODAL: CREAR / EDITAR ====== -->
  <div class="prod-modal-overlay" id="modal-producto">
    <div class="prod-modal">
      <div class="prod-modal-header">
        <h5 id="modal-prod-title">Nuevo Producto</h5>
        <button class="prod-modal-close" id="close-modal-producto">&times;</button>
      </div>
      <div class="prod-modal-body">
        <input type="hidden" id="prod-id">

        <div class="prod-form-row">
          <div class="prod-form-group">
            <label>Nombre *</label>
            <input type="text" id="prod-nombre" class="prod-input" placeholder="Ej. Enchiladas (6 pzs)">
          </div>
          <div class="prod-form-group">
            <label>Categoría *</label>
            <div style="display:flex; gap:10px;">
                <select id="prod-categoria" class="prod-select-full" style="flex:1;">
                  <option value="">-- Seleccionar --</option>
                </select>
                <button type="button" class="prod-btn prod-btn-secondary" id="btn-nueva-categoria" title="Nueva Categoría" style="padding: 0 12px;">
                  <i class="fas fa-plus"></i> Nueva
                </button>
            </div>
          </div>
        </div>

        <div class="prod-form-row">
          <div class="prod-form-group">
            <label>Precio de Venta *</label>
            <div class="prod-input-prefix">
              <span>$</span>
              <input type="number" id="prod-precio-venta" class="prod-input" min="0" step="0.50" placeholder="0.00">
            </div>
          </div>
          <div class="prod-form-group">
            <label>Precio de Compra (Costo)</label>
            <div class="prod-input-prefix">
              <span>$</span>
              <input type="number" id="prod-precio-compra" class="prod-input" min="0" step="0.50" placeholder="0.00">
            </div>
          </div>
        </div>

        <div class="prod-form-row">
          <div class="prod-form-group">
            <label>Stock inicial <small style="color:#6c757d;">(vacío = sin control)</small></label>
            <input type="number" id="prod-stock" class="prod-input" min="0" step="1" placeholder="Vacío = ilimitado">
          </div>
          <div class="prod-form-group">
            <label>Stock mínimo (alerta)</label>
            <input type="number" id="prod-stock-min" class="prod-input" min="0" step="1" value="10">
          </div>
        </div>

        <div class="prod-form-row">
          <div class="prod-form-group">
            <label>Descripción</label>
            <textarea id="prod-descripcion" class="prod-input prod-textarea" rows="2" placeholder="Descripción opcional..."></textarea>
          </div>
          <div class="prod-form-group" style="display:flex; flex-direction:column; gap:12px; justify-content:flex-end;">
            <label class="prod-checkbox-label">
              <input type="checkbox" id="prod-favorito">
              <span>⭐ Producto favorito</span>
            </label>
            <label class="prod-checkbox-label">
              <input type="checkbox" id="prod-activo" checked>
              <span>✅ Producto activo</span>
            </label>
          </div>
        </div>

        <div id="modal-prod-error" class="prod-error" style="display:none;"></div>
      </div>
      <div class="prod-modal-footer">
        <button class="prod-btn prod-btn-secondary" id="cancelar-producto">Cancelar</button>
        <button class="prod-btn prod-btn-primary"   id="guardar-producto">
          <i class="fas fa-save"></i> Guardar
        </button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL ALERTA ====== -->
  <div class="prod-modal-overlay" id="prod-alert-overlay">
    <div class="prod-modal" style="max-width:340px;">
      <div class="prod-modal-header" id="prod-alert-header">
        <h5 id="prod-alert-title">Aviso</h5>
        <button class="prod-modal-close" id="close-prod-alert">&times;</button>
      </div>
      <div class="prod-modal-body">
        <p id="prod-alert-body" style="font-size:.95rem; line-height:1.5;"></p>
      </div>
      <div class="prod-modal-footer">
        <button class="prod-btn prod-btn-secondary" id="prod-alert-cancel" style="display:none;">Cancelar</button>
        <button class="prod-btn prod-btn-primary"   id="prod-alert-confirm">Aceptar</button>
      </div>
    </div>
  </div>
  `}const Rt={productos:[],categorias:[],async init(){this.categorias=await f("SELECT id, nombre FROM rv_categorias ORDER BY nombre",[]),this.llenarCategoriasFiltro(),this.llenarCategoriasForm(),this.bindEvents(),await this.cargarProductos()},llenarCategoriasFiltro(){const e=document.getElementById("prod-filter-cat");e&&this.categorias.forEach(t=>{const a=document.createElement("option");a.value=t.id,a.textContent=t.nombre,e.appendChild(a)})},llenarCategoriasForm(){const e=document.getElementById("prod-categoria");e&&this.categorias.forEach(t=>{const a=document.createElement("option");a.value=t.id,a.textContent=t.nombre,e.appendChild(a)})},bindEvents(){var e,t,a;V("btn-nuevo-producto","click",()=>this.abrirModalNuevo()),V("close-modal-producto","click",()=>ce("modal-producto")),V("cancelar-producto","click",()=>ce("modal-producto")),V("guardar-producto","click",()=>this.guardarProducto()),V("btn-nueva-categoria","click",()=>this.crearNuevaCategoria()),V("prod-search","input",()=>this.renderTabla()),V("prod-filter-cat","change",()=>this.renderTabla()),V("prod-filter-estatus","change",()=>this.renderTabla()),(e=document.getElementById("modal-producto"))==null||e.addEventListener("click",o=>{o.target.id==="modal-producto"&&ce("modal-producto")}),(t=document.getElementById("prod-alert-overlay"))==null||t.addEventListener("click",o=>{o.target.id==="prod-alert-overlay"&&se()}),V("close-prod-alert","click",()=>se()),(a=document.getElementById("prod-tbody"))==null||a.addEventListener("click",o=>{const i=o.target.closest(".btn-editar"),n=o.target.closest(".btn-toggle");i&&this.editarProducto(parseInt(i.dataset.id)),n&&this.toggleEstatus(parseInt(n.dataset.id),parseInt(n.dataset.estatus))})},async cargarProductos(){this.productos=await f(`SELECT p.ID, p.pr_nombre, c.nombre AS pr_categoria, p.categoria_id,
              p.pr_precioventa, p.pr_preciocompra, p.pr_stock, p.pr_stock_minimo,
              p.pr_descripcion, p.pr_estatus, p.pr_favorito, p.es_platillo
       FROM rv_productos p
       LEFT JOIN rv_categorias c ON p.categoria_id = c.id
       ORDER BY c.nombre, p.pr_nombre`,[]),this.renderTabla()},async crearNuevaCategoria(){if(!window.Swal)return alert("Error: SweetAlert no está disponible.");const{value:e}=await Swal.fire({title:"Nueva Categoría",input:"text",inputLabel:"Nombre de la nueva categoría",inputPlaceholder:"Ej: Postres",showCancelButton:!0,confirmButtonText:"Guardar",cancelButtonText:"Cancelar",inputValidator:t=>{if(!t||t.trim()==="")return"Debes escribir un nombre"}});if(e)try{await w("INSERT INTO rv_categorias (nombre, descripcion) VALUES ($1, $2)",[e.trim(),""]);const a=(await f("SELECT last_insert_rowid() AS id",[]))[0].id;this.categorias=await f("SELECT id, nombre FROM rv_categorias ORDER BY nombre",[]);const o=document.getElementById("prod-filter-cat");o&&(o.innerHTML='<option value="">Todas las categorías</option>',this.llenarCategoriasFiltro());const i=document.getElementById("prod-categoria");i&&(i.innerHTML='<option value="">-- Seleccionar --</option>',this.llenarCategoriasForm(),i.value=a),window.showToast&&window.showToast(`Categoría "${e}" creada.`,"green")}catch(t){console.error("Error creando categoría",t),alert("Ocurrió un error al crear la categoría.")}},filtrados(){var o,i,n;const e=(((o=document.getElementById("prod-search"))==null?void 0:o.value)||"").toLowerCase(),t=((i=document.getElementById("prod-filter-cat"))==null?void 0:i.value)||"",a=((n=document.getElementById("prod-filter-estatus"))==null?void 0:n.value)||"";return this.productos.filter(s=>{const r=s.pr_nombre.toLowerCase().includes(e),c=!t||String(s.categoria_id)===t,l=a===""||String(s.pr_estatus)===a;return r&&c&&l})},renderTabla(){const e=document.getElementById("prod-tbody");if(!e)return;const t=this.filtrados();if(t.length===0){e.innerHTML=`<tr><td colspan="7" style="text-align:center; padding:30px; color:#6c757d;">
        Sin productos que coincidan.
      </td></tr>`;return}e.innerHTML=t.map(a=>{const o=a.pr_stock===null||a.pr_stock===void 0?'<span class="prod-badge prod-badge-info">Sin control</span>':a.pr_stock<=0?`<span class="prod-badge prod-badge-danger">Agotado (${a.pr_stock})</span>`:`<span class="prod-badge prod-badge-success">${a.pr_stock}</span>`,i=a.pr_estatus?'<span class="prod-badge prod-badge-success">Activo</span>':'<span class="prod-badge prod-badge-secondary">Inactivo</span>',n=a.pr_favorito?"⭐ ":"";return`
      <tr class="${a.pr_estatus?"":"prod-row-inactivo"}">
        <td style="color:#6c757d; font-size:.85rem;">${a.ID}</td>
        <td>
          <div class="prod-nombre-cell">${n}<strong>${a.pr_nombre}</strong></div>
          ${a.pr_descripcion?`<small style="color:#6c757d;">${a.pr_descripcion}</small>`:""}
        </td>
        <td><span class="prod-badge prod-badge-cat">${a.pr_categoria||"—"}</span></td>
        <td style="font-weight:700; color:#28a745;">$${Number(a.pr_precioventa).toFixed(2)}</td>
        <td>${o}</td>
        <td>${i}</td>
        <td>
          <div class="prod-actions">
            <button class="prod-btn-icon btn-editar" data-id="${a.ID}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="prod-btn-icon ${a.pr_estatus?"btn-danger":"btn-success"} btn-toggle"
                    data-id="${a.ID}" data-estatus="${a.pr_estatus}"
                    title="${a.pr_estatus?"Desactivar":"Activar"}">
              <i class="fas ${a.pr_estatus?"fa-toggle-on":"fa-toggle-off"}"></i>
            </button>
          </div>
        </td>
      </tr>`}).join("")},abrirModalNuevo(){var e;document.getElementById("prod-id").value="",document.getElementById("prod-nombre").value="",document.getElementById("prod-categoria").value="",document.getElementById("prod-precio-venta").value="",document.getElementById("prod-precio-compra").value="0",document.getElementById("prod-stock").value="",document.getElementById("prod-stock-min").value="10",document.getElementById("prod-descripcion").value="",document.getElementById("prod-favorito").checked=!1,document.getElementById("prod-activo").checked=!0,document.getElementById("modal-prod-error").style.display="none",Me("modal-prod-title","Nuevo Producto"),ue("modal-producto"),(e=document.getElementById("prod-nombre"))==null||e.focus()},editarProducto(e){const t=this.productos.find(a=>a.ID===e);t&&(document.getElementById("prod-id").value=t.ID,document.getElementById("prod-nombre").value=t.pr_nombre,document.getElementById("prod-categoria").value=t.categoria_id||"",document.getElementById("prod-precio-venta").value=t.pr_precioventa,document.getElementById("prod-precio-compra").value=t.pr_preciocompra||0,document.getElementById("prod-stock").value=t.pr_stock??"",document.getElementById("prod-stock-min").value=t.pr_stock_minimo||10,document.getElementById("prod-descripcion").value=t.pr_descripcion||"",document.getElementById("prod-favorito").checked=t.pr_favorito==1,document.getElementById("prod-activo").checked=t.pr_estatus==1,document.getElementById("modal-prod-error").style.display="none",Me("modal-prod-title","Editar Producto"),ue("modal-producto"))},async guardarProducto(){const e=document.getElementById("prod-id").value,t=document.getElementById("prod-nombre").value.trim(),a=document.getElementById("prod-categoria").value,o=parseFloat(document.getElementById("prod-precio-venta").value),i=parseFloat(document.getElementById("prod-precio-compra").value)||0,n=document.getElementById("prod-stock").value.trim(),s=n===""?null:parseInt(n),r=parseInt(document.getElementById("prod-stock-min").value)||10,c=document.getElementById("prod-descripcion").value.trim(),l=document.getElementById("prod-favorito").checked?1:0,v=document.getElementById("prod-activo").checked?1:0,d=document.getElementById("modal-prod-error");if(!t){d.textContent="El nombre del producto es obligatorio.",d.style.display="";return}if(!a){d.textContent="Selecciona una categoría.",d.style.display="";return}if(isNaN(o)||o<0){d.textContent="El precio de venta debe ser un número válido.",d.style.display="";return}d.style.display="none";try{e?await w(`UPDATE rv_productos SET
             pr_nombre=$1, categoria_id=$2, pr_precioventa=$3, pr_preciocompra=$4,
             pr_stock=$5, pr_stock_minimo=$6, pr_descripcion=$7,
             pr_favorito=$8, pr_estatus=$9
           WHERE ID=$10`,[t,a,o,i,s,r,c||null,l,v,parseInt(e)]):await w(`INSERT INTO rv_productos
             (pr_nombre, categoria_id, pr_precioventa, pr_preciocompra,
              pr_stock, pr_stock_minimo, pr_descripcion, pr_favorito, pr_estatus)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,[t,a,o,i,s,r,c||null,l,v]),ce("modal-producto"),await this.cargarProductos(),this.showAlert("✅ Guardado",e?"Producto actualizado correctamente.":"Producto creado correctamente.","success")}catch(p){d.textContent="Error al guardar: "+(p.message||p),d.style.display=""}},async toggleEstatus(e,t){const a=t?0:1,o=a?"activar":"desactivar";this.showConfirm("¿Confirmar acción?",`¿Deseas ${o} este producto?`,"warning",async()=>{await w("UPDATE rv_productos SET pr_estatus=$1 WHERE ID=$2",[a,e]),await this.cargarProductos()})},showAlert(e,t,a="info",o=null){const i={success:"linear-gradient(135deg,#28a745,#20c997)",error:"linear-gradient(135deg,#dc3545,#c82333)",warning:"linear-gradient(135deg,#ffc107,#ff9800)",info:"linear-gradient(135deg,#4a90e2,#357abd)"},n=document.getElementById("prod-alert-header"),s=document.getElementById("prod-alert-title"),r=document.getElementById("prod-alert-body"),c=document.getElementById("prod-alert-cancel"),l=document.getElementById("prod-alert-confirm");n&&(n.style.background=i[a]||i.info),s&&(s.textContent=e),r&&(r.textContent=t),c&&(c.style.display="none",c.onclick=null),l&&(l.textContent="Aceptar",l.onclick=()=>{se(),o&&o()}),ue("prod-alert-overlay")},showConfirm(e,t,a="warning",o=null){const i={warning:"linear-gradient(135deg,#ffc107,#ff9800)",info:"linear-gradient(135deg,#4a90e2,#357abd)"},n=document.getElementById("prod-alert-header"),s=document.getElementById("prod-alert-title"),r=document.getElementById("prod-alert-body"),c=document.getElementById("prod-alert-cancel"),l=document.getElementById("prod-alert-confirm");n&&(n.style.background=i[a]||i.warning),s&&(s.textContent=e),r&&(r.textContent=t),c&&(c.style.display="",c.textContent="Cancelar",c.onclick=()=>se()),l&&(l.textContent="Confirmar",l.onclick=()=>{se(),o&&o()}),ue("prod-alert-overlay")}};function V(e,t,a){var o;(o=document.getElementById(e))==null||o.addEventListener(t,a)}function Me(e,t){const a=document.getElementById(e);a&&(a.textContent=t)}function ue(e){var t;(t=document.getElementById(e))==null||t.classList.add("active")}function ce(e){var t;(t=document.getElementById(e))==null||t.classList.remove("active")}function se(){ce("prod-alert-overlay")}const Mt=6e4;async function jt(e){Ot("comanda-css","/assets/css/comanda.css"),z(e,"comanda",Bt()),Dt.init()}function Ot(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function Bt(){return`
  <main class="comanda-board">

    <!-- Columna Pendiente -->
    <div class="kanban-column" id="columna-pendiente">
      <h2 class="column-header pendiente">
        📋 Pendiente <span class="col-count" id="count-pendiente">0</span>
      </h2>
      <div class="tasks-container" id="tasks-pendiente">
        <div class="column-empty">Sin órdenes pendientes</div>
      </div>
    </div>

    <!-- Columna En Preparación -->
    <div class="kanban-column" id="columna-preparacion">
      <h2 class="column-header preparacion">
        🍳 En Preparación <span class="col-count" id="count-preparacion">0</span>
      </h2>
      <div class="tasks-container" id="tasks-preparacion">
        <div class="column-empty">Sin órdenes en preparación</div>
      </div>
    </div>

    <!-- Columna Lista -->
    <div class="kanban-column" id="columna-lista">
      <h2 class="column-header lista">
        🔔 Orden Lista <span class="col-count" id="count-lista">0</span>
      </h2>
      <div class="tasks-container" id="tasks-lista">
        <div class="column-empty">Sin órdenes listas</div>
      </div>
      <div class="comanda-status-bar">
        <div class="pulse-dot"></div>
        <span id="cmd-last-update">Actualizando...</span>
      </div>
    </div>

  </main>

  <!-- Modal de Detalle -->
  <div class="cmd-modal-overlay" id="cmd-modal">
    <div class="cmd-modal-content">
      <button class="cmd-modal-close" id="cmd-modal-close">&times;</button>
      <div id="cmd-modal-body"></div>
    </div>
  </div>
  `}const Dt={_timer:null,_data:[],init(){var e,t;(e=document.getElementById("cmd-modal-close"))==null||e.addEventListener("click",()=>this.closeModal()),(t=document.getElementById("cmd-modal"))==null||t.addEventListener("click",a=>{a.target.id==="cmd-modal"&&this.closeModal()}),this.fetchAndRender(),this._timer=setInterval(()=>this.fetchAndRender(),Mt),window._comandaCleanup=()=>{clearInterval(this._timer),this._timer=null}},async fetchAndRender(){try{const e=await f(`SELECT
           c.com_id, c.ticket_id, c.com_cantidad, c.pr_nombre,
           c.com_ingredientes_omitir, c.com_comentarios,
           c.com_estatus, c.com_fecha,
           v.cliente
         FROM rv_comanda c
         LEFT JOIN (
           SELECT ticket, MAX(cliente) AS cliente
           FROM rv_ventas GROUP BY ticket
         ) v ON v.ticket = c.ticket_id
         WHERE c.com_estatus IN ('pendiente','en_preparacion')
            OR (c.com_estatus = 'lista' AND (c.ready_at IS NULL OR c.ready_at >= datetime('now', 'localtime', '-25 minutes')))
         ORDER BY c.ticket_id ASC, c.com_id ASC`,[]),t=[],a={};e.forEach(o=>{a[o.ticket_id]||(a[o.ticket_id]={ticket_id:o.ticket_id,com_estatus:o.com_estatus,com_fecha:o.com_fecha,cliente:o.cliente||"",items:[]},t.push(a[o.ticket_id]));const i={pendiente:0,en_preparacion:1,lista:2};i[o.com_estatus]<i[a[o.ticket_id].com_estatus]&&(a[o.ticket_id].com_estatus=o.com_estatus),a[o.ticket_id].items.push(o)}),this._data=t,this.renderBoard(t),this.actualizarTimestamp()}catch(e){console.error("[Comanda] Error al cargar:",e)}},renderBoard(e){const t={pendiente:document.getElementById("tasks-pendiente"),en_preparacion:document.getElementById("tasks-preparacion"),lista:document.getElementById("tasks-lista")};if(Object.values(t).forEach(s=>{s&&(s.innerHTML="")}),["pendiente","preparacion","lista"].forEach(s=>{const r=document.getElementById("count-"+s);r&&(r.textContent="0")}),e.length===0){const s='<div class="column-empty">Sin órdenes</div>';Object.values(t).forEach(r=>{r&&(r.innerHTML=s)});return}const a={pendiente:0,en_preparacion:0,lista:0};e.forEach(s=>{const r=this.createTicketHTML(s),c=t[s.com_estatus];c&&(c.insertAdjacentHTML("beforeend",r),a[s.com_estatus]=(a[s.com_estatus]||0)+1)});const o=document.getElementById("count-pendiente"),i=document.getElementById("count-preparacion"),n=document.getElementById("count-lista");o&&(o.textContent=a.pendiente||0),i&&(i.textContent=a.en_preparacion||0),n&&(n.textContent=a.lista||0),Object.entries(t).forEach(([s,r])=>{if(r&&r.childElementCount===0){const c={pendiente:"Sin órdenes pendientes",en_preparacion:"Sin órdenes en preparación",lista:"Sin órdenes listas"};r.innerHTML=`<div class="column-empty">${c[s]||"Sin órdenes"}</div>`}}),this.bindCardButtons()},createTicketHTML(e){const t=e.items.map(n=>`
      <div class="ticket-item-detail">
        <span class="item-qty">(${n.com_cantidad})</span>
        <span class="item-name">${n.pr_nombre}</span>
        ${n.com_ingredientes_omitir?`<small class="item-notes">Sin: ${n.com_ingredientes_omitir}</small>`:""}
        ${n.com_comentarios?`<small class="item-notes">📝 ${n.com_comentarios}</small>`:""}
      </div>
    `).join(""),a=e.com_estatus!=="lista"?`<div class="note-actions"><button class="advance-btn" data-ticket="${e.ticket_id}" data-status="${e.com_estatus}">Avanzar →</button></div>`:"",o=e.cliente?`<p class="client-name">👤 ${e.cliente}</p>`:"",i=e.com_fecha?`<p class="note-time ${this.esUrgente(e.com_fecha)?"urgent":""}">${this.tiempoTranscurrido(e.com_fecha)}</p>`:"";return`
    <div class="order-note-container" data-id="${e.ticket_id}" data-status="${e.com_estatus}">
      <div class="status-badge status-${e.com_estatus}">
        ${e.com_estatus.replace("_"," ")}
      </div>
      <div class="note-header">
        <button class="info-btn" data-ticket="${e.ticket_id}">i</button>
        <h1>Orden #<span>${e.ticket_id}</span></h1>
        ${o}
        ${i}
      </div>
      <div class="note-body">${t}</div>
      ${a}
    </div>`},bindCardButtons(){document.querySelectorAll(".advance-btn").forEach(e=>{e.addEventListener("click",()=>this.handleAdvance(e))}),document.querySelectorAll(".info-btn").forEach(e=>{e.addEventListener("click",()=>{const t=this._data.find(a=>a.ticket_id==e.dataset.ticket);t&&this.showModal(t)})})},async handleAdvance(e){const t=e.dataset.ticket,a=e.dataset.status,o={pendiente:"en_preparacion",en_preparacion:"lista"}[a];if(o){e.disabled=!0,e.textContent="Avanzando...";try{await w("UPDATE rv_comanda SET com_estatus = $1 WHERE ticket_id = $2",[o,t]),o==="lista"&&await w("UPDATE rv_comanda SET ready_at = datetime('now','localtime') WHERE ticket_id = $1",[t]),await this.fetchAndRender()}catch(i){console.error("[Comanda] Error al avanzar:",i),e.disabled=!1,e.textContent="Avanzar →"}}},showModal(e){var o;const t=e.cliente?`<h2>👤 ${e.cliente}</h2>`:"",a=e.items.map(i=>`
      <div class="modal-item">
        <div class="modal-item-header">
          <span class="qty">(${i.com_cantidad})</span>
          <span class="name">${i.pr_nombre}</span>
        </div>
        ${i.com_ingredientes_omitir||i.com_comentarios?`
        <div class="modal-item-details">
          ${i.com_ingredientes_omitir?`<p><span class="label">Sin:</span> ${i.com_ingredientes_omitir}</p>`:""}
          ${i.com_comentarios?`<p><span class="label">Nota:</span> ${i.com_comentarios}</p>`:""}
        </div>`:""}
      </div>
    `).join("");document.getElementById("cmd-modal-body").innerHTML=`
      <h1>Orden #${e.ticket_id}</h1>
      ${t}
      ${a}
    `,(o=document.getElementById("cmd-modal"))==null||o.classList.add("active")},closeModal(){var e;(e=document.getElementById("cmd-modal"))==null||e.classList.remove("active")},tiempoTranscurrido(e){if(!e)return"";const t=Math.floor((Date.now()-new Date(e).getTime())/1e3);return t<60?`Hace ${t}s`:t<3600?`Hace ${Math.floor(t/60)}min`:`Hace ${Math.floor(t/3600)}h`},esUrgente(e){return e?(Date.now()-new Date(e).getTime())/1e3>600:!1},actualizarTimestamp(){const e=document.getElementById("cmd-last-update");if(e){const t=new Date;e.textContent=`Actualizado: ${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}:${t.getSeconds().toString().padStart(2,"0")}`}}},je=window.navigateTo;je&&(window.navigateTo=async e=>(typeof window._comandaCleanup=="function"&&(window._comandaCleanup(),window._comandaCleanup=null),je(e)));async function Ft(e){Pt("reportes-css","/assets/css/reportes.css"),Oe("https://cdn.jsdelivr.net/npm/chart.js"),Oe("https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"),z(e,"reportes",zt()),await Ht.init()}function Pt(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function Oe(e){if(document.querySelector(`script[src="${e}"]`))return;const t=document.createElement("script");t.src=e,t.defer=!0,document.head.appendChild(t)}const N=e=>`$${parseFloat(e||0).toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2})}`,ne=e=>e?new Date(e).toLocaleDateString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—",Ce=()=>{const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`},Ut=()=>Ce().slice(0,8)+"01";function A(e,t,a=!0){const o=document.getElementById(e);if(!o)return;const i=900,n=performance.now();function s(r){const c=Math.min((r-n)/i,1),l=1-Math.pow(1-c,4),v=parseFloat(t)*l;o.textContent=a?`$${v.toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2})}`:Math.round(v).toLocaleString("es-MX"),c<1&&requestAnimationFrame(s)}requestAnimationFrame(s)}function Q(e,{cols:t,rows:a,perPage:o=15}){var l,v,d;const i=document.getElementById(e);if(!i)return;let n="",s=1;function r(){return n?a.filter(p=>t.some(u=>String(u.searchVal?u.searchVal(p):p[u.key]??"").toLowerCase().includes(n))):a}function c(){const p=r(),u=Math.max(1,Math.ceil(p.length/o));s>u&&(s=u);const m=(s-1)*o,h=p.slice(m,m+o),g=i.querySelector(".rdt-count"),b=i.querySelector(".rdt-page-info"),E=i.querySelector('[data-action="prev"]'),T=i.querySelector('[data-action="next"]'),y=i.querySelector("tbody"),M=i.querySelector(".rdt-pagination");g&&(g.textContent=`${p.length} registro${p.length!==1?"s":""}`),b&&(b.textContent=`Pág ${s} / ${u}`),E&&(E.disabled=s===1),T&&(T.disabled=s>=u),M&&(M.style.display=u>1?"flex":"none"),y&&(y.innerHTML=h.length?h.map(H=>`<tr>${t.map(X=>`<td>${X.render?X.render(H[X.key],H):H[X.key]??"—"}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${t.length}" class="rep-empty">Sin resultados</td></tr>`)}i.innerHTML=`
    <div class="rdt-toolbar">
      <input type="text" class="rdt-search" placeholder="🔍 Buscar...">
      <span class="rdt-count"></span>
    </div>
    <div class="rep-table-wrap">
      <table class="rep-table">
        <thead><tr>${t.map(p=>`<th>${p.label}</th>`).join("")}</tr></thead>
        <tbody></tbody>
      </table>
    </div>
    <div class="rdt-pagination">
      <button class="rdt-page-btn" data-action="prev">← Ant</button>
      <span class="rdt-page-info"></span>
      <button class="rdt-page-btn" data-action="next">Sig →</button>
    </div>`,(l=i.querySelector(".rdt-search"))==null||l.addEventListener("input",p=>{n=p.target.value.toLowerCase(),s=1,c()}),(v=i.querySelector('[data-action="prev"]'))==null||v.addEventListener("click",()=>{s--,c()}),(d=i.querySelector('[data-action="next"]'))==null||d.addEventListener("click",()=>{s++,c()}),c()}function zt(){const e=Ce(),t=Ut();return`
<div class="rep-container">

  <!-- Header -->
  <div class="rep-header">
    <div>
      <h1 class="rep-title">📊 Reportes</h1>
      <p class="rep-subtitle">Análisis y visualización de datos del negocio</p>
    </div>
  </div>

  <!-- KPIs del día -->
  <div class="rep-kpis" id="kpis-row">
    <div class="stats-card success"><div class="stats-icon"><i class="fas fa-dollar-sign"></i></div><p class="stats-value" id="kpi-ventas">$0.00</p><h6 class="stats-label">VENTAS HOY</h6></div>
    <div class="stats-card info">   <div class="stats-icon"><i class="fas fa-receipt"></i></div>   <p class="stats-value" id="kpi-tickets">0</p>     <h6 class="stats-label">TICKETS HOY</h6></div>
    <div class="stats-card warning"><div class="stats-icon"><i class="fas fa-utensils"></i></div>  <p class="stats-value" id="kpi-productos">0</p>   <h6 class="stats-label">PRODUCTOS VENDIDOS</h6></div>
    <div class="stats-card danger"> <div class="stats-icon"><i class="fas fa-chart-line"></i></div><p class="stats-value" id="kpi-promedio">$0.00</p><h6 class="stats-label">PROMEDIO TICKET</h6></div>
  </div>

  <!-- Tabs -->
  <div class="rep-tabs-wrap">
    <div class="rep-tabs" id="rep-tabs">
      <button class="rep-tab active" data-tab="grafica">📊 Gráfica</button>
      <button class="rep-tab" data-tab="vendidos">🏆 Más Vendidos</button>
      <button class="rep-tab" data-tab="ventas">🛒 Ventas</button>
      <button class="rep-tab" data-tab="cierre">💵 Cierre de Caja</button>
      <button class="rep-tab" data-tab="utilidades">💰 Utilidades</button>
      <button class="rep-tab" data-tab="gastos">💸 Gastos</button>
      <button class="rep-tab" data-tab="devoluciones">↩️ Devoluciones</button>
    </div>
  </div>

  <!-- Tab: Gráfica -->
  <div class="rep-panel active" id="tab-grafica">
    <div class="rep-filtros">
      <div class="rep-filtro-group">
        <label>Fecha inicio</label>
        <input type="date" id="g-fecha-inicio" class="rep-input" value="${t}">
      </div>
      <div class="rep-filtro-group">
        <label>Fecha fin</label>
        <input type="date" id="g-fecha-fin" class="rep-input" value="${e}">
      </div>
      <button class="rep-btn rep-btn-primary" id="btn-generar-grafica">
        <i class="fas fa-chart-line"></i> Generar
      </button>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">
        <span>Ventas por Fecha</span>
        <strong id="g-total-texto" style="color:#28a745;"></strong>
      </div>
      <div style="position:relative; height:320px;">
        <canvas id="ventasChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Tab: Más Vendidos -->
  <div class="rep-panel" id="tab-vendidos">
    <div class="rep-card">
      <div class="rep-card-header">Ranking de Productos Más Vendidos</div>
      <div class="rep-table-wrap" id="tabla-vendidos">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- Tab: Ventas -->
  <div class="rep-panel" id="tab-ventas">
    <div class="rep-filtros" style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; justify-content: space-between;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="v-fecha-inicio" class="rep-input" value="${t}"></div>
          <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="v-fecha-fin"    class="rep-input" value="${e}"></div>
          <div class="rep-filtro-pagos">
            <button class="rep-btn-pago active" data-pago="todas">Todas</button>
            <button class="rep-btn-pago" data-pago="efectivo">Efectivo</button>
            <button class="rep-btn-pago" data-pago="tarjeta">Tarjeta</button>
            <button class="rep-btn-pago" data-pago="transferencia">Transf.</button>
          </div>
      </div>
      <button class="rep-btn" id="btn-exportar-excel" style="background: #107c41; color: white; margin-bottom: 4px;">
        <i class="fas fa-file-excel"></i> Exportar Excel
      </button>
    </div>
    <!-- Mini KPIs Ventas -->
  <div class="rep-mini-kpis" id="ventas-mini-kpis">
    <div class="mini-kpi-card info">
      <div class="mini-kpi-icon"><i class="fas fa-calculator"></i></div>
      <div class="mini-kpi-body">
        <p class="mini-kpi-value" id="mv-total">$0.00</p>
        <span class="mini-kpi-label">Total Filtrado</span>
      </div>
    </div>
    <div class="mini-kpi-card success">
      <div class="mini-kpi-icon"><i class="fas fa-receipt"></i></div>
      <div class="mini-kpi-body">
        <p class="mini-kpi-value" id="mv-tickets">0</p>
        <span class="mini-kpi-label">Tickets</span>
      </div>
    </div>
    <div class="mini-kpi-card warning">
      <div class="mini-kpi-icon"><i class="fas fa-chart-bar"></i></div>
      <div class="mini-kpi-body">
        <p class="mini-kpi-value" id="mv-promedio">$0.00</p>
        <span class="mini-kpi-label">Ticket Promedio</span>
      </div>
    </div>
  </div>
  <div class="rep-card">
      <div class="rep-card-header">
        <span>Detalle de Ventas</span>
      </div>
      <div id="tabla-ventas">
        <p class="rep-loading">Selecciona fechas y genera el reporte.</p>
      </div>
    </div>
  </div>

  <!-- Tab: Cierre de Caja -->
  <div class="rep-panel" id="tab-cierre">
    <div class="rep-filtros">
      <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="c-fecha-inicio" class="rep-input" value="${t}"></div>
      <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="c-fecha-fin"    class="rep-input" value="${e}"></div>
      <button class="rep-btn rep-btn-primary" id="btn-filtrar-cierre">
        <i class="fas fa-filter"></i> Filtrar
      </button>
    </div>
    <!-- Mini KPIs cierre -->
    <div class="rep-kpis" style="margin-bottom:16px;">
      <div class="stats-card success"><div class="stats-icon"><i class="fas fa-money-bill-wave"></i></div><p class="stats-value" id="c-efectivo">$0.00</p><h6 class="stats-label">EFECTIVO</h6></div>
      <div class="stats-card info">   <div class="stats-icon"><i class="fas fa-credit-card"></i></div>  <p class="stats-value" id="c-tarjeta">$0.00</p><h6 class="stats-label">TARJETA</h6></div>
      <div class="stats-card warning"><div class="stats-icon"><i class="fas fa-mobile-alt"></i></div>   <p class="stats-value" id="c-transf">$0.00</p> <h6 class="stats-label">TRANSFERENCIA</h6></div>
      <div class="stats-card danger"> <div class="stats-icon"><i class="fas fa-coins"></i></div>       <p class="stats-value" id="c-total">$0.00</p>  <h6 class="stats-label">TOTAL CAJA</h6></div>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">Detalle de Cierres de Caja</div>
      <div class="rep-table-wrap" id="tabla-cierre">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- Tab: Utilidades -->
  <div class="rep-panel" id="tab-utilidades">
    <div class="rep-filtros">
      <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="u-fecha-inicio" class="rep-input" value="${t}"></div>
      <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="u-fecha-fin"    class="rep-input" value="${e}"></div>
      <button class="rep-btn rep-btn-primary" id="btn-filtrar-utilidades">
        <i class="fas fa-filter"></i> Filtrar
      </button>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">
        <span>Utilidad por Producto</span>
        <span>Total: <strong id="u-total" style="color:#28a745;">$0.00</strong></span>
      </div>
      <div class="rep-table-wrap" id="tabla-utilidades">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- Tab: Gastos -->
  <div class="rep-panel" id="tab-gastos">
    <div class="rep-filtros">
      <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="ga-fecha-inicio" class="rep-input" value="${t}"></div>
      <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="ga-fecha-fin"    class="rep-input" value="${e}"></div>
      <div class="rep-filtro-group">
        <label>Tipo</label>
        <select id="ga-tipo" class="rep-input" style="min-width:120px;">
          <option value="todos">Todos</option>
          <option value="operativo">Operativo</option>
          <option value="insumo">Insumo</option>
        </select>
      </div>
      <button class="rep-btn rep-btn-primary" id="btn-filtrar-gastos">
        <i class="fas fa-filter"></i> Filtrar
      </button>
      <button class="rep-btn" id="btn-exportar-excel-gastos" style="background:#107c41;color:white;">
        <i class="fas fa-file-excel"></i> Exportar Excel
      </button>
    </div>
    <!-- Mini KPIs gastos -->
    <div class="rep-kpis" style="margin-bottom:16px;">
      <div class="stats-card success"><div class="stats-icon"><i class="fas fa-money-bill-wave"></i></div><p class="stats-value" id="ga-efectivo">$0.00</p><h6 class="stats-label">EFECTIVO</h6></div>
      <div class="stats-card info">   <div class="stats-icon"><i class="fas fa-credit-card"></i></div>  <p class="stats-value" id="ga-tarjeta">$0.00</p> <h6 class="stats-label">TARJETA</h6></div>
      <div class="stats-card warning"><div class="stats-icon"><i class="fas fa-mobile-alt"></i></div>   <p class="stats-value" id="ga-transf">$0.00</p>  <h6 class="stats-label">TRANSFERENCIA</h6></div>
      <div class="stats-card danger"> <div class="stats-icon"><i class="fas fa-coins"></i></div>       <p class="stats-value" id="ga-total">$0.00</p>  <h6 class="stats-label">TOTAL GASTOS</h6></div>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">
        <span>Detalle de Gastos</span>
        <span id="ga-count" style="color:#6c757d;font-size:.85rem;"></span>
      </div>
      <div class="rep-table-wrap" id="tabla-gastos">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

  <!-- Tab: Devoluciones -->
  <div class="rep-panel" id="tab-devoluciones">
    <div class="rep-filtros">
      <div class="rep-filtro-group"><label>Fecha inicio</label><input type="date" id="d-fecha-inicio" class="rep-input" value="${t}"></div>
      <div class="rep-filtro-group"><label>Fecha fin</label>   <input type="date" id="d-fecha-fin"    class="rep-input" value="${e}"></div>
      <button class="rep-btn rep-btn-primary" id="btn-filtrar-devoluciones">
        <i class="fas fa-filter"></i> Filtrar
      </button>
      <button class="rep-btn" id="btn-exportar-excel-devoluciones" style="background:#107c41;color:white;">
        <i class="fas fa-file-excel"></i> Exportar Excel
      </button>
    </div>
    <!-- Mini KPI devoluciones -->
    <div class="rep-kpis" style="margin-bottom:16px;">
      <div class="stats-card danger"><div class="stats-icon"><i class="fas fa-undo-alt"></i></div><p class="stats-value" id="d-count">0</p><h6 class="stats-label">DEVOLUCIONES</h6></div>
      <div class="stats-card warning"><div class="stats-icon"><i class="fas fa-dollar-sign"></i></div><p class="stats-value" id="d-monto">$0.00</p><h6 class="stats-label">MONTO DEVUELTO</h6></div>
    </div>
    <div class="rep-card">
      <div class="rep-card-header">Detalle de Devoluciones</div>
      <div class="rep-table-wrap" id="tabla-devoluciones">
        <p class="rep-loading">Cargando...</p>
      </div>
    </div>
  </div>

</div>`}const Ht={_chart:null,async init(){this.bindTabs(),this.bindEvents(),await this.cargarKPIs(),await this.cargarGrafica()},bindTabs(){document.querySelectorAll(".rep-tab").forEach(e=>{e.addEventListener("click",async()=>{document.querySelectorAll(".rep-tab").forEach(a=>a.classList.remove("active")),document.querySelectorAll(".rep-panel").forEach(a=>a.classList.remove("active")),e.classList.add("active");const t=document.getElementById("tab-"+e.dataset.tab);switch(t&&t.classList.add("active"),e.dataset.tab){case"grafica":await this.cargarGrafica();break;case"vendidos":await this.cargarMasVendidos();break;case"ventas":await this.cargarVentas();break;case"cierre":await this.cargarCierre();break;case"utilidades":await this.cargarUtilidades();break;case"gastos":await this.cargarGastos();break;case"devoluciones":await this.cargarDevoluciones();break}})})},bindEvents(){var e,t,a,o,i,n,s,r,c,l;(e=document.getElementById("btn-generar-grafica"))==null||e.addEventListener("click",()=>this.cargarGrafica()),(t=document.getElementById("btn-filtrar-cierre"))==null||t.addEventListener("click",()=>this.cargarCierre()),(a=document.getElementById("btn-filtrar-utilidades"))==null||a.addEventListener("click",()=>this.cargarUtilidades()),(o=document.getElementById("btn-filtrar-gastos"))==null||o.addEventListener("click",()=>this.cargarGastos()),(i=document.getElementById("btn-filtrar-devoluciones"))==null||i.addEventListener("click",()=>this.cargarDevoluciones()),(n=document.getElementById("v-fecha-inicio"))==null||n.addEventListener("change",()=>this.cargarVentas()),(s=document.getElementById("v-fecha-fin"))==null||s.addEventListener("change",()=>this.cargarVentas()),document.querySelectorAll(".rep-btn-pago").forEach(v=>{v.addEventListener("click",()=>{document.querySelectorAll(".rep-btn-pago").forEach(d=>d.classList.remove("active")),v.classList.add("active"),this.cargarVentas()})}),(r=document.getElementById("btn-exportar-excel"))==null||r.addEventListener("click",()=>this.exportarExcelVentas()),(c=document.getElementById("btn-exportar-excel-gastos"))==null||c.addEventListener("click",()=>this.exportarExcelGastos()),(l=document.getElementById("btn-exportar-excel-devoluciones"))==null||l.addEventListener("click",()=>this.exportarExcelDevoluciones())},async cargarKPIs(){const e=Ce(),a=(await f(`SELECT
         IFNULL(SUM(sub.total_ticket - sub.costo_envio), 0) AS ventas,
         COUNT(*)                          AS tickets,
         SUM(sub.productos)                AS productos
       FROM (
         SELECT ticket, MAX(total_ticket) AS total_ticket, COALESCE(MAX(costo_envio), 0) AS costo_envio, SUM(cantidad) AS productos
         FROM rv_ventas
         WHERE DATE(fecha)=$1 AND estatus='completado'
         GROUP BY ticket
       ) sub`,[e]))[0]||{},o=a.tickets>0?parseFloat(a.ventas)/a.tickets:0;A("kpi-ventas",parseFloat(a.ventas||0),!0),A("kpi-tickets",parseInt(a.tickets||0),!1),A("kpi-productos",parseInt(a.productos||0),!1),A("kpi-promedio",o,!0)},async cargarGrafica(){const e=I("g-fecha-inicio"),t=I("g-fecha-fin");if(!e||!t)return;const a=await f(`SELECT dia, SUM(neto) AS total
       FROM (
         SELECT DATE(fecha) AS dia, (MAX(total_ticket) - COALESCE(MAX(costo_envio), 0)) AS neto
         FROM rv_ventas
         WHERE DATE(fecha) BETWEEN $1 AND $2
           AND estatus='completado'
         GROUP BY ticket
       )
       GROUP BY dia
       ORDER BY dia`,[e,t]),o=a.map(r=>r.dia),i=a.map(r=>parseFloat(r.total||0)),n=i.reduce((r,c)=>r+c,0);ye("g-total-texto",`Total: ${N(n)}`),await Vt();const s=document.getElementById("ventasChart");s&&(this._chart&&(this._chart.destroy(),this._chart=null),this._chart=new Chart(s,{type:"line",data:{labels:o,datasets:[{label:"Ventas ($)",data:i,borderColor:"#4a90e2",backgroundColor:"rgba(74,144,226,.15)",borderWidth:2,pointBackgroundColor:"#4a90e2",tension:.35,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:r=>N(r.raw)}}},scales:{y:{ticks:{callback:r=>N(r)},beginAtZero:!0},x:{ticks:{maxRotation:45}}}}}))},async cargarMasVendidos(){const e=document.getElementById("tabla-vendidos");if(!e)return;e.innerHTML='<p class="rep-loading">Cargando...</p>';const t=await f(`SELECT
         v.producto,
         c.nombre AS categoria,
         SUM(v.cantidad)      AS unidades,
         SUM(v.total)         AS total
       FROM rv_ventas v
       LEFT JOIN rv_productos p ON p.ID = v.id_producto
       LEFT JOIN rv_categorias c ON c.id = p.categoria_id
       WHERE v.estatus='completado'
       GROUP BY v.producto
       ORDER BY unidades DESC
       LIMIT 20`,[]);if(!t.length){e.innerHTML='<p class="rep-empty">Sin datos de ventas.</p>';return}const a=t.map((o,i)=>({...o,_rank:i+1}));Q("tabla-vendidos",{cols:[{label:"#",key:"_rank",render:o=>`<span class="rep-rank">${o}</span>`},{label:"Producto",key:"producto",render:o=>`<strong>${o}</strong>`},{label:"Categoría",key:"categoria",render:o=>`<span class="rep-badge-cat">${o||"—"}</span>`},{label:"Unidades",key:"unidades",render:o=>`<span style="text-align:center;font-weight:700;display:block;">${o}</span>`},{label:"Total Vendido",key:"total",render:o=>`<strong style="color:#28a745;">${N(o)}</strong>`}],rows:a,perPage:20})},async cargarVentas(){var u;const e=I("v-fecha-inicio"),t=I("v-fecha-fin"),a=((u=document.querySelector(".rep-btn-pago.active"))==null?void 0:u.dataset.pago)||"todas";if(!e||!t)return;const o=document.getElementById("tabla-ventas");o&&(o.innerHTML='<p class="rep-loading">Cargando...</p>');let i=`
      SELECT ticket, fecha, vendedor, metodo_pago,
             GROUP_CONCAT(cantidad||'x '||producto, ' | ') AS articulos,
             SUM(cantidad) AS total_prod,
             MAX(total_ticket) AS total_ticket,
             COALESCE(MAX(costo_envio), 0) AS costo_envio,
             MAX(tipo_orden) AS tipo_orden
      FROM rv_ventas
      WHERE DATE(fecha) BETWEEN $1 AND $2
        AND estatus='completado'`;const n=[e,t];a!=="todas"&&(i+=" AND metodo_pago=$3",n.push(a)),i+=" GROUP BY ticket ORDER BY fecha DESC";const r=(await f(i,n)).map(m=>({...m,total_neto:parseFloat(m.total_ticket||0)-parseFloat(m.costo_envio||0)})),c=r.reduce((m,h)=>m+h.total_neto,0),l=r.length>0?c/r.length:0;if(A("mv-total",c,!0),A("mv-tickets",r.length,!1),A("mv-promedio",l,!0),!r.length){o&&(o.innerHTML='<p class="rep-empty">Sin ventas en el período.</p>');return}const v=m=>{const h={efectivo:["badge-ef",'<i class="fas fa-money-bill-wave"></i> Efectivo'],tarjeta:["badge-tj",'<i class="fas fa-credit-card"></i> Tarjeta'],transferencia:["badge-tr",'<i class="fas fa-mobile-alt"></i> Transf.'],mixto:["badge-mix",'<i class="fas fa-layer-group"></i> Mixto']},[g,b]=h[m]||["",m||"—"];return`<span class="rep-badge-pago ${g}">${b}</span>`},d=m=>{const h={llevar:["badge-llevar","Llevar"],comer_aqui:["badge-aqui","Aquí"],domicilio:["badge-domicilio","Domicilio"]},[g,b]=h[m]||["",m||"—"];return`<span class="rep-badge-tipo ${g}">${b}</span>`};Q("tabla-ventas",{cols:[{label:"Ticket",key:"ticket",render:m=>`<span style="color:#6c757d;">#${m}</span>`},{label:"Fecha",key:"fecha",render:m=>`<span style="white-space:nowrap;">${ne(m)}</span>`},{label:"Artículos",key:"articulos",render:m=>`<span style="font-size:.82rem;color:#555;">${(m||"").replace(/\|/g,"<br>")}</span>`,searchVal:m=>m.articulos||""},{label:"Tipo",key:"tipo_orden",render:m=>d(m)},{label:"Pago",key:"metodo_pago",render:m=>v(m)},{label:"Total",key:"total_neto",render:m=>`<strong style="color:#28a745;">${N(m)}</strong>`},{label:"",key:"ticket",render:m=>`<button class="rep-btn-reimprimir" data-ticket="${m}" title="Reimprimir"><i class="fas fa-print"></i></button>`}],rows:r,perPage:15});const p=document.getElementById("tabla-ventas");p==null||p.addEventListener("click",async m=>{const h=m.target.closest(".rep-btn-reimprimir");h&&await Xt(h.dataset.ticket)})},async exportarExcelVentas(){var r,c,l;if(!window.XLSX){alert("La librería de Excel aún se está cargando, inténtalo de nuevo en unos segundos.");return}const e=I("v-fecha-inicio"),t=I("v-fecha-fin"),a=((r=document.querySelector(".rep-btn-pago.active"))==null?void 0:r.dataset.pago)||"todas";let o=`
          SELECT ticket, fecha, metodo_pago,
                 GROUP_CONCAT(cantidad||'x '||producto, ' | ') AS articulos,
                 MAX(total_ticket) AS total_ticket,
                 COALESCE(MAX(costo_envio), 0) AS costo_envio
          FROM rv_ventas
          WHERE DATE(fecha) BETWEEN $1 AND $2
            AND estatus='completado'`;const i=[e,t];a!=="todas"&&(o+=" AND metodo_pago=$3",i.push(a)),o+=" GROUP BY ticket ORDER BY fecha DESC";const n=await f(o,i);if(!n.length){alert("No hay ventas en este rango de fechas para exportar.");return}const s=n.map(v=>({"Ticket #":v.ticket,Fecha:v.fecha,"Forma de Pago":v.metodo_pago?v.metodo_pago.toUpperCase():"ND","Artículos Vendidos":v.articulos,"Total Venta ($)":parseFloat(v.total_ticket||0)-parseFloat(v.costo_envio||0)}));try{const{save:v}=((c=window.__TAURI__)==null?void 0:c.dialog)||await B(()=>import("./index-Dtoj3I27.js"),[]),{writeFile:d}=((l=window.__TAURI__)==null?void 0:l.fs)||await B(()=>import("./index-BXM9CQY7.js"),[]),p=window.XLSX.utils.json_to_sheet(s),u=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(u,p,"Ventas");const m=window.XLSX.write(u,{bookType:"xlsx",type:"array"});let h="Ventas.xlsx";e&&t&&e===t?h=`Reporte_Ventas_${e}.xlsx`:e&&t&&(h=`Reporte_Ventas_${e}_al_${t}.xlsx`);const g=await v({defaultPath:h,filters:[{name:"Excel Workbook",extensions:["xlsx"]}]});g&&(await d(g,new Uint8Array(m)),window.CajaApp&&window.CajaApp.showAlert?window.CajaApp.showAlert("Excel Exportado","El archivo se ha guardado correctamente.","success"):alert(`Excel exportado correctamente a:
`+g))}catch(v){console.error("Error guardando Excel:",v);const d=typeof v=="object"?v.message||JSON.stringify(v):String(v);alert(`Error al intentar exportar el Excel:
`+d)}},async exportarExcelGastos(){var r,c,l,v;if(!window.XLSX){alert("La librería de Excel aún se está cargando, inténtalo de nuevo.");return}const e=I("ga-fecha-inicio"),t=I("ga-fecha-fin"),a=I("ga-tipo");let o=`
      SELECT g.id, g.fecha, g.tipo_gasto, g.descripcion, g.comentario,
             g.precio_unitario, g.metodo_pago, g.tipo, u.usu_nom AS usuario
      FROM rv_gastos g
      LEFT JOIN tm_usuario u ON u.usu_id = g.usu_id
      WHERE DATE(g.fecha) BETWEEN $1 AND $2`;const i=[e,t];a&&a!=="todos"&&(o+=" AND g.tipo=$3",i.push(a)),o+=" ORDER BY g.fecha DESC";const n=await f(o,i);if(!n.length){alert("No hay gastos en este rango de fechas para exportar.");return}const s=n.map(d=>({ID:d.id,Fecha:d.fecha,"Tipo Gasto":d.tipo_gasto||"—",Descripción:d.descripcion||"—",Comentario:d.comentario||"—","Monto ($)":parseFloat(d.precio_unitario||0),Tipo:d.tipo||"—","Método Pago":d.metodo_pago?d.metodo_pago.toUpperCase():"—",Usuario:d.usuario||"—"}));try{const{save:d}=((r=window.__TAURI__)==null?void 0:r.dialog)||await B(()=>import("./index-Dtoj3I27.js"),[]),{writeFile:p}=((c=window.__TAURI__)==null?void 0:c.fs)||await B(()=>import("./index-BXM9CQY7.js"),[]),u=window.XLSX.utils.json_to_sheet(s),m=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(m,u,"Gastos");const h=window.XLSX.write(m,{bookType:"xlsx",type:"array"}),g=e&&t&&e!==t?`Reporte_Gastos_${e}_al_${t}.xlsx`:`Reporte_Gastos_${e||"todos"}.xlsx`,b=await d({defaultPath:g,filters:[{name:"Excel Workbook",extensions:["xlsx"]}]});b&&(await p(b,new Uint8Array(h)),(v=(l=window.CajaApp)==null?void 0:l.showAlert)!=null&&v.call(l,"Excel Exportado","Gastos guardados correctamente.","success")||alert(`Excel exportado:
`+b))}catch(d){alert(`Error al exportar:
`+(d.message||d))}},async exportarExcelDevoluciones(){var i,n,s,r;if(!window.XLSX){alert("La librería de Excel aún se está cargando, inténtalo de nuevo.");return}const e=I("d-fecha-inicio"),t=I("d-fecha-fin"),a=await f(`SELECT d.dev_id, d.ticket_id, d.motivo, d.fecha_devolucion,
              u.usu_nom AS usuario,
              MAX(v.total_ticket) AS total_ticket,
              COALESCE(MAX(v.costo_envio), 0) AS costo_envio,
              GROUP_CONCAT(v.cantidad||'x '||v.producto, ' | ') AS articulos
       FROM rv_devoluciones d
       LEFT JOIN tm_usuario u ON u.usu_id = d.usu_id
       LEFT JOIN rv_ventas v ON v.ticket = d.ticket_id
       WHERE DATE(d.fecha_devolucion) BETWEEN $1 AND $2
       GROUP BY d.dev_id
       ORDER BY d.fecha_devolucion DESC`,[e,t]);if(!a.length){alert("No hay devoluciones en este rango de fechas para exportar.");return}const o=a.map(c=>({"# Devolución":c.dev_id,"# Ticket":c.ticket_id,Fecha:c.fecha_devolucion,Artículos:(c.articulos||"—").replace(/\|/g," / "),Motivo:c.motivo||"—",Usuario:c.usuario||"—","Monto Ticket ($)":parseFloat(c.total_ticket||0)-parseFloat(c.costo_envio||0)}));try{const{save:c}=((i=window.__TAURI__)==null?void 0:i.dialog)||await B(()=>import("./index-Dtoj3I27.js"),[]),{writeFile:l}=((n=window.__TAURI__)==null?void 0:n.fs)||await B(()=>import("./index-BXM9CQY7.js"),[]),v=window.XLSX.utils.json_to_sheet(o),d=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(d,v,"Devoluciones");const p=window.XLSX.write(d,{bookType:"xlsx",type:"array"}),u=e&&t&&e!==t?`Reporte_Devoluciones_${e}_al_${t}.xlsx`:`Reporte_Devoluciones_${e||"todos"}.xlsx`,m=await c({defaultPath:u,filters:[{name:"Excel Workbook",extensions:["xlsx"]}]});m&&(await l(m,new Uint8Array(p)),(r=(s=window.CajaApp)==null?void 0:s.showAlert)!=null&&r.call(s,"Excel Exportado","Devoluciones guardadas correctamente.","success")||alert(`Excel exportado:
`+m))}catch(c){alert(`Error al exportar:
`+(c.message||c))}},async cargarCierre(){const e=I("c-fecha-inicio"),t=I("c-fecha-fin"),a=document.getElementById("tabla-cierre");if(!a)return;a.innerHTML='<p class="rep-loading">Cargando...</p>';const o=await f(`SELECT a.id, a.fecha_apertura, a.monto_apertura, a.estatus,
              cc.fecha_cierre, cc.monto_cierre,
              IFNULL((SELECT SUM(total) FROM rv_ventas WHERE metodo_pago='efectivo'
                        AND DATE(fecha) BETWEEN DATE(a.fecha_apertura) AND IFNULL(DATE(cc.fecha_cierre), DATE('now'))),0) AS ef,
              IFNULL((SELECT SUM(total) FROM rv_ventas WHERE metodo_pago='tarjeta'
                        AND DATE(fecha) BETWEEN DATE(a.fecha_apertura) AND IFNULL(DATE(cc.fecha_cierre), DATE('now'))),0) AS tj,
              IFNULL((SELECT SUM(total) FROM rv_ventas WHERE metodo_pago='transferencia'
                        AND DATE(fecha) BETWEEN DATE(a.fecha_apertura) AND IFNULL(DATE(cc.fecha_cierre), DATE('now'))),0) AS tr
       FROM rv_apertura_caja a
       LEFT JOIN rv_cierre_caja cc ON cc.apertura_id = a.id
       WHERE DATE(a.fecha_apertura) BETWEEN $1 AND $2
       ORDER BY a.id DESC`,[e,t]),i=o.reduce((c,l)=>c+parseFloat(l.ef||0),0),n=o.reduce((c,l)=>c+parseFloat(l.tj||0),0),s=o.reduce((c,l)=>c+parseFloat(l.tr||0),0);if(A("c-efectivo",i,!0),A("c-tarjeta",n,!0),A("c-transf",s,!0),A("c-total",i+n+s,!0),ye("totalCierresEncontrados",o.length),!o.length){a.innerHTML='<p class="rep-empty">Sin cierres en el período.</p>';return}const r=o.map(c=>({...c,_tot:parseFloat(c.ef||0)+parseFloat(c.tj||0)+parseFloat(c.tr||0)}));Q("tabla-cierre",{cols:[{label:"#",key:"id",render:c=>`#${c}`},{label:"Apertura",key:"fecha_apertura",render:c=>`<span style="white-space:nowrap;">${ne(c)}</span>`},{label:"Cierre",key:"fecha_cierre",render:c=>c?`<span style="white-space:nowrap;">${ne(c)}</span>`:"—"},{label:"Efectivo",key:"ef",render:c=>`<span style="color:#28a745;font-weight:600;">${N(c)}</span>`},{label:"Tarjeta",key:"tj",render:c=>`<span style="color:#007aff;font-weight:600;">${N(c)}</span>`},{label:"Transf.",key:"tr",render:c=>`<span style="color:#ff9800;font-weight:600;">${N(c)}</span>`},{label:"Total",key:"_tot",render:c=>`<strong>${N(c)}</strong>`},{label:"Estatus",key:"estatus",render:c=>c==="activa"?'<span class="rep-badge-activa">🟢 Activa</span>':'<span class="rep-badge-cerrada">✓ Cerrada</span>'}],rows:r,perPage:15})},async cargarGastos(){const e=I("ga-fecha-inicio"),t=I("ga-fecha-fin"),a=I("ga-tipo")||"todos",o=document.getElementById("tabla-gastos");if(!o||!e||!t)return;o.innerHTML='<p class="rep-loading">Cargando...</p>';let i=`
      SELECT g.id, g.fecha, g.tipo_gasto, g.descripcion, g.comentario,
             g.precio_unitario, g.tipo, g.metodo_pago,
             u.usu_nom AS usuario
      FROM rv_gastos g
      LEFT JOIN tm_usuario u ON u.usu_id = g.usu_id
      WHERE DATE(g.fecha) BETWEEN $1 AND $2`;const n=[e,t];a!=="todos"&&(i+=" AND g.tipo = $3",n.push(a)),i+=" ORDER BY g.fecha DESC";const s=await f(i,n),r=s.filter(u=>u.metodo_pago==="efectivo").reduce((u,m)=>u+parseFloat(m.precio_unitario||0),0),c=s.filter(u=>u.metodo_pago==="tarjeta").reduce((u,m)=>u+parseFloat(m.precio_unitario||0),0),l=s.filter(u=>u.metodo_pago==="transferencia").reduce((u,m)=>u+parseFloat(m.precio_unitario||0),0),v=s.reduce((u,m)=>u+parseFloat(m.precio_unitario||0),0);if(A("ga-efectivo",r,!0),A("ga-tarjeta",c,!0),A("ga-transf",l,!0),A("ga-total",v,!0),ye("ga-count",`${s.length} registro${s.length!==1?"s":""}`),!s.length){o.innerHTML='<p class="rep-empty">Sin gastos en el período.</p>';return}const d=u=>`<span class="rep-badge-tipo ${u==="operativo"?"badge-llevar":"badge-aqui"}">${u||"—"}</span>`,p=u=>{const m={efectivo:["badge-ef",'<i class="fas fa-money-bill-wave"></i> Efectivo'],tarjeta:["badge-tj",'<i class="fas fa-credit-card"></i> Tarjeta'],transferencia:["badge-tr",'<i class="fas fa-mobile-alt"></i> Transf.']},[h,g]=m[u]||["",u||"—"];return`<span class="rep-badge-pago ${h}">${g}</span>`};Q("tabla-gastos",{cols:[{label:"#",key:"id",render:u=>`<span style="color:#6c757d;">#${u}</span>`},{label:"Fecha",key:"fecha",render:u=>`<span style="white-space:nowrap;">${ne(u)}</span>`},{label:"Tipo Gasto",key:"tipo_gasto",render:u=>`<strong>${u||"—"}</strong>`},{label:"Descripción",key:"descripcion",render:u=>`<span style="font-size:.84rem;">${u||"—"}</span>`},{label:"Comentario",key:"comentario",render:u=>`<span style="font-size:.84rem;color:#6c757d;">${u||"—"}</span>`},{label:"Tipo",key:"tipo",render:u=>d(u)},{label:"Pago",key:"metodo_pago",render:u=>p(u)},{label:"Monto",key:"precio_unitario",render:u=>`<strong style="color:#dc3545;">${N(u)}</strong>`},{label:"Usuario",key:"usuario",render:u=>`<span style="font-size:.84rem;">${u||"—"}</span>`}],rows:s,perPage:15})},async cargarDevoluciones(){const e=I("d-fecha-inicio"),t=I("d-fecha-fin"),a=document.getElementById("tabla-devoluciones");if(!a||!e||!t)return;a.innerHTML='<p class="rep-loading">Cargando...</p>';const i=(await f(`SELECT d.dev_id, d.ticket_id, d.motivo, d.fecha_devolucion,
              u.usu_nom AS usuario,
              MAX(v.total_ticket) AS total_ticket,
              COALESCE(MAX(v.costo_envio), 0) AS costo_envio,
              GROUP_CONCAT(v.cantidad||'x '||v.producto, ' | ') AS articulos
       FROM rv_devoluciones d
       LEFT JOIN tm_usuario u ON u.usu_id = d.usu_id
       LEFT JOIN rv_ventas v ON v.ticket = d.ticket_id
       WHERE DATE(d.fecha_devolucion) BETWEEN $1 AND $2
       GROUP BY d.dev_id
       ORDER BY d.fecha_devolucion DESC`,[e,t])).map(s=>({...s,total_neto:parseFloat(s.total_ticket||0)-parseFloat(s.costo_envio||0)})),n=i.reduce((s,r)=>s+r.total_neto,0);if(A("d-count",i.length,!1),A("d-monto",n,!0),!i.length){a.innerHTML='<p class="rep-empty">Sin devoluciones en el período.</p>';return}Q("tabla-devoluciones",{cols:[{label:"#Dev",key:"dev_id",render:s=>`<span style="color:#6c757d;">#${s}</span>`},{label:"Ticket",key:"ticket_id",render:s=>`<strong>#${s}</strong>`},{label:"Fecha",key:"fecha_devolucion",render:s=>`<span style="white-space:nowrap;">${ne(s)}</span>`},{label:"Artículos",key:"articulos",render:s=>`<span style="font-size:.84rem;color:#555;">${(s||"—").replace(/\|/g,"<br>")}</span>`,searchVal:s=>s.articulos||""},{label:"Motivo",key:"motivo",render:s=>`<span style="font-size:.84rem;">${s||"—"}</span>`},{label:"Usuario",key:"usuario",render:s=>`<span style="font-size:.84rem;">${s||"—"}</span>`},{label:"Monto ticket",key:"total_neto",render:s=>`<strong style="color:#dc3545;">${N(s)}</strong>`}],rows:i,perPage:15})},async cargarUtilidades(){const e=I("u-fecha-inicio"),t=I("u-fecha-fin"),a=document.getElementById("tabla-utilidades");if(!a)return;a.innerHTML='<p class="rep-loading">Cargando...</p>';const o=await f(`SELECT v.producto, SUM(v.cantidad) AS unidades,
              IFNULL(p.pr_precioventa,0) AS precio_venta,
              IFNULL(p.pr_preciocompra,0) AS precio_compra,
              SUM(v.cantidad)*(IFNULL(p.pr_precioventa,0)-IFNULL(p.pr_preciocompra,0)) AS utilidad
       FROM rv_ventas v
       LEFT JOIN rv_productos p ON p.ID = v.id_producto
       WHERE DATE(v.fecha) BETWEEN $1 AND $2
         AND v.estatus='completado'
       GROUP BY v.id_producto
       ORDER BY utilidad DESC`,[e,t]),i=o.reduce((s,r)=>s+parseFloat(r.utilidad||0),0);if(A("u-total",i,!0),!o.length){a.innerHTML='<p class="rep-empty">Sin datos de utilidad.</p>';return}const n=o.map(s=>({...s,_utilidad_u:parseFloat(s.precio_venta||0)-parseFloat(s.precio_compra||0)}));Q("tabla-utilidades",{cols:[{label:"Producto",key:"producto",render:s=>`<strong>${s}</strong>`},{label:"Unidades",key:"unidades",render:s=>`<span style="display:block;text-align:center;">${s}</span>`},{label:"P. Venta",key:"precio_venta",render:s=>N(s)},{label:"P. Costo",key:"precio_compra",render:s=>N(s)},{label:"Utilidad/u",key:"_utilidad_u",render:s=>N(s)},{label:"Utilidad Total",key:"utilidad",render:s=>`<strong style="color:${parseFloat(s||0)>=0?"#28a745":"#dc3545"};">${N(s)}</strong>`}],rows:n,perPage:20})}};async function Xt(e){try{const t=await f(`SELECT v.*, e.emp_nombre FROM rv_ventas v
       LEFT JOIN tm_empleado e ON e.emp_id = v.vendedor
       WHERE v.ticket = $1`,[e]);if(!t.length){alert("No se encontró el ticket #"+e);return}const a=t[0],o=a.emp_nombre||"Vendedor",i=parseFloat(a.total_ticket)||0,n=a.metodo_pago||"",s={efectivo:parseFloat(a.monto_efectivo)||0,tarjeta:parseFloat(a.monto_tarjeta)||0,transferencia:parseFloat(a.monto_transferencia)||0};let r="";for(const p of t)r+=`<tr>
        <td class='col-qty'>${parseInt(p.cantidad)}x</td>
        <td class='col-name'>${p.producto}</td>
        <td class='col-price'>$${(parseFloat(p.total)||0).toFixed(2)}</td>
      </tr>`;parseFloat(a.costo_envio)>0&&(r+=`<tr>
        <td class='col-qty'></td>
        <td class='col-name' style='font-style:italic;'>Envío a domicilio</td>
        <td class='col-price'>$${parseFloat(a.costo_envio).toFixed(2)}</td>
      </tr>`);let c="";n.toLowerCase()==="mixto"?(s.efectivo>0&&(c+=`<p><span>Efectivo:</span><span>$${s.efectivo.toFixed(2)}</span></p>`),s.tarjeta>0&&(c+=`<p><span>Tarjeta:</span><span>$${s.tarjeta.toFixed(2)}</span></p>`),s.transferencia>0&&(c+=`<p><span>Transf:</span><span>$${s.transferencia.toFixed(2)}</span></p>`)):c=`<p><span>Recibo:</span><span>$${i.toFixed(2)}</span></p>`;const l=a.tipo_orden==="llevar"?"Para llevar":a.tipo_orden==="comer_aqui"?"Comer aquí":"Domicilio",v=new Date(a.fecha.replace(" ","T")).toLocaleString("es-MX"),d=`
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'>
  <title>Ticket #${e}</title>
  <style>
    @page { margin: 0; size: 58mm auto; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      font-weight: bold;
      width: 48mm;
      margin: 0 auto;
      padding: 2px 0;
      color: #000;
      line-height: 1.25;
    }
    .center { text-align: center; }
    h1 { font-size: 18px; font-weight: 900; margin-bottom: 1px; }
    h2 { font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    .sep { border: none; border-top: 1px dashed #000; margin: 5px 0; }
    .info p { font-size: 13px; margin-bottom: 1px; }
    /* Tabla de productos */
    table { width: 100%; border-collapse: collapse; table-layout: auto; }
    thead th { font-size: 12px; font-weight: 900; padding: 2px 0; text-transform: uppercase; letter-spacing: .1px; }
    thead th:first-child { text-align: left; }
    thead th:last-child { text-align: right; }
    td { font-size: 13px; padding: 2px 0; vertical-align: top; }
    .col-qty { width: 24px; white-space: nowrap; padding-right: 2px; }
    .col-name { word-break: break-word; }
    .col-price { width: 50px; text-align: right; white-space: nowrap; }
    .note td { font-size: 12px; padding: 0 0 1px; font-weight: normal; }
    .group-header td { font-size: 13px; font-weight: 900; padding-top: 5px; padding-bottom: 1px; }
    /* Totales */
    .totales { margin-top: 5px; font-size: 14px; }
    .totales p { display: flex; justify-content: space-between; margin-bottom: 2px; }
    .totales p span { font-variant-numeric: tabular-nums; }
    .total-final { font-size: 18px; font-weight: 900; text-align: center; margin: 7px 0 4px; letter-spacing: .3px; }
    .footer { font-size: 13px; text-align: center; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="center">
    <h1>Ticket #${e}</h1>
    <h2>Antojitos Santa Lucía</h2>
    <p style="font-size:12px;margin-bottom:4px;">[REIMPRESIÓN]</p>
  </div>

  ${a.sensor_num?`
  <div style='text-align:center;border:2px solid #000;border-radius:5px;padding:5px 4px;margin:5px 0;'>
    <div style='font-size:10px;font-weight:900;letter-spacing:1px;'>SENSOR</div>
    <div style='font-size:46px;font-weight:900;line-height:1;'>#${a.sensor_num}</div>
  </div>`:""}

  <div class='info'>
    <p>Fecha: ${v}</p>
    <p>Vendedor: ${o}</p>
    <p>Tipo: ${l}</p>
    <p>Método de pago: ${n?n.toUpperCase():"N/A"}</p>
    ${a.direccion?`<p>Dirección:</p><p>${a.direccion}</p>`:""}
  </div>

  <hr class='sep'>

  <table>
    <thead>
      <tr>
        <th class='col-qty'>Cant</th>
        <th class='col-name'>Producto</th>
        <th class='col-price'>Total</th>
      </tr>
    </thead>
    <tbody>
      ${r}
    </tbody>
  </table>

  <hr class='sep'>

  <div class='total-final'>TOTAL: $${i.toFixed(2)}</div>

  <div class='totales'>
    ${c}
  </div>

  <div class='footer'>
    <p>¡Gracias por su preferencia!</p>
  </div>
</body>
</html>`;window.imprimirTicket?window.imprimirTicket(d):alert("Función de impresión no disponible.")}catch(t){alert("Error al reimprimir: "+(t.message||t))}}function I(e){var t;return((t=document.getElementById(e))==null?void 0:t.value)||""}function ye(e,t){const a=document.getElementById(e);a&&(a.textContent=t)}function Vt(){return new Promise(e=>{if(window.Chart){e();return}const t=setInterval(()=>{window.Chart&&(clearInterval(t),e())},80)})}async function Gt(e){qt("devoluciones-css","/assets/css/devoluciones.css"),z(e,"devoluciones",Wt()),Yt.init()}function qt(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function Wt(){return`
<div class="dev-container">
  <div class="dev-header">
    <h1 class="dev-title">🔄 Devoluciones</h1>
    <p class="dev-subtitle">Cancelar tickets de venta completados</p>
  </div>

  <div class="dev-grid">
    <!-- Buscador -->
    <div class="dev-search-card">
      <h3>Buscar Venta</h3>
      <div class="dev-form-group">
        <label>Número de Ticket:</label>
        <input type="number" id="ticket_id" class="dev-input" placeholder="Ej: 123" autocomplete="off">
      </div>
      <button class="dev-btn btn-primary" id="btn-buscar">
        <i class="fa fa-search"></i> Buscar Ticket
      </button>
    </div>

    <!-- Detalles -->
    <div class="dev-details-card">
      <div id="dev-placeholder" class="dev-placeholder">
        <i class="fa fa-receipt"></i>
        <p>Busque un ticket para ver sus detalles</p>
      </div>

      <div id="dev-content" class="dev-content" style="display:none;">
        <div class="dev-content-header">
          <h3>Ticket #<span id="lbl-ticket"></span></h3>
          <span class="dev-badge" id="lbl-status">Completado</span>
        </div>
        
        <div class="dev-info-grid">
          <div><strong>Fecha:</strong> <span id="lbl-fecha"></span></div>
          <div><strong>Vendedor:</strong> <span id="lbl-vendedor"></span></div>
          <div><strong>Metodo Pago:</strong> <span id="lbl-pago"></span></div>
          <div class="dev-total"><strong>Total:</strong> <span id="lbl-total"></span></div>
        </div>

        <h4>Productos:</h4>
        <ul class="dev-items-list" id="lista-productos"></ul>

        <hr class="dev-divider">

        <div class="dev-action-area">
          <div style="flex:1;">
            <label>Motivo de la Devolución:</label>
            <input type="text" id="motivo_devolucion" class="dev-input" placeholder="Ej: Error en cobro...">
          </div>
          <button class="dev-btn btn-danger" id="btn-iniciar-devolucion">
            Confirmar Devolución
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal Token -->
<div class="dev-modal-overlay" id="modal-token">
  <div class="dev-modal">
    <h3>Token de Autorización</h3>
    <p>Ingresa el token numérico (4 dígitos) de autorización para cancelar el ticket #<span id="lbl-ticket-modal"></span></p>
    
    <input type="password" id="input-token" class="dev-input text-center" maxlength="4" placeholder="••••" autocomplete="off" inputmode="numeric">
    <p id="token-error" class="dev-error" style="display:none;">Token inválido.</p>
    
    <div class="dev-modal-actions">
      <button class="dev-btn btn-secundario" id="btn-cancel-token">Cancelar</button>
      <button class="dev-btn btn-danger" id="btn-confirm-token">Validar y Devolver</button>
    </div>
  </div>
</div>
`}const Yt={_ticketActual:null,_ticketTotal:0,init(){this.bindEvents()},bindEvents(){document.getElementById("btn-buscar").addEventListener("click",()=>this.buscarTicket()),document.getElementById("ticket_id").addEventListener("keypress",e=>{e.key==="Enter"&&this.buscarTicket()}),document.getElementById("btn-iniciar-devolucion").addEventListener("click",()=>this.iniciarDevolucion()),document.getElementById("btn-cancel-token").addEventListener("click",()=>this.cerrarModal()),document.getElementById("btn-confirm-token").addEventListener("click",()=>this.procesarDevolucion()),document.getElementById("input-token").addEventListener("keypress",e=>{e.key==="Enter"&&this.procesarDevolucion()})},async buscarTicket(){const e=document.getElementById("ticket_id").value.trim();if(!e)return this.showAlert("Ingrese un número de ticket.","error");const t=await f(`SELECT ticket, fecha, vendedor, metodo_pago, total_ticket, estatus, cantidad, producto, total
       FROM rv_ventas
       WHERE ticket = $1`,[e]);if(t.length===0)return this.resetDetalles(),this.showAlert("No se encontró el ticket.","error");const a=t[0];if(a.estatus==="cancelado")return this.resetDetalles(),this.showAlert("El ticket ya fue cancelado previamente.","warning");this._ticketActual=e,this._ticketTotal=a.total_ticket,document.getElementById("lbl-ticket").textContent=a.ticket,document.getElementById("lbl-fecha").textContent=new Date(a.fecha).toLocaleString(),document.getElementById("lbl-vendedor").textContent=a.vendedor,document.getElementById("lbl-pago").textContent=a.metodo_pago,document.getElementById("lbl-total").textContent="$"+parseFloat(a.total_ticket).toFixed(2);const o=document.getElementById("lista-productos");o.innerHTML=t.map(i=>`
      <li>
        <div>
          <strong>${i.producto}</strong><br>
          <small>Cant: ${i.cantidad}</small>
        </div>
        <div style="font-weight:bold;">$${parseFloat(i.total).toFixed(2)}</div>
      </li>
    `).join(""),document.getElementById("dev-placeholder").style.display="none",document.getElementById("dev-content").style.display="block",document.getElementById("motivo_devolucion").value=""},resetDetalles(){this._ticketActual=null,document.getElementById("dev-placeholder").style.display="flex",document.getElementById("dev-content").style.display="none"},iniciarDevolucion(){if(!document.getElementById("motivo_devolucion").value.trim())return this.showAlert("Ingrese el motivo de la devolución.","warning");document.getElementById("lbl-ticket-modal").textContent=this._ticketActual,document.getElementById("input-token").value="",document.getElementById("token-error").style.display="none",document.getElementById("modal-token").classList.add("active"),setTimeout(()=>document.getElementById("input-token").focus(),100)},cerrarModal(){document.getElementById("modal-token").classList.remove("active")},async procesarDevolucion(){var i;const e=document.getElementById("input-token").value.trim();if(e.length<4){this.mostrarErrorToken("El token debe tener 4 dígitos.");return}if((await f("SELECT token FROM token_global WHERE id = 1 AND token = $1",[e])).length===0){this.mostrarErrorToken("Token incorrecto o expirado.");return}const a=((i=window._session)==null?void 0:i.usu_id)||1,o=document.getElementById("motivo_devolucion").value.trim();try{await w("UPDATE rv_ventas SET estatus = 'cancelado' WHERE ticket = $1",[this._ticketActual]),await w("INSERT INTO rv_devoluciones (ticket_id, motivo, usu_id) VALUES ($1, $2, $3)",[this._ticketActual,o,a]),this.cerrarModal(),this.resetDetalles(),document.getElementById("ticket_id").value="",this.showAlert("Ticket cancelado con éxito.","success")}catch(n){console.error(n),this.showAlert("Hubo un error al procesar la devolución.","error")}},mostrarErrorToken(e){const t=document.getElementById("token-error");t.textContent=e,t.style.display="block"},showAlert(e,t){window.showToast?window.showToast(e,t==="error"?"red":t==="warning"?"orange":"green"):alert((t==="error"?"❌ ":t==="success"?"✅ ":"⚠️ ")+e)}};async function Kt(e){Jt("token-css","/assets/css/token.css"),z(e,"token",Qt()),Zt.init()}function Jt(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function Qt(){return`
<div class="tk-container">
  <div class="tk-header">
    <h1 class="tk-title">🔑 Token de Autorización Global</h1>
    <p class="tk-subtitle">Utiliza este código para autorizar devoluciones y cancelaciones en el sistema.</p>
  </div>

  <div class="tk-card">
    <p class="tk-muted">El token de 4 dígitos cambia automáticamente cada vez que un Administrador inicia sesión. Compártelo únicamente con el personal autorizado.</p>
    
    <div class="tk-display-box" id="tk-display">
      <div class="tk-loader">Cargando...</div>
    </div>
    
    <button class="tk-btn" id="btn-refresh-token">
      <i class="fas fa-sync-alt"></i> Refrescar Token
    </button>
  </div>
</div>`}const Zt={async init(){var e;await this.cargarToken(),(e=document.getElementById("btn-refresh-token"))==null||e.addEventListener("click",()=>{this.cargarToken()})},async cargarToken(){const e=document.getElementById("tk-display");e.innerHTML='<div class="tk-loader">Buscando...</div>';try{const t=await f("SELECT token FROM token_global WHERE id = 1",[]);t.length>0?e.innerHTML=`<span class="tk-number">${t[0].token}</span>`:e.innerHTML='<span style="color:#dc3545; font-size:1.5rem;">No hay token activo. <br>Inicia sesión como Administrador.</span>'}catch{e.innerHTML='<span style="color:#dc3545;">Error cargando token.</span>'}}};async function ea(e){if(!window._session||!["Admin","Administrativo","administrador"].includes(window._session.puesto)){e.innerHTML='<h2 style="padding:20px; color:red;">No tienes permisos para ver esta sección.</h2>';return}ta("empleados-css","/assets/css/empleados.css"),z(e,"empleados",aa()),oa.init()}function ta(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function aa(){return`
<div class="emp-container">
  <div class="emp-header">
    <h1 class="emp-title">👥 Gestión de Empleados</h1>
  </div>

  <div class="emp-card">
    <div class="emp-toolbar">
      <button class="emp-btn btn-primary" id="btn-nuevo-empleado">
        <i class="fas fa-plus-circle"></i> Nuevo Empleado
      </button>
    </div>

    <div class="emp-table-wrapper">
      <table class="emp-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Usuario Asignado</th>
            <th>Rol / Empresa</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="emp-tbody">
          <tr><td colspan="6" class="text-center">Cargando datos...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Modal Empleado (Crear/Editar) -->
<div class="emp-modal-overlay" id="modal-empleado">
  <div class="emp-modal">
    <h3 id="modal-emp-title">Nuevo Empleado</h3>
    <form id="form-empleado">
      <input type="hidden" id="emp_id">
      
      <div class="emp-form-group">
        <label>Nombre:</label>
        <input type="text" id="emp_nombre" required class="emp-input">
      </div>
      
      <div class="emp-form-group">
        <label>Puesto:</label>
        <input type="text" id="emp_puesto" required class="emp-input">
      </div>
      
      <div class="emp-form-group">
        <label>Sucursal:</label>
        <!-- Hardcodeado como el original, se puede dejar un select simple -->
        <select id="sucursal_id" class="emp-input">
          <option value="1" selected>Principal / Sucursal 1</option>
          <option value="2">Sucursal 2</option>
        </select>
      </div>

      <div class="emp-modal-actions">
        <button type="button" class="emp-btn btn-secundario" id="btn-close-emp">Cancelar</button>
        <button type="submit" class="emp-btn btn-primary">Guardar</button>
      </div>
    </form>
  </div>
</div>

<!-- Modal Usuario (Crear credenciales) -->
<div class="emp-modal-overlay" id="modal-usuario">
  <div class="emp-modal">
    <h3>Generar Acceso</h3>
    <p style="font-size:0.9rem; color:#6c757d; margin-bottom:15px;">Vincula un usuario del sistema a este empleado.</p>
    <form id="form-usuario">
      <input type="hidden" id="usuario_emp_id">
      
      <div class="emp-form-group">
        <label>Nombre de Usuario (Para Login):</label>
        <input type="text" id="usu_nom" required class="emp-input" autocomplete="off">
      </div>
      
      <div class="emp-form-group">
        <label>Contraseña:</label>
        <input type="password" id="usu_pass" required class="emp-input" autocomplete="new-password">
      </div>
      
      <div class="emp-form-group">
        <label>Rol (Ej: Cajero, Admin):</label>
        <input type="text" id="usu_puesto" required class="emp-input">
      </div>
      
      <div class="emp-form-group">
        <label>Empresa:</label>
        <input type="text" id="usu_empresa" required class="emp-input" value="Antojitos Santa Lucía">
      </div>

      <div class="emp-modal-actions">
        <button type="button" class="emp-btn btn-secundario" id="btn-close-usu">Cancelar</button>
        <button type="submit" class="emp-btn btn-primary">Crear y Ligar Usuario</button>
      </div>
    </form>
  </div>
</div>
`}const oa={init(){this.cargarTabla(),this.bindEvents()},bindEvents(){document.getElementById("btn-nuevo-empleado").addEventListener("click",()=>{document.getElementById("form-empleado").reset(),document.getElementById("emp_id").value="",document.getElementById("modal-emp-title").textContent="Nuevo Empleado",this.abrirModal("modal-empleado")}),document.getElementById("btn-close-emp").addEventListener("click",()=>this.cerrarModal("modal-empleado")),document.getElementById("btn-close-usu").addEventListener("click",()=>this.cerrarModal("modal-usuario")),document.getElementById("form-empleado").addEventListener("submit",t=>this.guardarEmpleado(t)),document.getElementById("form-usuario").addEventListener("submit",t=>this.crearUsuario(t));const e=document.getElementById("emp-tbody");e&&e.addEventListener("click",t=>{const a=t.target.closest("button[data-action]");if(!a)return;const o=a.dataset.action,i=Number(a.dataset.id);o==="edit"?this.editar(i):o==="delete"?this.eliminar(i):o==="user"&&this.abrirCrearUsuario(i)})},abrirModal(e){document.getElementById(e).classList.add("active")},cerrarModal(e){document.getElementById(e).classList.remove("active")},async cargarTabla(){const e=document.getElementById("emp-tbody");try{const t=await f(`
        SELECT 
          e.emp_id, e.emp_nombre, e.emp_puesto, e.emp_estatus, e.usu_id,
          u.usu_nom, u.usu_puesto as usu_rol, u.usu_empresa
        FROM tm_empleado e
        LEFT JOIN tm_usuario u ON e.usu_id = u.usu_id
        WHERE e.emp_estatus = 1
        ORDER BY e.emp_nombre ASC
      `,[]);if(t.length===0){e.innerHTML='<tr><td colspan="6" style="text-align:center;">No hay empleados registrados.</td></tr>';return}let a="";t.forEach(o=>{const i=!!o.usu_id,n=o.emp_estatus===1?'<span class="emp-badge open">Activo</span>':'<span class="emp-badge closed">Inactivo</span>';let s=`
          <button class="emp-btn-icon edit" data-action="edit" data-id="${o.emp_id}" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="emp-btn-icon delete" data-action="delete" data-id="${o.emp_id}" title="Eliminar"><i class="fas fa-trash"></i></button>
        `;i||(s+=`<button class="emp-btn-icon user" data-action="user" data-id="${o.emp_id}" title="Enlazar Usuario"><i class="fas fa-user-plus"></i></button>`),a+=`
          <tr>
            <td><strong>${o.emp_nombre}</strong></td>
            <td>${o.emp_puesto}</td>
            <td>${i?`<span class="emp-text-primary">${o.usu_nom}</span>`:'<em style="color:#adb5bd;">Sin cuenta asignada</em>'}</td>
            <td>${i?`(${o.usu_rol}) ${o.usu_empresa??""}`:"-"}</td>
            <td>${n}</td>
            <td><div style="display:flex; gap:5px; justify-content:center;">${s}</div></td>
          </tr>
        `}),e.innerHTML=a,window.EmpleadosApp=this}catch(t){console.error(t),e.innerHTML='<tr><td colspan="6" style="color:red; text-align:center;">Error cargando empleados.</td></tr>'}},async guardarEmpleado(e){e.preventDefault();const t=document.getElementById("emp_id").value,a=document.getElementById("emp_nombre").value.trim(),o=document.getElementById("emp_puesto").value.trim(),i=document.getElementById("sucursal_id").value;try{t?(await w("UPDATE tm_empleado SET emp_nombre = $1, emp_puesto = $2, sucursal_id = $3 WHERE emp_id = $4",[a,o,i,t]),this.showAlert("Empleado actualizado exitosamente.","success")):(await w("INSERT INTO tm_empleado (emp_nombre, emp_puesto, sucursal_id, emp_estatus) VALUES ($1, $2, $3, 1)",[a,o,i]),this.showAlert("Empleado registrado exitosamente.","success")),this.cerrarModal("modal-empleado"),this.cargarTabla()}catch(n){console.error(n),this.showAlert("Ocurrió un error al guardar el empleado.","error")}},async editar(e){try{const t=await f("SELECT emp_id, emp_nombre, emp_puesto, sucursal_id FROM tm_empleado WHERE emp_id = $1",[e]);if(t.length>0){const a=t[0];document.getElementById("emp_id").value=a.emp_id,document.getElementById("emp_nombre").value=a.emp_nombre,document.getElementById("emp_puesto").value=a.emp_puesto,document.getElementById("sucursal_id").value=a.sucursal_id||1,document.getElementById("modal-emp-title").textContent="Editar Empleado",this.abrirModal("modal-empleado")}}catch{this.showAlert("Error consultando empleado.","error")}},async eliminar(e){window.Swal?Swal.fire({title:"¿Estás seguro?",text:"El empleado será dado de baja",icon:"warning",showCancelButton:!0,confirmButtonColor:"#d33",cancelButtonColor:"#3085d6",confirmButtonText:"Sí, eliminar",cancelButtonText:"Cancelar"}).then(async t=>{t.isConfirmed&&await this._ejecutarEliminacion(e)}):confirm("¿Estás seguro de dar de baja a este empleado?")&&await this._ejecutarEliminacion(e)},async _ejecutarEliminacion(e){try{await w("UPDATE tm_empleado SET emp_estatus = 0 WHERE emp_id = $1",[e]),this.showAlert("Empleado dado de baja exitosamente.","success"),this.cargarTabla()}catch{this.showAlert("Error al eliminar.","error")}},abrirCrearUsuario(e){document.getElementById("form-usuario").reset(),document.getElementById("usuario_emp_id").value=e,this.abrirModal("modal-usuario")},async crearUsuario(e){e.preventDefault();const t=document.getElementById("usuario_emp_id").value,a=document.getElementById("usu_nom").value.trim(),o=document.getElementById("usu_pass").value,i=document.getElementById("usu_puesto").value.trim(),n=document.getElementById("usu_empresa").value.trim();try{if((await f("SELECT usu_id FROM tm_usuario WHERE usu_nom = $1",[a])).length>0)return this.showAlert("Ese nombre de usuario ya existe. Elige otro.","warning");await w(`INSERT INTO tm_usuario (usu_nom, usu_pass, usu_puesto, usu_empresa, est) 
         VALUES ($1, $2, $3, $4, 1)`,[a,o,i,n]);const c=(await f("SELECT last_insert_rowid() as id",[]))[0].id;await w("UPDATE tm_empleado SET usu_id = $1 WHERE emp_id = $2",[c,t]),this.showAlert("Usuario creado y vinculado exitosamente.","success"),this.cerrarModal("modal-usuario"),this.cargarTabla()}catch(s){console.error(s),this.showAlert("Error creando credenciales de acceso.","error")}},showAlert(e,t){window.showToast?window.showToast(e,t==="error"?"red":t==="warning"?"orange":"green"):alert((t==="error"?"❌ ":t==="success"?"✅ ":"⚠️ ")+e)}},He="https://antojitossantalucia.smartouch.me/sync.php",Be="ANTOJITOS_SYNC_2025_K9x!";async function ia(e){z(e,"sincronizacion",sa()),await na()}function sa(){return`
<div class="sync-container">
    <div class="sync-header">
        <div class="sync-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h1 class="sync-title">Sincronización</h1>
        <p class="sync-subtitle">Envía los datos locales al servidor en la nube</p>
    </div>

    <!-- Estado de conexión -->
    <div class="sync-status-card" id="sync-status-card">
        <div class="sync-status-icon" id="sync-status-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <div class="sync-status-text" id="sync-status-text">
            Verificando conexión al servidor...
        </div>
    </div>

    <!-- Tablas a sincronizar -->
    <div class="sync-tables" id="sync-tables">
        <div class="sync-table-item" id="sync-item-ventas">
            <div class="sync-table-info">
                <i class="fas fa-receipt sync-table-icon"></i>
                <div>
                    <div class="sync-table-name">Ventas</div>
                    <div class="sync-table-count" id="count-ventas">Contando...</div>
                </div>
            </div>
            <div class="sync-table-status" id="status-ventas">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        </div>

        <div class="sync-table-item" id="sync-item-caja">
            <div class="sync-table-info">
                <i class="fas fa-store sync-table-icon"></i>
                <div>
                    <div class="sync-table-name">Aperturas / Cierres de Caja</div>
                    <div class="sync-table-count" id="count-caja">Contando...</div>
                </div>
            </div>
            <div class="sync-table-status" id="status-caja">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        </div>

        <div class="sync-table-item" id="sync-item-gastos">
            <div class="sync-table-info">
                <i class="fas fa-money-bill-wave sync-table-icon"></i>
                <div>
                    <div class="sync-table-name">Gastos</div>
                    <div class="sync-table-count" id="count-gastos">Contando...</div>
                </div>
            </div>
            <div class="sync-table-status" id="status-gastos">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        </div>
    </div>

    <!-- Resultado de última sincronización -->
    <div class="sync-result" id="sync-result" style="display:none;"></div>

    <!-- Botones -->
    <div class="sync-actions">
        <button class="btn-sync" id="btn-sync" disabled>
            <i class="fas fa-sync-alt"></i>
            Sincronizar Ahora
        </button>
        <p class="sync-warning">
            <i class="fas fa-info-circle"></i>
            La sincronización solo envía registros nuevos. No elimina ni modifica datos existentes en el servidor.
        </p>
    </div>
</div>

<style>
.sync-container {
    padding: 24px 20px 100px;
    max-width: 600px;
    margin: 0 auto;
}
.sync-header {
    text-align: center;
    margin-bottom: 28px;
}
.sync-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 32px;
    color: white;
    box-shadow: 0 8px 24px rgba(99,102,241,0.35);
}
.sync-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary, #1e293b);
    margin: 0 0 6px;
}
.sync-subtitle {
    color: var(--text-secondary, #64748b);
    font-size: 0.95rem;
    margin: 0;
}

/* Estado de conexión */
.sync-status-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border, #e2e8f0);
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.sync-status-icon {
    font-size: 24px;
    width: 40px;
    text-align: center;
}
.sync-status-icon.ok { color: #22c55e; }
.sync-status-icon.err { color: #ef4444; }
.sync-status-text {
    font-size: 0.9rem;
    color: var(--text-primary, #1e293b);
}

/* Tablas */
.sync-tables {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}
.sync-table-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border, #e2e8f0);
    border-radius: 14px;
    padding: 14px 18px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.sync-table-info {
    display: flex;
    align-items: center;
    gap: 14px;
}
.sync-table-icon {
    font-size: 18px;
    color: #6366f1;
    width: 24px;
    text-align: center;
}
.sync-table-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-primary, #1e293b);
}
.sync-table-count {
    font-size: 0.78rem;
    color: var(--text-secondary, #64748b);
    margin-top: 2px;
}
.sync-table-status {
    font-size: 18px;
    color: #94a3b8;
}
.sync-table-status.ok { color: #22c55e; }
.sync-table-status.err { color: #ef4444; }
.sync-table-status.syncing { color: #f59e0b; }

/* Resultado */
.sync-result {
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    font-size: 0.88rem;
    line-height: 1.6;
}
.sync-result.success {
    background: #f0fdf4;
    border: 1px solid #86efac;
    color: #166534;
}
.sync-result.error {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #991b1b;
}

/* Botón */
.sync-actions { text-align: center; }
.btn-sync {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: white;
    border: none;
    border-radius: 14px;
    padding: 14px 32px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(99,102,241,0.35);
    width: 100%;
    justify-content: center;
    max-width: 340px;
}
.btn-sync:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
.btn-sync:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }
.sync-warning {
    margin-top: 14px;
    font-size: 0.78rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
}
</style>
    `}async function na(){const e=document.getElementById("sync-status-icon"),t=document.getElementById("sync-status-text"),a=document.getElementById("btn-sync");let o=!1;try{const i=new AbortController,n=setTimeout(()=>i.abort(),5e3),s=await fetch(He,{method:"GET",mode:"cors",headers:{Accept:"application/json"},signal:i.signal});clearTimeout(n),o=!0}catch(i){console.error("Error contactando al servidor:",i),o=!1}o?(e.innerHTML='<i class="fas fa-check-circle"></i>',e.className="sync-status-icon ok",t.textContent="✅ Servidor disponible — listo para sincronizar.",a.disabled=!1):(e.innerHTML='<i class="fas fa-times-circle"></i>',e.className="sync-status-icon err",t.textContent="❌ Sin conexión al servidor. Verifica tu internet e intenta de nuevo."),await ra(),a.addEventListener("click",pa)}async function ra(){var e,t,a;try{const o=await f("SELECT COUNT(*) as total FROM rv_ventas",[]);document.getElementById("count-ventas").textContent=`${((e=o[0])==null?void 0:e.total)??0} registros locales`,document.getElementById("status-ventas").innerHTML='<i class="fas fa-circle" style="color:#94a3b8;font-size:10px;"></i>'}catch{document.getElementById("count-ventas").textContent="Tabla no disponible"}try{const o=await f("SELECT COUNT(*) as total FROM rv_apertura_caja",[]);document.getElementById("count-caja").textContent=`${((t=o[0])==null?void 0:t.total)??0} registros locales`,document.getElementById("status-caja").innerHTML='<i class="fas fa-circle" style="color:#94a3b8;font-size:10px;"></i>'}catch{document.getElementById("count-caja").textContent="Tabla no disponible"}try{const o=await f("SELECT COUNT(*) as total FROM rv_gastos",[]);document.getElementById("count-gastos").textContent=`${((a=o[0])==null?void 0:a.total)??0} registros locales`,document.getElementById("status-gastos").innerHTML='<i class="fas fa-circle" style="color:#94a3b8;font-size:10px;"></i>'}catch{document.getElementById("count-gastos").textContent="Tabla no disponible"}}function ca(e,t){const a=[];for(let o=0;o<e.length;o+=t)a.push(e.slice(o,o+t));return a}async function da(e){const t={empresa:"Antojitos Santa Lucia",token:Be,...e},a=new AbortController,o=setTimeout(()=>a.abort(new Error("Tiempo de espera agotado. Verifica tu conexión e intenta de nuevo.")),12e4);try{const i=await fetch(He,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Be}`},body:JSON.stringify(t),signal:a.signal});if(clearTimeout(o),!i.ok)throw new Error(`Error del servidor: ${i.status}`);return await i.json()}catch(i){throw clearTimeout(o),i}}async function la(){const e={},t=["rv_sucursales","rv_categorias","rv_ingredientes","rv_gastos_fijos_plantilla","tm_usuario","tm_empleado","rv_insumos","rv_productos","rv_producto_componentes","rv_producto_insumos","rv_apertura_caja","rv_ventas","rv_comanda","rv_devoluciones","rv_gastos","rv_gastos_fijos","rv_movimientos_insumos"];for(const a of t)try{e[a]=await f(`SELECT * FROM ${a}`,[])}catch{e[a]=[]}return e}async function pa(){var a,o,i,n;const e=document.getElementById("btn-sync"),t=document.getElementById("sync-result");e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin"></i> Sincronizando...',t.style.display="none",["ventas","caja","gastos"].forEach(s=>{const r=document.getElementById(`status-${s}`);r&&(r.innerHTML='<i class="fas fa-spinner fa-spin"></i>',r.className="sync-table-status syncing")});try{const s=await la(),r=[],c=["rv_sucursales","rv_categorias","rv_ingredientes","rv_gastos_fijos_plantilla","tm_usuario","tm_empleado","rv_insumos","rv_productos","rv_producto_componentes","rv_producto_insumos"],l={};for(const g of c)l[g]=s[g]??[];r.push(l);const v=["rv_apertura_caja","rv_ventas","rv_comanda","rv_devoluciones","rv_gastos","rv_gastos_fijos","rv_movimientos_insumos"];for(const g of v){const b=s[g]??[],E=ca(b,300);if(E.length===0)r.push({[g]:[]});else for(const T of E)r.push({[g]:T})}const d={};let p=null;for(let g=0;g<r.length;g++){e.innerHTML=`<i class="fas fa-spinner fa-spin"></i> Enviando lote ${g+1} de ${r.length}...`;const b=await da(r[g]);if(!b.success){if(b.error&&(b.error.includes("SUSPENDIDA")||b.error.includes("caducado")||b.error.includes("Error de Licencia")))try{const{invoke:E}=((a=window.__TAURI__)==null?void 0:a.core)||await B(()=>Promise.resolve().then(()=>ee),void 0),T=new Date().toISOString().replace("T"," ").substring(0,19),y=await E("generar_firma_licencia",{fechaUltimoSync:T,fechaExpiracion:"2000-01-01 00:00:00",ventasDesdeSync:9999});await w("UPDATE rv_licencia_local SET fecha_ultimo_sync=$1, fecha_expiracion=$2, ventas_desde_sync=$3, firma_digital=$4 WHERE id=1",[T,"2000-01-01 00:00:00",9999,y])}catch(E){console.error("Error al revocar licencia:",E)}throw new Error(b.error||"Error desconocido del servidor")}Object.entries(b.tablas??{}).forEach(([E,T])=>{d[E]||(d[E]={recibidos:0,upsertados:0}),d[E].recibidos+=T.recibidos??0,d[E].upsertados+=T.upsertados??0})}const u={rv_ventas:"ventas",rv_apertura_caja:"caja",rv_gastos:"gastos"};Object.entries(d).forEach(([g,b])=>{const E=u[g];if(!E)return;const T=document.getElementById(`status-${E}`),y=document.getElementById(`count-${E}`);T&&(T.innerHTML='<i class="fas fa-check-circle"></i>',T.className="sync-table-status ok"),y&&(y.textContent=`✓ ${b.upsertados} sincronizados de ${b.recibidos} enviados`)});try{const{invoke:g}=((o=window.__TAURI__)==null?void 0:o.core)||await B(()=>Promise.resolve().then(()=>ee),void 0),b=new Date,E=new Date(b.getTime()+10080*60*1e3),T=b.toISOString().replace("T"," ").substring(0,19),y=E.toISOString().replace("T"," ").substring(0,19),M=await g("generar_firma_licencia",{fechaUltimoSync:T,fechaExpiracion:y,ventasDesdeSync:0});await w("UPDATE rv_licencia_local SET fecha_ultimo_sync=$1, fecha_expiracion=$2, ventas_desde_sync=$3, firma_digital=$4 WHERE id=1",[T,y,0,M]),console.log("[Licencia] Renovada hasta:",y)}catch(g){throw console.error("No se pudo renovar la licencia:",g),new Error("Sincronización exitosa, pero falló la renovación de licencia. Contacte a soporte.")}const m=Object.values(d).reduce((g,b)=>g+(b.upsertados??0),0),h=Object.keys(d).length;t.className="sync-result success",t.innerHTML=`<strong><i class="fas fa-check-circle"></i> Sincronización exitosa</strong><br>
            Backup completo enviado (${h} tablas, ${r.length} lotes). ${m} registros sincronizados en la nube.<br>
            <strong><i class="fas fa-lock"></i> Licencia extendida por 7 días más.</strong>`,t.style.display="block"}catch(s){["ventas","caja","gastos"].forEach(l=>{const v=document.getElementById(`status-${l}`);v&&(v.innerHTML='<i class="fas fa-times-circle"></i>',v.className="sync-table-status err")});const c=((i=s.message)==null?void 0:i.includes("aborted"))||((n=s.message)==null?void 0:n.includes("Tiempo de espera"))||s.name==="AbortError"?"Tiempo de espera agotado (2 min). La conexión es lenta o el servidor no respondió. Intenta de nuevo con mejor señal.":s.message;t.className="sync-result error",t.innerHTML=`<strong><i class="fas fa-times-circle"></i> Error de sincronización</strong><br>${c}`,t.style.display="block"}finally{e.disabled=!1,e.innerHTML='<i class="fas fa-sync-alt"></i> Sincronizar Ahora'}}async function ua(e){ma("salidas-css","/assets/css/salidas_efectivo.css"),z(e,"salidas_efectivo",va()),fa.init()}function ma(e,t){if(document.getElementById(e))return;const a=document.createElement("link");a.id=e,a.rel="stylesheet",a.href=t,document.head.appendChild(a)}function va(){return`
<div class="sal-container">
  <div class="sal-header">
    <div>
      <h1 class="sal-title"><i class="fas fa-hand-holding-usd"></i> Salidas</h1>
      <p class="sal-subtitle">Registro de gastos operativos (efectivo afecta el corte de caja)</p>
    </div>
    <button class="sal-btn-nueva" id="btnNuevaSalida">
      <i class="fa fa-plus"></i> Nueva Salida
    </button>
  </div>

  <!-- Tabla de salidas -->
  <div class="sal-table-card">
    <div id="sal-lista">
      <p class="sal-placeholder">Cargando...</p>
    </div>
  </div>
</div>

<!-- MODAL: Nueva Salida -->
<div class="sal-modal-overlay" id="sal-modal-nueva">
  <div class="sal-modal">
    <div class="sal-modal-header">
      <h5><i class="fa fa-minus-circle" style="color:#e17055;"></i> Registrar Salida</h5>
      <button class="sal-modal-close" id="sal-close-nueva">&times;</button>
    </div>
    <div class="sal-modal-body">
      <div class="sal-form-group">
        <label>Tipo de Pago</label>
        <div class="sal-metodo-btns">
          <button class="sal-metodo-btn active" data-metodo="efectivo">
            <i class="fa fa-wallet"></i> Efectivo
          </button>
          <button class="sal-metodo-btn" data-metodo="tarjeta">
            <i class="fa fa-credit-card"></i> Tarjeta
          </button>
          <button class="sal-metodo-btn" data-metodo="transferencia">
            <i class="fa fa-exchange-alt"></i> Transferencia
          </button>
        </div>
        <p class="sal-metodo-hint" id="salMetodoHint">Afecta el balance de efectivo en caja</p>
      </div>
      <div class="sal-form-group">
        <label>Monto ($)</label>
        <input type="number" id="salMonto" min="0.01" step="0.01" placeholder="0.00" class="sal-input">
      </div>
      <div class="sal-form-group">
        <label>Motivo / Descripción</label>
        <input type="text" id="salMotivo" placeholder="Ej: Compra de insumos, Pago a proveedor..." class="sal-input" maxlength="200">
      </div>
    </div>
    <div class="sal-modal-footer">
      <button class="sal-btn sal-btn-cancel" id="sal-cancelar-nueva">Cancelar</button>
      <button class="sal-btn sal-btn-confirm" id="sal-confirmar-nueva">
        <i class="fa fa-check"></i> Registrar
      </button>
    </div>
  </div>
</div>
`}const fa={metodoPago:"efectivo",async init(){this.metodoPago="efectivo",this.bindEvents(),await this.cargarSalidas()},bindEvents(){var e,t,a,o,i;(e=document.getElementById("btnNuevaSalida"))==null||e.addEventListener("click",()=>this.abrirModal()),(t=document.getElementById("sal-close-nueva"))==null||t.addEventListener("click",()=>this.cerrarModal()),(a=document.getElementById("sal-cancelar-nueva"))==null||a.addEventListener("click",()=>this.cerrarModal()),(o=document.getElementById("sal-confirmar-nueva"))==null||o.addEventListener("click",()=>this.registrarSalida()),(i=document.getElementById("sal-modal-nueva"))==null||i.addEventListener("click",n=>{n.target.id==="sal-modal-nueva"&&this.cerrarModal()}),document.querySelectorAll(".sal-metodo-btn").forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(".sal-metodo-btn").forEach(r=>r.classList.remove("active")),n.classList.add("active"),this.metodoPago=n.dataset.metodo;const s=document.getElementById("salMetodoHint");s&&(s.textContent=this.metodoPago==="efectivo"?"Afecta el balance de efectivo en caja":"No afecta el balance de efectivo en caja")})})},async cargarSalidas(){const e=document.getElementById("sal-lista");if(e)try{const t=await f(`SELECT id, fecha, descripcion, precio_unitario, metodo_pago
         FROM rv_gastos
         WHERE tipo_gasto = 'Salida de Efectivo'
         ORDER BY fecha DESC
         LIMIT 100`);if(!t.length){e.innerHTML='<p class="sal-placeholder">No hay salidas registradas aún.</p>';return}const a=i=>!i||i==="efectivo"?'<span class="sal-badge sal-badge-efectivo"><i class="fa fa-wallet"></i> Efectivo</span>':i==="tarjeta"?'<span class="sal-badge sal-badge-tarjeta"><i class="fa fa-credit-card"></i> Tarjeta</span>':'<span class="sal-badge sal-badge-transferencia"><i class="fa fa-exchange-alt"></i> Transf.</span>';let o=`
      <table class="sal-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Motivo</th>
            <th>Tipo</th>
            <th style="text-align:right;">Monto</th>
          </tr>
        </thead>
        <tbody>
      `;for(const i of t){const n=i.fecha?new Date(i.fecha.replace(" ","T")).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}):"—";o+=`
          <tr>
            <td class="sal-td-fecha">${n}</td>
            <td>${i.descripcion||"—"}</td>
            <td>${a(i.metodo_pago)}</td>
            <td style="text-align:right; font-weight:700; color:#e17055;">-$${Number(i.precio_unitario).toFixed(2)}</td>
          </tr>`}o+="</tbody></table>",e.innerHTML=o}catch(t){e.innerHTML=`<p class="sal-placeholder" style="color:#dc3545;">Error al cargar: ${t.message}</p>`}},abrirModal(){var t,a;this.metodoPago="efectivo",document.querySelectorAll(".sal-metodo-btn").forEach(o=>o.classList.remove("active")),(t=document.querySelector('.sal-metodo-btn[data-metodo="efectivo"]'))==null||t.classList.add("active");const e=document.getElementById("salMetodoHint");e&&(e.textContent="Afecta el balance de efectivo en caja"),document.getElementById("salMonto").value="",document.getElementById("salMotivo").value="",(a=document.getElementById("sal-modal-nueva"))==null||a.classList.add("active"),setTimeout(()=>{var o;return(o=document.getElementById("salMonto"))==null?void 0:o.focus()},100)},cerrarModal(){var e;(e=document.getElementById("sal-modal-nueva"))==null||e.classList.remove("active")},async registrarSalida(){var a,o,i,n;const e=parseFloat((a=document.getElementById("salMonto"))==null?void 0:a.value)||0,t=((o=document.getElementById("salMotivo"))==null?void 0:o.value.trim())||"";if(e<=0){this.showAlert("Ingresa un monto válido mayor a $0.","warning");return}if(!t){this.showAlert("Escribe el motivo de la salida.","warning");return}try{if(!(await f("SELECT id FROM rv_apertura_caja WHERE estatus = 'activa' LIMIT 1")).length){this.showAlert("No hay una caja activa. Abre la caja antes de registrar salidas.","warning");return}}catch{}try{const s=((i=window._session)==null?void 0:i.usu_id)||((n=window._session)==null?void 0:n.emp_id)||1,r=new Date().getTimezoneOffset()*6e4,c=new Date(Date.now()-r).toISOString().replace("T"," ").substring(0,19);await w(`INSERT INTO rv_gastos (tipo_gasto, descripcion, precio_unitario, fecha, metodo_pago, tipo, usu_id)
         VALUES ('Salida de Efectivo', $1, $2, $3, $4, 'operativo', $5)`,[t,e,c,this.metodoPago,s]),this.showAlert(`Salida de $${e.toFixed(2)} registrada correctamente.`,"success"),this.cerrarModal(),await this.cargarSalidas()}catch(s){this.showAlert("Error al registrar: "+(s.message||s),"error")}},showAlert(e,t){window.showToast?window.showToast(e,t==="error"?"red":t==="warning"?"orange":"green"):alert(e)}},R=document.getElementById("app"),ga={"/login":()=>we(R),"/dashboard":()=>Pe(R),"/cierre_caja":()=>ht(R),"/caja":()=>xt(R),"/productos":()=>St(R),"/comanda":()=>jt(R),"/reportes":()=>Ft(R),"/devoluciones":()=>Gt(R),"/token":()=>Kt(R),"/empleados":()=>ea(R),"/sincronizacion":()=>ia(R),"/salidas_efectivo":()=>ua(R)};async function Ae(e){var a;if(console.log("[Router] navigate →",e,"| session:",!!window._session),e!=="/login"&&!window._session){console.warn("[Router] Sin sesión, redirigiendo a login"),we(R);return}const t=ga[e];if(!t){console.warn("[Router] Ruta no encontrada:",e,"→ login"),we(R);return}try{await t()}catch(o){console.error("[Router] Error al renderizar:",e,o),R.innerHTML=`
      <div style="padding:40px;font-family:monospace;background:#1e293b;color:#f87171;min-height:100vh;">
        <h2 style="color:#fb923c;">❌ Error al cargar: ${e}</h2>
        <pre style="background:#0f172a;padding:20px;border-radius:8px;overflow:auto;color:#fca5a5;">${(o==null?void 0:o.stack)||(o==null?void 0:o.message)||String(o)}</pre>
        <button id="btn-err-login"
          style="margin-top:20px;padding:10px 24px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;">
          ← Volver al Login
        </button>
      </div>`,(a=document.getElementById("btn-err-login"))==null||a.addEventListener("click",()=>window.navigateTo("/login"))}}let ke=!1;window.navigateTo=async e=>{ke=!0,location.hash=e,await Ae(e)};window.addEventListener("hashchange",()=>{if(ke){ke=!1;return}const e=location.hash.slice(1)||"/login";console.log("[Router] hashchange →",e),Ae(e)});(async()=>{console.log("[Router] Iniciando app..."),await at(),console.log("[Router] DB lista");const e=location.hash.slice(1)||"/login";await Ae(e)})();export{Fe as C,et as R,U as i};
