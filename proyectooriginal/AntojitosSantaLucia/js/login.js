$(document).ready(function () {
  // ✅ Si hay cookies, rellenar campos
  if (Cookies.get("remember_usu_nom")) {
    $("#usu_nom").val(Cookies.get("remember_usu_nom"));
    $("#password").val(Cookies.get("remember_password"));
    $("#remember").prop("checked", true);
  }

  // ✅ Enviar formulario de login por AJAX
  $("#loginForm").submit(function (e) {
    e.preventDefault();

    const usu_nom = $("#usu_nom").val();
    const password = $("#password").val();
    const remember = $("#remember").is(":checked");

    $.post("controller/usuario.php?op=login", {
      usu_nom,
      password,
      remember: remember ? 1 : 0
    }, function (data) {
      let res = JSON.parse(data);

      if (res.status === "success") {
        // Guardar cookies si se marcó "recordarme"
        if (remember) {
          Cookies.set("remember_usu_nom", usu_nom, { expires: 30 });
          Cookies.set("remember_password", password, { expires: 30 });
        } else {
          Cookies.remove("remember_usu_nom");
          Cookies.remove("remember_password");
        }

        // ✅ Redirigir a dashboard correctamente
        window.location.href = "pages/dashboard.php";
      } else {
        Swal.fire("Error", res.message, "error");
      }
    });
  });
});