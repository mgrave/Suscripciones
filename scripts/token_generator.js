


// GENERAR CLAVE ALEATORIA PARA EL PROCESO DE VERIFICACION DE TLF.

function generate() {
  var characters = 'abcdefghijklmnopqrstwqyzlABCDEFGHIJKLMNOPQRSTWXYZ123456789';
  var token = "";

  for (i=0; i<30; i++) {
    token += characters.charAt(Math.floor(Math.random()*characters.length))
  }
  return token;
}

token = generate()
module.exports = {
  token
}