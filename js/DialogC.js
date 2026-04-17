class DialogC extends Dialog {
  constructor() {
    super({id: "dialogC", width: 400, height: 250, texto: "Dialog C"});
    this.crearInterfaz();
  }

  crearInterfaz() {
    const label = new Label({
      id: "lblC",
      top: 20,
      left: 20,
      width: 200,
      height: 30,
      texto: "Label inicial"
    });

    const editBox = new EditBox({
      id: "editC",
      top: 70,
      left: 20,
      width: 200,
      height: 30,
      texto: "Texto inicial",
      editable: true
    });

    const botonSet = new Boton({
      id: "btnSet",
      top: 120,
      left: 20,
      width: 120,
      height: 40,
      texto: "Set Form",
      fn: () => {
        this.setForm({
          lblC: "Nuevo texto desde JSON",
          editC: "Texto cargado dinámicamente"
        });
      }
    });

    const botonGet = new Boton({
      id: "btnGet",
      top: 170,
      left: 20,
      width: 120,
      height: 40,
      texto: "Get Form",
      fn: () => {
        const data = this.getForm();
        alert("JSON obtenido:\n" + JSON.stringify(data, null, 2));
      }
    });

    this.agregarHijo(label);
    this.agregarHijo(editBox);
    this.agregarHijo(botonSet);
    this.agregarHijo(botonGet);
  }
}
