const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificacionController');

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

// Crear notificaciones
router.post('/nueva-tarea-asignada', ctrl.nuevaTareaAsignada);
router.post('/recordatorio', ctrl.enviarRecordatorio);
router.post('/tarea-calificada', ctrl.tareaCalificada);
router.post('/tarea-actualizada', ctrl.tareaActualizada);

// Consultar notificaciones
router.get('/historial', ctrl.obtenerHistorial);
router.get('/estadisticas', ctrl.obtenerEstadisticas);
router.get('/:id', ctrl.obtenerNotificacion);

// Acciones sobre notificaciones
router.post('/:id/reenviar', ctrl.reenviarNotificacion);
router.delete('/:id', ctrl.eliminarNotificacion);
router.post('/enviar-pendientes', ctrl.enviarNotificacionesPendientes);

module.exports = router;
