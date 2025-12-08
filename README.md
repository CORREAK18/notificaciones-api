# Servicio: Notificador de Tareas Académicas

Servicio SOA especializado en enviar notificaciones relacionadas con tareas académicas usando **Firebase Firestore** para almacenamiento en tiempo real.

## 🔥 Base de Datos
- **Firebase Firestore** (NoSQL, tiempo real)
- Sin necesidad de SQL Server
- Escalabilidad automática

## 📋 Endpoints Principales
- POST /api/notificaciones/nueva-tarea-asignada
- POST /api/notificaciones/recordatorio
- POST /api/notificaciones/tarea-calificada
- POST /api/notificaciones/tarea-actualizada
- GET  /api/notificaciones/historial
- GET  /api/notificaciones/estadisticas

## ⚙️ Configuración Rápida

1. **Crea proyecto en Firebase**: https://console.firebase.google.com/
2. **Descarga credenciales**: Configuración > Cuentas de servicio > Generar clave
3. **Guarda como**: `firebase-credentials.json`
4. **Configura .env**:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com
```
5. **Instala e inicia**:
```bash
npm install
npm start
```

Ver `MIGRACION-FIREBASE.md` para más detalles.
