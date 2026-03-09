<?php
require_once("../includes/auth_check.php");
require_once("../config/conexion.php");
require_once("../models/Productos.php");
require_once("../models/Categorias.php");

$productos_model = new Productos();
$categorias_model = new Categorias();
$lista_productos = $productos_model->get_productos();
$lista_categorias = $categorias_model->get_categorias();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Inventario</title>

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- DataTables -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
    <!-- SweetAlert2 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/productos.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="../css/bottom_nav_bar.css">

    <style>
        /* Estilos para las pestañas */
        .nav-tabs {
            border: none;
            background: white;
            border-radius: 12px;
            padding: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .nav-tabs .nav-link {
            border: none;
            color: #6c757d;
            font-weight: 600;
            font-size: 1.1rem;
            padding: 1rem 2rem;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .nav-tabs .nav-link:hover {
            background: #f8f9fa;
            color: #4a90e2;
        }

        .nav-tabs .nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #4b6ca2 100%);
            color: white;
        }

        .nav-tabs .nav-link i {
            margin-right: 0.5rem;
        }
    </style>
</head>

<body>

    <?php include_once '../includes/bottom_nav_bar.php'; ?>

    <div class="container-fluid p-4">
        <!-- Header -->
        <div class="header-section mb-4">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1 class="page-title">
                        <i class="fas fa-warehouse"></i> Inventario
                    </h1>
                    <p class="text-muted">Gestiona productos e insumos</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <button class="btn btn-primary btn-lg btn-action" id="btn-nuevo-item">
                        <i class="fas fa-plus-circle"></i> Nuevo
                    </button>
                    <button class="btn btn-secondary btn-lg btn-action ms-2" data-bs-toggle="modal"
                        data-bs-target="#modalCategorias">
                        <i class="fas fa-tags"></i> Categorías
                    </button>
                    <button class="btn btn-outline-success btn-lg btn-action ms-2" id="btn-nuevo-insumo-directo">
                        <i class="fas fa-seedling"></i> Nuevo Insumo
                    </button>
                </div>
            </div>
        </div>

        <!-- TABS: Productos e Insumos -->
        <ul class="nav nav-tabs nav-fill mb-4" id="inventarioTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="productos-tab" data-bs-toggle="tab"
                    data-bs-target="#productos-content" type="button">
                    <i class="fas fa-box"></i> Productos
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="insumos-tab" data-bs-toggle="tab" data-bs-target="#insumos-content"
                    type="button">
                    <i class="fas fa-boxes"></i> Insumos
                </button>
            </li>
        </ul>

        <!-- CONTENIDO DE LAS TABS -->
        <div class="tab-content" id="inventarioTabsContent">

            <!-- TAB: PRODUCTOS -->
            <div class="tab-pane fade show active" id="productos-content" role="tabpanel">
                <?php include 'productos_tab_content.php'; ?>
            </div>

            <!-- TAB: INSUMOS -->
            <div class="tab-pane fade" id="insumos-content" role="tabpanel">
                <?php include 'insumos_tab_content.php'; ?>
            </div>

        </div>
    </div>


<!-- Modal Editar Producto -->
<div class="modal fade" id="modalEditarProducto" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-edit"></i> Editar Producto</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="form-editar-producto">
                <input type="hidden" name="id" id="edit-id">
                <div class="modal-body">
                    <div class="row g-3">
                        <!-- Información básica del producto -->
                        <div class="col-12">
                            <h6 class="text-primary"><i class="fas fa-info-circle"></i> Información del Producto</h6>
                            <hr>
                        </div>

                        <div class="col-md-12">
                            <label class="form-label">Nombre del Producto</label>
                            <input type="text" name="pr_nombre" id="edit-nombre"
                                class="form-control form-control-lg" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Categoría</label>
                            <select name="categoria_id" id="edit-categoria" class="form-select form-select-lg">
                                <option value="">Sin categoría</option>
                                <?php foreach ($lista_categorias as $cat): ?>
                                    <option value="<?= $cat['id'] ?>"><?= $cat['nombre'] ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Stock</label>
                            <div class="input-group">
                                <input type="number" name="pr_stock" id="edit-stock"
                                    class="form-control form-control-lg">
                                <div class="input-group-text">
                                    <input type="checkbox" id="edit-sin-stock" class="form-check-input mt-0">
                                    <label class="form-check-label ms-2" for="edit-sin-stock">Sin stock</label>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Precio Compra</label>
                            <input type="number" name="pr_preciocompra" id="edit-precio-compra"
                                class="form-control form-control-lg" step="0.01" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Precio Venta</label>
                            <input type="number" name="pr_preciooriginal" id="edit-precio-venta"
                                class="form-control form-control-lg" step="0.01" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Promoción (%)</label>
                            <input type="number" name="pr_promocion_porcentaje" id="edit-promocion"
                                class="form-control form-control-lg" min="0" max="100" value="0">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Estado</label>
                            <select name="pr_estatus" id="edit-estatus" class="form-select form-select-lg">
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Favorito</label>
                            <select name="pr_favorito" id="edit-favorito" class="form-select form-select-lg">
                                <option value="0">No</option>
                                <option value="1">Sí</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <span id="edit-info-precio-final">Precio final: $0.00</span> |
                                <span id="edit-info-utilidad">Utilidad: $0.00</span>
                            </div>
                        </div>

                        <!-- Sección de Insumos -->
                        <div class="col-12 mt-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="text-primary mb-0"><i class="fas fa-boxes"></i> Insumos Requeridos</h6>
                                <button type="button" class="btn btn-sm btn-primary" id="btn-abrir-selector-edit">
                                    <i class="fas fa-plus"></i> Agregar Insumo
                                </button>
                            </div>
                            <hr>
                        </div>

                        <div class="col-12">
                            <div id="contenedor-insumos-edit"
                                style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; background: #f8f9fa;">
                                <p class="text-muted text-center mb-0">No hay insumos agregados</p>
                            </div>
                        </div>

                        <!-- ✅ NUEVO: Sección de Componentes de Producto -->
                        <div class="col-12 mt-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="text-success mb-0"><i class="fas fa-cubes"></i> Componentes (Paquetes/Órdenes)</h6>
                                <button type="button" class="btn btn-sm btn-success" id="btn-abrir-selector-componente-edit">
                                    <i class="fas fa-plus"></i> Agregar Componente
                                </button>
                            </div>
                            <hr>
                            <small class="text-muted">
                                <i class="fas fa-info-circle"></i>
                                Usa componentes para crear paquetes. Ej: "Tostitos Preparados" que descuenta sus ingredientes del inventario.
                            </small>
                        </div>

                        <div class="col-12">
                            <div id="contenedor-componentes-edit"
                                style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; background: #f8f9fa;">
                                <p class="text-muted text-center mb-0">No hay componentes agregados</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger btn-lg" id="btn-eliminar-modal">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                    <button type="button" class="btn btn-secondary btn-lg" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-save"></i> Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>



    <!-- Modal Categorías -->
    <div class="modal fade" id="modalCategorias" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="fas fa-tags"></i> Gestión de Categorías</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="form-nueva-categoria" class="mb-4">
                        <div class="input-group input-group-lg">
                            <input type="text" name="nombre" class="form-control" placeholder="Nueva categoría..."
                                required>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Agregar
                            </button>
                        </div>
                    </form>
                    <div class="lista-categorias">
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Categoría</th>
                                        <th width="100">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tabla-categorias">
                                    <?php foreach ($lista_categorias as $cat): ?>
                                        <tr>
                                            <td><?= $cat['nombre'] ?></td>
                                            <td>
                                                <button class="btn btn-sm btn-danger btn-eliminar-categoria"
                                                    data-id="<?= $cat['id'] ?>">
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
            </div>
        </div>
    </div>



<!-- Modal Nuevo Producto -->
<div class="modal fade" id="modalNuevoProducto" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fas fa-plus-circle"></i> Nuevo Producto</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="form-nuevo-producto">
                <div class="modal-body">
                    <div class="row g-3">
                        <!-- Información básica -->
                        <div class="col-12">
                            <h6 class="text-primary"><i class="fas fa-info-circle"></i> Información del Producto</h6>
                            <hr>
                        </div>

                        <div class="col-md-12">
                            <label class="form-label">Nombre del Producto</label>
                            <input type="text" name="pr_nombre" class="form-control form-control-lg" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Categoría</label>
                            <select name="categoria_id" class="form-select form-select-lg">
                                <option value="">Sin categoría</option>
                                <?php foreach ($lista_categorias as $cat): ?>
                                    <option value="<?= $cat['id'] ?>"><?= $cat['nombre'] ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Stock</label>
                            <div class="input-group">
                                <input type="number" name="pr_stock" id="nuevo-stock"
                                    class="form-control form-control-lg">
                                <div class="input-group-text">
                                    <input type="checkbox" id="nuevo-sin-stock" class="form-check-input mt-0">
                                    <label class="form-check-label ms-2" for="nuevo-sin-stock">Sin stock</label>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Precio Compra</label>
                            <input type="number" name="pr_preciocompra" id="nuevo-precio-compra"
                                class="form-control form-control-lg" step="0.01" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Precio Venta</label>
                            <input type="number" name="pr_preciooriginal" id="nuevo-precio-venta"
                                class="form-control form-control-lg" step="0.01" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Promoción (%)</label>
                            <input type="number" name="pr_promocion_porcentaje" id="nuevo-promocion"
                                class="form-control form-control-lg" min="0" max="100" value="0">
                        </div>
                        <div class="col-12">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <span id="info-precio-final">Precio final: $0.00</span> |
                                <span id="info-utilidad">Utilidad: $0.00</span>
                            </div>
                        </div>

                        <!-- Sección de Insumos -->
                        <div class="col-12 mt-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="text-primary mb-0"><i class="fas fa-boxes"></i> Insumos Requeridos</h6>
                                <button type="button" class="btn btn-sm btn-primary" id="btn-abrir-selector-nuevo">
                                    <i class="fas fa-plus"></i> Agregar Insumo
                                </button>
                            </div>
                            <hr>
                        </div>

                        <div class="col-12">
                            <div id="contenedor-insumos-nuevo"
                                style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; background: #f8f9fa;">
                                <p class="text-muted text-center mb-0">No hay insumos agregados</p>
                            </div>
                        </div>

                        <!-- ✅ NUEVO: Sección de Componentes de Producto -->
                        <div class="col-12 mt-4">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="text-success mb-0"><i class="fas fa-cubes"></i> Componentes (Paquetes/Órdenes)</h6>
                                <button type="button" class="btn btn-sm btn-success" id="btn-abrir-selector-componente-nuevo">
                                    <i class="fas fa-plus"></i> Agregar Componente
                                </button>
                            </div>
                            <hr>
                            <small class="text-muted">
                                <i class="fas fa-info-circle"></i>
                                Usa componentes para crear paquetes. Ej: "Tostitos Preparados" que descuenta sus ingredientes del inventario.
                            </small>
                        </div>

                        <div class="col-12">
                            <div id="contenedor-componentes-nuevo"
                                style="max-height: 300px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; background: #f8f9fa;">
                                <p class="text-muted text-center mb-0">No hay componentes agregados</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-lg" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary btn-lg">
                        <i class="fas fa-save"></i> Guardar Producto
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>


    <!-- Modal Agregar Insumo al Producto -->
    <div class="modal fade" id="modalAgregarInsumoProducto" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="fas fa-plus-circle"></i> Seleccionar Insumo</h5>
                    <button type="button" class="btn-close" onclick="cerrarModalInsumos()"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="tipo-modal-insumo">

                    <!-- Buscador -->
                    <div class="mb-3">
                        <input type="text" id="buscar-insumo-selector" class="form-control form-control-lg"
                            placeholder="Buscar insumo...">
                    </div>

                    <!-- Grid de cards de insumos -->
                    <div id="grid-insumos-disponibles" style="max-height: 400px; overflow-y: auto;">
                        <!-- Se llenará dinámicamente con JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- Modal Nuevo Insumo -->
    <div class="modal fade" id="modalNuevoInsumo" tabindex="-1" data-bs-backdrop="static">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content modal-insumo">
                <div class="modal-header modal-header-success">
                    <h5 class="modal-title"><i class="fas fa-seedling me-2"></i> Registrar nuevo insumo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="form-nuevo-insumo">
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Nombre *</label>
                                <input type="text" name="nombre" id="nuevo-insumo-nombre" class="form-control form-control-lg" placeholder="Ej. Cilantro" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Unidad de medida *</label>
                                <select name="unidad_medida" id="nuevo-insumo-unidad" class="form-select form-select-lg" required>
                                    <option value="">Selecciona una unidad</option>
                                    <option value="unidad">Unidad</option>
                                    <option value="paquete">Paquete</option>
                                    <option value="caja">Caja</option>
                                    <option value="kg">Kilogramo</option>
                                    <option value="g">Gramos</option>
                                    <option value="litro">Litro</option>
                                    <option value="ml">Mililitros</option>
                                    <option value="pieza">Pieza</option>
                                </select>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Descripción</label>
                                <textarea name="descripcion" id="nuevo-insumo-descripcion" class="form-control" rows="2" placeholder="Detalle o nota opcional"></textarea>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Stock actual</label>
                                <input type="number" name="stock_actual" id="nuevo-insumo-stock" class="form-control form-control-lg" min="0" step="0.01" value="0">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Stock mínimo *</label>
                                <input type="number" name="stock_minimo" id="nuevo-insumo-minimo" class="form-control form-control-lg" min="0" step="0.01" value="0" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Costo unitario *</label>
                                <div class="input-group input-group-lg">
                                    <span class="input-group-text">$</span>
                                    <input type="number" name="costo_unitario" id="nuevo-insumo-costo" class="form-control" min="0" step="0.01" value="0" required>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="alert alert-success mb-0">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Estos valores se guardarán directamente en la tabla <strong>rv_insumos</strong>.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary btn-lg" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-success btn-lg">
                            <i class="fas fa-save"></i> Guardar Insumo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>


    <!-- Modal Editar Insumo -->
    <div class="modal fade" id="modalEditarInsumo" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="fas fa-edit"></i> Editar Insumo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="form-editar-insumo">
                    <input type="hidden" name="id" id="edit-insumo-id">
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-12">
                                <label class="form-label">Nombre del Insumo</label>
                                <input type="text" name="nombre" id="edit-insumo-nombre"
                                    class="form-control form-control-lg" required>
                            </div>
                            <div class="col-md-12">
                                <label class="form-label">Descripción</label>
                                <textarea name="descripcion" id="edit-insumo-descripcion" class="form-control"
                                    rows="2"></textarea>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Unidad de Medida</label>
                                <select name="unidad_medida" id="edit-insumo-unidad" class="form-select form-select-lg"
                                    required>
                                    <option value="unidad">Unidad</option>
                                    <option value="paquete">Paquete</option>
                                    <option value="caja">Caja</option>
                                    <option value="kg">Kilogramo</option>
                                    <option value="litro">Litro</option>
                                    <option value="pieza">Pieza</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Stock Mínimo</label>
                                <input type="number" name="stock_minimo" id="edit-insumo-minimo"
                                    class="form-control form-control-lg" step="0.01" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label">Costo Unitario</label>
                                <input type="number" name="costo_unitario" id="edit-insumo-costo"
                                    class="form-control form-control-lg" step="0.01" required>
                            </div>
                            <div class="col-md-12">
                                <label class="form-label">Estado</label>
                                <select name="estatus" id="edit-insumo-estatus" class="form-select form-select-lg">
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-danger btn-lg" id="btn-eliminar-insumo-modal">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                        <button type="button" class="btn btn-secondary btn-lg" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Entrada de Stock -->
    <div class="modal fade" id="modalEntradaStock" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"><i class="fas fa-plus-circle"></i> Registrar Entrada</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form id="form-entrada-stock">
                    <input type="hidden" name="insumo_id" id="entrada-insumo-id">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Insumo</label>
                            <input type="text" id="entrada-insumo-nombre" class="form-control form-control-lg" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Cantidad</label>
                            <input type="number" name="cantidad" class="form-control form-control-lg" step="0.01"
                                required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Motivo</label>
                            <input type="text" name="motivo" class="form-control form-control-lg"
                                value="Compra de insumos" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary btn-lg" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-success btn-lg">
                            <i class="fas fa-check"></i> Registrar Entrada
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>


    <!-- Modal Agregar Componente al Producto -->
<div class="modal fade" id="modalAgregarComponenteProducto" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-success text-white">
                <h5 class="modal-title"><i class="fas fa-cubes"></i> Seleccionar Producto Componente</h5>
                <button type="button" class="btn-close btn-close-white" onclick="cerrarModalComponentes()"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="tipo-modal-componente">

                <!-- Buscador -->
                <div class="mb-3">
                    <input type="text" id="buscar-componente-selector" class="form-control form-control-lg"
                        placeholder="Buscar producto...">
                </div>

                <!-- Grid de cards de productos -->
                <div id="grid-componentes-disponibles" style="max-height: 400px; overflow-y: auto;">
                    <!-- Se llenará dinámicamente con JavaScript -->
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal sencillo para ver ingredientes vinculados -->
<div class="modal fade" id="modalVerIngredientes" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalIngredientesTitulo"><i class="fas fa-carrot text-warning"></i> Ingredientes del producto</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div id="lista-ingredientes-modal" class="text-center text-muted">
                    Selecciona un producto para ver sus ingredientes.
                </div>
            </div>
        </div>
    </div>
</div>


    <?php include("../includes/scripts.php"); ?>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        (function () {
            const TAB_KEY = 'inventarioActiveTab';
            const SCROLL_KEY = 'inventarioScrollPosition';

            window.saveInventarioStateAndReload = function () {
                const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
                sessionStorage.setItem(SCROLL_KEY, scrollTop);

                const activeTab = document.querySelector('#inventarioTabs .nav-link.active');
                if (activeTab) {
                    const target = activeTab.getAttribute('data-bs-target');
                    if (target) {
                        localStorage.setItem(TAB_KEY, target);
                    }
                }

                window.location.reload();
            };

            document.addEventListener('DOMContentLoaded', function () {
                const savedTab = localStorage.getItem(TAB_KEY);
                if (savedTab) {
                    const trigger = document.querySelector(`#inventarioTabs button[data-bs-target="${savedTab}"]`);
                    if (trigger) {
                        const tab = new bootstrap.Tab(trigger);
                        tab.show();
                    }
                }

                document.querySelectorAll('#inventarioTabs button[data-bs-toggle="tab"]').forEach((btn) => {
                    btn.addEventListener('shown.bs.tab', function (event) {
                        const target = event.target.getAttribute('data-bs-target');
                        if (target) {
                            localStorage.setItem(TAB_KEY, target);
                        }
                    });
                });

                const savedScroll = sessionStorage.getItem(SCROLL_KEY);
                if (savedScroll !== null) {
                    window.scrollTo(0, parseInt(savedScroll, 10));
                    sessionStorage.removeItem(SCROLL_KEY);
                }
            });
        })();
    </script>
    <script src="../js/productos.js?v=<?php echo time(); ?>"></script>
    <script src="../js/insumos.js?v=<?php echo time(); ?>"></script>

    <script>
        // Controlar el botón "Nuevo" según la pestaña activa
        $(document).ready(function () {
            $('#btn-nuevo-item').click(function () {
                const activeTab = $('.nav-link.active').attr('id');
                if (activeTab === 'productos-tab') {
                    $('#modalNuevoProducto').modal('show');
                } else {
                    $('#modalNuevoInsumo').modal('show');
                }
            });
        });
    </script>
</body>

</html>
