// frontend/js/profesor.js

// ── NOTAS ────────────────────────────────────────────────────
async function cargarMateriasParaNotas() {
  const materias = await apiRequest('/materias/mis-materias');
  if (!materias) return;

  const select = document.getElementById('select-materia-notas');
  if (!select) return;

  select.innerHTML = '<option value="">-- Selecciona una materia --</option>';
  materias.forEach(m => {
    const opt = document.createElement('option');
    opt.value       = m.id;
    opt.textContent = m.nombre;
    select.appendChild(opt);
  });
}

async function cargarEstudiantesNotas() {
  const materiaId = document.getElementById('select-materia-notas').value;
  if (!materiaId) return;

  document.getElementById('tabla-notas-container').classList.remove('hidden');

  const notas = await apiRequest(`/notas/materia/${materiaId}`);
  if (!notas) return;

  const tbody = document.getElementById('tbody-notas');

  if (notas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-td">No hay notas en esta materia</td></tr>';
    return;
  }

  tbody.innerHTML = notas.map(n => `
    <tr>
      <td><strong>${n.estudiante_nombre}</strong></td>
      <td>${n.descripcion}</td>
      <td class="${getClaseNota(n.nota, n.nota_maxima)}">${n.nota}</td>
      <td style="color:#64748b">${n.nota_maxima}</td>
      <td style="color:#64748b">${new Date(n.fecha).toLocaleDateString('es-CO')}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button onclick="editarNota(${n.id},${n.nota},${n.nota_maxima},'${n.descripcion.replace(/'/g,"\\'")}')" class="btn btn-sm btn-secondary">Editar</button>
          <button onclick="eliminarNota(${n.id})" class="btn btn-sm btn-danger">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function getClaseNota(nota, maximo) {
  const pct = (nota / maximo) * 100;
  if (pct >= 80) return 'nota-alta';
  if (pct >= 60) return 'nota-media';
  return 'nota-baja';
}

async function abrirModalAgregarNota() {
  const materiaId = document.getElementById('select-materia-notas').value;
  if (!materiaId) { mostrarToast('Selecciona una materia primero', 'warning'); return; }

  const estudiantes = await apiRequest(`/materias/${materiaId}/estudiantes`);

  abrirModal('Agregar Nota', `
    <div class="form-group">
      <label>Estudiante</label>
      <select id="nota-estudiante">
        <option value="">-- Selecciona estudiante --</option>
        ${(estudiantes || []).map(e => `<option value="${e.estudiante_id}">${e.nombre}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <input type="text" id="nota-desc" placeholder="Ej: Parcial 1, Examen Final">
    </div>
    <div class="form-group">
      <label>Nota obtenida</label>
      <input type="number" id="nota-valor" placeholder="Ej: 85" min="0" step="0.5">
    </div>
    <div class="form-group">
      <label>Nota máxima</label>
      <input type="number" id="nota-maxima" value="100" min="1">
    </div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="guardarNota(${materiaId})" class="btn btn-primary">Guardar Nota</button>
    </div>
  `);
}

async function guardarNota(materiaId) {
  const estudiante_id = document.getElementById('nota-estudiante').value;
  const descripcion   = document.getElementById('nota-desc').value;
  const nota          = document.getElementById('nota-valor').value;
  const nota_maxima   = document.getElementById('nota-maxima').value;

  if (!estudiante_id || !descripcion || !nota) {
    mostrarToast('Completa todos los campos', 'warning');
    return;
  }

  const datos = await apiRequest('/notas', {
    method: 'POST',
    body: JSON.stringify({
      estudiante_id: parseInt(estudiante_id),
      materia_id:    parseInt(materiaId),
      descripcion,
      nota:          parseFloat(nota),
      nota_maxima:   parseFloat(nota_maxima)
    })
  });

  if (datos?.id) {
    mostrarToast('Nota registrada correctamente');
    cerrarModal();
    cargarEstudiantesNotas();
  } else {
    mostrarToast(datos?.error || 'Error al guardar nota', 'error');
  }
}

function editarNota(id, notaActual, notaMaxima, descripcionActual) {
  abrirModal('Editar Nota', `
    <div class="form-group">
      <label>Descripción</label>
      <input type="text" id="edit-nota-desc" value="${descripcionActual}">
    </div>
    <div class="form-group">
      <label>Nota obtenida</label>
      <input type="number" id="edit-nota-valor" value="${notaActual}" min="0" step="0.5">
    </div>
    <div class="form-group">
      <label>Nota máxima</label>
      <input type="number" id="edit-nota-maxima" value="${notaMaxima}" min="1">
    </div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="guardarEdicionNota(${id})" class="btn btn-primary">Guardar Cambios</button>
    </div>
  `);
}

async function guardarEdicionNota(id) {
  const descripcion = document.getElementById('edit-nota-desc').value;
  const nota        = document.getElementById('edit-nota-valor').value;
  const nota_maxima = document.getElementById('edit-nota-maxima').value;

  if (!descripcion || !nota) {
    mostrarToast('Completa todos los campos', 'warning');
    return;
  }

  const datos = await apiRequest(`/notas/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ descripcion, nota: parseFloat(nota), nota_maxima: parseFloat(nota_maxima) })
  });

  if (datos?.mensaje) {
    mostrarToast('Nota actualizada');
    cerrarModal();
    cargarEstudiantesNotas();
  } else {
    mostrarToast('Error al actualizar nota', 'error');
  }
}

async function eliminarNota(id) {
  if (!confirm('¿Eliminar esta nota?')) return;
  const datos = await apiRequest(`/notas/${id}`, { method: 'DELETE' });
  if (datos?.mensaje) { mostrarToast('Nota eliminada'); cargarEstudiantesNotas(); }
}

// ── TAREAS ───────────────────────────────────────────────────
async function cargarTareas() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const container = document.getElementById('tareas-lista');
  if (!container) return;

  if (usuario.rol === 'profesor') {
    const materias = await apiRequest('/materias/mis-materias');
    if (!materias || materias.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:3rem;color:#94a3b8"><p>No tienes materias asignadas</p></div>';
      return;
    }

    let todas = [];
    for (const m of materias) {
      const tareas = await apiRequest(`/tareas/materia/${m.id}`);
      if (tareas) todas = [...todas, ...tareas.map(t => ({ ...t, materia_nombre: m.nombre }))];
    }
    renderizarTareasProfesor(todas);
  }
}

function renderizarTareasProfesor(tareas) {
  const container = document.getElementById('tareas-lista');

  if (tareas.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#94a3b8">
        <div style="font-size:48px;margin-bottom:12px">📋</div>
        <p style="font-size:14px">No hay tareas creadas</p>
      </div>`;
    return;
  }

  container.innerHTML = tareas.map(t => `
    <div class="tarea-card">
      <div class="tarea-info">
        <h4>${t.titulo}</h4>
        <p>${t.descripcion || 'Sin descripción'}</p>
        <div class="tarea-meta">
          ${t.materia_nombre} &nbsp;·&nbsp;
          Entrega: ${new Date(t.fecha_entrega).toLocaleString('es-CO')} &nbsp;·&nbsp;
          ${t.puntos_maximos} puntos
        </div>
      </div>
      <div class="tarea-acciones">
        <button onclick="verEntregasTarea(${t.id},'${t.titulo.replace(/'/g, "\\'")}' )" class="btn btn-sm btn-primary">Ver entregas</button>
        <button onclick="compartirTarea(${t.id},'${t.titulo.replace(/'/g, "\\'")}' )" class="btn btn-sm btn-share">Compartir</button>
        <button onclick="eliminarTarea(${t.id})" class="btn btn-sm btn-danger">Eliminar</button>
      </div>
    </div>
  `).join('');
}

async function abrirModalCrearTarea() {
  const materias = await apiRequest('/materias/mis-materias');

  abrirModal('Nueva Tarea', `
    <div class="form-group">
      <label>Materia</label>
      <select id="tarea-materia">
        <option value="">-- Selecciona materia --</option>
        ${(materias || []).map(m => `<option value="${m.id}">${m.nombre}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Título</label>
      <input type="text" id="tarea-titulo" placeholder="Ej: Taller de ecuaciones">
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea id="tarea-desc" rows="3" placeholder="Instrucciones de la tarea..."></textarea>
    </div>
    <div class="form-group">
      <label>Fecha límite de entrega</label>
      <input type="datetime-local" id="tarea-fecha">
    </div>
    <div class="form-group">
      <label>Puntos máximos</label>
      <input type="number" id="tarea-puntos" value="100" min="1">
    </div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="crearTarea()" class="btn btn-primary">Crear Tarea</button>
    </div>
  `);
}

async function crearTarea() {
  const materia_id    = document.getElementById('tarea-materia').value;
  const titulo        = document.getElementById('tarea-titulo').value;
  const descripcion   = document.getElementById('tarea-desc').value;
  const fecha_entrega = document.getElementById('tarea-fecha').value;
  const puntos_maximos = parseFloat(document.getElementById('tarea-puntos').value);

  if (!materia_id || !titulo || !fecha_entrega) {
    mostrarToast('Completa los campos obligatorios', 'warning');
    return;
  }

  const respuesta = await apiRequest('/tareas', {
    method: 'POST',
    body: JSON.stringify({ materia_id: parseInt(materia_id), titulo, descripcion, fecha_entrega, puntos_maximos })
  });

  if (respuesta?.id) {
    mostrarToast('Tarea creada exitosamente');
    cerrarModal();
    cargarTareas();
  } else {
    mostrarToast('Error al crear tarea', 'error');
  }
}

async function eliminarTarea(id) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  const datos = await apiRequest(`/tareas/${id}`, { method: 'DELETE' });
  if (datos?.mensaje) { mostrarToast('Tarea eliminada'); cargarTareas(); }
}

async function verEntregasTarea(tareaId, titulo) {
  const entregas = await apiRequest(`/tareas/${tareaId}/entregas`);
  if (!entregas) return;

  const contenido = entregas.length === 0
    ? '<p style="text-align:center;color:#94a3b8;padding:1rem">No hay entregas aún</p>'
    : `<div class="table-wrap">
        <table>
          <thead><tr><th>Estudiante</th><th>Entregado</th><th>Nota</th><th>Acción</th></tr></thead>
          <tbody>
            ${entregas.map(e => `
              <tr>
                <td><strong>${e.estudiante_nombre}</strong></td>
                <td style="color:#64748b">${new Date(e.entregado_en).toLocaleString('es-CO')}</td>
                <td>${e.calificacion !== null
                  ? `<span class="nota-alta">${e.calificacion}</span>`
                  : '<span style="color:#94a3b8">Sin calificar</span>'}</td>
                <td><button onclick="calificarEntrega(${e.id})" class="btn btn-sm btn-primary">Calificar</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;

  abrirModal(`Entregas: ${titulo}`, contenido);
}

async function calificarEntrega(entregaId) {
  const nota      = prompt('Ingresa la calificación:');
  const comentario = prompt('Comentario (opcional):');
  if (nota === null) return;

  const datos = await apiRequest(`/tareas/entregas/${entregaId}/calificar`, {
    method: 'PUT',
    body: JSON.stringify({ calificacion: parseFloat(nota), comentario_profesor: comentario })
  });

  if (datos?.mensaje) {
    mostrarToast('Entrega calificada correctamente');
    cerrarModal();
  }
}
function compartirTarea(tareaId, titulo) {
  const url = `${window.location.origin}/dashboard.html?tarea=${tareaId}`;

  abrirModal(`Compartir: ${titulo}`, `
    <p style="font-size:13px;color:#64748b;margin-bottom:12px">
      Comparte este enlace con tus estudiantes:
    </p>
    <div class="share-box">
      <span class="share-link">${url}</span>
      <button class="btn-copy" id="btn-copiar" onclick="copiarEnlace('${url}')">Copiar</button>
    </div>
    <p style="font-size:11px;color:#94a3b8;margin-top:10px">
      El estudiante debe iniciar sesión para ver y entregar la tarea.
    </p>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cerrar</button>
    </div>
  `);
}

function copiarEnlace(url) {
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('btn-copiar');
    if (btn) {
      btn.textContent = 'Copiado!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copiar';
        btn.classList.remove('copied');
      }, 2000);
    }
    mostrarToast('Enlace copiado al portapapeles');
  });
}