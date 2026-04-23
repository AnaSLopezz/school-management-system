// frontend/js/estudiante.js

async function cargarMisNotas() {
  const datos = await apiRequest('/notas/mis-notas');
  if (!datos) return;

  const promediosContainer = document.getElementById('promedios-cards');

  if (datos.promedios && datos.promedios.length > 0) {
    promediosContainer.innerHTML = datos.promedios.map(p => {
      const color = p.promedio >= 80 ? '#166534' : p.promedio >= 60 ? '#92400e' : '#991b1b';
      const bg    = p.promedio >= 80 ? '#dcfce7' : p.promedio >= 60 ? '#fef3c7' : '#fee2e2';
      return `
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
          </div>
          <div>
            <div class="stat-val" style="color:${color};background:${bg};padding:2px 10px;border-radius:6px;display:inline-block">${p.promedio}</div>
            <div class="stat-lbl" style="margin-top:4px">${p.materia}</div>
            <div style="font-size:11px;color:#94a3b8">${p.total_notas} calificaciones</div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    promediosContainer.innerHTML = '<p style="color:#94a3b8;font-size:13px">No hay calificaciones registradas aún</p>';
  }

  const tbody = document.getElementById('tbody-mis-notas');

  if (!datos.notas || datos.notas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-td">No hay notas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = datos.notas.map(n => `
    <tr>
      <td><strong>${n.materia}</strong></td>
      <td>${n.descripcion}</td>
      <td class="${n.nota >= 80 ? 'nota-alta' : n.nota >= 60 ? 'nota-media' : 'nota-baja'}">${n.nota}</td>
      <td style="color:#64748b">${n.nota_maxima}</td>
      <td>
        <div style="background:#f1f5f9;border-radius:4px;overflow:hidden;height:6px;margin-bottom:3px">
          <div style="background:${n.porcentaje>=80?'#166534':n.porcentaje>=60?'#92400e':'#991b1b'};height:100%;width:${Math.min(n.porcentaje,100)}%;border-radius:4px"></div>
        </div>
        <small style="color:#64748b">${n.porcentaje}%</small>
      </td>
      <td style="color:#64748b">${new Date(n.fecha).toLocaleDateString('es-CO')}</td>
    </tr>
  `).join('');
}

async function cargarMisTareas() {
  const datos = await apiRequest('/tareas/mis-tareas');
  if (!datos) return;

  const container = document.getElementById('mis-tareas-lista');

  if (datos.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#94a3b8">
        <div style="font-size:48px;margin-bottom:12px">📋</div>
        <p style="font-size:14px">No hay tareas asignadas</p>
      </div>`;
    return;
  }

  const ahora = new Date();

  container.innerHTML = datos.map(t => {
    const vencida = new Date(t.fecha_entrega) < ahora && !t.entregada;
    let estado, badgeClass;

    if (t.entregada) {
      estado     = t.calificacion !== null ? `Entregada — ${t.calificacion} pts` : 'Entregada';
      badgeClass = 'badge-entregada';
    } else if (vencida) {
      estado = 'Vencida';
      badgeClass = 'badge-vencida';
    } else {
      estado = 'Pendiente';
      badgeClass = 'badge-pendiente';
    }

    return `
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
          <span class="badge ${badgeClass}">${estado}</span>
          ${!t.entregada && !vencida
            ? `<button onclick="abrirModalEntregar(${t.id},'${t.titulo.replace(/'/g,"\\'")}')" class="btn btn-sm btn-primary">Entregar</button>`
            : ''}
        </div>
      </div>
    `;
  }).join('');
}

function abrirModalEntregar(tareaId, titulo) {
  abrirModal(`Entregar: ${titulo}`, `
    <p style="font-size:13px;color:#64748b;margin-bottom:16px">Escribe tu respuesta o el contenido de tu entrega:</p>
    <div class="form-group">
      <label>Contenido de la entrega</label>
      <textarea id="entrega-contenido" rows="6" placeholder="Escribe aquí tu respuesta o enlace al trabajo..."></textarea>
    </div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="enviarEntrega(${tareaId})" class="btn btn-primary">Enviar entrega</button>
    </div>
  `);
}

async function enviarEntrega(tareaId) {
  const contenido = document.getElementById('entrega-contenido').value;

  if (!contenido.trim()) {
    mostrarToast('Debes escribir algo antes de entregar', 'warning');
    return;
  }

  const datos = await apiRequest(`/tareas/${tareaId}/entregar`, {
    method: 'POST',
    body: JSON.stringify({ contenido })
  });

  if (datos?.id) {
    mostrarToast('Tarea entregada exitosamente');
    cerrarModal();
    cargarMisTareas();
  } else {
    mostrarToast(datos?.error || 'Error al entregar', 'error');
  }
}