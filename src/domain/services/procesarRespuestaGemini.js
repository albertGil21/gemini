export function encontrarFuncion(parts) {
  if (!parts || !Array.isArray(parts)) return null;
  return parts.find(p => p.functionCall)?.functionCall || null;
}
