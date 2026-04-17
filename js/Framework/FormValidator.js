class FormValidator {
  constructor() {
    this.VALIDATORS = {
      "_VSTR": {
        fn: valor => /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(valor),
        msg: "No es un valor válido STR (solo letras)"
      },
      "_VINT": {
        fn: valor => Number.isInteger(parseInt(valor)),
        msg: "No es un valor válido INT (entero)"
      },
      "_VFLOAT": {
        fn: valor => !isNaN(parseFloat(valor)),
        msg: "No es un valor válido FLOAT (decimal)"
      }
    };
  }



validar(json) {
  var errores = {};
  var self = this;

  Object.keys(json).forEach(function(key) {
    var valor = json[key];
    var sufijo = null;

    // Buscar sufijo válido
    Object.keys(self.VALIDATORS).forEach(function(s) {
      if (key.endsWith(s)) {
        sufijo = s;
      }
    });

    if (sufijo) {
      var regla = self.VALIDATORS[sufijo];
      var esValido = regla.fn(valor);

      if (!esValido) {
        errores[key] = {
          valor: valor,
          valido: false,
          tipo: sufijo.replace("_V", ""),
          errorMsg: regla.msg
        };
      }
    }
  });

  return errores; // solo devuelve los campos con error
}





}
