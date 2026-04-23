// backend/controllers/nota.controller.js

const db = require('../config/database');

exports.porMateria = async (req, res) => {
  try {
    const [notas] = await db.query(`
      SELECT n.*, u.nombre AS estudiante_nombre
      FROM notas n
      INNER JOIN estudiantes e ON n.estudiante_id = e.id
      INNER JOIN usuarios u    ON e.usuario_id    = u.id
      WHERE n.materia_id = ?
      ORDER BY u.nombre, n.fecha
    `, [req.params.materiaId]);
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notas' });
  }
};

exports.porEstudiante = async (req, res) => {
  try {
    const [notas] = await db.query(`
      SELECT n.*, m.nombre AS materia_nombre
      FROM notas n
      INNER JOIN materias m ON n.materia_id = m.id
      WHERE n.estudiante_id = ?
      ORDER BY m.nombre, n.fecha
    `, [req.params.estudianteId]);
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notas' });
  }
};

exports.misNotas = async (req, res) => {
  try {
    const { rol, rolId } = req.usuario;
    if (rol !== 'estudiante')
      return res.status(403).json({ error: 'Solo estudiantes pueden ver sus notas' });

    const [notas] = await db.query(`
      SELECT
        m.nombre AS materia,
        n.descripcion,
        n.nota,
        n.nota_maxima,
        n.fecha,
        ROUND((n.nota / n.nota_maxima) * 100, 2) AS porcentaje
      FROM notas n
      INNER JOIN materias m ON n.materia_id = m.id
      WHERE n.estudiante_id = ?
      ORDER BY m.nombre, n.fecha DESC
    `, [rolId]);

    const [promedios] = await db.query(`
      SELECT
        m.id   AS materia_id,
        m.nombre AS materia,
        ROUND(AVG(n.nota), 2) AS promedio,
        COUNT(n.id)           AS total_notas
      FROM notas n
      INNER JOIN materias m ON n.materia_id = m.id
      WHERE n.estudiante_id = ?
      GROUP BY m.id, m.nombre
    `, [rolId]);

    res.json({ notas, promedios });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notas' });
  }
};

exports.crear = async (req, res) => {
  try {
    const { estudiante_id, materia_id, descripcion, nota, nota_maxima } = req.body;
    const [result] = await db.query(
      'INSERT INTO notas (estudiante_id, materia_id, descripcion, nota, nota_maxima) VALUES (?, ?, ?, ?, ?)',
      [estudiante_id, materia_id, descripcion, nota, nota_maxima || 100]
    );
    res.status(201).json({ mensaje: 'Nota registrada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear nota' });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { descripcion, nota, nota_maxima } = req.body;
    await db.query(
      'UPDATE notas SET descripcion=?, nota=?, nota_maxima=? WHERE id=?',
      [descripcion, nota, nota_maxima, req.params.id]
    );
    res.json({ mensaje: 'Nota actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar nota' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    await db.query('DELETE FROM notas WHERE id=?', [req.params.id]);
    res.json({ mensaje: 'Nota eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar nota' });
  }
};