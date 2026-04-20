class EntrenamientoDialog extends Dialog {
  constructor(mainApp) {
    super({
      id: "entrenamientoDialog",
      width: 450,
      height: 650,
      texto: "Entrenamiento ERG Web"

    });

    this.crearControles();
    //this.aplicarLayoutHorizontal();
    //this.aplicarLayoutVertical();
    
    
    this.monitorHR=false;
    this.rodillo=false;
    this.currentHR=0;
    this.mainApp=mainApp;


    this.heartRateMonitor=new HeartRateMonitor(this, this.recibeMonitorHR.bind(this));
    this.trainer = new TacxTrainer(this); 

    this.temporizador = new Temporizador();
    this.temporizador.init();
    this.pause=true;
  }

crearControles() {
  // Título
  this.addChildLabel({ id: "lblTitulo", texto: "Control rodillo + HR", fontSize: "30px", fontWeight: "bold" });

  // Botones
  this.addChildBoton({ id: "btnRodillo", texto: "Tacx", fn: this.conectarRodillo.bind(this) });
  this.addChildBoton({ id: "btnHR", texto: "HR", fn: this.conectaMonitorHR.bind(this) });
  this.addChildBoton({ id: "btnStart", color: "success", texto:"Iniciar", fn:this.iniciActividad.bind(this)});
  this.addChildBoton({ id: "btnPausa", color: "info", texto: "Pausa", fn:this.pauseActividad.bind(this)});
  this.addChildBoton({ id: "btnDetener", color: "danger", texto: "Stop", fn:this.detenerActividad.bind(this)});
  //this.addChildBoton({ id: "btnTCX", texto: "TCX", iconoSVG:ImagesSvgRepo.DOWNLOAD});
  this.addChildBoton({ id: "btnTCX", texto: "TCX"});

  // Input de archivo
  this.addChildFileInput({ id: "ergFile", accept: ".erg2", fn: this.onCargaErg.bind(this) });

  // Encabezados de la tabla
  this.addChildLabel({ id: "lblTimeHead", texto: "Tiempo", fontSize: "20px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblHRHead", texto: "HR", fontSize: "20px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblWattsObjHead", texto: "Obj W", fontSize: "20px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblWattsHead", texto: "Pot W", fontSize: "20px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblCadenceHead", texto: "Cad", fontSize: "20px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblSpeedHead", texto: "Vel", fontSize: "20px", fontWeight: "bold" });

  // Valores dinámicos
  this.addChildLabel({ id: "timeCell", texto: "--", fontSize: "21px", color: "red" ,align:"center" });
  this.addChildLabel({ id: "hrValue", texto: "--", fontSize: "23px", color: "green",align:"center" });
  this.addChildLabel({ id: "wattsObjCell", texto: "--", fontSize: "21px", color: "brown",align:"center" });
  this.addChildLabel({ id: "wattsCell", texto: "--", fontSize: "23px", color: "red" ,align:"center"});
  this.addChildLabel({ id: "cadenceCell", texto: "--", fontSize: "21px", color: "green",align:"center" });
  this.addChildLabel({ id: "speedCell", texto: "--", fontSize: "21px", color: "brown",align:"center" });

  // Timeline
  const workoutDemo = {
    dominantZone: "endurance",
    segments: [[5, 50, "50"], [15, 65, "65"], [5, 105, "50"]],
    workoutName: "Entrenmiento Demo"
  };

  this.timelineControl = new IntervalControl({
    id: "intervalDemo",
    workout: workoutDemo,
    ftp: 200,
    fnIniciaSegmento: this.cambiaSegmento.bind(this),
    fnFinActividad: this.fnFinActividad.bind(this)
  });

  this.agregarHijo(this.timelineControl);

  // Estado inicial de botones
  this.setChildEnabled("btnStart", false);
  this.setChildEnabled("btnTCX", false);
     this.getChildById("btnPausa").hide();
     this.getChildById("btnDetener").hide();
}






getBoundsHorizontal(){
  return {width:650, height:480}
}

getLayoutHorizontal(){
return [
  // Fila 0: Encabezado/Título (centrado)
  { id: "lblTitulo", top: 10, left: 10, width: 600, height: 30 },

  // Fila 1: Botones (todos al mismo top = 60)
  { id: "btnRodillo", top: 70, left: 10,  width: 120, height: 30 },
  { id: "btnHR",      top: 70, left: 140, width: 120, height: 30 },
  { id: "btnStart",   top: 70, left: 270, width: 120, height: 30 },
  { id: "btnTCX",     top: 70, left: 400, width: 120, height: 30 },
  { id: "btnPausa",   top: 70, left: 270, width: 120, height: 30 },
  { id: "btnDetener", top: 70, left: 400, width: 120, height: 30 },
  { id: "ergFile",    top: 70, left: 530, width: 100, height: 30 },

  // Fila 2: Encabezados (todos al mismo top = 120)
  { id: "lblTimeHead",     top: 110, left: 10,  width: 100, height: 30 },
  { id: "lblHRHead",       top: 110, left: 120, width: 100, height: 30 },
  { id: "lblWattsObjHead", top: 110, left: 230, width: 100, height: 30 },
  { id: "lblWattsHead",    top: 110, left: 340, width: 100, height: 30 },
  { id: "lblCadenceHead",  top: 110, left: 450, width: 100, height: 30 },
  { id: "lblSpeedHead",    top: 110, left: 560, width: 80,  height: 30 },

  // Fila 3: Datos dinámicos (todos al mismo top = 180)
  { id: "timeCell",     top: 140, left: 10,  width: 100, height: 30 },
  { id: "hrValue",      top: 140, left: 120, width: 100, height: 30 },
  { id: "wattsObjCell", top: 140, left: 230, width: 100, height: 30 },
  { id: "wattsCell",    top: 140, left: 340, width: 100, height: 30 },
  { id: "cadenceCell",  top: 140, left: 450, width: 100, height: 30 },
  { id: "speedCell",    top: 140, left: 560, width: 80,  height: 30 },

  // Fila 4: Timeline ocupa todo el ancho y el mayor espacio posible
  { id: "intervalDemo", top: 175, left: 10, width: 630, height: 260 }
];

}


getBoundsVertical(){
     return {width:this.getBoundsHorizontal().height, height:this.getBoundsHorizontal().width}
}

getLayoutVertical(){
return [
  // Fila 0: Encabezado/Título
  { id: "lblTitulo", top: 10, left: 5, width: 400, height: 30 },

  // Fila 1: 3 botones
  { id: "btnRodillo", top: 60, left: 5,  width: 159, height: 45 },
  { id: "btnHR",      top: 60, left: 165, width: 159, height: 45 },
  { id: "btnStart",   top: 60, left: 325, width: 100, height: 45 },
  { id: "btnPausa",   top: 60, left: 325, width: 100, height: 45 },

  // Fila 2: 2 botones
  { id: "btnTCX",  top: 110, left: 5,  width: 159, height: 45 },
  { id: "btnDetener",  top: 110, left: 5,  width: 159, height: 45 },
  { id: "ergFile", top: 110, left: 165, width: 159, height: 45 },

  // Fila 3: Encabezados (3)
  { id: "lblTimeHead",     top: 155, left: 5,  width: 150, height: 30 },
  { id: "lblHRHead",       top: 155, left: 165, width: 150, height: 30 },
  { id: "lblWattsObjHead", top: 155, left: 325, width: 100, height: 30 },

  // Fila 4: Datos dinámicos (3) justo debajo de los encabezados
  { id: "timeCell",     top: 190, left: 5,  width: 150, height: 30 },
  { id: "hrValue",      top: 190, left: 165, width: 150, height: 30 },
  { id: "wattsObjCell", top: 190, left: 325, width: 100, height: 30 },

  // Fila 5: Encabezados (3)
  { id: "lblWattsHead",   top: 230, left: 5,  width: 150, height: 30 },
  { id: "lblCadenceHead", top: 230, left: 165, width: 150, height: 30 },
  { id: "lblSpeedHead",   top: 230, left: 325, width: 100, height: 30 },

  // Fila 6: Datos dinámicos (3) justo debajo de los encabezados
  { id: "wattsCell",   top: 270, left: 5,  width: 150, height: 30 },
  { id: "cadenceCell", top: 270, left: 165, width: 150, height: 30 },
  { id: "speedCell",   top: 270, left: 325, width: 100, height: 30 },

  // Fila 7: Timeline ocupa todo el ancho inferior
  { id: "intervalDemo", top: 320, left: 5, width: 440, height: 280 }
];

}


  onCargaErg(fileName, contenido) {
    try {
      const jsonData = JSON.parse(contenido);
      this.timelineControl.setIntervalsFromWorkout(jsonData);
      this.timelineControl.reset();
      console.log("Se cargo erg OK");
    } catch (error) {
      console.error("Error al parsear el archivo como JSON:", error);
    }
  }


  conectarRodillo() {
    this.trainer.connect();
  }
  conectaMonitorHR() {
     this.heartRateMonitor.connect();
	 } 

  recibeMonitorHR(value) {
    this.monitorHR=true;
    this.validarEntreno();
     this.getChildById("hrValue").actualizarTexto(value+" Bpm")
     this.procesaTick();
   } 

recibePotencia(value) {
    this.getChildById("wattsCell").actualizarTexto(value + " W");
    this.procesaTick();
  }

  recibeVelocidad(value) {
    this.getChildById("speedCell").actualizarTexto(value + " km/h");
  }

  recibeCadencia(value) {
    // si quieres mostrar cadencia, añade un label
    this.getChildById("cadenceCell").actualizarTexto(value + "rpm");
    //this.showAlert("cadenceCell: " + value + " rpm");
  }

  ajustarPotencia(potencia) {
    
    if (potencia < 0) potencia = 0;
        this.trainer.setTargetPower(potencia); // ahora sí envía al rodillo
  }



  pauseActividad(){
     this.pause=!this.pause;

  } 


    detenerActividad(){

     this.pause=true;
     this.getChildById("btnPausa").hide();
     this.getChildById("btnDetener").hide();

     this.getChildById("btnTCX").show();
     this.getChildById("ergFile").show();
     this.getChildById("btnStart").show();

  } 



  iniciActividad(){

     const pot=this.timelineControl.workout.segments[0][2];
     console.log("potencia inicial:"+pot);
     this.getChildById("wattsObjCell").actualizarTexto(pot+" W")
     this.ajustarPotencia(pot); 
     
     
     this.timelineControl.reset();
     this.getChildById("ergFile").hide();
     this.getChildById("btnStart").hide();
     this.getChildById("btnTCX").hide();

     this.getChildById("btnPausa").show();
     this.getChildById("btnDetener").show();
     this.temporizador.init();
     this.pause=false;

  } 


  procesaTick() {
    if(!this.pause){
     this.timelineControl.tick();
     this.temporizador.tick();
     this.getChildById("timeCell").actualizarTexto(this.temporizador.getTimeTemporizador())
     //console.log(this.getForm());
    }
//     this.getChildById("ergFile").hide();
     //this.mainApp.showDialog("usuarioDialog");
	 } 

  cambiaSegmento(current, interval) {
    this.getChildById("wattsObjCell").actualizarTexto(interval+" W")
    this.ajustarPotencia(interval); 
    
	 } 

   fnFinActividad() {
    this.showAlert("Actividad finalizada");
    this.pause=true;
    this.getChildById("btnPausa").hide();
    this.getChildById("btnDetener").hide();
    this.getChildById("ergFile").show();
    this.getChildById("btnStart").show();
    this.getChildById("btnTCX").show();


	 } 

  cerrarUsuarioDialogModal(data) {
     this.showAlert (JSON.stringify(data, null, 2));
//     this.procesaTick();
   } 

  validarEntreno() {

		 if(this.monitorHR){
           this.setChildEnabled("btnStart", true);
	 }

	 } 

}
