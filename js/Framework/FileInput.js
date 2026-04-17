class FileInput extends Window {
  constructor({ id, top, left, width, height, accept = "" , fn}) {
    super({ id, top, left, width, height });
    this.fn = fn;

    // Crear el elemento <input type="file">
this.elemento = document.createElement("input");
this.elemento.type = "file";
this.elemento.id = id;
this.elemento.accept = ".erg2";
this.elemento.style.position = "absolute";
this.elemento.style.top = top + "px";
this.elemento.style.left = left + "px";
this.elemento.style.width = width + "px";
this.elemento.style.height = height + "px";
this.elemento.style.fontSize = "8px";
this.elemento.style.padding = "2px";
this.elemento.style.boxSizing = "border-box";
this.elemento.className = "form-control";

    // Callback que el programador puede asignar
    this.onFileLoaded = fn;

    // Escuchar selección de archivo
    var self = this;
    this.elemento.addEventListener("change", function () {
      if (self.elemento.files.length > 0) {
        var file = self.elemento.files[0];
        var reader = new FileReader();

        reader.onload = function (e) {
          var contenido = e.target.result;
          // Si hay callback definido, lo ejecutamos
          if (typeof self.onFileLoaded === "function") {
            self.onFileLoaded(file, contenido);
          }
        };

        reader.onerror = function (e) {
          console.error("Error leyendo archivo:", e);
        };

        // Leer como texto (puedes cambiar a readAsArrayBuffer si necesitas binario)
        reader.readAsText(file);
      }
    });
  }

  // Devuelve el archivo seleccionado
  getFile() {
    return this.elemento.files.length > 0 ? this.elemento.files[0] : null;
  }

  // Devuelve el contenido del archivo (si ya fue cargado)
  getContent(callback) {
    const file = this.getFile();
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        callback(e.target.result);
      };
      reader.readAsText(file);
    }
  }
}
