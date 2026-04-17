class Label extends Window {
  constructor({id, top, left, width, height, texto}) {
    super({id, top, left, width, height, texto});
    this.crear();
  }

  crear() {
    const lbl = document.createElement("div");
    lbl.id = this.id;
    lbl.className = "label";
    lbl.textContent = this.texto;
    lbl.style.top = this.top + "px";
    lbl.style.left = this.left + "px";
    lbl.style.width = this.width + "px";
    lbl.style.height = this.height + "px";
    lbl.style.padding = "5px";
    this.elemento = lbl;
  }

  actualizarTexto(nuevoTexto) {
    this.elemento.textContent = nuevoTexto;
  }

  setTamaño(px) {
    this.elemento.style.fontSize = px + "px";
  }

  setColor(color) {
    this.elemento.style.color = color;
  }
}
