import express from 'express';
import solicitudRoutes from './src/interfaces/routes/solicitudRoutes.js';
import { PORT } from './src/config/index.js';
import { cargarPrompt } from './src/config/promptLoader.js';

const app = express();
await cargarPrompt(); // Esto se ejecuta una vez y queda en memoria
app.use(express.json());
app.use('/api', solicitudRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
