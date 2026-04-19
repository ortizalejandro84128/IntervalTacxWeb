class AlertWindow extends Window {
  constructor({ id, mensaje }) {
    super({ id, top: 0, left: 0, width: 400, height: 200, texto: mensaje });

    // Backdrop dentro de #app
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop";
    this.backdrop.style.position = "fixed";
    this.backdrop.style.top = "0";
    this.backdrop.style.left = "0";
    this.backdrop.style.width = "100%";
    this.backdrop.style.height = "100%";
    this.backdrop.style.backgroundColor = "rgba(0,0,0,0.5)";
    this.backdrop.style.zIndex = "2099";
    this.backdrop.style.display = "none";
    this.backdrop.style.pointerEvents = "auto";
    document.getElementById("app").appendChild(this.backdrop);

    // Contenedor modal dentro de #app
    this.elemento = document.createElement("div");
    this.elemento.className = "modal";
    this.elemento.id = id;
    this.elemento.style.position = "fixed";
    this.elemento.style.top = "50%";
    this.elemento.style.left = "50%";
    this.elemento.style.transform = "translate(-50%, -50%)";
    this.elemento.style.zIndex = "2100"; // más alto que DialogModal
    this.elemento.style.display = "none";

    const dialog = document.createElement("div");
    dialog.className = "modal-dialog modal-dialog-centered";

    const content = document.createElement("div");
    content.className = "modal-content";

    const header = document.createElement("div");
    header.className = "modal-header bg-info text-white";
    const title = document.createElement("h5");
    title.className = "modal-title";
    title.innerText = "Alerta";
    header.appendChild(title);

    this.body = document.createElement("div");
    this.body.className = "modal-body";
    this.body.innerText = mensaje;

    const footer = document.createElement("div");
    footer.className = "modal-footer";
    const btnClose = document.createElement("button");
    btnClose.className = "btn btn-secondary";
    btnClose.innerText = "Cerrar";
    btnClose.onclick = () => this.cerrar();
    footer.appendChild(btnClose);

    content.appendChild(header);
    content.appendChild(this.body);
    content.appendChild(footer);
    dialog.appendChild(content);
    this.elemento.appendChild(dialog);

    document.getElementById("app").appendChild(this.elemento);

    this.factorPantalla=.4;
  }

  setMensaje(mensaje) {
    if (this.body) {
      this.body.innerText = mensaje;
    }
  }

  mostrar() {
    this.backdrop.style.display = "block";
    this.elemento.style.display = "block";
  }

  cerrar() {
    this.backdrop.style.display = "none";
    this.elemento.style.display = "none";
  }
}
