class Boton extends Window {
  constructor({id, top, left, width, height, texto, fn}) {
    super({id, top, left, width, height, texto});
    this.fn = fn;
    this.crear();
  }

  crear() {
    const btn = document.createElement("button");
    btn.id = this.id;
    btn.className = "boton btn btn-primary";
    btn.textContent = this.texto;
    btn.style.top = this.top + "px";
    btn.style.left = this.left + "px";
    btn.style.width = this.width + "px";
    btn.style.height = this.height + "px";
    
    btn.style.fontSize = "7px"; // base pequeña para escalar
    btn.style.fontWeight = "bold"; 
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";

    btn.addEventListener("click", () => {
      if (this.fn) this.fn();
    });
    this.elemento = btn;
  }


}
