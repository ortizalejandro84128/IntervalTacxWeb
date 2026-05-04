class WeekendGenerator {
    constructor(nivel = 14) {
        this.nivel = nivel;
        this.tiempoTrabajoBase = this.nivel * 2;
        this.PROGRESION = 1.15; 
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

        return this._formatearResultado(`Sábado S${week} - Sweet Spot 2x${blockTime}`, "Sweet Spot", segments, 90);
    }

    _generarUnderOver(week) {
        const isProgression = (week === 5);
        
        // CORRECCIÓN: Si el nivel es impar, bajamos al nivel par anterior para buscar en la tabla
        // o usamos un valor por defecto si es menor a 8.
        const nivelBusqueda = this.nivel % 2 === 0 ? this.nivel : this.nivel - 1;
        
        const configuracionUO = {
            6:  [[2, 2], [2, 3]],
            8:  [[3, 3], [3, 4]], 
            10: [[3, 3], [3, 4]], 
            12: [[3, 4], [4, 5]], 
            14: [[3, 4], [4, 4]], 
            16: [[5, 5], [6, 5]], 
            18: [[6, 6], [7, 6]], 
            20: [[7, 7], [8, 8]]  
        };

        // Fallback: si el nivel es muy bajo o muy alto, evitar el undefined
        const config = configuracionUO[nivelBusqueda] || configuracionUO[8];
        const [configS2, configS5] = config;
        
        const repsPorBloque = isProgression ? configS5 : configS2;

        // El tiempo de SS final ahora escala mejor con niveles impares
        const tiempoSSFinal = Math.ceil((this.tiempoTrabajoBase / 2) * 1.2);

        return this._formatearSesionMixta(week, repsPorBloque, tiempoSSFinal);
    }

    _formatearSesionMixta(week, repsPorBloque, tiempoSS) {
        const segments = [
            [10, 50, 50, "Calentamiento"],
            [5, 70, 85, "Activación"],
            [4, 50, 50, "Pausa"]
        ];

        repsPorBloque.forEach((numReps, index) => {
            const bloqueNum = index + 1;
            for (let r = 1; r <= numReps; r++) {
                segments.push([1, 105, 105, `B${bloqueNum} - Over 1'`]);
                segments.push([2, 95, 95, `B${bloqueNum} - Under 2'`]);
            }
            segments.push([4, 60, 60, "Recuperación"]);
        });

        segments.push([tiempoSS, 85, 85, `Final Sweet Spot (${tiempoSS} min)`]);
        segments.push([8, 70, 70, "Rodaje Final"], [5, 60, 50, "Enfriamiento"]);

        return {
            workoutName: `Sábado S${week} - Mixto U/O + SS (Nivel ${this.nivel})`,
            intensity: 95,
            totalDuration: segments.reduce((acc, s) => acc + s[0], 0),
            segments: segments
        };
    }
    
    _generarZona2(week) {
        // Z2 ahora funciona perfectamente con impares
        const duracionZ2 = 30 + parseInt(this.nivel); 
        const segments = [
            [10, 50, 60, "Calentamiento Progresivo"],
            [duracionZ2, 65, 65, "Rodaje Estable Z2"],
            [10, 60, 50, "Vuelta a la calma"]
        ];

        return this._formatearResultado(`Sábado S${week} - Recuperación Activa`, "Resistencia (Z2)", segments, 65);
    }

    _formatearResultado(name, zone, segments, intensity) {
        return {
            workoutName: name,
            dominantZone: zone,
            totalDuration: segments.reduce((acc, s) => acc + s[0], 0),
            intensity: intensity,
            segments: segments,
            nivelFactor: this.nivel
        };
    }
}