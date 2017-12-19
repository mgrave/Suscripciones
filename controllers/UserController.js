var mysql        = require('mysql');
var bcrypt       = require('bcryptjs');
const request    = require("request");
var moment       = require('moment');
var md5          = require('md5');
var deepcopy     = require("deepcopy");
const nodemailer = require('nodemailer');
var dateFormat   = require("date-format-lite");
var hoy          = moment().format("YYYY-MM-DD HH:mm");
var hoy_fecha    = moment().format("YYYY-MM-DD");
var hoy_hora     = moment().format("HH:mm:ss");
var md5          = require('md5');
var utils        = require('../lib/utils')
var index        = []
const _          = require('lodash')

function setIndex(json) {
  index.push({
    producto: json.producto,
    suscrito: json.suscrito
  })
}

function setQuery(arreglo, user) {
  return new Promise(
    (resolve, reject) => {
      if(arreglo.length > 0) {
        var query = `SELECT     sus.product_id,tlf.recipient AS tabla_tlf,
        sus.recipient AS tabla_sus,
        IF(sus.recipient IS NULL, 0, 1) AS suscrito FROM insignia_suscripciones.suscripcion sus
                      RIGHT JOIN insignia_suscripciones.telefono tlf ON tlf.recipient = sus.recipient
                      INNER JOIN insignia_suscripciones.abonado ab ON ab.id = tlf.abonado_id
                      WHERE sus.product_id IN ( `;
          arreglo.forEach( element => {
            query += `${element.id_producto},`
          })
          query = query.substr(0,(query.length) -1)
          query += `) AND ab.id = '${user}' `
          console.log(query)
          resolve(query) 
      } else {
        var query = `SELECT     sus.product_id,tlf.recipient AS tabla_tlf,
    sus.recipient AS tabla_sus,
    IF(sus.recipient IS NULL, 0, 1) AS suscrito FROM insignia_suscripciones.suscripcion sus
                  RIGHT JOIN insignia_suscripciones.telefono tlf ON tlf.recipient = sus.recipient
                  INNER JOIN insignia_suscripciones.abonado ab ON ab.id = tlf.abonado_id
                  WHERE sus.product_id IN (1) AND ab.id = '${user}'`
      }
      resolve(query)

  })
}

function deletePromiseSuscriptions(recipient, prefix) {
  var config = require('.././database/config')
  var db = mysql.createConnection(config)
  db.connect()
  return new Promise(
    (resolve, reject) => {
      var sql = `DELETE FROM insignia_suscripciones.suscripcion WHERE recipient = '${recipient}' AND prefix = '${prefix}'`
      db.query(sql, (err, result) => {
        if(err){
          reject(err)
        } else {
          console.log(`eliminando ${recipient} con el prefijo : ${prefix}`)
          resolve('ok')
        }
      })
    }
  )
}

function deleteSuscriptionsById(id) {
  var promises = []
  var config = require('.././database/config')
  var db = mysql.createConnection(config)
  db.connect()

  var sql = `SELECT * FROM insignia_suscripciones.telefono where abonado_id = '${id}'`

  db.query(sql, (err, result) => {
    if (err) console.log(`There was an error eliminanting .. `)
    else {
      result.forEach( element => {
        console.log(`Empujando : ${element.recipient} y ${element.prefix}`)
        promises.push(deletePromiseSuscriptions(element.recipient, element.prefix))
      })
      Promise.all(promises)
        .then( success => {
          console.log(success) 
          db.end()
        })
        .catch( error => { 
          console.log(error) 
          db.end()
        })
    }
  })
}


function setJsonArray(json, user) {
  return new Promise(
    (resolve, reject) => {
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();

      var sql = `SELECT count(*) count FROM insignia_suscripciones.suscripcion sus
                INNER JOIN insignia_suscripciones.telefono tlf ON tlf.recipient = sus.recipient
                INNER JOIN insignia_suscripciones.abonado ab ON ab.id = tlf.abonado_id
                WHERE sus.product_id = '${json.id_producto}'  AND ab.id = '${user}'`;

      db.query(sql, (err, result) => {
        if(err) {
          db.end()
          reject(err)
        } else {
          if(result[0].count == 0) {
            db.end()
            json.count = 0
            resolve(json)
          }
          else {
            db.end()
            json.count = 1
            resolve(json)
          }
        }
      })
    }
  )
}

function sendSMS(sql_prepared) {
  return new Promise(
    (resolve, reject) => {
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();

      db.query( sql_prepared, (err, result) => {
        if(err) {
          reject(`Error al enviar el mensaje ${err}`)
        } else {
          resolve(`Success!`)
        }
      })
    }
  )
}

function envioSMS(destinatario, prefix, codigo) {
  console.log(`${destinatario} + ${prefix}`)
  var config = require('.././database/config');
  var db = mysql.createConnection(config);
  db.connect();

  var sql = ` SELECT id FROM insignia_alarmas.operadora WHERE prefijo = ${prefix} `

  db.query(sql, (err, result) => {
    if(err) {
      db.end()
      console.log(err)
    }
    else {
      db.end()
      console.log(`${hoy_fecha} - ${hoy_hora}`)
      console.log(result[0].id)
      var sql_insert = "INSERT INTO `insignia_alarmas`.`outgoing`"  +
                       "(`destinatario`, `mensaje`, `fecha_in`, `hora_in`, `tipo_evento`, `cliente`, `operadora`, `status`) "+
                       `VALUES ('${destinatario}', 'Código de verificación: ${codigo}', '${hoy_fecha}', '${hoy_hora}', '2909', '1', '${result[0].id}', '0')`;
      console.log(sql_insert)
      sendSMS(sql_insert)
        .then(success => console.log(success))
        .catch(error => console.log(error))
 
    }
  }) 
}

