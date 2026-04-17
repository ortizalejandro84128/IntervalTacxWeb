class EntrenamientoDialog extends Dialog {
  constructor(mainApp) {
    super({
      id: "entrenamientoDialog",
      width: 330,
      height: 220,
      texto: "Entrenamiento ERG Web"

    });
    this.crearInterfaz();
    this.fnCerrar=
    this.monitorHR=false;
    this.currentHR=0;
    this.mainApp=mainApp;
    this.factorPantalla=.9;

    this.heartRateMonitor=new HeartRateMonitor(this, this.recibeMonitorHR.bind(this));

    this.temporizador = new Temporizador();
    this.temporizador.init();

    this.pause=false;

  }

crearInterfaz() {
  // Título
  this.addChildLabel({
    id: "lblTitulo", top: 0, left: 5, width: 190, height: 7,
    texto: "Control rodillo + HR", fontSize: "6px", fontWeight: "bold"
  });

  // Botones en horizontal
  this.addChildBoton({ id: "btnRodillo", top: 17, left: 5, width: 36, height: 10, texto: "Rodillo", fn: this.procesaTick.bind(this) });
  this.addChildBoton({ id: "btnHR", top: 17, left: 43, width: 48, height: 10, texto: "HR", fn: this.conectaMonitorHR.bind(this) });
  this.addChildBoton({ id: "btnStart", top: 17, left: 94, width: 43, height: 10, texto: "Start" });
  this.addChildBoton({ id: "btnTCX", top: 17, left: 139, width: 36, height: 10, texto: "TCX" });

  // Input de archivo
  this.addChildFileInput({ id: "ergFile", top: 17, left: 180, width: 72, height: 7, accept: ".erg2", fn: this.onCargaErg.bind(this) });

  // Encabezados de la tabla
  this.addChildLabel({ id: "lblTimeHead", top: 36, left: 5, width: 48, height: 10, texto: "Tiempo", fontSize: "6px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblHRHead", top: 36, left: 53, width: 48, height: 10, texto: "HR", fontSize: "6px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblWattsObjHead", top: 36, left: 101, width: 48, height: 10, texto: "Obj W", fontSize: "6px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblWattsHead", top: 36, left: 149, width: 48, height: 10, texto: "Pot W", fontSize: "6px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblCadenceHead", top: 36, left: 197, width: 48, height: 10, texto: "Cad", fontSize: "6px", fontWeight: "bold" });
  this.addChildLabel({ id: "lblSpeedHead", top: 36, left: 245, width: 48, height: 10, texto: "Vel", fontSize: "6px", fontWeight: "bold" });

  // Valores dinámicos
  this.addChildLabel({ id: "timeCell", top: 48, left: 5, width: 48, height: 10, texto: "--", fontSize: "7px", color: "red" });
  this.addChildLabel({ id: "hrValue", top: 48, left: 53, width: 48, height: 10, texto: "--", fontSize: "7px", color: "green" });
  this.addChildLabel({ id: "wattsObjCell", top: 48, left: 101, width: 48, height: 10, texto: "--", fontSize: "7px", color: "brown" });
  this.addChildLabel({ id: "wattsCell", top: 48, left: 149, width: 48, height: 10, texto: "--", fontSize: "7px", color: "red" });
  this.addChildLabel({ id: "cadenceCell", top: 48, left: 197, width: 48, height: 10, texto: "--", fontSize: "7px", color: "green" });
  this.addChildLabel({ id: "speedCell", top: 48, left: 245, width: 48, height: 10, texto: "--", fontSize: "7px", color: "brown" });

  // Timeline reducido
  const workoutDemo = {
    dominantZone: "endurance",
    segments: [[5, 50, "50"], [15, 65, "65"], [5, 105, "50"]],
    workoutName: "Demo"
  };

  this.timelineControl = new IntervalControl({
    id: "intervalDemo",
    top: 70, left: 10, width: 305, height: 120,
    workout: workoutDemo, ftp: 200,
    fnIniciaSegmento: this.cambiaSegmento.bind(this),
    fnFinActividad: this.fnFinActividad.bind(this)
  });

  this.agregarHijo(this.timelineControl);

  this.setChildEnabled("btnStart", false);
  this.setChildEnabled("btnTCX", false);
}


  crearInterfaz___res() {
    // Título
    this.addChildLabel({ id: "lblTitulo", top: 10 , left: 20, width: 800, height: 30, texto: "Control de rodillo + monitor cardíaco" , fontSize: "30px", color: "black", fontWeight: "bold" });

    // Botones en horizontal
    this.addChildBoton({ id: "btnRodillo", top: 70, left: 20, width: 150, height: 40, texto: "Conectar rodillo", fn: this.procesaTick.bind(this) });
    this.addChildBoton({ id: "btnHR", top: 70, left: 180, width: 200, height: 40, texto: "Conectar monitor HR" , fn: this.conectaMonitorHR.bind(this)});
    this.addChildBoton({ id: "btnStart", top: 70, left: 390, width: 180, height: 40, texto: "Iniciar entrenamiento" });
    this.addChildBoton({ id: "btnTCX", top: 70, left: 580, width: 150, height: 40, texto: "Descargar TCX" });

    // Input de archivo
    this.addChildFileInput({ id: "ergFile", top: 70, left: 750, width: 300, height: 30, accept: ".erg2", fn: this.onCargaErg.bind(this) });

    // Encabezados de la tabla
this.addChildLabel({ id: "lblTimeHead", top: 150, left: 20, width: 200, height: 40, texto: "Tiempo", fontSize: "22px", color: "black", fontWeight: "bold" });
this.addChildLabel({ id: "lblHRHead", top: 150, left: 220, width: 200, height: 40, texto: "HR (bpm)", fontSize: "22px", color: "black", fontWeight: "bold" });
this.addChildLabel({ id: "lblWattsObjHead", top: 150, left: 420, width: 200, height: 40, texto: "P Objetivo (W)", fontSize: "22px", color: "black", fontWeight: "bold" });
this.addChildLabel({ id: "lblWattsHead", top: 150, left: 620, width: 200, height: 40, texto: "Potencia (W)", fontSize: "22px", color: "black", fontWeight: "bold" });
this.addChildLabel({ id: "lblCadenceHead", top: 150, left: 820, width: 200, height: 40, texto: "Cadencia (rpm)", fontSize: "22px", color: "black", fontWeight: "bold" });
this.addChildLabel({ id: "lblSpeedHead", top: 150, left: 1020, width: 200, height: 40, texto: "Velocidad (km/h)", fontSize: "22px", color: "black", fontWeight: "bold" });

    // Valores dinámicos
this.addChildLabel({ id: "timeCell", top: 200, left: 20, width: 200, height: 40, texto: "--", fontSize: "24px", color: "red" });
this.addChildLabel({ id: "hrValue", top: 200, left: 220, width: 200, height: 40, texto: "--", fontSize: "24px", color: "green" });
this.addChildLabel({ id: "wattsObjCell", top: 200, left: 420, width: 200, height: 40, texto: "--", fontSize: "24px", color: "brown" });
this.addChildLabel({ id: "wattsCell", top: 200, left: 620, width: 200, height: 40, texto: "--", fontSize: "24px", color: "red" });
this.addChildLabel({ id: "cadenceCell", top: 200, left: 820, width: 200, height: 40, texto: "--", fontSize: "24px", color: "green" });
this.addChildLabel({ id: "speedCell", top: 200, left: 1020, width: 200, height: 40, texto: "--", fontSize: "24px", color: "brown" });
   

  const workoutDemo = {
  "dominantZone": "endurance",
  "segments": [
    [5, 50, "50"],
    [15, 65, "65"],
    [5, 105, "50"]
  ],
  "workoutName": "Entrenamiento Demo"
};

// Instancia de la clase
this.timelineControl = new IntervalControl({
  id: "intervalDemo",
  top: 300,
  left: 50,
  width: 1150,
  height: 400,
  app: null,        // si tienes un objeto app, pásalo aquí
  workout: workoutDemo,
  ftp:200,
  fnIniciaSegmento: this.cambiaSegmento.bind(this),
  fnFinActividad: this.fnFinActividad.bind(this)
});

    this.agregarHijo(this.timelineControl);




    this.setChildEnabled("btnStart", false);
    this.setChildEnabled("btnTCX", false);

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

  conectaMonitorHR() {
     this.heartRateMonitor.connect();
	 } 

  recibeMonitorHR(value) {
     this.getChildById("hrValue").actualizarTexto(value+" Bpm")
     this.procesaTick();
   } 

  recibePotencia(value) {
     this.getChildById("wattsCell").actualizarTexto(value+" W")
//     this.procesaTick();
   } 
  recibeVelocidadCad(velocidad, cadencia) {
     this.getChildById("speedCell").actualizarTexto(velocidad+" Km/h")
     this.getChildById("cadenceCell").actualizarTexto(cadencia+" rpm")
//     this.procesaTick();
   } 


  procesaTick() {
    if(!this.pause){
     this.timelineControl.tick();
     this.temporizador.tick();
     this.getChildById("timeCell").actualizarTexto(this.temporizador.getTimeTemporizador())
    }
//     this.getChildById("ergFile").hide();
     //this.mainApp.showDialog("usuarioDialog");
	 } 

  cambiaSegmento(current, interval) {
    this.getChildById("wattsObjCell").actualizarTexto(interval+" W")

    //aqui enviar potencia objetovo al rodillo
	 } 

   fnFinActividad() {
    this.showAlert("Actividad finalizada");
    //const usu= new UsuarioDialogModal(this.mainApp, this.cerrarUsuarioDialogModal.bind(this)) ;
    //usu.mostrar();
    //aqui enviar potencia objetovo al rodillo
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
