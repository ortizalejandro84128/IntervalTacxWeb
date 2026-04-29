class EntrenamientosModal extends DialogModal {
  constructor(mainApp, tipoInicial, fnCerrar) {
    super({ id: "entrenamientosDialogModal", width: 900, height: 1200, titulo: "Seleccionar Entrenamiento" });
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
    const margin = 50; // Aumentado para centrar mejor el bloque de 2 columnas
    const offsetTop = 60; 
    const cardWidth = 380;  // Más ancho al haber solo 2 columnas
    const cardHeight = 200; // Un poco más bajo para que quepan 3 filas cómodamente
    const gapX = 40;        // Espacio horizontal entre columnas
    const gapY = 20;        // Espacio vertical entre filas

    for (let i = 1; i <= 12; i++) {
      const wk = this.generator.generate(i);
      
      // Lógica para 2 columnas:
      // i=1 -> col 0, fila 0 | i=2 -> col 1, fila 0
      // i=3 -> col 0, fila 1 | i=4 -> col 1, fila 1
      // i=5 -> col 0, fila 2 | i=6 -> col 1, fila 2
      const col = (i - 1) % 2; 
      const fila = Math.floor((i - 1) / 2);
      
      const x = margin + (col * (cardWidth + gapX));
      const y = offsetTop + (fila * (cardHeight + gapY));

      // Título
      const lblTitulo = new Label({
        id: `lblWk_${i}`,
        top: y + 5, left: x + 10, width: cardWidth - 20, height: 25,
        texto: wk.workoutName, fontSize: 13, bold: true
      });

      // Info
      const lblInfo = new Label({
        id: `lblInfo_${i}`,
        top: y + 30, left: x + 10, width: cardWidth - 20, height: 20,
        texto: `Duración: ${wk.totalDuration} min | Int: ${wk.intensity}%`,
        fontSize: 11
      });

      // Miniatura de Barras (ajustada en altura para el nuevo diseño)
      const timelineControl = new WorkoutMini({
        id: `mini_${i}`,
        top: y + 55, left: x + 10, width: cardWidth - 20, height: 80,
        workout: wk,
      });

      // Botón de Selección
      const btnSeleccionar = new Boton({
        id: `btnSel_${i}`,
        top: y + 145, left: x + 10, width: cardWidth - 20, height: 35,
        texto: "Semana " + i,
        fn: () => {
          if (this.fnCerrar) {
            this.fnCerrar("file", wk);
          }
          this.cerrar();
        }
      });

      // Registro de componentes
      const comps = [lblTitulo, lblInfo, timelineControl, btnSeleccionar];
      comps.forEach(c => {
        this.agregarHijo(c);
        this.gridContainer.push(c);
      });
    }
}

}