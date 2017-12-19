
var mysql         = require('mysql');
var moment        = require('moment');
var hoy           = moment().format("YYYY-MM-DD");
var config        = require('.././database/config');
var db            = mysql.createConnection(config);
const nodemailer  = require('nodemailer');
var fechaAux      = moment("2015-05-19");
var fechaActual   = moment();

db.connect();

var sql = "SELECT producto.id_producto IDPRODUCTO, producto.id_aplicacion APLICACION,  shorcut.sc_id ID," + 
" cliente.Id_cliente IDCLIENTE, producto.desc_producto DESCRIPCION,  " + 
" cliente.Des_cliente CLIENTE,  producto.alias_producto CATEGORIA,  shorcut.Id_sc SHORCUT,  shorcut.tarifa TARIFA " +
" FROM  sms.producto producto  " +
" INNER JOIN  sms.cliente cliente ON producto.cliente = cliente.id_cliente  " +
" INNER JOIN  sms.sc_id shorcut  ON shorcut.Id_sc = producto.id_sc  " +
" WHERE  cliente.Des_cliente NOT LIKE 'CERRADO_%' " +
" AND producto.desc_producto NOT LIKE 'CERRADO_%' " +
" AND producto.desc_producto NOT LIKE '%MULTA%' " +
" AND producto.desc_producto NOT LIKE '%IMC_TESTEO%' " +
" AND producto.id_aplicacion = '1' OR producto.id_aplicacion ='46' OR producto.id_aplicacion ='65' " +
" GROUP BY producto.desc_producto";