module.exports = {

  getSomeTest: function(req, res) {

    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();

    let sql = `SELECT 
                  operadora.descripcion PRFIJO,
                  GROUP_CONCAT(telefono.recipient) AS TELEFONO,
                  GROUP_CONCAT(producto.desc_producto) AS PRODUCTO,
                  GROUP_CONCAT(CAST(producto.id_producto AS CHAR)) AS ID,
                  GROUP_CONCAT(telefono.prefix) AS PREFIJO,
                  GROUP_CONCAT(CAST(suscripcion.date_added AS CHAR)) AS DATE
              FROM
                  insignia_suscripciones.telefono telefono
                      INNER JOIN
                  insignia_suscripciones.suscripcion suscripcion ON suscripcion.recipient = telefono.recipient
                      AND suscripcion.prefix = telefono.prefix
                      INNER JOIN
                  sms.producto producto ON producto.id_producto = suscripcion.product_id
                      INNER JOIN
                  insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo
              WHERE
                  telefono.abonado_id = 84
                      AND telefono.active = 1
              GROUP BY operadora.descripcion`

    db.query( sql, (err, result) => {
      db.end()
      result.map( e => {

        e.TELEFONO = e.TELEFONO.split(",")
        e.PRODUCTO = e.PRODUCTO.split(",")
        e.ID       = e.ID.split(",")
        e.DATE     = e.DATE.split(",")
        e.PREFIJO  = e.PREFIJO.split(",")

      })
      //res.send(result)
      return res.render('users/suscription', { data: result });
    })
    
    // return res.render('users/test');
  },

  getSignUp: function(req, res, next) {
      return res.render('users/signup', { messages : req.flash('info') });

  },

  postSignUp: function(req, res, next) {
    var salt = bcrypt.genSaltSync(10);
    var password = req.body.password;
    var password1 = req.body.password1;
    //ID_OPERADORA
    var id_operadora = '';
    if (req.body.operadora == '0414') {id_operadora = 1};
    if (req.body.operadora == '0424') {id_operadora = 2};
    if (req.body.operadora == '58412') {id_operadora = 5};
    if (req.body.operadora == '199') {id_operadora = 4};
    if (req.body.operadora == '158') {id_operadora = 3};

    var user = {
      recipient: req.body.telefono,
      operadora: req.body.operadora,
      id_operadora: id_operadora,
      telefono: (req.body.operadora + req.body.telefono),
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email,
      password: password,
      password1: req.body.password1
    };
    //debug de user
    console.log("USER TELEFONO ->>  ",user.telefono);
    console.log("USER ID_OPERADORA ->>  ",user.id_operadora);
    //validaciones
    if(req.body.password != req.body.password1){
      req.flash('info', 'Las contraseñas deben coincidir');
      res.redirect('/auth/signup');
    }else if(password.length < 8){
      req.flash('info', 'Las contraseñas deben tener al menos 8 caracteres ');
      res.redirect('/auth/signup');
    }else if(user.nombre.length > 50 && user.apellido.length > 50) { 
      req.flash('info', 'El nombre y el apellido debe tener un maximo de 50 caracteres');
      res.redirect('/auth/signup');    
    }
    else{
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    var verificar_correo = "SELECT email FROM insignia_suscripciones.abonado WHERE abonado.email = '"+ user.email +"'";
    db.query(verificar_correo, function(err, result){
      if(err){
        db.end()
        console.log('error al extraer el correo electrónico');
      }else{
          //VERIFICANDO NUMERO DE TELEFONO
          var config = require('.././database/config');
          var db = mysql.createConnection(config);
          db.connect();
          var verificar_numero = "SELECT * FROM insignia_suscripciones.telefono WHERE CONCAT(prefix,recipient) = '"+user.telefono+"'";
          db.query(verificar_numero, function(err, result2){
            if(err){
              db.end()
              console.log('error al extraer el numero de telefono');
            }else{

                if (result2.length > 0) {
                  console.log('success');
                  req.flash('info', '¡Numero registrado con anterioridad!');
                  res.redirect('/auth/signup');
                }else{

        if(result == 0){
          var token = require('../scripts/token_generator')
          var pwd = token.token;
          var sql = "INSERT INTO `insignia_suscripciones`.`abonado` "+
          "(`first_name`, `last_name`, `email`, `password`, `verified`,`signup_date`,`token`,`fecha_token`) "+
          " VALUES ?";

          console.log(hoy);
          var values = [
          [user.nombre, user.apellido, user.email, md5(user.password), false, hoy, pwd, hoy]
          ];

          console.log(user.nombre);
          db.query(sql, [values],  function(err, result){
            if(err) {
              console.log('Erro en el query de INSERT');
              req.flash('info', 'Error Inesperado ');
            } else {
          //OBTENIENDO ID_ABONADO DEL USUARIO QUE SE REGISTRA
          var config = require('.././database/config');
          var db = mysql.createConnection(config);
          db.connect();
          var sql_lastInsert = "SELECT MAX(id) AS Last_Insert FROM insignia_suscripciones.abonado";
          db.query(sql_lastInsert, function(err, result3){
            if(err){
              db.end()
              console.log('error al extraer el ID_ABONADO');
            }else{
                console.log("ID DEL ULTIMO ABONADO ->> ", result3[0].Last_Insert);
                //GENERANDO CODIGO DE VALIDACION VIA SMS
                var characters = 'abcdefghjkl123456789';
                var password = "";
                for (i=0; i<7; i++) {
                  password += characters.charAt(Math.floor(Math.random()*characters.length))
                }
                //--------------------------------------------------------------------------
                //INSERTANDO DATOS DEL TELEFONO DEL ABONADO QUE SE REGISTRA
                var config = require('.././database/config');
                var db = mysql.createConnection(config);
                db.connect();
                var sql_telefono = "INSERT INTO insignia_suscripciones.telefono(prefix, recipient, active, operadora, date_added, abonado_id, codigo_verificacion) VALUES ('"+user.operadora+"', '"+user.recipient+"', '0', '"+user.id_operadora+"', '"+hoy+"', '"+result3[0].Last_Insert+"', '"+password+"')";
                db.query(sql_telefono, function(err, result4){
                  if(err){
                    db.end()
                    console.log('error al extraer el ID_ABONADO');
                  }else{
                        console.log("¡DATOS GUARDADOS CON EXITO!");
                        //PARAMETROS PARA ENVIAR AL WEBSERVICE
                        console.log("NUMERO DE TELEFONO ->> ",user.telefono);
                        console.log("Luego de verificar su correo ingrese a la pestaña telefonos en su cuenta y verifique su numero de telefono con el siguiente codigo: Hl8563j");
                        }


                    })

            }


            })

              console.log('EXITO CON EL QUERY DE INSERT');
              req.flash('info', 'Te registraste correctamente ');
            }
          })
        

          db.end();

          req.flash('info', 'Se ha enviado un correo a la dirección : ' + '\n' + user.email+ '\n' + '\n' +"y un mensaje de texto al numero : "+user.recipient);
          rand = Math.floor((Math.random() * 100) + 54);
          link="http://"+ req.get('host') + "/verify/" + pwd;
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
              to: user.email, // list of receivers
              subject: 'Verificación de correo electrónico', // Subject line
              text: 'Gracias por registrarte en nuestros servicios.', // plain text body
              html: '<div style="font-size: 18px; margin-left: 30px; margin-top: 30px;">Gracias por registrarte en <b>nuestros servicios.</b><br>'+
              'Por favor verifica tu <b>correo</b> entrando en el enlace : <br><br>' +
              '<a href="'+link+'" style=" text-decoration: none; background-color: #34C6A3; color: #fff; padding: 10px 5px; margin-top: 10px;"> Verificar Correo </a></div><br><br>'
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
          });
          return res.redirect('/auth/signin');

          // create reusable transporter object using the default SMTP transport
          
        }else{
          req.flash('info', '¡Error: existe un usuario registrado con ese correo!');
          res.redirect('/auth/signup');
        }
      }
      }
    }) 

}

});

  }},

  newpwd: function(req, res, next){
    res.render('users/nuevacontrasena', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user
    });

  },

  postnewpwd: function(req, res, next){
    console.log('TAMANO :'+  req.body.password1);
    console.log('password anterior -> ' + req.user.password);
    if(md5(req.body.password) != req.user.password) {
      req.flash('msg', 'La contraseña anterior no es correcta');
      res.render('users/nuevacontrasena', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      msgE: 'La contraseña anterior no es válida',
      msgS: '' 
    });
    }else {
      console.log("USER ID ->> ",req.user.id, "Y EL PASSWORD ->>",req.body.password1);
      var sql = "UPDATE insignia_suscripciones.abonado SET password = '"+md5(req.body.password1)+"' WHERE abonado.id = '"+req.user.id+"'";
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();
      db.query(sql, function(err, result){
        if(err){
          console.log('error');
        }else{
          console.log('success!');
        }
      })
      db.end();
      req.flash('msg', 'Contraseña modificada con éxito');
      res.render('users/nuevacontrasena', {
      isAuthenticated : req.isAuthenticated(),
      user: req.user,
      msgE: '',
      msgS: 'Contraseña modificada con éxito'
    }); 
    }

  },

  nosotros: function(req, res, next){
    res.render('users/nosotros');
  },

  actualizar: function(req, res, next){
    console.log('lol');
      console.log((req.body.nombre).length);
      console.log('tamaño del apellido ->' + (req.body.apellido).length);
      if((req.body.nombre).length < 4){
        req.flash('msg', 'El mínimo de caracteres es 4');
        res.render('users/panel', {
        isAuthenticated : req.isAuthenticated(),
        user: req.user,
        msg: req.flash('msg')
        });
      } else 
      {   console.log('enter to else ');
          var sql = "UPDATE `insignia_suscripciones`.`abonado` SET `first_name`='"+req.body.nombre+"', `last_name`='"+req.body.apellido+"'  WHERE `email`='"+req.user.email+"'";
          var config = require('.././database/config');
          var db = mysql.createConnection(config);
          db.connect();

          db.query(sql, function(err, result){
            if(err){
              db.end()
              console.log('error');
            } else {
              db.end()
                /*req.flash('msg', 'Datos actualizados con éxito.');
                res.render('users/panel', {
                isAuthenticated : req.isAuthenticated(),
                user: req.user,
                msg: req.flash('msg')
          });*/
        }
      });

      }


    
  },

  getSignIn: function(req, res, next) {
    return res.render('users/signin', {messages : req.flash('info'), authmessage : req.flash('authmessage'), success: ''});
  },

  logout: function(req, res, next){
    req.logout();
    res.redirect('/auth/signin');
  },

  validateToken: function(req, res){
    var sql = "select * from insignia_suscripciones.abonado where token = '" + req.params.token + "'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();

    db.query(sql, function(err, result){
      if(err) console.log('bad');
      else {
        if(result == ''){    
          req.flash('info', 'Error al validar el token vuelve a intentarlo.');
          return res.render('users/signin', {messages : req.flash('info'), authmessage : req.flash('authmessage')});
        }else {
          var token = require('../scripts/token_generator')
          var pwd = token.token;
          var sql = "UPDATE `insignia_suscripciones`.`abonado` SET `verified`='1', `signoff_date`='"+hoy+"',`token` = '"+pwd+"', `fecha_token` = '"+hoy+"', active = '1' WHERE `token`='"+req.params.token+"'";
          db.query(sql, function(err, result){
            if(err){
              db.end();
              req.flash('info', 'Error inesperado, vuelve a intentarlo.');
              return res.render('users/signin', {messages : req.flash('info'), authmessage : req.flash('authmessage')});
            }else {
              db.end();
              req.flash('info', 'Token validado con éxito, ya puedes acceder al sistema.');
              return res.render('users/signin', {messages : req.flash('info'), authmessage : req.flash('authmessage')});
            }
          });
        }
      }
    });

  },

  getUserPanel: function(req, res, next) {
    res.render('users/panel', {
        isAuthenticated : req.isAuthenticated(),
        user: req.user
    });
  },

  getProductos: function(req, res, next){
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    var sql = "SELECT * FROM insignia_suscripciones.abonado";
    var sql1 = ` SELECT DISTINCT
                  (IF(op.id = 1 OR op.id = 2,
                      'Movistar',
                      IF(op.id = 3 OR op.id = 4,
                          'Movilnet',
                          'Digitel'))) AS operadora,
                  pc.sc
              FROM
                  insignia_suscripciones.proveedor_de_contenido pc
                      INNER JOIN
                  sms.sc_id sc ON sc.sc_id = pc.sc
                      INNER JOIN
                  insignia_masivo_premium.operadora op ON op.id = sc.id_op
              GROUP BY operadora , pc.sc `;

    db.query(sql1, function(err, result){
      if(err){
        db.end()
        console.log('Ups! hay un error');
      } else {
        console.log(result);
        collect = utils.get(result)
        var sql = "SELECT telefono.recipient TELEFONOS, telefono.active ACTIVO FROM insignia_suscripciones.telefono telefono " + 
        " INNER JOIN insignia_suscripciones.abonado abonado ON abonado.id = telefono.abonado_id " +
        " WHERE abonado.id = " + req.user.id + " AND telefono.active NOT LIKE 0 ";


        db.query(sql, function(err, result1){
          if(err) {
            b.end();
            req.flash('info', 'Error inesperado, vuelve a intentarlo.');
            return res.render('users/signin', {messages : req.flash('info'), authmessage : req.flash('authmessage')});
          } else {
            db.end();
            res.render('users/productos',{
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            datos_: collect,
            telefonos: result1,
            footerAttr: 'none'
            });         
          }
        })

      }
    });
    
  },

  searchSC: function(req, res, next){

    var sql = `SELECT 
                proveedor.sc,
                proveedor.cliente,
                proveedor.id_producto,
                proveedor.actualizado,
                shortcode.tarifa tarifa,
                proveedor.disponible,
                proveedor.tipo_aplicacion,
                sms.producto.alias_producto,
                producto.desc_producto,
                operadora.descripcion
            FROM
                insignia_suscripciones.proveedor_de_contenido proveedor
                    INNER JOIN
                sms.producto producto ON producto.id_producto = proveedor.id_producto
                    INNER JOIN
                sms.sc_id shortcode ON producto.id_sc = shortcode.Id_sc
                    INNER JOIN
                insignia_masivo_premium.operadora operadora ON shortcode.id_op = operadora.id
                    LEFT JOIN
                insignia_suscripciones.suscripcion suscripcion ON suscripcion.product_id = producto.id_producto
                    LEFT JOIN
                insignia_suscripciones.telefono telefono ON telefono.recipient = suscripcion.recipient
            WHERE
                sc = '${req.params.id}' AND operadora.descripcion LIKE '${req.params.op}%' AND proveedor.disponible = 1 group by id_producto`;

    var config = require('.././database/config');
    var db = mysql.createConnection(config, {multipleStatements: true});
    db.connect();

    db.query(sql, function(err, result){
      if(err){
        console.log(err);
        db.end();
      } else {
        console.log(result);

        var sql_tlf = "SELECT telefono.recipient TELEFONOS, telefono.prefix PREFIX1, operadora.descripcion PREFIJO, telefono.active ACTIVO "+
        "FROM insignia_suscripciones.telefono telefono INNER JOIN insignia_suscripciones.abonado abonado "+
        " ON abonado.id = telefono.abonado_id INNER JOIN insignia_masivo_premium.operadora operadora "+
        " ON telefono.prefix = operadora.prefijo WHERE abonado.id =" + req.user.id +" AND telefono.active = 1 AND operadora.descripcion LIKE '" +req.params.op +"%'";
        //console.log(sql_tlf)
        db.query(sql_tlf, function(err_tlf, result_tlf){
          if(err_tlf){
            //console.log(sql_tlf);
            db.end();
          } else {
            setQuery(result, req.user.id) 

              .then(query => {   
                var json = { }
                db.query(query, (errQ, resultQ) => {
                  if(errQ) console.log(err)
                  else {

                    result.map (collect => {
                      let x = _.filter(resultQ, {product_id: collect.id_producto})
                      x == '' ? collect.count = 0 : collect.count = 1
                    })

                    db.end()
                    //AQUI SE ELIMINAN LOS PRIMEROS 3 CARACTERES DE LA DECRIPCION DEL PRODUCTO, QUE CORRESPONDEN AL SCHORTCUT QUE SE REPITE
                    for (var i = 0; i < result.length; i++) {
                      var descProducto = result[i].desc_producto.substring(4, result[i].desc_producto.length);
                      console.log("Prueba ->> ",descProducto);
                      result[i].desc_producto = descProducto;
                    };



                    res.render('users/busqueda',{
                      isAuthenticated : req.isAuthenticated(),
                      user: req.user,
                      datos: result,
                      telefonos: result_tlf
                      });  
                    }
                })

              })
              .catch(error => console.log(error) )

/*
            var promises = []

            result.forEach(function(element) {
              var end = (element.descripcion).searchSCh(' ');
              element.descripcion = element.descripcion.substr(0, end);
              promises.push(setJsonArray(element, req.user.id))
            });


            Promise.all(promises)
              .then(result => {
                db.end()
                res.render('users/busqueda',{
                isAuthenticated : req.isAuthenticated(),
                user: req.user,
                datos: result,
                telefonos: result_tlf
                });  
              })
              .catch(error => console.log(error))*/
          }
        })

      }
    })

  },

