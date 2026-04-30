class Contenedor extends Window {
  constructor({id, top, left, width, height, texto}) {
    super({id, top, left, width, height, texto});
    this.crear();
  }

  crear() {
    const div = document.createElement("div");
    div.id = this.id;
    div.className = "contenedor border";
    div.style.top = this.top + "px";
    div.style.left = this.left + "px";
    div.style.width = this.width + "px";
    div.style.height = this.height + "px";
    div.style.overflow = "auto";
    this.elemento = div;
  }


}
