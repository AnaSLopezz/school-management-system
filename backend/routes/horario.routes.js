// backend/routes/horario.routes.js

const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horario.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

router.get('/materia/:materiaId', verificarToken,             horarioController.porMateria);
router.get('/mi-horario',         verificarToken,             horarioController.miHorario);
router.post('/',                  verificarToken, soloAdmin,  horarioController.crear);
router.put('/:id',                verificarToken, soloAdmin,  horarioController.actualizar);
router.delete('/:id',             verificarToken, soloAdmin,  horarioController.eliminar);

module.exports = router;