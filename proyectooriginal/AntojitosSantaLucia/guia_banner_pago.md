# Guía de Implementación: Banner de Aviso de Pago Corporativo

Este documento contiene todo lo necesario para implementar el sistema de aviso de pago ("Kill Switch" manual) en cualquier proyecto PHP.

## 1. Base de Datos (SQL)

Ejecuta este código en tu base de datos MySQL para crear la tabla de control.

```sql
CREATE TABLE IF NOT EXISTS `corp_estatus` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `dia_corte` INT NOT NULL DEFAULT 30 COMMENT 'Día referencial de corte',
  `estatus` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 = Mostrar Banner (No pagado), 1 = Ocultar Banner (Pagado)',
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar configuración inicial (Estatus 0 = Banner Activado por defecto)
INSERT INTO `corp_estatus` (`dia_corte`, `estatus`) VALUES (30, 0);
```

---

## 2. Backend (API PHP)

Crea un archivo llamado `api/get_corp_estatus.php`. Asegúrate de ajustar la ruta de `conexion.php` según tu proyecto.

```php
<?php
/**
 * API - Estatus de Pago
 * 0 = MOSTRAR BANNER
 * 1 = OCULTAR BANNER
 */
require_once("../config/conexion.php"); // AJUSTAR ESTA RUTA

header('Content-Type: application/json');

try {
    // AJUSTAR: El método de conexión puede variar según tu proyecto
    $pdo = Conectar::obtenerConexionUnica();
    
    $stmt = $pdo->query("SELECT estatus FROM corp_estatus LIMIT 1");
    $registro = $stmt->fetch();
    
    if (!$registro) {
        echo json_encode(['success' => false, 'mostrar_banner' => false]);
        exit;
    }
    
    $estatus = (int)$registro['estatus'];
    
    // Si estatus es 0 -> Mostrar. Si es 1 -> Ocultar.
    $mostrar_banner = ($estatus === 0);
    
    echo json_encode([
        'success' => true,
        'mostrar_banner' => $mostrar_banner,
        'estatus' => $estatus
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error BD']);
}
?>
```

---

## 3. Frontend (HTML + JavaScript)

Pega esto en tu archivo principal (ej. `dashboard.php`, `index.php` o `header.php`), justo después de la etiqueta `<body>` o del menú de navegación. Requiere **jQuery**.

### HTML
```html
<!-- Banner de Aviso de Pago -->
<div id="banner-pago" class="banner-pago" style="display: none;">
    <div class="banner-pago-content">
        <!-- Icono (Requiere FontAwesome) -->
        <i class="fas fa-exclamation-triangle banner-pago-icon"></i>
        <div class="banner-pago-text">
            <strong>Aviso de Pago</strong>
            <span>La fecha de pago ha vencido. Por favor, comuníquese con el administrador.</span>
        </div>
        <button type="button" class="banner-pago-close" id="cerrar-banner-pago" aria-label="Cerrar">
            <i class="fas fa-times"></i>
        </button>
    </div>
</div>
```

### JavaScript (Pegar antes de </body>)
```javascript
<script>
$(document).ready(function() {
    // AJUSTAR RUTA: Ruta relativa al archivo API creado en el paso 2
    const apiUrl = 'api/get_corp_estatus.php'; 

    // Consultar el estatus del pago
    $.ajax({
        url: apiUrl,
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.mostrar_banner) {
                $('#banner-pago').fadeIn(300);
            }
        },
        error: function() { console.log('Error check pago'); }
    });

    // Funcionalidad cerrar (Solo oculta temporalmente)
    $('#cerrar-banner-pago').on('click', function() {
        $('#banner-pago').fadeOut(300);
    });
});
</script>
```

---

## 4. Estilos (CSS)

Pega esto en tu archivo CSS principal (ej. `styles.css` o `dashboard.css`).

```css
/* ========================================
   BANNER DE AVISO DE PAGO
   ======================================== */
.banner-pago {
    background: linear-gradient(135deg, #ef4444, #dc2626); /* Rojo Alerta */
    border-radius: 12px;
    margin: 20px; /* Margen externo */
    padding: 12px 20px;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
    animation: slideDown 0.4s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
}

.banner-pago-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
}

.banner-pago-icon {
    font-size: 1.5rem;
    color: white;
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
    opacity: 0.9;
}

.banner-pago-text {
    flex: 1;
    color: white;
}

.banner-pago-text strong {
    display: block;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 4px;
}

.banner-pago-text span {
    font-size: 0.875rem;
    opacity: 0.95;
}

.banner-pago-close {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.banner-pago-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Responsive */
@media (max-width: 768px) {
    .banner-pago {
        margin: 10px;
        padding: 14px 16px;
        flex-direction: row;
    }
    .banner-pago-text strong { font-size: 0.9rem; }
    .banner-pago-text span { font-size: 0.8rem; }
}
```
