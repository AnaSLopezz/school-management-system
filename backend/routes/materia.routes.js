// backend/routes/materia.routes.js

const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materia.controller');
const { verificarToken, soloAdmin, adminOProfesor } = require('../middleware/auth.middleware');

router.get('/',                    verificarToken,                  materiaController.obtenerTodas);
router.get('/mis-materias',        verificarToken,                  materiaController.misMaterias);
router.get('/:id',                 verificarToken,                  materiaController.obtenerUna);
router.get('/:id/estudiantes',     verificarToken, adminOProfesor,  materiaController.obtenerEstudiantes);
router.post('/',                   verificarToken, soloAdmin,       materiaController.crear);
router.put('/:id',                 verificarToken, soloAdmin,       materiaController.actualizar);
router.delete('/:id',              verificarToken, soloAdmin,       materiaController.eliminar);
router.post('/:id/inscribir',      verificarToken, soloAdmin,       materiaController.inscribirEstudiante);

module.exports = router;