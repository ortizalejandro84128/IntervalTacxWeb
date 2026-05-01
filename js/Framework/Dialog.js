class Dialog extends Window {
  constructor({id, width, height, texto}) {
    super({id, top: 0, left: 0, width, height, texto});
    this.hijos = [];
    this.crear();
    this.focus=false;
  }

 crear() {
  const div = document.createElement("div");
  div.id = this.id;
  div.style.position = "absolute";
  div.style.width = this.width + "px";
  div.style.height = this.height + "px";
  div.style.top = this.top + "px";
  div.style.left = this.left + "px";

  div.style.border = "2px solid #007bff";
  
  document.getElementById("app").appendChild(div);


  this.elemento = div;

  window.addEventListener("resize", this.resize.bind(this));
}


  agregarHijo(hijo) {
    this.hijos.push(hijo);
    this.elemento.appendChild(hijo.elemento);
    hijo.padre = this;
  }

  setError(jsonErrores) {
    this.hijos.forEach(hijo => {
      if (jsonErrores[hijo.id]) {
        hijo.elemento.classList.add("is-invalid");
      } else {
        hijo.elemento.classList.remove("is-invalid");
      }
    });
  }

detectarLayoutPorAspecto() {
  const ratio = window.innerWidth / window.innerHeight;
  return ratio >= 1.2 ? "horizontal" : "vertical";
}

getScale() {
  const factorPantalla = this.factorPantalla || .95; // 1.0 = 100%, 0.5 = 50%, 0.25 = 25%
  const scaleX = (window.innerWidth * factorPantalla) / this.width;
  const scaleY = (window.innerHeight * factorPantalla) / this.height;
  return Math.min(scaleX, scaleY);
}

  applyScale() {
    if (!this.elemento) return;

    const scale = this.getScale();
    this.elemento.style.transform = `scale(${scale})`;
    this.elemento.style.transformOrigin = "top left";
    this.elemento.style.width = this.width + "px";
    this.elemento.style.height = this.height + "px";

    // Ajustar tipografía de botones
  this.hijos.forEach(hijo => {
    if (hijo instanceof Boton && hijo.elemento) {
      console.log(window.getComputedStyle(hijo.elemento).fontSize);
    }
  });
  }


/*    centrar() { //basica
  if (!this.focus) return;

  const info = this.seleccionarLayout();
  //alert(JSON.stringify(info, null, 2));
  const factor = this.calcularFactor(info.bounds);

  if (factor<.8){
    factor=.8;
  }
  const lay=this.escalarLayout(info.layout, factor);
  console.log("factor"+factor);
  this.aplicarLayout(lay);
  const renderedWidth = info.bounds.width * factor;
  const renderedHeight = info.bounds.height * factor;

  const left = Math.max(10, (window.innerWidth - renderedWidth) / 2);
  const top = Math.max(10, (window.innerHeight - renderedHeight) / 2);

  this.elemento.style.left = `${left}px`;
  this.elemento.style.top = `${top}px`;
  this.elemento.style.width = `${renderedWidth}px`;
  this.elemento.style.height = `${renderedHeight}px`;
 

}
*/

centrar() {//hibrido factor <1 reduce como imagen no por layout
  if (!this.focus) return;

  const info = this.seleccionarLayout();
  let factor = this.calcularFactor(info.bounds);

  if (factor < 1) {
    // Escalado con transform para reducción
    this.aplicarLayout(info.layout, 1); // aplica layout base
    this.elemento.style.transform = `scale(${factor})`;
    this.elemento.style.transformOrigin = "top left";
  } else {
    // Escalado por coordenadas para ampliación
    const lay = this.escalarLayout(info.layout, 1);
    //const lay = this.escalarLayout(info.layout, factor);
    this.aplicarLayout(lay);
    this.elemento.style.transform = "";
  }

  const renderedWidth = info.bounds.width * factor;
  const renderedHeight = info.bounds.height * factor;

  const left = Math.max(10, (window.innerWidth - renderedWidth) / 2);
  const top = Math.max(10, (window.innerHeight - renderedHeight) / 2);

  this.elemento.style.left = `${left}px`;
  this.elemento.style.top = `${top}px`;
  this.elemento.style.width = `${renderedWidth}px`;
  this.elemento.style.height = `${renderedHeight}px`;
}










calcularFactor(bounds) {
  //alert(JSON.stringify(bounds, null, 2));
  const availableWidth = window.innerWidth - 20;
  const availableHeight = window.innerHeight - 20;

  const factorX = availableWidth / bounds.width;
  const factorY = availableHeight / bounds.height;

  return Math.min(factorX, factorY);
}



seleccionarLayout() {
  const ratio = window.innerWidth / window.innerHeight;
  if (ratio >= 1.2) {
    return {
      tipo: "horizontal",
      bounds: this.getBoundsHorizontal(),
      layout: this.getLayoutHorizontal()
    };
  } else {
    return {
      tipo: "vertical",
      bounds: this.getBoundsVertical(),
      layout: this.getLayoutVertical()
    };
  }
}

escalarLayout(layout, factor) {
  return layout.map(item => ({
    id: item.id,
    top: item.top * factor,
    left: item.left * factor,
    width: item.width * factor,
    height: item.height * factor
  }));
}

aplicarLayout(layout) {
  for (const item of layout) {
      this.setBounds(item.id, item.top, item.left, item.width, item.height);
  }
}


 resize(){
  if(this.focus){
clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.centrar() 
        }, 200); // debounce de 200ms
      }
      }


  setBounds(id, top, left, width, height) {
  const ctrl = this.getChildById(id);
  if (!ctrl) return;
  // Guardar coordenadas en el objeto
  ctrl.top = top;
  ctrl.left = left;
  ctrl.width = width;
  ctrl.height = height;
  // Aplicar al DOM usando la referencia correcta
  if (ctrl.elemento) {
    ctrl.elemento.style.position = "absolute"; // importante
    ctrl.elemento.style.top = top + "px";
    ctrl.elemento.style.left = left + "px";
    ctrl.elemento.style.width = width + "px";
    ctrl.elemento.style.height = height + "px";
  }

  if (ctrl instanceof IntervalControl){
    //console.log("render de interval control");
    ctrl.render();
  }
}
    

  setFocus(focus) {
    this.focus=focus;
    if(this.focus){
         this.show();
         this.centrar() ;
    }else{
         this.hide();
    }

}






