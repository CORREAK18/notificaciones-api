const Notificacion = require('../models/Notificacion');
const emailService = require('./emailService');

class NotificacionService {
  async crearNotificacionNuevaTarea(datos) {
    const notificacion = await Notificacion.crear({
      destinatario_email: datos.destinatario_email,
      destinatario_nombre: datos.destinatario_nombre,
      destinatario_rol: datos.destinatario_rol || 'estudiante',
      tipo: 'nueva_tarea',
      canal: datos.canal || 'email',
      tarea_info: datos.tarea_info,
      profesor_info: datos.profesor_info || null,
      sistema_origen: datos.sistema_origen || null,
      fecha_programada: datos.fecha_programada || null,
      estado: datos.fecha_programada ? 'programada' : 'pendiente'
    });

    if (!datos.fecha_programada) {
      await this.enviarNotificacion(notificacion.id);
    }

    return notificacion;
  }

  async crearRecordatorio(datos) {
    const notificacion = await Notificacion.crear({
      destinatario_email: datos.destinatario_email,
      destinatario_nombre: datos.destinatario_nombre,
      destinatario_rol: datos.destinatario_rol || 'estudiante',
      tipo: 'recordatorio',
      canal: datos.canal || 'email',
      tarea_info: datos.tarea_info,
      sistema_origen: datos.sistema_origen || null,
      estado: 'pendiente'
    });

    await this.enviarNotificacion(notificacion.id);
    return notificacion;
  }

  async crearNotificacionCalificacion(datos) {
    const notificacion = await Notificacion.crear({
      destinatario_email: datos.destinatario_email,
      destinatario_nombre: datos.destinatario_nombre,
      destinatario_rol: datos.destinatario_rol || 'estudiante',
      tipo: 'tarea_calificada',
      canal: datos.canal || 'email',
      tarea_info: datos.tarea_info,
      profesor_info: datos.profesor_info || null,
      sistema_origen: datos.sistema_origen || null,
      estado: 'pendiente'
    });

    await this.enviarNotificacion(notificacion.id);
    return notificacion;
  }

  async crearNotificacionActualizacion(datos) {
    const notificacion = await Notificacion.crear({
      destinatario_email: datos.destinatario_email,
      destinatario_nombre: datos.destinatario_nombre,
      destinatario_rol: datos.destinatario_rol || 'estudiante',
      tipo: 'tarea_actualizada',
      canal: datos.canal || 'email',
      tarea_info: datos.tarea_info,
      profesor_info: datos.profesor_info || null,
      sistema_origen: datos.sistema_origen || null,
      estado: 'pendiente'
    });

    await this.enviarNotificacion(notificacion.id);
    return notificacion;
  }

  async crearNotificacionTareaVencida(datos) {
    const notificacion = await Notificacion.crear({
      destinatario_email: datos.destinatario_email,
      destinatario_nombre: datos.destinatario_nombre,
      destinatario_rol: datos.destinatario_rol || 'estudiante',
      tipo: 'tarea_vencida',
      canal: datos.canal || 'email',
      tarea_info: datos.tarea_info,
      profesor_info: datos.profesor_info || null,
      sistema_origen: datos.sistema_origen || null,
      estado: 'pendiente'
    });

    await this.enviarNotificacion(notificacion.id);
    return notificacion;
  }

  async enviarNotificacion(notificacionId) {
    const notificacion = await Notificacion.obtenerPorId(notificacionId);
    if (!notificacion) throw new Error('Notificación no encontrada');

    let resultado = { success: false };

    if (notificacion.canal === 'email') {
      const html = emailService.generarPlantillaNotificacion(notificacion.tipo, {
        estudiante: notificacion.destinatario_nombre,
        titulo: notificacion.tarea_info.titulo,
        descripcion: notificacion.tarea_info.descripcion,
        materia: notificacion.tarea_info.materia,
        fechaEntrega: notificacion.tarea_info.fecha_entrega,
        profesor: notificacion.profesor_info?.nombre
      });

      const asunto = `Notificación: ${notificacion.tarea_info.titulo}`;
      resultado = await emailService.enviarEmail(notificacion.destinatario_email, asunto, html);
    } else {
      // Simulación para push/sms
      resultado = { success: true };
    }

    if (resultado.success) {
      await Notificacion.marcarComoEnviada(notificacionId);
    } else {
      await Notificacion.marcarComoFallida(notificacionId, resultado.error || 'Error desconocido');
    }

    return await Notificacion.obtenerPorId(notificacionId);
  }

  async obtenerHistorial(filtros = {}) {
    const notificaciones = await Notificacion.obtenerTodas({
      destinatario_email: filtros.destinatario_email,
      tipo: filtros.tipo,
      estado: filtros.estado,
      limit: filtros.limit || 50
    });

    return {
      count: notificaciones.length,
      rows: notificaciones
    };
  }

  async obtenerEstadisticas(filtros = {}) {
    const todasNotificaciones = await Notificacion.obtenerTodas({});
    
    const enviadas = todasNotificaciones.filter(n => n.estado === 'enviada').length;
    const fallidas = todasNotificaciones.filter(n => n.estado === 'fallida').length;
    const pendientes = todasNotificaciones.filter(n => n.estado === 'pendiente').length;

    return {
      total: todasNotificaciones.length,
      por_estado: { enviadas, fallidas, pendientes }
    };
  }

  async reenviarNotificacion(id) {
    return this.enviarNotificacion(id);
  }

  async procesarNotificacionesPendientes() {
    const pendientes = await Notificacion.obtenerPendientes();
    const programadas = await Notificacion.obtenerProgramadasListas();
    
    const notificaciones = [...pendientes, ...programadas];

    let exitosas = 0;
    let fallidas = 0;

    for (const n of notificaciones) {
      try {
        await this.enviarNotificacion(n.id);
        exitosas++;
      } catch (err) {
        console.error('Error procesando notificación:', err.message);
        fallidas++;
      }
    }

    return { procesadas: notificaciones.length, exitosas, fallidas };
  }
}

module.exports = new NotificacionService();
