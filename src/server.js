require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./config/firebase');
const schedulerService = require('./services/schedulerService');

const notificacionesRoutes = require('./routes/notificaciones');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174']
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    servicio: 'Notificador de Tareas Académicas', 
    version: '2.0.0',
    database: 'Firebase Firestore'
  });
});

app.use('/api/notificaciones', notificacionesRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK', database: 'Firebase' }));

app.use((req, res) => res.status(404).json({ error: 'Endpoint no encontrado' }));

const iniciar = async () => {
  try {
    initializeFirebase();
    schedulerService.iniciarTareasProgramadas();
    app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║   SERVICIO DE NOTIFICACIONES - INICIADO        ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log(`🚀 Servidor: http://localhost:${PORT}`);
      console.log('🔥 Base de datos: Firebase Firestore');
      console.log('📧 Email: Nodemailer configurado');
      console.log('⏰ Tareas programadas: Activas');
      console.log('════════════════════════════════════════════════');
    });
  } catch (err) {
    console.error('❌ Error al iniciar servidor:', err);
    process.exit(1);
  }
};

iniciar();

module.exports = app;
