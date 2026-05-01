class DialogModal extends Window {
  constructor({ id, width = 500, height = 300, titulo }) {
    super({ id, top: 0, left: 0, width, height, texto: titulo });
    this.hijos = [];
    this.crear();
  }

  crear() {
    // 1. Backdrop (Bootstrap standard)
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop fade show"; // Clases nativas
    this.backdrop.style.zIndex = "1999";
    this.backdrop.style.display = "none";
    document.getElementById("app").appendChild(this.backdrop);

    // 2. Contenedor Principal (Flex para centrar)
    this.elemento = document.createElement("div");
    this.elemento.className = "modal fade show"; // Clases nativas
    this.elemento.id = this.id;
    this.elemento.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      display: none; z-index: 2000;
      align-items: center; justify-content: center;
      pointer-events: none;
      overflow: hidden;
    `;

    // 3. El Diálogo (Lo que escalamos)
    const dialog = document.createElement("div");
    // Eliminamos 'modal-dialog-centered' porque ya lo centramos con el flex del padre
    dialog.className = "modal-dialog"; 
    dialog.style.cssText = `
      width: ${this.width}px;
      min-width: ${this.width}px;
      pointer-events: auto;
      flex-shrink: 0;
      margin: 0; /* Bootstrap pone márgenes que romperían el centrado flex */
    `;

    const content = document.createElement("div");
    content.className = "modal-content"; // Aquí Bootstrap aplica el fondo, bordes y sombras

    const header = document.createElement("div");
    header.className = "modal-header bg-primary text-white"; // Recuperamos el azul y blanco
    
    const title = document.createElement("h5");
    title.className = "modal-title";
    title.innerText = this.texto;
    header.appendChild(title);
    this.title = title;

    // 4. El Body
    this.bodyContainer = document.createElement("div");
    this.bodyContainer.className = "modal-body";
    // Solo tocamos lo mínimo necesario para el scroll y los hijos absolutos
    this.bodyContainer.style.cssText = `
      height: ${(this.height - 100)}px;
      position: relative;
      overflow-y: auto;
      width: 100%;
      background-color: inherit; /* Para que respete el fondo del tema */
    `;

    content.appendChild(header);
    content.appendChild(this.bodyContainer);
    dialog.appendChild(content);
    this.elemento.appendChild(dialog);
    this.dialogElement = dialog;

    document.getElementById("app").appendChild(this.elemento);
  }

  agregarHijo(hijo) {
    this.hijos.push(hijo);
    if (hijo.elemento) {
      this.bodyContainer.appendChild(hijo.elemento);
      hijo.padre = this;
    }
  }

  getScale() {
    const margen = 20;
    const sW = (window.innerWidth - margen) / this.width;
    const sH = (window.innerHeight - margen) / this.height;
    return Math.min(1.5, sW, sH);
  }

  applyScaleModal() {
    if (!this.dialogElement) return;
    const scale = this.getScale();
    this.dialogElement.style.transform = `scale(${scale})`;
    this.dialogElement.style.transformOrigin = "center center";
  }

  mostrar() {
    this.backdrop.style.display = "block";
    this.elemento.style.display = "flex";
    this.applyScaleModal();
    this._onResize = () => this.applyScaleModal();
    window.addEventListener('resize', this._onResize);
  }

  cerrar() {
    this.backdrop.style.display = "none";
    this.elemento.style.display = "none";
    window.removeEventListener('resize', this._onResize);
  }
}