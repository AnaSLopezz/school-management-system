// frontend/js/dashboard.js

const API = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiRequest(endpoint, opciones = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    ...opciones
  };
  const respuesta = await fetch(`${API}${endpoint}`, config);
  if (respuesta.status === 401) { logout(); return null; }
  return await respuesta.json();
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

function mostrarToast(mensaje, tipo = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function abrirModal(titulo, contenidoHTML) {
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-body').innerHTML = contenidoHTML;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function cerrarModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-body').innerHTML = '';
}

function mostrarPanel(panelId) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const panel = document.getElementById(`panel-${panelId}`);
  if (panel) panel.classList.add('active');
  const navItem = document.querySelector(`[data-panel="${panelId}"]`);
  if (navItem) navItem.classList.add('active');
  cargarDatosPanel(panelId);
}

function cargarDatosPanel(panelId) {
  switch(panelId) {
    case 'usuarios':   cargarUsuarios();          break;
    case 'materias':   cargarMaterias();          break;
    case 'notas':      cargarMateriasParaNotas(); break;
    case 'tareas':     cargarTareas();            break;
    case 'mensajes':   cargarMensajes();          break;
    case 'mis-notas':  cargarMisNotas();          break;
    case 'mis-tareas': cargarMisTareas();         break;
    case 'horario':    cargarMiHorario();         break;
    case 'inicio':     cargarInicio();            break;
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('main-content');
  sidebar.classList.toggle('hidden');
  main.classList.toggle('full');
}

// ── INICIALIZACIÓN ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const token      = getToken();
  const usuarioStr = localStorage.getItem('usuario');
  if (!token || !usuarioStr) { window.location.href = 'index.html'; return; }

  const usuario = JSON.parse(usuarioStr);

  document.getElementById('header-nombre').textContent  = usuario.nombre;
  document.getElementById('welcome-nombre').textContent = usuario.nombre.split(' ')[0];
  document.getElementById('user-avatar').textContent    = usuario.nombre.charAt(0).toUpperCase();
  document.getElementById('header-rol').textContent     = usuario.rol;

  generarMenu(usuario.rol);
  aplicarColorRol(usuario.rol);
  cargarInicio();
  cargarMensajesNoLeidos();
});

// ── MENÚ ─────────────────────────────────────────────────────

// Aplicar color según rol
function aplicarColorRol(rol) {
  document.body.className = `rol-${rol}`;
}

