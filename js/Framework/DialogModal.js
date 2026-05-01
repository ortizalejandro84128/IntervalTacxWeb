class DialogModal extends Window {
  constructor({ id, width = 500, height = 300, titulo }) {
    super({ id, top: 0, left: 0, width, height, texto: titulo });
    this.hijos = [];
    this.crear();
  }

  crear() {
    // 🧱 Backdrop
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop";
    this.backdrop.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0,0,0,0.5); z-index: 1999; display: none;
    `;
    document.getElementById("app").appendChild(this.backdrop);

    // 📦 Contenedor principal (El que centra)
    this.elemento = document.createElement("div");
    this.elemento.className = "modal";
    this.elemento.id = this.id;
    this.elemento.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      display: none; z-index: 2000;
      align-items: center; justify-content: center;
      pointer-events: none;
    `;

    const dialog = document.createElement("div");
    dialog.className = "modal-dialog";
    dialog.style.width = this.width + "px";
    dialog.style.pointerEvents = "auto"; 
    // Mantenemos la flexibilidad del alto si fuera necesario
    dialog.style.margin = "0"; 

    const content = document.createElement("div");
    content.className = "modal-content";

    const header = document.createElement("div");
    header.className = "modal-header bg-primary text-white";
    const title = document.createElement("h5");
    title.className = "modal-title";
    title.innerText = this.texto;
    header.appendChild(title);
    this.title = title;

    // 🛠️ EL FIX: Agregamos position relative para que los hijos absolutos se vean
    this.bodyContainer = document.createElement("div");
    this.bodyContainer.className = "modal-body";
    this.bodyContainer.style.cssText = `
      height: ${(this.height - 100)}px;
      overflow-y: auto;
      position: relative; 
      width: 100%;
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
    this.bodyContainer.appendChild(hijo.elemento);
    hijo.padre = this;
  }

  getScale() {
    const margen = 20;
    const sW = (window.innerWidth - margen) / this.width;
    const sH = (window.innerHeight - margen) / this.height;
    // Escala hasta 1.5x y hacia abajo sin límite
    return Math.min(1.5, sW, sH);
  }

  applyScaleModal() {
    if (!this.dialogElement) return;
    const scale = this.getScale();
    
    // Al usar Flexbox en el padre, scale(X) mantiene el centrado perfecto
    this.dialogElement.style.transform = `scale(${scale})`;
    this.dialogElement.style.transformOrigin = "center center";
  }

  mostrar() {
    this.backdrop.style.display = "block";
    this.elemento.style.display = "flex"; 
    this.applyScaleModal();
    // Re-calcula si el usuario cambia el tamaño de la ventana
    this._onResize = () => this.applyScaleModal();
    window.addEventListener('resize', this._onResize);
  }

  cerrar() {
    this.backdrop.style.display = "none";
    this.elemento.style.display = "none";
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
    }
  }
}