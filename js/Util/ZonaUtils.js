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


static calcularDuracionTotal(objetoEntrenamiento) {
  // Usamos reduce para sumar el primer elemento [0] de cada segmento
  return objetoEntrenamiento.segments.reduce((total, segmento) => {
    return total + (segmento[0] || 0);
  }, 0);
}






static obtenerDatosTablaTIZ(telemetriaRaw, ftp = 180) {
    const conteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let puntosTotales = 0;

    telemetriaRaw.forEach(p => {
        const w = parseInt(p.wattsCell) || 0;
        const zona = this.calcularZona((w / ftp) * 100);
        conteo[zona]++;
        puntosTotales++;
    });

    const nombres = ["", "Recuperación", "Resistencia", "Tempo", "Umbral", "VO2 Max", "Anaeróbico"];
    const resultados = [];

    for (let i = 1; i <= 6; i++) {
        if (conteo[i] > 0) {
            const pct = (conteo[i] / puntosTotales) * 100;
            const min = Math.floor(conteo[i] / 60);
            const seg = conteo[i] % 60;
            
            resultados.push({
                zona: `Z${i}`,
                nombre: nombres[i],
                porcentaje: `${Math.round(pct)}%`,
                tiempo: `${min}:${seg.toString().padStart(2, '0')}`
            });
        }
    }
    return resultados;
}
}
