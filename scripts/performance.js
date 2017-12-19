'use strict'

var mysql    = require('mysql')
var moment   = require('moment')
var hoy      = moment().format("YYYY-MM-DD")
var config   = require('.././database/config')
var db       = mysql.createConnection(config)
const lib    = require('./performancelibs')


db.connect( (err) => {
  err ? console.log(err) : console.log(`Connection ID: ${db.threadId}`)
})

var sql = `SELECT recipient, prefix FROM insignia_suscripciones.suscripcion GROUP BY CONCAT(recipient, prefix)`

db.query(sql, (err, result) => {
  if(err) console.log(sql)
  else {
    lib.getSuscriptorByNumber(result, db)
    .then(x =>{
        lib.getCountByOrigins(x, db).then(x => {
        lib.submit(x, db).then(x => {
          db.end()
          console.log(x)
        })
        })
      })
    .catch(x => {
      db.end()
      console.log(x)
    })
  }
})

