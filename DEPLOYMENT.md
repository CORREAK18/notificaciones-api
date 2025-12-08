# Deployment Guide - ServicioNotificaciones

## 📦 Preparación para Producción

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en el servidor con:

```env
PORT=3000

FIREBASE_PROJECT_ID=notificaciones-1226d
FIREBASE_CREDENTIALS_PATH=./notificaciones-1226d-firebase-adminsdk-fbsvc-97b4a128fa.json

EMAIL_USER=educaprocorporacion8@gmail.com
EMAIL_PASS=xwxd awgy hhtb rech
EMAIL_FROM=educaprocorporacion8@gmail.com

TAREAS_API_URL=https://tu-servicio-tareas.com/api/tareas
FRONTEND_URL=https://tu-frontend.com
NODE_ENV=production
```

### 2. Subir Credenciales de Firebase

**IMPORTANTE:** El archivo `notificaciones-1226d-firebase-adminsdk-fbsvc-97b4a128fa.json` debe estar en el servidor.

**Opción 1 - Archivo directo:**
```bash
# Copiar archivo al servidor
scp notificaciones-1226d-firebase-adminsdk-fbsvc-97b4a128fa.json user@server:/path/to/app/
```

**Opción 2 - Variable de entorno (Railway, Render):**
```env
FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"notificaciones-1226d",...}'
```

Luego modificar `src/config/firebase.js`:
```javascript
const serviceAccount = process.env.FIREBASE_CREDENTIALS 
  ? JSON.parse(process.env.FIREBASE_CREDENTIALS)
  : require(credentialsPath);
```

### 3. Instalar Dependencias

```bash
npm install --production
```

### 4. Iniciar Servicio

```bash
npm start
```

## 🚀 Opciones de Hosting

### Opción 1: Railway.app (Recomendado)
1. Conecta repositorio GitHub
2. Agrega variables de entorno
3. Sube archivo Firebase credentials como archivo
4. Deploy automático

### Opción 2: Render.com
1. Nuevo Web Service
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Agrega variables de entorno
5. Sube Firebase credentials como secret file

### Opción 3: VPS con PM2
```bash
# Instalar dependencias
npm install --production

# Configurar PM2
npm install -g pm2
pm2 start src/server.js --name notificaciones-api
pm2 save
pm2 startup
```

## 📋 Verificación

```bash
# Health check
curl https://tu-servicio.com/api/notificaciones/historial

# Enviar notificación de prueba
curl -X POST https://tu-servicio.com/api/notificaciones/nueva-tarea-asignada \
  -H "Content-Type: application/json" \
  -d '{"destinatario_email":"test@test.com","destinatario_nombre":"Test","tarea_info":{"titulo":"Test","descripcion":"Test","materia":"Test","fecha_entrega":"2025-12-20T10:00:00"},"profesor_info":{"nombre":"Test","email":"test@test.com"}}'
```

## ⏰ Tareas Programadas

El servicio incluye tareas automáticas:
- **Recordatorios automáticos:** Cada hora verifica tareas y envía recordatorios al 50% del tiempo
- **Procesar pendientes:** Cada 5 minutos envía notificaciones pendientes

Estas se inician automáticamente al levantar el servicio.

## 🔒 Seguridad

- ✅ CORS configurado
- ✅ Credenciales Firebase seguras
- ✅ Contraseña de email en variable de entorno
- ✅ Validación de emails

## 📝 Endpoints Disponibles

- `POST /api/notificaciones/nueva-tarea-asignada` - Nueva tarea
- `POST /api/notificaciones/recordatorio` - Recordatorio manual
- `POST /api/notificaciones/tarea-actualizada` - Tarea actualizada
- `GET /api/notificaciones/historial` - Historial
- `GET /api/notificaciones/estadisticas` - Estadísticas
- `GET /api/notificaciones/:id` - Obtener notificación
- `POST /api/notificaciones/:id/reenviar` - Reenviar
- `DELETE /api/notificaciones/:id` - Eliminar
- `POST /api/notificaciones/enviar-pendientes` - Procesar pendientes

## 🔥 Firebase Configuration

Si usas variable de entorno para credentials, actualiza `src/config/firebase.js`:

```javascript
let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS) {
  // Producción - credentials en variable de entorno
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} else {
  // Desarrollo - credentials en archivo
  const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH || 
    path.join(__dirname, '../../notificaciones-1226d-firebase-adminsdk-fbsvc-97b4a128fa.json');
  serviceAccount = require(credentialsPath);
}
```
