class TSSCalculator {
  /**
   * Calcula el TSS basándose exclusivamente en el arreglo de segmentos
   * @param {Array} segments - Arreglo de formato [[min, intInicio, intFin, nombre], ...]
   * @returns {number} - TSS total redondeado a 1 decimal
   */
static calcularDesdeSegmentos(segments) {
  if (!Array.isArray(segments)) return 0;

  let tiempoTotalMin = 0;
  let sumaPotenciaCuarta = 0;

  segments.forEach(seg => {
    const [minutos, intInicio, intFin] = seg;
    
    // GoldenCheetah usa la media de los datos, pero eleva a la 4ª potencia
    // para dar mucho más peso a los bloques de alta intensidad.
    const intensidadMedia = (intInicio + intFin) / 2;
    const factorIntensidad = intensidadMedia / 100;

    tiempoTotalMin += minutos;
    // La clave: Exponente 4 (Costo metabólico real)
    sumaPotenciaCuarta += minutos * Math.pow(factorIntensidad, 4);
  });

  // La Potencia Normalizada (NP) es la raíz cuarta del promedio
  const npFactor = Math.pow(sumaPotenciaCuarta / tiempoTotalMin, 1/4);
  
  // El TSS se calcula usando el IF (que es la NP / FTP)
  // TSS = (Horas * IF^2 * 100)
  const tssTotal = (tiempoTotalMin / 60) * Math.pow(npFactor, 2) * 100;

  return Math.round( Math.round(tssTotal * 10) / 10);
}

}
