/**
 * login.js - Módulo de autenticación
 * HTML idéntico al original index.php
 * Reemplaza: pages/login + controller/usuario.php + models/Usuario.php
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderDashboard } from './dashboard.js';

export function renderLogin(container) {
  // Inyectar el CSS del login original
  if (!document.getElementById('login-css')) {
    const link = document.createElement('link');
    link.id = 'login-css';
    link.rel = 'stylesheet';
    link.href = '/assets/css/login.css';
    document.head.appendChild(link);
  }

  // HTML idéntico al index.php original (sin PHP)
  container.innerHTML = `
    <div class="container-fluid h-100">
      <div class="row h-100">

        <!-- Columna de Branding -->
        <div class="col-lg-7 d-none d-lg-flex" id="branding-column">
          <div class="branding-content">
            <h1>Antojitos Santa Lucía</h1>
            <p>Antojitos Mexicanos</p>

            <div class="brand-features">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-utensils"></i>
                </div>
                <span>Gestión completa de pedidos</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <span>Control de ventas en tiempo real</span>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-mobile-alt"></i>
                </div>
                <span>Optimizado para tablet y móvil</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna del Formulario -->
        <div class="col-lg-5 col-12" id="form-column">
          <div class="login-card">
            <div class="text-center mb-4">
              <h2 class="fw-bold">Iniciar Sesión</h2>
              <p class="text-muted">Accede al sistema de gestión</p>
            </div>

            <div id="login-alert" style="display:none;"></div>

            <form id="loginForm">
              <div class="input-group mb-3">
                <span class="input-group-text"><i class="fas fa-user"></i></span>
                <input type="text" class="form-control form-control-lg" id="login-usuario"
                  placeholder="Ingresa tu usuario" autocomplete="username" required />
              </div>

              <div class="input-group mb-4">
                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                <input type="password" class="form-control form-control-lg" id="login-password"
                  placeholder="Ingresa tu contraseña" autocomplete="current-password" required />
              </div>

              <div class="d-flex justify-content-between align-items-center mb-4">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="remember" />
                  <label class="form-check-label" for="remember">Recordar mis datos</label>
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100 btn-lg" id="loginBtn">
                <i class="fas fa-sign-in-alt me-2"></i>
                Acceder al Sistema
              </button>
            </form>

            <div class="text-center mt-4">
              <small class="text-muted">
                <i class="fas fa-shield-alt me-1"></i>
                Sistema seguro y confiable
              </small>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  initLoginEvents();
}

function initLoginEvents() {
  const form = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');

  // Efectos de focus igual que el original
  const inputGroups = document.querySelectorAll('.input-group');
  inputGroups.forEach(group => {
    const input = group.querySelector('.form-control');
    if (!input) return;

    input.addEventListener('focus', () => {
      group.style.transform = 'scale(1.01)';
      group.style.transition = 'transform 0.3s ease';
    });
    input.addEventListener('blur', () => {
      group.style.transform = 'scale(1)';
    });
    input.addEventListener('input', function () {
      if (this.value.length > 0) {
        this.classList.add('is-valid');
        this.classList.remove('is-invalid');
      } else {
        this.classList.remove('is-valid');
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
  });
}

async function handleLogin() {
  const usuario = document.getElementById('login-usuario').value.trim();
  const password = document.getElementById('login-password').value;
  const loginBtn = document.getElementById('loginBtn');

  // Loading state
  loginBtn.classList.add('loading');
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Iniciando sesión...';
  loginBtn.disabled = true;

  hideAlert();

  try {
    const rows = await dbSelect(
      `SELECT u.usu_id, u.usu_nom, u.usu_puesto, e.emp_id, e.emp_nombre
       FROM tm_usuario u
       LEFT JOIN tm_empleado e ON e.usu_id = u.usu_id
       WHERE u.usu_nom = $1 AND u.usu_pass = $2 AND u.est = 1
       LIMIT 1`,
      [usuario, password]
    );

    if (rows.length === 0) {
      showAlert('El usuario o la contraseña son incorrectos.', 'danger');
      return;
    }

    const user = rows[0];

    // Guardar sesión global
    window._session = {
      usu_id: user.usu_id,
      nombre: user.usu_nom,
      puesto: user.usu_puesto,
      emp_id: user.emp_id,
      emp_nombre: user.emp_nombre,
    };

    // Si es Administrador, generar nuevo Token Global
    if (['Admin', 'Administrativo', 'administrador'].includes(user.usu_puesto)) {
      const newToken = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digits
      const exists = await dbSelect(`SELECT id FROM token_global WHERE id = 1`, []);
      if (exists.length > 0) {
        await dbExecute(`UPDATE token_global SET token = ?, fecha_actualizacion = datetime('now','localtime') WHERE id = 1`, [newToken]);
      } else {
        await dbExecute(`INSERT INTO token_global (id, token) VALUES (1, ?)`, [newToken]);
      }
      console.log('Nuevo Token Global Generado:', newToken);
    }

    // Navegar al dashboard
    const app = document.getElementById('app');
    try {
      await renderDashboard(app);
    } catch (err) {
      app.innerHTML = `<div style="padding:40px;font-family:monospace;background:#1e293b;color:#f87171;min-height:100vh;">
        <h2 style="color:#fb923c;">❌ Error al cargar Dashboard</h2>
        <pre style="background:#0f172a;padding:20px;border-radius:8px;overflow:auto;">${err?.stack || err?.message || String(err)}</pre>
      </div>`;
    }

  } catch (err) {
    console.error('Error en login:', err);
    showAlert('Error al conectar con la base de datos.', 'danger');
  } finally {
    loginBtn.classList.remove('loading');
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Acceder al Sistema';
    loginBtn.disabled = false;
  }
}

function showAlert(msg, type = 'danger') {
  const div = document.getElementById('login-alert');
  div.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
  div.style.display = 'block';
}

function hideAlert() {
  const div = document.getElementById('login-alert');
  div.style.display = 'none';
  div.innerHTML = '';
}
