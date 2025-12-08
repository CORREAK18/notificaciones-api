const cron = require('node-cron');
const notificacionService = require('./notificacionService');
const axios = require('axios');

// URL del servicio de tareas
const TAREAS_API = process.env.TAREAS_API_URL || 'http://localhost:3001/api/tareas';

class SchedulerService {
  constructor() {
    this.tareasNotificadas = new Set(); // Para evitar enviar múltiples recordatorios
  }

  async verificarYEnviarRecordatorios() {
    try {
      console.log('Verificando tareas para enviar recordatorios...');
      
      // Obtener todas las tareas activas
      const response = await axios.get(`${TAREAS_API}?estado=activa`);
      const tareas = response.data.tareas || [];
      
      const ahora = new Date();
      let recordatoriosEnviados = 0;

      for (const tarea of tareas) {
        const fechaCreacion = new Date(tarea.fecha_creacion || tarea.createdAt);
        const fechaEntrega = new Date(tarea.fecha_entrega);
        
        // Calcular el tiempo total y el punto medio
        const tiempoTotal = fechaEntrega - fechaCreacion;
        const puntoMedio = new Date(fechaCreacion.getTime() + (tiempoTotal / 2));
        
        // Verificar si ya pasó el punto medio y aún no se ha enviado recordatorio
        const claveNotificacion = `${tarea.id}-recordatorio`;
        
        if (ahora >= puntoMedio && ahora < fechaEntrega && !this.tareasNotificadas.has(claveNotificacion)) {
          // Enviar recordatorio a cada estudiante asignado
          let estudiantes = [];
          
          try {
            if (Array.isArray(tarea.estudiantes_asignados)) {
              estudiantes = tarea.estudiantes_asignados;
            } else if (typeof tarea.estudiantes_asignados === 'string') {
              estudiantes = JSON.parse(tarea.estudiantes_asignados);
            }
          } catch (error) {
            console.error(`Error parseando estudiantes para tarea ${tarea.id}:`, error.message);
            continue;
          }
          
          for (const email of estudiantes) {
            try {
              await notificacionService.crearRecordatorio({
                destinatario_email: email,
                destinatario_nombre: email.split('@')[0],
                tarea_info: {
                  id: tarea.id,
                  titulo: tarea.titulo,
                  descripcion: tarea.descripcion,
                  materia: tarea.materia,
                  fecha_entrega: tarea.fecha_entrega
                },
                profesor_info: {
                  nombre: tarea.profesor_nombre,
                  email: tarea.profesor_email
                }
              });
              
              recordatoriosEnviados++;
            } catch (error) {
              console.error(`Error enviando recordatorio a ${email}:`, error.message);
            }
          }
          
          // Marcar como notificada
          this.tareasNotificadas.add(claveNotificacion);
          console.log(`✓ Recordatorio enviado para tarea: ${tarea.titulo} (${estudiantes.length} estudiantes)`);
        }
      }
      
      console.log(`Total de recordatorios enviados: ${recordatoriosEnviados}`);
    } catch (error) {
      console.error('Error verificando tareas para recordatorios:', error.message);
    }
  }

  iniciarTareasProgramadas() {
    console.log('Iniciando tareas programadas...');

    // Verificar recordatorios cada hora
    cron.schedule('0 * * * *', async () => {
      console.log('Ejecutando: verificación de recordatorios automáticos');
      try {
        await this.verificarYEnviarRecordatorios();
      } catch (error) {
        console.error('Error en scheduler (recordatorios automáticos):', error);
      }
    });

    // Procesar pendientes cada 5 minutos
    cron.schedule('*/5 * * * *', async () => {
      console.log('Ejecutando: procesar notificaciones pendientes');
      try {
        await notificacionService.procesarNotificacionesPendientes();
      } catch (error) {
        console.error('Error en scheduler (pendientes):', error);
      }
    });

    // Verificar recordatorios al iniciar (para testing inmediato)
    setTimeout(() => {
      this.verificarYEnviarRecordatorios();
    }, 5000);

    console.log('✓ Tareas programadas iniciadas');
    console.log('  - Recordatorios automáticos: cada hora');
    console.log('  - Procesar pendientes: cada 5 minutos');
  }
}

module.exports = new SchedulerService();
