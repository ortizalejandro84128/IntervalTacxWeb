class BaseEntrenoModal extends DialogModal {
  constructor(mainApp, tipoInicial, fnCerrar) {
    super({ id: "entrenamientosDialogModal", width: 400, height: 700, titulo: "Seleccionar Entrenamiento" });
    this.mainApp = mainApp;
    this.fnCerrar = fnCerrar;
    
    // 1. Recuperar nivel guardado o usar 6 por defecto
    const nivelGuardado = localStorage.getItem("selected_training_level");
    this.nivelManual = nivelGuardado ? parseInt(nivelGuardado) : 6;

    this.tipoSeleccionado = tipoInicial || "VO2";
    this.gridContainer = []; 
    this.archivoCargado = null; 

    this.actualizarGeneradores();
    this.crearInterfaz();
  }

  // Mantenemos este método por si necesitas el cálculo original en otro punto,
  // pero ya no dicta el valor inicial del modal.
  getNivelInicial() {
    let ftp = localStorage.getItem("user_ftp") || 180;
    let base = ftp >= 180 ? 72 : 55;
    return NivelUtil.calcularFactorNivel(base, ftp);
  }

  actualizarGeneradores() {
    this.generadores = {
      "VO2": new Vo2Generator(this.nivelManual),
      "Umbral": new UmbralGenerator(this.nivelManual),
      "Sat": new WeekendGenerator(this.nivelManual)
    };
    this.generator = this.generadores[this.tipoSeleccionado];
  }

  crearInterfaz() {
    const anchoModal = 430;
    const anchoComponente = anchoModal * 0.85;
    const margenIzquierdo = 10;

    const fontSizeBot=15;

    // Botón Cerrar (X)
    this.agregarHijo(new Boton({
      id: "btnCerrarModal",
      top: 10, left: anchoModal - 100, width: 30, height: 30, fontSize: fontSizeBot,
      texto: "X", fn: () => this.cerrar()
    }));

    // Selector de Nivel Manual (Stepper)
    const yCtrl = 10;
    const xCtrl = 15;

    this.agregarHijo(new Boton({
      id: "btnNivelDown", top: yCtrl, left: xCtrl, width: 35, height: 35, fontSize: fontSizeBot,
      texto: "-", color: "danger", fn: () => this.cambiarNivelManual(-1)
    }));

    this.lblNivelValue = new Label({
      id: "lblNivelValue", top: yCtrl + 5, left: xCtrl + 40, width: 60, height: 30,
      texto: `Lvl ${this.nivelManual}`, fontSize: 14, bold: true, align: "center"
    });
    this.agregarHijo(this.lblNivelValue);

    this.agregarHijo(new Boton({
      id: "btnNivelUp", top: yCtrl, left: xCtrl + 105, width: 35, height: 35, fontSize: fontSizeBot,
      texto: "+", color: "success", fn: () => this.cambiarNivelManual(1)
    }));

    // Tabs de navegación
    const tipos = ["VO2", "Umbral", "Sat", "File"];
    const anchoTab = anchoComponente / tipos.length;
    
    tipos.forEach((tipo, index) => {
      this.agregarHijo(new Boton({
        id: `btnTab_${tipo}`,
        top: 55, left: margenIzquierdo + (index * anchoTab),
        width: anchoTab - 4, height: 35,
        texto: tipo, fontSize: fontSizeBot,
        fn: () => this.cambiarTipo(tipo)
      }));
    });

    this.renderContenido();
  }

  cambiarNivelManual(delta) {
    const nuevoNivel = this.nivelManual + delta;
    if (nuevoNivel >= 6 && nuevoNivel <= 18) {
      this.nivelManual = nuevoNivel;
      
      // 2. Guardar en LocalStorage cada vez que cambie
      localStorage.setItem("selected_training_level", this.nivelManual);
      
      this.lblNivelValue.actualizarTexto(`Lvl ${this.nivelManual}`);
      this.actualizarGeneradores();
      this.refresh();
    }
  }

  renderContenido() {
    if (this.tipoSeleccionado === "File") {
      this.renderFilePanel();
    } else {
      this.renderGrid();
    }
  }

  renderGrid() {
    const anchoModal = 400;
    const anchoCard = anchoModal * 0.85;
    const x = (anchoModal - anchoCard) / 2; 
    const offsetTop = 105; 
    const cardHeight = 195; 
    
    for (let i = 1; i <= 6; i++) {
      const wk = this.generator.generate(i, this.nivelManual);
      const tss = TSSCalculator.calcularDesdeSegmentos(wk.segments);
      const y = offsetTop + ((i - 1) * (cardHeight + 15));
      let duration = ZonaUtils.calcularDuracionTotal(wk); 

      const comps = [
        new Label({ id: `lblWk_${i}`, top: y + 8, left: x + 8, width: anchoCard - 16, height: 20, texto: wk.workoutName, fontSize: 13, bold: true }),
        new Label({ id: `lblInfo_${i}`, top: y + 30, left: x + 8, width: anchoCard - 16, height: 18, texto: `${duration} min | TSS: ${tss}`, fontSize: 10 }),
        new WorkoutMini({ id: `mini_${i}`, top: y + 52, left: x + 8, width: anchoCard - 16, height: 80, workout: wk }),
        new Boton({
          id: `btnSel_${i}`, top: y + 145, left: x + (anchoCard * 0.05), width: anchoCard * 0.9, height: 35,
          texto: `Cargar S${i} (TSS: ${tss})`, fontSize: 12,
          fn: () => {
            if (this.fnCerrar) this.fnCerrar("file", wk);
            this.cerrar();
          }
        })
      ];
      comps.forEach(c => this.agregarComponenteAlGrid(c));
    }
  }

  renderFilePanel() {
    const anchoModal = 430;
    const anchoCard = anchoModal * 0.85;
    const x = 10;
    const yBase = 120;

    if (this.archivoCargado) {
      const tss = TSSCalculator.calcularDesdeSegmentos(this.archivoCargado.segments);
      let duration = ZonaUtils.calcularDuracionTotal(this.archivoCargado); 

      const comps = [
        new Label({ id: "lblFileTitulo", top: yBase - 20, left: x + 8, width: anchoCard - 16, height: 20, texto: `${this.archivoCargado.workoutName}`, fontSize: 13, bold: true }),
        new Label({ id: "lblFileInfo", top: yBase + 25, left: x + 8, width: anchoCard - 16, height: 18, texto: `${duration} min | TSS: ${tss}`, fontSize: 10 }),
        new WorkoutMini({ id: "fileMiniView", top: yBase + 50, left: x + 8, width: anchoCard - 16, height: 120, workout: this.archivoCargado }),
        new Boton({
          id: "btnConfirmarFile", top: yBase + 185, left: x, width: anchoCard, height: 40, texto: "Cargar Entrenamiento", color: "success",
          fn: () => {
            if (this.fnCerrar) this.fnCerrar("file", this.archivoCargado);
            this.cerrar();
          }
        })
      ];
      comps.forEach(c => this.agregarComponenteAlGrid(c));
    } 

    const btnFile = new FileInput({
      id: "fileInputControl", top: yBase + 235, left: x, width: anchoCard, height: 120,
      texto: "Seleccionar archivo .erg2",
      fn: (fileName, workoutData) => {
        try {
          this.archivoCargado = JSON.parse(workoutData);
          this.refresh();
        } catch (e) { console.error(e); }
      }
    });
    this.agregarComponenteAlGrid(btnFile);
  }

  agregarComponenteAlGrid(comp) {
    this.agregarHijo(comp);
    this.gridContainer.push(comp);
  }

  cambiarTipo(nuevoTipo) {
    this.tipoSeleccionado = nuevoTipo;
    if (this.generadores[nuevoTipo]) this.generator = this.generadores[nuevoTipo];
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