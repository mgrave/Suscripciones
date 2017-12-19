  
var mysql          = require('mysql');
var moment         = require('moment');
var hoy            = moment().format("YYYY-MM-DD");
var config         = require('.././database/config');
var db             = mysql.createConnection(config);
var destinatario   = require('./destinatarios');

// Conexión a la base de datos.
db.connect();

exports.confir = function (numeros) {

  numeros.forEach(function(element) {
        var sql = "select count(*) CONT , premium.destinatario TELEFONO , promo.sc SHORCUT "+
              "from insignia_masivo_premium.outgoing_premium premium "                  +
              "inner join insignia_masivo_premium.promociones_premium promo "           +
              "on promo.id_promo = premium.id_promo "                                   +
              "where destinatario = '"+ element +"' "                                   +
              "group by destinatario";
              
    db.query(sql, function(err, result){
      if(err){
        console.log(err);
      }else{
        if(result == ''){
          console.log('vacio');
        }else {
            console.log('dale que si existe cabron ->' + result[0].SHORCUT);
            var sql1 = "SELECT count(*) CONT FROM insignia_suscripciones.notifications_control where recipient = " + element;
            db.query(sql1, function(err1, result1){
            if(err1) console.log('ERROR EN CONSULTA');
            else{
              if(result1[0].CONT == 0){
                var sql2 = "INSERT INTO `insignia_suscripciones`.`notifications_control` (`shortcode`, `recipient`, `notifications`, `notifications_r`, `date`, `date_notifications_r`) VALUES ("+result[0].SHORCUT+", "+result[0].TELEFONO+", "+result[0].CONT+", "+10+", '"+hoy+"', '"+hoy+"')";
                db.query(sql2, function(err, result){
                  if(err){
                    console.log('No se insertó, quizas ya existía el registro..');
                    console.log(sql2);
                  }else {
                    console.log('Yay! ->' +  element);
                };
                });
              }else{
                var sql3 = "UPDATE `insignia_suscripciones`.`notifications_control` SET `notifications`="
                +result[0].CONT+" WHERE `shortcode`="+result[0].SHORCUT+" and `recipient`="+result[0].TELEFONO
                +" and `date`='"+hoy+"'";
                db.query(sql3, function(err, result3){
                  if(err){
                    console.log('no se actualizo un coño');
                    console.log(sql3);
                  }else {
                    console.log('Se actualizó correctamente');
                    console.log('Se actualizó correctamente');
                  }
                })
              }
          }
        })
        }
      }  
    });
  })
}






