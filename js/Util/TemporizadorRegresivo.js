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

      if (this.totalSeconds <= 4 && this.totalSeconds > 1) {
        // Primer beep
    const freq = 2400 + (3 - 5) * 200;
        TemporizadorRegresivo.playProfessionalBeep(freq, 0.5);
    
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




 static playProfessionalBeep(frecuencia, duracion = 0.12) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    // Conexión: Oscilador -> Filtro -> Ganancia -> Salida
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Tipo de onda: 'triangle' suena más orgánico y menos "agresivo" que 'square'
    // pero más profesional que 'sine'.
    oscillator.type = "triangle"; 
    oscillator.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);

    // Configuración del filtro para limpiar el sonido
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);

    // --- LA ENVOLVENTE (Lo que da el toque profesional) ---
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    // Ataque ultra rápido (0.005s) para que se sienta el "click"
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.005); 
    // Decaimiento suave (exponencial) hasta el final
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duracion);

    oscillator.start(now);
    oscillator.stop(now + duracion);
}



}