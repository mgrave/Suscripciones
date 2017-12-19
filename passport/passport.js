
var LocalStrategy = require('passport-local').Strategy;
var mysql         = require('mysql');
var bcrypt        = require('bcryptjs');
var md5           = require('md5');

module.exports = function(passport) {

  passport.serializeUser(function(user, done){
    done(null, user);
  });

  passport.deserializeUser(function(obj, done){
    done(null, obj);
  });

  passport.use('user-local',new LocalStrategy({
    passReqToCallback : true
  }, function(req, email, password, done){
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();

    db.query('SELECT * FROM insignia_suscripciones.abonado WHERE email = ?', email ,function(err, rows, fields){
      if(err) throw err;

      db.end();

      if(rows.length > 0){
        var user = rows[0];
        if(md5(password) == user.password){
          if(user.verified == 0){
             return done(null, false, req.flash('authmessage', 'Todavía no verificas tu correo electrónico.'));
          }else{

            if (user.active == 0) {
              return done(null, false, req.flash('authmessage', '¡Has sido desabilitado por el administrador!'));
            }else{

            return done(null, {
            id: user.id,
            nombre: user.first_name,
            email: user.email,
            apellido: user.last_name,
            password: user.password
          });
            }
          }

        }
      }

      return done(null, false, req.flash('authmessage', '¡Ups! Puede que el correo o la contraseña sean incorrectos ..'));
    });
  }));

  passport.use('admin', new LocalStrategy({
    passReqToCallback : true
  }, function(req, username, password, done){
    var config = require('.././database/config');
    var db = mysql.createConnection(config);
    db.connect();
    db.query("SELECT * FROM sms.usuario  WHERE login = '"+ username +"'", function(err, rows, fields){
      if(err) throw err;
      db.end();
      if(rows.length > 0){
        var user = rows[0];
        console.log(md5(password) +" -> "+user.pwd )
        if((md5(password)) == user.pwd){
            return done(null, {
            usuario: user.login
          });
        }
        return done(null, false, req.flash('authmessage', 'Puede que el usuario o la contraseña sean incorrectos ..'));
      }else{
        return done(null, false, req.flash('authmessage', 'Puede que el usuario o la contraseña sean incorrectos ..'));
      }
    });
  }));

};
