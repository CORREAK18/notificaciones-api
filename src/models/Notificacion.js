const { getFirestore } = require('../config/firebase');

/**
 * Modelo de Notificación para Firebase Firestore
 */
class NotificacionModel {
  
  constructor() {
    this.collection = 'notificaciones';
  }

  /**
   * Crear una nueva notificación
   */
  async crear(data) {
    const db = getFirestore();
    
    if (!db) {
      // Modo simulación
      console.log('📝 [SIMULACIÓN] Notificación creada:', data);
      return { id: Date.now().toString(), ...data, createdAt: new Date() };
    }

    const notificacion = {
      destinatario_email: data.destinatario_email,
      destinatario_nombre: data.destinatario_nombre,
      destinatario_rol: data.destinatario_rol || 'estudiante',
      tipo: data.tipo,
      tarea_info: data.tarea_info || {},
      profesor_info: data.profesor_info || null,
      canal: data.canal || 'email',
      estado: data.estado || 'pendiente',
      fecha_programada: data.fecha_programada || null,
      fecha_enviada: null,
      sistema_origen: data.sistema_origen || 'sistema_tareas',
      intentos_envio: 0,
      error_mensaje: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection(this.collection).add(notificacion);
    
    return { id: docRef.id, ...notificacion };
  }

  /**
   * Obtener todas las notificaciones
   */
  async obtenerTodas(filtros = {}) {
    const db = getFirestore();
    
    if (!db) {
      console.log('📝 [SIMULACIÓN] Obtener todas las notificaciones');
      return [];
    }

    let query = db.collection(this.collection);

    // Aplicar filtros
    if (filtros.destinatario_email) {
      query = query.where('destinatario_email', '==', filtros.destinatario_email);
    }
    if (filtros.estado) {
      query = query.where('estado', '==', filtros.estado);
    }
    if (filtros.tipo) {
      query = query.where('tipo', '==', filtros.tipo);
    }

    // Ordenar por fecha de creación descendente
    query = query.orderBy('createdAt', 'desc');

    // Limitar resultados
    if (filtros.limit) {
      query = query.limit(parseInt(filtros.limit));
    }

    const snapshot = await query.get();
    
    const notificaciones = [];
    snapshot.forEach(doc => {
      notificaciones.push({ id: doc.id, ...doc.data() });
    });

    return notificaciones;
  }

  /**
   * Obtener una notificación por ID
   */
  async obtenerPorId(id) {
    const db = getFirestore();
    
    if (!db) {
      console.log('📝 [SIMULACIÓN] Obtener notificación:', id);
      return null;
    }

    const doc = await db.collection(this.collection).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() };
  }

  /**
   * Actualizar una notificación
   */
  async actualizar(id, data) {
    const db = getFirestore();
    
    if (!db) {
      console.log('📝 [SIMULACIÓN] Actualizar notificación:', id, data);
      return { id, ...data };
    }

    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    await db.collection(this.collection).doc(id).update(updateData);
    
    return await this.obtenerPorId(id);
  }

  /**
   * Marcar como enviada
   */
  async marcarComoEnviada(id) {
    return await this.actualizar(id, {
      estado: 'enviada',
      fecha_enviada: new Date()
    });
  }

  /**
   * Marcar como fallida
   */
  async marcarComoFallida(id, errorMensaje) {
    const notificacion = await this.obtenerPorId(id);
    
    return await this.actualizar(id, {
      estado: 'fallida',
      intentos_envio: (notificacion?.intentos_envio || 0) + 1,
      error_mensaje: errorMensaje
    });
  }

  /**
   * Obtener notificaciones pendientes
   */
  async obtenerPendientes() {
    const db = getFirestore();
    
    if (!db) {
      console.log('📝 [SIMULACIÓN] Obtener pendientes');
      return [];
    }

    const snapshot = await db.collection(this.collection)
      .where('estado', '==', 'pendiente')
      .orderBy('createdAt', 'asc')
      .get();

    const notificaciones = [];
    snapshot.forEach(doc => {
      notificaciones.push({ id: doc.id, ...doc.data() });
    });

    return notificaciones;
  }

  /**
   * Obtener notificaciones programadas que ya deben enviarse
   */
  async obtenerProgramadasListas() {
    const db = getFirestore();
    
    if (!db) {
      console.log('📝 [SIMULACIÓN] Obtener programadas');
      return [];
    }

    const ahora = new Date();
    
    const snapshot = await db.collection(this.collection)
      .where('estado', '==', 'programada')
      .where('fecha_programada', '<=', ahora)
      .get();

    const notificaciones = [];
    snapshot.forEach(doc => {
      notificaciones.push({ id: doc.id, ...doc.data() });
    });

    return notificaciones;
  }

  /**
   * Eliminar una notificación
   */
  async eliminar(id) {
    const db = getFirestore();
    
    if (!db) {
      console.log('📝 [SIMULACIÓN] Eliminar notificación:', id);
      return true;
    }

    await db.collection(this.collection).doc(id).delete();
    return true;
  }
}

module.exports = new NotificacionModel();
