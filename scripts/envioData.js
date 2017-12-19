
exports.data = function(mensaje, destinatarios, shortcode, usuario) {
  var prepareString = '';
  destinatarios.forEach(function(element){
      prepareString = prepareString + element + "@";
  });
  console.log(mensaje + ' ' + prepareString + ' ' + shortcode + ' ' + usuario);

  return 'hola';
}
