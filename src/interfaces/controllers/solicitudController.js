// 1. Importa la nueva función en lugar del objeto 'model'
import { crearModeloConServicios } from '../../infrastructure/ai/geminiClient.js';
import { registrarSolicitudUseCase } from '../../application/usecases/registrarSolicitudUseCase.js';
import { banearUsuarioUseCase } from '../../application/usecases/banearUsuarioUseCase.js';
import { encontrarFuncion } from '../../domain/services/procesarRespuestaGemini.js';
import { systemPrompt } from '../../config/promptLoader.js';
import fetch from 'node-fetch';
import '../../config/index.js';

export async function manejarSolicitud(mensaje, idUsuario, ubicacion) {
  // Consultar el endpoint de servicios
  const endpoint = process.env.SERVICIOS_ENDPOINT;
  const resp = await fetch(endpoint);
  const data = await resp.json();

  const serviciosArray = Array.isArray(data) ? data : [];
  const serviciosTexto = serviciosArray
    .map(s => `Nombre: ${s.nombre}, Descripción: ${s.descripcion}`)
    .join('\n');
  
  // Extrae solo los nombres para el enum
  const nombresServicios = serviciosArray.map(s => s.nombre);
  console.log('Servicios disponibles para el enum:', nombresServicios);

  // Ya no necesitas instrucciones tan repetitivas en el prompt sobre los nombres,
  // porque el enum se encargará de ello. Puedes simplificarlo.
  const promptConServicios = `${systemPrompt}

Servicios disponibles:
${serviciosTexto}

Analiza la solicitud del usuario y utiliza la herramienta 'registrarSolicitud' si corresponde a uno de los servicios. Si el problema no corresponde a ninguno, responde amablemente que no puedes ayudar con esa solicitud.`;

  // 2. Crea el modelo dinámicamente con la lista de servicios
  const model = crearModeloConServicios(nombresServicios);

  // 3. El resto del código funciona exactamente igual
  const chat = model.startChat({
    // Nota: El systemMessage ya no es soportado en `startChat` en algunas versiones.
    // Es mejor pasarlo como el primer mensaje del historial si da problemas.
    // Por ahora, lo dejamos como en tu código original.
    // Si falla, el enfoque sería:
    // history: [{ role: "user", parts: [{ text: promptConServicios }] }, { role: "model", parts: [{ text: "Entendido." }] }]
    // y luego enviar el mensaje del usuario.
  });

  // Para asegurar que el systemPrompt se use correctamente, lo incluimos en la primera interacción.
  const resultado = await chat.sendMessage(`${promptConServicios}\n\nUsuario: "${mensaje}"`);

  const respuesta = await resultado.response;
  const contenido = respuesta.candidates?.[0]?.content;
  const funcionLlamada = encontrarFuncion(contenido.parts);

  if (!funcionLlamada) {
    // Si el modelo responde que no puede ayudar, esa respuesta estará aquí.
    return { respuestaLibre: respuesta.text() };
  }

  switch (funcionLlamada.name) {
    case 'registrarSolicitud': {
      const solicitud = registrarSolicitudUseCase(funcionLlamada.args);

      // Construye el payload para el endpoint externo
      const payload = {
        id_usuario: idUsuario,
        descripcion: solicitud.descripcion_problema,
        especialidad: solicitud.servicio,
        ubicacion
      };

      const endpointExterno = process.env.ENDPOINT_REGISTRO_SOLICITUD;
      let respuestaExterna;
      try {
        const resp = await fetch(endpointExterno, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        respuestaExterna = await resp.json();
      } catch (error) {
        return { error: 'No se pudo registrar la solicitud en el sistema externo.', detalle: error.message };
      }

      return respuestaExterna; // <-- ¡ESTO ES CLAVE!
    }

    case 'banearUsuario':
      const ban = banearUsuarioUseCase(funcionLlamada.args);
      return {
        tipo: 'baneo',
        baneado: ban.baneado,
        motivo: ban.motivo,
        mensaje: "Usuario baneado por comportamiento ofensivo/agresivo.",
      };

    default:
      return { respuestaLibre: respuesta.text() };
  }
}