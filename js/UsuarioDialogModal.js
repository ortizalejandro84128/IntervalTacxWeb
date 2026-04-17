class UsuarioDialogModal extends DialogModal {
  constructor(mainApp, fnCerrar) {
    super({ id: "usuarioDialogModal", width: 600, height: 500, titulo: "Usuario" });
    this.mainApp = mainApp;
    this.fnCerrar=fnCerrar;
    this.crearInterfaz();
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
    const btnMostrar = new Boton({
      id: "btnMostrar",
      top: 270,
      left: 20,
      width: 150,
      height: 40,
      texto: "Cerrar",
      //fn: this.cerrar.bind(this)
      fn: () => {
        const data = this.getForm();
        this.fnCerrar(data);
        this.cerrar();
        
      }
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
    this.agregarHijo(btnMostrar);
  }

}
