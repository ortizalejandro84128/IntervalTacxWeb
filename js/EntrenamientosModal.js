class EntrenamientosModal extends DialogModal {
  constructor(mainApp, tipoInicial, fnCerrar) {
    // Dimensiones base 600x900
    super({ id: "entrenamientosDialogModal", width: 600, height: 900, titulo: "Seleccionar Entrenamiento" });
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
    const anchoModal = 600;
    const anchoComponente = anchoModal * 0.85; // 510px
    const margenIzquierdo = (anchoModal - anchoComponente) / 2; // Centrado (45px)

    // 0. Botón de Cerrar (X) en la esquina superior derecha
    const btnCerrarX = new Boton({
      id: "btnCerrarModal",
      top: 10,
      left: anchoModal - 80,
      width: 35,
      height: 35,
      texto: "X",
      fn: () => this.cerrar()
    });
    this.agregarHijo(btnCerrarX);

    // 1. Tabs de Selección (Centrados proporcionalmente)
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
    const anchoModal = 600;
    const anchoCard = anchoModal * 0.85; 
    const x = (anchoModal - anchoCard) / 2;
    
    const offsetTop = 110; 
    const cardHeight = 220; // Altura para una columna cómoda
    const gapY = 20;
    
    for (let i = 1; i <= 6; i++) {
      const wk = this.generator.generate(i, this.getNivel());
      const tss = TSSCalculator.calcularDesdeSegmentos(wk.segments);
      const y = offsetTop + ((i - 1) * (cardHeight + gapY));

      // Título
      const lblTitulo = new Label({
        id: `lblWk_${i}`,
        top: y + 10, left: x + 15, width: anchoCard - 30, height: 25,
        texto: wk.workoutName, fontSize: 15, bold: true
      });

      // Info Duración y TSS
      const lblInfo = new Label({
        id: `lblInfo_${i}`,
        top: y + 40, left: x + 15, width: anchoCard - 30, height: 20,
        texto: `Duración: ${wk.totalDuration} min | TSS Estimado: ${tss}`,
        fontSize: 12
      });

      // Gráfica de entrenamiento (WorkoutMini)
      const timelineControl = new WorkoutMini({
        id: `mini_${i}`,
        top: y + 65, left: x + 15, width: anchoCard - 30, height: 90,
        workout: wk,
      });

      // Botón de Selección
      const btnSeleccionar = new Boton({
        id: `btnSel_${i}`,
        top: y + 165, left: x + (anchoCard * 0.1), width: anchoCard * 0.8, height: 40,
        texto: "" + i+" Tss:"+tss,
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