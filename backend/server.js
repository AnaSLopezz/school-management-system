// backend/server.js

const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.static(path.join(__dirname, '../frontend')));

const authRoutes     = require('./routes/auth.routes');
const usuarioRoutes  = require('./routes/usuario.routes');
const materiaRoutes  = require('./routes/materia.routes');   // ← antes: curso.routes
const notaRoutes     = require('./routes/nota.routes');
const tareaRoutes    = require('./routes/tarea.routes');
const mensajeRoutes  = require('./routes/mensaje.routes');
const horarioRoutes  = require('./routes/horario.routes');

app.use('/api/auth',      authRoutes);
app.use('/api/usuarios',  usuarioRoutes);
app.use('/api/materias',  materiaRoutes);   // ← antes: /api/cursos
app.use('/api/notas',     notaRoutes);
app.use('/api/tareas',    tareaRoutes);
app.use('/api/mensajes',  mensajeRoutes);
app.use('/api/horarios',  horarioRoutes);

app.get('/api/health', (req, res) => res.json({ mensaje: '¡Servidor funcionando!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});