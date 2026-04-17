class UsuarioDialog extends Dialog {
  constructor(mainApp) {
    super({id: "usuarioDialog", width: 600, height: 500, texto: "Usuario"});
    this.crearInterfaz();
    this.mainApp = mainApp;
    this.cargarUsuarioGuardado();
  }

  cargarUsuarioGuardado() {
    const json = localStorage.getItem("usuarioTrainer");
    if (!json) {
      return;
    }

    try {
      const data = JSON.parse(json);
      this.setForm(data);
    } catch (error) {
      console.error("Error al cargar usuario desde localStorage:", error);
    }
  }

  crearInterfaz() {
    // Nombre
    const lblNombre = new Label({
      id: "lblNombre",
      top: 20,
      left: 20,
      width: 100,
      height: 30,
      texto: "Nombre:"
    });
    const editNombre = new EditBox({
      id: "nombre_VSTR",
      top: 20,
      left: 130,
      width: 200,
      height: 30,
      texto: "",
      editable: true
    });

    // FTP (int)
    const lblFtp = new Label({
      id: "lblFtp",
      top: 70,
      left: 20,
      width: 100,
      height: 30,
      texto: "FTP:"
    });
    const editFtp = new EditBox({
      id: "ftp_VINT",
      top: 70,
      left: 130,
      width: 200,
      height: 30,
      texto: "",
      editable: true
    });

    // Peso (float)
    const lblPeso = new Label({
      id: "lblPeso",
      top: 120,
      left: 20,
      width: 100,
      height: 30,
      texto: "Peso:"
    });
    const editPeso = new EditBox({
      id: "peso_VFLOAT",
      top: 120,
      left: 130,
      width: 200,
      height: 30,
      texto: "",
      editable: true
    });

    // Edad (int)
    const lblEdad = new Label({
      id: "lblEdad",
      top: 170,
      left: 20,
      width: 100,
      height: 30,
      texto: "Edad:"
    });
    const editEdad = new EditBox({
      id: "edad_VINT",
      top: 170,
      left: 130,
      width: 200,
      height: 30,
      texto: "",
      editable: true
    });

    // CDA (float)
    const lblCda = new Label({
      id: "lblCda",
      top: 220,
      left: 20,
      width: 100,
      height: 30,
      texto: "CDA:"
    });
    const editCda = new EditBox({
      id: "cda_VFLOAT",
      top: 220,
      left: 130,
      width: 200,
      height: 30,
      texto: "",
      editable: true
    });

    // Botón para mostrar datos
    const btnGuardar = new Boton({
      id: "btnGuardar",
      top: 270,
      left: 20,
      width: 150,
      height: 40,
      texto: "Guarda datos usuario",
      fn: this.ValidaForm.bind(this)
      /*fn: () => {
        const data = this.getForm();
        alert("Datos del usuario:\n" + JSON.stringify(data, null, 2));
      }*/
    });




    

    // Agregar todos los hijos
    this.agregarHijo(lblNombre);
    this.agregarHijo(editNombre);
    this.agregarHijo(lblFtp);
    this.agregarHijo(editFtp);
    this.agregarHijo(lblPeso);
    this.agregarHijo(editPeso);
    this.agregarHijo(lblEdad);
    this.agregarHijo(editEdad);
    this.agregarHijo(lblCda);
    this.agregarHijo(editCda);
    this.agregarHijo(btnGuardar);
  }

  ValidaForm() {
    const data = this.getForm();

//    console.log(JSON.stringify(data, null, 2));
//    alert("Datos del usuario:\n" + JSON.stringify(data, null, 2));
    const validator = new FormValidator();

    const res = validator.validar(data);

    this.setError(res);

    // Verificar si hay errores
    const keysErrores = Object.keys(res);
    if (keysErrores.length > 0) {
      // Hay errores → permanecer en el diálogo
      const primerCampo = keysErrores[0];
      const hijoConError = this.hijos.find(h => h.id === primerCampo);
      if (hijoConError && hijoConError.elemento) {
        hijoConError.elemento.focus();
      }
      alert("Errores detectados:\n" + JSON.stringify(res, null, 2));
    } else {
      try {
        localStorage.setItem("usuarioTrainer", JSON.stringify(data));
      } catch (error) {
        console.error("No se pudo guardar el usuario en localStorage:", error);
      }

    }
  }
}
