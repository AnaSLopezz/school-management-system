// backend/controllers/materia.controller.js

const db = require('../config/database');

exports.obtenerTodas = async (req, res) => {
  try {
    const [materias] = await db.query(`
      SELECT m.id, m.nombre, m.descripcion, m.activo,
             u.nombre AS profesor_nombre, p.id AS profesor_id
      FROM materias m
      LEFT JOIN profesores p ON m.profesor_id = p.id
      LEFT JOIN usuarios u   ON p.usuario_id  = u.id
      WHERE m.activo = TRUE
      ORDER BY m.nombre
    `);
    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materias' });
  }
};

exports.misMaterias = async (req, res) => {
  try {
    const { rol, rolId } = req.usuario;
    let materias;

    if (rol === 'profesor') {
      [materias] = await db.query(`
        SELECT m.id, m.nombre, m.descripcion,
               COUNT(i.estudiante_id) AS total_estudiantes
        FROM materias m
        LEFT JOIN inscripciones i ON m.id = i.materia_id
        WHERE m.profesor_id = ? AND m.activo = TRUE
        GROUP BY m.id
      `, [rolId]);

    } else if (rol === 'estudiante') {
      [materias] = await db.query(`
        SELECT m.id, m.nombre, m.descripcion,
               u.nombre AS profesor_nombre
        FROM materias m
        INNER JOIN inscripciones i ON m.id = i.materia_id
        LEFT JOIN profesores p     ON m.profesor_id = p.id
        LEFT JOIN usuarios u       ON p.usuario_id  = u.id
        WHERE i.estudiante_id = ? AND m.activo = TRUE
      `, [rolId]);

    } else {
      [materias] = await db.query('SELECT * FROM materias WHERE activo = TRUE');
    }

    res.json(materias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materias' });
  }
};

exports.obtenerUna = async (req, res) => {
  try {
    const [materias] = await db.query(`
      SELECT m.*, u.nombre AS profesor_nombre
      FROM materias m
      LEFT JOIN profesores p ON m.profesor_id = p.id
      LEFT JOIN usuarios u   ON p.usuario_id  = u.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (materias.length === 0)
      return res.status(404).json({ error: 'Materia no encontrada' });

    res.json(materias[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materia' });
  }
};

exports.obtenerEstudiantes = async (req, res) => {
  try {
    const [estudiantes] = await db.query(`
      SELECT u.id, u.nombre, u.email, e.id AS estudiante_id, e.grado
      FROM inscripciones i
      INNER JOIN estudiantes e ON i.estudiante_id = e.id
      INNER JOIN usuarios u    ON e.usuario_id    = u.id
      WHERE i.materia_id = ?
      ORDER BY u.nombre
    `, [req.params.id]);
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estudiantes de la materia' });
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, profesor_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO materias (nombre, descripcion, profesor_id) VALUES (?, ?, ?)',
      [nombre, descripcion, profesor_id || null]
    );
    res.status(201).json({ mensaje: 'Materia creada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear materia' });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { nombre, descripcion, profesor_id } = req.body;
    await db.query(
      'UPDATE materias SET nombre=?, descripcion=?, profesor_id=? WHERE id=?',
      [nombre, descripcion, profesor_id, req.params.id]
    );
    res.json({ mensaje: 'Materia actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar materia' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    await db.query('UPDATE materias SET activo=FALSE WHERE id=?', [req.params.id]);
    res.json({ mensaje: 'Materia eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar materia' });
  }
};

exports.inscribirEstudiante = async (req, res) => {
  try {
    const { estudiante_id } = req.body;
    await db.query(
      'INSERT INTO inscripciones (estudiante_id, materia_id) VALUES (?, ?)',
      [estudiante_id, req.params.id]
    );
    res.status(201).json({ mensaje: 'Estudiante inscrito en la materia correctamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'El estudiante ya está inscrito en esta materia' });
    res.status(500).json({ error: 'Error al inscribir estudiante' });
  }
};