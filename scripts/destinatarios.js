'use strict'
var numbers = '';

exports.import = function(numero) {
  if(!numero) {
    console.log('there isnt any number -> ' 
      + numbers)
  } else {
    numbers = numbers + numero + "@"
  }
  console.log('set numbers : ' + numbers);
}
