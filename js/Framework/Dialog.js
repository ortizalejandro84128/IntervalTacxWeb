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
    div.className = "dialog shadow rounded";
    div.style.position = "absolute";
    div.style.maxWidth = "100vw";
    div.style.maxHeight = "90vh";
    div.style.overflow = "auto";
    document.getElementById("app").appendChild(div);
    this.elemento = div;
    window.addEventListener('resize', this.resize.bind(this));
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




  getScale() {
    const availableWidth = window.innerWidth - 20;
    return Math.min(1, availableWidth / this.width);
  }

  applyScale() {
    if (!this.elemento) return;

    const scale = this.getScale();
    this.elemento.style.transform = `scale(${scale})`;
    this.elemento.style.transformOrigin = "top left";
    this.elemento.style.width = this.width + "px";
    this.elemento.style.height = this.height + "px";
  }

  centrar() {
    if (this.elemento && this.focus) {
      this.applyScale();

      const scale = this.getScale();
      const renderedWidth = this.width * scale;
      const renderedHeight = this.height * scale;

      const left = Math.max(10, (window.innerWidth - renderedWidth) / 2);
      const top = Math.max(10, (window.innerHeight - renderedHeight) / 2);

      this.elemento.style.left = `${left}px`;
      this.elemento.style.top = `${top}px`;
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





