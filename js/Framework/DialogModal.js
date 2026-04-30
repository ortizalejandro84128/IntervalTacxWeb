class DialogModal extends Window {
  constructor({ id, width = 500, height = 300, titulo }) {
    super({ id, top: 0, left: 0, width, height, texto: titulo });
    this.hijos = [];
    this.crear();
  }

  crear() {
    // Backdrop dentro de #app
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop";
    this.backdrop.style.position = "fixed";
    this.backdrop.style.top = "0";
    this.backdrop.style.left = "0";
    this.backdrop.style.width = "100%";
    this.backdrop.style.height = "100%";
    this.backdrop.style.backgroundColor = "rgba(0,0,0,0.5)";
    this.backdrop.style.zIndex = "1999";
    this.backdrop.style.display = "none";
    this.backdrop.style.pointerEvents = "auto";
    document.getElementById("app").appendChild(this.backdrop);

    // Contenedor modal dentro de #app
    this.elemento = document.createElement("div");
    this.elemento.className = "modal";
    this.elemento.id = this.id;
    this.elemento.style.position = "fixed";
    this.elemento.style.top = "50%";
    this.elemento.style.left = "50%";
    this.elemento.style.transform = "translate(-50%, -50%)";
    this.elemento.style.zIndex = "2000";
    this.elemento.style.display = "none";

    const dialog = document.createElement("div");
    dialog.className = "modal-dialog modal-dialog-centered";
    dialog.style.maxWidth = this.width + "px";

    const content = document.createElement("div");
    content.className = "modal-content";

    const header = document.createElement("div");
    header.className = "modal-header bg-primary text-white";
    const title = document.createElement("h5");
    title.className = "modal-title";
    title.innerText = this.texto;
    header.appendChild(title);
    this.title=title;

    this.bodyContainer = document.createElement("div");
    this.bodyContainer.className = "modal-body";
    this.bodyContainer.style.height = (this.height - 100) + "px";
    this.bodyContainer.style.overflowY = "auto";

    /*const footer = document.createElement("div");
    footer.className = "modal-footer";
    const btnClose = document.createElement("button");
    btnClose.className = "btn btn-secondary";
    btnClose.innerText = "Cerrar";
    btnClose.onclick = () => this.cerrar();
    footer.appendChild(btnClose);*/

    content.appendChild(header);
    content.appendChild(this.bodyContainer);
    //content.appendChild(footer);
    dialog.appendChild(content);
    this.elemento.appendChild(dialog);

    document.getElementById("app").appendChild(this.elemento);
  }

  agregarHijo(hijo) {
    this.hijos.push(hijo);
    this.bodyContainer.appendChild(hijo.elemento);
    hijo.padre = this;
  }

  getScale() {
    const availableWidth = window.innerWidth - 20;
    return Math.min(1, availableWidth / this.width);
  }

  applyScaleModal() {
    if (!this.elemento) return;

    const scale = this.getScale();
    const dialog = this.elemento.querySelector(".modal-dialog");

    if (dialog) {
      dialog.style.maxWidth = this.width + "px";
    }

    // Combinar translate (para centrado) + scale
    this.elemento.style.transform = `translate(-50%, -50%) scale(${scale})`;
    this.elemento.style.transformOrigin = "center center";
  }

  mostrar() {
    this.backdrop.style.display = "block";
    this.elemento.style.display = "block";
    this.applyScaleModal();
  }

  cerrar() {
    this.backdrop.style.display = "none";
    this.elemento.style.display = "none";
  }
}
