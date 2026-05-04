class ResumenEntrenamientoModal extends DialogModal {
  constructor(mainApp, workoutData, telemetriaRaw) {
    super({
      id: "resumenEntrenamientoModal",
      width: 450,
      height: 720,
      titulo: "Resumen de la Sesión"
    });

    this.mainApp = mainApp;
    this.workoutOriginal = workoutData;
    this.telemetriaRaw = telemetriaRaw;
    this.ftp = parseInt(localStorage.getItem("user_ftp")) || 180;

    this.stats = this._procesarEstadisticas();
    this.crearInterfaz();
  }

  _procesarEstadisticas() {
    if (!this.telemetriaRaw || this.telemetriaRaw.length === 0) {
      return { tiempo: "00:00", avgWatts: 0, maxWatts: 0, avgHR: 0, avgCad: 0, tss: 0 };
    }

    let sumW = 0, maxW = 0, sumHR = 0, sumCad = 0;
    const totalPuntos = this.telemetriaRaw.length;

    this.telemetriaRaw.forEach(p => {
      const w = parseInt(p.wattsCell) || 0;
      const hr = parseInt(p.hrValue) || 0;
      const cad = parseInt(p.cadenceCell) || 0;

      sumW += w;
      if (w > maxW) maxW = w;
      sumHR += hr;
      sumCad += cad;
    });

    const avgWatts = Math.round(sumW / totalPuntos);
    const min = Math.floor(totalPuntos / 60);
    const seg = totalPuntos % 60;

    // Cálculo de TSS: (seg * watts * IF) / (FTP * 3600) * 100
    const intensidad = avgWatts / this.ftp;
    const tss = Math.round(((totalPuntos * avgWatts * intensidad) / (this.ftp * 3600)) * 100);

    return {
      tiempo: `${min}:${seg.toString().padStart(2, '0')}`,
      avgWatts: avgWatts,
      maxWatts: maxW,
      avgHR: Math.round(sumHR / totalPuntos),
      avgCad: Math.round(sumCad / totalPuntos),
      tss: tss || 0
    };
  }

  crearInterfaz() {
    const x = 25;
    const anchoComp = 400;
    let y = 60;

    // 1. Título y Tiempo Principal
    this.agregarHijo(new Label({
      id: "lblResTitulo", top: y, left: x, width: anchoComp,
      texto: this.workoutOriginal.workoutName, fontSize: 18, bold: true
    }));

    y += 45;

    // 2. Grid de Estadísticas (Bootstrap Style)
    const metrics = [
      { l: "Tiempo:", v: this.stats.tiempo },
      { l: "TSS:", v: this.stats.tss },
      { l: "Watts Med:", v: this.stats.avgWatts + "w" },
      { l: "Watts Max:", v: this.stats.maxWatts + "w" },
      { l: "HR Med:", v: this.stats.avgHR + " bpm" },
      { l: "Cadencia:", v: this.stats.avgCad + " rpm" }
    ];

    metrics.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const posX = x + (col * 205);
      const posY = y + (row * 30);

      this.agregarHijo(new Label({
        id: `m_l_${i}`, top: posY, left: posX, width: 90, texto: m.l, fontSize: 13, color: "#999"
      }));
      this.agregarHijo(new Label({
        id: `m_v_${i}`, top: posY, left: posX + 85, width: 90, texto: m.v, fontSize: 13, bold: true
      }));
    });

    y += 110;

    // 3. Tabla de Tiempo en Zona (TiZ)
    this.agregarHijo(new Label({
      id: "lblTizHeader", top: y, left: x, texto: "Tiempo en Zona (Distribución)", 
      fontSize: 14, bold: true, color: "var(--bs-info)"
    }));

    y += 30;

    // Encabezados Tabla
    const headers = ["Z", "Descripción", "%", "Tiempo"];
    const colWs = [35, 160, 65, 80];
    let curX = x;

    headers.forEach((h, i) => {
      this.agregarHijo(new Label({
        id: `th_${i}`, top: y, left: curX, width: colWs[i], texto: h, fontSize: 11, bold: true, color: "#777"
      }));
      curX += colWs[i];
    });

    y += 25;

    // Filas de Datos (ZonaUtils)
    const filas = ZonaUtils.obtenerDatosTablaTIZ(this.telemetriaRaw, this.ftp);
    filas.forEach((f, idx) => {
      let rX = x;
      const vals = [f.zona, f.nombre, f.porcentaje, f.tiempo];
      vals.forEach((v, cIdx) => {
        this.agregarHijo(new Label({
          id: `tr_${idx}_${cIdx}`, top: y, left: rX, width: colWs[cIdx], texto: v, fontSize: 12
        }));
        rX += colWs[cIdx];
      });
      y += 24;
    });

    y += 40;

    // 4. Botones de Acción
    this.agregarHijo(new Boton({
      id: "btnExportTCX", top: y, left: x, width: anchoComp, height: 45,
      texto: "Descargar .TCX (Strava)",
      color: "success",
      fn: () => this.ejecutarDescarga()
    }));

    y += 60;

    this.agregarHijo(new Boton({
      id: "btnCerrarResumen", top: y, left: x + (anchoComp / 4), width: anchoComp / 2, height: 40,
      texto: "Cerrar",
      color: "secondary",
      fn: () => this.cerrar()
    }));
  }

  ejecutarDescarga() {
    const tcxString = TcxExport.jsonToTcxStrava(this.telemetriaRaw);
    const blob = new Blob([tcxString], { type: 'application/tcx+xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `${this.workoutOriginal.workoutName.replace(/\s+/g, '_')}_${fecha}.tcx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}