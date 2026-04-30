class Vo2Generator {
  constructor( nivel = 8, semanas = 6) {
    this.semanas = semanas;
    this.baseIntensidad = 105;
    this.baseZona = nivel; 
    this.baseIntensidadDescarga = 100;
    this.pasoSemanal = 2;
    this.factorDescarga = 0.6;
  }

  generate(semana, nivel) {
    this.baseZona = nivel; 

    const semanasDescargaPasadas = Math.floor((semana - 1) / 3);
    const semanasCargaEfectivas = (semana - 1) - semanasDescargaPasadas;
    const esDescarga = semana % 3 === 0;

    let intensidad = esDescarga 
      ? this.baseIntensidadDescarga 
      : this.baseIntensidad + (semanasCargaEfectivas * this.pasoSemanal);
    
    // Seguridad: Límite superior fisiológico
    intensidad = Math.min(intensidad, 118);

    let tiempoZona = esDescarga
      ? Math.round((this.baseZona + (semanasCargaEfectivas * 2)) * this.factorDescarga)
      : this.baseZona + (semanasCargaEfectivas * 2);

    tiempoZona = Math.max(1, tiempoZona);
    // Ajuste de bloques: Menos tiempo = bloques más cortos
    let numBloques = tiempoZona > 18 ? 6 : (tiempoZona > 12 ? 5 : 4);
    numBloques = Math.max(1, numBloques); 
    
    const minBase = Math.floor(tiempoZona / numBloques);
    let extras = tiempoZona % numBloques; 
    let duraciones = Array(numBloques).fill(minBase);
    
    // Distribución (Tu lógica actual es sólida para evitar NaNs)
    if (extras > 0) {
      if (numBloques % 2 === 0) {
        for (let i = 0; i < numBloques && extras > 0; i += 2) {
          duraciones[i]++;
          extras--;
        }
      } else {
        const centro = Math.floor(numBloques / 2);
        duraciones[centro]++;
        extras--;
        let offset = 1;
        while (extras > 0 && offset <= centro) {
          if (centro - offset >= 0 && extras > 0) { duraciones[centro - offset]++; extras--; }
          if (centro + offset < numBloques && extras > 0) { duraciones[centro + offset]++; extras--; }
          offset++;
        }
      }
    }

    const segments = [
      [10, 50, 75, "Calentamiento"],
      [3, 50, 50, "Activación"]
    ];

    duraciones.forEach((mins, i) => {
      const d = mins || 1; 
      segments.push([d, intensidad, intensidad, `Bloque VO2 ${i + 1}/${numBloques}`]);
      if (i < numBloques - 1) {
        // En VO2 Max, la recuperación es 1:1 para calidad
        segments.push([d, 45, 45, "Recuperación"]);
      }
    });

    segments.push([10, 60, 45, "Enfriamiento"]);

    const resumen = {};
    duraciones.forEach(d => resumen[d] = (resumen[d] || 0) + 1);
    const partesNombre = Object.entries(resumen)
      .sort((a, b) => b[0] - a[0])
      .map(([dur, cant]) => `${cant}x${dur}min`);

    // Añadir prefijo de descarga si corresponde
    const prefijo = esDescarga ? "DESC ARGA: " : "";

    return {
      workoutName: `${prefijo}VO2 Max - S${semana} (${partesNombre.join(" + ")} @${intensidad}%)`,
      dominantZone: "VO2 Max",
      totalDuration: segments.reduce((acc, seg) => acc + seg[0], 0),
      intensity: intensidad,
      segments
    };
  }
}