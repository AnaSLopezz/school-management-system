// backend/controllers/horario.controller.js

const db = require('../config/database');

exports.porMateria = async (req, res) => {
  try {
    const [horarios] = await db.query(
      `SELECT * FROM horarios WHERE materia_id = ?
       ORDER BY FIELD(dia,'Lunes','Martes','Miércoles','Jueves','Viernes'), hora_inicio`,
      [req.params.materiaId]
    );
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
};

exports.miHorario = async (req, res) => {
  try {
    const { rol, rolId } = req.usuario;
    let query, params;

    if (rol === 'estudiante') {
      query = `
        SELECT h.*, m.nombre AS materia_nombre, u.nombre AS profesor_nombre
        FROM horarios h
        INNER JOIN materias m      ON h.materia_id    = m.id
        INNER JOIN inscripciones i ON m.id            = i.materia_id
        LEFT  JOIN profesores p    ON m.profesor_id   = p.id
        LEFT  JOIN usuarios u      ON p.usuario_id    = u.id
        WHERE i.estudiante_id = ?
        ORDER BY FIELD(h.dia,'Lunes','Martes','Miércoles','Jueves','Viernes'), h.hora_inicio
      `;
      params = [rolId];

    } else if (rol === 'profesor') {
      query = `
        SELECT h.*, m.nombre AS materia_nombre
        FROM horarios h
        INNER JOIN materias m ON h.materia_id = m.id
        WHERE m.profesor_id = ?
        ORDER BY FIELD(h.dia,'Lunes','Martes','Miércoles','Jueves','Viernes'), h.hora_inicio
      `;
      params = [rolId];

    } else {
      query = `
        SELECT h.*, m.nombre AS materia_nombre
        FROM horarios h
        INNER JOIN materias m ON h.materia_id = m.id
        ORDER BY h.dia, h.hora_inicio
      `;
      params = [];
    }

    const [horarios] = await db.query(query, params);
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horario' });
  }
};

exports.crear = async (req, res) => {
  try {
    const { materia_id, dia, hora_inicio, hora_fin, salon } = req.body;
    const [result] = await db.query(
      'INSERT INTO horarios (materia_id, dia, hora_inicio, hora_fin, salon) VALUES (?, ?, ?, ?, ?)',
      [materia_id, dia, hora_inicio, hora_fin, salon]
    );
    res.status(201).json({ mensaje: 'Horario creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear horario' });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { dia, hora_inicio, hora_fin, salon } = req.body;
    await db.query(
      'UPDATE horarios SET dia=?, hora_inicio=?, hora_fin=?, salon=? WHERE id=?',
      [dia, hora_inicio, hora_fin, salon, req.params.id]
    );
    res.json({ mensaje: 'Horario actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar horario' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    await db.query('DELETE FROM horarios WHERE id=?', [req.params.id]);
    res.json({ mensaje: 'Horario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar horario' });
  }
};