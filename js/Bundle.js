const scripts = [
  'js/Framework/Window.js',
  'js/Framework/AlertWindow.js',
  'js/Framework/Dialog.js',
  'js/Framework/DialogModal.js',
  'js/Framework/Boton.js',
  'js/Framework/Label.js',
  'js/Framework/Contenedor.js',
  'js/Framework/EditBox.js',
  'js/Framework/FormValidator.js',
  'js/Framework/FileInput.js',
  'js/Framework/IntervalControl.js',
  'js/Framework/NotificationManager.js',
  'js/Framework/WorkoutMini.js',
  'js/Framework/ImagesSvgRepo.js',
  'js/Util/ZonaUtils.js',
  'js/Util/Temporizador.js',
  'js/Util/TcxExport.js',
  'js/Util/AppGuard.js',
  'js/Util/PowerUtils.js',
  'js/Util/TrainGenerator/NivelUtil.js',
  'js/Util/TrainGenerator/TSSCalculator.js',
  'js/Util/TrainGenerator/UmbralGenerator.js',
  'js/Util/TrainGenerator/Vo2Generator.js',
  'js/Util/TrainGenerator/WeekendGenerator.js',
  'js/DispositivoBT/HeartRateMonitor.js',
  'js/DispositivoBT/TacxTrainer.js',
  'js/UsuarioDialog.js',
  'js/UsuarioDialogModal.js',
  'js/EntrenamientoDialog.js',
  'js/EntrenamientosModal.js',
  'js/Main.js'

];

scripts.forEach(src => {
    console.log(src);
document.write(`<script src="${src}"></script>`);
});