export function banearUsuarioUseCase({ motivo }) {
  // Aquí se podría registrar en base de datos o sistema de baneo, por ahora solo devuelve el motivo
  return { baneado: true, motivo };
}
