$(document).ready(function () {
  cargarTabla();

  $("#form_empleado").on("submit", function (e) {
    e.preventDefault();
    $.post(
      "../../controller/empleados_controller.php?op=guardar_empleado",
      $(this).serialize(),
      function (resp) {
        const data = JSON.parse(resp);
        Swal.fire(data.message, "", data.status);
        $("#modal_empleado").modal("hide");
        $("#empleados_data").DataTable().ajax.reload();
      }
    );
  });

  $("#form_usuario").on("submit", function (e) {
    e.preventDefault();
    $.post(
      "../../controller/empleados_controller.php?op=crear_usuario",
      $(this).serialize(),
      function (resp) {
        const data = JSON.parse(resp);
        Swal.fire(data.message, "", data.status);
        $("#modal_usuario").modal("hide");
        $("#empleados_data").DataTable().ajax.reload();
      }
    );
  });

  cargarSucursales();
});

function cargarTabla() {
  $("#empleados_data").DataTable({
    ajax: {
      url: "../../controller/empleados_controller.php?op=listar",
      type: "GET",
      dataType: "json",
    },
    destroy: true,
    responsive: true,
  });
}

function editarEmpleado(id) {
  $.post(
    "../../controller/empleados_controller.php?op=mostrar",
    { emp_id: id },
    function (data) {
      data = JSON.parse(data);
      $("#emp_id").val(data.emp_id);
      $("#emp_nombre").val(data.emp_nombre);
      $("#emp_puesto").val(data.emp_puesto);
      $("#sucursal_id").val(data.sucursal_id);
      $("#modal_empleado").modal("show");
    }
  );
}

function eliminarEmpleado(id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "El empleado será dado de baja",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
  }).then((result) => {
    if (result.isConfirmed) {
      $.post(
        "../../controller/empleados_controller.php?op=eliminar_empleado",
        { emp_id: id },
        function (resp) {
          const data = JSON.parse(resp);
          Swal.fire(data.message, "", data.status);
          $("#empleados_data").DataTable().ajax.reload();
        }
      );
    }
  });
}

function crearUsuario(emp_id) {
  $("#form_usuario")[0].reset();
  $("#usuario_emp_id").val(emp_id);
  $("#modal_usuario").modal("show");
}

function cargarSucursales() {
  $.get("../../controller/empleados_controller.php?op=sucursales", function (data) {
    const sucursales = JSON.parse(data);
    let options = "<option value='' disabled selected>Selecciona una sucursal</option>";
    sucursales.forEach((sucursal) => {
      options += `<option value="${sucursal.id}">${sucursal.nombre_sucursal}</option>`;
    });
    $("#sucursal_id").html(options);
  });
}