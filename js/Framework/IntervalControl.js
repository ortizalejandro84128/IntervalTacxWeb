class IntervalControl extends Window {
  constructor({ id, top, left, width, height, app, workout,  fnIniciaSegmento, fnFinActividad, factor }) {
    super({ id, top, left, width, height });

    this.width = width;
    this.height = height;
    this.app = app;
    this.workout = workout;
    this.ftp =  localStorage.getItem("user_ftp") || 180;
    this.fnIniciaSegmento = fnIniciaSegmento || null;
    this.fnFinActividad = fnFinActividad || null;

    this.intervals = [];
    this.current = 0;
    this.elapsed = 0;
    this.started = false;
    this.actividadIniciada = false; // Nueva bandera
    this.factor = factor || 60;

    this.elemento = document.createElement("div");
    this.elemento.id = id;
    this.elemento.className = "border bg-light position-absolute d-flex flex-column";
    this.elemento.style.top = top + "px";
    this.elemento.style.left = left + "px";
    this.elemento.style.width = width + "px";
    this.elemento.style.height = height + "px";

    this.setIntervalsFromWorkout(workout, this.ftp);
  }

  // Método para controlar el estado de edición
  setEstatusActividad(iniciada) {
    this.actividadIniciada = iniciada;
    this.render(); // Re-renderizamos para bloquear/desbloquear visualmente
  }

  setIntervalsFromWorkout(workout, ftp) {
    if (!workout || !workout.segments) return;
    this.workout = workout;
    this.ftp = parseInt(ftp) ||this.ftp;
    this.intervals = [];

    for (var i = 0; i < workout.segments.length; i++) {
      var seg = workout.segments[i]; 
      var pctFTP = seg[2]; 
      var zona = ZonaUtils.calcularZona(pctFTP, 100); 

      this.intervals.push({
        duration: seg[0] * this.factor,
        pctFTP: pctFTP, 
        watts: Math.round((pctFTP * this.ftp) / 100),
        zona: zona,
        progress: 0
      });
    }
    this.render();
  }

  render() {
    this.elemento.innerHTML = "";

    var totalDuration = this.intervals.reduce((acc, inv) => acc + inv.duration, 0);
    if (totalDuration === 0) totalDuration = 1;

    // 1. Título y Contenedor Superior
    var titleContainer = document.createElement("div");
    titleContainer.className = "fw-bold bg-primary text-white w-100 d-flex align-items-center justify-content-between";
    titleContainer.style.fontSize = (this.width / 35) + "px";
    titleContainer.style.padding = "4px 10px"; 
    
    var titleText = document.createElement("span");
    titleText.textContent = this.workout.workoutName + " - " + this.workout.dominantZone;
    titleContainer.appendChild(titleText);

    // --- CONTROLES FTP ---
    var overlayControls = document.createElement("div");
    overlayControls.className = "d-flex align-items-center bg-dark rounded shadow-sm overflow-hidden";
    overlayControls.style.height = "40px";
    overlayControls.style.zIndex = "20";
    
    // Bloqueo si la actividad inició
    if (this.actividadIniciada) {
      overlayControls.style.opacity = "0.5";
      overlayControls.style.pointerEvents = "none"; // Deshabilita clics
    }

    var btnMinus = document.createElement("button");
    btnMinus.textContent = "-";
    btnMinus.className = "btn btn-danger p-0 fw-bold border-0 d-flex align-items-center justify-content-center";
    btnMinus.style.width = "40px";
    btnMinus.style.height = "100%";
    btnMinus.style.borderRadius = "0";
    btnMinus.onclick = (e) => {
      e.stopPropagation();
      localStorage.setItem("user_ftp", this.ftp-5);
      this.setIntervalsFromWorkout(this.workout, this.ftp - 5);
    };

    var labelFtp = document.createElement("span");
    labelFtp.className = "text-white fw-bold px-2";
    labelFtp.style.fontSize = (this.width / 40) + "px";
    labelFtp.textContent = "FTP: " + this.ftp;

    var btnPlus = document.createElement("button");
    btnPlus.textContent = "+";
    btnPlus.className = "btn btn-success p-0 fw-bold border-0 d-flex align-items-center justify-content-center";
    btnPlus.style.width = "40px";
    btnPlus.style.height = "100%";
    btnPlus.style.borderRadius = "0";
    btnPlus.onclick = (e) => {
      e.stopPropagation();
      localStorage.setItem("user_ftp", this.ftp+5);
      this.setIntervalsFromWorkout(this.workout, this.ftp + 5);
    };

    overlayControls.appendChild(btnMinus);
    overlayControls.appendChild(labelFtp);
    overlayControls.appendChild(btnPlus);
    
    titleContainer.appendChild(overlayControls);
    this.elemento.appendChild(titleContainer);

    // 2. Contenedor principal
    var mainContent = document.createElement("div");
    mainContent.className = "position-relative flex-grow-1 w-100";
    this.elemento.appendChild(mainContent);

    // 3. Gráfico de intervalos
    var chartHeight = mainContent.offsetHeight || (this.height - 40); 
    var graphHeight = chartHeight - 25; 

    var intervalsContainer = document.createElement("div");
    intervalsContainer.className = "d-flex align-items-end position-absolute w-100";
    intervalsContainer.style.top = "0";
    intervalsContainer.style.height = graphHeight + "px";

    var maxPct = Math.max(...this.intervals.map(i => i.pctFTP));
    if (maxPct <= 0) maxPct = 100;

    for (var j = 0; j < this.intervals.length; j++) {
      var interval = this.intervals[j];
      var widthPx = (interval.duration / totalDuration) * this.width;
      var relativeHeight = (interval.pctFTP / maxPct) * (graphHeight * 0.9);

      var container = document.createElement("div");
      container.style.width = widthPx + "px";
      container.style.height = relativeHeight + "px";
      container.style.background = ZonaUtils.getMutedColor(interval.zona);
      container.className = "position-relative border-start border-white";
      container.title = `${Math.round(interval.duration / this.factor)}min - ${interval.watts}W`;

      var bar = document.createElement("div");
      bar.style.width = interval.progress + "%";
      bar.style.height = "100%";
      bar.style.background = ZonaUtils.getStrongColor(interval.zona);
      bar.className = "position-absolute start-0 bottom-0";
      
      interval._bar = bar;
      container.appendChild(bar);
      intervalsContainer.appendChild(container);
    }
    mainContent.appendChild(intervalsContainer);

    // 4. Regla
    var rule = document.createElement("div");
    rule.className = "position-absolute border-top border-dark w-100";
    rule.style.bottom = "0";
    rule.style.height = "25px";

    var step = 5 * this.factor; 
    var numMarks = Math.floor(totalDuration / step);

    for (var k = 0; k <= numMarks; k++) {
      var leftPos = ((k * step) / totalDuration) * this.width;
      var mark = document.createElement("div");
      mark.className = "position-absolute bg-dark";
      mark.style.left = leftPos + "px";
      mark.style.height = "5px";
      mark.style.width = "1px";

      var labelMark = document.createElement("div");
      labelMark.textContent = k * 5;
      labelMark.className = "position-absolute small";
      labelMark.style.top = "5px";
      labelMark.style.left = leftPos + "px";
      labelMark.style.transform = "translateX(-50%)";
      labelMark.style.fontSize = (this.width / 60) + "px";

      rule.appendChild(mark);
      rule.appendChild(labelMark);
    }
    mainContent.appendChild(rule);
  }

  updateBars() {
    for (var i = 0; i < this.intervals.length; i++) {
      var interval = this.intervals[i];
      if (interval._bar) {
        interval._bar.style.width = interval.progress + "%";
      }
    }
  }

tick() {
  if (!this.intervals.length) return;

  if (this.current < this.intervals.length) {
    var interval = this.intervals[this.current];

    // Detectamos el inicio exacto del segmento
    if (this.elapsed === 0) {
      // 1. Obtener la potencia del intervalo anterior (si no hay, usamos la actual)
      var potAnterior = 0;
      if (this.current > 0) {
        potAnterior = this.intervals[this.current - 1].watts;
      } else {
        // Si es el primer intervalo de todos, podrías empezar desde 50W o similar
        potAnterior = 50;
      }


      // 3. Notificar a la app pasando la rampa en lugar de solo los watts
      if (this.fnIniciaSegmento) {
        this.fnIniciaSegmento(interval.watts, potAnterior,this.ftp);
      }
    }      
      this.started = true;
      this.elapsed++;
      interval.progress = Math.min((this.elapsed / interval.duration) * 100, 100);
      this.updateBars();

      if (this.elapsed >= interval.duration) {
        this.current++;
        this.elapsed = 0;
      }

      if (this.isFinished() && this.fnFinActividad) {
        this.fnFinActividad();
      }
    } else {
      this.started = false;
    }
  }

  reset() {
    this.intervals.forEach(i => i.progress = 0);
    this.current = 0;
    this.elapsed = 0;
    this.started = false;
    this.actividadIniciada = false; // Reset de la bandera al reiniciar
    this.updateBars();
    this.render(); // Asegurar que los controles se desbloqueen
  }

  isFinished() {
    return this.current >= this.intervals.length;
  }
}