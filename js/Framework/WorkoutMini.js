class WorkoutMini extends Window {
  constructor({ id, top, left, width, height, workout }) {
    super({ id, top, left, width, height });

    this.width = width;
    this.height = height;
    this.workout = workout;

    this.elemento = document.createElement("div");
    this.elemento.id = id;
    // bg-transparent y overflow-hidden para que quede limpio en cualquier contenedor
    this.elemento.className = "position-absolute d-flex align-items-end overflow-hidden bg-transparent";
    this.elemento.style.top = top + "px";
    this.elemento.style.left = left + "px";
    this.elemento.style.width = width + "px";
    this.elemento.style.height = height + "px";

    this.render();
  }

  render() {
    this.elemento.innerHTML = "";
    if (!this.workout || !this.workout.segments) return;

    const segments = this.workout.segments;
    const totalDuration = segments.reduce((acc, seg) => acc + seg[0], 0);
    
    // Obtenemos el porcentaje máximo para escalar las alturas proporcionalmente
    const maxPct = Math.max(...segments.flatMap(s => [s[1], s[2]]));

    segments.forEach((seg, index) => {
      const duration = seg[0];
      const pctIni = seg[1];
      const pctFin = seg[2];
      
      // Contenedor del segmento (proporcional al ancho)
      const segContainer = document.createElement("div");
      const widthPct = (duration / totalDuration) * 100;
      segContainer.style.width = widthPct + "%";
      
      // Calculamos la altura basada en el máximo del segmento actual
      const currentMax = Math.max(pctIni, pctFin);
      const heightPx = (currentMax / maxPct) * this.height;
      segContainer.style.height = heightPx + "px";
      segContainer.className = "position-relative";

      // --- COLOR Y GRADIENTE ---
      // Usamos el color "strong" para que sea la versión encendida
      const midPct = (pctIni + pctFin) / 2;
      const zona = ZonaUtils.calcularZona(midPct, 100);
      const color = ZonaUtils.getStrongColor(zona);

      const bar = document.createElement("div");
      bar.style.width = "100%";
      bar.style.height = "100%";
      bar.style.backgroundColor = color;
      
      // Un borde muy fino para separar bloques si son del mismo color
      bar.style.borderLeft = "1px solid rgba(255,255,255,0.1)";

      // --- APLICAR RAMPA (Clip Path) ---
      if (pctIni !== pctFin) {
        const minVal = Math.min(pctIni, pctFin);
        const maxVal = Math.max(pctIni, pctFin);
        const diffPct = (minVal / maxVal) * 100;

        if (pctIni < pctFin) {
          // Rampa ascendente
          bar.style.clipPath = `polygon(0% ${100 - diffPct}%, 100% 0%, 100% 100%, 0% 100%)`;
        } else {
          // Rampa descendente
          bar.style.clipPath = `polygon(0% 0%, 100% ${100 - diffPct}%, 100% 100%, 0% 100%)`;
        }
      }

      segContainer.appendChild(bar);
      this.elemento.appendChild(segContainer);
    });
  }

  // Método para actualizar el workout sin recrear el objeto
  setWorkout(workout) {
    this.workout = workout;
    this.render();
  }
}