//GET NUMEROS PARA EL MODULO NUMEROS
  getNumeros: function(req, res, next){
      console.log(req.user.id);
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();

      var sql = "SELECT telefono.recipient TELEFONOS, operadora.descripcion PREFIJO, telefono.active ACTIVO "+
      "FROM insignia_suscripciones.telefono telefono INNER JOIN insignia_suscripciones.abonado abonado "+
      " ON abonado.id = telefono.abonado_id INNER JOIN insignia_masivo_premium.operadora operadora "+
      " ON telefono.prefix = operadora.prefijo WHERE abonado.id =" + req.user.id;

      db.query(sql, function(err, result){
        if(err){
          console.log('Ups! hay un error');
          db.end();
        } else {
          var sql1 = "SELECT * FROM insignia_masivo_premium.operadora where prefijo not like '33412'";
          db.query(sql1, function(err1, result1){
            if(err1){
              console.log('something bad');
              db.end();
            } else {
             
              console.log(result);
              db.end();
              res.render('users/numeros',{
              isAuthenticated : req.isAuthenticated(),
              user: req.user,
              telefonos: result,
              operadoras: result1,
              messages : req.flash('info'),
              authmessage : req.flash('authmessage')
              });   

            }
          })
        }
    })

  },
  
//GETNUMEROS PARA EL DASHBOARD
getNumerosDashboard: function(req, res, next){
      console.log(req.user.id);
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();

      var sql = "SELECT telefono.recipient TELEFONOS, operadora.descripcion PREFIJO, telefono.active ACTIVO "+
      "FROM insignia_suscripciones.telefono telefono INNER JOIN insignia_suscripciones.abonado abonado "+
      " ON abonado.id = telefono.abonado_id INNER JOIN insignia_masivo_premium.operadora operadora "+
      " ON telefono.prefix = operadora.prefijo WHERE abonado.id =" + req.user.id;

      db.query(sql, function(err, result){
        if(err){
          console.log('Ups! hay un error');
          db.end();
        } else {
          var sql1 = "SELECT * FROM insignia_masivo_premium.operadora where prefijo not like '33412'";
          db.query(sql1, function(err1, result1){
            if(err1){
              console.log('something bad');
              db.end();
            } else {
              res.send(result);
              console.log(result);
              db.end();
              
            }
          })
        }
    })

  },


  getNumeroAct: function(req, res, next){
      console.log('works');
      var characters = 'abcdefghjkl123456789';
      var password = "";
      for (i=0; i<7; i++) {
        password += characters.charAt(Math.floor(Math.random()*characters.length))
      }
      
      var sql1 = "SELECT * FROM insignia_masivo_premium.operadora where descripcion = '" + req.params.descrip + "'"; 
      var sql_count = "SELECT COUNT(*) contador FROM insignia_suscripciones.telefono where abonado_id = '" + req.user.id + "'";

      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();

      db.query(sql_count, function(error_count, result_count){
        if(error_count){
          res.sendStatus(404);
        } else {
          if(result_count[0].contador > 2) {
            res.status(200).send('MAYOR');
            db.end();
          } else {
            db.query(sql1, function(err, result){
              if(err){
                console.log('false');
                db.end();
                res.sendStatus(404);
              } else {
                  var prefix = result[0].prefijo;
                  var id_prefix = result[0].id;

                  var number_comprobation = "SELECT * FROM insignia_suscripciones.telefono WHERE recipient = '" + req.params.numero + "' AND prefix = '" + prefix + "'";
                  console.log(number_comprobation);

                  db.query(number_comprobation, function(err_comprobation, result_comprobation) {
                    if(err_comprobation) {
                      db.end();
                      res.sendStatus(404);
                    } else {
                      if(result_comprobation == '') {
                        var sql = "INSERT INTO `insignia_suscripciones`.`telefono` " +
                        "(`prefix`, `recipient`, `active`, `operadora`, `date_added`, `abonado_id`, `codigo_verificacion`)" +
                        " VALUES ('"+prefix+"', '"+req.params.numero+"', '0', "+ id_prefix +", '"+hoy+"', "+req.user.id+", '"+password+"') ";
                        console.log(`INSERT-> ${sql}`)
                        db.query(sql, function(err1, result1){
                          if(err){
                            console.log('false');
                            db.end();
                            res.sendStatus(404);    
                          } else {
                            console.log('works!');
                            //envioSMS(req.params.numero, prefix, password) Mensaje de NOTIFICACION DE SUSCRIPCION DE NUMERO-TELEFONICO
                            db.end();
                            res.status(200).send('OK');
                          }
                        }); 
                      } else {
                        db.end();
                        res.sendStatus(404);     
                      }
                  }
                })
        }
      });
          }
        }
      })
  },

  numberVerification: function(req, res, next){
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    console.log('Numero -> ' + req.params.numero);
    console.log('Clave -> ' + req.params.pwd);
    var sql = "select count(*) cont from insignia_suscripciones.telefono where recipient = '" + req.params.numero + "' " +
              " and codigo_verificacion = '" + req.params.pwd + "'";
    db.connect();
  
    db.query(sql, function(err, result){
      if(err){
        console.log('false');
        console.log(sql);
        db.end();
      }else{
        console.log(result.cont);
        if(result[0].cont == 0){
          db.end();
          console.log('enviando el 201');
          res.status(200).send('ERROR');
          //res.send(404); 
        }else{
          var sql1 = "UPDATE `insignia_suscripciones`.`telefono` SET `active`='1', `date_verified` = '"+ hoy +"' WHERE `recipient`='"+req.params.numero+"'";
          db.query(sql1, function(err1,result1){
            if(err){
              db.end();
              console.log('enviando el 201');
               res.send(404); 
            }else{
              console.log('yay!');
              db.end();
              console.log('enviando el 200');
              res.status(200).send('OK');
             //res.send(404); 
            }
          });
        }
      }
    });
  },

  registrarNumero: function (req, res, next){
    console.log('works!');
  },

  deleteNumero: function(req, res, next) {
      var sql_operator = "SELECT prefijo FROM insignia_masivo_premium.operadora WHERE descripcion = '" + req.params.operadora + "'";
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();

      db.query(sql_operator, function(err_operator, result_operator){
        if(err_operator){
          console.log('Error al eliminar el número ..');
          db.end();
        } else {
          var sql = "DELETE FROM insignia_suscripciones.telefono WHERE recipient = '" + req.params.numero + "' AND prefix = '" + result_operator[0].prefijo + "'";
          console.log('value -> ' + result_operator[0].prefijo);
          db.query(sql, function(err, result){
            if(err) {
              console.log(' X Error al eliminar el número ..');
              db.end();
            } else {
              console.log('SUCCESS!');
              var sql_detele_suscriptions = "DELETE FROM `insignia_suscripciones`.`suscripcion` WHERE `recipient`='"+req.params.numero+"' AND prefix = '"+result_operator[0].prefijo+"'";
              db.query(sql_detele_suscriptions, function(err_delete_suscriptions, result_delete_suscriptions){
                if(err_delete_suscriptions) {
                  console.log('fail to delete suscriptions ! ');
                } else {
                  db.end();
                  res.redirect('/users/numeros');
                }
              })
            }
          })

        }
      });
  },

  desactivarNumero: function(req, res, next) {

      var sql = "UPDATE insignia_suscripciones.telefono SET active = 0 WHERE recipient = '"+ req.params.numero +"'";
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();    

      db.query(sql, function(err, result){
        if(err){
          db.end();
          console.log('¡Ups! Hay un error ..');
        }else {
          db.end();
          res.redirect('/users/numeros');
        }
      });

  },

  getSuscripcion: function(req, res, next){
    console.log(req.params.producto);

    var sql = "SELECT producto.id_sc ID, producto.id_producto IDP, shorcut.sc_id IDS, cliente.Id_cliente IDCLIENTE, producto.desc_producto DESCRIPCION, "+
    " cliente.Des_cliente CLIENTE, "+
    " producto.alias_producto CATEGORIA, "+
    " shorcut.Id_sc SHORCUT, "+
    " shorcut.tarifa TARIFA "+
    "FROM "+
    " sms.producto producto "+
                               " INNER JOIN "+
    " sms.cliente cliente ON producto.cliente = cliente.id_cliente "+
							   " INNER JOIN "+
	  " sms.sc_id shorcut "+
	  " ON shorcut.Id_sc = producto.id_sc "+
    " WHERE "+
    " cliente.Des_cliente NOT LIKE 'CERRADO_%' "+
    " AND producto.desc_producto NOT LIKE 'CERRADO_%' "+
    " AND producto.id_producto = "+ req.params.producto +
    " AND producto.desc_producto NOT LIKE '%MULTA%' GROUP BY producto.desc_producto";

    var sql1 = "SELECT operadora.descripcion OPERADORA, telefono.recipient TELEFONOS, telefono.active ACTIVO "+
    " FROM insignia_suscripciones.telefono telefono "+
    " INNER JOIN insignia_suscripciones.abonado abonado ON abonado.id = telefono.abonado_id "+
    " INNER JOIN insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo"+
    " WHERE abonado.id =" + req.user.id + " AND telefono.active NOT LIKE 0";
    console.log(sql1);
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();   

    db.query(sql, function(err, result){
      if(err){
        console.log(sql);
      } else {
        db.query(sql1, function(err1, result1){
          if(err1){
            console.log(result1);
            console.log('error en el segundo query');
          }else{
            if(!result){
              console.log('no hay telefonos')
            }
            db.end();
            res.render('users/suscripcion',{
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            producto: result,
            telefonos: result1
          }); 
          }
        })
      }
    }); 

  },

  tokenNewpwd: function(req, res) {
    console.log("ID QUE RECIBE ->> ",req.params.id);

    var sql = "SELECT * FROM insignia_suscripciones.abonado WHERE id = '" + req.params.id + "'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect(); 

    db.query(sql, function(err, result){
      if(err) {
        console.log('error');
      } else {
        res.render('users/renovarcontrasena', {
            id: req.params.id
          });
        
      }
    })
  },

  postnewPassword: function(req, res) {
    console.log('works!');
    console.log("password normal ->",req.body.password1);
    console.log(req.params.id);
    var token = require('../scripts/token_generator')
    var pwd = token.token;
    var sql = "UPDATE `insignia_suscripciones`.`abonado` SET `password`='"+md5(req.body.password1)+"', `token` = '"+pwd+"', `fecha_token` = '"+hoy+"' WHERE `id`='"+req.params.id+"'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    console.log(sql);
    db.connect(); 

    db.query(sql, function(err, result){
      if(err){
        res.status(200).send('ERROR');
        db.end();
      } else {
        res.render('users/signin', {
          success: 'Editaste tu contraseña exitosamente',
          authmessage: '',
          messages: ''
        })
        db.end();
      }
    })

  },

  //ENVIAR EL MENSAJE DE RECUPERAR CONTRASEÑA PASSWORD---------------------------------------
