/**
 * empleados.js - Módulo de Gestión de Empleados
 * Adaptado a Vanilla JS y SQLite.
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderEmpleados(container) {
  // Asegurar acceso (sólo Administradores)
  if (!window._session || !['Admin', 'Administrativo', 'administrador'].includes(window._session.puesto)) {
    container.innerHTML = `<h2 style="padding:20px; color:red;">No tienes permisos para ver esta sección.</h2>`;
    return;
  }

  injectCSS('empleados-css', '/assets/css/empleados.css');
  renderLayout(container, 'empleados', getEmpleadosHTML());
  EmpleadosApp.init();
}

function injectCSS(id, href) {
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

// ─── HTML ────────────────────────────────────────────────────────────────────
function getEmpleadosHTML() {
  return `
<div class="emp-container">
  <div class="emp-header">
    <h1 class="emp-title">👥 Gestión de Empleados</h1>
  </div>

  <div class="emp-card">
    <div class="emp-toolbar">
      <button class="emp-btn btn-primary" id="btn-nuevo-empleado">
        <i class="fas fa-plus-circle"></i> Nuevo Empleado
      </button>
    </div>

    <div class="emp-table-wrapper">
      <table class="emp-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Usuario Asignado</th>
            <th>Rol / Empresa</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="emp-tbody">
          <tr><td colspan="6" class="text-center">Cargando datos...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Modal Empleado (Crear/Editar) -->
<div class="emp-modal-overlay" id="modal-empleado">
  <div class="emp-modal">
    <h3 id="modal-emp-title">Nuevo Empleado</h3>
    <form id="form-empleado">
      <input type="hidden" id="emp_id">
      
      <div class="emp-form-group">
        <label>Nombre:</label>
        <input type="text" id="emp_nombre" required class="emp-input">
      </div>
      
      <div class="emp-form-group">
        <label>Puesto:</label>
        <input type="text" id="emp_puesto" required class="emp-input">
      </div>
      
      <div class="emp-form-group">
        <label>Sucursal:</label>
        <!-- Hardcodeado como el original, se puede dejar un select simple -->
        <select id="sucursal_id" class="emp-input">
          <option value="1" selected>Principal / Sucursal 1</option>
          <option value="2">Sucursal 2</option>
        </select>
      </div>

      <div class="emp-modal-actions">
        <button type="button" class="emp-btn btn-secundario" id="btn-close-emp">Cancelar</button>
        <button type="submit" class="emp-btn btn-primary">Guardar</button>
      </div>
    </form>
  </div>
</div>

<!-- Modal Usuario (Crear credenciales) -->
<div class="emp-modal-overlay" id="modal-usuario">
  <div class="emp-modal">
    <h3>Generar Acceso</h3>
    <p style="font-size:0.9rem; color:#6c757d; margin-bottom:15px;">Vincula un usuario del sistema a este empleado.</p>
    <form id="form-usuario">
      <input type="hidden" id="usuario_emp_id">
      
      <div class="emp-form-group">
        <label>Nombre de Usuario (Para Login):</label>
        <input type="text" id="usu_nom" required class="emp-input" autocomplete="off">
      </div>
      
      <div class="emp-form-group">
        <label>Contraseña:</label>
        <input type="password" id="usu_pass" required class="emp-input" autocomplete="new-password">
      </div>
      
      <div class="emp-form-group">
        <label>Rol (Ej: Cajero, Admin):</label>
        <input type="text" id="usu_puesto" required class="emp-input">
      </div>
      
      <div class="emp-form-group">
        <label>Empresa:</label>
        <input type="text" id="usu_empresa" required class="emp-input" value="Antojitos Santa Lucía">
      </div>

      <div class="emp-modal-actions">
        <button type="button" class="emp-btn btn-secundario" id="btn-close-usu">Cancelar</button>
        <button type="submit" class="emp-btn btn-primary">Crear y Ligar Usuario</button>
      </div>
    </form>
  </div>
</div>
`;
}

// ─── LOGICA ──────────────────────────────────────────────────────────────────
const EmpleadosApp = {
  init() {
    this.cargarTabla();
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('btn-nuevo-empleado').addEventListener('click', () => {
      document.getElementById('form-empleado').reset();
      document.getElementById('emp_id').value = '';
      document.getElementById('modal-emp-title').textContent = 'Nuevo Empleado';
      this.abrirModal('modal-empleado');
    });

    document.getElementById('btn-close-emp').addEventListener('click', () => this.cerrarModal('modal-empleado'));
    document.getElementById('btn-close-usu').addEventListener('click', () => this.cerrarModal('modal-usuario'));

    document.getElementById('form-empleado').addEventListener('submit', (e) => this.guardarEmpleado(e));
    document.getElementById('form-usuario').addEventListener('submit', (e) => this.crearUsuario(e));

    // Delegación de eventos para las acciones de la tabla
    const tbody = document.getElementById('emp-tbody');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);
        if (action === 'edit') this.editar(id);
        else if (action === 'delete') this.eliminar(id);
        else if (action === 'user') this.abrirCrearUsuario(id);
      });
    }
  },

  abrirModal(id) {
    document.getElementById(id).classList.add('active');
  },

  cerrarModal(id) {
    document.getElementById(id).classList.remove('active');
  },

  // === 1. Listar Empleados ===
  async cargarTabla() {
    const tbody = document.getElementById('emp-tbody');
    try {
      // Join entre empleado y usuario
      const rows = await dbSelect(`
        SELECT 
          e.emp_id, e.emp_nombre, e.emp_puesto, e.emp_estatus, e.usu_id,
          u.usu_nom, u.usu_puesto as usu_rol, u.usu_empresa
        FROM tm_empleado e
        LEFT JOIN tm_usuario u ON e.usu_id = u.usu_id
        WHERE e.emp_estatus = 1
        ORDER BY e.emp_nombre ASC
      `, []);

      if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay empleados registrados.</td></tr>`;
        return;
      }

      let html = '';
      rows.forEach(r => {
        const hasUser = r.usu_id ? true : false;
        const statusBadge = r.emp_estatus === 1 ? '<span class="emp-badge open">Activo</span>' : '<span class="emp-badge closed">Inactivo</span>';

        // Acciones mediante dataset y event delegation
        let accionesHtml = `
          <button class="emp-btn-icon edit" data-action="edit" data-id="${r.emp_id}" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="emp-btn-icon delete" data-action="delete" data-id="${r.emp_id}" title="Eliminar"><i class="fas fa-trash"></i></button>
        `;
        if (!hasUser) {
          accionesHtml += `<button class="emp-btn-icon user" data-action="user" data-id="${r.emp_id}" title="Enlazar Usuario"><i class="fas fa-user-plus"></i></button>`;
        }

        html += `
          <tr>
            <td><strong>${r.emp_nombre}</strong></td>
            <td>${r.emp_puesto}</td>
            <td>${hasUser ? `<span class="emp-text-primary">${r.usu_nom}</span>` : '<em style="color:#adb5bd;">Sin cuenta asignada</em>'}</td>
            <td>${hasUser ? `(${r.usu_rol}) ${r.usu_empresa ?? ''}` : '-'}</td>
            <td>${statusBadge}</td>
            <td><div style="display:flex; gap:5px; justify-content:center;">${accionesHtml}</div></td>
          </tr>
        `;
      });

      tbody.innerHTML = html;

      // Exponer métodos globalmente para los onclick generados como html raw
      window.EmpleadosApp = this;

    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error cargando empleados.</td></tr>`;
    }
  },

  // === 2. Guardar (Insertar/Editar) ===
  async guardarEmpleado(e) {
    e.preventDefault();
    const id = document.getElementById('emp_id').value;
    const nombre = document.getElementById('emp_nombre').value.trim();
    const puesto = document.getElementById('emp_puesto').value.trim();
    const sucursal = document.getElementById('sucursal_id').value;

    try {
      if (id) {
        // UPDATE
        await dbExecute(
          `UPDATE tm_empleado SET emp_nombre = $1, emp_puesto = $2, sucursal_id = $3 WHERE emp_id = $4`,
          [nombre, puesto, sucursal, id]
        );
        this.showAlert('Empleado actualizado exitosamente.', 'success');
      } else {
        // INSERT
        await dbExecute(
          `INSERT INTO tm_empleado (emp_nombre, emp_puesto, sucursal_id, emp_estatus) VALUES ($1, $2, $3, 1)`,
          [nombre, puesto, sucursal]
        );
        this.showAlert('Empleado registrado exitosamente.', 'success');
      }
      this.cerrarModal('modal-empleado');
      this.cargarTabla();
    } catch (err) {
      console.error(err);
      this.showAlert('Ocurrió un error al guardar el empleado.', 'error');
    }
  },

  async editar(id) {
    try {
      const rows = await dbSelect(`SELECT emp_id, emp_nombre, emp_puesto, sucursal_id FROM tm_empleado WHERE emp_id = $1`, [id]);
      if (rows.length > 0) {
        const emp = rows[0];
        document.getElementById('emp_id').value = emp.emp_id;
        document.getElementById('emp_nombre').value = emp.emp_nombre;
        document.getElementById('emp_puesto').value = emp.emp_puesto;
        document.getElementById('sucursal_id').value = emp.sucursal_id || 1;
        document.getElementById('modal-emp-title').textContent = 'Editar Empleado';
        this.abrirModal('modal-empleado');
      }
    } catch (err) {
      this.showAlert('Error consultando empleado.', 'error');
    }
  },

  // === 3. Dar de Baja (Lógica) ===
  async eliminar(id) {
    if (window.Swal) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "El empleado será dado de baja",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await this._ejecutarEliminacion(id);
        }
      });
    } else {
      if (confirm("¿Estás seguro de dar de baja a este empleado?")) {
        await this._ejecutarEliminacion(id);
      }
    }
  },

  async _ejecutarEliminacion(id) {
    try {
      await dbExecute(`UPDATE tm_empleado SET emp_estatus = 0 WHERE emp_id = $1`, [id]);
      this.showAlert('Empleado dado de baja exitosamente.', 'success');
      this.cargarTabla();
    } catch (err) {
      this.showAlert('Error al eliminar.', 'error');
    }
  },

  // === 4. Crear Usuario enlazado ===
  abrirCrearUsuario(emp_id) {
    document.getElementById('form-usuario').reset();
    document.getElementById('usuario_emp_id').value = emp_id;
    this.abrirModal('modal-usuario');
  },

  async crearUsuario(e) {
    e.preventDefault();
    const emp_id = document.getElementById('usuario_emp_id').value;
    const usu_nom = document.getElementById('usu_nom').value.trim();
    const usu_pass = document.getElementById('usu_pass').value; // En un real world app debería cifrarse
    const usu_puesto = document.getElementById('usu_puesto').value.trim();
    const usu_empresa = document.getElementById('usu_empresa').value.trim();

    try {
      // 1. Verificar si el usuario ya existe para evitar repetidos
      const verify = await dbSelect(`SELECT usu_id FROM tm_usuario WHERE usu_nom = $1`, [usu_nom]);
      if (verify.length > 0) {
        return this.showAlert('Ese nombre de usuario ya existe. Elige otro.', 'warning');
      }

      // 2. Insertar en tm_usuario
      await dbExecute(
        `INSERT INTO tm_usuario (usu_nom, usu_pass, usu_puesto, usu_empresa, est) 
         VALUES ($1, $2, $3, $4, 1)`,
        [usu_nom, usu_pass, usu_puesto, usu_empresa]
      );

      // 3. Obtener el ID insertado
      const rows = await dbSelect(`SELECT last_insert_rowid() as id`, []);
      const newUsuId = rows[0].id;

      // 4. Ligar usu_id a tm_empleado
      await dbExecute(`UPDATE tm_empleado SET usu_id = $1 WHERE emp_id = $2`, [newUsuId, emp_id]);

      this.showAlert('Usuario creado y vinculado exitosamente.', 'success');
      this.cerrarModal('modal-usuario');
      this.cargarTabla();

    } catch (err) {
      console.error(err);
      this.showAlert('Error creando credenciales de acceso.', 'error');
    }
  },

  showAlert(msg, type) {
    if (window.showToast) {
      window.showToast(msg, type === 'error' ? 'red' : (type === 'warning' ? 'orange' : 'green'));
    } else {
      alert((type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : '⚠️ ') + msg);
    }
  }
};
