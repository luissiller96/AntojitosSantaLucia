/**
 * database.js
 * Capa de abstracción para SQLite via tauri-plugin-sql.
 * Reemplaza config/conexion.php
 */

import Database from '@tauri-apps/plugin-sql';

let db = null;

/**
 * Obtiene (o crea) la conexión singleton a la BD.
 */
export async function getDB() {
  if (!db) {
    db = await Database.load('sqlite:antojitos.db');
  }
  return db;
}

/**
 * Ejecuta una query SELECT y devuelve un array de filas.
 * @param {string} query  - SQL con placeholders $1, $2...
 * @param {Array}  params - Valores para los placeholders
 * @returns {Promise<Array>}
 */
export async function dbSelect(query, params = []) {
  const conn = await getDB();
  return await conn.select(query, params);
}

/**
 * Ejecuta INSERT / UPDATE / DELETE.
 * @returns {Promise<{rowsAffected: number, lastInsertId: number|null}>}
 */
export async function dbExecute(query, params = []) {
  const conn = await getDB();
  return await conn.execute(query, params);
}

/**
 * Inicializa el schema de la base de datos si no existe.
 * Se llama una vez al arrancar la app.
 */
export async function initDB() {
  const conn = await getDB();

  // Habilitar foreign keys en SQLite
  await conn.execute('PRAGMA foreign_keys = ON;');
  await conn.execute('PRAGMA journal_mode = WAL;');

  // Crear tablas si no existen
  await conn.execute(`
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
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS tm_empleado (
      emp_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_nombre TEXT NOT NULL,
      emp_puesto TEXT NOT NULL,
      emp_estatus INTEGER NOT NULL DEFAULT 1,
      usu_id     INTEGER,
      sucursal_id INTEGER DEFAULT 1,
      FOREIGN KEY (usu_id) REFERENCES tm_usuario(usu_id) ON DELETE CASCADE
    );
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_categorias (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre      TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      fecha_creacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_sucursales (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_sucursal  TEXT NOT NULL,
      direccion        TEXT,
      telefono         TEXT
    );
  `);

  await conn.execute(`
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
  `);

  await conn.execute(`
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
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_producto_insumos (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id       INTEGER NOT NULL,
      insumo_id         INTEGER NOT NULL,
      cantidad_necesaria REAL NOT NULL,
      UNIQUE (producto_id, insumo_id),
      FOREIGN KEY (producto_id) REFERENCES rv_productos(ID) ON DELETE CASCADE,
      FOREIGN KEY (insumo_id)   REFERENCES rv_insumos(id)   ON DELETE CASCADE
    );
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_producto_componentes (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_padre_id     INTEGER NOT NULL,
      producto_componente_id INTEGER NOT NULL,
      cantidad_necesaria    REAL NOT NULL,
      UNIQUE (producto_padre_id, producto_componente_id),
      FOREIGN KEY (producto_padre_id)      REFERENCES rv_productos(ID) ON DELETE CASCADE,
      FOREIGN KEY (producto_componente_id) REFERENCES rv_productos(ID) ON DELETE CASCADE
    );
  `);

  await conn.execute(`
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
  `);

  await conn.execute(`
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
  `);

  await conn.execute(`
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
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_config (
      id                             INTEGER PRIMARY KEY DEFAULT 1,
      last_comanda_update_timestamp  TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  await conn.execute(`
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
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_gastos_fijos_plantilla (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria    TEXT NOT NULL DEFAULT 'Otro',
      concepto     TEXT NOT NULL UNIQUE,
      monto_base   REAL NOT NULL DEFAULT 0,
      descripcion  TEXT,
      activo       INTEGER NOT NULL DEFAULT 1,
      fecha_creacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  await conn.execute(`
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
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_devoluciones (
      dev_id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id       INTEGER NOT NULL,
      motivo          TEXT NOT NULL,
      usu_id          INTEGER NOT NULL,
      fecha_devolucion TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_ingredientes (
      ingrediente_id  INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_ingrediente TEXT NOT NULL,
      categoria       TEXT,
      unidad_medida   TEXT,
      es_activo       INTEGER NOT NULL DEFAULT 1
    );
  `);

  await conn.execute(`
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
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS token_global (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      token  TEXT NOT NULL,
      fecha_actualizacion TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS rv_licencia_local (
      id                 INTEGER PRIMARY KEY DEFAULT 1,
      fecha_ultimo_sync  TEXT NOT NULL,
      fecha_expiracion   TEXT NOT NULL,
      ventas_desde_sync  INTEGER NOT NULL DEFAULT 0,
      firma_digital      TEXT NOT NULL
    );
  `);

  // ── Seeding por tabla (INSERT OR IGNORE = nunca rompe datos existentes) ──

  // Licencia inicial por defecto (válida instalable)
  try {
    const licExists = await conn.select("SELECT COUNT(*) as c FROM rv_licencia_local");
    if (!licExists || licExists[0].c === 0 || licExists[0].c === '0') {
      const { invoke } = window.__TAURI__?.core || await import('@tauri-apps/api/core');
      const hoy = new Date();
      const exp = new Date(hoy.getTime() + (7 * 24 * 60 * 60 * 1000));
      const f_sync = hoy.toISOString().replace('T', ' ').substring(0, 19);
      const f_exp = exp.toISOString().replace('T', ' ').substring(0, 19);
      const v_sync = 0;

      const f_init_sign = await invoke('generar_firma_licencia', {
        fechaUltimoSync: f_sync,
        fechaExpiracion: f_exp,
        ventasDesdeSync: v_sync
      });

      await conn.execute(`INSERT INTO rv_licencia_local 
        (id, fecha_ultimo_sync, fecha_expiracion, ventas_desde_sync, firma_digital) 
        VALUES (1, $1, $2, $3, $4)`,
        [f_sync, f_exp, v_sync, f_init_sign]
      );
    }
  } catch (e) { console.error("Error inicializando licencia:", e); }

  // Usuarios
  await conn.execute(`INSERT OR IGNORE INTO tm_usuario (usu_id, usu_nom, usu_ape, usu_pass, usu_empresa, usu_puesto, est) VALUES
    (1,'Antojitos','','4dmin','Antojitos Santa Lucía','Admin',1),
    (3,'caja',NULL,'c4j4','Antojitos Santa Lucía','Cajero',1)`);

  // Empleados
  await conn.execute(`INSERT OR IGNORE INTO tm_empleado (emp_id, emp_nombre, emp_puesto, emp_estatus, usu_id, sucursal_id) VALUES
    (1,'Los Regios','Admin',1,1,1),
    (7,'Caja','Cajero',1,NULL,1)`);

  // Sucursales
  await conn.execute(`INSERT OR IGNORE INTO rv_sucursales (id, nombre_sucursal, direccion) VALUES
    (1,'Mitras pte','Varenna 209, 66036 Mitras Poniente, N.L., México')`);

  // Categorías
  await conn.execute(`INSERT OR IGNORE INTO rv_categorias (id, nombre, descripcion) VALUES
    (1,'Platillos','Platillos fuertes'),
    (2,'Adicionales','Guarniciones y extras'),
    (3,'Bebidas','Refrescos y aguas'),
    (4,'Mixto',NULL)`);

  // 17 Productos reales del SQL
  await conn.execute(`INSERT OR IGNORE INTO rv_productos
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
    (17,'Enchilada (Mixta)',18,0,NULL,1,1,1,3,0,10)`);

  // Ingredientes
  await conn.execute(`INSERT OR IGNORE INTO rv_ingredientes (ingrediente_id,nombre_ingrediente,categoria,unidad_medida,es_activo) VALUES
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
    (13,'Papas fritas','Otros','gramos',1)`);

  // Apertura de caja histórica
  await conn.execute(`INSERT OR IGNORE INTO rv_apertura_caja
    (id,fecha_apertura,monto_apertura,usu_id,estatus)
    VALUES (2,'2026-02-25 19:53:42',500,1,'activa')`);

  // Ventas históricas
  await conn.execute(`INSERT OR IGNORE INTO rv_ventas
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
    (47,11,'2026-02-26 18:23:07',1,3,'Flautas de Res (5 pzs)',7,'efectivo',90,90,'','completado')`);

  // Corte preventivo histórico
  await conn.execute(`INSERT OR IGNORE INTO rv_gastos
    (id,tipo_gasto,descripcion,fecha,comentario,precio_unitario,tipo,metodo_pago,usu_id)
    VALUES (2,'Corte Preventivo','CORTE PREVENTIVO CAJA','2026-02-26 17:32:59','Realizado por: Caja',1500,'operativo','efectivo',1)`);

  // Config y token
  await conn.execute(`INSERT OR IGNORE INTO rv_config (id) VALUES (1)`);
  await conn.execute(`INSERT OR IGNORE INTO token_global (id, token) VALUES (1,'6376')`);


  // Migraciones: agregar columnas nuevas a rv_ventas si no existen
  const migraciones = [
    `ALTER TABLE rv_ventas ADD COLUMN tipo_orden TEXT DEFAULT 'llevar'`,
    `ALTER TABLE rv_ventas ADD COLUMN sensor_num TEXT`,
    `ALTER TABLE rv_ventas ADD COLUMN direccion TEXT`,
    `ALTER TABLE rv_ventas ADD COLUMN costo_envio REAL DEFAULT 0`,
    `ALTER TABLE rv_ventas ADD COLUMN monto_efectivo REAL DEFAULT 0`,
    `ALTER TABLE rv_ventas ADD COLUMN monto_tarjeta REAL DEFAULT 0`,
    `ALTER TABLE rv_ventas ADD COLUMN monto_transferencia REAL DEFAULT 0`,
  ];
  for (const sql of migraciones) {
    try { await conn.execute(sql); } catch (_) { /* columna ya existe */ }
  }

  console.log('[DB] Base de datos inicializada correctamente.');
}
