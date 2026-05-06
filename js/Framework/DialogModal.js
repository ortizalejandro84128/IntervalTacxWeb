class DialogModal extends Window {
  constructor({ id, width = 500, height = 300, titulo }) {
    super({ id, top: 0, left: 0, width, height, texto: titulo });
    this.hijos = [];
    this.scaleMax = 1.8;
    this._onResize = null; // Inicializamos para evitar errores al remover
    this.crear();
  }

  crear() {
    // 1. Backdrop (Fondo oscuro)
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop fade show";
    Object.assign(this.backdrop.style, {
        zIndex: "10000", // Por encima de los Dialog normales (9999)
        display: "none"
    });

    // 2. Contenedor Principal (Cubre toda la pantalla)
    this.elemento = document.createElement("div");
    this.elemento.id = this.id;
    // Usamos modal de Bootstrap pero forzamos el display flex para centrar
    this.elemento.className = "modal fade show"; 
    Object.assign(this.elemento.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        display: "none",
        zIndex: "10001",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none", // El contenedor no atrapa clicks...
        overflow: "hidden"
    });

    // 3. El Diálogo (La caja blanca)
    const dialog = document.createElement("div");
    dialog.className = "modal-dialog shadow-lg"; 
    Object.assign(dialog.style, {
        width: `${this.width}px`,
        minWidth: `${this.width}px`,
        pointerEvents: "auto", // ...pero el diálogo SÍ
        flexShrink: "0",
        margin: "0",
        transformOrigin: "center center"
    });

    const content = document.createElement("div");
    content.className = "modal-content border-0";

    const header = document.createElement("div");
    header.className = "modal-header bg-primary text-white py-2";
    
    const title = document.createElement("h5");
    title.className = "modal-title fs-6"; // Texto un poco más pequeño para mobile
    title.innerText = this.texto;
    header.appendChild(title);

    // 4. El Body
    this.bodyContainer = document.createElement("div");
    this.bodyContainer.className = "modal-body";
    Object.assign(this.bodyContainer.style, {
        height: `${this.height}px`,
        position: "relative",
        overflowY: "auto",
        width: "100%",
        padding: "15px"
    });

    content.appendChild(header);
    content.appendChild(this.bodyContainer);
    dialog.appendChild(content);
    this.elemento.appendChild(dialog);
    this.dialogElement = dialog;

    // IMPORTANTE: Asegúrate de que #app no tenga 'overflow: hidden' o 'transform'
    // Si falla, cámbialo a document.body.appendChild
    const target = document.getElementById("app") || document.body;
    target.appendChild(this.backdrop);
    target.appendChild(this.elemento);
  }

  agregarHijo(hijo) {
    this.hijos.push(hijo);
    if (hijo.elemento) {
      this.bodyContainer.appendChild(hijo.elemento);
      hijo.padre = this;
    }
  }

  getScale() {
    const margen = 40; // Más margen para que no toque los bordes
    const sW = (window.innerWidth - margen) / this.width;
    const sH = (window.innerHeight - margen) / (this.height + 60); // +60 por el header
    return Math.min(this.scaleMax, sW, sH);
  }

  applyScaleModal() {
    if (!this.dialogElement) return;
    const scale = this.getScale();
    // Usamos translate3d(0,0,0) para asegurar que el navegador lo ponga en una capa de renderizado nueva
    this.dialogElement.style.transform = `translate3d(0,0,0) scale(${scale})`;
  }

  mostrar() {
    this.backdrop.style.display = "block";
    this.elemento.style.display = "flex";
    
    // Pequeño delay para que el navegador registre el cambio de display antes de escalar
    requestAnimationFrame(() => {
        this.applyScaleModal();
    });

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