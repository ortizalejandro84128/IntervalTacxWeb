class EntrenamientosModal extends DialogModal {
  constructor(mainApp, tipoInicial, fnCerrar) {
    super({ id: "entrenamientosDialogModal", width: 900, height: 750, titulo: "Seleccionar Entrenamiento" });
    this.mainApp = mainApp;
    this.fnCerrar = fnCerrar;
    
    // Mapeo de generadores
    this.generadores = {
      "VO2": new Vo2Generator(),
      "Umbral": new UmbralGenerator(),
      "Sat": new WeekendGenerator()
    };

    // Estado inicial
    this.tipoSeleccionado = tipoInicial || "VO2";
    this.generator = this.generadores[this.tipoSeleccionado];
    
    // Contenedor para las tarjetas (para poder limpiarlo fácilmente)
    this.gridContainer = []; 

    this.crearInterfaz();
  }

  crearInterfaz() {
    // 1. Crear Botones de Selección de Tipo (Tabs)
    const tipos = ["VO2", "Umbral", "Sat"];
    tipos.forEach((tipo, index) => {
      const btnTab = new Boton({
        id: `btnTab_${tipo}`,
        top: 10,
        left: 20 + (index * 110),
        width: 100,
        height: 35,
        texto: tipo,
        fn: () => this.cambiarTipo(tipo)
      });
      this.agregarHijo(btnTab);
    });

    // 2. Renderizar el primer set de entrenamientos
    this.renderGrid();

    // 3. Botón de cancelar fijo en el footer
    const btnCerrar = new Boton({
      id: "btnCerrarGeneral",
      top: 680,
      left: 375,
      width: 150,
      height: 40,
      texto: "Cancelar",
      fn: () => this.cerrar()
    });
    this.agregarHijo(btnCerrar);
  }

  cambiarTipo(nuevoTipo) {
    if (this.tipoSeleccionado === nuevoTipo) return;
    
    this.tipoSeleccionado = nuevoTipo;
    this.generator = this.generadores[nuevoTipo];
    
    // Limpiar componentes anteriores del grid
    this.limpiarGrid();
    // Dibujar nuevos
    this.renderGrid();
  }

  limpiarGrid() {
    // Eliminamos del DOM y del array de hijos los elementos previos
    this.gridContainer.forEach(componente => {
      if (componente.elemento && componente.elemento.parentNode) {
        componente.elemento.parentNode.removeChild(componente.elemento);
      }
      // Filtramos el array de hijos del DialogModal para quitar el componente
      this.hijos = this.hijos.filter(h => h !== componente);
    });
    this.gridContainer = [];
  }

  renderGrid() {
    const margin = 20;
    const offsetTop = 60; // Espacio para los botones de tipo
    const cardWidth = 260;
    const cardHeight = 280;
    const gap = 20;

    for (let i = 1; i <= 6; i++) {
      const wk = this.generator.generate(i);
      const col = (i - 1) % 3;
      const fila = Math.floor((i - 1) / 3);
      const x = margin + (col * (cardWidth + gap));
      const y = offsetTop + (fila * (cardHeight + gap));

      // Título
      const lblTitulo = new Label({
        id: `lblWk_${i}`,
        top: y + 10, left: x + 10, width: cardWidth - 20, height: 25,
        texto: wk.workoutName, fontSize: 13, bold: true
      });

      // Info
      const lblInfo = new Label({
        id: `lblInfo_${i}`,
        top: y + 35, left: x + 10, width: cardWidth - 20, height: 40,
        texto: `Duración: ${wk.totalDuration} min | Int: ${wk.intensity}%`,
        fontSize: 11
      });

      // Miniatura de Barras
      const timelineControl = new WorkoutMini({
        id: `mini_${i}`,
        top: y + 75, left: x + 10, width: cardWidth - 20, height: 120,
        workout: wk,
      });

      // Botón de Selección
      const btnSeleccionar = new Boton({
        id: `btnSel_${i}`,
        top: y + 210, left: x + 10, width: cardWidth - 20, height: 40,
        texto: "Semana " + i,
        fn: () => {
          if (this.fnCerrar) {
            this.fnCerrar("file", wk);
          }
          this.cerrar();
        }
      });

      // Guardamos referencias para poder borrarlos luego
      const comps = [lblTitulo, lblInfo, timelineControl, btnSeleccionar];
      comps.forEach(c => {
        this.agregarHijo(c);
        this.gridContainer.push(c);
      });
    }
  }
}