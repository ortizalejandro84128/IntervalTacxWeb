class EntrenamientosModal extends DialogModal {
  constructor(mainApp, tipoInicial, fnCerrar) {
    // Ajustado a 500x900
    super({ id: "entrenamientosDialogModal", width: 500, height: 900, titulo: "Seleccionar Entrenamiento" });
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

    this.crearInterfaz();
  }

  getNivel() {
    let ftp = localStorage.getItem("user_ftp") || 180;
    let base = ftp >= 180 ? 72 : 55;
    return NivelUtil.calcularFactorNivel(base, ftp);
  }

  crearInterfaz() {
    const anchoModal = 500;
    const anchoComponente = anchoModal * 0.85; // 425px
    const margenIzquierdo = (anchoModal - anchoComponente) / 2; // 37.5px

    // 0. Botón de Cerrar (X)
    const btnCerrarX = new Boton({
      id: "btnCerrarModal",
      top: 10,
      left: anchoModal - 60, // Ajustado para el nuevo ancho
      width: 35,
      height: 35,
      texto: "X",
      fn: () => this.cerrar()
    });
    this.agregarHijo(btnCerrarX);

    // 1. Tabs de Selección
    const tipos = ["VO2", "Umbral", "Sat"];
    const anchoTab = anchoComponente / tipos.length;
    
    tipos.forEach((tipo, index) => {
      const btnTab = new Boton({
        id: `btnTab_${tipo}`,
        top: 55,
        left: margenIzquierdo + (index * anchoTab),
        width: anchoTab - 5,
        height: 40,
        texto: tipo,
        fn: () => this.cambiarTipo(tipo)
      });
      this.agregarHijo(btnTab);
    });

    this.renderGrid();
  }

  renderGrid() {
    const anchoModal = 500;
    const anchoCard = anchoModal * 0.85; // 425px
    const x = (anchoModal - anchoCard) / 2;
    
    const offsetTop = 110; 
    const cardHeight = 220; 
    const gapY = 20;
    
    for (let i = 1; i <= 6; i++) {
      const wk = this.generator.generate(i, this.getNivel());
      const tss = TSSCalculator.calcularDesdeSegmentos(wk.segments);
      const y = offsetTop + ((i - 1) * (cardHeight + gapY));

      // Título
      const lblTitulo = new Label({
        id: `lblWk_${i}`,
        top: y + 10, left: x + 10, width: anchoCard - 20, height: 25,
        texto: wk.workoutName, fontSize: 14, bold: true
      });

      // Info Duración y TSS
      const lblInfo = new Label({
        id: `lblInfo_${i}`,
        top: y + 35, left: x + 10, width: anchoCard - 20, height: 20,
        texto: `Duración: ${wk.totalDuration} min | TSS: ${tss}`,
        fontSize: 11
      });

      // Gráfica (WorkoutMini)
      const timelineControl = new WorkoutMini({
        id: `mini_${i}`,
        top: y + 60, left: x + 10, width: anchoCard - 20, height: 95,
        workout: wk,
      });

      // Botón de Selección con texto solicitado
      const btnSeleccionar = new Boton({
        id: `btnSel_${i}`,
        top: y + 165, left: x + (anchoCard * 0.05), width: anchoCard * 0.9, height: 40,
        texto: `${i} Tss: ${tss}`,
        fn: () => {
          if (this.fnCerrar) this.fnCerrar("file", wk);
          this.cerrar();
        }
      });

      const comps = [lblTitulo, lblInfo, timelineControl, btnSeleccionar];
      comps.forEach(c => {
        this.agregarHijo(c);
        this.gridContainer.push(c);
      });
    }
  }

  cambiarTipo(nuevoTipo) {
    this.tipoSeleccionado = nuevoTipo;
    this.generator = this.generadores[nuevoTipo];
    this.refresh();
  }

  refresh() {
    this.limpiarGrid();
    this.renderGrid();
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