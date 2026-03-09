<!-- Filtros de Productos -->
<div class="filter-section card mb-4">
    <div class="card-body">
        <div class="row g-3">
            <div class="col-md-4">
                <div class="input-group input-group-lg">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" id="buscar-producto" class="form-control" placeholder="Buscar producto...">
                </div>
            </div>
            <div class="col-md-3">
                <select id="filtro-categoria" class="form-select form-select-lg">
                    <option value="">Todas las categorías</option>
                    <?php foreach($lista_categorias as $cat): ?>
                        <option value="<?= $cat['id'] ?>"><?= $cat['nombre'] ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-3">
                <select id="filtro-estado" class="form-select form-select-lg">
                    <option value="">Todos los estados</option>
                    <option value="1">Activos</option>
                    <option value="0">Inactivos</option>
                </select>
            </div>
            <div class="col-md-2">
                <button class="btn btn-outline-secondary btn-lg w-100" id="btn-limpiar-filtros">
                    <i class="fas fa-redo"></i> Limpiar
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Tabla de Productos -->
<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table id="tabla-productos" class="table table-hover">
                <thead>
                    <tr>
                        <th width="5%">ID</th>
                        <th width="25%">Producto</th>
                        <th width="15%">Categoría</th>
                        <th width="10%">Precio</th>
                        <th width="10%">Stock</th>
                        <th width="10%">Promoción</th>
                        <th width="10%">Estado</th>
                        <th width="15%">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach($lista_productos as $producto): ?>
                    <tr>
                        <td data-label="ID"><?= $producto['ID'] ?></td>
                        <td data-label="Producto">
                            <?php if($producto['pr_favorito'] == 1): ?>
                                <i class="fas fa-star text-warning"></i>
                            <?php endif; ?>
                            <?= $producto['pr_nombre'] ?>
                        </td>
                        <td data-label="Categoría">
                            <span class="badge bg-secondary"><?= $producto['pr_categoria'] ?? 'Sin categoría' ?></span>
                        </td>
                        <td data-label="Precio">
                            <?php if($producto['pr_promocion_porcentaje'] > 0): ?>
                                <span class="text-decoration-line-through text-muted">$<?= number_format($producto['pr_preciooriginal'], 2) ?></span><br>
                                <span class="text-success fw-bold">$<?= number_format($producto['pr_precioventa'], 2) ?></span>
                            <?php else: ?>
                                <span class="fw-bold">$<?= number_format($producto['pr_precioventa'], 2) ?></span>
                            <?php endif; ?>
                        </td>
                        <td data-label="Stock">
                            <?php if($producto['pr_stock'] === null): ?>
                                <span class="badge bg-info">Sin stock</span>
                            <?php elseif($producto['pr_stock'] <= 5): ?>
                                <span class="badge bg-danger"><?= $producto['pr_stock'] ?></span>
                            <?php elseif($producto['pr_stock'] <= 10): ?>
                                <span class="badge bg-warning"><?= $producto['pr_stock'] ?></span>
                            <?php else: ?>
                                <span class="badge bg-success"><?= $producto['pr_stock'] ?></span>
                            <?php endif; ?>
                        </td>
                        <td data-label="Promoción">
                            <?php if($producto['pr_promocion_porcentaje'] > 0): ?>
                                <span class="badge bg-danger"><?= $producto['pr_promocion_porcentaje'] ?>% OFF</span>
                            <?php else: ?>
                                <span class="text-muted">-</span>
                            <?php endif; ?>
                        </td>
                        <td data-label="Estado">
                            <?php if($producto['pr_estatus'] == 1): ?>
                                <span class="badge bg-success">

                                <span class="badge bg-success">Activo</span>
                            <?php else: ?>
                                <span class="badge bg-secondary">Inactivo</span>
                            <?php endif; ?>
                        </td>
                        <td data-label="Acciones">
                            <button class="btn btn-sm btn-secondary btn-ver-ingredientes me-1" 
                                    data-id="<?= $producto['ID'] ?>"
                                    data-nombre="<?= htmlspecialchars($producto['pr_nombre'], ENT_QUOTES, 'UTF-8') ?>">
                                <i class="fas fa-carrot"></i>
                            </button>
                            <button class="btn btn-sm btn-info btn-editar" 
                                    data-id="<?= $producto['ID'] ?>"
                                    data-nombre="<?= $producto['pr_nombre'] ?>"
                                    data-categoria-id="<?= $producto['categoria_id'] ?>"
                                    data-preciooriginal="<?= $producto['pr_preciooriginal'] ?>"
                                    data-precioventa="<?= $producto['pr_precioventa'] ?>"
                                    data-preciocompra="<?= $producto['pr_preciocompra'] ?>"
                                    data-stock="<?= $producto['pr_stock'] ?>"
                                    data-promocion="<?= $producto['pr_promocion_porcentaje'] ?>"
                                    data-estatus="<?= $producto['pr_estatus'] ?>"
                                    data-favorito="<?= $producto['pr_favorito'] ?>">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-eliminar" data-id="<?= $producto['ID'] ?>">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
