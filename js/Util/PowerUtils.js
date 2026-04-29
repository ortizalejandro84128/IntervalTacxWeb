
class PowerUtils {

    static    generaSiguienteSegmento(duracion, potAnterior, potInicial, potFinal, ftp, cadence){
        var curvaTransicion= this.generarCurvaPro(potInicial,potAnterior,cadence,ftp);
        var segmento=this.generarRampa(curvaTransicion, duracion,potFinal);
        return segmento;
    }

  //genera una rampa a partir de un segmento que tiene potencia inicial y final sube una parte cada minuto
        static generarRampa(arregloBase, duracion, potFinal) {
		    duracion=duracion-1;
            if (duracion <= 0) return [...arregloBase];

            const rampa = [...arregloBase];
            const SEGUNDOS_MINUTO = 60;

            let potInicial = 0;
            for (let i = rampa.length - 1; i >= 0; i--) {
                if (rampa[i] > 0) {
                    potInicial = rampa[i];
                    break;
                }
            }

            const incremento = (potFinal - potInicial) / duracion;

            for (let i = 1; i <= duracion; i++) {
                const potenciaEscalon = Math.round(potInicial + (incremento * i));
                
                // Alineación al siguiente minuto
                const resto = rampa.length % SEGUNDOS_MINUTO;
                const cerosNecesarios = resto === 0 ? 0 : SEGUNDOS_MINUTO - resto;
                
                for (let j = 0; j < cerosNecesarios; j++) {
                    rampa.push(0);
                }

                // Escalón de potencia
                rampa.push(potenciaEscalon);

                // Relleno de 59 segundos
                for (let k = 0; k < 59; k++) {
                    rampa.push(0);
                }
            }
            return rampa;
        }

  /**
     * Genera una curva suavizada para que el cambio de intervalo no sea tan abrupto
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