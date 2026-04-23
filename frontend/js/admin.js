// frontend/js/admin.js

let todosLosUsuarios = [];
let todasLasMaterias = [];

// ── UTILIDAD: tabla con buscador y paginación ────────────────
function crearTabla({ contenedor, columnas, datos, renderFila, porPagina = 10 }) {
  let paginaActual = 1;
  let datosFiltrados = [...datos];
  let ordenCol = null;
  let ordenDir = 'asc';

  function render() {
    const inicio = (paginaActual - 1) * porPagina;
    const fin    = inicio + porPagina;
    const pagina = datosFiltrados.slice(inicio, fin);
    const total  = datosFiltrados.length;
    const totalPags = Math.ceil(total / porPagina);

    contenedor.innerHTML = `
      <div class="table-wrap">
        <div class="table-toolbar">
          <div class="search-wrap">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" class="search-input" placeholder="Buscar..." oninput="filtrarTabla(this, '${contenedor.id}')">
          </div>
          <span class="table-info">${total} registros</span>
        </div>
        <table>
          <thead>
            <tr>
              ${columnas.map(c => `
                <th onclick="ordenarTabla('${contenedor.id}', '${c.key}')" class="${ordenCol===c.key?(ordenDir==='asc'?'sorted-asc':'sorted-desc'):''}">
                  ${c.label}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${pagina.length === 0
              ? `<tr><td colspan="${columnas.length}" class="empty-td">No se encontraron resultados</td></tr>`
              : pagina.map(item => renderFila(item)).join('')
            }
          </tbody>
        </table>
        ${totalPags > 1 ? `
          <div class="pagination">
            <span class="page-info">Página ${paginaActual} de ${totalPags}</span>
            <div class="page-btns">
              <button class="page-btn" onclick="cambiarPagina('${contenedor.id}', ${paginaActual - 1})" ${paginaActual===1?'disabled':''}>&#8592;</button>
              ${Array.from({length: Math.min(totalPags, 5)}, (_,i) => i + 1).map(p => `
                <button class="page-btn ${p===paginaActual?'active':''}" onclick="cambiarPagina('${contenedor.id}', ${p})">${p}</button>
              `).join('')}
              <button class="page-btn" onclick="cambiarPagina('${contenedor.id}', ${paginaActual + 1})" ${paginaActual===totalPags?'disabled':''}>&#8594;</button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    window[`_tabla_${contenedor.id}`] = { datos, datosFiltrados, paginaActual, porPagina, columnas, renderFila, ordenCol, ordenDir };
  }

  window[`_tabla_${contenedor.id}`] = { datos, datosFiltrados, paginaActual, porPagina, columnas, renderFila, ordenCol, ordenDir, render };
  render();
}

function filtrarTabla(input, tablaId) {
  const t = window[`_tabla_${tablaId}`];
  if (!t) return;
  const q = input.value.toLowerCase();
  t.datosFiltrados = t.datos.filter(d =>
    Object.values(d).some(v => String(v).toLowerCase().includes(q))
  );
  t.paginaActual = 1;
  t.render();
}

function cambiarPagina(tablaId, pagina) {
  const t = window[`_tabla_${tablaId}`];
  if (!t) return;
  const total = Math.ceil(t.datosFiltrados.length / t.porPagina);
  if (pagina < 1 || pagina > total) return;
  t.paginaActual = pagina;
  t.render();
}

function ordenarTabla(tablaId, key) {
  const t = window[`_tabla_${tablaId}`];
  if (!t) return;
  if (t.ordenCol === key) {
    t.ordenDir = t.ordenDir === 'asc' ? 'desc' : 'asc';
  } else {
    t.ordenCol = key;
    t.ordenDir = 'asc';
  }
  t.datosFiltrados.sort((a, b) => {
    const va = String(a[key] || '').toLowerCase();
    const vb = String(b[key] || '').toLowerCase();
    return t.ordenDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });
  t.paginaActual = 1;
  t.render();
}

// ── USUARIOS ─────────────────────────────────────────────────
async function cargarUsuarios() {
  const datos = await apiRequest('/usuarios');
  if (!datos) return;
  todosLosUsuarios = datos;
  renderizarUsuarios(datos);
}

function renderizarUsuarios(usuarios) {
  const contenedor = document.getElementById('tbody-usuarios')?.closest('.table-wrap')?.parentElement
    || document.querySelector('#panel-usuarios .table-wrap')?.parentElement;

  const wrapper = document.createElement('div');
  wrapper.id = 'tabla-usuarios-wrap';

  const existing = document.getElementById('tabla-usuarios-wrap');
  if (existing) existing.remove();

  const panelUsuarios = document.getElementById('panel-usuarios');
  const filtros = panelUsuarios.querySelector('.filtros');
  filtros.after(wrapper);

  crearTabla({
    contenedor: wrapper,
    columnas: [
      { label: 'ID',     key: 'id'     },
      { label: 'Nombre', key: 'nombre' },
      { label: 'Email',  key: 'email'  },
      { label: 'Rol',    key: 'rol'    },
      { label: 'Estado', key: 'activo' },
      { label: 'Acciones', key: '_'   },
    ],
    datos: usuarios,
    renderFila: u => `
      <tr>
        <td style="color:#64748b;font-size:12px">#${u.id}</td>
        <td><strong>${u.nombre}</strong></td>
        <td style="color:#64748b">${u.email}</td>
        <td><span class="badge badge-${u.rol}">${u.rol}</span></td>
        <td><span class="badge ${u.activo ? 'badge-activo' : 'badge-inactivo'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button onclick="editarUsuario(${u.id})" class="btn btn-sm btn-secondary">Editar</button>
            <button onclick="eliminarUsuario(${u.id},'${u.nombre.replace(/'/g,"\\'")}' )" class="btn btn-sm btn-danger">Desactivar</button>
          </div>
        </td>
      </tr>
    `
  });
}

function filtrarUsuarios(rol, btn) {
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderizarUsuarios(rol === 'todos' ? todosLosUsuarios : todosLosUsuarios.filter(u => u.rol === rol));
}

function abrirModalCrearUsuario() {
  abrirModal('Nuevo Usuario', `
    <div class="form-group">
      <label>Nombre completo</label>
      <input type="text" id="nuevo-nombre" placeholder="Juan Pérez">
    </div>
    <div class="form-group">
      <label>Correo electrónico</label>
      <input type="email" id="nuevo-email" placeholder="juan@colegio.edu">
    </div>
    <div class="form-group">
      <label>Contraseña</label>
      <input type="password" id="nuevo-password" placeholder="Mínimo 6 caracteres">
    </div>
    <div class="form-group">
      <label>Rol</label>
      <select id="nuevo-rol">
        <option value="estudiante">Estudiante</option>
        <option value="profesor">Profesor</option>
        <option value="admin">Administrador</option>
      </select>
    </div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="crearUsuario()" class="btn btn-primary">Crear Usuario</button>
    </div>
  `);
}

async function crearUsuario() {
  const nombre    = document.getElementById('nuevo-nombre').value;
  const email     = document.getElementById('nuevo-email').value;
  const contrasena = document.getElementById('nuevo-password').value;
  const rol       = document.getElementById('nuevo-rol').value;
  if (!nombre || !email || !contrasena) { mostrarToast('Completa todos los campos', 'warning'); return; }
  const datos = await apiRequest('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({ nombre, email, contrasena, rol })
  });
  if (datos?.id) { mostrarToast(`Usuario "${nombre}" creado`); cerrarModal(); cargarUsuarios(); }
  else mostrarToast(datos?.error || 'Error al crear usuario', 'error');
}

async function editarUsuario(id) {
  const u = todosLosUsuarios.find(u => u.id === id);
  if (!u) return;
  abrirModal('Editar Usuario', `
    <div class="form-group"><label>Nombre</label><input type="text" id="edit-nombre" value="${u.nombre}"></div>
    <div class="form-group"><label>Email</label><input type="email" id="edit-email" value="${u.email}"></div>
    <div class="form-group"><label>Nueva contraseña (vacío = no cambiar)</label><input type="password" id="edit-password" placeholder="Nueva contraseña"></div>
    <div class="form-group">
      <label>Rol</label>
      <select id="edit-rol">
        <option value="estudiante" ${u.rol==='estudiante'?'selected':''}>Estudiante</option>
        <option value="profesor"   ${u.rol==='profesor'  ?'selected':''}>Profesor</option>
        <option value="admin"      ${u.rol==='admin'     ?'selected':''}>Admin</option>
      </select>
    </div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="guardarEdicionUsuario(${id})" class="btn btn-primary">Guardar</button>
    </div>
  `);
}

async function guardarEdicionUsuario(id) {
  const contrasena = document.getElementById('edit-password').value;
  const datos = { nombre: document.getElementById('edit-nombre').value, email: document.getElementById('edit-email').value, rol: document.getElementById('edit-rol').value };
  if (contrasena) datos.contrasena = contrasena;
  const r = await apiRequest(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
  if (r?.mensaje) { mostrarToast('Usuario actualizado'); cerrarModal(); cargarUsuarios(); }
}

async function eliminarUsuario(id, nombre) {
  if (!confirm(`¿Desactivar a "${nombre}"?`)) return;
  const r = await apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
  if (r?.mensaje) { mostrarToast(`"${nombre}" desactivado`); cargarUsuarios(); }
}

// ── MATERIAS ─────────────────────────────────────────────────
async function cargarMaterias() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const datos = usuario.rol === 'estudiante'
    ? await apiRequest('/materias/mis-materias')
    : await apiRequest('/materias');
  if (!datos) return;
  todasLasMaterias = datos;
  renderizarMaterias(datos);
}

function renderizarMaterias(materias) {
  const container = document.getElementById('materias-grid');
  const usuario   = JSON.parse(localStorage.getItem('usuario'));
  if (!container) return;

  if (materias.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#94a3b8"><p>No hay materias disponibles</p></div>`;
    return;
  }

  container.innerHTML = materias.map(m => `
    <div class="materia-card">
      <h3>${m.nombre}</h3>
      <p class="profe">${m.profesor_nombre ? `Profesor: ${m.profesor_nombre}` : 'Sin profesor asignado'}</p>
      ${m.descripcion ? `<p style="font-size:12px;color:#64748b;margin-bottom:12px">${m.descripcion}</p>` : ''}
      ${m.total_estudiantes !== undefined ? `<p style="font-size:12px;color:#94a3b8;margin-bottom:12px">${m.total_estudiantes} estudiantes</p>` : ''}
      <div class="acciones">
        ${usuario.rol === 'admin' ? `
          <button onclick="editarMateria(${m.id})" class="btn btn-sm btn-secondary">Editar</button>
          <button onclick="eliminarMateria(${m.id})" class="btn btn-sm btn-danger">Eliminar</button>
        ` : ''}
        <button onclick="verEstudiantesMateria(${m.id},'${m.nombre.replace(/'/g,"\\'")}' )" class="btn btn-sm btn-primary">Ver estudiantes</button>
      </div>
    </div>
  `).join('');
}

