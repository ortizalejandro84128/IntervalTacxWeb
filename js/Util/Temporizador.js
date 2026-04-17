class Temporizador {
  constructor() {
    this.startTime = null;
    this.elapsed = 0;
  }

  init() {
    this.startTime = new Date();
    this.elapsed = 0;
  }

  tick() {
    if (!this.startTime) return;
    const now = new Date();
    this.elapsed = now - this.startTime; // diferencia en ms
  }

  getTimeTemporizador() {
    let ms = this.elapsed % 1000;

    // Convertir a décimas de segundo (0–9)
    let decimas = Math.floor(ms / 100);

    let totalSeconds = Math.floor(this.elapsed / 1000);
    let seconds = totalSeconds % 60;
    let totalMinutes = Math.floor(totalSeconds / 60);
    let minutes = totalMinutes % 60;
    let hours = Math.floor(totalMinutes / 60);

    const pad = (num, size = 2) => num.toString().padStart(size, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${decimas}`;
  }
}
