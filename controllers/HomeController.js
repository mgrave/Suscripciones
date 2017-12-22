var mysql        = require('mysql');
var moment       = require('moment');
var hoy_fecha    = moment().format("YYYY-MM-DD");
var hoy_hora     = moment().format("HH:mm:ss");
var Chart = require('chart.js');

module.exports = {


    //CONTROLADOR QUE LLENA EL DASHBOARD
    index: function(req, res, next) {

    //LLENAR MIS SUSCRIPCIONES
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    var mis_suscripciones = "SELECT operadora.descripcion PRFIJO, telefono.recipient TELEFONO, producto.id_producto ID_PRODUCTO, producto.alias_producto CATEGORIA, producto.desc_producto PRODUCTO, PCA.Des_cliente CLIENTE, SHORTCUT.sc_id SC, suscripcion.date_added FECHA_SUSCRIPCION, FECHA_ACTUALIZACION.fecha_cambio_desc_producto FECHA_ACTUALIZACION FROM insignia_suscripciones.telefono telefono INNER JOIN insignia_suscripciones.suscripcion suscripcion ON suscripcion.recipient = telefono.recipient AND suscripcion.prefix = telefono.prefix  INNER JOIN sms.producto producto ON producto.id_producto = suscripcion.product_id  INNER JOIN insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo INNER JOIN sms.sc_id SHORTCUT ON producto.id_sc = SHORTCUT.Id_sc   INNER JOIN analisis.historico_producto FECHA_ACTUALIZACION ON producto.id_producto = FECHA_ACTUALIZACION.id_producto INNER JOIN sms.cliente PCA ON producto.cliente = PCA.Id_cliente WHERE telefono.abonado_id="+req.user.id+" AND telefono.active= '1' ORDER BY suscripcion.id DESC ";
    db.query(mis_suscripciones, function(err, result){
      if(err){
        db.end()
        console.log('ERROR AL EXTRAER LA DATA -> ' + err);
      }else{
        //DANDO FORMATO A LAS FECHAS
          for (var i = 0; i < result.length; i++) {
             result[i].FECHA_SUSCRIPCION = moment(result[i].FECHA_ACTUALIZACION).format('YYYY-MM-DD');
             result[i].FECHA_ACTUALIZACION = moment(result[i].FECHA_ACTUALIZACION).format('YYYY-MM-DD');
             console.log("FECHA_BBDD ->   "+result[i].FECHA_ACTUALIZACION);
          };

          //INGRESANDO PRODUCTOS EN ARRAYS POR TIPO

          //CATEGORIAS EXISTENTES
          var Categoria_Hipicos = [];
          var Categoria_Parlays = [];
          var Categoria_Loterias = [];
          var Categoria_Prensa = [];
          var Categoria_Horoscopo = [];
          var Categoria_Encuesta = [];
          var Categoria_Menus = [];
          var Categoria_Programa = [];
          var Categoria_Concurso = [];
          var Categoria_Potazo = [];
          var Categoria_Radio = [];
          var Categoria_Prueba = [];
          var Categoria_Promocion = [];
          var Categoria_Trivia = [];
          var Categoria_Emergencia = [];
          var Categoria_Alcaldia = [];
          var Categoria_Farmacia = [];
          var Categoria_Imagenes = [];
          var Categoria_Voto = [];
          var Categoria_Ringtones = [];


          for (var i = 0; i < result.length; i++) {
            //INGRESAR PRODUCTOS EN ARRAYS POR SU CATEGORIA ( ENN BBDD -> ALIAS_PRODUCTO ).
            //NOTA: METI TODAS LAS CATEGORIAS (NO ES NECESARIO PERO AJA, AHI ESTAN POR SI ACASO).
            result[i].CATEGORIA = result[i].CATEGORIA.toUpperCase();
            console.log("CATEGORIA CON EL UPPERCASE ->>    "+result[i].CATEGORIA);
            if (result[i].CATEGORIA == 'HIPICOS') {Categoria_Hipicos.push(result[i])}
            if (result[i].CATEGORIA == 'LOTERIAS' || result[i].CATEGORIA == 'ANIMALITOS') {Categoria_Loterias.push(result[i])}
            if (result[i].CATEGORIA == 'PARLAY') {Categoria_Parlays.push(result[i])}
            if (result[i].CATEGORIA == 'PRENSA') {Categoria_Prensa.push(result[i])}
            if (result[i].CATEGORIA == 'HOROSCOPO') {Categoria_Horoscopo.push(result[i])}
            if (result[i].CATEGORIA == 'ENCUESTA') {Categoria_Encuesta.push(result[i])}
            if (result[i].CATEGORIA == 'MENUS') {Categoria_Menus.push(result[i])}
            if (result[i].CATEGORIA == 'PROGRAMA') {Categoria_Programa.push(result[i])}
            if (result[i].CATEGORIA == 'CONCURSO' || result[i].CATEGORIA == 'CONCURSOS') {Categoria_Concurso.push(result[i])}
            if (result[i].CATEGORIA == 'POTAZO' || result[i].CATEGORIA == 'DONACION') {Categoria_Potazo.push(result[i])}
            if (result[i].CATEGORIA == 'RADIO') {Categoria_Radio.push(result[i])}
            if (result[i].CATEGORIA == 'PRUEBA' || result[i].CATEGORIA == 'PRUEBAS' || result[i].CATEGORIA == 'TEST') {Categoria_Prueba.push(result[i])}
            if (result[i].CATEGORIA == 'PROMOCION' || result[i].CATEGORIA == 'PROMOCIONES') {Categoria_Promocion.push(result[i])}
            if (result[i].CATEGORIA == 'TRIVIA') {Categoria_Trivia.push(result[i])}
            if (result[i].CATEGORIA == 'EMERGENCIA' || result[i].CATEGORIA == 'EMERGENCIAS') {Categoria_Emergencia.push(result[i])}
            //PARA LA ALCALDIA SOLO TOMO LOS PRIMERO VALORES COMO DISTINTIVO PORQUE EN BBDD ESTAN DISTINTOS
            var is_alcaldia = result[i].CATEGORIA.substr(0,4);
            if ( is_alcaldia == 'ALCA' || is_alcaldia == 'alca') {Categoria_Alcaldia.push(result[i])}
            if (result[i].CATEGORIA == 'FARMACIA' || result[i].CATEGORIA == 'FARMACIAS' || result[i].CATEGORIA == 'EMERGENCIAS') {Categoria_Farmacia.push(result[i])}
            if (result[i].CATEGORIA == 'IMAGENES') {Categoria_Imagenes.push(result[i])}
            if (result[i].CATEGORIA == 'VOTO' || result[i].CATEGORIA == 'VOTOS' || result[i].CATEGORIA == 'VOTACIONES') {Categoria_Voto.push(result[i])}
            if (result[i].CATEGORIA == 'RINGTONES') {Categoria_Ringtones.push(result[i])}

            //ELIMINAR SC DEL NOMBRE DEL PRODUCTO
            result[i].PRODUCTO = (result[i].PRODUCTO).substr(4, result[i].PRODUCTO.length);

          };
          //DEBUG
          //console.log(result);
          //INGRESANDO CATEGORIAS EN UN ARRAY (VALORES DISTINTOS)
          var Categorias = [];
          for (var i = 0; i < result.length; i++) {
            for (var j = 0; j < result.length; j++) {
                if (result[i].CATEGORIA != result[j].CATEGORIA) Categorias.push(result[i].CATEGORIA);
            };
          };
            //AQUI SE SEPARA EN VALORES DISTINTOS Y SE INGRESA AL ARRAY "Categorias"
            var Categorias_Unicas = Categorias.filter(function(elem, pos) {
            return Categorias.indexOf(elem) == pos;
            })
            //DEBUG CATEGORIAS_UNICAS (ESTAS SE ENVIAN A LAS PESTAÑAS)
            console.log(Categorias_Unicas);


          //PARTE QUE LLENA (ULTIMOS PRODUCTOS)
            var productos_recientes = "SELECT producto.id_producto ID_PRODUCTO, producto.desc_producto NOMBRE_PRODUCTO,FECHAS.fecha_creacion FECHA_CREADO, SC.sc_id SC, producto.alias_producto CATEGORIA,CLIENTE.id_cliente ID_CLIENTE, CLIENTE.Des_cliente PCA, HISTORICO_PRODUCTO.fecha_cambio_desc_producto FECHA_ACTUALIZACION, SUBSTRING(producto.desc_producto, 1, 7) CERRADO_DIFERENCIADOR FROM sms.producto producto  INNER JOIN sms.sc_id SC ON producto.id_sc = SC.Id_sc INNER JOIN sms.producto_fechas FECHAS ON producto.id_producto = FECHAS.id_producto INNER JOIN sms.cliente CLIENTE ON producto.cliente = CLIENTE.Id_cliente INNER JOIN analisis.historico_producto HISTORICO_PRODUCTO ON  HISTORICO_PRODUCTO.id_producto = producto.id_producto WHERE SUBSTRING(producto.desc_producto, 1, 7) NOT LIKE 'CERRADO' ORDER BY producto.id_producto DESC LIMIT 5";
            db.query(productos_recientes, function(err, result_recientes){
              if(err){
                db.end()
                console.log('ERROR AL EXTRAER LA DATA -> ' + err);
              }else{
                  console.log(result_recientes);
                //DEBUG
                  //console.log(result_recientes);

          //DANDO FORMATO A LAS FECHAS
          for (var i = 0; i < result_recientes.length; i++) {
             result_recientes[i].FECHA_ACTUALIZACION = moment(result_recientes[i].FECHA_ACTUALIZACION).format('YYYY-MM-DD');
             result_recientes[i].FECHA_CREADO = moment(result_recientes[i].FECHA_CREADO).format('YYYY-MM-DD');
             //console.log("FECHA_BBDD ->   "+result_recientes[i].FECHA_ACTUALIZACION);
            //ELIMINAR SC DEL NOMBRE DEL PRODUCTO
            result_recientes[i].NOMBRE_PRODUCTO = (result_recientes[i].NOMBRE_PRODUCTO).substr(4, result_recientes[i].NOMBRE_PRODUCTO.length);

          };

         
         
          //INGRESANDO PRODUCTOS EN ARRAYS POR TIPO
            //CATEGORIAS EXISTENTES
            var Categoria_Hipicos_Recientes = [];
            var Categoria_Parlays_Recientes = [];
            var Categoria_Loterias_Recientes = [];

            for (var i = 0; i < result_recientes.length; i++) {
            //INGRESAR PRODUCTOS EN ARRAYS POR SU CATEGORIA ( ENN BBDD -> ALIAS_PRODUCTO ).
            result_recientes[i].CATEGORIA = result_recientes[i].CATEGORIA.toUpperCase();
            //console.log("CATEGORIA CON EL UPPERCASE ->>    "+result[i].CATEGORIA);
            if (result_recientes[i].CATEGORIA == 'HIPICOS') {Categoria_Hipicos_Recientes.push(result_recientes[i])}
            if (result_recientes[i].CATEGORIA == 'LOTERIAS') {Categoria_Loterias_Recientes.push(result_recientes[i])}
            if (result_recientes[i].CATEGORIA == 'PARLAY') {Categoria_Parlays_Recientes.push(result_recientes[i])}
            }

      //PARTE QUE LLENA EL CHART (-GRAFICA-)
   
    var sql_chart = "SELECT producto.alias_producto CATEGORIA, count(producto.alias_producto) SUSCRIPCIONES FROM insignia_suscripciones.telefono telefono  INNER JOIN insignia_suscripciones.suscripcion suscripcion ON suscripcion.recipient = telefono.recipient AND suscripcion.prefix = telefono.prefix   INNER JOIN sms.producto producto ON producto.id_producto = suscripcion.product_id   INNER JOIN insignia_masivo_premium.operadora operadora ON telefono.prefix = operadora.prefijo  INNER JOIN sms.sc_id SHORTCUT ON producto.id_sc = SHORTCUT.Id_sc    INNER JOIN analisis.historico_producto FECHA_ACTUALIZACION ON producto.id_producto = FECHA_ACTUALIZACION.id_producto  INNER JOIN sms.cliente PCA ON producto.cliente = PCA.Id_cliente  WHERE telefono.abonado_id="+req.user.id+" AND telefono.active= '1' GROUP BY producto.alias_producto ORDER BY SUSCRIPCIONES DESC";
    db.query(sql_chart, function(err, result_chart){
      if(err){
        db.end()
        console.log('ERROR AL EXTRAER LA DATA -> ' + err);
      }else{
        console.log(result_chart);
        
                  var DataChart = [];
                  var LabelsChart = [];
                  for (var i = 0; i < result_chart.length; i++) {
                      DataChart.push(result_chart[i].SUSCRIPCIONES);
                      LabelsChart.push(result_chart[i].CATEGORIA);
                  };
          

      //PARTE QUE LLENA LA LISTA DE RECOMENDADOS

      //RECONOCIENDO LA CATEGORIA CON MAS SUSCRIPCIONES
      var Maxima_Categoria = [];
      if (result_chart[0] != null) {
      Maxima_Categoria.push(result_chart[0].CATEGORIA);
      }else{
        Maxima_Categoria = 'Hipicos';
      }
      //DEBUG
      //console.log("MAXIMA CATEGORIA ->> ",Maxima_Categoria[0].CATEGORIA);
      //TRAYENDO DE BBDD LOS ULTIMOS 5 PRODUCTOS DE ESA CATEGORIA
      
      var sql_recomendados = "SELECT producto.id_producto ID_PRODUCTO, producto.desc_producto NOMBRE_PRODUCTO,FECHAS.fecha_creacion FECHA_CREADO, SC.sc_id SC, producto.alias_producto CATEGORIA,CLIENTE.id_cliente ID_CLIENTE, CLIENTE.Des_cliente PCA, HISTORICO_PRODUCTO.fecha_cambio_desc_producto FECHA_ACTUALIZACION, SUBSTRING(producto.desc_producto, 1, 7) CERRADO_DIFERENCIADOR FROM sms.producto producto  INNER JOIN sms.sc_id SC ON producto.id_sc = SC.Id_sc INNER JOIN sms.producto_fechas FECHAS ON producto.id_producto = FECHAS.id_producto INNER JOIN sms.cliente CLIENTE ON producto.cliente = CLIENTE.Id_cliente INNER JOIN analisis.historico_producto HISTORICO_PRODUCTO ON  HISTORICO_PRODUCTO.id_producto = producto.id_producto WHERE SUBSTRING(producto.desc_producto, 1, 7) NOT LIKE 'CERRADO' AND producto.alias_producto = '"+Maxima_Categoria+"' ORDER BY producto.id_producto DESC LIMIT 5";
      db.query(sql_recomendados, function(err, result_recomendados){
      if(err){
        db.end()
        console.log('ERROR AL EXTRAER LA DATA -> ' + err);
      }else{
          console.log("PRODUCTOS RECOMENDADOS -> ",result_recomendados);
      

        res.render('home', {
          //DATOS GENERALES
          isAuthenticated : req.isAuthenticated(),
          user: req.user,
          error: false,
          path: req.path,
          footerAttr: 'none',
          Fecha: hoy_fecha,
          //DATA DEL CHART
          chartData: result_chart,
          DataChart: DataChart,
          LabelsChart: LabelsChart,
          //DATOS PARA (MIS SUSCRIPCIONES)
          mis_suscripciones: result,
          Categorias_Unicas: Categorias_Unicas,
          Categoria_Hipicos: Categoria_Hipicos,
          Categoria_Parlays: Categoria_Parlays,
          Categoria_Loterias: Categoria_Loterias,
          Categoria_Prensa: Categoria_Prensa,
          Categoria_Horoscopo: Categoria_Horoscopo,
          Categoria_Encuesta: Categoria_Encuesta,
          Categoria_Menus: Categoria_Menus,  
          Categoria_Programa: Categoria_Programa,
          Categoria_Concurso: Categoria_Concurso,
          Categoria_Potazo: Categoria_Potazo,  
          Categoria_Radio: Categoria_Radio,  
          Categoria_Prueba: Categoria_Prueba,  
          Categoria_Promocion: Categoria_Promocion,
          Categoria_Trivia: Categoria_Trivia,  
          Categoria_Emergencia: Categoria_Emergencia,
          Categoria_Alcaldia: Categoria_Alcaldia,
          Categoria_Farmacia: Categoria_Farmacia,
          Categoria_Imagenes: Categoria_Imagenes,
          Categoria_Voto: Categoria_Voto,  
          Categoria_Ringtones: Categoria_Ringtones,
          //DATOS PARA (ULTIMOS PRODUCTOS)
          Categoria_Hipicos_Recientes:Categoria_Hipicos_Recientes,
          Categoria_Parlays_Recientes:Categoria_Parlays_Recientes,
          Categoria_Loterias_Recientes:Categoria_Loterias_Recientes,
          //PRODUCTOS RECOMENDADOS
          Recomendados: result_recomendados
         
         });
      }

      });
           }
    

          });      
      }
      });
        }//2do else
                });//2do query ( mas recientes )

    },





Delete: function(req, res, next) {

}







}