function abrirModalCrearMateria() {
  abrirModal('Nueva Materia', `
    <div class="form-group"><label>Nombre</label><input type="text" id="materia-nombre" placeholder="Ej: Matemáticas 10°"></div>
    <div class="form-group"><label>Descripción (opcional)</label><textarea id="materia-desc" rows="3"></textarea></div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="crearMateria()" class="btn btn-primary">Crear Materia</button>
    </div>
  `);
}

async function crearMateria() {
  const nombre = document.getElementById('materia-nombre').value;
  const descripcion = document.getElementById('materia-desc').value;
  if (!nombre) { mostrarToast('El nombre es obligatorio', 'warning'); return; }
  const datos = await apiRequest('/materias', { method: 'POST', body: JSON.stringify({ nombre, descripcion }) });
  if (datos?.id) { mostrarToast('Materia creada'); cerrarModal(); cargarMaterias(); }
}

async function editarMateria(id) {
  const m = todasLasMaterias.find(m => m.id === id);
  if (!m) return;
  abrirModal('Editar Materia', `
    <div class="form-group"><label>Nombre</label><input type="text" id="edit-materia-nombre" value="${m.nombre}"></div>
    <div class="form-group"><label>Descripción</label><textarea id="edit-materia-desc" rows="3">${m.descripcion||''}</textarea></div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="guardarEdicionMateria(${id})" class="btn btn-primary">Guardar</button>
    </div>
  `);
}