function generarMenu(rol) {
  const menuItems = document.getElementById('menu-items');

  const menus = {
    admin: [
      { seccion: 'Principal', items: [
        { icono: 'inicio',   texto: 'Inicio',   panel: 'inicio'   },
      ]},
      { seccion: 'Gestión', items: [
        { icono: 'usuarios', texto: 'Usuarios', panel: 'usuarios' },
        { icono: 'materias', texto: 'Materias', panel: 'materias' },
        { icono: 'horario',  texto: 'Horarios', panel: 'horario'  },
      ]},
      { seccion: 'Comunicación', items: [
        { icono: 'mensajes', texto: 'Mensajes', panel: 'mensajes' },
      ]}
    ],
    profesor: [
      { seccion: 'Principal', items: [
        { icono: 'inicio',   texto: 'Inicio',       panel: 'inicio'   },
      ]},
      { seccion: 'Académico', items: [
        { icono: 'materias', texto: 'Mis Materias', panel: 'materias' },
        { icono: 'notas',    texto: 'Notas',        panel: 'notas'    },
        { icono: 'tareas',   texto: 'Tareas',       panel: 'tareas'   },
        { icono: 'horario',  texto: 'Mi Horario',   panel: 'horario'  },
      ]},
      { seccion: 'Comunicación', items: [
        { icono: 'mensajes', texto: 'Mensajes',     panel: 'mensajes' },
      ]}
    ],
    estudiante: [
      { seccion: 'Principal', items: [
        { icono: 'inicio',   texto: 'Inicio',       panel: 'inicio'     },
      ]},
      { seccion: 'Académico', items: [
        { icono: 'materias', texto: 'Mis Materias', panel: 'materias'   },
        { icono: 'notas',    texto: 'Mis Notas',    panel: 'mis-notas'  },
        { icono: 'tareas',   texto: 'Mis Tareas',   panel: 'mis-tareas' },
        { icono: 'horario',  texto: 'Mi Horario',   panel: 'horario'    },
      ]},
      { seccion: 'Comunicación', items: [
        { icono: 'mensajes', texto: 'Mensajes',     panel: 'mensajes'   },
      ]}
    ]
  };

  const svgs = {
    inicio:   '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
    usuarios: '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>',
    materias: '<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/></svg>',
    notas:    '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
    tareas:   '<svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14H7v-2h3v2zm0-4H7v-2h3v2zm7 4h-5v-2h5v2zm0-4h-5v-2h5v2z"/></svg>',
    horario:  '<svg viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>',
    mensajes: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>'
  };

  menuItems.innerHTML = menus[rol].map(seccion => `
    <div class="nav-section">
      <div class="nav-section-title">${seccion.seccion}</div>
      ${seccion.items.map(item => `
        <button class="nav-item" data-panel="${item.panel}" onclick="mostrarPanel('${item.panel}')">
          ${svgs[item.icono] || ''}
          <span>${item.texto}</span>
        </button>
      `).join('')}
    </div>
  `).join('');
}

// ── INICIO (panel principal mejorado) ────────────────────────
async function cargarInicio() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const container = document.getElementById('stats-cards');
  if (!container) return;

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  const welcomeEl = document.getElementById('welcome-msg');
  if (welcomeEl) {
    const roles = {
      admin: 'Panel de Administración',
      profesor: 'Panel de Profesor',
      estudiante: 'Panel de Estudiante'
    };
    welcomeEl.textContent = roles[usuario.rol];
  }

  if (usuario.rol === 'admin') await cargarInicioAdmin(container, saludo, usuario);
  else if (usuario.rol === 'profesor') await cargarInicioProfesor(container, saludo, usuario);
  else await cargarInicioEstudiante(container, saludo, usuario);
}

async function cargarInicioAdmin(container, saludo, usuario) {
  const [usuarios, materias, mensajes] = await Promise.all([
    apiRequest('/usuarios'),
    apiRequest('/materias'),
    apiRequest('/mensajes/recibidos')
  ]);
  if (!usuarios || !materias) return;

  const estudiantes  = usuarios.filter(u => u.rol === 'estudiante').length;
  const profesores   = usuarios.filter(u => u.rol === 'profesor').length;
  const noLeidos     = mensajes?.filter(m => !m.leido).length || 0;

  container.innerHTML = `
    <div style="grid-column:1/-1;background:#1a56a0;border-radius:14px;padding:24px 28px;color:white;display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <div>
        <div style="font-size:13px;opacity:0.75;margin-bottom:4px">${saludo}</div>
        <div style="font-size:22px;font-weight:700">${usuario.nombre}</div>
        <div style="font-size:13px;opacity:0.75;margin-top:4px">Administrador del Sistema Escolar</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;opacity:0.7">${new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        <div style="font-size:28px;font-weight:700;margin-top:4px">${new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon blue"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
      <div><div class="stat-val">${estudiantes}</div><div class="stat-lbl">Estudiantes</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
      <div><div class="stat-val">${profesores}</div><div class="stat-lbl">Profesores</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon blue"><svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
      <div><div class="stat-val">${materias.length}</div><div class="stat-lbl">Materias activas</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
      <div><div class="stat-val">${noLeidos}</div><div class="stat-lbl">Mensajes nuevos</div></div>
    </div>

    <div style="grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:4px">
      ${await renderActividadReciente()}
      ${await renderTopEstudiantes()}
    </div>
  `;
}

