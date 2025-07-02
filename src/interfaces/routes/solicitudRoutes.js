import express from 'express';
import { manejarSolicitud } from '../controllers/solicitudController.js';

const router = express.Router();

router.post('/solicitud', async (req, res) => {
  try {
    const { mensaje, idUsuario, ubicacion } = req.body;
    if (!mensaje) return res.status(400).json({ error: 'El campo mensaje es obligatorio.' });
    if (!idUsuario) return res.status(400).json({ error: 'El campo idUsuario es obligatorio.' });
    if (!ubicacion || typeof ubicacion.lat !== 'number' || typeof ubicacion.long !== 'number') {
      return res.status(400).json({ error: 'El campo ubicacion (lat y long) es obligatorio y debe ser numérico.' });
    }

    const resultado = await manejarSolicitud(mensaje, idUsuario, ubicacion);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

export default router;
