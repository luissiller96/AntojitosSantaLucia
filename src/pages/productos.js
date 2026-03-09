/**
 * productos.js - Módulo de gestión de productos
 * CRUD completo: listar, crear, editar, activar/desactivar
 * Basado en el original pages/productos.php + js/productos.js
 */

import { dbSelect, dbExecute } from '../db/database.js';
import { renderLayout } from './layout.js';

export async function renderProductos(container) {
  injectCSS('productos-css', '/assets/css/productos.css');
  renderLayout(container, 'productos', getProductosHTML());
  await ProductosApp.init();
}

function injectCSS(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet'; link.href = href;
  document.head.appendChild(link);
}

// ─── HTML Base ────────────────────────────────────────────────────────────────
function getProductosHTML() {
  return `
  <div class="prod-container">

    <!-- Header -->
    <div class="prod-header">
      <div>
        <h1 class="prod-title"><i class="fas fa-box-open"></i> Productos</h1>
        <p class="prod-subtitle">Gestión del catálogo de platillos y artículos</p>
      </div>
      <button class="prod-btn prod-btn-primary" id="btn-nuevo-producto">
        <i class="fas fa-plus"></i> Nuevo Producto
      </button>
    </div>

    <!-- Filtros + Buscador -->
    <div class="prod-toolbar">
      <div class="prod-search-wrap">
        <i class="fas fa-search prod-search-icon"></i>
        <input type="text" id="prod-search" class="prod-search" placeholder="Buscar producto...">
      </div>
      <div class="prod-filter-wrap">
        <select id="prod-filter-cat" class="prod-select">
          <option value="">Todas las categorías</option>
        </select>
        <select id="prod-filter-estatus" class="prod-select">
          <option value="">Todos</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="prod-table-wrap">
      <table class="prod-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio Venta</th>
            <th>Stock</th>
            <th>Estatus</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="prod-tbody">
          <tr><td colspan="7" class="prod-loading">
            <div class="prod-spinner"></div> Cargando productos...
          </td></tr>
        </tbody>
      </table>
    </div>

  </div>

  <!-- ====== MODAL: CREAR / EDITAR ====== -->
  <div class="prod-modal-overlay" id="modal-producto">
    <div class="prod-modal">
      <div class="prod-modal-header">
        <h5 id="modal-prod-title">Nuevo Producto</h5>
        <button class="prod-modal-close" id="close-modal-producto">&times;</button>
      </div>
      <div class="prod-modal-body">
        <input type="hidden" id="prod-id">

        <div class="prod-form-row">
          <div class="prod-form-group">
            <label>Nombre *</label>
            <input type="text" id="prod-nombre" class="prod-input" placeholder="Ej. Enchiladas (6 pzs)">
          </div>
          <div class="prod-form-group">
            <label>Categoría *</label>
            <div style="display:flex; gap:10px;">
                <select id="prod-categoria" class="prod-select-full" style="flex:1;">
                  <option value="">-- Seleccionar --</option>
                </select>
                <button type="button" class="prod-btn prod-btn-secondary" id="btn-nueva-categoria" title="Nueva Categoría" style="padding: 0 12px;">
                  <i class="fas fa-plus"></i> Nueva
                </button>
            </div>
          </div>
        </div>

        <div class="prod-form-row">
          <div class="prod-form-group">
            <label>Precio de Venta *</label>
            <div class="prod-input-prefix">
              <span>$</span>
              <input type="number" id="prod-precio-venta" class="prod-input" min="0" step="0.50" placeholder="0.00">
            </div>
          </div>
          <div class="prod-form-group">
            <label>Precio de Compra (Costo)</label>
            <div class="prod-input-prefix">
              <span>$</span>
              <input type="number" id="prod-precio-compra" class="prod-input" min="0" step="0.50" placeholder="0.00">
            </div>
          </div>
        </div>

        <div class="prod-form-row">
          <div class="prod-form-group">
            <label>Stock inicial <small style="color:#6c757d;">(vacío = sin control)</small></label>
            <input type="number" id="prod-stock" class="prod-input" min="0" step="1" placeholder="Vacío = ilimitado">
          </div>
          <div class="prod-form-group">
            <label>Stock mínimo (alerta)</label>
            <input type="number" id="prod-stock-min" class="prod-input" min="0" step="1" value="10">
          </div>
        </div>

        <div class="prod-form-row">
          <div class="prod-form-group">
            <label>Descripción</label>
            <textarea id="prod-descripcion" class="prod-input prod-textarea" rows="2" placeholder="Descripción opcional..."></textarea>
          </div>
          <div class="prod-form-group" style="display:flex; flex-direction:column; gap:12px; justify-content:flex-end;">
            <label class="prod-checkbox-label">
              <input type="checkbox" id="prod-favorito">
              <span>⭐ Producto favorito</span>
            </label>
            <label class="prod-checkbox-label">
              <input type="checkbox" id="prod-activo" checked>
              <span>✅ Producto activo</span>
            </label>
          </div>
        </div>

        <div id="modal-prod-error" class="prod-error" style="display:none;"></div>
      </div>
      <div class="prod-modal-footer">
        <button class="prod-btn prod-btn-secondary" id="cancelar-producto">Cancelar</button>
        <button class="prod-btn prod-btn-primary"   id="guardar-producto">
          <i class="fas fa-save"></i> Guardar
        </button>
      </div>
    </div>
  </div>

  <!-- ====== MODAL ALERTA ====== -->
  <div class="prod-modal-overlay" id="prod-alert-overlay">
    <div class="prod-modal" style="max-width:340px;">
      <div class="prod-modal-header" id="prod-alert-header">
        <h5 id="prod-alert-title">Aviso</h5>
        <button class="prod-modal-close" id="close-prod-alert">&times;</button>
      </div>
      <div class="prod-modal-body">
        <p id="prod-alert-body" style="font-size:.95rem; line-height:1.5;"></p>
      </div>
      <div class="prod-modal-footer">
        <button class="prod-btn prod-btn-secondary" id="prod-alert-cancel" style="display:none;">Cancelar</button>
        <button class="prod-btn prod-btn-primary"   id="prod-alert-confirm">Aceptar</button>
      </div>
    </div>
  </div>
  `;
}

