class Dialog extends Window {
    constructor({ id, width, height, texto }) {
        super({ id, top: 0, left: 0, width, height, texto });
        this.hijos = [];
        this.focus = false;
        this.resizeTimeout = null;
        this.crear();
    }

    crear() {
        if (document.getElementById(this.id)) return;

        const div = document.createElement("div");
        div.id = this.id;
        
        
        // 1. Añadimos clases de Bootstrap para el estilo visual
        // 'card' nos da el fondo, bordes y estructura.
        // 'shadow' le da profundidad.
        //div.className = "card shadow border-primary"; 

        Object.assign(div.style, {
            position: "absolute",
            overflow: "hidden",
            transformOrigin: "0 0",
            display: "none",
            zIndex: "9999",
            padding: "0px" // Evitamos padding interno que rompa tus coordenadas exactas
        });


        document.getElementById("app").appendChild(div);
        this.elemento = div;
        this.elemento.style.transition = "transform 0.15s ease-out"; 
        this.elemento.style.position = "fixed";
        this.elemento.style.backfaceVisibility = "hidden";

        window.addEventListener("resize", () => this.resize());
    }

ajustarPantalla() {
    if (!this.focus || !this.elemento) return;

    // 1. Obtener el layout seleccionado y los bounds calculados arriba
    const info = this.seleccionarLayout();
    
    // 2. Medir el viewport real (lo que el usuario ve)
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    // 3. CALCULAR EL FACTOR DE ESCALA
    // Comparamos el tamaño real contra el tamaño de los bounds.
    // Si la pantalla es 320px y el bound es 400px, el factor será 0.8
    let factor = Math.min(
        viewport.width / info.bounds.width,
        viewport.height / info.bounds.height
    );

    // Evitamos que el diálogo crezca más del 100% (evita pixelado)
    if (factor > 1) factor = 1;

    // 4. APLICAR EL LAYOUT PORCENTUAL
    // Esto distribuye tus botones y el IntervalControl dentro de los bounds
    this.aplicarLayout(info.layout);

    // 5. ASIGNAR TAMAÑO Y TRANSFORMACIÓN
    // Fijamos el tamaño del div al tamaño del diseño
    this.elemento.style.width = `${info.bounds.width}px`;
    this.elemento.style.height = `${info.bounds.height}px`;

    // Calculamos la posición para que quede perfectamente centrado
    // considerando que el escalado vectorial encoge el objeto desde su origen
    const left = (viewport.width - (info.bounds.width * factor)) / 2;
    const top = (viewport.height - (info.bounds.height * factor)) / 2;

    // Aplicamos traslación y escala en una sola instrucción para mayor rendimiento
    // Usamos translate3d para forzar la aceleración por hardware
    this.elemento.style.transformOrigin = "0 0"; // Vital para que el centrado sea exacto
    this.elemento.style.transform = `translate3d(${left}px, ${top}px, 0) scale(${factor})`;
    
    this.elemento.style.display = "block";
}
    resize() {
      
        if (this.focus) {
            if (this.resizeTimeout) cancelAnimationFrame(this.resizeTimeout);
            this.resizeTimeout = requestAnimationFrame(() => this.ajustarPantalla());
        }
    }

    setFocus(focus) {
        this.focus = focus;
        if (this.focus) {
            this.elemento.style.display = "block";
            this.elemento.style.opacity = "1";
            
            // Usamos requestAnimationFrame para asegurar que el DOM procesó el display:block
            requestAnimationFrame(() => {
                this.ajustarPantalla();
            });
        } else {
            this.elemento.style.display = "none";
        }
    }

