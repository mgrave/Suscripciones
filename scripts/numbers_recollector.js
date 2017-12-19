
var module         = require('./password_generator');
var confirmation   = require('./notifications_control1');
var mysql          = require('mysql');
var moment         = require('moment');
var update         = require('./update');
var hoy            = moment().format("YYYY-MM-DD");
var config         = require('.././database/config');
var db             = mysql.createConnection(config);
var numeros        = [];
var destino_num    = [];
var confirmedNums  = [];
var token          = require('./token_generator');
var envio          = require('./envioData');
var destinatarios  = require('./destinatarios');

// # Conexión a la base de datos.


db.connect();
var sql = "SELECT * FROM insignia_suscripciones.telefono";

db.query( sql, function(err, result){
  if(err){
    console.log('error en la consulta');
  } else {
    result.forEach(function(element){
      destino_num.push((element.prefix)+(element.recipient));
      numeros.push(element.recipient);
    });
    //console.log(numeros);
    //console.log(module.password);

   confirmation.confir(numeros)

    //# Llamando al script para comprobar el envío del contenido premium
    update.evaluate(numeros);

    //envio.data('hola', numeros, '1010', 'godadmin');

    // # Cerrando la base de datos.
    db.end();
  }
});

