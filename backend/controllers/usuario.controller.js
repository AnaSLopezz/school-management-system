// backend/controllers/usuario.controller.js

const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Ver todos los usuarios
exports.obtenerTodos = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, nombre, email, rol, activo, creado_en FROM usuarios ORDER BY creado_en DESC'
      // Nota: NO incluimos "contrasena" por seguridad
    );
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Ver un usuario específico
exports.obtenerUno = async (req, res) => {
  try {
    const { id } = req.params; // El ID viene en la URL: /usuarios/5
    
    const [usuarios] = await db.query(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?',
      [id]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuarios[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Actualizar un usuario
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, contrasena, rol } = req.body;
    
    // Si viene nueva contraseña, la encriptamos
    let query, params;
    if (contrasena) {
      const hash = await bcrypt.hash(contrasena, 10);
      query = 'UPDATE usuarios SET nombre=?, email=?, contrasena=?, rol=? WHERE id=?';
      params = [nombre, email, hash, rol, id];
    } else {
      query = 'UPDATE usuarios SET nombre=?, email=?, rol=? WHERE id=?';
      params = [nombre, email, rol, id];
    }
    
    await db.query(query, params);
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar (desactivar) un usuario
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Eliminación lógica: no borramos, solo desactivamos
    await db.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// Obtener solo estudiantes (con datos extra)
exports.obtenerEstudiantes = async (req, res) => {
  try {
    const [estudiantes] = await db.query(`
      SELECT u.id, u.nombre, u.email, e.id as estudiante_id, e.grado
      FROM usuarios u
      INNER JOIN estudiantes e ON u.id = e.usuario_id
      WHERE u.activo = TRUE
      ORDER BY u.nombre
    `);
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
};

// Obtener solo profesores (con datos extra)
exports.obtenerProfesores = async (req, res) => {
  try {
    const [profesores] = await db.query(`
      SELECT u.id, u.nombre, u.email, p.id as profesor_id, p.especialidad
      FROM usuarios u
      INNER JOIN profesores p ON u.id = p.usuario_id
      WHERE u.activo = TRUE
      ORDER BY u.nombre
    `);
    res.json(profesores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
};