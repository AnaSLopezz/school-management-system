const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function resetear() {
  const hash123 = await bcrypt.hash('admin123', 10);
  const hashProf = await bcrypt.hash('prof123', 10);
  const hashEst = await bcrypt.hash('est123', 10);

  await db.query(`UPDATE usuarios SET contrasena=? WHERE email='admin@colegio.edu'`, [hash123]);
  await db.query(`UPDATE usuarios SET contrasena=? WHERE email='carlos@colegio.edu'`, [hashProf]);
  await db.query(`UPDATE usuarios SET contrasena=? WHERE email='maria@colegio.edu'`, [hashProf]);
  await db.query(`UPDATE usuarios SET contrasena=? WHERE email='andres@colegio.edu'`, [hashEst]);
  await db.query(`UPDATE usuarios SET contrasena=? WHERE email='laura@colegio.edu'`, [hashEst]);
  await db.query(`UPDATE usuarios SET contrasena=? WHERE email='pedro@colegio.edu'`, [hashEst]);

  console.log('✅ Contraseñas actualizadas correctamente');
  process.exit();
}

resetear();