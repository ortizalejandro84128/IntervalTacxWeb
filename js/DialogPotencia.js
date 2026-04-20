class DialogPotencia extends Dialog {
  constructor(mainApp) {
    super({
      id: "dialogPotencia",
      width: 450,
      height: 300,
      texto: "Entrenamiento por Potencia"
    });

    this.mainApp = mainApp;
    this.temporizador = new Temporizador();
    this.temporizador.init();

    this.monitorHR=false;
    this.currentHR=0;


    this.heartRateMonitor=new HeartRateMonitor(this, this.recibeMonitorHR.bind(this));

    this.potenciaObjetivo = 90;
    this.pause = false;

    this.crearControles();
  }

  crearControles() {
    // Título
    this.addChildLabel({ id: "lblTitulo", texto: "Control Potencia", fontSize: "34px", fontWeight: "bold" });

    // Fila 1: Botones de conexión
    this.addChildBoton({ id: "btnRodillo", texto: "Rodillo", fn: this.conectarRodillo.bind(this) });
    this.addChildBoton({ id: "btnHR", texto: "HR", fn: this.conectarHR.bind(this) });
    this.addChildBoton({ id: "btnStart", texto: "Start",color: "success", fn: this.conectarHR.bind(this) });

    // Fila 2: Labels de potencia y velocidad
    this.addChildLabel({ id: "lblPotencia", texto: "Pot:", fontSize: "36px", color: "red", align:"center" });
    this.addChildLabel({ id: "lblVelocidad", texto: "Vel:", fontSize: "36px", color: "blue", align:"center" });

    this.addChildLabel({ id: "Potencia", texto: "W", fontSize: "44px", color: "red", align:"center" });
    this.addChildLabel({ id: "Velocidad", texto: "km/h", fontSize: "44px", color: "blue", align:"center" });

    // Fila 3: Contador de tiempo
    this.addChildLabel({ id: "lblTiempo", texto: "Tiempo:", fontSize: "36px", fontWeight: "bold", color: "green", align:"center" });
    this.addChildLabel({ id: "Tiempo", texto: "00:00", fontSize: "44px", fontWeight: "bold", color: "green", align:"center" });

    // Fila 4: Control de potencia objetivo
    this.addChildBoton({ id: "btnMenos", texto: "-", fn: () => this.ajustarPotencia(-5) });
    this.addChildLabel({ id: "lblPotenciaObj", texto: `${this.potenciaObjetivo} W`, fontSize: "30px", fontWeight: "bold", align:"center" });
    this.addChildBoton({ id: "btnMas", texto: "+", fn: () => this.ajustarPotencia(5) });
  }

  // Métodos de conexión
  conectarRodillo() {
    this.showAlert("Rodillo conectado");
  }


  recibeMonitorHR() {
    
  }

  conectarHR() {
    this.showAlert("HR conectado");
  }

  // Actualizaciones dinámicas
  recibePotencia(value) {
    this.getChildById("lblPotencia").actualizarTexto(value + " W");
  }

  recibeVelocidad(value) {
    this.getChildById("lblVelocidad").actualizarTexto(value + " km/h");
  }

  procesaTick() {
    if (!this.pause) {
      this.temporizador.tick();
      this.getChildById("lblTiempo").actualizarTexto("Tiempo: " + this.temporizador.getTimeTemporizador());
    }
  }

  ajustarPotencia(delta) {
    this.potenciaObjetivo += delta;
    if (this.potenciaObjetivo < 0) this.potenciaObjetivo = 0;
    this.getChildById("lblPotenciaObj").actualizarTexto(`${this.potenciaObjetivo} W`);
    // Aquí podrías enviar la potencia objetivo al rodillo
  }

  // Layout horizontal
  getBoundsHorizontal() {
    return { width: 450, height: 300 };
  }

getLayoutHorizontal() {
  return [
    { id: "lblTitulo", top: 10, left: 10, width: 430, height: 30 },

    { id: "btnRodillo", top: 60, left: 10, width: 140, height: 30 },
    { id: "btnHR",      top: 60, left: 160, width: 140, height: 30 },
    { id: "btnStart",   top: 60, left: 310, width: 140, height: 30 },

    { id: "lblPotencia", top: 110, left: 10, width: 140, height: 30 },
    { id: "lblVelocidad", top: 110, left: 310, width: 140, height: 30 },
    { id: "Potencia", top: 140, left: 10, width: 140, height: 30 },
    { id: "Velocidad", top: 140, left: 310, width: 140, height: 30 },

    { id: "lblTiempo", top: 140, left: 160, width: 140, height: 30 },
    { id: "Tiempo", top: 160, left: 160, width: 140, height: 30 },

    // Fila centrada: botón pequeño - , etiqueta, botón pequeño +
    { id: "btnMenos", top: 210, left: 120, width: 40, height: 30 },
    { id: "lblPotenciaObj", top: 210, left: 170, width: 100, height: 30 },
    { id: "btnMas", top: 210, left: 280, width: 40, height: 30 }
  ];
}
 

// Layout vertical
getBoundsVertical() {
  return { width: 300, height: 450 };
}

getLayoutVertical() {
  return [
    // Fila 0: Título
    { id: "lblTitulo", top: 10, left: 10, width: 280, height: 30 },

    // Fila 1: Botones de conexión y start
    { id: "btnRodillo", top: 70, left: 10,  width: 90, height: 30 },
    { id: "btnHR",      top: 70, left: 110, width: 90, height: 30 },
    { id: "btnStart",   top: 70, left: 210, width: 80, height: 30 },

    // Fila 2: Encabezados potencia y velocidad
    { id: "lblPotencia",  top: 120, left: 10,  width: 130, height: 30 },
    { id: "lblVelocidad", top: 120, left: 160, width: 130, height: 30 },

    // Fila 3: Valores dinámicos potencia y velocidad
    { id: "Potencia",  top: 140, left: 10,  width: 130, height: 30 },
    { id: "Velocidad", top: 140, left: 160, width: 130, height: 30 },

    // Fila 4: Tiempo
    { id: "lblTiempo", top: 190, left: 10,  width: 280, height: 30 },
    { id: "Tiempo",    top: 220, left: 10,  width: 280, height: 30 },

    // Fila 5: Control de potencia objetivo centrado
    { id: "btnMenos",        top: 270, left: 70,  width: 30, height: 30 },
    { id: "lblPotenciaObj",  top: 270, left: 110, width: 120, height: 30 },
    { id: "btnMas",          top: 270, left: 210, width: 30, height: 30 }
  ];
}



}
