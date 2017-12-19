var mysql = require('mysql');
var moment = require('moment');

var number = '0112831';
var hoy = moment().format("YYYY-MM-DD");
console.log(hoy);
var config = require('.././database/config');
var db = mysql.createConnection(config);
db.connect();

var sql = " select count(*)  NOTIFICACIONES , premium.destinatario TELEFONO , promo.sc SHORCUT  "+              
      " from insignia_masivo_premium.outgoing_premium premium "  +              
      " inner join insignia_masivo_premium.promociones_premium promo "  +                
      " on promo.id_promo = premium.id_promo " +                
      " where destinatario not like '' " +             
      " and promo.sc not like '' "+             
      " and premium.destinatario = '"+ number +"'";             
      " group by destinatario " ;

db.query(sql, function(err, result){
    if(err) {
        console.log(sql);
        db.end();
  } else {
        console.log(result);
        var cantidad = result[0].NOTIFICACIONES
        var shortcode = result[0].SHORCUT
        console.log('cantidad -> '+  cantidad + ' shorcut -> ' + shortcode);
        if(!shortcode){
          console.log('bad');
        } 
        else {   
          var sql1 = "INSERT INTO `insignia_suscripciones`.`notifications_control` " +
          "(`shortcode`, `recipient`, `notifications`, `notifications_r`, `date`) " +
          " VALUES ('" + shortcode + "', '" + number + "', '"+ cantidad +"', '"+10 + "', '"+hoy+"')";
          console.log(sql1);
          db.query(sql1, function(err1, result1){
            if(err){
              console.log('error to insert');
              db.end();
            } else {
              console.log('works!');
            }
          });
          db.end();
        }
  }})

