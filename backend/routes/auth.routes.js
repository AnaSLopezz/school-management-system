// backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
// Router = mini-servidor que maneja un grupo de rutas

// Importamos el controlador (la lógica real está allá)
const authController = require('../controllers/auth.controller');

// POST /api/auth/registro → Crear cuenta nueva
router.post('/registro', authController.registro);

// POST /api/auth/login → Iniciar sesión
router.post('/login', authController.login);

module.exports = router;