class IntervalControl extends Window {
  constructor({ id, top, left, width, height, app, workout, ftp, fnIniciaSegmento, fnFinActividad, factor }) {
    super({ id, top, left, width, height });

    this.app = app;
    this.workout = workout;
    this.ftp = ftp || 200; // valor por defecto
    this.fnIniciaSegmento = fnIniciaSegmento || null;
    this.fnFinActividad = fnFinActividad || null;

    this.intervals = [];
    this.current = 0;
    this.elapsed = 0;
    this.started = false;

    // nuevo factor: 60 para minutos reales, 1 para pruebas rápidas
    this.factor = factor || 1;

    // Contenedor principal con Bootstrap
    this.elemento = document.createElement("div");
    this.elemento.id = id;
    this.elemento.className = "border bg-light position-absolute";
    this.elemento.style.top = top + "px";
    this.elemento.style.left = left + "px";
    this.elemento.style.width = width + "px";
    this.elemento.style.height = height + "px";

    this.setIntervalsFromWorkout(workout);
  }

  setIntervalsFromWorkout(workout) {
    if (!workout || !workout.segments) return;

    this.intervals = [];
    for (var i = 0; i < workout.segments.length; i++) {
      var seg = workout.segments[i];
      var zona = ZonaUtils.calcularZona(seg[2], this.ftp);

      // duración ajustada al factor
      var duration = seg[0] * this.factor;

      // 🔹 Guardamos proporción en lugar de altura absoluta
      var heightRatio = seg[2] / this.ftp;

      this.intervals.push({
        duration: duration,
        power: seg[2],
        zona: zona,
        heightRatio: heightRatio,
        progress: 0
      });
    }
    this.render();
  }

  render() {
    this.elemento.innerHTML = "";

    var totalDuration = 0;
    for (var i = 0; i < this.intervals.length; i++) {
      totalDuration += this.intervals[i].duration;
    }
    if (totalDuration === 0) totalDuration = 1;

    var totalWidth = this.width;

    // Etiqueta superior con el nombre del workout
    var title = document.createElement("div");
    title.className = "text-center fw-bold bg-primary text-white p-0";
    title.textContent = this.workout.workoutName || "Workout";
    title.style.fontSize = (this.width/ 30)+"px";
    this.elemento.appendChild(title);

    // Contenedor principal
    var mainContainer = document.createElement("div");
    mainContainer.className = "position-relative w-100 h-100";

    // Contenedor de intervalos
    var intervalsContainer = document.createElement("div");
    intervalsContainer.className = "d-flex align-items-end";
    intervalsContainer.style.height = (this.height - 22) + "px";

    for (var j = 0; j < this.intervals.length; j++) {
      var interval = this.intervals[j];

      // 🔹 recalculamos dimensiones dinámicamente
      var widthPx = (interval.duration / totalDuration) * this.width;
      var relativeHeight = interval.heightRatio * (this.height - 50) * 2.0;

      var container = document.createElement("div");
      container.style.width = widthPx + "px";
      container.style.height = relativeHeight + "px";
      container.style.background = ZonaUtils.getMutedColor(interval.zona);
      container.className = "position-relative";

      var bar = document.createElement("div");
      bar.style.width = interval.progress + "%";
      bar.style.height = "100%";
      bar.style.background = ZonaUtils.getStrongColor(interval.zona);
      bar.className = "position-absolute start-0 bottom-0";
      interval._bar = bar;

      container.appendChild(bar);
      intervalsContainer.appendChild(container);
    }

    mainContainer.appendChild(intervalsContainer);

    // Regla graduada
    var rule = document.createElement("div");
    rule.className = "position-absolute border-top";
    rule.style.bottom = "0";
    rule.style.left = "0";
    rule.style.width = totalWidth + "px";
    rule.style.height = "20px";

    var step = 5 * this.factor;
    var numMarks = Math.floor(totalDuration / step);

    for (var k = 0; k <= numMarks; k++) {
      var mark = document.createElement("div");
      mark.className = "position-absolute bg-dark";
      mark.style.left = ((k * step) / totalDuration) * totalWidth + "px";
      mark.style.height = "5px";
      mark.style.width = "1px";
      mark.style.transform = "translateX(-50%)";

      var labelMark = document.createElement("div");
      labelMark.textContent = k * 5+"m";
      labelMark.className = "position-absolute small";
      labelMark.style.top = "8px";
      labelMark.style.left = ((k * step) / totalDuration) * totalWidth + "px";
      labelMark.style.transform = "translateX(-50%)";
      labelMark.style.fontSize = (this.width/ 60)+"px";

      rule.appendChild(mark);
      rule.appendChild(labelMark);
    }

    mainContainer.appendChild(rule);
    this.elemento.appendChild(mainContainer);
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
        this.fnIniciaSegmento(this.current, Math.floor((interval.power / 100) * this.ftp));
      }

      this.started = true;
      this.elapsed++;
      interval.progress = Math.min((this.elapsed / interval.duration) * 100, 100);
      this.updateBars();

      if (this.elapsed >= interval.duration) {
        this.current++;
        this.elapsed = 0;
      }
      if (this.isFinished()) {
        this.fnFinActividad();
      }

    } else {
      this.started = false;
    }
  }

  reset() {
    for (var i = 0; i < this.intervals.length; i++) {
      this.intervals[i].progress = 0;
    }
    this.current = 0;
    this.elapsed = 0;
    this.started = false;
    this.updateBars();
  }

  isFinished() {
    return this.current >= this.intervals.length;
  }
}
