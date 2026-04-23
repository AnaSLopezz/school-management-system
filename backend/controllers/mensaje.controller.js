// backend/controllers/mensaje.controller.js

const db = require('../config/database');

exports.misConversaciones = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const [mensajes] = await db.query(`
      SELECT m.*,
             e.nombre as emisor_nombre,
             r.nombre as receptor_nombre
      FROM mensajes m
      INNER JOIN usuarios e ON m.emisor_id = e.id
      INNER JOIN usuarios r ON m.receptor_id = r.id
      WHERE m.emisor_id = ? OR m.receptor_id = ?
      ORDER BY m.enviado_en DESC
    `, [userId, userId]);
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

exports.recibidos = async (req, res) => {
  try {
    const [mensajes] = await db.query(`
      SELECT m.*, u.nombre as emisor_nombre, u.rol as emisor_rol
      FROM mensajes m
      INNER JOIN usuarios u ON m.emisor_id = u.id
      WHERE m.receptor_id = ?
      ORDER BY m.enviado_en DESC
    `, [req.usuario.id]);
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

exports.enviados = async (req, res) => {
  try {
    const [mensajes] = await db.query(`
      SELECT m.*, u.nombre as receptor_nombre
      FROM mensajes m
      INNER JOIN usuarios u ON m.receptor_id = u.id
      WHERE m.emisor_id = ?
      ORDER BY m.enviado_en DESC
    `, [req.usuario.id]);
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

exports.enviar = async (req, res) => {
  try {
    const { receptor_id, asunto, mensaje } = req.body;
    const [result] = await db.query(
      'INSERT INTO mensajes (emisor_id, receptor_id, asunto, mensaje) VALUES (?, ?, ?, ?)',
      [req.usuario.id, receptor_id, asunto, mensaje]
    );
    res.status(201).json({ mensaje: 'Mensaje enviado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

exports.marcarLeido = async (req, res) => {
  try {
    await db.query(
      'UPDATE mensajes SET leido=TRUE WHERE id=? AND receptor_id=?',
      [req.params.id, req.usuario.id]
    );
    res.json({ mensaje: 'Marcado como leído' });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar mensaje' });
  }
};