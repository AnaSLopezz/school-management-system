// backend/controllers/auth.controller.js

const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =============================================
// FUNCIÓN: registro
// Crea un usuario nuevo en el sistema
// =============================================
exports.registro = async (req, res) => {
  try {
    // 1. Obtenemos los datos que el usuario envió
    const { nombre, email, contrasena, rol } = req.body;
    
    // 2. Validaciones básicas
    if (!nombre || !email || !contrasena || !rol) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios' 
      });
    }
    
    // Verificar que el rol sea válido
    if (!['admin', 'profesor', 'estudiante'].includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol no válido' 
      });
    }
    
    // 3. Verificar si el email ya existe
    const [usuariosExistentes] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    // El ? es un "placeholder" - evita inyecciones SQL
    
    if (usuariosExistentes.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe una cuenta con ese email' 
      });
    }
    
    // 4. Encriptar la contraseña
    // El "10" es el número de "rondas" de encriptación
    // Más rondas = más seguro pero más lento (10 es ideal)
    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);
    
    // 5. Guardar el usuario en la base de datos
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, contrasenaEncriptada, rol]
    );
    
    const nuevoUsuarioId = resultado.insertId;
    // insertId = el ID que MySQL asignó al nuevo registro
    
    // 6. Crear el registro en la tabla específica según el rol
    if (rol === 'estudiante') {
      await db.query(
        'INSERT INTO estudiantes (usuario_id) VALUES (?)',
        [nuevoUsuarioId]
      );
    } else if (rol === 'profesor') {
      await db.query(
        'INSERT INTO profesores (usuario_id) VALUES (?)',
        [nuevoUsuarioId]
      );
    }
    
    // 7. Responder con éxito
    res.status(201).json({ 
      mensaje: 'Usuario creado exitosamente',
      id: nuevoUsuarioId
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// =============================================
// FUNCIÓN: login
// Verifica credenciales y devuelve un token JWT
// =============================================
exports.login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    
    // 1. Validar que vengan los datos
    if (!email || !contrasena) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }
    
    // 2. Buscar el usuario por email
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );
    
    if (usuarios.length === 0) {
      return res.status(401).json({ 
        error: 'Email o contraseña incorrectos' 
      });
      // Nota: No decimos cuál es incorrecto por seguridad
    }
    
    const usuario = usuarios[0];
    
    // 3. Verificar la contraseña
    // bcrypt.compare compara el texto plano con el encriptado
    const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!contrasenaCorrecta) {
      return res.status(401).json({ 
        error: 'Email o contraseña incorrectos' 
      });
    }
    
    // 4. Obtener el ID específico del rol (estudiante_id o profesor_id)
    let rolId = null;
    if (usuario.rol === 'estudiante') {
      const [est] = await db.query(
        'SELECT id FROM estudiantes WHERE usuario_id = ?', 
        [usuario.id]
      );
      if (est.length > 0) rolId = est[0].id;
    } else if (usuario.rol === 'profesor') {
      const [prof] = await db.query(
        'SELECT id FROM profesores WHERE usuario_id = ?', 
        [usuario.id]
      );
      if (prof.length > 0) rolId = prof[0].id;
    }
    
    // 5. Crear el token JWT
    // El token "codifica" información del usuario
    // Solo el servidor puede verificarlo (gracias al JWT_SECRET)
    const token = jwt.sign(
      {
        // Esta información va DENTRO del token
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        rolId: rolId
      },
      process.env.JWT_SECRET, // Clave secreta para firmarlo
      { expiresIn: '24h' }    // El token expira en 24 horas
    );
    
    // 6. Responder con el token y datos del usuario
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        rolId: rolId
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};