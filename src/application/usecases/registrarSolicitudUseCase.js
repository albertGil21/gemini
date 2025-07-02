import { Solicitud } from '../../domain/entities/solicitud.js';

export function registrarSolicitudUseCase({ servicio, descripcion_problema }) {
  // Aquí puedes añadir validaciones, sanitización o lógica adicional
  return new Solicitud({ servicio, descripcion_problema });
}
