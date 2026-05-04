class Boton extends Window {
  constructor({id, top, left, width, height, texto = "", fn, color = "primary", iconoSVG = null, fontSize}) {
    super({id, top, left, width, height, texto});
    this.fn = fn;
    this.color = color; 
    this.iconoSVG = iconoSVG; // nuevo parámetro para SVG
    this.crear();
    this.fontSize=fontSize||30;
  }

  crear() {
    const btn = document.createElement("button");
    btn.id = this.id;
    btn.className = `boton btn btn-${this.color}`;
    btn.style.top = this.top + "px";
    btn.style.left = this.left + "px";
    btn.style.width = this.width + "px";
    btn.style.height = this.height + "px";

    // Estilos base
    btn.style.fontSize = this.fontSize+"px";
    btn.style.fontWeight = "bold"; 
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.gap = "5px"; // espacio entre icono y texto
    //alert(this.iconoSVG);
    // Contenido dinámico
    if (this.iconoSVG) {
      const svgWrapper = document.createElement("span");
      svgWrapper.innerHTML = this.iconoSVG;
      svgWrapper.style.width = "54px";
      svgWrapper.style.height = "54px";
      btn.appendChild(svgWrapper);
    }

    if (this.texto) {
      const span = document.createElement("span");
      span.textContent = this.texto;
      btn.appendChild(span);
    }

    // Evento click
    btn.addEventListener("click", () => {
      if (this.fn) this.fn();
    });

    this.elemento = btn;
  }
}
