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


/*    centrar() {
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
/*
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
    const lay = this.escalarLayout(info.layout, factor);
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
}*/

/*

centrar() {//reescala siempre por imagen despues de layout
  if (!this.focus) return;

  const info = this.seleccionarLayout();
  let factor = this.calcularFactor(info.bounds);

  // Layout base
  const layoutBase = info.layout;

  if (factor >= 1) {
    // Escalado por coordenadas
    const lay = this.escalarLayout(layoutBase, factor);
    this.aplicarLayout(lay);

    // Reset transform
    this.elemento.style.transform = "";
    this.elemento.style.transformOrigin = "";
  } else {
    // Escalado como imagen
    this.aplicarLayout(layoutBase); // aplica layout base sin escalar
    this.elemento.style.transform = `scale(${factor})`;
    this.elemento.style.transformOrigin = "top left";
  }

  // 🔹 Ajuste final: ocupar toda la pantalla
  const renderedWidth = info.bounds.width * factor;
  const renderedHeight = info.bounds.height * factor;

  const left = Math.max(0, (window.innerWidth - renderedWidth) / 2);
  const top = Math.max(0, (window.innerHeight - renderedHeight) / 2);

  this.elemento.style.left = `${left}px`;
  this.elemento.style.top = `${top}px`;
  this.elemento.style.width = `${renderedWidth}px`;
  this.elemento.style.height = `${renderedHeight}px`;

  // 🔹 Escalado adicional para llenar pantalla en ambos ejes
  const scaleX = window.innerWidth / renderedWidth;
  const scaleY = window.innerHeight / renderedHeight;
  const finalScale = Math.min(scaleX, scaleY);

  this.elemento.style.transform += ` scale(${finalScale})`;
}*/

centrar() {//estira hasta 20% extra por imagen
  if (!this.focus) return;

  const info = this.seleccionarLayout();
  let factor = this.calcularFactor(info.bounds);

  const layoutBase = info.layout;

  if (factor >= 1) {
    // Escalado por coordenadas
    const lay = this.escalarLayout(layoutBase, factor);
    this.aplicarLayout(lay);
    this.elemento.style.transform = "";
    this.elemento.style.transformOrigin = "";
  } else {
    // Escalado como imagen
    this.aplicarLayout(layoutBase);
    this.elemento.style.transform = `scale(${factor})`;
    this.elemento.style.transformOrigin = "top left";
  }

  // Dimensiones renderizadas
  const renderedWidth = info.bounds.width * factor;
  const renderedHeight = info.bounds.height * factor;

  const left = Math.max(0, (window.innerWidth - renderedWidth) / 2);
  const top = Math.max(0, (window.innerHeight - renderedHeight) / 2);

  this.elemento.style.left = `${left}px`;
  this.elemento.style.top = `${top}px`;
  this.elemento.style.width = `${renderedWidth}px`;
  this.elemento.style.height = `${renderedHeight}px`;

  // Escalado adicional para llenar pantalla
  let scaleX = window.innerWidth / renderedWidth;
  let scaleY = window.innerHeight / renderedHeight;

  // 🔹 Limitar desproporción a 20%
  const ratio = scaleX / scaleY;
  if (ratio > 1.2) {
    scaleX = scaleY * 1.2;
  } else if (ratio < 0.8) {
    scaleY = scaleX * 1.2;
  }

  this.elemento.style.transform += ` scale(${scaleX}, ${scaleY})`;
}


/*
centrar() {//estira 100%
  if (!this.focus) return;

  const info = this.seleccionarLayout();
  let factor = this.calcularFactor(info.bounds);

  // Layout base
  const layoutBase = info.layout;

  if (factor >= 1) {
    // Escalado por coordenadas
    const lay = this.escalarLayout(layoutBase, factor);
    this.aplicarLayout(lay);

    this.elemento.style.transform = "";
    this.elemento.style.transformOrigin = "";
  } else {
    // Escalado como imagen
    this.aplicarLayout(layoutBase); // aplica layout base sin escalar
    this.elemento.style.transform = `scale(${factor})`;
    this.elemento.style.transformOrigin = "top left";
  }

  // 🔹 Ajuste final: ocupar toda la pantalla aunque se deforme
  const renderedWidth = info.bounds.width * factor;
  const renderedHeight = info.bounds.height * factor;

  const left = Math.max(0, (window.innerWidth - renderedWidth) / 2);
  const top = Math.max(0, (window.innerHeight - renderedHeight) / 2);

  this.elemento.style.left = `${left}px`;
  this.elemento.style.top = `${top}px`;
  this.elemento.style.width = `${renderedWidth}px`;
  this.elemento.style.height = `${renderedHeight}px`;

  // Escalado independiente en X y Y para llenar pantalla
  const scaleX = window.innerWidth / renderedWidth;
  const scaleY = window.innerHeight / renderedHeight;

  this.elemento.style.transform += ` scale(${scaleX}, ${scaleY})`;
}
*/







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
    console.log("render de interval control");
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


 }





