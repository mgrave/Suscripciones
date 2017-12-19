




/*   DARIO SOTO    */
/*   FECHA : 31-08-2017   */

/*   SCRIPT 2
  
  -> EXTRAE TODOS LOS PRODUCTOS DE LA TABLA NOTIFICATIONS_CONTROL
  -> VERIFICA QUE ESE PRODUCTO HAYA ACTUALIZADO SU CONTENIDO
  -> INSERTA O ACTUALIZA DEPENDIENDO DE SU CONSULTA
  
*/


/* MODULOS NECESARIOS */
var mysql    = require('mysql')
var moment   = require('moment')
var hoy      = moment().format("YYYY-MM-DD")
var config   = require('.././database/config')
var db       = mysql.createConnection(config)
var cache    = require('jsonfile')
var fs       = require('fs')
var string   = ''
var dataJson = []
var numbers  = []
var promises = []
var file     = './scripts/data.json'

// CONSULTO TODOS LOS PRODUCTOS



function main(){
  start()
    .then(success => {
      console.log(`terminó de ejecutarse ..`)
      process.exit(0)
    })
    .catch(err => console.log(err))
}

function start(){
  return new Promise(
    (resolve, reject) => {
      var sql = ` SELECT product_id FROM notifications_control group by product_id `

      db.query( sql ,(err, result) => {
        if(err) {
          throw err
        } else {
          readResult(result)
            .then(success => { 
              console.log(`Terminó de ejecutarse`)
              resolve(1)
            } )
            .catch(error => console.log(` there had an error ${error} `) )
        }
      })
    }
  )
}


// FUNCION ENCARGADA DE LLAMAR AL RESTO DE PROMESAS

function readResult(array) {
  return new Promise(
    (resolve, reject) => {
      array.forEach( element => {
        promises.push( evaluateAnalisis(element.product_id) )
      })

      Promise.all(promises)
        .then( success =>  resolve(success) )
        .catch( error => reject(error) )
    }
  )
}

function getLimitByProductId(product_id) {
  return new Promise(
    (resolve, reject) => {
      var sql = `SELECT limite FROM insignia_suscripciones.proveedor_de_contenido where id_producto = '${product_id}'`;
      db.query( sql, (err, result) => {
        if(err){
          reject(err)
        } else {
          if(result == '') {
            resolve(15)
          } else {
            resolve(result[0].limite)
          }
        }
      })
    }
  )
}

// VERIFICA QUE EL PRODUCTO ACTUALIZÓ SU CONTENIDO

function evaluateAnalisis(product_id) {
  getLimitByProductId(product_id)
    .then(limite => {
      return new Promise(
      (resolve, reject) => {
        var sql = ` SELECT count(*) count FROM analisis.r_multiple WHERE id_producto = ${product_id}
                  AND fecha BETWEEN '${limite}' AND '${hoy}' `
        db.query( sql , (err, result) => {
          if(err) {
            console.log(`there had an error : ${err}`)
          } else {
            if(result[0].count > 0) { 
              resolve( getNumsByProduct(product_id) )
            }
            else { resolve( `the product : ${product_id} ERR! `) }
          }
        })
      }
    )
  })

}

// OBTIENE TODOS LOS NUMEROS SUSCRITO A ESE PRODUCTO

function getNumsByProduct(product_id) {
  return new Promise (
    (resolve, reject) => {
      var sql = ` SELECT recipient FROM insignia_suscripciones.notifications_control 
                  WHERE product_id = ${product_id}`
      db.query( sql, (err, result) => {
        if(err) {
          console.log(`there was an error : ${err}`)
        } else {
          result.forEach( element => {
            resolve(comprobateNeedPromotion(element.recipient, product_id))
          })
        }
      })
    }
  )
}

// COMPRUEBA QUE ESE NUMERO DE TELEFONO ESTÁ LISTO PARA SER INCLUIDO EN LA PROMOCION

