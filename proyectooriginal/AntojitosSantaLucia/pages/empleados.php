<?php
require_once("../includes/auth_check.php");

require_once("../config/conexion.php");
$conectar = Conectar::obtenerConexionUnica();
$stmt = $conectar->prepare("SELECT id, nombre_sucursal FROM rv_sucursales");
$stmt->execute();
$sucursales = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Solo los administradores pueden ver esta página
if ($_SESSION["emp_puesto"] != 'Admin') {
    header("Location: dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <?php include("../includes/head.php"); ?>
  <title>Gestión de Empleados</title>
  <?php include("../includes/style.php"); ?>
</head>

<body>

  <?php include("../includes/bottom_nav_bar.php"); ?>

  <div class="scroll-container <?= $modo_oscuro ? 'dark-mode' : '' ?>">
    <div class="card-body">

      <h4 class="card-title">Gestión de Empleados 👥</h4>

      <ul class="nav nav-tabs" id="empleadosTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <a class="nav-link active" id="lista-tab" data-bs-toggle="tab" href="#lista" role="tab" aria-controls="lista"
            aria-selected="true">
            <i class="fa fa-list"></i> Lista de Empleados
          </a>
        </li>
      </ul>

      <div class="tab-content mt-4">
        <div id="lista" class="tab-pane fade show active" role="tabpanel" aria-labelledby="lista-tab">

          <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-primary"
              onclick="$('#form_empleado')[0].reset(); $('#emp_id').val(''); $('#modal_empleado').modal('show');"><i
                class="fa fa-plus-circle"></i> Nuevo Empleado</button>


            </button>




          </div>

          <div class="table-responsive">
            <table id="empleados_data" class="table table-bordered table-striped w-100">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Puesto</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Empresa</th>
                  <th>Estatus</th>
                  <th>Editar</th>
                  <th>Eliminar</th>
                  <th>Crear Usuario</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  </div>

  <!-- Modal Empleado -->
  <div class="modal fade" id="modal_empleado" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <form id="form_empleado" class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Nuevo Empleado</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="emp_id" name="emp_id">
          <div class="mb-3">
            <label for="emp_nombre" class="form-label">Nombre</label>
            <input type="text" class="form-control" name="emp_nombre" id="emp_nombre" required>
          </div>
          <div class="mb-3">
            <label for="emp_puesto" class="form-label">Puesto</label>
            <input type="text" class="form-control" name="emp_puesto" id="emp_puesto" required>
          </div>
          <div class="mb-3">
            <label for="sucursal_id" class="form-label">Sucursal</label>
            <select class="form-select" name="sucursal_id" id="sucursal_id" required>
              <option value="1">Los Jemos</option>
              <option value="2">Anáhuac</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Guardar</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal Usuario -->
  <div class="modal fade" id="modal_usuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <form id="form_usuario" class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Crear Usuario</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="usuario_emp_id" name="emp_id">
          <div class="mb-3">
            <label for="usu_nom" class="form-label">Nombre de Usuario</label>
            <input type="text" class="form-control" name="usu_nom" id="usu_nom" required>
          </div>
          <div class="mb-3">
            <label for="usu_pass" class="form-label">Contraseña</label>
            <input type="password" class="form-control" name="usu_pass" id="usu_pass" required>
          </div>
          <div class="mb-3">
            <label for="usu_puesto" class="form-label">Rol</label>
            <input type="text" class="form-control" name="usu_puesto" id="usu_puesto" required>
          </div>
          <div class="mb-3">
            <label for="usu_empresa" class="form-label">Empresa</label>
            <input type="text" class="form-control" name="usu_empresa" id="usu_empresa" required>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Crear Usuario</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        </div>
      </form>
    </div>
  </div>


  <?php include("../includes/scripts.php"); ?>
  <script src="../js/empleados.js?v=<?php echo filemtime('../js/empleados.js'); ?>"></script>
</body>

</html>