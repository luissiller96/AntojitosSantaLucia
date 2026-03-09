SET FOREIGN_KEY_CHECKS = 0;

-- Ventas y comandas
TRUNCATE TABLE rv_ventas;
TRUNCATE TABLE rv_comanda;

-- Caja
TRUNCATE TABLE rv_apertura_caja;
TRUNCATE TABLE rv_gastos;
TRUNCATE TABLE rv_devoluciones;

-- Productos y parámetros
TRUNCATE TABLE rv_producto_componentes;
TRUNCATE TABLE rv_producto_insumos;
TRUNCATE TABLE rv_productos;
TRUNCATE TABLE rv_categorias;

-- Insumos e Inventario
TRUNCATE TABLE rv_movimientos_insumos;
TRUNCATE TABLE rv_insumos;

SET FOREIGN_KEY_CHECKS = 1;
