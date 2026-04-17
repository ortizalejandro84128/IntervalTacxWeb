// ZonaUtils.js
class ZonaUtils {
  static calcularZona(potenciaRelativa) {
    if (potenciaRelativa < 60) return 1; // Recuperación
    if (potenciaRelativa < 75) return 2; // Resistencia
    if (potenciaRelativa < 90) return 3; // Tempo
    if (potenciaRelativa < 105) return 4; // Umbral
    if (potenciaRelativa < 120) return 5; // VO2Max
    return 6; // Anaeróbico
  }

static getStrongColor(zona) {
  switch (zona) {
    case 1: return 'var(--bs-primary)';   // azul Bootstrap
    case 2: return 'var(--bs-success)';   // verde Bootstrap
    case 3: return 'var(--bs-warning)';   // amarillo Bootstrap
    case 4: return 'var(--bs-orange, #fd7e14)'; // naranja (no oficial, fallback)
    default: return 'var(--bs-danger)';   // rojo Bootstrap
  }
}

static getMutedColor(zona) {
  switch (zona) {
    case 1: return 'var(--bs-primary-bg-subtle)';   // azul pastel Bootstrap
    case 2: return 'var(--bs-success-bg-subtle)';   // verde pastel Bootstrap
    case 3: return 'var(--bs-warning-bg-subtle)';   // amarillo pastel Bootstrap
    case 4: return 'var(--bs-orange-bg-subtle, #ffe5d0)'; // naranja pastel (custom)
    default: return 'var(--bs-danger-bg-subtle)';   // rojo pastel Bootstrap
  }
}



}