sendRecoverSMS: function(req, res){
  //DEBUG- DATOS RECIBIDOS
  console.log(" OPERADORA -> "+ req.params.operadora +" TELEFONOOO -> "+ req.params.telefono);
  //BUSQUEDA DE CODIGO_VERIFICACION DE TELEFONO
  var sql= "SELECT * FROM insignia_suscripciones.telefono WHERE prefix = '"+req.params.operadora+"' AND recipient = '"+req.params.telefono+"'";
  var config = require('.././database/config');
  var db = mysql.createConnection(config);
  db.connect();  

  db.query(sql, function(err, result){
    if(err){
      console.log('error');
      db.end();
    } else {
    if (result.length > 0) {
      //PARAMETROS A ENVIAR AL WEBSERVICE
      console.log("ABONADO_ID -> ",result[0].abonado_id," OPERADORA_ID -> ",result[0].operadora,"TELEFONO ->  ",result[0].recipient," CODIGO_VERIFICACION -> ",result[0].codigo_verificacion);
      res.status(200).send('OK');
    }else{
        console.log("Numero no registrado");
        res.status(200).send('ERROR');
    }
    
      }
  })
},

  //-------------------------------------------------------


//CHECK Y VALIDAR QUE CODIGO ENVIADO SEA EL MISMO QUE SE INTRODUJO
  newPassword: function(req, res){
      //DEBUG CODE
       console.log("CODE ->  ",req.params.code);

      //COMPARACION DE CODIGO INGRESADO Y CODIGO EN BBDD
      var sql_codigo = "SELECT * FROM insignia_suscripciones.telefono WHERE codigo_verificacion = '"+req.params.code+"'";
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();  
      db.query(sql_codigo, function(err, result){
        if(err){
          console.log('error');
          db.end();
        } else {
          if (result.length > 0) {
          var sql_user = "SELECT * FROM insignia_suscripciones.abonado where abonado.id= '"+result[0].abonado_id+"'";
          db.query(sql_user, function(err1, result_user){
          
          user_data = {
            id: result_user[0].id,
            find: true,
            nombre: result_user[0].first_name,
            apellido: result_user[0].last_name
          }
          res.send(user_data);
          console.log("Codigo perteneciente a -> ",result_user[0].first_name," ",result_user[0].last_name,"?");
          })
          }else{
            response_data = {
            find: false,
            message: '¡Codigo de validacion no pertenece a ningun usuario!'
            }
            res.send(response_data);
          }
        }
      })
  },
