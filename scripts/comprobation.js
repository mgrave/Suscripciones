
var module        = require('./password_generator');
var confirmation  = require('./notifications_control1');
var mysql         = require('mysql');
var moment        = require('moment');
var hoy           = moment().format("YYYY-MM-DD");
var config        = require('.././database/config');
var db            = mysql.createConnection(config);
const nodemailer  = require('nodemailer');
var emails        = [];
var destinatarios = [];

// # Conexión a la base de datos.
db.connect();

exports.cmp = function(sc, date, recipient) {
  console.log('Comprobando que el proveedor haya actualizado su contenido ..');
  var sql = "select * contador from analisis.rsimple_distintiva where sc = " + sc + " and fecha ='" + date + "'";
  db.query(sql, function(err, result){
    if(err) console.log(sql);
    else {
      if(result[0].contador == ''){
        console.log('El shortcode : ' + sc + ' no actualizó no se enviará el msj premium al numero ' + recipient);
        var sqlEmail = "SELECT email FROM insignia_suscripciones.email_notificator";
        db.query(sqlEmail, function(errMail, resultMail){
          if(errMail){
            console.log('something bad');
          }else {
            resultMail.forEach(function(element) {
              emails.push(element.email);
            });
          let transporter = nodemailer.createTransport({
              pool:true,
              host: 'insignia.com.ve',
              port: 465,
              secure: true, // secure:true for port 465, secure:false for port 587
              auth: {
                  user: 'notificaciones@insignia.com.ve',
                  pass: 'qwe123#'
              },
              tls: {
                  rejectUnauthorized: false
              }
          });

          // setup email data with unicode symbols
          let mailOptions = {
              from: '"Insignia Mobile Comunications. C.A. 👻" <notificaciones@insignia.com.ve>', // sender address
              to: emails, // list of receivers
              subject: 'Advertencia', // Subject line
              text: 'Suscripciones', // plain text body
              html: '<b>Advertencia, el shortcode :' + sc + 'intentó enviar contenido gratuito al número : '+ recipient +' pero no actualizó </b><hr>'
          };

          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
          });
          }
        });
      }else{
        console.log('Yay! el shortcode : ' + sc + ' Actualizó correctamente se debe enviar el mensaje premium ' + 
        ' al numero : ' + recipient);
      }
    }
  })
}
