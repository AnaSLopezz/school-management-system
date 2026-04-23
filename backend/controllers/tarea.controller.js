// backend/controllers/tarea.controller.js

const db = require('../config/database');

exports.porMateria = async (req, res) => {
  try {
    const [tareas] = await db.query(
      'SELECT * FROM tareas WHERE materia_id = ? ORDER BY fecha_entrega ASC',
      [req.params.materiaId]
    );
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

exports.misTareas = async (req, res) => {
  try {
    const { rol, rolId } = req.usuario;
    if (rol !== 'estudiante')
      return res.status(403).json({ error: 'Solo para estudiantes' });

    const [tareas] = await db.query(`
      SELECT t.*, m.nombre AS materia_nombre,
             e.id          AS entrega_id,
             e.calificacion,
             e.entregado_en,
             CASE WHEN e.id IS NOT NULL THEN TRUE ELSE FALSE END AS entregada
      FROM tareas t
      INNER JOIN materias m      ON t.materia_id    = m.id
      INNER JOIN inscripciones i ON m.id            = i.materia_id
      LEFT  JOIN entregas e      ON t.id            = e.tarea_id
                                AND e.estudiante_id = ?
      WHERE i.estudiante_id = ?
      ORDER BY t.fecha_entrega ASC
    `, [rolId, rolId]);

    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

exports.crear = async (req, res) => {
  try {
    const { materia_id, titulo, descripcion, fecha_entrega, puntos_maximos } = req.body;
    const [result] = await db.query(
      'INSERT INTO tareas (materia_id, titulo, descripcion, fecha_entrega, puntos_maximos) VALUES (?, ?, ?, ?, ?)',
      [materia_id, titulo, descripcion, fecha_entrega, puntos_maximos || 100]
    );
    res.status(201).json({ mensaje: 'Tarea creada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { titulo, descripcion, fecha_entrega, puntos_maximos } = req.body;
    await db.query(
      'UPDATE tareas SET titulo=?, descripcion=?, fecha_entrega=?, puntos_maximos=? WHERE id=?',
      [titulo, descripcion, fecha_entrega, puntos_maximos, req.params.id]
    );
    res.json({ mensaje: 'Tarea actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    await db.query('DELETE FROM tareas WHERE id=?', [req.params.id]);
    res.json({ mensaje: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};

exports.entregar = async (req, res) => {
  try {
    const { rolId } = req.usuario;
    const { contenido } = req.body;
    const [result] = await db.query(
      'INSERT INTO entregas (tarea_id, estudiante_id, contenido) VALUES (?, ?, ?)',
      [req.params.id, rolId, contenido]
    );
    res.status(201).json({ mensaje: 'Tarea entregada correctamente', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Ya entregaste esta tarea' });
    res.status(500).json({ error: 'Error al entregar tarea' });
  }
};

exports.verEntregas = async (req, res) => {
  try {
    const [entregas] = await db.query(`
      SELECT e.*, u.nombre AS estudiante_nombre
      FROM entregas e
      INNER JOIN estudiantes est ON e.estudiante_id = est.id
      INNER JOIN usuarios u      ON est.usuario_id  = u.id
      WHERE e.tarea_id = ?
      ORDER BY e.entregado_en DESC
    `, [req.params.id]);
    res.json(entregas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entregas' });
  }
};

exports.calificar = async (req, res) => {
  try {
    const { calificacion, comentario_profesor } = req.body;
    await db.query(
      'UPDATE entregas SET calificacion=?, comentario_profesor=? WHERE id=?',
      [calificacion, comentario_profesor, req.params.entregaId]
    );
    res.json({ mensaje: 'Entrega calificada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al calificar entrega' });
  }
};