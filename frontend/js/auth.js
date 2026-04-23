// frontend/js/auth.js

const API = 'http://localhost:3000/api';

// Cambiar entre tabs de Login y Registro
function mostrarTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  document.getElementById(`tab-${tab}`).classList.add('active');
  event.target.classList.add('active');
}

// Manejar el formulario de Login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  
  errorDiv.classList.add('hidden');
  document.getElementById('login-btn-text').textContent = 'Verificando...';
  
  try {
    const respuesta = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contrasena: password })
    });
    
    const datos = await respuesta.json();
    
    if (!respuesta.ok) {
      errorDiv.textContent = datos.error;
      errorDiv.classList.remove('hidden');
      return;
    }
    
    localStorage.setItem('token', datos.token);
    localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    
    // ✅ CORRECCIÓN: ruta correcta al dashboard
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    errorDiv.textContent = 'Error de conexión. Verifica que el servidor esté corriendo.';
    errorDiv.classList.remove('hidden');
  } finally {
    document.getElementById('login-btn-text').textContent = 'Iniciar Sesión';
  }
}

// Manejar el formulario de Registro
async function handleRegistro(event) {
  event.preventDefault();
  
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const contrasena = document.getElementById('reg-password').value;
  const rol = document.getElementById('reg-rol').value;
  
  const errorDiv = document.getElementById('registro-error');
  const successDiv = document.getElementById('registro-success');
  
  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');
  
  try {
    const respuesta = await fetch(`${API}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, contrasena, rol })
    });
    
    const datos = await respuesta.json();
    
    if (!respuesta.ok) {
      errorDiv.textContent = datos.error;
      errorDiv.classList.remove('hidden');
      return;
    }
    
    successDiv.textContent = '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.';
    successDiv.classList.remove('hidden');
    event.target.reset();
    
  } catch (error) {
    errorDiv.textContent = 'Error de conexión';
    errorDiv.classList.remove('hidden');
  }
}

// ✅ CORRECCIÓN: emails correctos de la base de datos
function loginDemo(rol) {
  const credenciales = {
    admin:      { email: 'admin@colegio.edu',  password: 'admin123' },
    profesor:   { email: 'carlos@colegio.edu', password: 'prof123'  },
    estudiante: { email: 'andres@colegio.edu', password: 'est123'   }
  };
  
  const c = credenciales[rol];
  document.getElementById('login-email').value    = c.email;
  document.getElementById('login-password').value = c.password;
}

// Si ya está logueado, redirigir al dashboard
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}