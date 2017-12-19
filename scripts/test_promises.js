var mysql          = require('mysql');
var moment         = require('moment');
var hoy            = moment().format("YYYY-MM-DD");
var config         = require('.././database/config');
var db             = mysql.createConnection(config);
var destinatario   = require('./destinatarios');

function asyncFunc(element) {
  return new Promise(
      function (resolve, reject) {
        string = ''
          element.map( id => {
            if(id % 2 != 0){

            }
            else {
              string += id
              string += '@'    
            }
          })
          resolve(string)
      });
}

function main() {
  element = []

  db.connect();
  var sql = "SELECT * FROM insignia_suscripciones.telefono";

  db.query( sql, function(err, result){
  if(err){
    console.log('error en la consulta');
  } else {
    result.forEach(function(elements){
      element.push(elements.recipient);
    });

    asyncFunc(element)
      .then(result => { console.log(result) })
      .catch(error => { console.log(error) })

    db.end();
  }
});
}

main()
