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

    const enrtenamientoDialog = new EntrenamientoDialog(this,true);
    this.dialogs["enrtenamientoDialog"]=enrtenamientoDialog;

    const dialog = new EditaLayoutDialog(this,enrtenamientoDialog);
    this.dialogs["dialog"]=dialog;
  


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

