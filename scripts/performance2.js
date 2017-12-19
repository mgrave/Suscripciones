'use strict'

var mysql    = require('mysql')
var moment   = require('moment')
var hoy      = moment().format("YYYY-MM-DD")
var config   = require('.././database/config')
var db       = mysql.createConnection(config)
const lib    = require('./performance2libs')

db.connect( (err) => {
  err ? console.log(err) : console.log(`Connection ID: ${db.threadId}`)
})

var sql = ` SELECT product_id FROM notifications_control WHERE product_id NOT LIKE 0 group by product_id `

db.query( sql, (err, result) => {
  if(err) {
    console.log(err)
  } else {
    lib.getArr(result, db).then(x => {
      lib.comprobateNumber(x, db).then(y => {
         lib.updater(y, db).then(z => {
          console.log(z)
         })
      })
    })
  }
})
