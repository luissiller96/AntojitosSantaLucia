-- 1. Insert Categories
INSERT INTO rv_categorias (id, nombre, descripcion) VALUES 
(1, 'Platillos', 'Platillos fuertes'),
(2, 'Adicionales', 'Guarniciones y extras'),
(3, 'Bebidas', 'Refrescos y aguas');

-- 2. Insert Products (Platillos) - Categoria 1
-- Note: 'es_platillo' = 1 means it's a prepared dish, not a simple retail item
INSERT INTO rv_productos 
(pr_nombre, pr_precioventa, pr_preciocompra, categoria_id, sucursal_id, pr_estatus, es_platillo) 
VALUES
('Enchiladas (6 pzs) - Sin cebolla', 90.00, 0.00, 1, 1, 1, 1),
('Enchiladas (6 pzs) - Con cebolla', 90.00, 0.00, 1, 1, 1, 1),
('Flautas de Res (5 pzs)', 90.00, 0.00, 1, 1, 1, 1),
('Tacos Dorados de Deshebrada (5 pzs)', 90.00, 0.00, 1, 1, 1, 1),
('Tacos Suaves de Deshebrada (5 pzs)', 90.00, 0.00, 1, 1, 1, 1),
('Sopes de Chicharrón (4 pzs)', 90.00, 0.00, 1, 1, 1, 1),
('Sopes de Deshebrada (4 pzs)', 90.00, 0.00, 1, 1, 1, 1),
('Sopes de Picadillo (4 pzs)', 90.00, 0.00, 1, 1, 1, 1),
('Sopes de Frijoles con Queso (4 pzs)', 90.00, 0.00, 1, 1, 1, 1);
-- Producto base para personalizar la mezcla
INSERT INTO rv_productos 
(pr_nombre, pr_precioventa, pr_preciocompra, categoria_id, sucursal_id, pr_estatus, es_platillo) 
VALUES
('Orden Mixta', 0.00, 0.00, 1, 1, 1, 1);

-- 3. Insert Products (Adicionales) - Categoria 2
INSERT INTO rv_productos 
(pr_nombre, pr_precioventa, pr_preciocompra, categoria_id, sucursal_id, pr_estatus, es_platillo) 
VALUES
('Orden de Papa', 40.00, 0.00, 2, 1, 1, 1),
('Guacamole Extra', 20.00, 0.00, 2, 1, 1, 1);

-- 4. Insert Products (Bebidas) - Categoria 3
-- Note: 'es_platillo' = 0 means it's a retail item (stock tracking)
INSERT INTO rv_productos 
(pr_nombre, pr_precioventa, pr_preciocompra, categoria_id, sucursal_id, pr_estatus, es_platillo, pr_stock) 
VALUES
('Refresco', 25.00, 0.00, 3, 1, 1, 0, 100);
