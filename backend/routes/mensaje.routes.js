const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensaje.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.get('/', verificarToken, mensajeController.misConversaciones);
router.get('/recibidos', verificarToken, mensajeController.recibidos);
router.get('/enviados', verificarToken, mensajeController.enviados);
router.post('/', verificarToken, mensajeController.enviar);
router.put('/:id/leer', verificarToken, mensajeController.marcarLeido);

module.exports = router;