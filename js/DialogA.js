class DialogA extends Dialog {
  constructor() {
    super({id: "dialogA", width: 400, height: 250, texto: "Dialog A"});
    this.crearInterfaz();
  }

  crearInterfaz() {
    const label = new Label({
      id: "lblA",
      top: 20,
      left: 20,
      width: 200,
      height: 30,
      texto: "Soy Label en Dialog A"
    });
    label.setTamaño(18);
    label.setColor("blue");

    const boton = new Boton({
      id: "btnA",
      top: 70,
      left: 20,
      width: 100,
      height: 40,
      texto: "Acción A",
      fn: this.pruebaProcesaBoton.bind(this)
    });

    this.agregarHijo(label);
    this.agregarHijo(boton);
  }

    pruebaProcesaBoton() {
       const data = this.getForm();
        alert("JSON obtenido:\n" + JSON.stringify(data, null, 2));
    
    }
}
