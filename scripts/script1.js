

/*   DARIO SOTO    */
/*   FECHA : 30-08-2017   */

/*   SCRIPT 1
  
  -> COMPRUEBA LOS NUMEROS DE TELEFONO EN LA APLICACIÓN
  -> VERIFICA QUE HAYA ENVIADO AL MENOS 1 SMS A SU PRODUCTO SUSCRITO
  -> INSERTA O ACTUALIZA DEPENDIENDO DE SU CONSULTA
  

/* MODULOS NECESARIOS */  
var mysql    = require('mysql');
var moment   = require('moment');
var hoy      = moment().format("YYYY-MM-DD");
var config   = require('.././database/config');
var db       = mysql.createConnection(config);
var promises = []

/* CONSULTO TODOS LOS NUMEROS QUE TENGAN AL MENOS UNA SUSCRIPCION */

var sql = ` SELECT recipient, prefix FROM insignia_suscripciones.suscripcion `;

db.query(sql ,(err, result) => {
  if(err){
    console.log('there was an error => ${err}')
  } else {
    result.forEach( element => {
      promises.push( getSuscriptorByNumber(element.recipient, element.prefix) )
    })

    Promise.all(promises)
      .then(success => db.end() )
      .catch( error => db.end() )
  }
})

/* FUNCION QUE DEVUELVE LOS PRODUCTOS SUSCRITOS A UN NUMERO DE TELÉFONO INGRESADO POR PARÁMETROS */

function getSuscriptorByNumber(number, prefix) {
  return new Promise (
    (resolve, reject) => {
      var sql = `SELECT product_id FROM insignia_suscripciones.suscripcion
                WHERE recipient = '${number}' AND prefix = '${prefix}' `
      db.query( sql, (err, result) => {
        if(err) {
          console.log(`there was an error => ${err}`)
          console.log(sql);
          reject(err)
        } else {
          resolve(
            getCountSms(prefix + number, result[0].product_id )
          )
        }
      })
    }
  )
}

/* FUNCION QUE DEVUELVE LA CANTIDAD DE MENSAJES ENVIADOS POR PARTE DE UN NÚMERO DE TELÉFONO A UN PRODUCTO */

function getCountSms(completeNumber, product_id) {
  return new Promise (
    (resolve, reject) => {
      var sql = `SELECT count(*) count FROM sms.smsin WHERE origen = '${completeNumber}' 
                AND id_producto = '${product_id}'`
      db.query( sql, (err, result) => {
        if(err) {
          console.log(`there was an error => ${err}`)
          console.log(sql)
          reject(err)
        } else {

          /* SI HAY AL MENOS 1 MENSAJE ENVIADO POR PARTE DE UN NÚMERO DE TELÉFONO ENTONCES LLAMO A OTRA FUNCIÓN */

          if(result[0].count > 0) {
            resolve(comprobateNumber(completeNumber, product_id, result[0].count )
              .then(success => resolve(`works in ${completeNumber} and ${product_id} STATUS : ${success}`) )
              .catch(error => reject(`error in ${error}`)))
          } else {
            resolve(1)
          }
        }
      })
    }
  )
}

/* COMPRUEBO QUE EXISTA UN REGISTRO EN LA BD CON RESPECTO AL NÚMERO Y EL PRODUCTO */

function comprobateNumber(completeNumber, product_id, numberNotifications) {
  return new Promise (
    (resolve, reject) => {
      var sql = ` SELECT count(*) count FROM insignia_suscripciones.notifications_control
                 WHERE recipient = '${completeNumber}' AND product_id = '${product_id}' `
      db.query( sql, (err, result) => {
        if(err) {
          console.log(`there was an error => ${err}`)
          reject(err)
        } else {
          if(result[0].count > 0) 
              resolve(prepareUpdate(completeNumber, product_id, numberNotifications )) 
                  else resolve(prepareInsert(completeNumber, product_id, numberNotifications ))
        }
      })
    }
  )
}

/* FUNCION QUE PREPARA EL INSERT */

function prepareInsert(completeNumber, product_id, numberNotifications){  
  return new Promise (
    (resolve, reject) => {
      var sql = "INSERT INTO `insignia_suscripciones`.`notifications_control` " +
                "(`product_id`, `recipient`, `notifications`, `notifications_r`, `date`, `date_notifications_r`) " + 
                `VALUES ('${product_id}', '${completeNumber}', '${numberNotifications}', '${15}', '${hoy}', '${hoy}')`;
      db.query( sql, (err, result) => {
        if(err) {
          console.log(`there was an error `)
          console.log(sql)
          reject(err)
        } else {
          resolve(`¡ Insert successfully ! ${numberNotifications}`)
        }
      })
    }
  )
}

/* FUNCTION QUE PREPARA EL UPDATE */

function prepareUpdate(completeNumber, product_id, numberNotifications){
  return new Promise (
    (resolve, reject) => {
      var sql = "UPDATE `insignia_suscripciones`.`notifications_control`" + 
                "SET `product_id`='"+product_id+"', `recipient`='"+completeNumber+"', `notifications`='"+numberNotifications+"', `date_notifications_r`='"+hoy+"' WHERE `product_id`='"+product_id+"' and`recipient`='"+completeNumber+"'";
      db.query( sql, (err, result) => {
        if(err){
          console.log(`there was an error in => ${err}`)
          reject(err)
        } else {
          console.log(` ¡Update successfully ! `)
          resolve(1)
        }
      })
    }
  )
}


