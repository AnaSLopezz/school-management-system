// backend/routes/usuario.routes.js

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

// Todas estas rutas requieren token Y ser admin
// Los middlewares se ejecutan de izquierda a derecha

// GET /api/usuarios → Ver todos los usuarios
router.get('/', verificarToken, soloAdmin, usuarioController.obtenerTodos);

// GET /api/usuarios/:id → Ver un usuario específico
router.get('/:id', verificarToken, soloAdmin, usuarioController.obtenerUno);

// PUT /api/usuarios/:id → Editar un usuario
router.put('/:id', verificarToken, soloAdmin, usuarioController.actualizar);

// DELETE /api/usuarios/:id → Desactivar un usuario
router.delete('/:id', verificarToken, soloAdmin, usuarioController.eliminar);

// GET /api/usuarios/rol/estudiantes → Obtener solo estudiantes
router.get('/rol/estudiantes', verificarToken, usuarioController.obtenerEstudiantes);

// GET /api/usuarios/rol/profesores → Obtener solo profesores
router.get('/rol/profesores', verificarToken, usuarioController.obtenerProfesores);

module.exports = router;