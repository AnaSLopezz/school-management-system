// backend/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

// =============================================
// MIDDLEWARE: verificarToken
// Se ejecuta ANTES de cualquier ruta protegida
// Verifica que el usuario esté logueado
// =============================================
exports.verificarToken = (req, res, next) => {
  // El token viene en el header "Authorization"
  // Formato: "Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Acceso denegado: No se proporcionó token' 
    });
  }
  
  // Separamos "Bearer" del token real
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Formato de token inválido' 
    });
  }
  
  try {
    // jwt.verify lanza un error si el token es falso o expiró
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardamos los datos del usuario en req para usarlos después
    req.usuario = decoded;
    
    // next() = "ok, continúa a la siguiente función"
    next();
    
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
};

// =============================================
// MIDDLEWARE: soloAdmin
// Solo permite acceso a administradores
// =============================================
exports.soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado: Se requiere rol de administrador' 
    });
  }
  next();
};

// =============================================
// MIDDLEWARE: soloProfesor
// Solo permite acceso a profesores
// =============================================
exports.soloProfesor = (req, res, next) => {
  if (req.usuario.rol !== 'profesor') {
    return res.status(403).json({ 
      error: 'Acceso denegado: Se requiere rol de profesor' 
    });
  }
  next();
};

// =============================================
// MIDDLEWARE: adminOProfesor
// Permite acceso a admin O profesor
// =============================================
exports.adminOProfesor = (req, res, next) => {
  if (!['admin', 'profesor'].includes(req.usuario.rol)) {
    return res.status(403).json({ 
      error: 'Acceso denegado' 
    });
  }
  next();
};