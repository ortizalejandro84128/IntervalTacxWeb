class TelemetriaStats {
    static generarResumen(data) {
        if (!data || data.length === 0) return null;

        const ftp = parseInt(localStorage.getItem("user_ftp")) || 180;
        const peso = parseInt(localStorage.getItem("user_weight")) || 70; // Asumiendo que guardas el peso
        
        let sumaWatts = 0;
        let maxWatts = 0;
        let sumaHR = 0;
        let maxHR = 0;
        let sumaCad = 0;
        let ticksConPedaleo = 0;
        
        // Objeto para contabilizar tiempo (segundos) en cada zona de potencia
        const tiempoEnZonas = { Z1: 0, Z2: 0, Z3: 0, Z4: 0, Z5: 0, Z6: 0 };

        data.forEach(p => {
            const w = parseInt(p.wattsCell) || 0;
            const hr = parseInt(p.hrValue) || 0;
            const cad = parseInt(p.cadenceCell) || 0;

            // Totales y Máximos
            sumaWatts += w;
            if (w > maxWatts) maxWatts = w;
            
            sumaHR += hr;
            if (hr > maxHR) maxHR = hr;

            if (cad > 0) {
                sumaCad += cad;
                ticksConPedaleo++;
            }

            // Clasificación por Zonas (Basado en tu lógica de porcentajes de FTP)
            const pct = (w / ftp) * 100;
            if (pct < 55) tiempoEnZonas.Z1++;
            else if (pct < 75) tiempoEnZonas.Z2++;
            else if (pct < 90) tiempoEnZonas.Z3++;
            else if (pct < 105) tiempoEnZonas.Z4++;
            else if (pct < 120) tiempoEnZonas.Z5++;
            else tiempoEnZonas.Z6++;
        });

        const totalSegundos = this._calculateSeconds(data);
        const potenciaMedia = Math.round(sumaWatts / data.length);

        return {
            // Básicos
            duracionReal: Math.floor(totalSegundos / 60),
            distanciaTotal: (this._calculateDist(data) / 1000).toFixed(2),
            
            // Potencia Enriquecida
            potenciaMedia: potenciaMedia,
            potenciaMax: maxWatts,
            vatiosKilo: (potenciaMedia / peso).toFixed(2), 
            tssReal: this._calcularTSS(potenciaMedia, totalSegundos, ftp),
            
            // Cardio y Cadencia
            hrMedio: Math.round(sumaHR / data.length),
            hrMax: maxHR,
            cadenciaMedia: ticksConPedaleo > 0 ? Math.round(sumaCad / ticksConPedaleo) : 0,
            
            // Análisis de Distribución
            distribucionZonas: tiempoEnZonas,
            eficienciaPedaleo: ((ticksConPedaleo / data.length) * 100).toFixed(1) // % de tiempo pedaleando
        };
    }

    static _calculateSeconds(data) {
        const t1 = new Date(data[0].timeTick).getTime();
        const t2 = new Date(data[data.length - 1].timeTick).getTime();
        return Math.floor((t2 - t1) / 1000);
    }

    static _calculateDist(data) {
        let d = 0;
        for (let i = 1; i < data.length; i++) {
            const ms = (parseFloat(data[i].speedCell) || 0) / 3.6;
            const dt = (new Date(data[i].timeTick) - new Date(data[i - 1].timeTick)) / 1000;
            d += (ms * dt);
        }
        return d;
    }

    static _calcularTSS(potenciaMedia, segundos, ftp) {
        // Fórmula simplificada: TSS = [(s * W * IF) / (FTP * 3600)] * 100
        // Donde IF (Factor de Intensidad) es PotenciaMedia / FTP
        const intensidad = potenciaMedia / ftp;
        const tss = ((segundos * potenciaMedia * intensidad) / (ftp * 3600)) * 100;
        return Math.round(tss) || 0;
    }
}