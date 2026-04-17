class EditBox extends Window {
  constructor({id, top, left, width, height, texto, editable = true}) {
    super({id, top, left, width, height, texto});
    this.editable = editable;
    this.crear();
  }

  crear() {
    const input = document.createElement("input");
    input.id = this.id;
    input.className = "form-control editbox";
    input.value = this.texto;
    input.style.position = "absolute";
    input.style.top = this.top + "px";
    input.style.left = this.left + "px";
    input.style.width = this.width + "px";
    input.style.height = this.height + "px";
    input.readOnly = !this.editable; // controla si es editable
    this.elemento = input;
  }

  setEditable(flag) {
    this.editable = flag;
    this.elemento.readOnly = !flag;
  }

  actualizarTexto(nuevoTexto) {
    this.texto = nuevoTexto;
    this.elemento.value = nuevoTexto;
  }

  obtenerTexto() {
    return this.elemento.value;
  }
}
