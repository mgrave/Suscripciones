var express        = require('express');
var router         = express.Router();
var passport       = require('passport');
var controllers    = require('.././controllers');
var AuthMiddleware = require('.././middleware/auth');

/* GET home page. */
router.get('/', controllers.UserController.getSignIn);
router.get('/home', controllers.HomeController.index);
router.get('/nosotros', controllers.UserController.nosotros);     //REVISADO!!

router.get('/test',
            controllers.UserController.getSomeTest)               //REVISADO!!
// USUARIO
// ---- RUTAS GET DEL USUARIO ------
// ============================================
router.get('/auth/signup',  
          controllers.UserController.getSignUp);        //REVISADO!!
router.get('/auth/signin', 
          controllers.UserController.getSignIn);        //REVISADO!!
router.get('/auth/logout', 
          controllers.UserController.logout);           //REVISADO!!
router.get('/users/panel', AuthMiddleware.isLogged ,
          controllers.UserController.getUserPanel);     //REVISADO!!
router.get('/users/numeros', AuthMiddleware.isLogged ,
          controllers.UserController.getNumeros);       //REVISADO!!
//NUMEROS PARA EL DASHBOARD
router.get('/users/numeros/dashboard', AuthMiddleware.isLogged ,
          controllers.UserController.getNumerosDashboard); 
router.get('/users/productos', AuthMiddleware.isLogged, 
          controllers.UserController.getProductos);     //REVISADO
router.get('/users/suscripcion/:producto', AuthMiddleware.isLogged, 
          controllers.UserController.getSuscripcion);    //RUTA EXTRAÑA
router.get('/users/mis-suscripciones', AuthMiddleware.isLogged, 
          controllers.UserController.getMySuscripcions);        //REVISADO!!
router.get('/verify/:token', 
          controllers.UserController.validateToken);     //REVISADO
router.get('/nuevacontrasena', AuthMiddleware.isLogged, 
          controllers.UserController.newpwd);            //REVISADO!!
router.get('/users/busqueda/:id/:op', AuthMiddleware.isLogged, 
          controllers.UserController.searchSC);          //REVISADO
router.get('/tknuevacontrasena/:id', 
          controllers.UserController.tokenNewpwd);       //ESTE MODULO DEPENDE DEL PRINCIPAL DE MODIFICAR CONTRASEÑA

router.get('/users/suscripciones/:Numero', AuthMiddleware.isLogged,
          controllers.UserController.getSuscripciones);  //OBTENER LAS SUSCRIPCIONES


// ---- RUTAS POST DEL USUARIO ------
// ============================================
router.post('/auth/signup', 
            controllers.UserController.postSignUp);                         //REVISADO!!
router.post('/activar/:numero/:descrip', AuthMiddleware.isLogged, 
            controllers.UserController.getNumeroAct);                       //REVISADO!!
router.post('/eliminar-numero/:numero/:operadora', AuthMiddleware.isLogged, 
            controllers.UserController.deleteNumero);                       //REVISADO!!
router.post('/desactivar-numero/:numero', AuthMiddleware.isLogged,
            controllers.UserController.desactivarNumero);                   //REVISADO!!
router.post('/suscribir/:id/:numero/:cliente', AuthMiddleware.isLogged, 
            controllers.UserController.Suscribir);                          //REVISADO!!
//SUSCRIBIR DESDE EL DASHBOARD
router.post('/suscribirDashboard/:id/:linea/:numero/:cliente', AuthMiddleware.isLogged, 
            controllers.UserController.SuscribirDashboard);


// router.post('/suscribirData/', AuthMiddleware.isLogged ,
//              controllers.UserController.iniciarSuscripcion);
router.post('/eliminar-suscripcion/:id/:numero/:prefix', AuthMiddleware.isLogged, 
            controllers.UserController.adminEliminarSuscripcion);           //REVISADO!!
router.post('/users/panel', AuthMiddleware.isLogged, 
            controllers.UserController.actualizar);                          //REVISADO!!
router.post('/verificar/:numero/:pwd', AuthMiddleware.isLogged, 
            controllers.UserController.numberVerification);                  //REVISADO!!
router.post('/nuevacontrasena', AuthMiddleware.isLogged, 
            controllers.UserController.postnewpwd);                         //MODULO PRINCIPAL DE CAMBIO DE CONTRASEÑA NO FUNCIONA!
router.post('/reenviarcontrasena/:code', 
            controllers.UserController.newPassword );                       //ESTE MODULO DEPENDE DEL PRINCIPAL DE MODIFICAR CONTRASEÑA
