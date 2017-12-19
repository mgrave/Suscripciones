
var mysql          = require('mysql');
var moment         = require('moment');
var hoy            = moment().format("YYYY-MM-DD");
var config         = require('../database/config');
var db             = mysql.createConnection(config);


function setValue(json) {
  collectData.push({
    operadora: json.operadora,
    sc: json.sc
  })
}


exports.get = function (array)  {

  var collectData    = []
  var collectJson = {
    operadora: '',
    sc: []
  }

  Array.prototype.unique=function(a){
  return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
  });

  var operadoras = []
  array.map(v => {
    operadoras.push(v.operadora)
  })
  operadoras.unique().forEach( t => {
    var aux = []
    collectJson.operadora = t
    array.forEach(v => {
      if(v.operadora == collectJson.operadora) {
        collectJson.sc.push(v.sc)
      }
    })
    collectJson.sc = collectJson.sc.unique()
    collectData.push({
      operadora: collectJson.operadora,
      sc: collectJson.sc.unique()
    })
    //console.log(collectJson)
    //setValue(collectJson)
  })

  return collectData
}
