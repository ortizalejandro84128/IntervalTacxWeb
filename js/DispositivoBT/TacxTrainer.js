class TacxTrainer {
  constructor(owner) {
    this.device = null;
    this.server = null;
    this.rxChar = null;
    this.txChar = null;
    this.owner = owner; // referencia al DialogPotencia

    this.tacx_uart_rx_id = '6e40fec3-b5a3-f393-e0a9-e50e24dcca9e';
    this.tacx_uart_tx_id = '6e40fec2-b5a3-f393-e0a9-e50e24dcca9e';
    this.wheelCircumference = 2.096;
    this.lastWheelRevs = null;
    this.lastWheelEvent = null;
    this.lastCrankRevs = null;
    this.lastCrankEvent = null;
  }

  _emit(type, value) {
    if (this.owner && typeof this.owner[type] === "function") {
      this.owner[type](value);
    }
  }

  async connect() {
    console.log("Conexión", "Intentando conexión al rodillo...");
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [
        '6e40fec1-b5a3-f393-e0a9-e50e24dcca9e',
        '00001816-0000-1000-8000-00805f9b34fb',
        '00001818-0000-1000-8000-00805f9b34fb'
      ] }],
      optionalServices: [this.tacx_uart_rx_id, this.tacx_uart_tx_id]
    });

    this.server = await this.device.gatt.connect();

    // UART propietario (para comandos FE-C)
    const tacxService = await this.server.getPrimaryService('6e40fec1-b5a3-f393-e0a9-e50e24dcca9e');
    this.rxChar = await tacxService.getCharacteristic(this.tacx_uart_rx_id);
    this.txChar = await tacxService.getCharacteristic(this.tacx_uart_tx_id);
    await this.txChar.startNotifications();
    this.txChar.addEventListener('characteristicvaluechanged', e => {
      this._handleFEC(e);
    });

    // CSC (velocidad/cadencia)
    const cscService = await this.server.getPrimaryService('00001816-0000-1000-8000-00805f9b34fb');
    const cscMeasurement = await cscService.getCharacteristic('00002a5b-0000-1000-8000-00805f9b34fb');
    await cscMeasurement.startNotifications();
    cscMeasurement.addEventListener('characteristicvaluechanged', e => this._handleCSC(e));

    // CP (potencia)
    const cpService = await this.server.getPrimaryService('00001818-0000-1000-8000-00805f9b34fb');
    const cpMeasurement = await cpService.getCharacteristic('00002a63-0000-1000-8000-00805f9b34fb');
    await cpMeasurement.startNotifications();
    cpMeasurement.addEventListener('characteristicvaluechanged', e => this._handleCP(e));

    console.log("Conexión", "Rodillo conectado");
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
      this._emit("showAlert", "Rodillo desconectado");
    }
  }

  _handleCSC(event) {
    const data = new DataView(event.target.value.buffer);
    const flags = data.getUint8(0);
    let index = 1;

    if (flags & 0x01) {
      const cumulativeWheelRevs = data.getUint32(index, true); index += 4;
      const lastWheelEvent = data.getUint16(index, true); index += 2;

      if (this.lastWheelRevs !== null) {
        let timeDiff = lastWheelEvent - this.lastWheelEvent;
        if (timeDiff < 0) timeDiff += 65536;
        timeDiff /= 1024;
        if (timeDiff > 0) {
          const revDiff = cumulativeWheelRevs - this.lastWheelRevs;
          const speedKmh = (revDiff * this.wheelCircumference / timeDiff) * 3.6;
         // this.owner.recibeVelocidad(speedKmh.toFixed(1));
          //this._emit("recibeVelocidad", speedKmh.toFixed(1));
        }
      }
      this.lastWheelRevs = cumulativeWheelRevs;
      this.lastWheelEvent = lastWheelEvent;
    }

    if (flags & 0x02) {
      const cumulativeCrankRevs = data.getUint16(index, true); index += 2;
      const lastCrankEvent = data.getUint16(index, true); index += 2;

      if (this.lastCrankRevs !== null) {
        let timeDiff = lastCrankEvent - this.lastCrankEvent;
        if (timeDiff < 0) timeDiff += 65536;
        timeDiff /= 1024;
        if (timeDiff > 0) {
          const revDiff = cumulativeCrankRevs - this.lastCrankRevs;
          const cadence = (revDiff / timeDiff) * 60;
          //this._emit("recibeCadencia", cadence.toFixed(0));
          this.owner.recibeCadencia(cadence.toFixed(0));
        }
      }
      this.lastCrankRevs = cumulativeCrankRevs;
      this.lastCrankEvent = lastCrankEvent;
    }
  }

  _handleCP(event) {
    const data = new DataView(event.target.value.buffer);
    const instantaneousPower = data.getInt16(2, true);
    //this._emit("recibePotencia", instantaneousPower);
    this.owner.recibePotencia(instantaneousPower);
    const speed = this.estimateSpeed(instantaneousPower, 80);
    //this._emit("recibeVelocidad", speed.toFixed(1));
    this.owner.recibeVelocidad(speed.toFixed(1));
  }

  async setTargetPower(power) {
    let write_value = new Uint8Array([0xA4,0x09,0x4F,0x05,0x31,0xFF,0xFF,0xFF,0xFF,0xFF]);
    let targetBytes = Math.floor(power/0.25);
    write_value = Uint8Array.from([...write_value, targetBytes & 0xFF, (targetBytes >> 8) & 0xFF]);
    let checksum = write_value.slice(1).reduce((a,b)=>a+b,0) & 0xFF;
    write_value = Uint8Array.from([...write_value, checksum]);

    const bytes = Array.from(write_value).map(b=>b.toString(16).padStart(2,"0")).join(" ");
    console.log("Target Power", `Enviado: ${power} W | Bytes: ${bytes}`);

    await this.rxChar.writeValue(write_value);
  }


    _handleFEC(event) {
    const data = new Uint8Array(event.target.value.buffer);
    const messageLength = data[1];
    const messageData = data.slice(4, 4 + messageLength - 1);
    const pageNo = messageData[0];
    let detail = "";

    if (pageNo === 16) { // General FE Data
      const speedRaw = (messageData[4] | (messageData[5] << 8));
      const speed = speedRaw * 0.001; // m/s
      const speedKmh = speed * 3.6;
      detail = `Página 16 (General): Velocidad ${speedKmh.toFixed(1)} km/h`;
    } else if (pageNo === 25) { // Specific Trainer Data
      const cadence = messageData[2] !== 255 ? messageData[2] : null;
      const accumulatedPower = (messageData[3] | (messageData[4] << 8));
      const powerLSB = messageData[5];
      const powerMSB = messageData[6];
      let instantaneousPower = powerLSB + ((powerMSB & 0x0F) << 8);
      if (instantaneousPower === 4095) instantaneousPower = null;

      detail = `Página 25 (Trainer): Potencia inst. ${instantaneousPower ?? "--"} W, Potencia acum. ${accumulatedPower} W, Cadencia ${cadence ?? "--"} rpm`;
    } else {
      detail = `Página ${pageNo}: Paquete recibido`+data;
	  console.log("Respuesta FE-C", detail);
    }

    //this._addLog("Respuesta FE-C", detail);
  }

  estimateSpeed(power, mass, cda = 0.33, crr = 0.004, rho = 1.225, g = 9.81) {
    let v = 9;
    for (let i = 0; i < 50; i++) {
      const faero = 0.5 * rho * cda * v * v;
      const froll = crr * mass * g;
      const pcalc = (faero + froll) * v;
      v = v - (pcalc - power) / (3 * 0.5 * rho * cda * v * v + froll);
      if (v < 0) v = 0.1;
    }
    return v * 3.6;
  }
}
