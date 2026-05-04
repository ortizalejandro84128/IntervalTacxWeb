// HeartRateMonitor.js
class HeartRateMonitor {
  constructor(app, fn) {
    this.app = app;
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.fn=fn;
    
  }

  async connect(fn) {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });

      this.server = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService('heart_rate');
      this.characteristic = await this.service.getCharacteristic('heart_rate_measurement');

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRate.bind(this));

      document.getElementById('status').innerText = "Monitor cardíaco conectado.";
      this.app.monitorHR = true;
      this.app.validarEntreno();

      // Si tienes un botón para conectar HR, puedes deshabilitarlo aquí
      // document.getElementById("hrButton").disabled = true;

    } catch (err) {
       console.error("BT Error", err);
     // document.getElementById('status').innerText = "Error HR: " + err;
    }
  }

  handleHeartRate(event) {
    const value = event.target.value;
    // El byte 1 contiene el valor simplificado de HR
    //this.app.currentHR = value.getUint8(1);
    // Actualizar UI o lógica de la app
   // document.getElementById('hrValue').innerText = `HR: ${this.app.currentHR} bpm`;

   this.fn(value.getUint8(1));
  }

  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
      this.app.monitorHR =  false;
      document.getElementById('status').innerText = "Monitor cardíaco desconectado.";
    }
  }
}