db.query(sql, function(err, result){
  if(err){
    console.log('error');
  }else {
    //console.log(result);
    result.forEach(function(element) {
      console.log("PRODUCTO - > " + element.IDPRODUCTO + " - > " + element.APLICACION); 
      if(element.APLICACION == '65'){
        var sql_found = "SELECT max(fecha) fecha, id_producto id FROM analisis.r_multiple WHERE id_producto = '" + element.IDPRODUCTO + "'"
        db.query(sql_found, function(err1, result1){
          if(err1){
            console.log('error');
          } else {
            if(result1 == ''){
             console.log(sql_found);
            }else {
              if(result1[0].fecha != null) {
                var fecha = moment(result1[0].fecha).format('YYYY-MM-DD');
                var diasTranscurridos = fechaActual.diff(fecha, 'days');
                var sql_producto = "SELECT * FROM insignia_suscripciones.control_fecha_productos WHERE id_producto = '" + result1[0].id + "'";
                db.query(sql_producto, function(error2, result2){
                  if(error2){
                    console.log('ERROR ' + sql_producto )
                  } else {
                      var fecha = moment(result1[0].fecha).format('YYYY-MM-DD');
                      var diasTranscurridos = fechaActual.diff(fecha, 'days');
                      
                      if(!result2[0]){
                        if(diasTranscurridos <= 150) {
                          var sql_insert = "INSERT INTO `insignia_suscripciones`.`proveedor_de_contenido` "+
                          " (`sc`, `cliente`, `id_producto`, `actualizado`, `disponible`, `tipo_aplicacion`) VALUES ('" + element.SHORCUT + "', '" + element.IDCLIENTE + "', '" + element.IDPRODUCTO + "', '1', '0','65')";
                          db.query(sql_insert, function(errorI, resultI){
                            if(errorI){
                              console.log('¡BAD! -> ' + errorI + ' insert :  ' + sql_insert)
                            } else {
                              console.log('INSERT IN ELSE WITH 65 WORKS!');
                            }
                          })
                        }
                      } else {
                        if(diasTranscurridos < result2[0].limite_dias){
                          var sql_insert = "INSERT INTO `insignia_suscripciones`.`proveedor_de_contenido` "+
                          " (`sc`, `cliente`, `id_producto`, `actualizado`, `disponible`, `tipo_aplicacion`) VALUES ('" + element.SHORCUT + "', '" + element.IDCLIENTE + "', '" + element.IDPRODUCTO + "', '1', '1', '65')";
                          db.query(sql_insert, function(errorI, resultI){
                            if(errorI) {
                              console.log('error I');
                            } else {
                              console.log('Insert in else WORKS!');
                            }
                          })
                        }
                      }
                  }
                })
              }
            }
          }
        });
      } 
      
      
      
      else if (element.APLICACION == '46') {
        var sql_found = "SELECT max(fecha) fecha, producto FROM analisis.rsimple_distintiva WHERE producto = '" + element.DESCRIPCION + "'"
        console.log(sql_found);
        db.query(sql_found, function(err, result1){
          if(err){
            console.log('error en simple - > ' + sql_found)
          } else {
            if(result == ''){
               //console.log(sql_found);
            } else {
              if(result1[0].fecha != null) { 
                var fecha = moment(result1[0].fecha).format('YYYY-MM-DD');
                var diasTranscurridos = fechaActual.diff(fecha, 'days');
                var sql_producto1 = "SELECT producto.id_producto IDPRODUCTO, producto.id_sc ID, producto.desc_producto DESCRIPCION, "+
                "   cliente.Des_cliente CLIENTE, cliente.Id_cliente IDCLIENTE, " +
                "   producto.alias_producto CATEGORIA, " +
                "   shortcode.Id_sc SHORCUT, " +
                "    shortcode.Id_sc SC, " +
                "    shortcode.tarifa TARIFA " +
                "    FROM " +
                "    sms.producto producto  " +
                "                                INNER JOIN "+
                "    sms.cliente cliente ON producto.cliente = cliente.id_cliente "+
                "                  INNER JOIN " +
                "    sms.sc_id shortcode " +

                "    ON shortcode.Id_sc = producto.id_sc "+
                "    WHERE  producto.desc_producto = '"+ result1[0].producto +"'";
                console.log(sql_producto1);

                db.query(sql_producto1, function(error, resultado){
                  if(error){
                    console.log('error sql_producto1');
                  } else {
                    if(resultado){
                      console.log('query works!' + resultado[0].IDPRODUCTO);
                      var sql_producto = "SELECT * FROM insignia_suscripciones.control_fecha_productos WHERE id_producto = '" + result1[0].id + "'";
                      db.query(sql_producto, function(error2, result2){
                        if(error2){
                          console.log('error sql_producto');
                        } else {
                          console.log('Dias transcurridos : ' + diasTranscurridos + ' producto : ' + resultado[0].IDPRODUCTO);
                          if(!result2[0]){
                              if(diasTranscurridos <= 150){
                                resultado.forEach(function(element) {
                                  var sql_insert = "INSERT INTO `insignia_suscripciones`.`proveedor_de_contenido` " +
                                  " (`sc`, `cliente`, `id_producto`, `actualizado`, `disponible`, `tipo_aplicacion`) VALUES " +
                                  " ('" + element.SHORCUT + "', '" + element.IDCLIENTE + "', '" + element.IDPRODUCTO + "', '1', '0', '46')";
                                  db.query(sql_insert, function(errorIn, resultIn){
                                    if(errorIn){
                                      console.log('error al insertar transilvania ');
                                    } else {
                                      console.log('INSERT IN IF WORKS SIMPLE !! ' + element.IDPRODUCTO);
                                    }
                                  })
                                });

                              }
                          } else {
                            if(diasTranscurridos < result2[0].limite_dias){
                              resultado.forEach(function(element) {
                                var sql_insert = "INSERT INTO `insignia_suscripciones`.`proveedor_de_contenido` " +
                                " (`sc`, `cliente`, `id_producto`, `actualizado`, `disponible`, `tipo_aplicacion`) VALUES " +
                                " ('" + element.SHORCUT + "', '" + element.IDCLIENTE + "', '" + element.IDPRODUCTO + "', '1', '0', '46')";
                                  db.query(sql_insert, function(errorIn, resultIn){
                                    if(errorIn){
                                      console.log('error al insertar transilvania SIMPLE ');
                                    } else {
                                      console.log('INSER IN ELSE WORKS SIMPLE !! ' + element.IDPRODUCTO);
                                    }
                                  })
                              });
                            }
                          }
                        }
                      })
                      
                    } 
                  }
                });
              }
            }
          }
        })
      } 
      
      
      
      else if (element.APLICACION == '1') {
        var sql_found = "SELECT max(fecha) fecha, producto FROM analisis.rsimple WHERE producto = '" + element.DESCRIPCION + "'"
        console.log(sql_found);
        db.query(sql_found, function(err, result1){
          if(err){
            console.log('error en simple - > ' + sql_found)
          } else {
            if(result == ''){
               //console.log(sql_found);
            } else {
              if(result1[0].fecha != null) { 
                var fecha = moment(result1[0].fecha).format('YYYY-MM-DD');
                var diasTranscurridos = fechaActual.diff(fecha, 'days');
                var sql_producto1 = "SELECT producto.id_producto IDPRODUCTO, producto.id_sc ID, producto.desc_producto DESCRIPCION, "+
                "   cliente.Des_cliente CLIENTE, cliente.Id_cliente IDCLIENTE, " +
                "   producto.alias_producto CATEGORIA, " +
                "   shortcode.Id_sc SHORCUT, " +
                "    shortcode.Id_sc SC, " +
                "    shortcode.tarifa TARIFA " +
                "    FROM " +
                "    sms.producto producto  " +
                "                                INNER JOIN "+
                "    sms.cliente cliente ON producto.cliente = cliente.id_cliente "+
                "                  INNER JOIN " +
                "    sms.sc_id shortcode " +

                "    ON shortcode.Id_sc = producto.id_sc "+
                "    WHERE  producto.desc_producto = '"+ result1[0].producto +"'";
                console.log(sql_producto1);

                db.query(sql_producto1, function(error, resultado){
                  if(error){
                    console.log('error sql_producto1');
                  } else {
                    if(resultado){
                      console.log('query works!' + resultado[0].IDPRODUCTO);
                      var sql_producto = "SELECT * FROM insignia_suscripciones.control_fecha_productos WHERE id_producto = '" + result1[0].id + "'";
                      db.query(sql_producto, function(error2, result2){
                        if(error2){
                          console.log('error sql_producto');
                        } else {
                          console.log('Dias transcurridos : ' + diasTranscurridos + ' producto : ' + resultado[0].IDPRODUCTO);
                          if(!result2[0]){
                              if(diasTranscurridos <= 150){
                                resultado.forEach(function(element) {
                                  var sql_insert = "INSERT INTO `insignia_suscripciones`.`proveedor_de_contenido` " +
                                  " (`sc`, `cliente`, `id_producto`, `actualizado`, `disponible`, `tipo_aplicacion`) VALUES " +
                                  " ('" + element.SHORCUT + "', '" + element.IDCLIENTE + "', '" + element.IDPRODUCTO + "', '1', '0', '1')";
                                  db.query(sql_insert, function(errorIn, resultIn){
                                    if(errorIn){
                                      console.log('error al insertar transilvania SIMPLE');
                                    } else {
                                      console.log('INSERT IN IF WORKS SIMPLE !! ' + element.IDPRODUCTO);
                                    }
                                  })
                                });

                              }
                          } else {
                            if(diasTranscurridos < result2[0].limite_dias){
                              resultado.forEach(function(element) {
                                var sql_insert = "INSERT INTO `insignia_suscripciones`.`proveedor_de_contenido` " +
                                " (`sc`, `cliente`, `id_producto`, `actualizado`, `disponible`, `tipo_aplicacion`) VALUES " +
                                " ('" + element.SHORCUT + "', '" + element.IDCLIENTE + "', '" + element.IDPRODUCTO + "', '1', '0', '1')";
                                  db.query(sql_insert, function(errorIn, resultIn){
                                    if(errorIn){
                                      console.log('error al insertar transilvania SIMPLE ');
                                    } else {
                                      console.log('INSER IN ELSE WORKS SIMPLE !! ' + element.IDPRODUCTO);
                                    }
                                  })
                              });
                            }
                          }
                        }
                      })
                      
                    } 
                  }
                });
              }
            }
          }
        })
      } 
      
      
      
      else {
        //console.log('error 404');
      }

    });
    var a = moment([2007, 0, 29]);
    var b = moment([2007, 0, 28]);
    console.log(fechaAux);
    var diasTranscurridos = fechaActual.diff(fechaAux, 'days');
    console.log(diasTranscurridos);
  }
});