//------------------------------------------------------------

//CHECK QUE EL CORREO SE ENCUENTRE EN BBDD Y ENVIA CORREO CON TOKEN (REPUERAR CONTRASEÑA).
 checkEmail: function(req, res, next){
    console.log(req.params.correo);
    var sql_check = "SELECT * FROM insignia_suscripciones.abonado WHERE email = '"+req.params.correo+"'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();  
    db.query(sql_check, function(err, result){
      if(err){
        console.log('error');
        res.send("¡ERROR EN EL QUERY!");
      } else {
        
        if (result.length > 0) {
          data = {find: true, user: result};
          res.status(200).send(data);
          console.log(data);


        //ENVIAR CORREO AL USUARIO
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
              to: result[0].email, // list of receivers
              subject: '¡Recuperacion de usuario!', // Subject line
              text: '', // plain text body
              html: 'TOKEN: ' + result[0].token
              
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
          });


        }else{
          data = {find: false, user: result, message:'¡USUARIO NO EXISTE!'};
          res.status(200).send(data);
          console.log(data);
        }
           
      }
    });
  },


 //ENVIAR EL CORREO DE RECUPERAR CUENTA---------------------------------------
checkToken: function(req, res){
  //DEBUG- TOKEN RECIBIDO
  console.log(" TOKEN -> "+ req.params.token);
  //BUSQUEDA DE TOKEN DE TELEFONO
  var sql= "SELECT * FROM insignia_suscripciones.abonado WHERE token = '"+req.params.token+"'";
  var config = require('.././database/config');
  var db = mysql.createConnection(config);
  db.connect();  

  db.query(sql, function(err, result){
    if(err){
      console.log('error');
      db.end();
    } else {
    if (result.length > 0) {
      data = {comparation: true, user: result[0]}
    }else{
       data = {comparation: false, message: '¡Token no pertenece a ninguna cuenta!'}
    }
      res.status(200).send(data);
      }
  })
},

//-----------------------------------------------------------------------------



  getMySuscripcions: function(req, res, next){
    var sql = " SELECT operadora.descripcion PRFIJO, telefono.recipient TELEFONO, producto.desc_producto PRODUCTO, producto.id_producto ID, telefono.prefix PREFIJO, suscripcion.date_added DATE FROM insignia_suscripciones.telefono telefono "+
    " INNER JOIN insignia_suscripciones.suscripcion suscripcion " +
    " ON suscripcion.recipient = telefono.recipient AND suscripcion.prefix = telefono.prefix " +
    " INNER JOIN sms.producto producto " +
    " ON producto.id_producto = suscripcion.product_id " +
    " INNER JOIN insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo"+
    " WHERE telefono.abonado_id="+req.user.id+" AND telefono.active=1";

    var completeNumberSQL = "SELECT DISTINCT CONCAT_WS('-',operadora.descripcion, telefono.recipient) AS CompleteNumber FROM insignia_suscripciones.telefono telefono"+
    " INNER JOIN insignia_suscripciones.suscripcion suscripcion"+
    " ON suscripcion.recipient = telefono.recipient AND suscripcion.prefix = telefono.prefix"+
    " INNER JOIN sms.producto producto"+
    " ON producto.id_producto = suscripcion.product_id"+
    " INNER JOIN insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo"+
    " WHERE telefono.abonado_id="+req.user.id+" AND telefono.active=1";

    //var sql1 = "SELECT * FROM insignia_suscripciones.suscripcion WHERE ";

    //console.log('sql -> ' + sql);


    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();  
    db.query(sql, function(err, result){
      if(err){
        console.log('error');
      } else {
        var config = require('.././database/config');
        var db = mysql.createConnection(config);
        db.connect();  
        db.query(completeNumberSQL, function(err, result2){
          if (err) {
            console.log("ERROR!");
          }else{
            console.log(result);
            console.log(result2);
            
            
            
          }
          //OBTENER UN PEDAZO DE CADENA DE COMPLETE_NUMBER PARA DIFERENCIAR LAS LINEAS A LAS QUE PERTENECE CADA NUMERO
          var Obj_Lineas = [];
          var Numeros_Movilnet = [];
          var Numeros_Movistar = [];
          var Numeros_Digitel = [];
         
          for (var i = 0; i < result2.length; i++) {
              var difLinea = (result2[i].CompleteNumber).substr(0, 5);
              Obj_Lineas.push(difLinea);

            if (Obj_Lineas[i] == 'Movil')  {Numeros_Movilnet.push(result2[i].CompleteNumber);}
            if (Obj_Lineas[i] == 'Movis')  {Numeros_Movistar.push(result2[i].CompleteNumber);}
            if (Obj_Lineas[i] == 'Digit')  {Numeros_Digitel.push(result2[i].CompleteNumber);}
          }
             //DEBUG
             console.log("Numeros_Movilnet ->> ",Numeros_Movilnet);
            console.log("Numeros_Movistar ->> ",Numeros_Movistar);
           console.log("Numeros_Digitel ->> ",Numeros_Digitel);

          result.map( element => {
              element.DATE = moment(element.FECHA).format('YYYY /MM /DD');
            })
            db.end();
            res.render('users/missuscripciones',{
            isAuthenticated : req.isAuthenticated(),
            user: req.user,
            producto: result,
            NumerosUser: result2,
            //NUMEROS DE TELEFONO REGISTRADOS
            Numeros_Movilnet: Numeros_Movilnet,
            Numeros_Movistar: Numeros_Movistar,
            Numeros_Digitel: Numeros_Digitel,
            FooterAttr: "absolute"

          }); 

    });


            
           
      }
    });
  },

  Suscribir: function(req, res, next) {
    var inicio = ((req.params.numero).search('-'));
    var number = ((req.params.numero).substr((inicio + 2),(req.params.numero).length));
    var inicio_prefix = ((req.params.numero).search(' '));
    var prefix = (req.params.numero).substr(inicio_prefix + 1, inicio);
    var newprefix = (req.params.numero).substr(0, inicio-1);
    console.log("Number -> "+number+" inicio_prefix -> "+inicio_prefix+" Prefix -> "+prefix+" NewPrefix -> "+ newprefix);
    console.log(newprefix);
    var sql_operator = "SELECT prefijo FROM insignia_masivo_premium.operadora WHERE descripcion = '" + newprefix + "'";
    console.log(sql_operator);
    
    var fin_prefix = prefix.search(' ');
    var prefix = prefix.substr(0, fin_prefix);

    console.log('prefijo -> ' + fin_prefix);
    console.log('EL PREFIJO ES -> ' + prefix);
    console.log('el numero es -> ' + req.params.numero);
    console.log('el inicio es -> ' + inicio);
    console.log('el tamaño es ->' + (req.params.numero).length);
    console.log('la cadena cortada es -> ' + number);


    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();


    db.query(sql_operator, function(err_operator, result_operator){
      if(err_operator){
        db.end();
        res.status(200).send('ERROR');
      } else {
          //var sql_comprobation = "SELECT count(*) count FROM insignia_suscripciones.suscripcion where product_id = '"+ req.params.id +"' and recipient = '"+ number +"' and prefix = '"+result_operator[0].prefijo+"'";
          var sql_comprobation = ` SELECT 
                                      COUNT(*) count
                                  FROM
                                      insignia_suscripciones.suscripcion sus
                                          INNER JOIN
                                      insignia_suscripciones.telefono tlf ON tlf.recipient = sus.recipient
                                          INNER JOIN
                                      insignia_suscripciones.abonado ab ON ab.id = tlf.abonado_id
                                  WHERE
                                      sus.product_id = '${req.params.id}'
                                          AND sus.recipient = '${number}'
                                          AND sus.prefix = '${result_operator[0].prefijo}'
                                          AND ab.id = '${req.user.id}' ` 
          db.query(sql_comprobation, function(err_comprobation, result_comprobation) {
            if(err_comprobation) {
              db.end();
              res.status(200).send('YA');
            } else {
              if(result_comprobation[0].count != 0) {
                db.end();
                console.log(sql_comprobation)
                res.status(200).send('YA');
              } else {
                var sql_insert = "INSERT INTO `insignia_suscripciones`.`suscripcion` (`product_id`, `id_cliente`, `date_added`, `recipient`, `prefix`) VALUES ('"+req.params.id+"', '"+req.params.cliente+"', '"+ hoy +"', '"+number+"', '"+result_operator[0].prefijo+"')";
                db.query(sql_insert, function(err_insert, result_insert){
                  if(err_insert) {
                    db.end();
                    res.status(200).send('YA');
                  } else {
                    db.end();
                    res.status(200).send('OK');
                  }
                })
              }
            }
          })
        }
    }); 
  },

