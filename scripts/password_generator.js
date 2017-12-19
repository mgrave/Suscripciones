

// GENERAR CLAVE ALEATORIA PARA EL PROCESO DE VERIFICACION DE TLF.

function generate(long) {
  var characters = 'abcdefghjkl123456789';
  var password = "";

  for (i=0; i<long; i++) {
    password += characters.charAt(Math.floor(Math.random()*characters.length))
  }
  return password
}
password = generate(7);
console.log(password);

module.exports = {
  password
}