//ENVIAR MENSAJE CON CODIGO_VALIDACION PARA RECUPERAR PASSWORD
router.post('/recoverPass/:operadora/:telefono', 
            controllers.UserController.sendRecoverSMS );
//ENVIAR EMAIL CON TOKEN PARA RECUPERAR PASSWORD
router.post('/RecoverPassEmail/:correo', 
            controllers.UserController.checkEmail);  //CHECK QUE EL USUARIO EXISTA ENBBDD ( RECUPERAR CONTRASEÑA ) 
//CHECK QUE EL TOKEN INGRESADO COINCIDA CON EL TOKEN QUE SE ENCUENTRA EN BBDD
router.post('/checkToken/:token', 
            controllers.UserController.checkToken);

router.post('/postnewpassword/:id/:password1', 
            controllers.UserController.postnewPassword);                    //ESTE MODULO DEPENDE DEL PRINCIPAL DE MODIFICAR CONTRASEÑA
router.post('/auth/signin', passport.authenticate('user-local', {
  successRedirect : '/home',
  failureRedirect : '/auth/signin',
  failureFlash : true
}));                                                                        //REVISADO!!

// ADMINISTRADOR 
// ---- RUTAS GET DEL ADMINISTRADOR ------
// ============================================
router.get('/admin', 
            controllers.UserController.getAdminSignIn);         // REVISADO
router.get('/admin/logout', 
            controllers.UserController.adminLogout);            //REVISADO
router.get('/admin/users', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminUsers);             //REVISADO
router.get('/admin/numeros', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminNumbers);           //REVISADO
router.get('/admin/edit/:id', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminEdit);              //ERROR EN FECHA, EN AL TABLA ADMIN.. USUARIOS!, ERROR EN ELIMINACION DE NUMEROS( NO LO HACE )
router.get('/admin/email', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminEmailControl);      //REVISADO
router.get('/admin/notifications', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminNotificationsControl);//REVISADO
router.get('/admin/notificationsAdv', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminNotificationsAdvanced);//REVISADO
router.get('/admin/fechaProducto', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminFechaProducto);        //REVISADO
//RUTA DE PRUEBA PARA ADMIN/EDIT/:ID
router.get('/admin/suscripciones/:Numero/:id',AuthMiddleware.requiresAdmin,
            controllers.UserController.getSuscripcionesAdmin);        //REVISADO


// ---- RUTAS POST DEL ADMINISTRADOR ------
// ============================================
router.post('/admin/activate/:number',AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminActivateTlf);                                  //REVISADO
router.post('/admin/modificar/:shortcode/:numero/:numerovalue', AuthMiddleware.requiresAdmin, 
            controllers.UserController.actNotifications);                                  //REVISADO
router.post('/admin/desactivate/:number', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminDesactivateTlf);                               //REVISADO
router.post('/adeliminar-numero/:numero', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminDeleteNumero);                                 //ESTE MODULO NO FUNCIONA
router.post('/admin/actualizar-datos/:id', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminActualizar);                                   //REVISADO
router.post('/admin/desactivate-email/:id', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminDesactivateEmail);                             //REVISADO, CON MENSAJE DE ERROR INVALIDO!
router.post('/admin/activate-email/:id', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminActivatedEmail);                               //REVISADO
router.post('/admin/agregar-correo/:email/:nombre', AuthMiddleware.requiresAdmin, 
            controllers.UserController.admidAgregarCorreo);                                //REVISADO
router.post('/admin/eliminar-suscripciones/:id/:numero/:prefix', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminEliminarSuscripciones);                        //REVISADO
router.post('/admin/putfecha/:id_producto/:numero', AuthMiddleware.requiresAdmin, 
            controllers.UserController.adminPutFecha);                                     //REVISADO
router.post('/admin/signin', passport.authenticate('admin', {
  successRedirect : '/admin/users',
  failureRedirect : '/admin',
  failureFlash : true
}));                                                                                       //REVISADO
// --- RUTAS DELETE DEL ADMINISTRADOR -----
// ============================================
router.delete('/admin/eliminarCorreo/:email', 
              controllers.UserController.admidEliminarCorreo)                              //REVISADO
router.delete('/admin/eliminarAbonado/:id', 
              controllers.UserController.admidEliminarAbonado)                             //REVISADO

// --- RUTAS PUT DEL ADMINISTRADOR -----
// ============================================
router.put('/admin/smspremium/:shortcode/:numero', AuthMiddleware.requiresAdmin, 
            controllers.UserController. adminPutSms);                                      //REVISADO


module.exports = router;