    aplicarLayout(layout) {
        if (!layout) return;
        layout.forEach(item => {
            const ctrl = this.getChildById(item.id);
            if (!ctrl || !ctrl.elemento) return;

            Object.assign(ctrl, { 
                top: item.top, left: item.left, 
                width: item.width, height: item.height 
            });

            Object.assign(ctrl.elemento.style, {
                position: "absolute",
                top: `${item.top}px`,
                left: `${item.left}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
                fontSize: `${item.fontSize}px`
            });

            if (ctrl instanceof IntervalControl) {
                ctrl.fontSize = item.fontSize/7 ;
                ctrl.width = item.width; // Actualizar dimensiones lógicas
                ctrl.height = item.height;
                ctrl.render();
            }
        });
    }


    seleccionarLayout() {
        const ratio = window.innerWidth / window.innerHeight;
        const isHorizontal = ratio >= 1.2;
        return {
            tipo: isHorizontal ? "horizontal" : "vertical",
            bounds: isHorizontal ? this.getBoundsHorizontal() : this.getBoundsVertical(),
            layout: isHorizontal ? this.getLayoutHorizontal() : this.getLayoutVertical()
        };
    }

    agregarHijo(hijo) {
        this.hijos.push(hijo);
        if (this.elemento) this.elemento.appendChild(hijo.elemento);
        hijo.padre = this;
    }

    setError(jsonErrores) {
        this.hijos.forEach(hijo => {
            if (hijo.elemento) {
                hijo.elemento.classList.toggle("is-invalid", !!jsonErrores[hijo.id]);
            }
        });
    }


procesarLayoutPorcentual(width, height, pos, filaPct) {
    if (!pos || pos.length === 0) return [];

    const margenLateral = width < 400 ? 5 : 10;
    const margenInterno = width < 400 ? 3 : 6;

    const totalMargenesVerticales = margenInterno * (filaPct.length + 1);
    const altoUtilVertical = height - totalMargenesVerticales;

    let resultadoFinal = [];
    let currentY = margenInterno;

    filaPct.forEach((pct, indexFila) => {
        const altoFilaEfectivo = Math.floor((altoUtilVertical * pct) / 100);
        const elementosFila = pos.filter(item => item.fila === indexFila);

        if (elementosFila.length > 0) {
            // 1. Obtenemos los factores únicos por columna
            const factoresColumnas = {};
            elementosFila.forEach(item => {
                factoresColumnas[item.col] = item.factor || 1;
            });

            // 2. SUMA TOTAL DE FACTORES (El denominador de nuestra proporción)
            const sumaFactoresTotal = Object.values(factoresColumnas).reduce((a, b) => a + b, 0);
            
            // 3. Espacio horizontal neto para repartir
            const nColumnas = Object.keys(factoresColumnas).length;
            const huecosHorizontales = (margenLateral * 2) + (margenInterno * (nColumnas - 1));
            const anchoUtilHoriz = width - huecosHorizontales;
            
            // La "unidad de factor" en píxeles
            const pxPorFactor = anchoUtilHoriz / sumaFactoresTotal;

            elementosFila.forEach(item => {
                // 4. Calcular X sumando el ancho proporcional de las columnas a la izquierda
                let xOffset = margenLateral;
                for (let c = 0; c < item.col; c++) {
                    if (factoresColumnas[c] !== undefined) {
                        xOffset += (factoresColumnas[c] * pxPorFactor) + margenInterno;
                    }
                }

                // ANCHO PROPORCIONAL: (Mi Factor / Suma Total) * Ancho Util
                const anchoFinal = Math.floor(pxPorFactor * (item.factor || 1));

                // Font-Size Clamp basado en el nuevo ancho proporcional
                let sizeSugerido = Math.floor(altoFilaEfectivo * 0.5);
                const limitePorAncho = Math.floor(anchoFinal * 0.18);
                const fontSize = Math.max(12, Math.min(sizeSugerido, limitePorAncho));

                resultadoFinal.push({
                    id: item.id,
                    top: currentY,
                    left: xOffset,
                    width: anchoFinal,
                    height: altoFilaEfectivo,
                    fontSize: fontSize
                });
            });
        }

        currentY += altoFilaEfectivo + margenInterno;
    });

    return resultadoFinal;
}
}