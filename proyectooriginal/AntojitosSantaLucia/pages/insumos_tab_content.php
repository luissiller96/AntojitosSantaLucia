<?php
require_once("../models/Insumos.php");
$insumos_model = new Insumos();
$lista_insumos = $insumos_model->get_insumos();
?>

<!-- Tabla de Insumos -->
<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table id="tabla-insumos" class="table table-hover">
                <thead>
                    <tr>
                        <th width="5%">ID</th>
                        <th width="20%">Insumo</th>
                        <th width="20%">Descripción</th>
                        <th width="10%">Unidad</th>
                        <th width="10%">Stock</th>
                        <th width="10%">Mínimo</th>
                        <th width="10%">Costo</th>
                        <th width="15%">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach($lista_insumos as $insumo): ?>
                    <?php
                        $nivel = '';
                        if ($insumo['stock_actual'] == 0) {
                            $nivel = 'agotado';
                        } elseif ($insumo['stock_actual'] <= ($insumo['stock_minimo'] * 0.5)) {
                            $nivel = 'critico';
                        } elseif ($insumo['stock_actual'] <= $insumo['stock_minimo']) {
                            $nivel = 'bajo';
                        }
                    ?>
                    <tr>
                        <td><?= $insumo['id'] ?></td>
                        <td><strong><?= $insumo['nombre'] ?></strong></td>
                        <td><?= $insumo['descripcion'] ?></td>
                        <td><span class="badge bg-secondary"><?= $insumo['unidad_medida'] ?></span></td>
                        <td>
                            <?php if($nivel == 'agotado'): ?>
                                <span class="badge bg-danger"><?= $insumo['stock_actual'] ?></span>
                            <?php elseif($nivel == 'critico'): ?>
                                <span class="badge bg-danger"><i class="fas fa-exclamation-triangle"></i> <?= $insumo['stock_actual'] ?></span>
                            <?php elseif($nivel == 'bajo'): ?>
                                <span class="badge bg-warning"><?= $insumo['stock_actual'] ?></span>
                            <?php else: ?>
                                <span class="badge bg-success"><?= $insumo['stock_actual'] ?></span>
                            <?php endif; ?>
                        </td>
                        <td><?= $insumo['stock_minimo'] ?></td>
                        <td>$<?= number_format($insumo['costo_unitario'], 2) ?></td>
                        <td>
                            <button class="btn btn-sm btn-success btn-entrada-insumo" 
                                    data-id="<?= $insumo['id'] ?>" 
                                    data-nombre="<?= $insumo['nombre'] ?>"
                                    title="Registrar entrada">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn btn-sm btn-info btn-editar-insumo" 
                                    data-id="<?= $insumo['id'] ?>"
                                    data-nombre="<?= $insumo['nombre'] ?>"
                                    data-descripcion="<?= $insumo['descripcion'] ?>"
                                    data-unidad="<?= $insumo['unidad_medida'] ?>"
                                    data-stock-minimo="<?= $insumo['stock_minimo'] ?>"
                                    data-costo="<?= $insumo['costo_unitario'] ?>"
                                    data-estatus="<?= $insumo['estatus'] ?>"
                                    title="Editar insumo">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-eliminar-insumo" 
                                    data-id="<?= $insumo['id'] ?>"
                                    title="Eliminar insumo">
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