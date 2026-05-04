class TemporizadorRegresivo {
  constructor() {
    this.totalSeconds = 0; // Seguros restantes
    this.running = false;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

      if (this.totalSeconds <= 5 && this.totalSeconds > 1) {
        // Primer beep
    const freq = 2400 + (3 - 5) * 200;
        this.playProfessionalBeep(freq, 0.4);
    
    } 
    else if (this.totalSeconds === 1) {
       this.playProfessionalBeep(3200, 0.8);
    }
      
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




 playProfessionalBeep(frecuencia, duracion = 0.12) {
    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    // Conexión: Oscilador -> Filtro -> Ganancia -> Salida
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    // Tipo de onda: 'triangle' suena más orgánico y menos "agresivo" que 'square'
    // pero más profesional que 'sine'.
    oscillator.type = "triangle"; 
    oscillator.frequency.setValueAtTime(frecuencia, this.audioCtx.currentTime);

    // Configuración del filtro para limpiar el sonido
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);

    // --- LA ENVOLVENTE (Lo que da el toque profesional) ---
    const now = this.audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    // Ataque ultra rápido (0.005s) para que se sienta el "click"
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.005); 
    // Decaimiento suave (exponencial) hasta el final
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duracion);

    oscillator.start(now);
    oscillator.stop(now + duracion);
}



}