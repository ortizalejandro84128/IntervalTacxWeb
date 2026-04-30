class EditaLayoutDialog extends Dialog {
  constructor(mainApp, dialogToEdit) {
    super({
      id: "editaLayoutDialog",
      width: 1100,
      height: 900,
      texto: "Editor de Layout - Área de Diseño"
    });

    this.mainApp = mainApp;
    this.target = dialogToEdit; 
    this.canvasId = "areaLienzoEditor";
    this.modoActual = "horizontal";
    this.gridSize = 5; 
    
    this.hijosEditor = []; 

    this.crearControles();
  }

  crearControles() {
    this.addChildBoton({ id: "btnModoH", texto: "Layout H", fn: () => this.configurarLienzo("horizontal") });
    this.addChildBoton({ id: "btnModoV", texto: "Layout V", fn: () => this.configurarLienzo("vertical") });
    this.addChildBoton({ 
        id: "btnExport", 
        texto: "Copiar Layout", 
        color: "success", 
        fn: () => this.distribuirEspacioFijo() 
    });

    this.canvas = this.addChildContenedor({ id: this.canvasId, texto: 'Lienzo de edición' });
    
    const s = this.canvas.elemento.style;
    s.backgroundColor = "#1a1a1a";
    s.border = "2px solid #007bff";
    s.position = "absolute";
    s.overflow = "hidden"; 
  }

  getBoundsHorizontal() { return { width: 1100, height: 900 }; }

  getLayoutHorizontal() {
    const boundsTarget = (this.modoActual === "horizontal") 
                         ? this.target.getBoundsHorizontal() 
                         : this.target.getBoundsVertical();

    return [
      { id: "btnModoH", top: 15, left: 20, width: 180, height: 40 },
      { id: "btnModoV", top: 15, left: 220, width: 180, height: 40 },
      { id: "btnExport", top: 15, left: 420, width: 250, height: 40 },
      { 
        id: this.canvasId, 
        top: 75, 
        left: 20, 
        width: boundsTarget.width, 
        height: boundsTarget.height 
      }
    ];
  }


/**
 * Distribuye los elementos en filas y columnas de forma equitativa.
 * @param {number} toleranciaVertical - Píxeles de diferencia para agrupar elementos en una misma fila.
 */
distribuirEspacioFijo(toleranciaVertical = 15) {
    if (this.hijosEditor.length === 0) return;

    const margenLateral = 10; 
    const margenInterno = 2; 
    const anchoCanvas = parseInt(this.canvas.elemento.style.width);
    
    // 1. Agrupar por Coordenadas Exactas (Gemelos)
    const gruposPosicion = new Map();

    this.hijosEditor.forEach(h => {
        const top = parseInt(h.elemento.style.top);
        const left = parseInt(h.elemento.style.left);
        const key = `${top}|${left}`;
        
        if (!gruposPosicion.has(key)) {
            gruposPosicion.set(key, []);
        }
        gruposPosicion.get(key).push(h);
    });

    // Representantes únicos para el cálculo de distribución
    const representantes = [];
    gruposPosicion.forEach(gemelos => {
        representantes.push({
            principal: gemelos[0],
            todos: gemelos
        });
    });

    // 2. Ordenar de arriba a abajo y agrupar por Filas
    representantes.sort((a, b) => parseInt(a.principal.elemento.style.top) - parseInt(b.principal.elemento.style.top));

    let filas = [];
    representantes.forEach(rep => {
        const hTop = parseInt(rep.principal.elemento.style.top);
        const hHeight = parseInt(rep.principal.elemento.style.height);
        
        // Detectar si pertenece a una fila existente basada en la tolerancia
        let filaEncontrada = filas.find(f => Math.abs(f.top - hTop) <= toleranciaVertical);

        if (filaEncontrada) {
            filaEncontrada.items.push(rep);
            filaEncontrada.maxHeight = Math.max(filaEncontrada.maxHeight, hHeight);
        } else {
            filas.push({ 
                top: hTop, 
                maxHeight: hHeight, 
                items: [rep] 
            });
        }
    });

    // 3. Aplicar Layout final
    let currentY = margenInterno; 

    filas.forEach((fila) => {
        const items = fila.items;
        const nElem = items.length;

        // Ordenar de izquierda a derecha dentro de la fila
        items.sort((a, b) => parseInt(a.principal.elemento.style.left) - parseInt(b.principal.elemento.style.left));

        // Cálculo de anchos
        const huecosHorizontales = (margenLateral * 2) + (margenInterno * (nElem - 1));
        const anchoUtil = anchoCanvas - huecosHorizontales;
        const anchoIndividual = Math.floor(anchoUtil / nElem);

        items.forEach((rep, index) => {
            const nuevaX = margenLateral + (index * (anchoIndividual + margenInterno));
            
            // Actualizar el grupo completo (incluye gemelos)
            rep.todos.forEach(h => {
                h.elemento.style.left = nuevaX + "px";
                h.elemento.style.width = anchoIndividual + "px";
                h.elemento.style.top = currentY + "px";
            });
        });

        // El siguiente 'piso' vertical
        currentY += fila.maxHeight + margenInterno;
    });

    console.log(`Distribución aplicada: ${filas.length} filas procesadas con tol: ${toleranciaVertical}px`);
}


  configurarLienzo(modo) {
    this.modoActual = modo;
    while (this.canvas.elemento.firstChild) {
        this.canvas.elemento.removeChild(this.canvas.elemento.firstChild);
    }
    this.hijosEditor = [];

    const layoutOriginal = (modo === "horizontal") 
        ? this.target.getLayoutHorizontal() 
        : this.target.getLayoutVertical();

    layoutOriginal.forEach(item => {
        if (item.id === this.canvasId) return;

        const proxy = new Contenedor({
            id: "proxy_" + item.id,
            top: item.top,
            left: item.left,
            width: item.width,
            height: item.height,
            texto: item.id
        });

        this.habilitarDragDrop(proxy, item.id);
        this.hijosEditor.push(proxy);
        this.canvas.elemento.appendChild(proxy.elemento);
    });

    this.aplicarLayout(); 
  }

  habilitarDragDrop(proxy, idOriginal) {
    const el = proxy.elemento;
    el.style.backgroundColor = "rgba(0, 123, 255, 0.3)";
    el.style.border = "1px solid #55aaff";
    el.style.color = "#fff";
    el.style.fontSize = "11px";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.cursor = "move";
    el.style.position = "absolute";
    el.innerText = idOriginal;

    el.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.style.backgroundColor = "rgba(0, 123, 255, 0.6)";
      el.style.zIndex = "1000";

      let startX = e.clientX;
      let startY = e.clientY;

      const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        let currentLeft = parseInt(el.style.left) || 0;
        let currentTop = parseInt(el.style.top) || 0;

        let snapLeft = Math.round((currentLeft + deltaX) / this.gridSize) * this.gridSize;
        let snapTop = Math.round((currentTop + deltaY) / this.gridSize) * this.gridSize;

        el.style.left = snapLeft + "px";
        el.style.top = snapTop + "px";

        startX = moveEvent.clientX;
        startY = moveEvent.clientY;
      };

      const onMouseUp = () => {
        el.style.backgroundColor = "rgba(0, 123, 255, 0.3)";
        el.style.zIndex = "";
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
  }

  exportarLayout() {
    const data = this.hijosEditor.map(h => ({
        id: h.id.replace("proxy_", ""),
        top: parseInt(h.elemento.style.top),
        left: parseInt(h.elemento.style.left),
        width: parseInt(h.elemento.style.width),
        height: parseInt(h.elemento.style.height)
    }));

    const codeString = JSON.stringify(data, null, 4);
    console.log (codeString); 
  }

  
}