/*
procesarLayoutEquitativo(anchoContenedor, altoContenedor, arregloHijos, toleranciaVertical = 15) {
    if (!arregloHijos || arregloHijos.length === 0) return [];

    const margenLateral = 10;
    const margenInterno = 6;
    const margenInferiorFinal = 10;

    // 1. Agrupar Gemelos
    const gruposPosicion = new Map();
    arregloHijos.forEach(h => {
        const key = `${Math.round(h.top)}|${Math.round(h.left)}`;
        if (!gruposPosicion.has(key)) gruposPosicion.set(key, []);
        gruposPosicion.get(key).push({ ...h });
    });

    const representantes = [];
    gruposPosicion.forEach(gemelos => {
        representantes.push({ principal: gemelos[0], todos: gemelos });
    });

    // 2. Agrupar Filas
    representantes.sort((a, b) => a.principal.top - b.principal.top);
    let filas = [];
    representantes.forEach(rep => {
        const hTop = rep.principal.top;
        let filaEncontrada = filas.find(f => Math.abs(f.top - hTop) <= toleranciaVertical);
        if (filaEncontrada) {
            filaEncontrada.items.push(rep);
            filaEncontrada.maxHeight = Math.max(filaEncontrada.maxHeight, rep.principal.height);
        } else {
            filas.push({ top: hTop, maxHeight: rep.principal.height, items: [rep] });
        }
    });

    // 3. Generar Layout con ajuste de precisión
    const resultadoFinal = [];
    let currentY = margenInterno;

    filas.forEach((fila, idxFila) => {
        const esUltimaFila = (idxFila === filas.length - 1);
        const nElem = fila.items.length;
        fila.items.sort((a, b) => a.principal.left - b.principal.left);

        const huecosHorizontales = (margenLateral * 2) + (margenInterno * (nElem - 1));
        const anchoUtil = anchoContenedor - huecosHorizontales;
        
        // Calculamos el ancho exacto y el residuo (sobrante de px por división no exacta)
        const anchoIndividual = Math.floor(anchoUtil / nElem);
        const residuoTotal = anchoUtil % nElem; 

        let altoFilaEfectivo = fila.maxHeight;
        if (esUltimaFila) {
            const espacioRestante = altoContenedor - currentY - margenInferiorFinal;
            altoFilaEfectivo = Math.max(fila.maxHeight, espacioRestante);
        }

        fila.items.forEach((rep, idxItem) => {
            // Repartimos el residuo entre los primeros elementos para que el final cuadre perfecto
            const ajusteResiduo = (idxItem < residuoTotal) ? 1 : 0;
            const anchoConAjuste = anchoIndividual + ajusteResiduo;
            
            // Cálculo de X acumulando los anchos previos + márgenes
            // (Usamos un offset calculado para evitar errores de redondeo)
            const previoAnchoYMargen = fila.items.slice(0, idxItem).reduce((acc, curr, i) => {
                const adj = (i < residuoTotal) ? 1 : 0;
                return acc + anchoIndividual + adj + margenInterno;
            }, margenLateral);

            rep.todos.forEach(h => {
                h.left = previoAnchoYMargen;
                h.width = anchoConAjuste;
                h.top = currentY;
                h.height = altoFilaEfectivo;
                resultadoFinal.push(h);
            });
        });

        currentY += altoFilaEfectivo + margenInterno;
    });

    return resultadoFinal;
}
*/







/**
 * Procesa un layout distribuyendo el alto de las filas por porcentajes.
 * @param {number} anchoContenedor
 * @param {number} altoContenedor
 * @param {Array} arregloHijos
 * @param {Array<number>} porcentajesFilas - Ej: [10, 20, 20, 50] (debe sumar 100)
 * @param {number} toleranciaVertical
 */
procesarLayoutPorcentual(anchoContenedor, altoContenedor, arregloHijos, porcentajesFilas, toleranciaVertical = 15) {
    if (!arregloHijos || arregloHijos.length === 0) return [];

    const margenLateral = 10;
    const margenInterno = 6;

    // 1. Agrupar Gemelos y Filas (Igual que antes)
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

    // 2. Cálculo de Espacio Vertical Disponible
    // Restamos todos los márgenes internos del alto total para saber cuánto espacio real queda
    const totalMargenesVerticales = margenInterno * (filas.length + 1);
    const altoUtilVertical = altoContenedor - totalMargenesVerticales;

    // 3. Generar Layout
    const resultadoFinal = [];
    let currentY = margenInterno;

    filas.forEach((fila, idxFila) => {
        // Obtenemos el porcentaje para esta fila. Si no existe en el array, usamos lo que sobre o un valor residual.
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
                h.height = altoFilaEfectivo; // El alto ahora es proporcional
                resultadoFinal.push(h);
            });
        });

        currentY += altoFilaEfectivo + margenInterno;
    });

    return resultadoFinal;
}















 }





