-- Inserta el producto "Orden Mixta" con precio base $0 para habilitar la mezcla personalizada.
-- Se asegura de que la categoría "Platillos" exista y reutiliza su ID si ya está creada.

SET @platillos_id := (SELECT id FROM rv_categorias WHERE nombre = 'Platillos' LIMIT 1);

INSERT INTO rv_categorias (nombre, descripcion)
SELECT 'Platillos', 'Platillos fuertes'
WHERE @platillos_id IS NULL;

SET @platillos_id := COALESCE(@platillos_id, (SELECT id FROM rv_categorias WHERE nombre = 'Platillos' LIMIT 1), 1);

INSERT INTO rv_productos (
    pr_nombre,
    pr_precioventa,
    pr_preciocompra,
    categoria_id,
    sucursal_id,
    pr_estatus,
    es_platillo,
    pr_favorito
)
SELECT
    'Orden Mixta',
    0.00,
    0.00,
    @platillos_id,
    1,
    1,
    1,
    0
WHERE NOT EXISTS (
    SELECT 1 FROM rv_productos WHERE pr_nombre = 'Orden Mixta'
);
