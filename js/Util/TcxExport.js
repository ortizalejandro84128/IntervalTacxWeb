
class TcxExport {
    /**
     * Genera un archivo TCX optimizado para Strava (Indoor/Virtual).
     * @param {Array} data - Array de objetos con {timeTick, hrValue, wattsCell, cadenceCell, speedCell}
     * @param {string} startTimeISO - ISOString del inicio de la actividad (this.fechaIni)
     */
    static jsonToTcxStrava(data, startTimeISO) {
        if (!data || data.length === 0) return "";

        const startTime = new Date(startTimeISO);
        
        // 1. Cálculos iniciales para el encabezado del Lap
        const totalDistance = this._calculateTotalDistance(data);
        const totalSeconds = this._calculateTotalSeconds(data);

        let tcx = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase 
  xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" 
  xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">
  <Activities>
    <Activity Sport="Biking">
      <Id>${startTimeISO}</Id>
      <Lap StartTime="${startTimeISO}">
        <TotalTimeSeconds>${totalSeconds}</TotalTimeSeconds>
        <DistanceMeters>${totalDistance.toFixed(2)}</DistanceMeters>
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>`;

        // 2. Generación de Trackpoints
        let accumulatedDistance = 0;

        data.forEach((point, index) => {
            // Usamos directamente el timeTick generado cada segundo
            const pointTime = point.timeTick; 
            
            const hr = parseInt(point.hrValue) || 0;
            const watts = parseInt(point.wattsCell) || 0;
            const cadence = parseInt(point.cadenceCell) || 0;
            const speedKmh = parseFloat(point.speedCell) || 0;
            const speedMs = speedKmh / 3.6;

            // Cálculo de distancia acumulada basado en el delta de tiempo real entre ticks
            if (index > 0) {
                const t1 = new Date(data[index - 1].timeTick).getTime();
                const t2 = new Date(point.timeTick).getTime();
                const dt = (t2 - t1) / 1000; // Debería ser 1 siempre con tu nueva lógica

                if (dt > 0) {
                    accumulatedDistance += (speedMs * dt);
                }
            }

            tcx += `
          <Trackpoint>
            <Time>${pointTime}</Time>
            <DistanceMeters>${accumulatedDistance.toFixed(2)}</DistanceMeters>
            <HeartRateBpm>
              <Value>${hr}</Value>
            </HeartRateBpm>
            <Cadence>${cadence}</Cadence>
            <Extensions>
              <TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
                <Watts>${watts}</Watts>
                <Speed>${speedMs.toFixed(3)}</Speed>
              </TPX>
            </Extensions>
          </Trackpoint>`;
        });

        // 3. Cierre con metadatos específicos para Indoor/Virtual
        tcx += `
        </Track>
      </Lap>
      <Notes>VirtualRide</Notes>
      <Creator xsi:type="Device_t">
        <Name>Virtual Trainer App</Name>
        <UnitId>0000000000</UnitId>
        <ProductID>22</ProductID>
        <Version>
          <VersionMajor>1</VersionMajor>
          <VersionMinor>0</VersionMinor>
        </Version>
      </Creator>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;

        return tcx;
    }

    /**
     * Calcula la distancia total recorriendo todo el set de datos
     */
    static _calculateTotalDistance(data) {
        let total = 0;
        for (let i = 1; i < data.length; i++) {
            const speedMs = parseFloat(data[i].speedCell) / 3.6;
            const t1 = new Date(data[i - 1].timeTick).getTime();
            const t2 = new Date(data[i].timeTick).getTime();
            const dt = (t2 - t1) / 1000;
            if (dt > 0) total += (speedMs * dt);
        }
        return total;
    }

    /**
     * Calcula la duración total en segundos
     */
    static _calculateTotalSeconds(data) {
        if (data.length < 2) return 0;
        const t1 = new Date(data[0].timeTick).getTime();
        const t2 = new Date(data[data.length - 1].timeTick).getTime();
        return Math.max(0, Math.floor((t2 - t1) / 1000));
    }
}