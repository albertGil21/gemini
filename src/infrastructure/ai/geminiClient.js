import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Crea y configura una instancia del modelo Gemini con herramientas dinámicas.
 * @param {string[]} nombresDeServicios - Un array con los nombres exactos de los servicios permitidos.
 * @returns La instancia del modelo configurado.
 */
export function crearModeloConServicios(nombresDeServicios = []) {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [
      {
        functionDeclarations: [
          {
            name: 'registrarSolicitud',
            description: `Extrae la información esencial para registrar una solicitud de servicio técnico. Devuelve únicamente el tipo de servicio y una breve descripción del problema.`,
            parameters: {
              type: 'object',
              properties: {
                servicio: {
                  type: 'string',
                  description: 'El tipo de servicio técnico requerido.',
                  // ¡AQUÍ ESTÁ LA MAGIA!
                  // El enum restringe al modelo a ELEGIR UNO Y SOLO UNO de estos valores.
                  enum: nombresDeServicios,
                },
                descripcion_problema: {
                  type: 'string',
                  description: 'Descripción breve y clara del problema reportado por el usuario.',
                },
              },
              required: ['servicio', 'descripcion_problema'],
            },
          },
          {
            name: 'banearUsuario',
            description: 'Detecta si el usuario envía mensajes ofensivos, agresivos o insultos y debe ser baneado.',
            parameters: {
              type: 'object',
              properties: {
                motivo: { type: 'string', description: 'Razón por la cual el usuario debe ser baneado.' },
              },
              required: ['motivo'],
            },
          },
        ],
      },
    ],
  });
}