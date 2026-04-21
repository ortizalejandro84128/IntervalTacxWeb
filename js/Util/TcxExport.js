class TcxExport {

    static jsonToTcxStrava(data, startTime = new Date()) {
    let accumulatedDistance = 0;
    let tcx = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">
  <Activities>
    <Activity Sport="Cycling">
      <Id>${startTime.toISOString()}</Id>
      <Lap StartTime="${startTime.toISOString()}">
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>`;

    data.forEach((point, index) => {
        // 1. Tiempo
        const [hh, mm, ss] = point.timeCell.split(':');
        const offsetMs = (parseInt(hh) * 3600 + parseInt(mm) * 60 + parseFloat(ss)) * 1000;
        const pointTime = new Date(startTime.getTime() + offsetMs).toISOString();

        // 2. Limpieza de datos (Convertir "27" o "120 W" a números puros)
        const hr = parseInt(point.hrValue);
        const watts = parseInt(point.wattsCell);
        const cadence = parseInt(point.cadenceCell);
        const speedKmh = parseFloat(point.speedCell);

        // 3. Cálculo de distancia (si el intervalo es de ~1 seg)
        // Distancia = velocidad (m/s) * tiempo (1s)
        if (index > 0) {
            accumulatedDistance += (speedKmh / 3.6); 
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
                <Speed>${(speedKmh / 3.6).toFixed(2)}</Speed>
              </TPX>
            </Extensions>
          </Trackpoint>`;
    });

    tcx += `
        </Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;

    return tcx;
}
}