import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let systemPrompt = '';

async function cargarPrompt() {
  if (systemPrompt) return systemPrompt; // 👈 evita recargar si ya está
  try {
    const promptPath = path.join(__dirname, 'prompt.txt');
    systemPrompt = await fs.readFile(promptPath, 'utf8');
    console.log('✅ Prompt cargado en memoria.');
  } catch (error) {
    console.error('❌ Error cargando prompt:', error);
    systemPrompt = 'Eres un asistente que ayuda a registrar solicitudes de servicios técnicos.';
  }
  return systemPrompt;
}

export { cargarPrompt, systemPrompt };
