class Main {
  constructor() {
    document.addEventListener("DOMContentLoaded", () => {
      this.dialogs={};
      this.dialogFocus=null;
      this.inicializar();
      
    
    });
  }

  inicializar() {
//    const dialogA = new DialogA();
//    const dialogB = new DialogB();
//    const dialogC = new DialogC();
    const usuarioDialog = new DialogPotencia(this);
    this.dialogs["usuarioDialog"]=usuarioDialog;

    const enrtenamientoDialog = new EntrenamientoDialog(this);
    this.dialogs["enrtenamientoDialog"]=enrtenamientoDialog;
  
    this.showDialog("enrtenamientoDialog");

}



  showDialog(dialogName) {
   if(this.dialogs[dialogName]!=null){   
    for (const key in this.dialogs) {
      if (this.dialogs[key]) {
        this.dialogs[key].setFocus(false);   
      }
    }
    this.dialogs[dialogName].setFocus(true);

  }
}


}

