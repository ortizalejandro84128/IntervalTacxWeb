/*class IntervalControl extends Window {
  constructor({ id, top, left, width, height, app, workout, ftp, fnIniciaSegmento, fnFinActividad, factor }) {
    super({ id, top, left, width, height });

    this.width = width;
    this.height = height;
    this.app = app;
    this.workout = workout;
    this.ftp = ftp || 200;
    this.fnIniciaSegmento = fnIniciaSegmento || null;
    this.fnFinActividad = fnFinActividad || null;

    this.intervals = [];
    this.current = 0;
    this.elapsed = 0;
    this.started = false;
    this.factor = factor || 60;

    this.elemento = document.createElement("div");
    this.elemento.id = id;
    this.elemento.className = "border bg-light position-absolute d-flex flex-column"; // Flex-column ayuda a apilar
    this.elemento.style.top = top + "px";
    this.elemento.style.left = left + "px";
    this.elemento.style.width = width + "px";
    this.elemento.style.height = height + "px";

    this.setIntervalsFromWorkout(workout, this.ftp);
  }

  setIntervalsFromWorkout(workout, ftp) {
    if (!workout || !workout.segments) return;
    this.workout = workout;
    this.ftp = ftp;
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

    // 1. Título (Ajustable dinámicamente)
    var title = document.createElement("div");
    title.className = "text-center fw-bold bg-primary text-white w-100";
    title.style.fontSize = (this.width / 30) + "px";
    title.style.padding = "4px 0"; // Padding en lugar de height fija
    title.textContent = "FTP:"+this.ftp+"-"+ this.workout.workoutName + " - " + this.workout.dominantZone;
    this.elemento.appendChild(title);

    // 2. Contenedor del contenido (Gráfico + Regla)
    // Usamos flex-grow para que ocupe todo el espacio restante tras el título
    var mainContent = document.createElement("div");
    mainContent.className = "position-relative flex-grow-1 w-100";
    this.elemento.appendChild(mainContent);

    // 3. Contenedor de intervalos (Gráfico)
    var chartHeight = mainContent.offsetHeight || (this.height - 50); 
    var graphHeight = chartHeight - 25; // Restamos espacio para la regla

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

    // 4. Regla (Al fondo del mainContent)
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
      if (this.elapsed === 0 && this.fnIniciaSegmento) {
        this.fnIniciaSegmento(this.current, interval.watts);
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
    this.updateBars();
  }

  isFinished() {
    return this.current >= this.intervals.length;
  }
}*/

class IntervalControl extends Window {
  constructor({ id, top, left, width, height, app, workout, ftp, fnIniciaSegmento, fnFinActividad, factor }) {
    super({ id, top, left, width, height });

    this.width = width;
    this.height = height;
    this.app = app;
    this.workout = workout;
    this.ftp = ftp || 200;
    this.fnIniciaSegmento = fnIniciaSegmento || null;
    this.fnFinActividad = fnFinActividad || null;

    this.intervals = [];
    this.current = 0;
    this.elapsed = 0;
    this.started = false;
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

  setIntervalsFromWorkout(workout, ftp) {
    if (!workout || !workout.segments) return;
    this.workout = workout;
    this.ftp = parseInt(ftp) || 200;
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

    // 1. Título (Ajustable dinámicamente)
    var title = document.createElement("div");
    title.className = "text-center fw-bold bg-primary text-white w-100 position-relative";
    title.style.fontSize = (this.width / 30) + "px";
    title.style.padding = "4px 0"; 
    title.textContent = "FTP:" + this.ftp + " - " + this.workout.workoutName + " - " + this.workout.dominantZone;
    this.elemento.appendChild(title);

    // --- NUEVO: BOTÓN E INPUT SOBRE EL TÍTULO (Posición 0,0) ---
    var overlayControls = document.createElement("div");
    overlayControls.className = "position-absolute d-flex align-items-center";
    overlayControls.style.top = "0";
    overlayControls.style.left = "0";
    overlayControls.style.height = "100%";
    overlayControls.style.paddingLeft = "5px";
    overlayControls.style.zIndex = "10";

    var inputFtp = document.createElement("input");
    inputFtp.type = "number";
    inputFtp.value = this.ftp;
    inputFtp.style.width = (this.width / 8) + "px";
    inputFtp.style.fontSize = "10px";
    inputFtp.style.height = "18px";
    inputFtp.className = "form-control p-0 text-center border-0";

    var btnUpdate = document.createElement("button");
    btnUpdate.textContent = "✔";
    btnUpdate.className = "btn btn-warning p-0 ms-1 d-flex align-items-center justify-content-center";
    btnUpdate.style.width = "18px";
    btnUpdate.style.height = "18px";
    btnUpdate.style.fontSize = "10px";
    btnUpdate.onclick = (e) => {
      e.stopPropagation(); // Evita interferir con eventos de la ventana
      this.setIntervalsFromWorkout(this.workout, inputFtp.value);
    };

    overlayControls.appendChild(inputFtp);
    overlayControls.appendChild(btnUpdate);
    title.appendChild(overlayControls);
    // ---------------------------------------------------------

    // 2. Contenedor del contenido (Gráfico + Regla)
    var mainContent = document.createElement("div");
    mainContent.className = "position-relative flex-grow-1 w-100";
    this.elemento.appendChild(mainContent);

    // 3. Contenedor de intervalos (Gráfico)
    var chartHeight = mainContent.offsetHeight || (this.height - 50); 
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
      if (this.elapsed === 0 && this.fnIniciaSegmento) {
        this.fnIniciaSegmento(this.current, interval.watts);
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
    this.updateBars();
  }

  isFinished() {
    return this.current >= this.intervals.length;
  }
}