
var module        = require('./password_generator');
var confirmation  = require('./notifications_control1');
var mysql         = require('mysql');
var moment        = require('moment');
var hoy           = moment().format("YYYY-MM-DD");
var config        = require('.././database/config');
var db            = mysql.createConnection(config);
var cmp           = require('./comprobation');

// # Conexión a la base de datos.
db.connect();

exports.evaluate = function(numeros) {
  numeros.forEach(function(element) {
    var sql = "select date_notifications_r, notifications_r, shortcode, recipient from insignia_suscripciones.notifications_control where recipient = " + element;
    db.query(sql, function(err, result){
      if(err){
        console.log('error');
      }else {
        if(result == ''){
          console.log('no es válido');
        }else {
          var dato = moment(result[0].date_notifications_r).format('YYYY-MM-DD');
          //var sql1 = "select * from insignia_masivo_premium.outgoing_premium where fecha_out between '"+dato+"' and '"+hoy+"'";
          var sql1 = "select count(*) contador from insignia_masivo_premium.outgoing_premium "+
                     "where fecha_out between '2017-06-01' and '"+hoy+"' and destinatario = '" +result[0].recipient+ "'";
          console.log('sql1 - >'  + sql1);
          db.query(sql1, function(err1, result1){
            if(err1) console.log(' there is an error . -> ' + sql1);
            else {
              if(result1[0].contador > result[0].notifications_r){
                console.log('Es necesario enviar notificación .. ');
                cmp.cmp(result[0].shortcode,hoy,result[0].recipient);
                //cmp.cmp(1525,hoy);
              }
            }
          })
        }
      }
    })
  });
}
