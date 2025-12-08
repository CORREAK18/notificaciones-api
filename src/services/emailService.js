const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async enviarEmail(destinatario, asunto, mensajeHtml) {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM} <${process.env.SMTP_USER}>`,
        to: destinatario,
        subject: asunto,
        html: mensajeHtml
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado a ${destinatario}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error al enviar email:', error);
      return { success: false, error: error.message };
    }
  }

  // Plantilla base HTML profesional
  generarPlantillaBase(titulo, contenido, colorPrincipal = '#4F46E5') {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titulo}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, ${colorPrincipal} 0%, ${this.ajustarColor(colorPrincipal, -20)} 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                                    EducaPro Corporation
                                </h1>
                                <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 300;">
                                    Sistema de Gestión Académica
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                ${contenido}
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                                    Este es un mensaje automático del Sistema de Notificaciones Académicas
                                </p>
                                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                    &copy; ${new Date().getFullYear()} EducaPro Corporation. Todos los derechos reservados.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
  }

  // Función auxiliar para ajustar colores
  ajustarColor(color, cantidad) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + cantidad));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + cantidad));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + cantidad));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  // Formatear fecha de manera legible
  formatearFecha(fecha) {
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  }

  generarPlantillaNotificacion(tipo, datos) {
    switch (tipo) {
      case 'nueva_tarea':
        return this.generarPlantillaBase(
          'Nueva Tarea Asignada',
          `
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #EEF2FF; padding: 20px; border-radius: 50%; margin-bottom: 20px;">
              <span style="font-size: 48px;">📚</span>
            </div>
            <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
              Nueva Tarea Asignada
            </h2>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Se te ha asignado una nueva tarea académica
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; border-left: 4px solid #4F46E5; margin-bottom: 25px;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              Hola, ${datos.estudiante}
            </p>
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
              ${datos.titulo}
            </h3>
            <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
              ${datos.descripcion || 'Sin descripción adicional'}
            </p>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📖 Materia:</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.materia}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📅 Fecha de Entrega:</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #DC2626; font-size: 14px; font-weight: 600;">${this.formatearFecha(datos.fechaEntrega)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">👨‍🏫 Profesor:</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.profesor}</span>
              </td>
            </tr>
          </table>

          <div style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 5px 0; color: #4F46E5; font-size: 13px; font-weight: 600;">
              💡 RECORDATORIO
            </p>
            <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
              Organiza tu tiempo y completa la tarea antes de la fecha límite
            </p>
          </div>
          `,
          '#4F46E5'
        );

      case 'recordatorio':
        const diasRestantes = datos.diasRestantes || 0;
        const urgencia = diasRestantes <= 1 ? '#DC2626' : diasRestantes <= 3 ? '#F59E0B' : '#4F46E5';
        
        return this.generarPlantillaBase(
          'Recordatorio de Tarea',
          `
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: ${urgencia === '#DC2626' ? '#FEE2E2' : urgencia === '#F59E0B' ? '#FEF3C7' : '#EEF2FF'}; padding: 20px; border-radius: 50%; margin-bottom: 20px;">
              <span style="font-size: 48px;">⏰</span>
            </div>
            <h2 style="margin: 0 0 10px 0; color: ${urgencia}; font-size: 24px; font-weight: 600;">
              ¡Recordatorio de Tarea!
            </h2>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Tu tarea está próxima a vencer
            </p>
          </div>

          <div style="background-color: ${urgencia === '#DC2626' ? '#FEE2E2' : urgencia === '#F59E0B' ? '#FEF3C7' : '#EEF2FF'}; padding: 25px; border-radius: 8px; border-left: 4px solid ${urgencia}; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              Hola, ${datos.estudiante}
            </p>
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
              ${datos.titulo}
            </h3>
            <div style="display: inline-block; background-color: ${urgencia}; color: white; padding: 10px 20px; border-radius: 20px; font-size: 16px; font-weight: 600;">
              ${diasRestantes === 0 ? '¡VENCE HOY!' : diasRestantes === 1 ? 'Vence mañana' : `Quedan ${diasRestantes} días`}
            </div>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📖 Materia:</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.materia}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📅 Fecha de Entrega:</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="color: ${urgencia}; font-size: 14px; font-weight: 600;">${this.formatearFecha(datos.fechaEntrega)}</span>
              </td>
            </tr>
          </table>

          <div style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 5px 0; color: #DC2626; font-size: 13px; font-weight: 600;">
              ⚠️ ACCIÓN REQUERIDA
            </p>
            <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
              Por favor, completa tu tarea lo antes posible
            </p>
          </div>
          `,
          urgencia
        );

      case 'tarea_calificada':
        const notaNumerica = parseFloat(datos.calificacion) || 0;
        const colorNota = notaNumerica >= 7 ? '#10B981' : notaNumerica >= 5 ? '#F59E0B' : '#DC2626';
        
        return this.generarPlantillaBase(
          'Tarea Calificada',
          `
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: ${colorNota === '#10B981' ? '#D1FAE5' : colorNota === '#F59E0B' ? '#FEF3C7' : '#FEE2E2'}; padding: 20px; border-radius: 50%; margin-bottom: 20px;">
              <span style="font-size: 48px;">📊</span>
            </div>
            <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
              Tu Tarea ha sido Calificada
            </h2>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Ya puedes revisar tu calificación
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; border-left: 4px solid ${colorNota}; margin-bottom: 25px;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              Hola, ${datos.estudiante}
            </p>
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
              ${datos.titulo}
            </h3>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              Tu Calificación
            </p>
            <div style="display: inline-block; background-color: ${colorNota}; color: white; padding: 20px 40px; border-radius: 12px; font-size: 48px; font-weight: 700; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${datos.calificacion}
            </div>
          </div>

          ${datos.comentarios ? `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              💬 Comentarios del Profesor
            </p>
            <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6; font-style: italic;">
              "${datos.comentarios}"
            </p>
          </div>
          ` : ''}

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📖 Materia:</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.materia}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">👨‍🏫 Profesor:</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.profesor}</span>
              </td>
            </tr>
          </table>

          <div style="background: linear-gradient(135deg, ${colorNota === '#10B981' ? '#D1FAE5' : colorNota === '#F59E0B' ? '#FEF3C7' : '#FEE2E2'} 0%, ${colorNota === '#10B981' ? '#A7F3D0' : colorNota === '#F59E0B' ? '#FDE68A' : '#FECACA'} 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 5px 0; color: ${colorNota}; font-size: 13px; font-weight: 600;">
              ${notaNumerica >= 7 ? '🎉 ¡EXCELENTE TRABAJO!' : notaNumerica >= 5 ? '👍 BUEN ESFUERZO' : '💪 SIGUE INTENTANDO'}
            </p>
            <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
              ${notaNumerica >= 7 ? 'Continúa con ese rendimiento' : notaNumerica >= 5 ? 'Puedes mejorar aún más' : 'No te desanimes, aprende de esta experiencia'}
            </p>
          </div>
          `,
          colorNota
        );

      case 'tarea_actualizada':
        return this.generarPlantillaBase(
          'Tarea Actualizada',
          `
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #FEF3C7; padding: 20px; border-radius: 50%; margin-bottom: 20px;">
              <span style="font-size: 48px;">🔔</span>
            </div>
            <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
              Cambios en tu Tarea
            </h2>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Se han realizado modificaciones en una tarea asignada
            </p>
          </div>

          <div style="background-color: #FFFBEB; padding: 25px; border-radius: 8px; border-left: 4px solid #F59E0B; margin-bottom: 25px;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              Hola, ${datos.estudiante}
            </p>
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
              ${datos.titulo}
            </h3>
            <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
              ${datos.descripcion || 'Se actualizó la información de la tarea'}
            </p>
          </div>

          ${datos.cambios ? `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              📝 Cambios Realizados
            </p>
            <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
              ${datos.cambios}
            </p>
          </div>
          ` : ''}

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📖 Materia:</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.materia}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📅 Nueva Fecha de Entrega:</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #F59E0B; font-size: 14px; font-weight: 600;">${this.formatearFecha(datos.fechaEntrega)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">👨‍🏫 Profesor:</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.profesor}</span>
              </td>
            </tr>
          </table>

          <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 5px 0; color: #F59E0B; font-size: 13px; font-weight: 600;">
              ⚡ ATENCIÓN
            </p>
            <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
              Revisa los cambios y ajusta tu planificación si es necesario
            </p>
          </div>
          `,
          '#F59E0B'
        );

      case 'tarea_vencida':
        return this.generarPlantillaBase(
          'Tarea Vencida',
          `
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: #FEE2E2; padding: 20px; border-radius: 50%; margin-bottom: 20px;">
              <span style="font-size: 48px;">⚠️</span>
            </div>
            <h2 style="margin: 0 0 10px 0; color: #DC2626; font-size: 24px; font-weight: 600;">
              Tarea Vencida
            </h2>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              El plazo de entrega ha expirado
            </p>
          </div>

          <div style="background-color: #FEE2E2; padding: 25px; border-radius: 8px; border-left: 4px solid #DC2626; margin-bottom: 25px;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              Hola, ${datos.estudiante}
            </p>
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
              ${datos.titulo}
            </h3>
            <p style="margin: 0; color: #991B1B; font-size: 15px; line-height: 1.6; font-weight: 500;">
              Esta tarea ha alcanzado su fecha límite de entrega y ahora se encuentra en estado <strong>Terminada</strong>.
            </p>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📖 Materia:</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.materia}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">📅 Fecha de Vencimiento:</span>
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                <span style="color: #DC2626; font-size: 14px; font-weight: 600;">${this.formatearFecha(datos.fechaEntrega)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0;">
                <span style="color: #6b7280; font-size: 13px; font-weight: 600;">👨‍🏫 Profesor:</span>
              </td>
              <td style="padding: 12px 0; text-align: right;">
                <span style="color: #1f2937; font-size: 14px; font-weight: 500;">${datos.profesor}</span>
              </td>
            </tr>
          </table>

          <div style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 5px 0; color: #DC2626; font-size: 13px; font-weight: 600;">
              ⏰ IMPORTANTE
            </p>
            <p style="margin: 0; color: #4b5563; font-size: 13px; line-height: 1.5;">
              Si necesitas más información o tienes dudas, contacta con tu profesor
            </p>
          </div>
          `,
          '#DC2626'
        );

      default:
        return this.generarPlantillaBase(
          'Notificación Académica',
          `
          <div style="padding: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px;">
              ${JSON.stringify(datos, null, 2)}
            </p>
          </div>
          `,
          '#4F46E5'
        );
    }
  }
}

module.exports = new EmailService();
