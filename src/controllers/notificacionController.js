const notificacionService = require('../services/notificacionService');
const Notificacion = require('../models/Notificacion');

// ============================================
// CONTROLADOR DE NOTIFICACIONES (sin clases)
// ============================================

const nuevaTareaAsignada = async (req, res) => {
  try {
    const { destinatarios, tarea, profesor, canal = 'email', fecha_programada } = req.body;

    if (!destinatarios || !Array.isArray(destinatarios) || destinatarios.length === 0) {
      return res.status(400).json({ error: 'Se requiere array de destinatarios' });
    }

    if (!tarea || !tarea.titulo || !tarea.fecha_entrega) {
      return res.status(400).json({ error: 'Se requieren datos de la tarea' });
    }

    const creadas = [];
    for (const d of destinatarios) {
      const n = await notificacionService.crearNotificacionNuevaTarea({
        destinatario_email: d.email,
        destinatario_nombre: d.nombre,
        destinatario_rol: d.rol,
        tarea_info: tarea,
        profesor_info: profesor,
        canal,
        fecha_programada,
        sistema_origen: req.headers['x-sistema-origen'] || 'sistema-externo'
      });
      creadas.push(n);
    }

    res.status(201).json({ message: `Se crearon ${creadas.length} notificaciones`, notificaciones: creadas });
  } catch (error) {
    console.error('Error nuevaTareaAsignada:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const enviarRecordatorio = async (req, res) => {
  try {
    const { destinatarios, tarea, tipo_recordatorio = '24_horas', canal = 'email' } = req.body;
    if (!destinatarios || !Array.isArray(destinatarios)) return res.status(400).json({ error: 'Se requiere destinatarios' });

    const creadas = [];
    for (const d of destinatarios) {
      const n = await notificacionService.crearRecordatorio({
        destinatario_email: d.email,
        destinatario_nombre: d.nombre,
        destinatario_rol: d.rol,
        tarea_info: tarea,
        tipo_recordatorio,
        canal,
        sistema_origen: req.headers['x-sistema-origen'] || 'sistema-externo'
      });
      creadas.push(n);
    }

    res.status(201).json({ message: `Se enviaron ${creadas.length} recordatorios`, notificaciones: creadas });
  } catch (error) {
    console.error('Error enviarRecordatorio:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const tareaCalificada = async (req, res) => {
  try {
    const { destinatario, tarea, calificacion, comentarios, profesor, canal = 'email' } = req.body;
    if (!destinatario || !destinatario.email) return res.status(400).json({ error: 'Se requiere destinatario con email' });
    if (!tarea || !tarea.titulo) return res.status(400).json({ error: 'Se requiere tarea' });
    if (calificacion === undefined) return res.status(400).json({ error: 'Se requiere calificación' });

    const n = await notificacionService.crearNotificacionCalificacion({
      destinatario_email: destinatario.email,
      destinatario_nombre: destinatario.nombre,
      tarea_info: { ...tarea, calificacion, comentarios },
      profesor_info: profesor,
      canal
    });

    res.status(201).json({ message: 'Notificación de calificación enviada', notificacion: n });
  } catch (error) {
    console.error('Error tareaCalificada:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const tareaActualizada = async (req, res) => {
  try {
    const { destinatarios, tarea, cambios, profesor, canal = 'email' } = req.body;
    if (!destinatarios || !Array.isArray(destinatarios)) return res.status(400).json({ error: 'Se requiere destinatarios' });

    const creadas = [];
    for (const d of destinatarios) {
      const n = await notificacionService.crearNotificacionActualizacion({
        destinatario_email: d.email,
        destinatario_nombre: d.nombre,
        tarea_info: { ...tarea, cambios_realizados: cambios },
        profesor_info: profesor,
        canal,
        sistema_origen: req.headers['x-sistema-origen'] || 'sistema-externo'
      });
      creadas.push(n);
    }

    res.status(201).json({ message: `Se enviaron ${creadas.length} notificaciones de actualización`, notificaciones: creadas });
  } catch (error) {
    console.error('Error tareaActualizada:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const obtenerHistorial = async (req, res) => {
  try {
    const filtros = {
      destinatario_email: req.query.email,
      tipo: req.query.tipo,
      estado: req.query.estado,
      fecha_rango: req.query.fecha_desde || req.query.fecha_hasta ? { desde: req.query.fecha_desde, hasta: req.query.fecha_hasta } : undefined,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const resultado = await notificacionService.obtenerHistorial(filtros);
    res.json({ total: resultado.count, notificaciones: resultado.rows });
  } catch (error) {
    console.error('Error obtenerHistorial:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const obtenerNotificacion = async (req, res) => {
  try {
    const notificacion = await Notificacion.obtenerPorId(req.params.id);
    if (!notificacion) return res.status(404).json({ error: 'Notificación no encontrada' });
    res.json(notificacion);
  } catch (error) {
    console.error('Error obtenerNotificacion:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const obtenerEstadisticas = async (req, res) => {
  try {
    const filtros = { fecha_desde: req.query.fecha_desde, fecha_hasta: req.query.fecha_hasta, sistema_origen: req.query.sistema_origen };
    const stats = await notificacionService.obtenerEstadisticas(filtros);
    res.json(stats);
  } catch (error) {
    console.error('Error obtenerEstadisticas:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const reenviarNotificacion = async (req, res) => {
  try {
    const n = await notificacionService.reenviarNotificacion(req.params.id);
    res.json({ message: 'Notificación reenviada', notificacion: n });
  } catch (error) {
    console.error('Error reenviarNotificacion:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const eliminarNotificacion = async (req, res) => {
  try {
    const n = await Notificacion.obtenerPorId(req.params.id);
    if (!n) return res.status(404).json({ error: 'Notificación no encontrada' });
    await Notificacion.eliminar(req.params.id);
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error eliminarNotificacion:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

const enviarNotificacionesPendientes = async (req, res) => {
  try {
    const resultado = await notificacionService.procesarNotificacionesPendientes();
    res.json(resultado);
  } catch (error) {
    console.error('Error enviarNotificacionesPendientes:', error);
    res.status(500).json({ error: 'Error interno', detalle: error.message });
  }
};

module.exports = {
  nuevaTareaAsignada,
  enviarRecordatorio,
  tareaCalificada,
  tareaActualizada,
  obtenerHistorial,
  obtenerNotificacion,
  obtenerEstadisticas,
  reenviarNotificacion,
  eliminarNotificacion,
  enviarNotificacionesPendientes
};
