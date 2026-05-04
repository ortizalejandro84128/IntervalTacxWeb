class TemporizadorRegresivo {
  constructor() {
    this.totalSeconds = 0; // Seguros restantes
    this.running = false;
  }

  // Recibe los minutos iniciales
  init(minutos) {
    console.log('minutos:'+minutos);
    this.totalSeconds = minutos * 60;
    this.running = true;
  }

  pause() {
    this.running = false;
  }

  resume() {
    if (this.totalSeconds > 0) {
      this.running = true;
    }
  }

  // Cada vez que se llama a tick(), restamos 1 segundo
  tick() {
    if (this.running && this.totalSeconds > 0) {
      this.totalSeconds--;
      
      // Si llegamos a cero, se detiene
      if (this.totalSeconds === 0) {
        this.running = false;
      }
    }
  }

  getTimeTemporizador() {
    const hours = Math.floor(this.totalSeconds / 3600);
    const minutes = Math.floor((this.totalSeconds % 3600) / 60);
    const seconds = this.totalSeconds % 60;

    const pad = (num) => num.toString().padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    } else {
      return `${pad(minutes)}:${pad(seconds)}`;
    }
  }
}