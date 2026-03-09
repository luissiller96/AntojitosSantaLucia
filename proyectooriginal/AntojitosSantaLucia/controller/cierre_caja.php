<?php
require_once("../config/conexion.php");
require_once("../models/CierreCaja.php");
require_once("../models/Ventas.php"); // Asegúrate de que el modelo Ventas está incluido

$cierreCaja = new CierreCaja();
// $ventas = new Ventas(); // Instancia de Ventas no es necesaria aquí si obtenerDatosCierre() ya es completa

// Asegurarse de que el usu_id de la sesión está disponible
$usu_id_sesion = isset($_SESSION["usu_id"]) ? $_SESSION["usu_id"] : null;

if (!$usu_id_sesion) {
    echo json_encode(["status" => "error", "message" => "Usuario no autenticado."]);
    exit();
}

switch ($_GET["op"]) {
    case "verificar_estado_y_resumen":
        $estado_caja = $cierreCaja->verificarCajaActivaStatus(); 

        // 🔹 LÍNEA DE DEPURACIÓN CRÍTICA: Registrar el contenido de $estado_caja
        error_log("DEBUG cierre_caja.php: Resultado verificarCajaActivaStatus: " . json_encode($estado_caja));

        if ($estado_caja['status'] === 'activa') {
            // Si llega aquí, significa que verificarCajaActivaStatus() devolvió 'activa'.
            // Ahora necesitamos verificar que 'data' exista y no sea null.
            if (!isset($estado_caja['data']) || !is_array($estado_caja['data'])) {
                 error_log("ERROR cierre_caja.php: \$estado_caja['data'] no es válido o está ausente aunque el status es 'activa'.");
                 echo json_encode(["status" => "error", "message" => "Error interno: Datos de caja activa no disponibles."]);
                 exit();
            }

            $fecha_apertura = $estado_caja['data']['fecha_apertura'];
            $monto_apertura = $estado_caja['data']['monto_apertura'];
            $id_caja_activa = $estado_caja['data']['id'];

            // Pasamos fecha_apertura y monto_apertura a obtenerDatosCierre()
            $resumen_caja = $cierreCaja->obtenerDatosCierre($fecha_apertura, $monto_apertura); 
            
            // 🔹 LÍNEA DE DEPURACIÓN CRÍTICA: Registrar el contenido de $resumen_caja
            error_log("DEBUG cierre_caja.php: Resultado obtenerDatosCierre: " . json_encode($resumen_caja));

            // Si obtenerDatosCierre() devuelve un error, lo pasamos
            if ($resumen_caja['status'] !== 'success') {
                echo json_encode($resumen_caja); // Reenviar el error del modelo
                exit();
            }

            echo json_encode([
                "status" => "success",
                "caja_activa" => true,
                "data" => [
                    "id_caja" => $id_caja_activa,
                    "fecha_apertura" => $estado_caja['data']['fecha_apertura'],
                    "monto_apertura" => $monto_apertura,
                    "total_ventas" => $resumen_caja['total_ventas'],
                    "ventas_efectivo" => $resumen_caja['ventas_efectivo'],
                    "ventas_tarjeta" => $resumen_caja['ventas_tarjeta'],
                    "ventas_transferencia" => $resumen_caja['ventas_transferencia'],
                    "entradas_extras" => $resumen_caja['entradas_extras'], 
                    "salidas_extras" => $resumen_caja['salidas_extras'],   
                    "total_cortes" => $resumen_caja['total_cortes'],
                    "lista_cortes" => $resumen_caja['lista_cortes'],
                    "total_caja_esperado" => $resumen_caja['total_caja_esperado'] 
                ]
            ]);
        } else {
            // La caja no está activa, devolver el estado de 'cerrada'
            echo json_encode(["status" => "success", "caja_activa" => false, "message" => $estado_caja['message']]);
        }
        break;

    case "registrar_corte_preventivo":
        $monto = $_POST["monto"] ?? 0;
        $comentario = $_POST["comentario"] ?? '';
        
        if ($monto <= 0) {
            echo json_encode(["status" => "error", "message" => "El monto debe ser mayor a cero."]);
            exit();
        }

        $resultado = $cierreCaja->registrarCortePreventivo($monto, $comentario, $usu_id_sesion);
        if ($resultado) {
            echo json_encode(["status" => "success", "message" => "Corte preventivo registrado correctamente."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Ocurrió un error al guardar el corte preventivo."]);
        }
        break;

    // ... (otros casos del switch) ...
    case "abrir_caja":
        $monto = $_POST["monto_apertura"] ?? 0; 
        $usuario_id = $usu_id_sesion;

        $cajaActiva = $cierreCaja->verificarCajaActivaStatus(); 
        if ($cajaActiva["status"] === "activa") { 
            echo json_encode(["status" => "error", "message" => "No puedes abrir una nueva caja mientras haya una activa."]);
        } else {
            $resultado = $cierreCaja->abrirCaja($monto, $usuario_id);
            echo json_encode($resultado);
        }
        break;

    case "cerrar_caja":
        $id_caja_activa = $_POST["id_caja_activa"] ?? null;
        $monto_cierre_fisico = $_POST["monto_cierre_fisico"] ?? 0;
        $total_ventas_sistema = $_POST["total_ventas_sistema"] ?? 0;
        $diferencia_cierre = $_POST["diferencia_cierre"] ?? 0;
        
        $resultado = $cierreCaja->cerrarCaja($id_caja_activa, $monto_cierre_fisico, $total_ventas_sistema, $diferencia_cierre, $usu_id_sesion);
        echo json_encode($resultado);
        break;
    


        case "test_email":
    // Generar reportes de prueba sin cerrar caja
    try {
        require_once("../helpers/PDFReporteVentas.php");
        require_once("../helpers/PDFGastosOperativos.php");
        require_once("../helpers/PDFInventarioAlerta.php");
        require_once("../helpers/EnviarCorreoCierreCaja.php");
        require_once("../helpers/RangoCortesHelper.php");
        
        list($fecha_inicio, $fecha_fin) = RangoCortesHelper::obtenerRangoUltimosCortes();
        
        $pdfVentas = new PDFReporteVentas();
        $ruta_ventas = $pdfVentas->generarReporte($fecha_inicio, $fecha_fin);
        
        $pdfGastos = new PDFGastosOperativos();
        $ruta_gastos = $pdfGastos->generarReporte($fecha_inicio, $fecha_fin);
        
        $pdfInventario = new PDFInventarioAlerta();
        $ruta_inventario = $pdfInventario->generarReporte();
        
        $mailer = new EnviarCorreoCierreCaja('luis.siller@outlook.com');
        $resultado = $mailer->enviarReporteCierre(
            $fecha_inicio,
            $fecha_fin,
            $ruta_ventas,
            $ruta_gastos,
            $ruta_inventario,
            [
                'fecha_cierre' => date('Y-m-d H:i:s'),
                'monto_apertura' => 0,
                'monto_cierre' => 0,
                'diferencia_cierre' => 0
            ]
        );
        
        // Limpiar archivos
        if (file_exists($ruta_ventas)) unlink($ruta_ventas);
        if (file_exists($ruta_gastos)) unlink($ruta_gastos);
        if (file_exists($ruta_inventario)) unlink($ruta_inventario);
        
        if ($resultado) {
            echo json_encode(["status" => "success", "message" => "Correo enviado correctamente"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error al enviar correo"]);
        }
        
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    break;

    
    default:
        echo json_encode(["status" => "error", "message" => "Operación no válida."]);
        break;
}
