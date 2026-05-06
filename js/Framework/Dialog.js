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

        window.addEventListener("resize", () => this.resize());
    }

ajustarPantalla() {
        if (!this.focus || !this.elemento) return;

        const info = this.seleccionarLayout();
        
        if (!info || !info.bounds || info.bounds.width === 0) {
            console.warn(`AppGuard: Bounds inválidos para ${this.id}`, info);
            return;
        }

        const viewport = {
            width: window.visualViewport ? window.visualViewport.width : window.innerWidth,
            height: window.visualViewport ? window.visualViewport.height : window.innerHeight
        };

        // 1. LÓGICA DE ESCALADO VECTORIAL (< 450px)
        let factor = 1.0;
        
        // Si la pantalla es menor a 450, forzamos el escalado vectorial
        // para que el diálogo quepa perfectamente sin desbordar.
        if (viewport.width < 450) {
            // Usamos un margen del 96% (0.96) para que no toque los bordes físicos
            factor = (viewport.width * 0.96) / info.bounds.width;
            
            // Verificamos que también quepa a lo alto
            const factorAlto = (viewport.height * 0.96) / info.bounds.height;
            factor = Math.min(factor, factorAlto);
        } else {
            // Comportamiento normal para escritorio o tablets grandes
            factor = Math.min(
                (viewport.width * 0.98) / info.bounds.width, 
                (viewport.height * 0.98) / info.bounds.height,
                1.0 // No agrandar más allá del 100% en pantallas grandes
            );
        }

        // 2. Aplicar el layout interno (distribución de botones/inputs)
        this.aplicarLayout(info.layout);

        // 3. Cálculos de centrado considerando el factor de escala
        // Al usar transformOrigin "0 0", debemos compensar el desplazamiento
        const left = (viewport.width - (info.bounds.width * factor)) / 2;
        const top = (viewport.height - (info.bounds.height * factor)) / 2;

        // 4. Aplicación de estilos finales
        this.elemento.style.width = `${info.bounds.width}px`;
        this.elemento.style.height = `${info.bounds.height}px`;
        
        // Usamos translate3d para activar la aceleración por hardware (GPU)
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
                ctrl.fontSize = item.fontSize / 10;
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

    procesarLayoutPorcentual(anchoContenedor, altoContenedor, arregloHijos, porcentajesFilas, toleranciaVertical = 15) {
        if (!arregloHijos || arregloHijos.length === 0) return [];

        // --- MEJORA: Márgenes adaptativos ---
        const margenLateral = anchoContenedor < 400 ? 5 : 10;
        const margenInterno = anchoContenedor < 400 ? 3 : 6;

        const gruposPosicion = new Map();
        arregloHijos.forEach(h => {
            const key = `${Math.round(h.top)}|${Math.round(h.left)}`;
            if (!gruposPosicion.has(key)) gruposPosicion.set(key, []);
            gruposPosicion.get(key).push({ ...h });
        });

        const representantes = [];
        gruposPosicion.forEach(gemelos => representantes.push({ principal: gemelos[0], todos: gemelos }));
        representantes.sort((a, b) => a.principal.top - b.principal.top);

        let filas = [];
        representantes.forEach(rep => {
            const hTop = rep.principal.top;
            let filaEncontrada = filas.find(f => Math.abs(f.top - hTop) <= toleranciaVertical);
            if (filaEncontrada) {
                filaEncontrada.items.push(rep);
            } else {
                filas.push({ top: hTop, items: [rep] });
            }
        });

        const totalMargenesVerticales = margenInterno * (filas.length + 1);
        const altoUtilVertical = altoContenedor - totalMargenesVerticales;

        const resultadoFinal = [];
        let currentY = margenInterno;

        filas.forEach((fila, idxFila) => {
            const porc = porcentajesFilas[idxFila] || 0;
            const altoFilaEfectivo = Math.floor((altoUtilVertical * porc) / 100);

            const nElem = fila.items.length;
            fila.items.sort((a, b) => a.principal.left - b.principal.left);

            const huecosHorizontales = (margenLateral * 2) + (margenInterno * (nElem - 1));
            const anchoUtilHoriz = anchoContenedor - huecosHorizontales;
            
            const anchoIndividual = Math.floor(anchoUtilHoriz / nElem);
            const residuoHoriz = anchoUtilHoriz % nElem;

            fila.items.forEach((rep, idxItem) => {
                const ajusteResiduo = (idxItem < residuoHoriz) ? 1 : 0;
                const anchoConAjuste = anchoIndividual + ajusteResiduo;
                
                const previoX = fila.items.slice(0, idxItem).reduce((acc, curr, i) => {
                    const adj = (i < residuoHoriz) ? 1 : 0;
                    return acc + anchoIndividual + adj + margenInterno;
                }, margenLateral);

                rep.todos.forEach(h => {
                    h.left = previoX;
                    h.width = anchoConAjuste;
                    h.top = currentY;
                    h.height = altoFilaEfectivo; 
                    
                    // --- MEJORA: Font-Size Clamp ---
                    // Evita que el texto desborde si el control es muy estrecho
                    let sizeSugerido = Math.floor(altoFilaEfectivo * 0.5);
                    const limitePorAncho = Math.floor(anchoConAjuste * 0.18);
                    
                    h.fontSize = Math.max(12, Math.min(sizeSugerido, limitePorAncho)); 
                    
                    resultadoFinal.push(h);
                });
            });

            currentY += altoFilaEfectivo + margenInterno;
        });

        return resultadoFinal;
    }
}