//SUSCRIBIR DESDE EL DASHBOARD

SuscribirDashboard: function(req, res, next) {
   console.log("DATOS RECIBIDOS -> LINEA -> "+req.params.linea+" NUMERO -> "+req.params.numero+" ID_PRODUCTO -> "+req.params.id+" ID_CLIENTE -> "+req.params.cliente);
   

    var sql_operator = "SELECT prefijo FROM insignia_masivo_premium.operadora WHERE descripcion = '" + req.params.linea + "'";
    console.log(sql_operator);
   
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();


    db.query(sql_operator, function(err_operator, result_operator){
      if(err_operator){
        db.end();
        res.status(200).send('ERROR');
      } else {
          //var sql_comprobation = "SELECT count(*) count FROM insignia_suscripciones.suscripcion where product_id = '"+ req.params.id +"' and recipient = '"+ number +"' and prefix = '"+result_operator[0].prefijo+"'";
          var sql_comprobation = ` SELECT 
                                      COUNT(*) count
                                  FROM
                                      insignia_suscripciones.suscripcion sus
                                          INNER JOIN
                                      insignia_suscripciones.telefono tlf ON tlf.recipient = sus.recipient
                                          INNER JOIN
                                      insignia_suscripciones.abonado ab ON ab.id = tlf.abonado_id
                                  WHERE
                                      sus.product_id = '${req.params.id}'
                                          AND sus.recipient = '${req.params.numero}'
                                          AND sus.prefix = '${result_operator[0].prefijo}'
                                          AND ab.id = '${req.user.id}' ` 
          db.query(sql_comprobation, function(err_comprobation, result_comprobation) {
            if(err_comprobation) {
              db.end();
              res.status(200).send('YA');
            } else {
              if(result_comprobation[0].count != 0) {
                db.end();
                console.log(sql_comprobation)
                res.status(200).send('YA');
              } else {
                var sql_insert = "INSERT INTO `insignia_suscripciones`.`suscripcion` (`product_id`, `id_cliente`, `date_added`, `recipient`, `prefix`) VALUES ('"+req.params.id+"', '"+req.params.cliente+"', '"+ hoy +"', '"+req.params.numero+"', '"+result_operator[0].prefijo+"')";
                db.query(sql_insert, function(err_insert, result_insert){
                  if(err_insert) {
                    db.end();
                    res.status(200).send('YA');
                  } else {
                    db.end();
                    res.status(200).send('OK');
                  }
                })
              }
            }
          })
        }
    }); 
  },





  eliminarSuscripcion: function(req, res, next) {
    console.log('ELIMINAR FUNCIONA!');
    /*
    console.log(req.params.producto + ' ' + req.params.numero);
    numero = req.params.numero;
    var sql = "DELETE FROM insignia_suscripciones.suscripcion WHERE product_id ='"+req.params.producto+"'"+
    " AND recipient = '"+numero+"'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        console.log('hay un error');
        res.send(200);
        db.end();
      }else {
          console.log('SUCCESS!');
          db.end();
          res.redirect('/users/numeros');
      }
    })*/
  },

  getAdminSignIn: function(req, res, next){
    return res.render('admin/signin', {messages : req.flash('info'), authmessage : req.flash('authmessage')});
  },
            
  adminUsers: function(req, res, next){
    var sql = "SELECT id ID, last_name APELLIDO, first_name NOMBRE, email CORREO, signup_date FECHA, verified VRF, active ACTIVE  FROM insignia_suscripciones.abonado";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        db.end()
        console.log('hay un error');
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
      }else {
        result.forEach(function(element) {
          element.FECHA = moment(element.FECHA).format('YYYY /MM /DD');
        });
        db.end();
        console.log("DATOS -->> ",result);
        res.render('admin/users', {data: result});
      }
    })

  },

  adminLogout: function(req, res, next){
    req.logout();
    res.redirect('/admin');
  },

  adminNumbers: function(req, res, next){
    var sql = "SELECT tlf.recipient TLF, operadora.descripcion PREFIJO, tlf.active ACT, abonado.id ID, abonado.email EMAIL, abonado.first_name NOMBRE, abonado.active ACTIVO FROM insignia_suscripciones.telefono tlf " +
              " INNER JOIN insignia_suscripciones.abonado abonado " +   
              " ON  abonado.id = tlf.abonado_id " + 
              "INNER JOIN insignia_masivo_premium.operadora operadora ON tlf.prefix = operadora.prefijo";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        console.log('erro inesperado');
        res.render('admin/signin', {
          authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
      }else {
        db.end();
        res.render('admin/numbers', {data: result});
      }
    })
  },
