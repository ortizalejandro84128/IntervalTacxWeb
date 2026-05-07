class Boton extends Window {
  constructor({id, top, left, width, height, texto = "", fn, color = "primary", fontSize}) {
    super({id, top, left, width, height, texto});
    this.fn = fn;
    this.color = color; 
    this.fontSize = fontSize || 30;
    this.crear();
  }

  // Cambia el texto del botón
  setTexto(nuevoTexto) {
    this.texto = nuevoTexto;
    this.elemento.textContent = nuevoTexto;
  }

  // Cambia el color de Bootstrap (primary, success, warning, danger, etc.)
  setColor(nuevoColor) {
    this.elemento.classList.remove(`btn-${this.color}`);
    this.color = nuevoColor;
    this.elemento.classList.add(`btn-${this.color}`);
  }

  crear() {
    const btn = document.createElement("button");
    btn.id = this.id;
    btn.className = `boton btn btn-${this.color} position-absolute`;
    btn.style.top = this.top + "px";
    btn.style.left = this.left + "px";
    btn.style.width = this.width + "px";
    btn.style.height = this.height + "px";
    btn.style.fontSize = this.fontSize + "px";
    btn.style.fontWeight = "bold"; 

    btn.textContent = this.texto;

    btn.addEventListener("click", () => {
      if (this.fn) this.fn();
    });

    this.elemento = btn;
  }
}