class UmbralGenerator {

  constructor(nivel=12,semanas = 6 ) {
    this.semanas = semanas;
    this.baseIntensidad = 90;
    this.baseZona = nivel; 
    this.baseIntensidadDescarga = 85;
    this.pasoSemanal = 2;
	this.factorDescarga=0.7;
  }

  generate(semana, nivel) {
    this.baseZona = nivel;

    const semanasDescargaPasadas = Math.floor((semana - 1) / 3);
    const semanasCargaEfectivas = (semana - 1) - semanasDescargaPasadas;
    const esDescarga = semana % 3 === 0;

    const intensidad = esDescarga 
      ? this.baseIntensidadDescarga 
      : this.baseIntensidad + (semanasCargaEfectivas * this.pasoSemanal);
    
    let tiempoZona = esDescarga
      ? Math.round((this.baseZona + (semanasCargaEfectivas * 2)) * this.factorDescarga)
      : this.baseZona + (semanasCargaEfectivas * 2);

    // Lógica de división de bloques
    let numBloques, minPorBloque, esAsimetrico = false;
    let b1 = 0, b2 = 0;

    if (tiempoZona % 3 === 0) {
      numBloques = 3;
      minPorBloque = tiempoZona / 3;
    } else if (tiempoZona % 2 === 0) {
      numBloques = 2;
      minPorBloque = tiempoZona / 2;
    } else {
      numBloques = 2;
      esAsimetrico = true;
      b1 = Math.floor(tiempoZona / 2);
      b2 = tiempoZona - b1;
    }

    const recMin = (esAsimetrico ? b2 : minPorBloque) > 10 ? 4 : 3;

    // Construcción de Segmentos
    const segments = [
      [12, 50, 75, "Calentamiento"],
      [2, 50, 50, "Preparación"]
    ];

    for (let i = 0; i < numBloques; i++) {
      const mins = esAsimetrico ? (i === 0 ? b1 : b2) : minPorBloque;
      segments.push([mins, intensidad, intensidad, `Bloque Umbral ${i + 1}/${numBloques}`]);
      
      // Añadir recuperación si no es el último bloque
      if (i < numBloques - 1) {
        segments.push([recMin, 50, 50, "Recuperación Activa"]);
      }
    }

    segments.push([8, 65, 50, "Enfriamiento"]);

    // Cálculo de duración total y nombre
    const totalDuration = segments.reduce((acc, seg) => acc + seg[0], 0);
    const workoutName = `Umbral - S${semana} (${numBloques}x${esAsimetrico ? b1+'+'+b2 : minPorBloque}min @${intensidad}%)`;

    return {
      workoutName,
      dominantZone: "Umbral",
      totalDuration,
      intensity: intensidad,
      segments
	  
    };
  }

  generarTabla() {
    return Array.from({ length: this.semanas }, (_, i) => this.generarSemana(i + 1));
  }


}