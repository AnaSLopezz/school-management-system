// backend/routes/tarea.routes.js

const express = require('express');
const router = express.Router();
const tareaController = require('../controllers/tarea.controller');
const { verificarToken, soloProfesor } = require('../middleware/auth.middleware');

router.get('/materia/:materiaId',              verificarToken,               tareaController.porMateria);
router.get('/mis-tareas',                      verificarToken,               tareaController.misTareas);
router.post('/',                               verificarToken, soloProfesor, tareaController.crear);
router.put('/:id',                             verificarToken, soloProfesor, tareaController.actualizar);
router.delete('/:id',                          verificarToken, soloProfesor, tareaController.eliminar);
router.post('/:id/entregar',                   verificarToken,               tareaController.entregar);
router.get('/:id/entregas',                    verificarToken, soloProfesor, tareaController.verEntregas);
router.put('/entregas/:entregaId/calificar',   verificarToken, soloProfesor, tareaController.calificar);

module.exports = router;