//CONTROLADOR DE PAGINA PARA ELIMINAR SUSCRIPCIONES
 getSuscripciones: function(req, res, next){
  //SEPARANDO VALOR DE ENTRADA EN LINEA Y RECIPIENTE PARA REALIZAR EL QUERY
    var NumeroEntrante = req.params.Numero;
    var campos     = req.params.Numero.split('-');
    var Linea      = campos[0];
    var Recipiente = campos[1];
    console.log("LINEA ->> ",Linea);
    console.log("NUMERO ->> ",Recipiente);
    //------

    var sql = "SELECT operadora.descripcion PRFIJO, telefono.recipient TELEFONO, producto.desc_producto PRODUCTO, producto.id_producto ID, telefono.prefix PREFIJO, suscripcion.date_added DATE FROM insignia_suscripciones.telefono telefono"
    + " INNER JOIN insignia_suscripciones.suscripcion suscripcion"
    + " ON suscripcion.recipient = telefono.recipient AND suscripcion.prefix = telefono.prefix"
    + " INNER JOIN sms.producto producto"
    + " ON producto.id_producto = suscripcion.product_id"
    + " INNER JOIN insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo"
    + " WHERE operadora.descripcion= '"+Linea+"' AND  telefono.recipient='"+Recipiente+"'";

    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      console.log(result);
      if(err){
        //console.log('error inesperado');
        res.render('users/suscripciones', {mensaje: 'ERROR AL BUSCAR EN BBDD', messages: '', });
      }else {
        db.end();
        for (var i = 0; i < result.length; i++) {
          //console.log(result[i].DATE);
          result[i].DATE = result[i].DATE.date("YYYY-MM-DD");

        };
        res.render('users/suscripciones', {
          isAuthenticated : req.isAuthenticated(),
          user: req.user,
          Productos: result, 
          Linea: Linea, 
          Recipiente: Recipiente, 
          NumeroEntrante: NumeroEntrante,
          footerAttr: "none"

          });

      }
    })
  },


  //--------------------------------------------------------------




 adminEmailControl: function(req, res, next){
    console.log('works!');
    var sql = "SELECT * FROM insignia_suscripciones.email_notificator";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);

    db.query(sql, function(err, result){
      if(err){
        console.log('error');
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
      }else {
        console.log('yay!')
        console.log(result);
        db.end();
        res.render('admin/email',{
          data: result
        });
      }
    });
  },

  adminNotificationsControl: function(req, res, next){
    var sql = `SELECT 
                noti.product_id,
                sc.sc_id shortcode,
                producto.desc_producto producto,
                SUM(noti.notifications) total,
                notifications_r nr
            FROM
                insignia_suscripciones.notifications_control noti
                    INNER JOIN
                sms.producto producto ON producto.id_producto = noti.product_id
                    INNER JOIN
                insignia_suscripciones.proveedor_de_contenido proveedor ON proveedor.id_producto = noti.product_id
                    INNER JOIN
                sms.sc_id sc ON sc.Id_sc = proveedor.sc
            GROUP BY shortcode`;

    var config = require('.././database/config');
    var db = mysql.createConnection(config);

    db.query(sql, (err, result) => {
      if(err) {
        console.log(err)
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
      } else {
        db.end()
        res.render('admin/notifications', {
          data: result
        })
      }
    })
  },

  adminPutSms : function(req, res, next){
    console.log('works!')
    console.log(req.params.shortcode);
    console.log(req.params.numero);
    var sql = "UPDATE `insignia_suscripciones`.`notifications_control` SET `notifications_r`='"+req.params.numero+"' WHERE `product_id`='"+req.params.shortcode+"'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    var db = mysql.createConnection(config);

    db.query(sql, function(err, result){
      if(err){
        console.log(sql);
        res.status(200).send('ERROR');
        db.end();
      } else {
        console.log(sql)
        res.status(200).send('OK');
        db.end();
      }
    })
},

  admidAgregarCorreo: function(req, res, next){
    var sql = "INSERT INTO `insignia_suscripciones`.`email_notificator` (`email`, `name`) VALUES ('"+req.params.email+"', '"+req.params.nombre+"')";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();

    db.query(sql, function(err, result){
      if(err){
        db.end();
        res.status(200).send('ERROR');
      }else{
        db.end();
        res.status(200).send('OK');
      }
    });

  },

  admidEliminarCorreo: function(req, res){
    var sql = "DELETE FROM `insignia_suscripciones`.`email_notificator` WHERE `email`='"+req.params.email+"'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();

    db.query(sql, function(err, result){
      if(err){
        db.end();
        res.status(200).send('ERROR');
      }else {
        db.end();
        res.status(200).send('OK');
      }
    })

  },

  admidEliminarAbonado: function(req, res){

    deleteSuscriptionsById(req.params.id)
    var sql = "DELETE FROM `insignia_suscripciones`.`abonado` WHERE `id`='" + req.params.id + "'";
    var sql2 = "DELETE FROM `insignia_suscripciones`.`telefono` WHERE `abonado_id`='" + req.params.id + "'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        db.end();
        res.status(200).send('ERROR');
      } else {
        db.query(sql2, function(err1, result1 ){
          if(err1){
            db.end();
            res.status(200).send('ERROR');
          } else {
            db.end();
            res.status(200).send('OK');
          }
        })

      }
    })
  },

  adminEdit: function(req, res){
    console.log(req.params.id);
    var sql = "SELECT * FROM insignia_suscripciones.abonado ABONADO " +
    "WHERE ABONADO.id = " + req.params.id;
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    var sql1 = "SELECT * FROM insignia_suscripciones.telefono telefono "  
                + " INNER JOIN insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo " 
                + " WHERE abonado_id = "+req.params.id+" ";
    var sql2 = "SELECT suscripcion.date_added FECHA, CONCAT(telefono.prefix, telefono.recipient) TELEFONO1, telefono.prefix PRF, telefono.recipient TELEFONO, cliente.Des_cliente CLIENTE, producto.desc_producto PRODUCTO, producto.id_producto ID FROM insignia_suscripciones.telefono telefono INNER JOIN insignia_suscripciones.suscripcion suscripcion "
                +" ON suscripcion.recipient = telefono.recipient "
                +" INNER JOIN sms.producto producto "
                +" ON producto.id_producto = suscripcion.product_id "
                +" INNER JOIN sms.cliente cliente "
                +" ON cliente.Id_cliente = producto.cliente "
                +" WHERE telefono.abonado_id= "+req.params.id+" AND active=1 ";
    console.log(sql2);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        console.log('hay un error');
        db.end();
      }else {
       
    
//PROMESA QUE CONSULTA A LA API PARA RECIBIR EL PASSWORD DESENCRIPTADO
/*
function desencriptar_password() {
   return new Promise(function(resolve, reject) {
        const url ="http://md5decrypt.net/Api/api.php?hash="+result[0].password+"&hash_type=md5&email=hectorluisgonzalezlarreal@gmail.com&code=e022f55b24c7f888";
          request.get(url, (error, response, body) => {
          if (error) {
            reject(error);
          }else{
            resolve(response.body)
          }
          });
  })
}
*/
/*Funcion que hace un check de la respuesta de la API de desencriptacion
Y si recibe algun error notifica mediante un correo electronico al administrador*/

/*
function checkApiRoute(apiResponse){

return new Promise(function(resolve, reject) {

  var Cadena = apiResponse.substring(0, 3);
  if (Cadena = 'CODE') {
    var tipoCodigo = apiResponse.substring(13, 17);
    console.log("Cadena ->",Cadena," Codigo de error -> ",tipoCodigo);

 //ENVIAR EL CORREO INFORMATIVO
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
              to: 'hectorluisgonzalezlarreal@gmail.com', // list of receivers
              subject: 'Reporte de error', // Subject line
              text: 'Informacion: ', // plain text body
              html: '<strong><h3>Reporte de error:</h3><br> La ruta a la API de desencriptacion ha respondido con un mensaje de error<br><br>Codigo - > [ '+tipoCodigo+' ]<br><br><br>Puede ver la documentacion de la API en la siguiente direccion -> http://md5decrypt.net/en/Api/ <br><br> Tabla de errores: <ul><li> ERROR CODE : 001   ==>   You exceeded the 400 allowed request per day (please contact me if you need more than that).</li><li>ERROR CODE : 002   ==>   There is an error in your email / code.</li><li>ERROR CODE : 003   ==>   Your request includes more than 400 hashes.</li><li> ERROR CODE : 004   ==>   The type of hash you provide in the argument hash_type doesnt seem to be valid.</li><li>ERROR CODE : 005   ==>   The hash you provide doesnt seem to match with the type of hash you set.</li><li>ERROR CODE : 006   ==>   You didnt provide all the arguments, or you mispell one of them.</li></ul></strong>'
          };
          
          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
          });



    
  }
})
}

*/
  
//LLAMADA A LA PROMESA PARA PASAR PARAMETRO RECIBIDO      
//var password = desencriptar_password().then(function (data) {
      
        //llamar a la funcion que envia el correo si recibo una respuesta de error
       // var Promise_checkApiRoute = checkApiRoute(data);
        
        /*Promise_checkApiRoute.then(function (data){
          console.log("Funcion ejecutada");
        })*/




        //DEBUG
        //console.log("Password desencriptado -> ", data);
        console.log("Password encriptado -> ",result[0].password);
        //result[0].password = data;
        console.log("Resultado del query a BBDD",result[0]);
        //--

        db.query(sql1, function(err1, result1){
          if(err){
            console.log('error');
            db.end();
          }else{
            db.query(sql2, function(err2, result2){
              if(err2){
                console.log(sql2)
                console.log('errorazo');
                db.end();
              }else{
                result1.forEach(function(element) {
                  //element.date_added = moment(element.FECHA).format('YYYY /MM /DD');
                  //element.date_verified = moment(element.FECHA).format('YYYY /MM /DD');
                  element.date_added = element.date_added.date("YYYY-MM-DD");
                  element.date_verified = element.date_verified.date("YYYY-MM-DD");
                  //console.log("FECHA DE INGRESO ->> ",fechaIngreso,"   FECHA DE VERIFICACION ->> ",fechaVerificacion);
                });
                 result2.forEach(function(element) {
                  element.FECHA = moment(element.FECHA).format('YYYY /MM /DD');
                });
                db.end();
               
                res.render('admin/edit', {
                  data: result, data_tlf: result1, data_suscripciones: result2, id: req.params.id
                });
              }
            })
          }
        }); 
        //});
      }

    })
  },

  adminActivateTlf: function(req, res){
    var sql = "UPDATE `insignia_suscripciones`.`telefono` SET `active`='1', `date_verified`= '"+hoy+"'  WHERE `recipient`='"+req.params.number+"'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        console.log('no se pudo actualizar nada');
        db.end();
        res.status(200).send('ERROR');
      }else {
        console.log('success');
        db.end();
        res.status(200).send('OK');
      }
    })
  },



