class FileInput extends Boton {
  constructor({ id, top, left, width, height, texto = "Cargar .Erg", accept = ".erg2", fn }) {
    super({ id, top, left, width, height, texto, fn: null, color:'secondary' }); 
    this.accept = accept;
    this.onFileLoaded = fn;

    // Crear input oculto
    this._input = document.createElement("input");
    this._input.type = "file";
    this._input.accept = this.accept;
    this._input.style.display = "none";

    // Al hacer click en el botón, disparar el input oculto
    this.elemento.addEventListener("click", () => this._input.click());

    // Escuchar selección de archivo
    this._input.addEventListener("change", () => {
      if (this._input.files.length > 0) {
        const file = this._input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
          const contenido = e.target.result;
          if (typeof this.onFileLoaded === "function") {
            this.onFileLoaded(file, contenido);
          }
        };

        reader.onerror = (e) => {
          console.error("Error leyendo archivo:", e);
        };

        reader.readAsText(file);
      }
    });

   
  }

  // Devuelve el archivo seleccionado
  getFile() {
    return this._input.files.length > 0 ? this._input.files[0] : null;
  }

  // Devuelve el contenido del archivo (si ya fue cargado)
  getContent(callback) {
    const file = this.getFile();
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => callback(e.target.result);
      reader.readAsText(file);
    }
  }
}
