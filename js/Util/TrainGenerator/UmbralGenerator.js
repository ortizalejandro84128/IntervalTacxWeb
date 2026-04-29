class UmbralGenerator {
  /*  constructor() {
        this.WARMUP = 12;
        this.PREP = 2;
        this.COOLDOWN_BASE = 5;
        this.LIMIT_MAX = 45;
        this.BASE_INTENSITY = 95;
    }

    generate(week) {
        // 1. Definir si es semana de descarga (cada tercera semana: 3 y 6)
        const isDescarga = week % 3 === 0;

        // 2. Determinar duración e intensidad base (Carga vs Descarga)
        let workDuration, intensity;

        if (!isDescarga) {
            // Semanas 1, 2, 4, 5 (Carga Progresiva)
            // Mapeo: S1:9min, S2:10min, S4:11min, S5:12min
            const loadIndex = week - Math.floor(week / 3); 
            workDuration = 8 + loadIndex;
            intensity = this.BASE_INTENSITY + (loadIndex - 1);
        } else {
            // Semanas 3 y 6 (Descarga: 60% del tiempo de la carga anterior)
            const prevLoadIndex = (week - 1) - Math.floor((week - 1) / 3);
            const prevWorkDuration = 8 + prevLoadIndex;
            workDuration = Math.round(prevWorkDuration * 0.6);
            intensity = this.BASE_INTENSITY + (prevLoadIndex - 1);
        }

        // 3. Recuperación Ratio 4:1 (Mínimo 2 min)
        const recovery = Math.max(2, Math.round(workDuration / 4));

        // 4. Ajuste de tiempos fijos y relleno (40 o 45 min)
        const tiempoSinEnfriar = this.WARMUP + this.PREP + (workDuration * 2) + recovery;
        const targetTotal = (tiempoSinEnfriar + this.COOLDOWN_BASE > 40) ? 45 : 40;
        const finalCooldown = targetTotal - tiempoSinEnfriar;

        const formato = `2x${workDuration}min @${intensity}%`;
        const tipo = isDescarga ? "Descarga" : "Carga";

        const finalSegments= [
                [this.WARMUP, 50, 80, "Calentamiento"],
                [this.PREP, 50, 50, "Preparación"],
                [workDuration, intensity, intensity, "Bloque Umbral 1/2"],
                [recovery, 50, 50, "Recuperación Activa"],
                [workDuration, intensity, intensity, "Bloque Umbral 2/2"],
                [finalCooldown, 65, 50, "Enfriamiento"]
            ]
        const totalDuration = finalSegments.reduce((acc, s) => acc + s[0], 0);

        return {
            workoutName: `Umbral - S${week} (${formato})`,
            dominantZone: "Umbral",
            totalDuration: totalDuration, // Aquí se envía al render
            intensity:intensity,
            segments:finalSegments
        };
    }*/

  constructor(semanas = 6, nivel=12) {
    this.semanas = semanas;
    this.baseIntensidad = 90;
    this.baseZona = nivel; 
    this.baseIntensidadDescarga = 85;
    this.pasoSemanal = 2;
	this.factorDescarga=0.7;
  }

  generate(semana) {
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
      segments,
	  tss: TSSCalculator.calcularDesdeSegmentos(segments)
    };
  }

  generarTabla() {
    return Array.from({ length: this.semanas }, (_, i) => this.generarSemana(i + 1));
  }


}