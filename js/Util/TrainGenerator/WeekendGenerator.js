class WeekendGenerator {
    constructor(nivel=14) {
        this.nivel = nivel
        this.tiempoTrabajoBase = this.nivel * 2; 
        this.PROGRESION = 1.15; // +15% conservador
    }

    generate(week, nivel) {
        this.nivel = nivel;
        this.tiempoTrabajoBase = this.nivel * 2; 
        const isDescarga = week % 3 === 0;
        
        if (isDescarga) {
            return this._generarZona2(week);
        }

        if (week === 1 || week === 4) {
            return this._generarSweetSpot(week);
        } else {
            return this._generarUnderOver(week);
        }
    }

    _generarSweetSpot(week) {
        let totalTrabajo = this.tiempoTrabajoBase;
        if (week === 4) totalTrabajo = Math.round(totalTrabajo * this.PROGRESION);

        const blockTime = Math.floor(totalTrabajo / 2);
        
        const segments = [
            [10, 50, 50, "Calentamiento"],
            [10, 65, 65, "Activación Aeróbica"],
            [blockTime, 90, 90, `SS Bloque 1 (${blockTime}m)`],
            [5, 60, 60, "Recuperación"],
            [blockTime, 90, 90, `SS Bloque 2 (${blockTime}m)`],
            [15, 75, 75, "Z2 Post-esfuerzo"],
            [5, 65, 55, "Enfriamiento"]
        ];

        // Intensidad fija para Sweet Spot: 90
        return this._formatearResultado(`Sábado S${week} - Sweet Spot 2x${blockTime}`, "Sweet Spot", segments, 90);
    }

// Método específico para Under-Over (Semanas 2 y 5)
    _generarUnderOver(week) {
    const isProgression = (week === 5);
    
    // Matriz extendida: [ [Reps_B1, Reps_B2]_Semana2, [Reps_B1, Reps_B2]_Semana5 ]
    const configuracionUO = {
        8:  [[3, 3], [3, 4]], 
        10: [[3, 3], [3, 4]], 
        12: [[3, 4], [4, 5]], 
        14: [[3, 4], [4, 4]], // Ejemplo Nivel 14: S2(4+4=24min) / S5(5+5=30min)
        16: [[5, 5], [6, 5]], 
        18: [[6, 6], [7, 6]], 
        20: [[7, 7], [8, 8]]  
    };

    const [configS2, configS5] = configuracionUO[this.nivel];
    const repsPorBloque = isProgression ? configS5 : configS2;

    // Calculamos el tiempo total de trabajo efectivo (cada rep = 3 min)
    const totalReps = repsPorBloque.reduce((acc, r) => acc + r, 0);
    //const totalTrabajoUO = totalReps * 3; 

    // Bloque Sweet Spot fijo a la mitad del trabajo U/O
    const tiempoSSFinal = Math.ceil( this.tiempoTrabajoBase / 2*1.2);

    return this._formatearSesionMixta(week, repsPorBloque, tiempoSSFinal);
}

_formatearSesionMixta(week, repsPorBloque, tiempoSS) {
    const segments = [
        [10, 50, 50, "Calentamiento"],
        [5, 70, 85, "Activación"],
        [4, 50, 50, "Pausa"]
    ];

    // 1. BLOQUES UNDER-OVER PARAMETRIZADOS
    repsPorBloque.forEach((numReps, index) => {
        const bloqueNum = index + 1;
        for (let r = 1; r <= numReps; r++) {
            segments.push([1, 105, 105, `B${bloqueNum} - Over 1'`]);
            segments.push([2, 95, 95, `B${bloqueNum} - Under 2'`]);
        }
        
        // Pausa de recuperación entre bloques (y antes del SS)
        segments.push([4, 60, 60, "Recuperación"]);
    });

    // 2. BLOQUE FINAL DE SWEET SPOT
    segments.push([tiempoSS, 85, 85, `Final Sweet Spot (${tiempoSS} min)`]);

    // 3. VUELTA A LA CALMA
    segments.push([8, 70, 70, "Rodaje Final"], [5, 60, 50, "Enfriamiento"]);

    return {
        workoutName: `Sábado S${week} - Mixto U/O + SS (Nivel ${this.nivel})`,
        intensity: 95,
        totalDuration: segments.reduce((acc, s) => acc + s[0], 0),
        segments: segments
    };
}
    
    _generarZona2(week) {
        const duracionZ2 = 30+this.nivel;
        const segments = [
            [10, 50, 60, "Calentamiento Progresivo"],
            [duracionZ2, 65, 65, "Rodaje Estable Z2"],
            [10, 60, 50, "Vuelta a la calma"]
        ];

        // Intensidad fija para Z2: 65
        return this._formatearResultado(`Sábado S${week} - Recuperación Activa`, "Resistencia (Z2)", segments, 65);
    }

    _formatearResultado(name, zone, segments, intensity) {
        return {
            workoutName: name,
            dominantZone: zone,
            totalDuration: segments.reduce((acc, s) => acc + s[0], 0),
            intensity: intensity, // <--- Nueva propiedad añadida
            segments: segments,
            nivelFactor: this.nivel
        };
    }
}