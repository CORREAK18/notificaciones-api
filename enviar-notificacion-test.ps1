# Enviar notificacion de prueba a alumno UNP

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "ENVIANDO NOTIFICACION DE PRUEBA" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$bodyObject = @{
    destinatarios = @(
        @{
            email = "0512021029@alumnos.unp.edu.pe"
            nombre = "Estudiante UNP"
            rol = "estudiante"
        }
    )
    tarea = @{
        titulo = "Proyecto Final de Sistemas Distribuidos"
        descripcion = "Desarrollar un sistema de microservicios con arquitectura SOA utilizando Node.js y SQL Server"
        materia = "Arquitectura de Software"
        fecha_entrega = "2025-11-15T23:59:59Z"
    }
    profesor = @{
        nombre = "Dr. Carlos Garcia"
        email = "carlos.garcia@unp.edu.pe"
    }
    canal = "email"
}

$body = $bodyObject | ConvertTo-Json -Depth 10

Write-Host "REQUEST:" -ForegroundColor Yellow
Write-Host "  Metodo: POST" -ForegroundColor White
Write-Host "  URL: http://localhost:3000/api/notificaciones/nueva-tarea-asignada" -ForegroundColor White
Write-Host "  Destinatario: 0512021029@alumnos.unp.edu.pe" -ForegroundColor White
Write-Host ""
Write-Host "Datos enviados:" -ForegroundColor Gray
Write-Host $body -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/notificaciones/nueva-tarea-asignada" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "NOTIFICACION ENVIADA CON EXITO!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "RESPONSE:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    $notifId = $response.notificaciones[0].id
    $notifEstado = $response.notificaciones[0].estado
    Write-Host "ID de notificacion: $notifId" -ForegroundColor Cyan
    Write-Host "Estado: $notifEstado" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
} catch {
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "ERROR AL ENVIAR NOTIFICACION" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor White
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalles:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor White
    }
}
