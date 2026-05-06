/*class TacxTrainer {
  constructor(owner, testMode) {
    this.device = null;
    this.server = null;
    this.rxChar = null;
    this.txChar = null;
    this.owner = owner; // referencia al DialogPotencia
    this.testMode=testMode;

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
    if(!this.testMode){
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
    if(!this.testMode){
    let write_value = new Uint8Array([0xA4,0x09,0x4F,0x05,0x31,0xFF,0xFF,0xFF,0xFF,0xFF]);
    let targetBytes = Math.floor(power/0.25);
    write_value = Uint8Array.from([...write_value, targetBytes & 0xFF, (targetBytes >> 8) & 0xFF]);
    let checksum = write_value.slice(1).reduce((a,b)=>a+b,0) & 0xFF;
    write_value = Uint8Array.from([...write_value, checksum]);

    const bytes = Array.from(write_value).map(b=>b.toString(16).padStart(2,"0")).join(" ");
    console.log("Target Power", `Enviado: ${power} W | Bytes: ${bytes}`);

    await this.rxChar.writeValue(write_value);
    }
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
console.log("Respuesta FE-C", detail);
   // this._addLog("Respuesta FE-C", detail);
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
}*/



class TacxTrainer {
  constructor(owner, testMode) {
    this.device = null;
    this.server = null;
    this.owner = owner; 
    this.testMode = testMode;

    // --- CONTROL ---
    this.tacx_service_id = '6e40fec1-b5a3-f393-e0a9-e50e24dcca9e';
    this.tacx_uart_rx_id = '6e40fec3-b5a3-f393-e0a9-e50e24dcca9e';

    // --- DATOS (FTMS + CYCLING POWER) ---
    this.ftms_service_id = '00001826-0000-1000-8000-00805f9b34fb';
    this.ftms_data_id = '00002ad2-0000-1000-8000-00805f9b34fb';
    
    this.cp_service_id = '00001818-0000-1000-8000-00805f9b34fb';
    this.cp_measurement_id = '00002a63-0000-1000-8000-00805f9b34fb';

    this.rxChar = null; 
    this.userWeight = 80;
  }

  async connect() {
    if (this.testMode) return;

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          this.tacx_service_id, 
          this.ftms_service_id, 
          this.cp_service_id
        ]
      });

      this.server = await this.device.gatt.connect();

      // 1. Intentar configurar Control (Solo para rodillos inteligentes)
      try {
        const tacxService = await this.server.getPrimaryService(this.tacx_service_id);
        this.rxChar = await tacxService.getCharacteristic(this.tacx_uart_rx_id);
        console.log("Control: Tacx FE-C detectado.");
      } catch (e) {
        console.log("Control: Dispositivo sin receptor de comandos Tacx.");
      }

      // 2. Intentar lectura vía FTMS (Rodillos)
      try {
        const ftmsService = await this.server.getPrimaryService(this.ftms_service_id);
        const dataChar = await ftmsService.getCharacteristic(this.ftms_data_id);
        await dataChar.startNotifications();
        dataChar.addEventListener('characteristicvaluechanged', e => this._handleFTMSData(e));
        console.log("Datos: Usando perfil FTMS.");
      } catch (e) {
        // 3. Si falla FTMS, intentar Cycling Power (Potenciómetros como Magene P515)
        try {
          const cpService = await this.server.getPrimaryService(this.cp_service_id);
          const cpChar = await cpService.getCharacteristic(this.cp_measurement_id);
          await cpChar.startNotifications();
          cpChar.addEventListener('characteristicvaluechanged', e => this._handleCPData(e));
          console.log("Datos: Usando perfil Cycling Power.");
        } catch (e2) {
          console.warn("No se encontraron servicios de datos compatibles.");
        }
      }

      if (this.owner.showAlert) this.owner.showAlert(`Conectado a ${this.device.name}`);

    } catch (error) {
      console.error("Error en conexión:", error);
    }
  }

  async setTargetPower(power) {
    // Si es un P515, rxChar será null y la función no hará nada, lo cual es correcto.
    if (this.testMode || !this.rxChar) return;

    try {
      const p = Math.max(0, Math.min(2000, power));
      let header = [0xA4, 0x09, 0x4F, 0x05, 0x31, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];
      let target = Math.floor(p / 0.25);
      let payload = Uint8Array.from([...header, target & 0xFF, (target >> 8) & 0xFF]);
      let checksum = payload.slice(1).reduce((a, b) => a + b, 0) & 0xFF;
      await this.rxChar.writeValue(Uint8Array.from([...payload, checksum]));
    } catch (e) {
      console.warn("Error enviando potencia objetivo.");
    }
  }

  // Manejador para Rodillos Inteligentes (FTMS)
  _handleFTMSData(event) {
    const data = new DataView(event.target.value.buffer);
    const flags = data.getUint16(0, true);
    let offset = 2;
    if (!(flags & 0x0001)) offset += 2; // Saltar velocidad
    if (flags & 0x0004) {
      this.owner.recibeCadencia((data.getUint16(offset, true) * 0.5).toFixed(0));
      offset += 2;
    }
    if (flags & 0x0040) {
      const power = data.getInt16(offset, true);
      this._processPowerUpdate(power);
    }
  }

  // Manejador para Potenciómetros (Cycling Power - P515)
  _handleCPData(event) {
    const data = new DataView(event.target.value.buffer);
    // El perfil de CP tiene los vatios en el byte 2 (Int16)
    const power = data.getInt16(2, true);
    this._processPowerUpdate(power);

    // Opcional: Extraer cadencia de CP si el P515 la envía en el mismo paquete
    const flags = data.getUint16(0, true);
    if (flags & 0x20) { // Crank Revolution Data Present
      // El offset varía según los flags de CP, pero usualmente la cadencia
      // requiere un cálculo de deltas (revs/time). 
      // Por simplicidad, el P515 suele enviar cadencia por FTMS o CSC también.
    }
  }

  _processPowerUpdate(power) {
    this.owner.recibePotencia(power);
    const speedKmh = this.estimateSpeed(power, this.userWeight);
    this.owner.recibeVelocidad(speedKmh.toFixed(1));
  }

  estimateSpeed(power, mass, cda = 0.33, crr = 0.004, rho = 1.225, g = 9.81) {
    if (power < 5) return 0;
    let v = 8;
    for (let i = 0; i < 10; i++) {
      let f = (0.5 * rho * cda * v * v) + (crr * mass * g);
      v = v - ((f * v) - power) / (3 * 0.5 * rho * cda * v * v + crr * mass * g);
    }
    return Math.max(0, v * 3.6);
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
  }
}
