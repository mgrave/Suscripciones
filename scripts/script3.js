
/*   DARIO SOTO    */
/*   FECHA : 01-09-2017   */

/*   SCRIPT 3
  
  
*/


/* MODULOS NECESARIOS */
var mysql    = require('mysql')
var fs       = require('fs')
var config   = require('.././database/config')
var db       = mysql.createConnection(config)
var cache    = require('jsonfile')
var file     = './data1.json'

var promotion = []

var myOjb = {
  evento: '',
  mensaje: '',
  destinatarios: '',
  id_entidad: '',
  clave_token: '',
  shortcode: '',
  usuario: ''
}

// Función principal
function main() {
  start()
    .then(success => {
      console.log('Ending ..') 
      db.end() 
      }) 
}

// Retorna una promesa a la función principal
function start() {
  return new Promise(
    (resolve, reject) => {
      fs.readFile('./scripts/data.json', 'utf8',  (err, data) => {
      if (err) console.log(err)
      var obj = JSON.parse(data)

      emptyFileJson()
      console.log("JSON RECIBIDO -ESTATICO-   ->>",obj)
      obj.forEach( element => {
        getScByIdproduct(element)
          .then(success => { 
            myOjb.shortcode = success
            myOjb.destinatarios = element.number
        })
        getMessageByIdproduct(element.id_producto)
          .then(success => {
            myOjb.mensaje = success
        })
        getEventByIdroduct(element.id_producto)
          .then(success => {
            myOjb.evento = success[0].evento
            myOjb.clave_token = success[0].token
            myOjb.id_entidad = success[0].entidad
            myOjb.usuario = 'adminsuscripciones' 
            setJsonFile(myOjb)     
          })
      })
      resolve()
    });
    }
  )
}

// Elimina todos los elementos que ya estaban en el .json
function emptyFileJson(){
  return new Promise(
    (resolve, reject) => {
      cache.writeFile(file,'JSON PROMOTIONS:',err => {
        if(err) {
          reject(err)
        } resolve('OK')
      })
    }
  )
}

// Crea el .json con los datos de las promociones
function setJsonFile(json) {
  return new Promise(
    (resolve, reject) => {
      promotion.push(json)
      cache.writeFile(file, json,  {flag: 'a'}, err => {
        if(err) {
          console.log(err)
        } resolve()
      })
    }
  )

}

// FUNCIONES NECESARIAS PARA EXTRAER LOS DATOS 
// ------------------------------------------

function getEventByIdroduct(id_producto) {
  return new Promise(
    (resolve, reject) => {
      var sql = 
                `SELECT 
                  evento.evento, permisos.token_excanghe token, permisos.id_entidad entidad
                FROM
                  sms.producto,
                  insignia_alarmas.cliente_evento evento,
                  insignia_webservice.permisos permisos
                WHERE
                  sms.producto.cliente = evento.cliente
                AND id_producto = '${id_producto}'
                AND permisos.id_entidad = evento.id_entidad`;

      db.query( sql, (err, result) => {
        if(err) reject(`There was an error ${err}`)
        else if(result == '') resolve(0) 
        else resolve(result)
      })
    }
  )
}

function getTokenByEventid(eventid) {
  return new Promise(
    (resolve, reject) => {
      var sql = `SELECT 
                    permisos.token_excanghe token, permisos.id_entidad entidad
                FROM
                    insignia_alarmas.cliente_evento evento,
                    insignia_webservice.permisos permisos
                WHERE
                    evento.evento = '${eventid}'
                AND permisos.id_entidad = evento.id_entidad`;
    db.query( sql, (err, result) => {
      if(err) reject(`There was an error : ${err}`)
      else resolve(result)
    })
    }
  )
}

function getMessageByIdproduct(id_producto) {
  return new Promise(
    (resolve, reject) => {
      var sql = `SELECT max(orden), respuesta FROM sms.r_multiple_orden_respuesta where id_producto = '${id_producto}'`;
      db.query(sql, (err, result) => {
        if(err) reject(`There was an error : ${err}`)
        else resolve(result[0].respuesta)
      })
    }
  )
}

function getScByIdproduct(id_producto) {
  return new Promise(
    (resolve, reject) => {
      var sql = `SELECT sc.sc_id SHORTCODE FROM sms.producto producto, sms.sc_id sc
                where producto.id_producto = '${id_producto.id_producto}'
                and sc.Id_sc = producto.id_sc`;
      db.query( sql, (err, result) => {
        if(err) reject(`There was an error ${err}`)
        else resolve(`${result[0].SHORTCODE}`)
      })
    }
  )
}

function getClientByProduct(id_producto) {
  return new Promise(
    (resolve, reject) => {
      var sql = `SELECT cliente FROM sms.producto WHERE id_producto = ${id_producto}`
      db.query( sql, (err, result) => {
        if(err) console.log(`error getting the result => ${err}`)
        else {
          resolve(getEventByClient(result[0].cliente))
        }
      })
    }
  )
}

function getEventByClient(cliente) {
  return new Promise(
    (resolve, reject) => {
      var sql = ` SELECT evento FROM insignia_alarmas.cliente_evento WHERE cliente = ${cliente} `
      db.query( sql, (err, result) => {
        if(err) console.log( `error getting the result => ${err}` )
        else resolve(result)
      })
    }
  )
}

// Inicializo el script.
main()
