class NivelUtil{

   static calcularFactorNivel(peso, ftp) {
    const wkg = ftp / peso;
    if (wkg < 1.5) return 8;
    if (wkg < 2.0) return 10;
    if (wkg < 2.5) return 12;
    if (wkg < 3.0) return 14;
    if (wkg < 3.5) return 16;
    if (wkg < 4.0) return 18;
    return 20; // elite
  }


}
