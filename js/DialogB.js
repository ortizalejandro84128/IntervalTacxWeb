class DialogB extends Dialog {
  constructor() {
    super({id: "dialogB", width: 500, height: 300, texto: "Dialog B"});
    this.crearInterfaz();
  }

  crearInterfaz() {
    const contenedor = new Contenedor({
      id: "contB",
      top: 20,
      left: 20,
      width: 450,
      height: 200,
      texto: "Contenedor en Dialog B"
    });

    const boton = new Boton({
      id: "btnB",
      top: 230,
      left: 20,
      width: 120,
      height: 40,
      texto: "Cargar HTML",
      fn: () => contenedor.cargarHTML("contenido.html")
    });

    this.agregarHijo(contenedor);
    this.agregarHijo(boton);
  }
}
