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
    
    this.fnCerrar=
    this.monitorHR=false;
    this.currentHR=0;
    this.mainApp=mainApp;
    this.factorPantalla=1.0;

    this.heartRateMonitor=new HeartRateMonitor(this, this.recibeMonitorHR.bind(this));

    this.temporizador = new Temporizador();
    this.temporizador.init();

    this.pause=false;

  }

crearControles() {
  // Título
  this.addChildLabel({ id: "lblTitulo", texto: "Control rodillo + HR", fontSize: "30px", fontWeight: "bold" });

  // Botones
  this.addChildBoton({ id: "btnRodillo", texto: "Tacx", fn: this.procesaTick.bind(this) });
  this.addChildBoton({ id: "btnHR", texto: "HR", fn: this.conectaMonitorHR.bind(this) });
  this.addChildBoton({ id: "btnStart", color: "success", iconoSVG: ImagesSvgRepo.PLAY });
  //this.addChildBoton({ id: "btnStart", color: "success", texto: ">" });
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
    workoutName: "Demo"
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
}



escalarLayout(layout, factor) {
  return layout.map(item => ({
    id: item.id,
    top: item.top * factor,
    left: item.left * factor,
    width: item.width * factor,
    height: item.height * factor
  }));
}

aplicarLayout(layout) {
  for (const item of layout) {
    //const ctrl = this.getChildById(item.id);
    //if (ctrl) {
    //setBounds(id, top, left, width, height)
      this.setBounds(item.id, item.top, item.left, item.width, item.height);
    //}
  }

}


aplicarLayoutHorizontal() {
  this.width = 650;
  this.height = 480;

const layoutHorizontal = [
  // Fila 0: Encabezado/Título (centrado)
  { id: "lblTitulo", top: 10, left: 10, width: 600, height: 30 },

  // Fila 1: Botones (todos al mismo top = 60)
  { id: "btnRodillo", top: 70, left: 10,  width: 120, height: 30 },
  { id: "btnHR",      top: 70, left: 140, width: 120, height: 30 },
  { id: "btnStart",   top: 70, left: 270, width: 120, height: 30 },
  { id: "btnTCX",     top: 70, left: 400, width: 120, height: 30 },
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
  { id: "intervalDemo", top: 175, left: 10, width: 630, height: 280 }
];

    this.aplicarLayout(layoutHorizontal);
}



aplicarLayoutVertical() {
  this.width = 460;
  this.height = 640;


const layoutVertical = [
  // Fila 0: Encabezado/Título
  { id: "lblTitulo", top: 10, left: 5, width: 400, height: 30 },

  // Fila 1: 3 botones
  { id: "btnRodillo", top: 60, left: 5,  width: 159, height: 45 },
  { id: "btnHR",      top: 60, left: 165, width: 159, height: 45 },
  { id: "btnStart",   top: 60, left: 325, width: 100, height: 45 },

  // Fila 2: 2 botones
  { id: "btnTCX",  top: 110, left: 5,  width: 159, height: 45 },
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
  { id: "intervalDemo", top: 320, left: 5, width: 440, height: 300 }
];


  this.aplicarLayout(layoutVertical);

}






setBounds(id, top, left, width, height) {
  const ctrl = this.getChildById(id);
  if (!ctrl) return;

  // Guardar coordenadas en el objeto
  ctrl.top = top;
  ctrl.left = left;
  ctrl.width = width;
  ctrl.height = height;

  // Aplicar al DOM usando la referencia correcta
  if (ctrl.elemento) {
    ctrl.elemento.style.position = "absolute"; // importante
    ctrl.elemento.style.top = top + "px";
    ctrl.elemento.style.left = left + "px";
    ctrl.elemento.style.width = width + "px";
    ctrl.elemento.style.height = height + "px";
  }

  if (ctrl instanceof IntervalControl){
    console.log("render de interval control");
    ctrl.render();
  }

  
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
    this.resize();
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
