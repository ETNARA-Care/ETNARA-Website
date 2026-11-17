# Formulario de demo → backend de ETNARA (diseño, sin implementar)

**Estado:** solo diseño. El backend no se ha modificado ni desplegado. El sitio sigue abriendo el correo del visitante (`FORM_ENDPOINT` vacío en `script.js`). Activarlo requiere autorización expresa.

## Qué hace el sitio (ya preparado en `script.js`)
- Con `FORM_ENDPOINT` vacío: comportamiento actual (abre el correo hacia contacto@etnaracare.com).
- Con `FORM_ENDPOINT` configurado: `POST` JSON y muestra «¡Recibido! Gracias.» **solo** si el servidor responde 2xx con `{"ok":true}`.
- `429`: muestra «demasiadas solicitudes», sin confirmar.
- Cualquier otro fallo, o 12 s sin respuesta: cae al correo como respaldo.

## Contrato propuesto
`POST https://<api>/public/demo-requests` (sin sesión; sin cookies)

```json
{ "nombre": "…", "agencia": "…", "telefono": "…", "email": "…", "empleados": "11 a 25",
  "tipo": "Agencia de cuido en el hogar", "mensaje": "…", "fundadora": true, "sitio": "" }
```
Respuestas: `201 {"ok":true}` · `400 {"error":"INVALID_INPUT"}` · `429 {"error":"RATE_LIMITED"}` · `5xx`.

## Requisitos del servidor
1. **Validación** (zod, estricta): `nombre` ≤120, `agencia` ≤160, `telefono` ≤30, `email` opcional ≤254 y con formato, `empleados` y `tipo` de listas cerradas, `mensaje` ≤1000, `fundadora` booleano. Campos desconocidos: rechazo. Cuerpo máximo 8 KB.
2. **Spam:** si `sitio` (campo trampa) viene lleno, responder `201 {"ok":true}` y descartar sin guardar ni enviar. Rechazar `Content-Type` distinto de JSON.
3. **Límites:** por IP (p. ej. 5 por hora y 20 por día) y tope global diario; al superarlos, `429`. La IP se usa solo para el límite (hash con sal, 24 h), no se guarda con la solicitud.
4. **CORS:** solo `https://etnaracare.com` (y `www`), método `POST`, sin credenciales.
5. **Recepción real:** responder `201` únicamente después de guardar la solicitud. El aviso por correo a contacto@etnaracare.com (Resend, ya en uso) va después; si el correo falla, la solicitud queda guardada y se reintenta.
6. **Privacidad y acceso:**
   - tabla propia (`demo_requests`), fuera de los datos de las agencias; sin `organization_id`;
   - `app_runtime` solo puede insertar; lectura únicamente para ETNARA Central autorizado (o solo por el correo, si no se construye pantalla);
   - los registros (logs) no incluyen nombre, teléfono, correo ni mensaje: solo conteos y códigos;
   - retención propuesta: 12 meses, luego borrado.
7. **Sin datos clínicos:** el formulario lo advierte («No incluyas datos de salud…»). El servidor no pide ni estructura ningún dato de personas atendidas.
8. **Errores:** nunca devolver detalles internos; códigos estables como arriba.

## Lo que haría falta autorizar
- Una migración nueva (tabla `demo_requests`) y el módulo público en ETNARA-Backend, con sus pruebas.
- Despliegue en Railway y la variable CORS.
- Después, fijar `FORM_ENDPOINT` en `script.js` y publicar el sitio.

## Estado del correo institucional
- El sitio usa solo `contacto@etnaracare.com` y `soporte@etnaracare.com`. No hay referencias a Gmail ni a correos personales.
- Antes de publicar: confirmar con un mensaje de prueba que `contacto@etnaracare.com` recibe y responde. No se tocaron DNS, MX, SPF, DKIM ni DMARC.
