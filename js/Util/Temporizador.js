class Temporizador {
  constructor() {
    this.startTime = null;     // momento en que se inicia/reanuda
    this.elapsed = 0;          // tiempo acumulado en ms
    this.running = false;      // estado: corriendo o pausado
  }

  init() {
    this.startTime = Date.now();
    this.elapsed = 0;
    this.running = true;
  }

  pause() {
    if (this.running) {
      this.elapsed += Date.now() - this.startTime;
      this.running = false;
    }
  }

  resume() {
    if (!this.running) {
      this.startTime = Date.now();
      this.running = true;
    }
  }

  tick() {
    if (this.running) {
      const now = Date.now();
      this.totalElapsed = this.elapsed + (now - this.startTime);
    } else {
      this.totalElapsed = this.elapsed;
    }
  }

  getTimeTemporizador() {
    const ms = this.totalElapsed % 1000;
    const decimas = Math.floor(ms / 100);

    const totalSeconds = Math.floor(this.totalElapsed / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    const pad = (num, size = 2) => num.toString().padStart(size, "0");
        if (hours>0){
            return `${hours}:${pad(minutes)}:${pad(seconds)}`;
        }else {
            return `${pad(minutes)}:${pad(seconds)}`;
        }

  }
}