async function cargarInicioProfesor(container, saludo, usuario) {
  const [materias, mensajes] = await Promise.all([
    apiRequest('/materias/mis-materias'),
    apiRequest('/mensajes/recibidos')
  ]);

  const totalMaterias    = materias?.length || 0;
  const totalEstudiantes = materias?.reduce((s,m) => s + (m.total_estudiantes||0), 0) || 0;
  const noLeidos         = mensajes?.filter(m => !m.leido).length || 0;

  let todasTareas = [];
  if (materias) {
    for (const m of materias) {
      const t = await apiRequest(`/tareas/materia/${m.id}`);
      if (t) todasTareas = [...todasTareas, ...t];
    }
  }

  container.innerHTML = `
    <div style="grid-column:1/-1;background:#1a56a0;border-radius:14px;padding:24px 28px;color:white;display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <div>
        <div style="font-size:13px;opacity:0.75;margin-bottom:4px">${saludo}</div>
        <div style="font-size:22px;font-weight:700">${usuario.nombre}</div>
        <div style="font-size:13px;opacity:0.75;margin-top:4px">Profesor — Sistema Escolar</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;opacity:0.7">${new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        <div style="font-size:28px;font-weight:700;margin-top:4px">${new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon blue"><svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
      <div><div class="stat-val">${totalMaterias}</div><div class="stat-lbl">Mis materias</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
      <div><div class="stat-val">${totalEstudiantes}</div><div class="stat-lbl">Estudiantes</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon purple"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></div>
      <div><div class="stat-val">${todasTareas.length}</div><div class="stat-lbl">Tareas creadas</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
      <div><div class="stat-val">${noLeidos}</div><div class="stat-lbl">Mensajes nuevos</div></div>
    </div>

    <div style="grid-column:1/-1;margin-top:4px">
      ${renderMisMateriasCards(materias || [])}
    </div>
  `;
}

async function cargarInicioEstudiante(container, saludo, usuario) {
  const [notasData, tareas, mensajes] = await Promise.all([
    apiRequest('/notas/mis-notas'),
    apiRequest('/tareas/mis-tareas'),
    apiRequest('/mensajes/recibidos')
  ]);

  const promedioGeneral = notasData?.promedios?.length > 0
    ? (notasData.promedios.reduce((s,p) => s + parseFloat(p.promedio), 0) / notasData.promedios.length).toFixed(1)
    : 'N/A';

  const pendientes = tareas?.filter(t => !t.entregada).length || 0;
  const noLeidos   = mensajes?.filter(m => !m.leido).length || 0;
  const ahora      = new Date();
  const proxima    = tareas?.filter(t => !t.entregada && new Date(t.fecha_entrega) > ahora)
    .sort((a,b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega))[0];

  container.innerHTML = `
    <div style="grid-column:1/-1;background:#1a56a0;border-radius:14px;padding:24px 28px;color:white;display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
      <div>
        <div style="font-size:13px;opacity:0.75;margin-bottom:4px">${saludo}</div>
        <div style="font-size:22px;font-weight:700">${usuario.nombre}</div>
        <div style="font-size:13px;opacity:0.75;margin-top:4px">Estudiante — Sistema Escolar</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;opacity:0.7">${new Date().toLocaleDateString('es-CO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        <div style="font-size:28px;font-weight:700;margin-top:4px">${new Date().toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon blue"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></div>
      <div>
        <div class="stat-val" style="color:${parseFloat(promedioGeneral)>=80?'#166534':parseFloat(promedioGeneral)>=60?'#92400e':'#991b1b'}">${promedioGeneral}</div>
        <div class="stat-lbl">Promedio general</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><svg viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg></div>
      <div><div class="stat-val">${pendientes}</div><div class="stat-lbl">Tareas pendientes</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
      <div><div class="stat-val">${notasData?.promedios?.length||0}</div><div class="stat-lbl">Materias activas</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon purple"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
      <div><div class="stat-val">${noLeidos}</div><div class="stat-lbl">Mensajes nuevos</div></div>
    </div>

    <div style="grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:4px">
      ${renderPromediosPorMateria(notasData?.promedios || [])}
      ${renderProximasTareas(tareas || [])}
    </div>
  `;
}

