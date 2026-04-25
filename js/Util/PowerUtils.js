/*class PowerUtils {
    static generarRampa(potNueva, potAnterior, factor) {
        const diferencia = Math.abs(potNueva - potAnterior);

        // LOG de entrada para depuración
        console.log(`Generando rampa: De ${potAnterior}W a ${potNueva}W (Factor: ${factor})`);

        // VALIDACIÓN: Si el cambio es menor al factor o el factor es 1, no hay rampa
        if (diferencia < 10 || factor <= 1) {
            console.log("Cambio pequeño: Enviando valor directo.");
            return [potNueva];
        }

        // Si llegamos aquí, es un salto grande. Calculamos 4 escalones.
        const paso = (potNueva - potAnterior) / 4;
        
        const e1 = Math.round(potAnterior + paso);
        const e2 = Math.round(potAnterior + (paso * 2));
        const e3 = Math.round(potAnterior + (paso * 3));
        const e4 = Math.round(potNueva);

        const rampaParaEnviar = [e1, 0, e2, 0, e3, 0, e4];
        
        console.log("Rampa construida:", JSON.stringify(rampaParaEnviar));
        return rampaParaEnviar;
    }


    static generarCurvaDinamica(target, start, cadence) {
      console.log(`Generando rampa: De ${start}W a ${target}W (cadence: ${cadence})`);   
    const diff = target - start;
    const absDiff = Math.abs(diff);
    
    // 1. DETERMINAR DURACIÓN (N)
    // Si la cadencia es baja (<70), extendemos la rampa para no bloquear al ciclista.
    // Si el salto es muy grande (>100W), también extendemos.
    let nPasos = 5; 
    if (cadence < 75) nPasos += 2;
    if (absDiff > 100) nPasos += 2;

    const rampa = [];

    // 2. CONSTRUIR CURVA SIGMOIDE
    for (let i = 1; i <= nPasos; i++) {
      // Normalizamos el progreso (de 0 a 1)
      let x = i / nPasos;
      
      // Función Smoothstep: 3x^2 - 2x^3
      // Crea una curva en "S" que empieza y termina suave.
      let factorCurva = x * x * (3 - 2 * x);
      
      let vatiosSiguiente = Math.round(start + (diff * factorCurva));
      rampa.push(vatiosSiguiente);

      // 3. INSERTAR "RESPIRACIÓN" (Ceros)
      // Solo insertamos el 0 si el salto es significativo para proteger el motor.
      if (absDiff > 40 && i < nPasos) {
        rampa.push(0);
      }
    }

    return rampa;
  }
}*/
/*
class PowerUtils {
  static generarCurvaBiomecanica(target, start, cadence) {
    const diff = target - start;
    const absDiff = Math.abs(diff);
    
    // 1. DETERMINAR LA AGRESIVIDAD (Número de pasos)
    // Base de 4 pasos (unos 7-8 segundos con los ceros).
    let nPasos = 4; 

    // MODO RESCATE: Si la cadencia es muy baja, duplicamos la suavidad
    if (cadence < 65) {
      console.log("¡Modo Rescate! Cadencia baja, suavizando rampa.");
      nPasos = 7; 
    } 
    // MODO ATAQUE: Si la cadencia es alta, podemos ser más directos
    else if (cadence > 95 && absDiff < 100) {
      nPasos = 3;
    }

    const rampa = [];

    // 2. CONSTRUCCIÓN DE LA CURVA (Smoothstep)
    for (let i = 1; i <= nPasos; i++) {
      // Normalizamos el progreso (0 a 1)
      let x = i / nPasos;
      
      // Aplicamos la fórmula Smoothstep para una curva en "S"
      // Esto hace que el inicio y el final sean más sutiles que el medio.
      let factorCurva = x * x * (3 - 2 * x);
      
      let vatiosSiguiente = Math.round(start + (diff * factorCurva));
      
      // Agregamos el escalón de potencia
      rampa.push(vatiosSiguiente);

      // 3. INSERCIÓN DE "RESPIROS" (Ceros)
      // Agregamos un 0 después de cada escalón para que el Tacx Flow 
      // mantenga la potencia y no se bloquee, excepto en el último valor.
      if (i < nPasos) {
        rampa.push(0);
      }
    }

    console.log(`Rampa Biomecánica: Cadencia ${cadence}RPM, Pasos: ${nPasos}`);
    console.log("Valores:", JSON.stringify(rampa));
    
    return rampa;
  }
}*/

class PowerUtils {
    /**
     * Genera una rampa curva profesional para intervalos largos (>1 min).
     * @param {number} target - Potencia objetivo.
     * @param {number} start - Potencia actual.
     * @param {number} cadence - Cadencia actual (RPM).
     * @param {number} ftp - FTP del usuario.
     */
    static generarCurvaPro(target, start, cadence, ftp) {
        const diff = target - start;
        const absDiff = Math.abs(diff);
        const impactoRelativo = absDiff / ftp;
        console.log(`Generando rampa: De ${start}W a ${target}W (cadence: ${cadence})-(ftp: ${ftp})`);   

        // 1. DETERMINAR LONGITUD DINÁMICA
        // Base de 5 pasos para intervalos de +1min (aprox 9-10 seg total con ceros)
        let nPasos = 5; 

        // AJUSTE POR ESFUERZO: Si el salto es > 20% del FTP, suavizamos más
        if (impactoRelativo > 0.20) nPasos += 1;
        
        // AJUSTE POR ZONA CRÍTICA: Si vamos a >100% del FTP, un paso más
        if (target >= ftp) nPasos += 1;

        // AJUSTE POR CADENCIA (Modo Rescate)
        if (cadence < 70) nPasos += 2;

        const rampa = [];

        // 2. CÁLCULO DE CURVA SIGMOIDE (Smoothstep)
        for (let i = 1; i <= nPasos; i++) {
            let x = i / nPasos;
            // Curva S: suaviza el arranque y la llegada al objetivo
            let factorCurva = x * x * (3 - 2 * x);
            
            let vatios = Math.round(start + (diff * factorCurva));
            rampa.push(vatios);

            // 3. INTERCALADO DE CEROS (Estabilidad Bluetooth/Mecánica)
            // No ponemos cero después del último paso
            if (i < nPasos) {
                rampa.push(0);
            }
        }

        console.log(`[Rampa] Objetivo: ${target}W | Impacto: ${(impactoRelativo*100).toFixed(1)}% | Pasos: ${nPasos}`);
        return rampa;
    }
}