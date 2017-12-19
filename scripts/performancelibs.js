'use strict'

const _     = require('lodash')
var json    = {}
var arrJson = []
var moment  = require('moment')
var hoy     = moment().format("YYYY-MM-DD")

var insertDB = (array, db) => {
  return new Promise( (resolve, reject) => {

    let sampleQuery = " INSERT INTO `insignia_suscripciones`.`notifications_control` " +
                      "(`product_id`, `recipient`, `notifications`, `notifications_r`, `date`, `date_notifications_r`) VALUES "
    
    array.map( element => {
       sampleQuery += ` ('${element.producto}', '${element.origen}', '${element.count}', '${15}', '${hoy}', '${hoy}'), `;
    })

    sampleQuery = sampleQuery.substr(0, sampleQuery.length-2)

    db.beginTransaction(function(err) {
    if (err) { 
      throw err; 
      reject(error)
    }
      db.query(sampleQuery, function (error, results, fields) {
        if (error) {
          return db.rollback(function() {
            throw error;
            reject(error)
          });
        }
        db.commit(function(err) {
          if (err) {
            return db.rollback(function() {
              throw err;
              reject(error)
            });
          }
          resolve(`Insert works!`)
        });
      });
    });
  })
}

var updateDB = (array, db) => {
  return new Promise( (resolve, reject) => {

    let sampleQuery = ''

    array.map( element => {
      sampleQuery +=  " UPDATE `insignia_suscripciones`.`notifications_control`" + 
      " SET `notifications`='" + element.not + "', `date_notifications_r`='"+hoy+"' WHERE `product_id`='"
      + element.producto +"' and`recipient`='"+ element.origen +"';"
    }) 
    sampleQuery = sampleQuery.substr(0, sampleQuery.length-1)

    db.beginTransaction(function(err) {
    if (err) { 
      throw err; 
      reject(error)
    }
      db.query(sampleQuery, function (error, results, fields) {
        if (error) {
          return db.rollback(function() {
            throw error;
            reject(error)
          });
        }
        db.commit(function(err) {
          if (err) {
            return db.rollback(function() {
              throw err;
              reject(error)
            });
          }
          resolve(`Update works!`)
        });
      });
    });

  })
}

var getSuscriptorByNumber = (array, db) => {
  return new Promise( (resolve, reject ) => {
    var sql = `SELECT product_id, recipient, prefix FROM insignia_suscripciones.suscripcion
                WHERE recipient IN (?) AND prefix IN (?)`
    db.query(sql, 
      [
        array.map(x => x.recipient), 
        array.map(x => x.prefix)
      ], (err, result) => {
      if(err) reject(sql)
      else {
        resolve(result)
        let arr = result.map(x => x.product_id)
        arr = _.sortedUniqBy(arr)
        arr.map(x => {
          json.product_id = x
          let y = _.filter(result, {product_id: x})
          let nums = []
          y.map(y => nums.push(y.prefix + '@' + y.recipient) )
          json.numero = nums
          arrJson.push({


            product_id: json.product_id,
            numero: json.numero
          })
        })
        resolve(arrJson)
      }
    })
  })
}

var getCountByOrigins = (array, db) => {
  var recipient = []
  var product_id = []
  array.map(x => {
    recipient.push(x.prefix + x.recipient)
    product_id.push(x.product_id)
  })

  return new Promise( (resolve, reject) => {
    var sql = `SELECT origen, id_producto, count(*) AS count FROM sms.smsin
                WHERE origen IN (?) AND id_producto IN (?) GROUP BY origen, id_producto`
    db.query( sql, 
    [
      recipient,
      product_id
    ], (err, result) => {
      if(err) reject(err)
      else resolve(result)
    })
  })
}

var submit = (array, db) => {
  var inserts = []
  var update = []
  return new Promise( (resolve, reject) => {

  var sql = `SELECT * FROM insignia_suscripciones.notifications_control
              WHERE recipient IN (?) AND product_id IN (?) GROUP BY recipient, product_id`;

  db.query( sql,
    [
      array.map( x => x.origen),
      array.map( y => y.id_producto)
    ], (err, result) => {
      if(err) reject(err)
      else {
        array.map( element => {
          let a = _.find(result, {recipient: element.origen})
          a ? update.push({origen: element.origen, producto: element.id_producto, not: element.count} ) : inserts.push({origen: element.origen, producto: element.id_producto, count: element.count})
        })

        var promises = []
        inserts != '' ? promises.push( insertDB(inserts, db) ) : console.log('nothing to insert!')
        update != '' ? promises.push( updateDB(update, db) ) : console.log('nothing to update!')

        if(promises != []) {
          Promise.all(promises).then(x => resolve(x))
        } else {
          resolve('Nothing')
        }
      }
    })
  })
}

module.exports = {
  getSuscriptorByNumber,
  getCountByOrigins,
  submit
}