//CONTROLADOR DE PRUEBA PARA VER SUSCRIPCIONES EN ADMIN/EDIT

getSuscripcionesAdmin: function(req, res, next){
  //SEPARANDO VALOR DE ENTRADA EN LINEA Y RECIPIENTE PARA REALIZAR EL QUERY
    var NumeroEntrante = req.params.Numero;
    var campos         = req.params.Numero.split('-');
    var Linea          = campos[0];
    var Recipiente     = campos[1];
    console.log("LINEA ->> ",Linea);
    console.log("NUMERO ->> ",Recipiente);
    //------

    var sql = "SELECT operadora.descripcion PRFIJO, telefono.recipient TELEFONO, producto.desc_producto PRODUCTO, producto.id_producto ID, telefono.prefix PREFIJO, suscripcion.date_added DATE FROM insignia_suscripciones.telefono telefono"
    + " INNER JOIN insignia_suscripciones.suscripcion suscripcion"
    + " ON suscripcion.recipient = telefono.recipient AND suscripcion.prefix = telefono.prefix"
    + " INNER JOIN sms.producto producto"
    + " ON producto.id_producto = suscripcion.product_id"
    + " INNER JOIN insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo"
    + " WHERE operadora.descripcion= '"+Linea+"' AND  telefono.recipient='"+Recipiente+"'";

    var config = require('.././database/config');

    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      console.log(result);
      if(err){
        //console.log('error inesperado');
        res.render('admin/suscripciones', {mensaje: 'ERROR AL BUSCAR EN BBDD', messages: '', });
      }else {
        db.end();
        for (var i = 0; i < result.length; i++) {
          //console.log(result[i].DATE);
          result[i].DATE = result[i].DATE.date("YYYY-MM-DD");

        };
        console.log(req.user);
        res.render('admin/suscripciones', {
          Productos: result, 
          Linea: Linea, 
          Recipiente: Recipiente, 
          NumeroEntrante: NumeroEntrante,
          idUser:req.params.id,
          footerAttr: "none"
          });

      }
    })
  },
















  //-------------------------

  adminDesactivateTlf: function(req, res){
    console.log(req.params.number);
    var sql = "UPDATE `insignia_suscripciones`.`telefono` SET `active`='0' WHERE `recipient`='"+req.params.number+"'";
    var config= require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        console.log('no se pudo actualizar nada');
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
      }else {
        console.log('success');
        db.end();
      }
    });
  }, 

  adminDeleteNumero: function(req, res) {
      var sql = "DELETE FROM insignia_suscripciones.telefono WHERE recipient = '" + req.params.numero + "'";
      var config = require('.././database/config');
      var db = mysql.createConnection(config);
      db.connect();
      console.log('hola mundo');

      db.query(sql, function(err, result){
        if(err){
          console.log('Error al eliminar el número ..');
          res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
        } else {
          console.log('SUCCESS!');
          db.end();
          
        }
      });
  },

  adminActualizar: function(req, res) {
    
    var sql = " UPDATE `insignia_suscripciones`.`abonado` SET `first_name`='"+req.body.nombre+"', `last_name`='"+req.body.apellido+"', `email`='"+req.body.correo+"', "
    +" `password`='"+md5(req.body.contraseña)+"' WHERE `id`='"+req.params.id+"' ";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        console.log('error al actualizar los datos');
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
      }else {
        res.redirect('/admin/edit/' + req.params.id);
        db.end();
      }
    })

  },

  adminEliminarSuscripcion: function(req, res){

    var get_prefix = `SELECT * FROM insignia_masivo_premium.operadora WHERE descripcion = '${req.params.prefix}'`;
    console.log(get_prefix)
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(get_prefix, function(err, result){
      if(err){
        console.log(get_prefix);
        res.status(200).send('ERROR');
        db.end();
      }else {
        var sql = "DELETE FROM `insignia_suscripciones`.`suscripcion` WHERE `product_id`='" 
        + req.params.id +"' AND `recipient`= '"+ req.params.numero+"' AND `prefix` = '" + result[0].prefijo + "'";
        db.query(sql, (err, result) => {
          if(err){
            console.log('HAY UN ERROR !!!!')
            console.log(sql);
            res.status(200).send('ERROR');
            db.end();
          } else {
            db.end();
            res.status(200).send('OK');
          }
        })
      }
    })
  },

   adminEliminarSuscripciones: function(req, res){
    var inicio = ((req.params.prefix).search(' '));
    var prefix = (req.params.prefix).substr(inicio + 1, (req.params.prefix).length);
    console.log(prefix);
    console.log(req.params.prefix);
    console.log(req.params.id);
    console.log(req.params.numero);

    var sql = "DELETE FROM `insignia_suscripciones`.`suscripcion` WHERE `product_id`='" + req.params.id +"' AND `recipient`= '"+ req.params.numero+"' AND `prefix` = '" + prefix + "'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        res.status(200).send('ERROR');
        //console.log(sql);
        db.end();
      }else {
        console.log(sql);
        db.end();
        res.status(200).send('OK');
      }
    })
  },

  adminFechaProducto: function(req, res) {
    var sql = `SELECT prov.sc, prov.cliente, prov.id_producto, prov.actualizado, prov.disponible, prov.limite, prod.desc_producto, cliente.Des_cliente FROM insignia_suscripciones.proveedor_de_contenido prov
              INNER JOIN sms.cliente cliente ON cliente.Id_cliente = prov.cliente
              INNER JOIN sms.producto prod ON prod.id_producto = prov.id_producto
              WHERE prod.desc_producto NOT LIKE 'CERRADO%'`;
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();

    db.query(sql, (err, result) => {
      if(err) {
        console.log('error');
        db.end();
        res.status(400).send('ERROR');
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });   
      } else {
        db.end();
        res.render('admin/fechaproducto', {data: result})
      }
    })
  },

  adminPutFecha: function(req, res) {
    console.log('works!')
    var sql = "UPDATE `insignia_suscripciones`.`proveedor_de_contenido` SET `limite`='"+ req.params.numero +"' WHERE `id_producto`='" + req.params.id_producto + "'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, (err, result) => {
      if(err) {
        console.log(sql)
        console.log('error');
        db.end();
        res.status(400).send('ERROR');
      } else {
        db.end();
        res.status(200).send('OK');
        console.log('works!');
      }
    })
  },

  adminDesactivateEmail: function(req, res){
    var sql = "UPDATE `insignia_suscripciones`.`abonado` SET active = '0' WHERE `id`='" + req.params.id + "'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        console.log('error');
        db.end();
        res.status(400).send('ERROR');
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: 'Tu correo ha sido desactivado', });
      }else{
        db.end();
        res.status(200).send('OK');
        console.log('works!');
      }
    })

  },

  adminActivatedEmail: function(req, res){
    var sql = "UPDATE `insignia_suscripciones`.`abonado` SET active = '1' WHERE `id`='" + req.params.id + "'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        db.end();
        res.status(200).send('ERROR');
      }else{
        db.end();
        res.status(200).send('OK');
      }
    })
  },

  actNotifications: function(req, res){

    var sql = "UPDATE `insignia_suscripciones`.`notifications_control` SET `notifications_r`='"+req.params.numerovalue+"', `date_notifications_r`='"+hoy+"' WHERE `product_id`='"+req.params.shortcode+"' and`recipient`='"+req.params.numero+"'";
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query(sql, function(err, result){
      if(err){
        console.log('error');
        db.end();
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
      }else {
        db.end();
        console.log('yay!');
      }
    })
  },

  adminNotificationsAdvanced: function(req, res) {
    var sql = `SELECT pro.desc_producto, noty.product_id, noty.recipient, noty.notifications, noty.date 
                FROM insignia_suscripciones.notifications_control noty
                INNER JOIN sms.producto pro ON pro.id_producto = product_id
                WHERE pro.id_producto NOT LIKE 0`

    var config = require('.././database/config');
    var db = mysql.createConnection(config);

    db.connect()
    db.query(sql, (err, result) => {
      if(err) {
        db.end()
        res.render('admin/signin', {authmessage: 'ERROR: Conexión perdida con la base de datos.', messages: '', });
      } else {
        db.end()
        result.map(element => {
          element.date = moment(element.date).format('YYYY-MM-DD')
        })
        res.render('admin/notificationsadv', {data: result});
      }
    })
  }

}