// ─── App ─────────────────────────────────────────────────────────────────────
const ProductosApp = {
  productos: [],
  categorias: [],

  async init() {
    this.categorias = await dbSelect('SELECT id, nombre FROM rv_categorias ORDER BY nombre', []);
    this.llenarCategoriasFiltro();
    this.llenarCategoriasForm();
    this.bindEvents();
    await this.cargarProductos();
  },

  llenarCategoriasFiltro() {
    const sel = document.getElementById('prod-filter-cat');
    if (!sel) return;
    this.categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.nombre;
      sel.appendChild(opt);
    });
  },

  llenarCategoriasForm() {
    const sel = document.getElementById('prod-categoria');
    if (!sel) return;
    this.categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id; opt.textContent = c.nombre;
      sel.appendChild(opt);
    });
  },

  bindEvents() {
    on('btn-nuevo-producto', 'click', () => this.abrirModalNuevo());
    on('close-modal-producto', 'click', () => closeModal('modal-producto'));
    on('cancelar-producto', 'click', () => closeModal('modal-producto'));
    on('guardar-producto', 'click', () => this.guardarProducto());
    on('btn-nueva-categoria', 'click', () => this.crearNuevaCategoria());

    // Búsqueda en tiempo real
    on('prod-search', 'input', () => this.renderTabla());
    on('prod-filter-cat', 'change', () => this.renderTabla());
    on('prod-filter-estatus', 'change', () => this.renderTabla());

    // Cerrar overlay click
    document.getElementById('modal-producto')?.addEventListener('click', e => {
      if (e.target.id === 'modal-producto') closeModal('modal-producto');
    });
    document.getElementById('prod-alert-overlay')?.addEventListener('click', e => {
      if (e.target.id === 'prod-alert-overlay') closeAlert();
    });
    on('close-prod-alert', 'click', () => closeAlert());

    // Delegación en tabla
    document.getElementById('prod-tbody')?.addEventListener('click', e => {
      const btnEdit = e.target.closest('.btn-editar');
      const btnToggle = e.target.closest('.btn-toggle');
      if (btnEdit) this.editarProducto(parseInt(btnEdit.dataset.id));
      if (btnToggle) this.toggleEstatus(parseInt(btnToggle.dataset.id), parseInt(btnToggle.dataset.estatus));
    });
  },

  async cargarProductos() {
    this.productos = await dbSelect(
      `SELECT p.ID, p.pr_nombre, c.nombre AS pr_categoria, p.categoria_id,
              p.pr_precioventa, p.pr_preciocompra, p.pr_stock, p.pr_stock_minimo,
              p.pr_descripcion, p.pr_estatus, p.pr_favorito, p.es_platillo
       FROM rv_productos p
       LEFT JOIN rv_categorias c ON p.categoria_id = c.id
       ORDER BY c.nombre, p.pr_nombre`, []
    );
    this.renderTabla();
  },

  async crearNuevaCategoria() {
    if (!window.Swal) return alert("Error: SweetAlert no está disponible.");

    const { value: nombreCategoria } = await Swal.fire({
      title: 'Nueva Categoría',
      input: 'text',
      inputLabel: 'Nombre de la nueva categoría',
      inputPlaceholder: 'Ej: Postres',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return 'Debes escribir un nombre';
        }
      }
    });

    if (nombreCategoria) {
      try {
        // Insertar en la BD local
        await dbExecute('INSERT INTO rv_categorias (nombre, descripcion) VALUES ($1, $2)', [nombreCategoria.trim(), '']);
        const result = await dbSelect('SELECT last_insert_rowid() AS id', []);
        const nuevaId = result[0].id;

        // Recargar el arreglo global
        this.categorias = await dbSelect('SELECT id, nombre FROM rv_categorias ORDER BY nombre', []);

        // Rellenar de nuevo el filtro y el formulario
        const selFilter = document.getElementById('prod-filter-cat');
        if (selFilter) {
          selFilter.innerHTML = '<option value="">Todas las categorías</option>';
          this.llenarCategoriasFiltro();
        }

        const selForm = document.getElementById('prod-categoria');
        if (selForm) {
          selForm.innerHTML = '<option value="">-- Seleccionar --</option>';
          this.llenarCategoriasForm();
          // Autoseleccionarla en el select del modal actual
          selForm.value = nuevaId;
        }

        if (window.showToast) {
          window.showToast(`Categoría "${nombreCategoria}" creada.`, 'green');
        }

      } catch (err) {
        console.error("Error creando categoría", err);
        alert("Ocurrió un error al crear la categoría.");
      }
    }
  },

  filtrados() {
    const busqueda = (document.getElementById('prod-search')?.value || '').toLowerCase();
    const cat = document.getElementById('prod-filter-cat')?.value || '';
    const estatus = document.getElementById('prod-filter-estatus')?.value || '';

    return this.productos.filter(p => {
      const matchNombre = p.pr_nombre.toLowerCase().includes(busqueda);
      const matchCat = !cat || String(p.categoria_id) === cat;
      const matchEstatus = estatus === '' || String(p.pr_estatus) === estatus;
      return matchNombre && matchCat && matchEstatus;
    });
  },

  renderTabla() {
    const tbody = document.getElementById('prod-tbody');
    if (!tbody) return;
    const lista = this.filtrados();

    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#6c757d;">
        Sin productos que coincidan.
      </td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map(p => {
      const stockBadge = p.pr_stock === null || p.pr_stock === undefined
        ? `<span class="prod-badge prod-badge-info">Sin control</span>`
        : p.pr_stock <= 0
          ? `<span class="prod-badge prod-badge-danger">Agotado (${p.pr_stock})</span>`
          : `<span class="prod-badge prod-badge-success">${p.pr_stock}</span>`;

      const estatusBadge = p.pr_estatus
        ? `<span class="prod-badge prod-badge-success">Activo</span>`
        : `<span class="prod-badge prod-badge-secondary">Inactivo</span>`;

      const favIcon = p.pr_favorito ? '⭐ ' : '';

      return `
      <tr class="${p.pr_estatus ? '' : 'prod-row-inactivo'}">
        <td style="color:#6c757d; font-size:.85rem;">${p.ID}</td>
        <td>
          <div class="prod-nombre-cell">${favIcon}<strong>${p.pr_nombre}</strong></div>
          ${p.pr_descripcion ? `<small style="color:#6c757d;">${p.pr_descripcion}</small>` : ''}
        </td>
        <td><span class="prod-badge prod-badge-cat">${p.pr_categoria || '—'}</span></td>
        <td style="font-weight:700; color:#28a745;">$${Number(p.pr_precioventa).toFixed(2)}</td>
        <td>${stockBadge}</td>
        <td>${estatusBadge}</td>
        <td>
          <div class="prod-actions">
            <button class="prod-btn-icon btn-editar" data-id="${p.ID}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="prod-btn-icon ${p.pr_estatus ? 'btn-danger' : 'btn-success'} btn-toggle"
                    data-id="${p.ID}" data-estatus="${p.pr_estatus}"
                    title="${p.pr_estatus ? 'Desactivar' : 'Activar'}">
              <i class="fas ${p.pr_estatus ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  },

  abrirModalNuevo() {
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-nombre').value = '';
    document.getElementById('prod-categoria').value = '';
    document.getElementById('prod-precio-venta').value = '';
    document.getElementById('prod-precio-compra').value = '0';
    document.getElementById('prod-stock').value = '';
    document.getElementById('prod-stock-min').value = '10';
    document.getElementById('prod-descripcion').value = '';
    document.getElementById('prod-favorito').checked = false;
    document.getElementById('prod-activo').checked = true;
    document.getElementById('modal-prod-error').style.display = 'none';
    setText('modal-prod-title', 'Nuevo Producto');
    openModal('modal-producto');
    document.getElementById('prod-nombre')?.focus();
  },

  editarProducto(id) {
    const p = this.productos.find(x => x.ID === id);
    if (!p) return;
    document.getElementById('prod-id').value = p.ID;
    document.getElementById('prod-nombre').value = p.pr_nombre;
    document.getElementById('prod-categoria').value = p.categoria_id || '';
    document.getElementById('prod-precio-venta').value = p.pr_precioventa;
    document.getElementById('prod-precio-compra').value = p.pr_preciocompra || 0;
    document.getElementById('prod-stock').value = p.pr_stock ?? '';
    document.getElementById('prod-stock-min').value = p.pr_stock_minimo || 10;
    document.getElementById('prod-descripcion').value = p.pr_descripcion || '';
    document.getElementById('prod-favorito').checked = p.pr_favorito == 1;
    document.getElementById('prod-activo').checked = p.pr_estatus == 1;
    document.getElementById('modal-prod-error').style.display = 'none';
    setText('modal-prod-title', 'Editar Producto');
    openModal('modal-producto');
  },

  async guardarProducto() {
    const id = document.getElementById('prod-id').value;
    const nombre = document.getElementById('prod-nombre').value.trim();
    const categoriaId = document.getElementById('prod-categoria').value;
    const precio = parseFloat(document.getElementById('prod-precio-venta').value);
    const costo = parseFloat(document.getElementById('prod-precio-compra').value) || 0;
    const stockVal = document.getElementById('prod-stock').value.trim();
    const stock = stockVal === '' ? null : parseInt(stockVal);
    const stockMin = parseInt(document.getElementById('prod-stock-min').value) || 10;
    const descripcion = document.getElementById('prod-descripcion').value.trim();
    const favorito = document.getElementById('prod-favorito').checked ? 1 : 0;
    const activo = document.getElementById('prod-activo').checked ? 1 : 0;

    const errEl = document.getElementById('modal-prod-error');

    if (!nombre) {
      errEl.textContent = 'El nombre del producto es obligatorio.';
      errEl.style.display = '';
      return;
    }
    if (!categoriaId) {
      errEl.textContent = 'Selecciona una categoría.';
      errEl.style.display = '';
      return;
    }
    if (isNaN(precio) || precio < 0) {
      errEl.textContent = 'El precio de venta debe ser un número válido.';
      errEl.style.display = '';
      return;
    }

    errEl.style.display = 'none';

    try {
      if (id) {
        // Editar
        await dbExecute(
          `UPDATE rv_productos SET
             pr_nombre=$1, categoria_id=$2, pr_precioventa=$3, pr_preciocompra=$4,
             pr_stock=$5, pr_stock_minimo=$6, pr_descripcion=$7,
             pr_favorito=$8, pr_estatus=$9
           WHERE ID=$10`,
          [nombre, categoriaId, precio, costo, stock, stockMin, descripcion || null, favorito, activo, parseInt(id)]
        );
      } else {
        // Crear
        await dbExecute(
          `INSERT INTO rv_productos
             (pr_nombre, categoria_id, pr_precioventa, pr_preciocompra,
              pr_stock, pr_stock_minimo, pr_descripcion, pr_favorito, pr_estatus)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [nombre, categoriaId, precio, costo, stock, stockMin, descripcion || null, favorito, activo]
        );
      }
      closeModal('modal-producto');
      await this.cargarProductos();
      this.showAlert('✅ Guardado', id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', 'success');
    } catch (err) {
      errEl.textContent = 'Error al guardar: ' + (err.message || err);
      errEl.style.display = '';
    }
  },

  async toggleEstatus(id, estatusActual) {
    const nuevoEstatus = estatusActual ? 0 : 1;
    const accion = nuevoEstatus ? 'activar' : 'desactivar';
    this.showConfirm(
      '¿Confirmar acción?',
      `¿Deseas ${accion} este producto?`,
      'warning',
      async () => {
        await dbExecute(`UPDATE rv_productos SET pr_estatus=$1 WHERE ID=$2`, [nuevoEstatus, id]);
        await this.cargarProductos();
      }
    );
  },

  showAlert(title, msg, type = 'info', onClose = null) {
    const colors = {
      success: 'linear-gradient(135deg,#28a745,#20c997)',
      error: 'linear-gradient(135deg,#dc3545,#c82333)',
      warning: 'linear-gradient(135deg,#ffc107,#ff9800)',
      info: 'linear-gradient(135deg,#4a90e2,#357abd)',
    };
    const header = document.getElementById('prod-alert-header');
    const titleEl = document.getElementById('prod-alert-title');
    const bodyEl = document.getElementById('prod-alert-body');
    const cancel = document.getElementById('prod-alert-cancel');
    const confirm = document.getElementById('prod-alert-confirm');
    if (header) header.style.background = colors[type] || colors.info;
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = msg;
    if (cancel) { cancel.style.display = 'none'; cancel.onclick = null; }
    if (confirm) { confirm.textContent = 'Aceptar'; confirm.onclick = () => { closeAlert(); if (onClose) onClose(); }; }
    openModal('prod-alert-overlay');
  },

  showConfirm(title, msg, type = 'warning', onConfirm = null) {
    const colors = {
      warning: 'linear-gradient(135deg,#ffc107,#ff9800)',
      info: 'linear-gradient(135deg,#4a90e2,#357abd)',
    };
    const header = document.getElementById('prod-alert-header');
    const titleEl = document.getElementById('prod-alert-title');
    const bodyEl = document.getElementById('prod-alert-body');
    const cancel = document.getElementById('prod-alert-cancel');
    const confirm = document.getElementById('prod-alert-confirm');
    if (header) header.style.background = colors[type] || colors.warning;
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = msg;
    if (cancel) { cancel.style.display = ''; cancel.textContent = 'Cancelar'; cancel.onclick = () => closeAlert(); }
    if (confirm) { confirm.textContent = 'Confirmar'; confirm.onclick = () => { closeAlert(); if (onConfirm) onConfirm(); }; }
    openModal('prod-alert-overlay');
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function on(id, ev, fn) { document.getElementById(id)?.addEventListener(ev, fn); }
function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
function closeAlert() { closeModal('prod-alert-overlay'); }
