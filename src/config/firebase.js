const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin SDK
let db;

const initializeFirebase = () => {
  try {
    // Verificar si ya está inicializado
    if (admin.apps.length > 0) {
      console.log('✅ Firebase ya inicializado');
      db = admin.firestore();
      return;
    }

    // Opción 1: Usar Render Secret File
    const renderSecretPath = '/etc/secrets/firebase-credentials.json';
    const fs = require('fs');
    
    if (fs.existsSync(renderSecretPath)) {
      const serviceAccount = require(renderSecretPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase inicializado desde Render Secret File');
    }
    // Opción 2: Usar credenciales desde variables de entorno
    else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase inicializado desde variables de entorno');
    }
    // Opción 3: Modo desarrollo sin Firebase (simulación)
    else {
      console.warn('⚠️  No hay credenciales de Firebase configuradas');
      console.warn('⚠️  Ejecutando en modo SIMULACIÓN (sin base de datos real)');
      return;
    }

    db = admin.firestore();
    console.log('✅ Firebase Firestore inicializado correctamente');

  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error.message);
    console.warn('⚠️  Ejecutando en modo SIMULACIÓN');
  }
};

const getFirestore = () => {
  if (!db && admin.apps.length > 0) {
    db = admin.firestore();
  }
  return db;
};

const getMessaging = () => {
  return admin.messaging();
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getMessaging,
  admin
};