async function guardarEdicionMateria(id) {
  const nombre = document.getElementById('edit-materia-nombre').value;
  const descripcion = document.getElementById('edit-materia-desc').value;
  const r = await apiRequest(`/materias/${id}`, { method: 'PUT', body: JSON.stringify({ nombre, descripcion }) });
  if (r?.mensaje) { mostrarToast('Materia actualizada'); cerrarModal(); cargarMaterias(); }
}

async function eliminarMateria(id) {
  if (!confirm('¿Eliminar esta materia?')) return;
  const r = await apiRequest(`/materias/${id}`, { method: 'DELETE' });
  if (r?.mensaje) { mostrarToast('Materia eliminada'); cargarMaterias(); }
}

async function verEstudiantesMateria(id, nombre) {
  const estudiantes = await apiRequest(`/materias/${id}/estudiantes`);
  if (!estudiantes) return;
  const contenido = estudiantes.length === 0
    ? '<p style="text-align:center;color:#94a3b8;padding:1rem">No hay estudiantes inscritos</p>'
    : `<div class="table-wrap"><table>
        <thead><tr><th>Nombre</th><th>Email</th><th>Grado</th></tr></thead>
        <tbody>${estudiantes.map(e => `<tr><td><strong>${e.nombre}</strong></td><td style="color:#64748b">${e.email}</td><td>${e.grado||'-'}</td></tr>`).join('')}</tbody>
      </table></div>`;
  abrirModal(`Estudiantes: ${nombre}`, contenido);
}