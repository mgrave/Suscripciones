
var confirmation  = require('./notifications_control1');
var mysql         = require('mysql');
var moment        = require('moment');
var hoy           = moment().format("YYYY-MM-DD");
var config        = require('.././database/config');
var db            = mysql.createConnection(config);
const nodemailer  = require('nodemailer');
var email         = [];

console.log('works!');

db.connect();

var sql = "SELECT email FROM insignia_suscripciones.email_notificator";

db.query(sql, function(err, result){
  if(err){
    console.log('something bad');
  } else {
    result.forEach(function(element) {
      email.push(element.email);
    });
    console.log(email);
  }
});
/*

var correos = ['sotodario3@gmail.com', 'michelleabg@gmail.com'];
console.log(correos);


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
              to: correos, // list of receivers
              subject: 'Verificación de correo electrónico', // Subject line
              text: 'Gracias por registrarte en nuestros servicios.', // plain text body
              html: '<b>Gracias por registrarte en nuestros servicios.</b><hr>' // html body
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
          });*/