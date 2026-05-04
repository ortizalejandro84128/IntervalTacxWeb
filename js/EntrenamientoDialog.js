class EntrenamientoDialog extends Dialog {
  constructor(mainApp,testMode=false) {
    super({
      id: "entrenamientoDialog",
      width: 450,
      height: 650,
      texto: "Entrenamiento ERG Web"

    });

    this.testMode=testMode
    this.rodillo=false;
    this.currentHR=0;
    this.mainApp=mainApp;
   
    this.cadenciaActual=60;
    this.potenciaActual=[]; 
    this.potObjetivo=50; 
    //this.ftp=180;
    
    if(this.testMode){
    this.workout = {
    dominantZone: "Endurance",
    segments: [[1, 50, 50], [1, 65, 65], [1, 105, 105]],
    workoutName: "Entrenamiento Demo"
    };

    } else{
    this.workout = {
    dominantZone: "Endurance",
    segments: [[5, 50, 50], [15, 65, 65], [5, 105, 105]],
    workoutName: "Entrenamiento Demo"
  };

    }


    this.heartRateMonitor=new HeartRateMonitor(this, this.recibeMonitorHR.bind(this));
    this.trainer = new TacxTrainer(this); 

    this.temporizador = new Temporizador();
    this.temporizador.init();
    this.pause=true;
    this.entrenamiento=[];

    if(this.testMode){
    this.timerGrabacion = setInterval(this.procesaTick.bind(this), 50);
    }else{
    this.timerGrabacion = setInterval(this.procesaTick.bind(this), 1000);
    }
    this.fechaBase= new Date();
    this.fechaIni= this.fechaBase.toISOString();
    this.simulador= new SimuladorRodillo(this);

    this.notificationManager= new NotificationManager();
    
    this.baseEntrenoModal= new  BaseEntrenoModal(this, "Umbral",this.onCargaErg.bind(this));
    this.crearControles();
  }



crearControles() {
 //this.addChildBoton({ id: "btnTitulo", texto: "Simulador ERG, Con Rodillo TACX FLOW", color:"info" });
  // Botones
  this.addChildBoton({ id: "btnRodillo", texto: "Tacx", fn: this.conectarRodillo.bind(this) });
  this.addChildBoton({ id: "btnHR", texto: "HR", fn: this.conectaMonitorHR.bind(this) });
  this.addChildBoton({ id: "btnStart", color: "success", texto:"Iniciar", fn:this.iniciActividad.bind(this)});
  this.addChildBoton({ id: "btnPausa", color: "info", texto: "Pausa", fn:this.pauseActividad.bind(this)});
  this.addChildBoton({ id: "btnDetener", color: "danger", texto: "Stop", fn:this.detenerActividad.bind(this)});
  //this.addChildBoton({ id: "btnTCX", texto: "TCX", iconoSVG:ImagesSvgRepo.DOWNLOAD});
  this.addChildBoton({ id: "btnTCX", texto: "TCX", fn:this.descargaTCXFile.bind(this)});

  // Input de archivo
 // this.addChildFileInput({ id: "ergFile", accept: ".erg2", fn: this.onCargaErg.bind(this) });
 this.addChildBoton({ id: "ergFile", texto: "ERG", fn: this.onSeleccionaEntrenamiento.bind(this) });

  // Encabezados de la tabla
// Encabezados: Usamos el color de texto estándar (que cambia de negro a blanco automáticamente)
this.addChildLabel({ id: "lblTimeHead", texto: "Tiempo", fontSize: "24px", fontWeight: "bold", color: "var(--bs-body-color)" });
this.addChildLabel({ id: "lblHRHead", texto: "HR", fontSize: "24px", fontWeight: "bold", color: "var(--bs-body-color)" });
this.addChildLabel({ id: "lblWattsObjHead", texto: "Obj W", fontSize: "24px", fontWeight: "bold", color: "var(--bs-body-color)" });
this.addChildLabel({ id: "lblWattsHead", texto: "Pot W", fontSize: "24px", fontWeight: "bold", color: "var(--bs-body-color)" });
this.addChildLabel({ id: "lblCadenceHead", texto: "Cad", fontSize: "24px", fontWeight: "bold", color: "var(--bs-body-color)" });
this.addChildLabel({ id: "lblSpeedHead", texto: "Vel", fontSize: "24px", fontWeight: "bold", color: "var(--bs-body-color)" });

// Valores dinámicos: Usamos variables semánticas de Bootstrap
this.addChildLabel({ id: "timeCell", texto: "--", fontSize: "24px", fontWeight: "bold", color: "var(--bs-danger)", align: "center" }); // Rojo
this.addChildLabel({ id: "hrValue", texto: "--", fontSize: "24px", fontWeight: "bold", color: "var(--bs-success)", align: "center" }); // Verde
this.addChildLabel({ id: "wattsObjCell", texto: "--", fontSize: "24px", fontWeight: "bold", color: "var(--bs-info)", align: "center" });   // Cian/Azul claro (sustituye al marrón para mejor contraste)
this.addChildLabel({ id: "wattsCell", texto: "--", fontSize: "24px", fontWeight: "bold", color: "var(--bs-danger)", align: "center" });   // Rojo
this.addChildLabel({ id: "cadenceCell", texto: "--", fontSize: "24px", fontWeight: "bold", color: "var(--bs-success)", align: "center" }); // Verde
this.addChildLabel({ id: "speedCell", texto: "--", fontSize: "24px", fontWeight: "bold", color: "var(--bs-warning)", align: "center" });  // Naranja/Amarillo (mejor visibilidad en oscuro que el marrón)
  // Timeline
  

  this.timelineControl = new IntervalControl({
    id: "intervalDemo",
    workout: this.workout,
    //ftp: this.ftp,
    fnIniciaSegmento: this.cambiaSegmento.bind(this),
    fnFinActividad: this.fnFinActividad.bind(this)
  });

  this.agregarHijo(this.timelineControl);

  // Estado inicial de botones
     this.setChildEnabled("btnStart", false);
     
     this.getChildById("btnTCX").hide();
     this.getChildById("btnPausa").hide();
     this.getChildById("btnDetener").hide();
}






getBoundsHorizontal(){

  const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight;

  return {width:availableWidth, height:availableHeight}
}

getLayoutHorizontal(){


let pos= [

  
   // { id: "btnTitulo", top: 0, left: 10,  width: 120, height: 40 },

  // Fila 1: Botones (todos al mismo top = 60)
  { id: "btnRodillo", top: 60, left: 10,  width: 120, height: 40 },
  { id: "btnHR",      top: 60, left: 140, width: 120, height: 40 },
  { id: "btnStart",   top: 60, left: 270, width: 120, height: 40 },
  { id: "ergFile",     top: 60, left: 400, width: 120, height: 40 },
  { id: "btnPausa",   top: 60, left: 270, width: 120, height: 40 },
  { id: "btnDetener", top: 60, left: 400, width: 120, height: 40 },
  { id: "btnTCX",    top: 60, left: 530, width: 100, height: 40 },

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
  { id: "speedCell",    top: 140, left: 560, width: 100,  height: 30 },

  // Fila 4: Timeline ocupa todo el ancho y el mayor espacio posible
  { id: "intervalDemo", top: 175, left: 10, width: 630, height: 360 }
];

let filaPct= [ 10, 9, 12,66];

let bounds=this.getBoundsHorizontal();
return this.procesarLayoutPorcentual(bounds.width,bounds.height,pos,filaPct);


}


getBoundsVertical(){
    const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight;

     return {width:availableWidth, height:availableHeight}
}

getLayoutVertical() {
  let pos= [
    //    { id: "btnTitulo", top: 0, left: 10,  width: 120, height: 40 },


    // Fila 1: 3 botones (Height aumentado a 60)
    { id: "btnRodillo", top: 60, left: 5,   width: 159, height: 60 },
    { id: "btnHR",      top: 60, left: 165, width: 159, height: 60 },
    { id: "btnStart",   top: 60, left: 325, width: 100, height: 60 },
    { id: "btnPausa",   top: 60, left: 325, width: 100, height: 60 },

    // Fila 2: 2 botones (Height 60, empieza en Top 130 para dejar margen de 10px)
    { id: "ergFile",     top: 130, left: 5,   width: 159, height: 60 },
    { id: "btnDetener", top: 130, left: 5,   width: 159, height: 60 },
    { id: "btnTCX",    top: 130, left: 165, width: 159, height: 60 },

    // Fila 3: Encabezados (Empieza en 205: 130 + 60 + 15 de margen)
    { id: "lblTimeHead",     top: 205, left: 5,   width: 150, height: 30 },
    { id: "lblWattsHead",       top: 205, left: 165, width: 150, height: 30 },
    { id: "lblWattsObjHead", top: 205, left: 325, width: 100, height: 30 },

    // Fila 4: Datos dinámicos (Justo debajo: 205 + 30 + 5 de margen interno)
    { id: "timeCell",     top: 240, left: 5,   width: 150, height: 30 },
    { id: "wattsCell",      top: 240, left: 165, width: 150, height: 30 },
    { id: "wattsObjCell", top: 240, left: 325, width: 100, height: 30 },

    // Fila 5: Encabezados (Siguiente bloque: 240 + 30 + 15 de margen)
    { id: "lblHRHead",   top: 285, left: 5,   width: 150, height: 30 },
    { id: "lblCadenceHead", top: 285, left: 165, width: 150, height: 30 },
    { id: "lblSpeedHead",   top: 285, left: 325, width: 100, height: 30 },

    // Fila 6: Datos dinámicos (285 + 30 + 5)
    { id: "hrValue",   top: 320, left: 5,   width: 150, height: 30 },
    { id: "cadenceCell", top: 320, left: 165, width: 150, height: 30 },
    { id: "speedCell",   top: 320, left: 325, width: 150, height: 30 },

    // Fila 7: Timeline (Debajo de todo: 320 + 30 + 20 de margen para destacar el gráfico)
    { id: "intervalDemo", top: 370, left: 5, width: 440, height: 450 }
  ];

  let filaPct= [ 10, 8, 7,10,7,10,48];
  let bounds=this.getBoundsVertical();
return this.procesarLayoutPorcentual(bounds.width,bounds.height,pos,filaPct);

}

    onSeleccionaEntrenamiento() {
      this.baseEntrenoModal.refresh(); 
      this.baseEntrenoModal.mostrar();



  }
  

  onCargaErg(fileName, contenido) {
    
    try {
      if (typeof contenido === 'string') {
          this.workout=JSON.parse(contenido);
        }else{
          this.workout=contenido;
        }        
      
      this.timelineControl.setIntervalsFromWorkout(this.workout);
      this.timelineControl.reset();
      console.log(JSON.stringify(this.workout));
    } catch (error) {
      console.error("Error al parsear el archivo como JSON:", error);
    }
  }


  conectarRodillo() {
   if (this.testMode){
      this.simulador.iniciar()
   }else{
      this.trainer.connect();
   }
   
  }

  conectaMonitorHR() {
     this.heartRateMonitor.connect();
	 } 

  recibeMonitorHR(value) {
    this.validarEntreno();
    this.getChildById("hrValue").actualizarTexto(value)
   } 

recibePotencia(value) {
   this.validarEntreno();
   this.rodillo=true;
   this.getChildById("wattsCell").actualizarTexto(value + "w");
  }

  recibeVelocidad(value) {
    this.getChildById("speedCell").actualizarTexto(value );
  }

  recibeCadencia(value) {
    this.cadenciaActual=value;
    this.getChildById("cadenceCell").actualizarTexto(value + "rpm");
  }


ajustarPotencia(rampa) {
    if (!rampa || rampa.length === 0) {
        return;
    }
    const vatios = rampa.shift();

    if (vatios > 0) {
        this.trainer.setTargetPower(vatios);
        this.getChildById("wattsObjCell").actualizarTexto(vatios+"w")
        this.potObjetivo=vatios;
    } 
}

  pauseActividad(){
     this.pause=!this.pause;
  if(this.pause){
      this.temporizador.pause();
  } else {
      this.temporizador.resume();
  }
  } 

  detenerActividad(){
    this.ajustarPotencia([60]);
    this.timelineControl.setEstatusActividad(false); 
    this.simulador.detener();
    this.pause=true;

     this.getChildById("btnPausa").hide();
     this.getChildById("btnDetener").hide();
     this.getChildById("btnTCX").show();
     this.getChildById("ergFile").show();
     this.getChildById("btnStart").show();
  } 



  iniciActividad(){
    this.ajustarPotencia([60]);

    this.timelineControl.reset();
    this.timelineControl.setEstatusActividad(true); 
    this.entrenamiento=[];
    this.fechaBase= new Date();
    this.fechaIni= this.fechaBase.toISOString();
    this.temporizador.init();
    this.pause=false;

     this.getChildById("ergFile").hide();
     this.getChildById("btnStart").hide();
     this.getChildById("btnTCX").hide();
     this.getChildById("btnPausa").show();
     this.getChildById("btnDetener").show();
     this.notificationManager.show(ICONS.START, "¡Iniciando!");
  } 


  procesaTick() {
    if(!this.pause){
    this.ajustarPotencia(this.potenciaActual);
     const ms = this.fechaBase.getTime();
     this.fechaBase.setTime(ms + 1000);
     this.timelineControl.tick();
     this.temporizador.tick();
     this.getChildById("timeCell").actualizarTexto(this.temporizador.getTimeTemporizador())
     const data=this.getForm()
     data.timeTick = this.fechaBase.toISOString();
     this.entrenamiento.push(data);
    }
	 } 

cambiaSegmento(potInicial, potAnterior, ftp, potFinal, duracion, label) {
    // Generamos el segmento
    const nuevoSegmento = PowerUtils.generaSiguienteSegmento(        duracion,         potAnterior,         potInicial,         potFinal,         ftp,         this.cadenciaActual    );
    var labelB="";
    if(potInicial!=potFinal){
        labelB=duracion+"Min "+potInicial+"->"+potFinal+"W"
    }else{
        labelB=duracion+"Min "+potInicial+"W"
    }
    this.notificationManager.show(ICONS.NEXT, label+"<br><br>"+labelB);
    const nuevoArr = [0, 0, ...nuevoSegmento];
    this.potenciaActual = nuevoArr;
}
descargaTCXFile() {
    const tcxString = TcxExport.jsonToTcxStrava(this.entrenamiento);
    const blob = new Blob([tcxString], { type: 'application/tcx+xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `${this.timelineControl.workout.workoutName}_${fecha}.tcx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
   


   fnFinActividad() {
    this.ajustarPotencia([60]);
    this.simulador.detener();

//    this.showAlert("Actividad finalizada  duracion :" +this.temporizador.getTimeTemporizador());
    this.resumenModal=new ResumenEntrenamientoModal(this,this.timelineControl.workout,this.entrenamiento);
    this.resumenModal.mostrar();

    this.timelineControl.setEstatusActividad(false); 
    this.pause=true;
    this.getChildById("btnPausa").hide();
    this.getChildById("btnDetener").hide();
    this.getChildById("ergFile").show();
    this.getChildById("btnStart").show();
    this.getChildById("btnTCX").show();
	 } 

  cerrarUsuarioDialogModal(data) {
     this.showAlert (JSON.stringify(data, null, 2));
   } 

  validarEntreno() {
		 if(this.rodillo){
           this.setChildEnabled("btnStart", true);
	     }

	 } 
  }


class SimuladorRodillo {
  constructor(contextoApp) {
    this.app = contextoApp;
    this.timerSimulador = null;
    
    // Valores iniciales para empezar la transición
    this.currentPotencia = 95;
    this.currentVelocidad = 22.5;
    this.currentCadencia = 85;

    // Factor de suavizado (0.1 = lento/suave, 0.8 = rápido/brusco)
    this.smoothFactor = 0.15; 
  }

  iniciar() {
    console.log("Simulador suavizado iniciado... 🚴‍♂️");
    this.timerSimulador = setInterval(() => {
      
      // 1. Definimos un "objetivo" aleatorio dentro de tus rangos
      const targetPotencia = Math.random() * (100 - 90) + 90;
      const targetVelocidad = Math.random() * (25 - 20) + 20;
      const targetCadencia = Math.random() * (90 - 80) + 80;

      // 2. Aplicamos la fórmula de suavizado: 
      // ValorActual = ValorActual + (Target - ValorActual) * Factor
      this.currentPotencia += (this.app.potObjetivo+30 - this.currentPotencia) * this.smoothFactor;
      this.currentVelocidad += (targetVelocidad - this.currentVelocidad) * this.smoothFactor;
      this.currentCadencia += (targetCadencia - this.currentCadencia) * this.smoothFactor;

      // 3. Enviamos los datos redondeados a la App
      this.app.recibePotencia(Math.round(this.currentPotencia));
      this.app.recibeVelocidad(this.currentVelocidad.toFixed(1));
      this.app.recibeCadencia(Math.round(this.currentCadencia));

    }, 400);
  }

  detener() {
    if (this.timerSimulador) {
      clearInterval(this.timerSimulador);
      console.log("Simulador detenido.");
    }
  }
}