class Window {
  constructor({id, top, left, width, height, texto}) {
    this.id = id;
    this.top = top;
    this.left = left;
    this.width = width;
    this.height = height;
    this.texto = texto;
    this.padre = null;
    this.elemento = null;
    this.hijos = [];
  }

agregarHijo(hijo) {
    this.hijos.push(hijo);
  }

  addChildLabel({ id, top, left, width, height, texto, fontSize = "16px", color = "black", fontWeight = "normal" }) {
    const lbl = new Label({ id, top, left, width, height, texto });
    // aplicar estilos adicionales
    if (lbl.elemento) {
      lbl.elemento.style.fontSize = fontSize;
      lbl.elemento.style.color = color;
      lbl.elemento.style.fontWeight = fontWeight;
    }
    this.agregarHijo(lbl);
    return lbl;
  }

  addChildEditBox({ id, top, left, width, height, texto }) {
    const edit = new EditBox({ id, top, left, width, height, texto });
    this.agregarHijo(edit);
    return edit;
  }

  addChildBoton({ id, top, left, width, height, texto, fn }) {
    const btn = new Boton({ id, top, left, width, height, texto, fn });
    this.agregarHijo(btn);
    return btn;
  }

  addChildFileInput({ id, top, left, width, height, accept, fn }) {
    const fileInput = new FileInput({ id, top, left, width, height, accept, fn });
    this.agregarHijo(fileInput);
    return fileInput;
  }


  getChildById(id) {
  return this.hijos.find(h => h.id === id) || null;
}

setChildEnabled(id, enabled) {
    const child = this.getChildById(id);
    if (child && child.elemento) {
      child.elemento.disabled = !enabled;
    }
  }

    deshabilitar() {
    this.elemento.disabled = true;
  }
  habilitar() {
    this.elemento.disabled = false;
  }

  hide() {
    this.elemento.style.display = "none";
  }

  // Mostrar el input
  show() {
    this.elemento.style.display = "block";
  }

  showAlert(mensaje) {
    // Reutilizar instancia si ya existe
    if (!this._alertWindow) {
      this._alertWindow = new AlertWindow({ id: "alertWindow", mensaje });
    } else {
      this._alertWindow.setMensaje(mensaje);
    }
    this._alertWindow.mostrar();
  }

 // 🔑 Nuevo: setear valores desde JSON 
 // solo setear hijos cuyo id no inicie con lbl para evitar sobreescribir textos de etiquetas 
 setForm(json) {
    this.hijos.forEach(hijo => {
      if (hijo.id && hijo.id.startsWith("lbl")) {
        return;
      }
      if (json[hijo.id] !== undefined) {
        if (hijo instanceof Label) {
          hijo.actualizarTexto(json[hijo.id]);
        } else if (hijo instanceof EditBox) {
          hijo.actualizarTexto(json[hijo.id]);
        }
      }
    });
  }

  // 🔑 Nuevo: obtener valores como JSON
  getForm() {
    const result = {};
    this.hijos.forEach(hijo => {
      if (hijo.id && hijo.id.startsWith("lbl")) {
        return;
      }
      if (hijo instanceof Label) {
        result[hijo.id] = hijo.elemento.textContent;
      } else if (hijo instanceof EditBox) {
        result[hijo.id] = hijo.obtenerTexto();
      }
    });
    return result;
  }

}
