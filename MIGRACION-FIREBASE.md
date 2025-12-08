# 🔥 Migración a Firebase - ServicioNotificaciones

## ✅ Cambios Realizados

### 1. Base de Datos
- ❌ **ANTES**: SQL Server (Sequelize + mssql)
- ✅ **AHORA**: Firebase Firestore (NoSQL, tiempo real)

### 2. Dependencias Actualizadas

**Eliminadas:**
- `sequelize`
- `mssql`
- `tedious`
- `pg`
- `pg-hstore`

**Agregadas:**
- `firebase-admin` - SDK oficial de Firebase

### 3. Archivos Modificados

**Nuevos:**
- `src/config/firebase.js` - Configuración de Firebase
- `src/models/Notificacion.js` - Modelo con métodos para Firestore

**Actualizados:**
- `src/server.js` - Usa Firebase en lugar de Sequelize
- `src/services/notificacionService.js` - Métodos adaptados a Firebase
- `package.json` - Dependencias actualizadas
- `.env.example` - Variables de Firebase

**Eliminados:**
- `src/config/database.js` - Ya no se usa SQL Server
- `src/models/index.js` - Ya no se necesita
- `src/database/migrate.js` - Firebase no requiere migraciones

---

## 🚀 Cómo Configurar Firebase

### Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Activa **Firestore Database**

### Paso 2: Obtener Credenciales

1. Ve a **Configuración del Proyecto** > **Cuentas de servicio**
2. Haz clic en **Generar nueva clave privada**
3. Descarga el archivo JSON
4. Guárdalo como `firebase-credentials.json` en la raíz del proyecto

### Paso 3: Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
PORT=3000

FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password-app
EMAIL_FROM="Notificador Académico"
```

### Paso 4: Instalar Dependencias

```bash
npm install
```

### Paso 5: Iniciar el Servicio

```bash
npm start
```

---

## 📊 Estructura de Datos en Firestore

### Colección: `notificaciones`

```javascript
{
  id: "auto-generado-por-firestore",
  destinatario_email: "estudiante@email.com",
  destinatario_nombre: "Juan Pérez",
  destinatario_rol: "estudiante",
  tipo: "nueva_tarea",
  tarea_info: {
    titulo: "Tarea de Matemáticas",
    descripcion: "Resolver ejercicios...",
    materia: "Matemáticas",
    fecha_entrega: "2025-12-15T23:59:59Z"
  },
  profesor_info: {
    nombre: "Prof. García"
  },
  canal: "email",
  estado: "enviada",
  fecha_programada: null,
  fecha_enviada: "2025-12-07T10:30:00Z",
  sistema_origen: "sistema_tareas",
  intentos_envio: 1,
  error_mensaje: null,
  createdAt: "2025-12-07T10:00:00Z",
  updatedAt: "2025-12-07T10:30:00Z"
}
```

---

## 🎯 Ventajas de Firebase

1. **Tiempo Real** - Los cambios se sincronizan instantáneamente
2. **Escalabilidad** - Automática, no te preocupas por servidores
3. **Push Notifications** - Integración nativa con FCM
4. **Hosting Gratuito** - Para la base de datos
5. **Sin Migraciones** - NoSQL flexible, sin esquemas rígidos
6. **Consultas Simples** - Para el caso de notificaciones es perfecto

---

## 📝 Métodos Disponibles

```javascript
const Notificacion = require('./models/Notificacion');

// Crear
await Notificacion.crear({ ... });

// Obtener todas (con filtros)
await Notificacion.obtenerTodas({ estado: 'enviada' });

// Obtener por ID
await Notificacion.obtenerPorId(id);

// Actualizar
await Notificacion.actualizar(id, { estado: 'enviada' });

// Marcar como enviada
await Notificacion.marcarComoEnviada(id);

// Marcar como fallida
await Notificacion.marcarComoFallida(id, 'Error de SMTP');

// Obtener pendientes
await Notificacion.obtenerPendientes();

// Obtener programadas listas
await Notificacion.obtenerProgramadasListas();

// Eliminar
await Notificacion.eliminar(id);
```

---

## 🧪 Modo Simulación

Si no configuras Firebase, el servicio funciona en **modo simulación**:
- No guarda en base de datos real
- Solo muestra logs en consola
- Útil para desarrollo sin Firebase

---

## ⚠️ Importante

- **Nunca subas `firebase-credentials.json` a Git**
- Agrega al `.gitignore`:
  ```
  firebase-credentials.json
  .env
  ```

---

¡Listo! Ahora tu servicio de notificaciones usa Firebase 🔥
