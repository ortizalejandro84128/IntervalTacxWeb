class Main {
  constructor(simulador=false) {
    document.addEventListener("DOMContentLoaded", () => {
      this.dialogs={};
      this.dialogFocus=null;
      this.simulador=simulador;
      this.inicializar();
      
    
    });
  }

  inicializar() {

    const enrtenamientoDialog = new EntrenamientoDialog(this,this.simulador);
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