// ── WIDGETS DEL INICIO ───────────────────────────────────────
async function renderActividadReciente() {
  const mensajes = await apiRequest('/mensajes');
  const items = (mensajes || []).slice(0, 4);

  const colores = ['#166534','#1a56a0','#92400e','#5b21b6'];

  return `
    <div style="background:white;border-radius:12px;border:1px solid #e8eef5;overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">
        Actividad reciente
      </div>
      <div style="padding:14px 16px">
        ${items.length === 0
          ? '<p style="font-size:13px;color:#94a3b8;text-align:center;padding:1rem">Sin actividad reciente</p>'
          : items.map((m, i) => `
            <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;position:relative;padding-left:16px">
              <div style="position:absolute;left:0;top:5px;width:8px;height:8px;border-radius:50%;background:${colores[i%4]}"></div>
              <div>
                <div style="font-size:12px;font-weight:600;color:#1e293b">Mensaje de ${m.emisor_nombre}</div>
                <div style="font-size:11px;color:#64748b;margin-top:1px">${m.asunto || '(Sin asunto)'}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:1px">${new Date(m.enviado_en).toLocaleDateString('es-CO')}</div>
              </div>
            </div>
          `).join('')
        }
      </div>
    </div>
  `;
}

async function renderTopEstudiantes() {
  const usuarios = await apiRequest('/usuarios/rol/estudiantes');
  const items = (usuarios || []).slice(0, 4);
  const colores = [
    {bg:'#dbeafe',color:'#1e40af'},
    {bg:'#ede9fe',color:'#5b21b6'},
    {bg:'#fef3c7',color:'#92400e'},
    {bg:'#fee2e2',color:'#991b1b'}
  ];

  return `
    <div style="background:white;border-radius:12px;border:1px solid #e8eef5;overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">
        Estudiantes registrados
      </div>
      <div style="padding:14px 16px">
        ${items.map((e,i) => `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:0.5px solid #f8fafc">
            <div style="width:30px;height:30px;border-radius:50%;background:${colores[i%4].bg};color:${colores[i%4].color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">
              ${e.nombre.charAt(0)}
            </div>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:600;color:#1e293b">${e.nombre}</div>
              <div style="font-size:11px;color:#94a3b8">${e.grado || 'Sin grado'}</div>
            </div>
            <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:#dcfce7;color:#166534;font-weight:600">Activo</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMisMateriasCards(materias) {
  if (materias.length === 0) return '<p style="color:#94a3b8;font-size:13px">No tienes materias asignadas</p>';

  return `
    <div style="background:white;border-radius:12px;border:1px solid #e8eef5;overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">
        Mis materias
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;background:#f1f5f9">
        ${materias.map(m => `
          <div style="background:white;padding:16px;border-left:3px solid #1a56a0">
            <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:4px">${m.nombre}</div>
            <div style="font-size:11px;color:#94a3b8">${m.total_estudiantes||0} estudiantes</div>
            <button onclick="mostrarPanel('notas')" style="margin-top:8px;padding:4px 10px;background:#eff6ff;border:none;border-radius:6px;font-size:11px;color:#1a56a0;font-weight:600;cursor:pointer">Ver notas</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderPromediosPorMateria(promedios) {
  if (promedios.length === 0) {
    return `
      <div style="background:white;border-radius:12px;border:1px solid #e8eef5;padding:24px;text-align:center;color:#94a3b8">
        <p style="font-size:13px">No hay calificaciones aún</p>
      </div>`;
  }

  return `
    <div style="background:white;border-radius:12px;border:1px solid #e8eef5;overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">
        Rendimiento por materia
      </div>
      <div style="padding:14px 16px">
        ${promedios.map(p => {
          const pct = Math.min(parseFloat(p.promedio), 100);
          const color = pct >= 80 ? '#1a56a0' : pct >= 60 ? '#f59e0b' : '#ef4444';
          const textColor = pct >= 80 ? '#166534' : pct >= 60 ? '#92400e' : '#991b1b';
          const bg = pct >= 80 ? '#dcfce7' : pct >= 60 ? '#fef3c7' : '#fee2e2';
          return `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span style="font-size:12px;color:#334155;font-weight:500">${p.materia}</span>
                <span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:${bg};color:${textColor}">${p.promedio}</span>
              </div>
              <div style="background:#f1f5f9;border-radius:4px;height:6px;overflow:hidden">
                <div style="background:${color};height:100%;width:${pct}%;border-radius:4px;transition:width 0.5s"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderProximasTareas(tareas) {
  const ahora    = new Date();
  const proximas = tareas
    .filter(t => !t.entregada && new Date(t.fecha_entrega) > ahora)
    .sort((a,b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega))
    .slice(0, 4);

  return `
    <div style="background:white;border-radius:12px;border:1px solid #e8eef5;overflow:hidden">
      <div style="padding:14px 16px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">
        Próximas entregas
      </div>
      <div style="padding:14px 16px">
        ${proximas.length === 0
          ? '<p style="font-size:13px;color:#94a3b8;text-align:center;padding:1rem">No hay tareas pendientes</p>'
          : proximas.map(t => {
              const fecha     = new Date(t.fecha_entrega);
              const diasRest  = Math.ceil((fecha - ahora) / (1000*60*60*24));
              const urgente   = diasRest <= 2;
              return `
                <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:0.5px solid #f8fafc">
                  <div style="width:8px;height:8px;border-radius:50%;background:${urgente?'#ef4444':'#1a56a0'};margin-top:5px;flex-shrink:0"></div>
                  <div style="flex:1">
                    <div style="font-size:12px;font-weight:600;color:#1e293b">${t.titulo}</div>
                    <div style="font-size:11px;color:#64748b">${t.materia_nombre}</div>
                  </div>
                  <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;background:${urgente?'#fee2e2':'#eff6ff'};color:${urgente?'#991b1b':'#1a56a0'};white-space:nowrap">
                    ${diasRest === 1 ? 'Mañana' : `${diasRest} días`}
                  </span>
                </div>
              `;
            }).join('')
        }
      </div>
    </div>
  `;
}

// ── MENSAJES ─────────────────────────────────────────────────
async function cargarMensajesNoLeidos() {
  const datos = await apiRequest('/mensajes/recibidos');
  if (!datos) return;
  const noLeidos = datos.filter(m => !m.leido).length;
  const badge = document.getElementById('notif-count');
  if (noLeidos > 0) {
    badge.textContent = noLeidos;
    badge.classList.remove('hidden');
  }
}

async function cargarMensajes() {
  const datos = await apiRequest('/mensajes');
  if (!datos) return;
  const lista = document.getElementById('mensajes-lista');
  if (datos.length === 0) {
    lista.innerHTML = '<div style="padding:1.5rem;text-align:center;color:#94a3b8;font-size:13px">No hay mensajes</div>';
    return;
  }
  lista.innerHTML = datos.map(m => `
    <div class="msg-item ${!m.leido?'unread':''}" onclick="verMensaje(${m.id})">
      <h5>${m.emisor_nombre}</h5>
      <p>${m.asunto || '(Sin asunto)'}</p>
      <div class="msg-time">${new Date(m.enviado_en).toLocaleDateString('es-CO')}</div>
    </div>
  `).join('');
}

async function verMensaje(id) {
  const datos  = await apiRequest('/mensajes');
  const mensaje = datos?.find(m => m.id === id);
  if (!mensaje) return;
  await apiRequest(`/mensajes/${id}/leer`, { method: 'PUT' });
  document.getElementById('mensaje-detalle').innerHTML = `
    <div>
      <h3 style="font-size:16px;font-weight:600;margin-bottom:12px">${mensaje.asunto || '(Sin asunto)'}</h3>
      <div style="display:flex;gap:16px;font-size:12px;color:#64748b;margin-bottom:16px;flex-wrap:wrap">
        <span>De: <strong>${mensaje.emisor_nombre}</strong></span>
        <span>Para: <strong>${mensaje.receptor_nombre}</strong></span>
        <span>${new Date(mensaje.enviado_en).toLocaleString('es-CO')}</span>
      </div>
      <hr style="border:none;border-top:1px solid #f1f5f9;margin-bottom:16px">
      <p style="font-size:14px;line-height:1.7;color:#334155">${mensaje.mensaje}</p>
    </div>
  `;
  cargarMensajes();
  cargarMensajesNoLeidos();
}

function abrirModalNuevoMensaje() {
  abrirModal('Nuevo Mensaje', `
    <div class="form-group">
      <label>Para (ID del usuario)</label>
      <input type="number" id="msg-receptor" placeholder="ID del destinatario">
    </div>
    <div class="form-group">
      <label>Asunto</label>
      <input type="text" id="msg-asunto" placeholder="Asunto del mensaje">
    </div>
    <div class="form-group">
      <label>Mensaje</label>
      <textarea id="msg-texto" rows="5" placeholder="Escribe tu mensaje..."></textarea>
    </div>
    <div class="modal-footer">
      <button onclick="cerrarModal()" class="btn btn-secondary">Cancelar</button>
      <button onclick="enviarMensaje()" class="btn btn-primary">Enviar mensaje</button>
    </div>
  `);
}

async function enviarMensaje() {
  const receptor_id = document.getElementById('msg-receptor').value;
  const asunto      = document.getElementById('msg-asunto').value;
  const mensaje     = document.getElementById('msg-texto').value;
  if (!receptor_id || !mensaje) { mostrarToast('Completa todos los campos', 'warning'); return; }
  const datos = await apiRequest('/mensajes', {
    method: 'POST',
    body: JSON.stringify({ receptor_id: parseInt(receptor_id), asunto, mensaje })
  });
  if (datos?.mensaje) { mostrarToast('Mensaje enviado'); cerrarModal(); cargarMensajes(); }
}

// ── HORARIO ──────────────────────────────────────────────────
async function cargarMiHorario() {
  const datos     = await apiRequest('/horarios/mi-horario');
  const container = document.getElementById('horario-contenido');
  if (!container) return;

  if (!datos || datos.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:3rem;color:#94a3b8"><p>No hay horarios registrados</p></div>';
    return;
  }

  const dias  = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
  const horas = [...new Set(datos.map(h => h.hora_inicio))].sort();

  let html = `<div class="horario-wrap"><div class="horario-grid">
    <div class="horario-header">Hora</div>
    ${dias.map(d => `<div class="horario-header">${d}</div>`).join('')}
  `;

  horas.forEach(hora => {
    html += `<div class="horario-hora">${hora.substring(0,5)}</div>`;
    dias.forEach(dia => {
      const clase = datos.find(h => h.hora_inicio === hora && h.dia === dia);
      html += clase
        ? `<div class="horario-celda ocupada">${clase.materia_nombre}<br><small style="opacity:0.7">${clase.salon||''}</small></div>`
        : `<div class="horario-celda"></div>`;
    });
  });

  html += '</div></div>';
  container.innerHTML = html;
}

// ── ESTADÍSTICAS (mantener para compatibilidad) ──────────────
async function cargarEstadisticas() {
  cargarInicio();
}