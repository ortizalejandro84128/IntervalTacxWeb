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
        //this.fnCerrar(data);
        this.showAlert(JSON.stringify(this.getForm(),null,2));
        //this.cerrar();
        
      }
    });




    

    // Agregar todos los hijos
    this.agregarHijo(lblNombre);
    this.agregarHijo(editNombre);
    this.agregarHijo(lblFtp);
    this.agregarHijo(editFtp);
    this.agregarHijo(btnMostrar);
  }

}
