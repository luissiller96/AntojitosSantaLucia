/**
 * sincronizacion.js
 * Página de sincronización de datos locales → servidor remoto MySQL
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderLayout } from './layout.js';

const SYNC_URL = 'https://antojitossantalucia.smartouch.me/sync.php';
const SYNC_TOKEN = 'ANTOJITOS_SYNC_2025_K9x!';

export async function renderSincronizacion(container) {
    renderLayout(container, 'sincronizacion', getSyncHTML());
    await initSyncPage();
}

function getSyncHTML() {
    return `
<div class="sync-container">
    <div class="sync-header">
        <div class="sync-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h1 class="sync-title">Sincronización</h1>
        <p class="sync-subtitle">Envía los datos locales al servidor en la nube</p>
    </div>

    <!-- Estado de conexión -->
    <div class="sync-status-card" id="sync-status-card">
        <div class="sync-status-icon" id="sync-status-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <div class="sync-status-text" id="sync-status-text">
            Verificando conexión al servidor...
        </div>
    </div>

    <!-- Tablas a sincronizar -->
    <div class="sync-tables" id="sync-tables">
        <div class="sync-table-item" id="sync-item-ventas">
            <div class="sync-table-info">
                <i class="fas fa-receipt sync-table-icon"></i>
                <div>
                    <div class="sync-table-name">Ventas</div>
                    <div class="sync-table-count" id="count-ventas">Contando...</div>
                </div>
            </div>
            <div class="sync-table-status" id="status-ventas">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        </div>

        <div class="sync-table-item" id="sync-item-caja">
            <div class="sync-table-info">
                <i class="fas fa-store sync-table-icon"></i>
                <div>
                    <div class="sync-table-name">Aperturas / Cierres de Caja</div>
                    <div class="sync-table-count" id="count-caja">Contando...</div>
                </div>
            </div>
            <div class="sync-table-status" id="status-caja">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        </div>

        <div class="sync-table-item" id="sync-item-gastos">
            <div class="sync-table-info">
                <i class="fas fa-money-bill-wave sync-table-icon"></i>
                <div>
                    <div class="sync-table-name">Gastos</div>
                    <div class="sync-table-count" id="count-gastos">Contando...</div>
                </div>
            </div>
            <div class="sync-table-status" id="status-gastos">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        </div>
    </div>

    <!-- Resultado de última sincronización -->
    <div class="sync-result" id="sync-result" style="display:none;"></div>

    <!-- Botones -->
    <div class="sync-actions">
        <button class="btn-sync" id="btn-sync" disabled>
            <i class="fas fa-sync-alt"></i>
            Sincronizar Ahora
        </button>
        <p class="sync-warning">
            <i class="fas fa-info-circle"></i>
            La sincronización solo envía registros nuevos. No elimina ni modifica datos existentes en el servidor.
        </p>
    </div>
</div>

<style>
.sync-container {
    padding: 24px 20px 100px;
    max-width: 600px;
    margin: 0 auto;
}
.sync-header {
    text-align: center;
    margin-bottom: 28px;
}
.sync-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    font-size: 32px;
    color: white;
    box-shadow: 0 8px 24px rgba(99,102,241,0.35);
}
.sync-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary, #1e293b);
    margin: 0 0 6px;
}
.sync-subtitle {
    color: var(--text-secondary, #64748b);
    font-size: 0.95rem;
    margin: 0;
}

/* Estado de conexión */
.sync-status-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border, #e2e8f0);
    border-radius: 14px;
    padding: 16px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.sync-status-icon {
    font-size: 24px;
    width: 40px;
    text-align: center;
}
.sync-status-icon.ok { color: #22c55e; }
.sync-status-icon.err { color: #ef4444; }
.sync-status-text {
    font-size: 0.9rem;
    color: var(--text-primary, #1e293b);
}

/* Tablas */
.sync-tables {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}
.sync-table-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border, #e2e8f0);
    border-radius: 14px;
    padding: 14px 18px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.sync-table-info {
    display: flex;
    align-items: center;
    gap: 14px;
}
.sync-table-icon {
    font-size: 18px;
    color: #6366f1;
    width: 24px;
    text-align: center;
}
.sync-table-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-primary, #1e293b);
}
.sync-table-count {
    font-size: 0.78rem;
    color: var(--text-secondary, #64748b);
    margin-top: 2px;
}
.sync-table-status {
    font-size: 18px;
    color: #94a3b8;
}
.sync-table-status.ok { color: #22c55e; }
.sync-table-status.err { color: #ef4444; }
.sync-table-status.syncing { color: #f59e0b; }

/* Resultado */
.sync-result {
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 20px;
    font-size: 0.88rem;
    line-height: 1.6;
}
.sync-result.success {
    background: #f0fdf4;
    border: 1px solid #86efac;
    color: #166534;
}
.sync-result.error {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #991b1b;
}

/* Botón */
.sync-actions { text-align: center; }
.btn-sync {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: white;
    border: none;
    border-radius: 14px;
    padding: 14px 32px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(99,102,241,0.35);
    width: 100%;
    justify-content: center;
    max-width: 340px;
}
.btn-sync:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
.btn-sync:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }
.sync-warning {
    margin-top: 14px;
    font-size: 0.78rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
}
</style>
    `;
}

async function initSyncPage() {
    const statusIcon = document.getElementById('sync-status-icon');
    const statusText = document.getElementById('sync-status-text');
    const btnSync = document.getElementById('btn-sync');

    // Verificar conexión al servidor usando GET
    let servidorDisponible = false;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const pingRes = await fetch(SYNC_URL, {
            method: 'GET',
            mode: 'cors', // Permitir CORS
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        // Si el PHP devuelve un código HTTP (incluso 401 que pusimos), el servidor vive
        servidorDisponible = true;
    } catch (e) {
        console.error("Error contactando al servidor:", e);
        servidorDisponible = false;
    }

    if (servidorDisponible) {
        statusIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        statusIcon.className = 'sync-status-icon ok';
        statusText.textContent = '✅ Servidor disponible — listo para sincronizar.';
        btnSync.disabled = false;
    } else {
        statusIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        statusIcon.className = 'sync-status-icon err';
        statusText.textContent = '❌ Sin conexión al servidor. Verifica tu internet e intenta de nuevo.';
    }

    // Contar registros locales
    await contarRegistros();

    // Listener del botón
    btnSync.addEventListener('click', ejecutarSync);
}

async function contarRegistros() {
    try {
        const ventas = await dbSelect('SELECT COUNT(*) as total FROM rv_ventas', []);
        document.getElementById('count-ventas').textContent = `${ventas[0]?.total ?? 0} registros locales`;
        document.getElementById('status-ventas').innerHTML = '<i class="fas fa-circle" style="color:#94a3b8;font-size:10px;"></i>';
    } catch (e) {
        document.getElementById('count-ventas').textContent = 'Tabla no disponible';
    }

    try {
        const caja = await dbSelect('SELECT COUNT(*) as total FROM rv_apertura_caja', []);
        document.getElementById('count-caja').textContent = `${caja[0]?.total ?? 0} registros locales`;
        document.getElementById('status-caja').innerHTML = '<i class="fas fa-circle" style="color:#94a3b8;font-size:10px;"></i>';
    } catch (e) {
        document.getElementById('count-caja').textContent = 'Tabla no disponible';
    }

    try {
        const gastos = await dbSelect('SELECT COUNT(*) as total FROM rv_gastos', []);
        document.getElementById('count-gastos').textContent = `${gastos[0]?.total ?? 0} registros locales`;
        document.getElementById('status-gastos').innerHTML = '<i class="fas fa-circle" style="color:#94a3b8;font-size:10px;"></i>';
    } catch (e) {
        document.getElementById('count-gastos').textContent = 'Tabla no disponible';
    }
}

// Obtiene todos los datos locales para el backup completo
async function obtenerTodasLasTablas() {
    const tablas = {};
    const tablasARespaldar = [
        'rv_sucursales', 'rv_categorias', 'rv_ingredientes', 'rv_gastos_fijos_plantilla',
        'tm_usuario', 'tm_empleado',
        'rv_insumos', 'rv_productos', 'rv_producto_componentes', 'rv_producto_insumos',
        'rv_apertura_caja', 'rv_ventas', 'rv_comanda', 'rv_devoluciones',
        'rv_gastos', 'rv_gastos_fijos', 'rv_movimientos_insumos'
    ];

    for (const tabla of tablasARespaldar) {
        try {
            tablas[tabla] = await dbSelect(`SELECT * FROM ${tabla}`, []);
        } catch (e) {
            // Si la tabla no existe localmente, no bloquea la sincronización
            tablas[tabla] = [];
        }
    }
    return tablas;
}

async function ejecutarSync() {
    const btnSync = document.getElementById('btn-sync');
    const resultDiv = document.getElementById('sync-result');
    btnSync.disabled = true;
    btnSync.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
    resultDiv.style.display = 'none';

    // Marcar como sincronizando
    ['ventas', 'caja', 'gastos'].forEach(t => {
        const el = document.getElementById(`status-${t}`);
        if (el) { el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; el.className = 'sync-table-status syncing'; }
    });

    try {
        // Obtener todos los datos locales (backup completo)
        const todasLasTablas = await obtenerTodasLasTablas();

        const payload = {
            empresa: 'Antojitos Santa Lucia',
            token: SYNC_TOKEN,
            ...todasLasTablas
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(new Error('Tiempo de espera agotado. Verifica tu conexión e intenta de nuevo.')), 120000);

        const response = await fetch(SYNC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SYNC_TOKEN}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const resultado = await response.json();

        if (resultado.success) {
            // Mostrar resultados en las 3 tarjetas visibles
            const mapaUI = {
                rv_ventas: 'ventas',
                rv_apertura_caja: 'caja',
                rv_gastos: 'gastos'
            };
            Object.entries(resultado.tablas ?? {}).forEach(([tabla, info]) => {
                const key = mapaUI[tabla];
                if (!key) return;
                const el = document.getElementById(`status-${key}`);
                const countEl = document.getElementById(`count-${key}`);
                if (el) { el.innerHTML = '<i class="fas fa-check-circle"></i>'; el.className = 'sync-table-status ok'; }
                if (countEl) countEl.textContent = `✓ ${info.upsertados} sincronizados de ${info.recibidos} enviados`;
            });

            // --- RENOVAR LICENCIA LOCAL AL SINCRONIZAR CON ÉXITO ---
            try {
                const { invoke } = window.__TAURI__?.core || await import('@tauri-apps/api/core');

                // Configurar nuevas fechas
                const hoy = new Date();
                const exp = new Date(hoy.getTime() + (7 * 24 * 60 * 60 * 1000)); // +7 días

                // Formatear a 'YYYY-MM-DD HH:mm:ss' para ser consistentes con SQLite
                const fecha_ultimo_sync = hoy.toISOString().replace('T', ' ').substring(0, 19);
                const fecha_expiracion = exp.toISOString().replace('T', ' ').substring(0, 19);
                const ventas_desde_sync = 0; // Reiniciar contador

                // Generar firma firme con los nuevos datos ganadores
                const nuevaFirma = await invoke('generar_firma_licencia', {
                    fechaUltimoSync: fecha_ultimo_sync,
                    fechaExpiracion: fecha_expiracion,
                    ventasDesdeSync: ventas_desde_sync
                });

                // Guardar en SQLite
                await dbExecute(
                    `UPDATE rv_licencia_local 
                     SET fecha_ultimo_sync = $1, 
                         fecha_expiracion = $2, 
                         ventas_desde_sync = $3, 
                         firma_digital = $4 
                     WHERE id = 1`,
                    [fecha_ultimo_sync, fecha_expiracion, ventas_desde_sync, nuevaFirma]
                );

                console.log("[Licencia] Renovada exitosamente hasta: ", fecha_expiracion);
            } catch (errLic) {
                console.error("No se pudo renovar la licencia local tras la sincronización.", errLic);
                throw new Error("Sincronización de datos exitosa, pero falló la renovación local de la licencia. Contacte a soporte.");
            }
            // --- FIN RENOVAR LICENCIA ---

            const totalUpsertados = Object.values(resultado.tablas ?? {}).reduce((s, t) => s + (t.upsertados ?? 0), 0);
            const totalTablas = Object.keys(resultado.tablas ?? {}).length;
            resultDiv.className = 'sync-result success';
            resultDiv.innerHTML = `<strong><i class="fas fa-check-circle"></i> Sincronización exitosa</strong><br>
                Backup completo enviado (${totalTablas} tablas). ${totalUpsertados} registros sincronizados en la nube.<br>
                <strong><i class="fas fa-lock"></i> Licencia extendida por 7 días más.</strong>`;
            resultDiv.style.display = 'block';
        } else {
            // --- REVOCAR LICENCIA LOCAL SI EL SERVIDOR NOS DETECTA MOROSOS ---
            if (resultado.error && (resultado.error.includes('SUSPENDIDA') || resultado.error.includes('caducado') || resultado.error.includes('Error de Licencia'))) {
                try {
                    const { invoke } = window.__TAURI__?.core || await import('@tauri-apps/api/core');
                    const hoyString = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    const fecha_expiracion_revocada = '2000-01-01 00:00:00'; // Castigo: pasado eterno
                    const ventas_desde_sync = 9999;

                    const nuevaFirmaRevocada = await invoke('generar_firma_licencia', {
                        fechaUltimoSync: hoyString,
                        fechaExpiracion: fecha_expiracion_revocada,
                        ventasDesdeSync: ventas_desde_sync
                    });

                    await dbExecute(
                        `UPDATE rv_licencia_local 
                         SET fecha_ultimo_sync = $1, 
                             fecha_expiracion = $2, 
                             ventas_desde_sync = $3, 
                             firma_digital = $4 
                         WHERE id = 1`,
                        [hoyString, fecha_expiracion_revocada, ventas_desde_sync, nuevaFirmaRevocada]
                    );
                    console.log("[Licencia] Licencia revocada localmente por instrucción del servidor central.");
                } catch (e) {
                    console.error("Error al revocar la licencia local:", e);
                }
            }
            // --- FIN REVOCACIÓN ---

            throw new Error(resultado.error || 'Error desconocido del servidor');
        }
    } catch (err) {
        ['ventas', 'caja', 'gastos'].forEach(t => {
            const el = document.getElementById(`status-${t}`);
            if (el) { el.innerHTML = '<i class="fas fa-times-circle"></i>'; el.className = 'sync-table-status err'; }
        });
        const esTimeout = err.message?.includes('aborted') || err.message?.includes('Tiempo de espera') || err.name === 'AbortError';
        const mensajeError = esTimeout
            ? 'Tiempo de espera agotado (2 min). La conexión es lenta o el servidor no respondió. Intenta de nuevo con mejor señal.'
            : err.message;
        resultDiv.className = 'sync-result error';
        resultDiv.innerHTML = `<strong><i class="fas fa-times-circle"></i> Error de sincronización</strong><br>${mensajeError}`;
        resultDiv.style.display = 'block';
    } finally {
        btnSync.disabled = false;
        btnSync.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar Ahora';
    }
}
