use hex;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use tauri::Manager;

// Llave secreta embebida (HARDCODED) en el binario de Rust.
// Muy difícil de extraer comparado con JS.
const SECRET_KEY: &[u8] = b"AntojitosSantaLucia_Pos_Secret_Key_2026_!@#";

// Tipo alias para HMAC-SHA256
type HmacSha256 = Hmac<Sha256>;

#[tauri::command]
fn generar_firma_licencia(
    fecha_ultimo_sync: String,
    fecha_expiracion: String,
    ventas_desde_sync: u32,
) -> Result<String, String> {
    // El payload es la concatenación de los valores críticos.
    // Si cambian en la base de datos sin generar nueva firma, el sistema lo detectará.
    let payload = format!(
        "{}|{}|{}",
        fecha_ultimo_sync, fecha_expiracion, ventas_desde_sync
    );

    let mut mac = HmacSha256::new_from_slice(SECRET_KEY)
        .map_err(|e| format!("Error inicializando HMAC: {}", e))?;

    mac.update(payload.as_bytes());

    let result = mac.finalize();
    let signature_bytes = result.into_bytes();

    Ok(hex::encode(signature_bytes))
}

#[tauri::command]
fn verificar_firma_licencia(
    fecha_ultimo_sync: String,
    fecha_expiracion: String,
    ventas_desde_sync: u32,
    firma_a_validar: String,
) -> bool {
    let payload = format!(
        "{}|{}|{}",
        fecha_ultimo_sync, fecha_expiracion, ventas_desde_sync
    );

    let mut mac = match HmacSha256::new_from_slice(SECRET_KEY) {
        Ok(m) => m,
        Err(_) => return false,
    };

    mac.update(payload.as_bytes());

    // Verificamos si la firma calculada coincide con la pasada por parámetro
    let result = mac.finalize();
    let signature_bytes = result.into_bytes();
    let calculada = hex::encode(signature_bytes);

    calculada == firma_a_validar
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            generar_firma_licencia,
            verificar_firma_licencia
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
