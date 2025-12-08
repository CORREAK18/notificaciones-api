# Sistema de Recordatorios Automáticos

## 📧 Funcionamiento

El ServicioNotificaciones ahora envía **recordatorios automáticos** cuando una tarea alcanza el **50% del tiempo** antes de su fecha de entrega.

## ⚙️ Cómo Funciona

### Cálculo del Punto Medio

```javascript
Tiempo Total = Fecha Entrega - Fecha Creación
Punto Medio = Fecha Creación + (Tiempo Total / 2)
```

**Ejemplo:**
- Tarea creada: 1 de diciembre a las 10:00
- Fecha de entrega: 10 de diciembre a las 10:00
- Tiempo total: 9 días
- **Punto medio: 5 de diciembre a las 10:00** ← Se envía recordatorio aquí

## 🕐 Programación

### Verificación Automática
- **Frecuencia**: Cada hora (en punto: 00 minutos)
- **Cron**: `0 * * * *`
- **Acción**: Revisa todas las tareas activas y envía recordatorios si es necesario

### Primera Verificación
- Al iniciar el servicio, espera 5 segundos y ejecuta la primera verificación
- Esto permite testing inmediato sin esperar una hora

## 📋 Proceso de Verificación

1. **Obtener tareas activas** desde el ServicioTareasAcademicas
2. Para cada tarea:
   - Calcular fecha de creación y fecha de entrega
   - Calcular punto medio (50% del tiempo)
   - Verificar si ya se alcanzó el punto medio
   - Verificar que la tarea aún no haya vencido
   - Verificar que no se haya enviado recordatorio previamente
3. **Si cumple todas las condiciones**:
   - Crear notificación tipo "recordatorio" para cada estudiante
   - Marcar tarea como notificada (evitar duplicados)
   - Registrar en logs

## 🔒 Prevención de Duplicados

El sistema usa un `Set` en memoria para rastrear tareas ya notificadas:

```javascript
tareasNotificadas = Set {
  'tarea-id-123-recordatorio',
  'tarea-id-456-recordatorio'
}
```

**Nota:** Si el servicio se reinicia, el Set se vacía y podría reenviar recordatorios. En producción se podría usar Redis o la base de datos.

## 📊 Logs

```
Verificando tareas para enviar recordatorios...
✓ Recordatorio enviado para tarea: Ejercicios de Matemáticas (2 estudiantes)
Total de recordatorios enviados: 2
```

## 🎯 Tipo de Notificación

Las notificaciones de recordatorio incluyen:

```json
{
  "tipo": "recordatorio",
  "destinatario_email": "estudiante@email.com",
  "tarea_info": {
    "id": "...",
    "titulo": "...",
    "descripcion": "...",
    "materia": "...",
    "fecha_entrega": "..."
  },
  "profesor_info": {
    "nombre": "...",
    "email": "..."
  }
}
```

## ⚡ Testing

Para probar el sistema:

1. Crear una tarea con fecha de entrega en el futuro (ej: 2 horas desde ahora)
2. Modificar manualmente la fecha de creación en la BD para simular que fue creada hace tiempo
3. Esperar la verificación horaria o reiniciar el servicio (verifica a los 5 segundos)

**O modificar temporalmente el cron para que verifique cada minuto:**

```javascript
// En schedulerService.js
cron.schedule('* * * * *', async () => { // Cada minuto
  await this.verificarYEnviarRecordatorios();
});
```

## 🔧 Configuración

### Variables de Entorno

```env
# .env en ServicioNotificaciones
TAREAS_API_URL=http://localhost:3001/api/tareas
```

Si no está definida, usa `http://localhost:3001/api/tareas` por defecto.

## 📈 Mejoras Futuras

1. **Persistencia de recordatorios enviados** en Firestore
2. **Configuración personalizable** del porcentaje (50%, 25%, etc.)
3. **Múltiples recordatorios** (50%, 75%, 90% del tiempo)
4. **Webhooks** para notificar al servicio de tareas
5. **Panel de administración** para ver recordatorios enviados

## ✅ Estado Actual

- ✅ Verificación cada hora
- ✅ Cálculo automático del punto medio
- ✅ Envío a todos los estudiantes asignados
- ✅ Prevención de duplicados en memoria
- ✅ Logs detallados
- ✅ Manejo de errores
- ✅ Testing inmediato al iniciar