function comprobateNeedPromotion(number, product_id) {
  return new Promise (
    (resolve, reject) => {
      getNumberNotificationsByNR(number, product_id)
        .then( success => {
          if( success.notifications > success.notifications_r ) {
            console.log( `need to create promotion : ${number} with the product: ${product_id}` )
            console.log(`es válido el numero ${number} para el producto ${product_id}`)
            resolve(prepareUpdate(number, product_id)
              .then(success => setNumberForPromotion(number, product_id) ))
          } else {
            //console.log( `I can't create a promotion : ${success.notifications} ${success.notifications_r}` )
            resolve(`err!`)
          }
        })
    }
  )
}

// VERIFICA QUE EL NUMERO HAYA CONSULTADO EL PRODUCTO

function getNumberNotificationsByNR(number, product_id) {
  return new Promise (
    (resolve, reject) => {
      getDateByNumber(number, product_id)
        .then(success => {
          var sql = `SELECT count(*) count FROM sms.smsin WHERE origen= '${number}'
                    AND id_producto = '${product_id}' AND data_arrive BETWEEN '${success.data}'
                    AND '${success.data1}'`
          db.query( sql, (err, result) => {
            if(err) {
              console.log(`there was an error in getNumberNotificationsByNR => ${err}`)
              reject(`There was an error ${err}`)
            } else {
              if(result[0].count > 0) console.log( `FOUND! ${result[0].count}` )
              else {
                //console.log(`${sql}`)
                resolve(-1)
              }
              var json = {
                notifications: result[0].count,
                notifications_r : success.notifications
              }
              //console.log(`devolviendo el JSON : ${json}`)
              resolve(json)
            }
          })
        })
    }
  )
}

// OBTIENE LAS FECHAS SEGUN EL PRODUCTO

function getDateByNumber(number, product_id) {
  return new Promise (
    (resolve, reject) => {
      var sql = `SELECT date, date_notifications_r, notifications_r FROM insignia_suscripciones.notifications_control
                 WHERE recipient = '${number}' AND product_id = '${product_id}' `
      db.query( sql, (err, result) => {
        if(err) {
          console.log( `there was an error in getDateByNumber : ${err}` )
          reject(`There was an error ${err}`)
        } else {
          var json = {
            data: '',
            data1: '',
            notifications: 0
          }
          result.forEach( element => {
            json.data = moment(element.date).format("YYYY-MM-DD")
            json.data1 = moment(element.date_notifications_r).format("YYYY-MM-DD")
            json.notifications = element.notifications_r
          })
          resolve(json)
        }
      })
    }
  )
}

// ACTUALIZA LA BASE DE DATOS

function prepareUpdate(number, product) {
  return new Promise(
    (resolve, reject) => {
      var sql = "UPDATE `insignia_suscripciones`.`notifications_control` "                    +
                "SET `date`='"+hoy+"', `date_notifications_r`='"+hoy+"' WHERE `product_id`='" +
                 product+"' and`recipient`='"+number+"'";
      db.query( sql, (err, result) => {
        if(err) {
          console.log(sql)
          reject(`There was an error ${err}`)
        } else { 
          resolve()
        }
      })

    }
  )
}

// CARGA LOS RESULTADOS EN UN ARCHIVO LLAMADO data.json

function setNumberForPromotion(number, product_id) {

  return new Promise(
    (resolve, reject) => {
      var comprobation = true

        if(numbers.length > 0) {
            numbers.forEach(element => {
              if(product_id == element.id_producto){
                element.number += ('@' + number)
                comprobation = false
              } 
            })
          if(comprobation) {
            numbers.push({
              number: number,
              id_producto: product_id
            })
          }
        } else {
          numbers.push({
            number: number,
            id_producto: product_id
          })
        }

        //console.log(numbers)
        obj = numbers

        cache.writeFile(file, obj, err => {
          if(err) {
            console.log(err)
            reject(`There was an error ${err}`)
          } else {
            resolve('!')
          }
        })
    }
  )
 
  
}

main()




