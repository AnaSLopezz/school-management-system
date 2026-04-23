// backend/routes/nota.routes.js

const express = require('express');
const router = express.Router();
const notaController = require('../controllers/nota.controller');
const { verificarToken, soloProfesor, adminOProfesor } = require('../middleware/auth.middleware');

router.get('/materia/:materiaId',       verificarToken, adminOProfesor, notaController.porMateria);
router.get('/estudiante/:estudianteId', verificarToken,                 notaController.porEstudiante);
router.get('/mis-notas',                verificarToken,                 notaController.misNotas);
router.post('/',                        verificarToken, soloProfesor,   notaController.crear);
router.put('/:id',                      verificarToken, soloProfesor,   notaController.actualizar);
router.delete('/:id',                   verificarToken, soloProfesor,   notaController.eliminar);

module.exports = router;