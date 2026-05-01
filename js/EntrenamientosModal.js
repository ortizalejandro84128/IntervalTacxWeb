class EntrenamientosModal extends DialogModal {
  constructor(mainApp, tipoInicial, fnCerrar) {
    // Ajustado a 400x700
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

    this.crearInterfaz();
  }

  getNivel() {
    let ftp = localStorage.getItem("user_ftp") || 180;
    let base = ftp >= 180 ? 72 : 55;
    return NivelUtil.calcularFactorNivel(base, ftp);
  }

  crearInterfaz() {
    const anchoModal = 400;
    const anchoComponente = anchoModal * 0.85; // 340px
    const margenIzquierdo = (anchoModal - anchoComponente) / 2; // 30px

    // 0. Botón de Cerrar (X) - Posición optimizada para 400px
    const btnCerrarX = new Boton({
      id: "btnCerrarModal",
      top: 10,
      left: anchoModal - 80, 
      width: 30,
      height: 30,
      texto: "X",
      fn: () => this.cerrar()
    });
    this.agregarHijo(btnCerrarX);

    // 1. Tabs de Selección (Más compactos)
    const tipos = ["VO2", "Umbral", "Sat"];
    const anchoTab = anchoComponente / tipos.length;
    
    tipos.forEach((tipo, index) => {
      const btnTab = new Boton({
        id: `btnTab_${tipo}`,
        top: 50,
        left: margenIzquierdo + (index * anchoTab),
        width: anchoTab - 4,
        height: 35,
        texto: tipo,
        fontSize: 11,
        fn: () => this.cambiarTipo(tipo)
      });
      this.agregarHijo(btnTab);
    });

    this.renderGrid();
  }

  renderGrid() {
    const anchoModal = 400;
    const anchoCard = anchoModal * 0.85; // 340px
    const x = (anchoModal - anchoCard) / 2; // 30px
    
    const offsetTop = 100; 
    const cardHeight = 195; // Altura reducida para maximizar visibilidad en 700px
    const gapY = 15;
    
    for (let i = 1; i <= 6; i++) {
      const wk = this.generator.generate(i, this.getNivel());
      const tss = TSSCalculator.calcularDesdeSegmentos(wk.segments);
      const y = offsetTop + ((i - 1) * (cardHeight + gapY));

      // Título (Ajuste de fuente para evitar desbordamiento)
      const lblTitulo = new Label({
        id: `lblWk_${i}`,
        top: y + 8, left: x + 8, width: anchoCard - 16, height: 20,
        texto: wk.workoutName, fontSize: 13, bold: true
      });

      // Info Duración y TSS
      const lblInfo = new Label({
        id: `lblInfo_${i}`,
        top: y + 30, left: x + 8, width: anchoCard - 16, height: 18,
        texto: `${wk.totalDuration} min | TSS: ${tss}`,
        fontSize: 10
      });

      // Gráfica (Más baja para ahorrar espacio vertical)
      const timelineControl = new WorkoutMini({
        id: `mini_${i}`,
        top: y + 52, left: x + 8, width: anchoCard - 16, height: 80,
        workout: wk,
      });

      // Botón de Selección compacto
      const btnSeleccionar = new Boton({
        id: `btnSel_${i}`,
        top: y + 145, left: x + (anchoCard * 0.05), width: anchoCard * 0.9, height: 35,
        texto: `${i} - TSS: ${tss}`,
        fontSize: 12,
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