class BaseEntrenoModal extends DialogModal {
  constructor(mainApp, tipoInicial, fnCerrar) {
    super({ id: "entrenamientosDialogModal", width: 400, height: 700, titulo: "Seleccionar Entrenamiento" });
    this.mainApp = mainApp;
    this.fnCerrar = fnCerrar;
    
    this.generadores = {
      "VO2": new Vo2Generator(this.getNivel()),
      "Umbral": new UmbralGenerator(this.getNivel()),
      "Sat": new WeekendGenerator(this.getNivel())
    };

    this.tipoSeleccionado = tipoInicial || "VO2";
    this.generator = this.generadores[this.tipoSeleccionado];
    this.gridContainer = []; 
    this.archivoCargado = null; // Almacena el workout del archivo para la previsualización

    this.crearInterfaz();
  }

  getNivel() {
    let ftp = localStorage.getItem("user_ftp") || 180;
    let base = ftp >= 180 ? 72 : 55;
    return NivelUtil.calcularFactorNivel(base, ftp);
  }

  crearInterfaz() {
    const anchoModal = 430;
    const anchoComponente = anchoModal * 0.85;
    const margenIzquierdo = 10;

    const btnCerrarX = new Boton({
      id: "btnCerrarModal",
      top: 10, left: anchoModal - 100, width: 30, height: 30,
      texto: "X", fn: () => this.cerrar()
    });
    this.agregarHijo(btnCerrarX);

    const tipos = ["VO2", "Umbral", "Sat", "File"];
    const anchoTab = anchoComponente / tipos.length;
    
    tipos.forEach((tipo, index) => {
      const btnTab = new Boton({
        id: `btnTab_${tipo}`,
        top: 50,
        left: margenIzquierdo + (index * anchoTab),
        width: anchoTab - 4,
        height: 35,
        texto: tipo,
        fontSize: 30,
        fn: () => this.cambiarTipo(tipo)
      });
      this.agregarHijo(btnTab);
    });

    this.renderContenido();
  }

  renderContenido() {
    if (this.tipoSeleccionado === "File") {
      this.renderFilePanel();
    } else {
      this.renderGrid();
    }
  }

  renderFilePanel() {
    const anchoModal = 430;
    const anchoCard = anchoModal * 0.85;
    const x = 10;
    const yBase = 120;

    // Si hay archivo cargado
    if (this.archivoCargado) {
         // SI hay archivo, mostrar previsualización similar al grid
      const tss = TSSCalculator.calcularDesdeSegmentos(this.archivoCargado.segments);

      const lblTitulo = new Label({
        id: "lblFileTitulo",
        top: yBase-20, left: x + 8, width: anchoCard - 16, height: 20,
        texto: `${this.archivoCargado.workoutName}`, fontSize: 13, bold: true
      });
       
      
      let duration=ZonaUtils.calcularDuracionTotal(this.archivoCargado); 
      const lblInfo = new Label({
        id: "lblFileInfo",
        top: yBase + 25, left: x + 8, width: anchoCard - 16, height: 18,
        texto: `${duration} min | TSS: ${tss}`, fontSize: 10
      });

      const miniView = new WorkoutMini({
        id: "fileMiniView",
        top: yBase + 50, left: x + 8, width: anchoCard - 16, height: 120,
        workout: this.archivoCargado,
      });

      const btnConfirmar = new Boton({
        id: "btnConfirmarFile",
        top: yBase + 185, left: x, width: anchoCard, height: 40,
        texto: "Cargar ",
        fn: () => {
          if (this.fnCerrar) this.fnCerrar("file", this.archivoCargado);
          this.cerrar();
        }
      });


      this.agregarComponenteAlGrid(lblTitulo);
      this.agregarComponenteAlGrid(lblInfo);
      this.agregarComponenteAlGrid(miniView);
      this.agregarComponenteAlGrid(btnConfirmar);
 
    } 
 
      const btnFile = new FileInput({
        id: "fileInputControl",
        top: yBase + 235, left: x, width: anchoCard, height: 120,
        texto: "Seleccionar archivo .erg2",
        fn: (fileName, workoutData) => {
          console.log(workoutData); 
          this.archivoCargado = JSON.parse( workoutData);
          this.refresh(); // Refrescamos para mostrar la previsualización
        }
      });
      this.agregarComponenteAlGrid(btnFile);
 
    
  }

  renderGrid() {
    const anchoModal = 400;
    const anchoCard = anchoModal * 0.85;
    const x = (anchoModal - anchoCard) / 2; 
    const offsetTop = 100; 
    const cardHeight = 195; 
    
    for (let i = 1; i <= 6; i++) {
      const wk = this.generator.generate(i, this.getNivel());
      const tss = TSSCalculator.calcularDesdeSegmentos(wk.segments);
      const y = offsetTop + ((i - 1) * (cardHeight + 15));

      let duration=ZonaUtils.calcularDuracionTotal(wk); 

      const comps = [
        new Label({ id: `lblWk_${i}`, top: y + 8, left: x + 8, width: anchoCard - 16, height: 20, texto: wk.workoutName, fontSize: 13, bold: true }),
        new Label({ id: `lblInfo_${i}`, top: y + 30, left: x + 8, width: anchoCard - 16, height: 18, texto: `${duration} min | TSS: ${tss}`, fontSize: 10 }),
        new WorkoutMini({ id: `mini_${i}`, top: y + 52, left: x + 8, width: anchoCard - 16, height: 80, workout: wk }),
        new Boton({
          id: `btnSel_${i}`, top: y + 145, left: x + (anchoCard * 0.05), width: anchoCard * 0.9, height: 35,
          texto: `S${i} - Tss: ${tss}`, fontSize: 12,
          fn: () => {
            if (this.fnCerrar) this.fnCerrar("file", wk);
            this.cerrar();
          }
        })
      ];
      comps.forEach(c => this.agregarComponenteAlGrid(c));
    }
  }

  // Helper para mantener limpio el array de hijos
  agregarComponenteAlGrid(comp) {
    this.agregarHijo(comp);
    this.gridContainer.push(comp);
  }

  cambiarTipo(nuevoTipo) {
    this.tipoSeleccionado = nuevoTipo;
    this.generator = this.generadores[nuevoTipo] || null;
    // Si cambiamos de tab, reiniciamos la previsualización del archivo
    if (nuevoTipo !== "File") this.archivoCargado = null; 
    this.refresh();
  }

  refresh() {
    this.limpiarGrid();
    this.renderContenido();
  }

  limpiarGrid() {
    this.gridContainer.forEach(componente => {
      if (componente.elemento && componente.elemento.parentNode) {
        componente.elemento.parentNode.removeChild(componente.elemento);
      }
      this.hijos = this.hijos.filter(h => h !== componente);
    });
    this.gridContainer = [];
  }
}