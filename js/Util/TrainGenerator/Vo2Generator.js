class Vo2Generator {
    constructor() {
        this.WARMUP = 12;
        this.PREP = 2;
        this.COOLDOWN_BASE = 5;
        this.LIMIT_MAX = 45;
        this.BASE_INTENSITY = 105;
    }

    generate(week) {
        const isDescarga = week % 3 === 0;
        let tempSegments = [];
        let intensity = this.BASE_INTENSITY;
        let typeClass = "";

        // Lógica de Semanas
        if (week === 1 || week === 2) {
            const workDur = (week === 1) ? 3 : 4;
            const extraRec = (week === 2) ? 1 : 0;
            intensity = this.BASE_INTENSITY + (week - 1);
            tempSegments = this._buildIntervals(4, workDur, 3, intensity, extraRec);
            typeClass = "border-largo";
        } 
        else if (week === 4 || week === 5) {
            const loadIndex = week - Math.floor(week / 3);
            intensity = this.BASE_INTENSITY + (loadIndex - 1);
            const extraRec = (week === 5) ? 1 : 0;
            tempSegments = this._buildIntervals((week === 4 ? 6 : 8), 1, 2, intensity, extraRec);
            typeClass = "border-corto";
        } 
        else {
            const prevW = week - 1;
            intensity = this.BASE_INTENSITY + (prevW - Math.floor(prevW / 3) - 1);
            const isShort = (week === 6);
            tempSegments = this._buildIntervals((isShort ? 3 : 2), (isShort ? 1 : 3), (isShort ? 2 : 3), intensity, 0);
            typeClass = "border-descarga";
        }

        const finalSegments = this._finalizeWorkout(tempSegments);
        
        // CÁLCULO CRÍTICO DE DURACIÓN
        const totalDuration = finalSegments.reduce((acc, s) => acc + s[0], 0);

        const numBlocks = tempSegments.filter(s => s[3].includes("Bloque")).length;
        const blockLen = tempSegments[0][0];

        return {
            workoutName: `VO2 Max - S${week} (${numBlocks}x${blockLen}min @${intensity}%)`,
            dominantZone: "VO2 Max",
            typeClass,
            totalDuration, // Aquí se envía al render
            intensity,
            segments: finalSegments
        };
    }

    _buildIntervals(count, workDur, recDur, intensity, extraRecMinute) {
        let blocks = [];
        const midpoint = Math.floor(count / 2);
        for (let i = 0; i < count; i++) {
            blocks.push([workDur, intensity, intensity, `Bloque VO2 ${i+1}/${count}`]);
            if (i < count - 1) {
                let currentRec = (i + 1 === midpoint) ? recDur + extraRecMinute : recDur;
                let label = (i + 1 === midpoint && extraRecMinute > 0) ? "Recuperación Extra" : "Recuperación";
                blocks.push([currentRec, 50, 50, label]);
            }
        }
        return blocks;
    }

    _finalizeWorkout(intervalSegments) {
        const header = [[this.WARMUP, 50, 80, "Calentamiento"], [this.PREP, 50, 50, "Preparación"]];
        const subtotal = header.reduce((a, b) => a + b[0], 0) + intervalSegments.reduce((a, b) => a + b[0], 0);
        const target = (subtotal + this.COOLDOWN_BASE > 40) ? 45 : 40;
        let finalCooldown = Math.max(2, target - subtotal);
        if (subtotal + finalCooldown > this.LIMIT_MAX) finalCooldown = Math.max(2, this.LIMIT_MAX - subtotal);
        return [...header, ...intervalSegments, [finalCooldown, 65, 50, "Enfriamiento"]];
    }
}
