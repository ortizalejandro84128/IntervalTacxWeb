class WeekendGenerator {
    constructor() {
        this.LIMIT_TARGET = 90; // 1.5 horas (90 min)
        this.Z2_RECOVERY_LIMIT = 60; // 1 hora para descarga
    }

    generate(week) {
        const isDescarga = week % 3 === 0;
        let segments = [];
        let dominantZone = "";
        let workoutName = "";

        if (isDescarga) {
            // --- SEMANAS 3 Y 6: ZONA 2 (1 HORA) ---
            dominantZone = "Resistencia (Z2)";
            workoutName = `Sábado S${week} - Fondo Z2 Recuperación`;
            segments = [
                [10, 50, 60, "Calentamiento Progresivo"],
                [40, 65, 65, "Rodaje Estable Z2"],
                [10, 60, 50, "Vuelta a la calma"]
            ];
        } else {
            // Alternamos: S1 y S4 Sweet Spot | S2 y S5 Under-Over
            // Usamos un booleano para determinar el tipo
            const isSweetSpot = (week === 1 || week === 4);

            if (isSweetSpot) {
                // --- SEMANAS 1 Y 4: SWEET SPOT (2x20 o 2x25) ---
                dominantZone = "Sweet Spot";
                const blockTime = (week === 1) ? 20 : 25; 
                workoutName = `Sábado S${week} - Sweet Spot Largo (2x${blockTime}min)`;
                
                segments = [
                    [10, 50, 50, "Warm up"],
                    [10, 65, 65, "Prep"],
                    [blockTime, 90, 90, "SS Bloque 1"],
                    [5, 60, 60, "Recuperación"],
                    [blockTime, 90, 90, "SS Bloque 2"],
                    [15, 75, 75, "Z2 Post-esfuerzo"],
                    [this.LIMIT_TARGET - (20 + 20 + blockTime * 2 + 5), 65, 55, "Enfriamiento"]
                ];
            } else {
                // --- SEMANAS 2 Y 5: UNDER-OVER (3 bloques de 12 min) ---
                dominantZone = "Under-Over";
                workoutName = `Sábado S${week} - Under-Overs (3x12min)`;
                
                const intensityOver = (week === 2) ? 105 : 107;
                const intensityUnder = 90;

                segments = [
                    [4, 50, 50, "Warm up"],
                    [4, 60, 60, "Prep 1"],
                    [4, 70, 70, "Prep 2"],
                    [4, 85, 85, "Activación"],
                    [4, 50, 50, "Pausa"]
                ];

                // Generamos 3 bloques de 12 min (cada bloque son 3 repeticiones de 2/2)
                for (let i = 1; i <= 3; i++) {
                    // 3 repeticiones de 2' Over / 2' Under = 12 min por bloque
                    for (let r = 1; r <= 3; r++) {
                        segments.push([2, intensityOver, intensityOver, `Bloque ${i} - Over`]);
                        segments.push([2, intensityUnder, intensityUnder, `Bloque ${i} - Under`]);
                    }
                    if (i < 3) segments.push([3, 60, 60, "Recuperación Inter-bloque"]);
                }

                // Relleno final hasta los 90 min
                const currentTotal = segments.reduce((acc, s) => acc + s[0], 0);
                const remaining = this.LIMIT_TARGET - currentTotal;
                
                if (remaining > 15) {
                    segments.push([Math.floor(remaining * 0.6), 75, 75, "Resistencia Final"]);
                    segments.push([Math.ceil(remaining * 0.4), 60, 50, "Enfriamiento"]);
                } else {
                    segments.push([remaining, 60, 50, "Enfriamiento"]);
                }
            }
        }

        const totalDuration = segments.reduce((acc, s) => acc + s[0], 0);

        return {
            workoutName: workoutName,
            dominantZone: dominantZone,
            totalDuration: totalDuration,
            intensity: isDescarga ? 65 : (week % 3 === 1 ? 90 : 100), // Intensidad representativa
            segments: segments
        };
    }
}