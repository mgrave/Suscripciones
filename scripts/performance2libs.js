'use strict'

const _     = require('lodash')
var json    = {}
var arrJson = []
var moment  = require('moment')
var hoy     = moment().format("YYYY-MM-DD")

var jsonMasive = (array, db) => {
  console.log(array)
  // process.exit(0)
  
  let query = ''

  array.map( e => {
    query += `\n SELECT count(*) count, id_producto FROM sms.smsin WHERE origen = '${e.numero}'
              AND id_producto = '${e.producto}' AND data_arrive BETWEEN '${e.date1}'
              AND '${e.date2}'; `
  })

  // console.log(query) 
  // process.exit(0);

  db.query( query, (err, result) => {
    if(err) {
      console.log(err)
    }
    else {
      console.log(result)
    }
  })

} 

var updater = (array, db) => {
  return new Promise( (resolve, reject) => {
    console.log('---------------------------')
    console.log(array)
    // process.exit(0)
    let query = ''
    array.map(e => {
      e.numero = _.split(e.numero,"@")
      query += `\n SELECT * FROM insignia_suscripciones.notifications_control 
                WHERE recipient IN (${e.numero}) AND product_id = ${e.producto};`
    })
    // console.log(query)
    query = query.substr(0, query.length-1)
    // console.log(query)
    // process.exit(0)
    db.query( query, (err, result) => {
      if(err) console.log(err)
      else {
        var arr = []
        var nums = []
        result.map( e => {
          e.map(y => {
            // console.log(y.product_id)
            arr.push(y.product_id)
          })
        })
        // console.log(result)
        // process.exit(0)
        arr = _.uniq(arr)
        let js = []
        let js1 = []
        let sampleJSON = []
        arr.map( x => {
          result.map( y => {
            let a = _.filter(y, {'product_id': x})
            if (a != '') {
              y.map(u => {
                console.log(u.recipient)
                js.push(u.recipient + '@' + u.product_id)
                js1.push(u.recipient + '@' + moment(u.date).format('YYYY-MM-DD') + '@' + moment(u.date_notifications_r).format('YYYY-MM-DD'))
              })
              // js.push(a[0].recipient)
            }
            // console.log(a)
          })
        })
        js = _.uniq(js)
        console.log(js)
        console.log(arr)
        // console.log(result)
        console.log('---------------------------------')

        let sample = _.uniq(js1)

        arr.map( e => {
          js.map( f => {
            let j = f.split("@")
            if(e == j[1]) {
              console.log(`Para el producto: ${e} el número: ${j[0]}`)
              sample.map( k => {
                let a = k.split("@")
                if ( j[0] == a[0] ) {
                  console.log(a)
                  sampleJSON.push({
                    producto: e,
                    numero: j[0],
                    date1: a[1],
                    date2: a[2]
                  })
                }
              })
              
            }
          })
        })

        // console.log(sampleJSON)
        jsonMasive(sampleJSON, db)
        // let queryS = 'SELECT * FROM insignia_suscripciones.notifications_control'
        // db.query( queryS, (err, result) => {
        //   if(err) console.log(err)
        //   else console.log(result)
        // })

        //process.exit(0)
        // resolve(0)

        
        
        // console.log(result)
      }
    })
    // console.log(array)
    // console.log(query)
  })
}

var comprobateNumber = (array, db) => {
  return new Promise( (resolve, reject) => {
    // console.log(array)
    // process.exit(0)
    var productos = []
    var recipient = []
    let queryP = ""
    array.map(e => {
      e.recipient = e.prefix + e.recipient
      queryP += `\nSELECT * FROM insignia_suscripciones.notifications_control WHERE
                recipient = '${e.recipient}' AND product_id = '${e.product_id}';`
    })
    // console.log(queryP)
    // process.exit(0)
    // console.log(productos.)
    // console.log(recipient)
    // process.exit(0)
    db.query(queryP, (err, result)=> {
        if(err) reject(err)
        else {
        // console.log(result)
        // process.exit(0)
          var data = []
          var newResult = []
          result.map( e => {
            e.map( f => {
              data.push({producto: f.product_id})
              //data.push(f.product_id)
              newResult.push(f)
            })
          
          })
          // console.log(newResult)
          // process.exit(0)
          // console.log(data)
          data = _.uniqWith(data, _.isEqual)
          // console.log(data)
          // process.exit(0)

          data.map((e, i) => {
            let a = _.filter(newResult, {product_id: e.producto})
            console.log(a)
            if(a != '') {
              e.numero = ''
              a.map(y => {
                e.numero += y.recipient
                e.numero += '@'
              })
              e.numero = e.numero.substr(0, e.numero.length-1)
            }
          })

          // console.log(data)
          // data = _.uniqWith(data, 'producto')
          // console.log(data)
          // process.exit(0)
          resolve(data)
        }
    })
  })
}

var getNumsByProduct = (array, db) => {
  return new Promise( (resolve, reject) => {
    var productos = []
    array.map(e => {
      productos.push(e[0].id_producto)
    })

    let query = `SELECT * FROM insignia_suscripciones.suscripcion WHERE product_id IN (?)`
    db.query( query, [productos], (err, result) => {
      if(err) console.log(err)
      else {

        resolve(result)
      }
    })
    })
}

var getAnalisis = (array, db) => {
  return new Promise( (resolve, reject) => {
    let query = ''
    array.map( element => {
      element.limite = moment().subtract(element.limite, 'days').format('YYYY-MM-DD')
      element.limite = '2010-09-15'
      query += `\n SELECT * FROM analisis.r_multiple WHERE id_producto = '${element.id_producto}'
                     AND fecha BETWEEN '${element.limite}' AND '${hoy}' GROUP BY id_producto; `
    })
    query = query.substr(0, query.length-2)
    db.query( query, (err, result) => {
        if(err){
          console.log(err)
        } else {
           // console.log(result)
           var arr = []

           result.map( x => {
            if(x != '') arr.push(x)
           })

           // arr.map( e => {
           //  console.log(e[0].id_producto)
           // })

           resolve(getNumsByProduct(arr, db))
          
          }
      })  
    })
}

var getArr = (array, db) => {
  return new Promise( (resolve, reject) => {
    let sql = "SELECT * FROM insignia_suscripciones.proveedor_de_contenido WHERE id_producto IN (?)"
    db.query(sql,
      [
        array.map(element => element.product_id)
      ]
      ,(err, result) => {
        if(err){
          console.log(err)
        } else {
          resolve(getAnalisis(result, db))
        }
      })
    })
}

module.exports = {
  getArr,
  comprobateNumber,
  updater
}
