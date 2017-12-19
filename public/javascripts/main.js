$(document).ready(function(e){

  var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/;
  $('.btn-registro').on('click', function(e) {
    if((document.getElementById('nombre').value).length < 4){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"El nombre debe tener como mínimo 4 caracteres",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      }); 
      e.preventDefault();
    } else if((document.getElementById('apellido').value).length < 4){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"El apellido debe tener como mínimo 4 caracteres",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      }); 
      e.preventDefault();
    } else if(!(document.getElementById('password').value).match(regex)){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"La contraseña debe contener tanto números, letras minúsculas y mayúsculas.",
        width: 700,
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      }); 
      e.preventDefault();    
    } else if(document.getElementById('password').value != document.getElementById('password1').value){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"Las contraseñas deben ser iguales",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      }); 
      e.preventDefault();    
    }
  });

  $('.showCustomModal').on('click', function(e){

    $.smallBoxKill();

    contentCustom = 
    `1010_IMC_PROD_CLOSED_REGALO <br>
     1010_JHOAN_C10 <br>
     1010_JHOAN_C12 <br>`

    $.metroMessageBox({
      title: "Estas intentando suscribirte a los siguientes productos: ",
      content: contentCustom,
      buttons:["Continuar","Cancelar"],
      icons:["fa-check", "fa-times"],
      activebutton: "#2C998E",
      sound: false
	  },function(action, button){
    
      if(button == 'Cancelar') {
        
      } else {
        
      }
	  });

    // $.metroMessageBox({
    //   title: "Inicio de suscripciones",
    //   content: contentCustom,
    //   buttons:["Accept","Cancel"],
    //   icons:["fa-check", "fa-times"],
    //   activebutton: ["#34C6A3", "#E83E3E"],
    //   sound: false
    // },function(action, button){
    //   console.log($.metroMessageBox());
    //   if(button == 'Cancel') {
    //     alert('Cancel');
    //     $.smallBoxKill();
    //   } else {
    //     alert('Accept');
    //     $.smallBoxKill();
    //   }
    // });
  })

  $('.putfecha').on('click', function(e){
    $target = $(e.target);
    const id_producto = $(this).attr('id-producto');
    const value = $(this).parent().find('.brother-input').val()

    if(id_producto != null && value != null) {
      $.ajax({
        type:'POST',
        url: '/admin/putfecha/' + id_producto + '/' + value,
          success: function(data, text, xhr){
            if(data == "OK") {
              window.location.href = "/admin/fechaProducto";
            }else {
              $.smallBoxKill();
              $.smallBox({
                title:"¡Error!",
                content:"Inténtalo de nuevo.",
                colortime:2000,
                sound: false,
                colors:["#DE594C","#D0582A"],
              }); 
              e.preventDefault();   
            } 
          },
          error: function(err) {
              $.smallBoxKill();
              $.smallBox({
                title:"¡Error!",
                content:"Inténtalo de nuevo.",
                colortime:2000,
                sound: false,
                colors:["#DE594C","#D0582A"],
              }); 
              e.preventDefault();  
          }
      });
    } else {
      e.preventDefault();
    }
  
  })
  
  $('.delete-article').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type:'DELETE',
      url: '/articles/'+id
    });
  });

  $('.newpwd').on('click', function(e){
    var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/;
    password = document.getElementById('newpassword').value;
    password1 = document.getElementById('newpassword1').value;
    if(!password.match(regex)) {
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"La contraseña debe contener tanto números, letras minúsculas y mayúsculas ",
        colortime:2000,
        sound: false,
        width: 500,
        colors:["#DE594C","#D0582A"],
      }); 
      e.preventDefault();
    } else if(password != password1) {
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"Las contraseñas deben ser iguales",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      }); 
      e.preventDefault();
    } 
  })

  $('.eliminar-numero').on('click', function(e){
    $target = $(e.target);
    const numero = $target.attr('data-id');
    const operadora = $target.attr('data-operadora');

    if(!numero || !operadora) {
      e.preventDefault();
    } else {
      $.smallBoxKill();
      $.smallBox({
        title:"¡Cuidado!",
        width: 500,
        content:"Estas intentando eliminar un número, presiona en confirmar",
        colortime:2000,
        colors:["#DE594C","#D0582A"],
        buttons:["CONFIRMAR"],
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      },function(action, button){
        $.ajax({
          type:'POST',
          url:'/eliminar-numero/' + numero + '/' + operadora,
          success: function(result){
            window.location.href = "/users/numeros";
          },
          error: function(err) {
            window.location.href = "/users/numeros";
          }
            
        });
      });
    }




  });

  $('.adeliminar-numero').on('click', function(e){
    $target = $(e.target);
    const numero = $target.attr('data-id');
    const id = $target.attr('data-id1');
      $.smallBoxKill();
      $.smallBox({
        title:"¿Estas seguro?, presiona en confirmar",
        width: 550,
        colortime:2000,
        colors:["#DE594C","#D0582A"],
        buttons:["CONFIRMAR"],
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      },function(action, button){
        $.ajax({
          type:'POST',
          url:'/eliminar-numero/' + numero,
          success: function(result){
            window.location.href = "/admin/edit/" + id;
          },
          error: function(err) {
            window.location.href = "/admin/edit/" + id;
          }
            
        });
      });

  });

  $('.desactivar-numero').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    alert('Desactivando el número : ' + id);
    $.ajax({
      type:'POST',
      url:'/desactivar-numero/' + id
    });
  });

  $('.registrar-numero').on('click', function(e){
    $target = $(e.target);
    const numero = document.getElementById('idcs').value;
    alert(numero);
  });


  $('.text-loading').hide(); 
  $('.example').show().fadeIn(1000); 
  $('.example').DataTable({
            "language": {
                "emptyTable": ".",//tabla vacia
                "zeroRecords": "No hay datos con esa busqueda",
                "loadingRecords": "Espere un momento, cargando...",
                "search": "Búsqueda",
                "lengthMenu": "Desplegar _MENU_ registros por p&aacute;gina",
                "info": "Mostrando p&aacute;gina _PAGE_ de _PAGES_",
                "infoEmpty": " ",
                "infoFiltered": "(Filtrada de _MAX_ total de registros)",
                "paginate": {
                    "first": "Primera",
                    "last": "&Uacute;ltima",
                    "next": "Sig",
                    "previous": "Ant"
                }
            }
        });
    $('#example').show().fadeIn(1000); 
    $('#example').DataTable({
              "language": {
                  "emptyTable": ".",//tabla vacia
                  "zeroRecords": "No hay datos con esa busqueda",
                  "loadingRecords": "Espere un momento, cargando...",
                  "search": "Búsqueda",
                  "lengthMenu": "Desplegar _MENU_ registros por p&aacute;gina",
                  "info": "Mostrando p&aacute;gina _PAGE_ de _PAGES_",
                  "infoEmpty": " ",
                  "infoFiltered": "(Filtrada de _MAX_ total de registros)",
                  "paginate": {
                      "first": "Primera",
                      "last": "&Uacute;ltima",
                      "next": "Sig",
                      "previous": "Ant"
                  }
              }
          });

  $('.verificar').on('click',function(e){
    $target = $(e.target);
    const numero = $target.attr('data-id');
    console.log(numero);
  })

 /* $('#idx').on('click',getValue()); */

 $('.editar-datos').on('click',function(e){
   $target = $(e.target);
   const nombre = document.getElementById('nombre').value;
   const apellido = document.getElementById('apellido').value;
   if(nombre.length < 4 ){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Hay algo mal!",
        content:"El nombre debe tener como mínimo 4 caracteres",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
   }else if(apellido.length < 4){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Hay algo mal!",
        content:"El apellido debe tener como mínimo 4 caracteres",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
   }else{
        $.smallBoxKill();
        $.smallBox({
        title:"¡Muy Bien!",
        content:"Acabas de editar tus datos, debes ingresar denuevo al sistema",
        width: 550,
        colortime:2000,
        colors:["#28A34F","#21AFAB"],
        buttons:["Continuar"],
        sound: false,
        colortime:2000,
        colors:["#28A34F","#21AFAB"],
      },function(action, button){
        
        window.location.href = "/auth/signin";
      });
   }
 });
 
    
  $('.agregar-email').on('click',function(e){
    $target = $(e.target);
    const email = document.getElementById('emailx').value;
    const nombre = document.getElementById('nombrex').value;
    if(!email.match(/^[a-zA-Z0-9\._-]+@[a-zA-Z0-9\._-]+$/)){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Hay algo mal!",
        content:"El correo no es válido",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
    }else if (nombre.length < 4){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Hay algo mal!",
        content:"El nombre no es válido",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
    }else{
        $.ajax({
        type:'POST',
        url:'/admin/agregar-correo/' + email + '/' + nombre,
        success: function(result){
          window.location.href="/admin/email"
        },
        error: function(err) {
          console.log(err);
        }
      });
      
    }
  })

  $('.start').on('click', function(e){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Hay algo mal!",
        content:"El nombre no es válido",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
  });

  $('.eliminar-abonado').on('click',function(e){
    $target = $(e.target);
    const id = $target.attr('data-idx');
    $.smallBoxKill();
    $.smallBox({
      title:"¡Cuidado!",
      content:"estas intentando eliminar un abonado, presiona en confirmar",
      width: 550,
      colortime:2000,
      colors:["#DE594C","#D0582A"],
      buttons:["CONFIRMAR"],
      colortime:2000,
      closeonclick: true,
      sound: false,
      colors:["#DE594C","#D0582A"],
      },function(action, button){
        $.ajax({
          type:'DELETE',
          url: '/admin/eliminarAbonado/'+id,
          success: function(result){
            window.location.href="/admin/users"
          },
          error: function(err){
            console.log(err);
          }
    })
    });

  });

  $('.eliminar-email').on('click',function(e){
    $target = $(e.target);
    const email = $target.attr('data-email');
    $.smallBoxKill();
    $.smallBox({
      title:"¡Cuidado!",
      content:"estas intentando eliminar un correo, presiona en confirmar",
      width: 550,
      colortime:2000,
      colors:["#DE594C","#D0582A"],
      buttons:["CONFIRMAR"],
      colortime:2000,
      closeonclick: true,
      sound: false,
      colors:["#DE594C","#D0582A"],
      },function(action, button){
        $.ajax({
          type:'DELETE',
          url: "/admin/eliminarCorreo/" + email,
          success: function(result){
            window.location.href = "/admin/email";
          },
          error: function(err){
            console.log(err);
          }     
        });
    });
  })
  

  $('.agregar-numero').on('click', function(e){
    $target = $(e.target);
    description = $("#dato").val();
    var numero = document.getElementById('numerox').value;
    for(var i =0; i<numero.length; i++){
      var numero = numero.replace("-","");  
      var numero = numero.replace(".","");
      var numero = numero.replace(" ","");
    }
    if(!numero.match(/^[0-9]{7}$/)){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Asegúrate!",
        content:"Ingresa un número correcto",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
    }else if(numero.length != 7){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Asegúrate!",
        content:"Intenta ingresar un número correcto",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
    }    
    else{
      
      $.ajax({
      type:'POST',
      url:'/activar/' + numero + '/' + description,
       success: function(data, text, xhr) {
            if(data == 'OK') {
            $.smallBoxKill();
            $.smallBox({
            title:"¡Muy Bien!",
            content:"Acabas de agregar un nuevo número, presiona en continuar",
            width: 550,
            colortime:2000,
            colors:["#28A34F","#21AFAB"],
            buttons:["CONTINUAR"],
            colortime:2000,
            sound: false,
            colors:["#28A34F","#21AFAB"],
          },function(action, button){
            
            window.location.href = "/users/numeros";
          });
        } else {
          $.smallBoxKill();
          	$.smallBox({
              title:"¡Hay algo mal!",
              content:"No puedes agregar mas de tres números de teléfono",
              width: 450,
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            });	
        }
        }, 
        error: function(err) {
          //alert('Parece que el numero ingresado ya estaba registrado');
            $.smallBoxKill();
          	$.smallBox({
              title:"¡Hay algo mal!",
              content:"Existe un usuario con ese número",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            });	
        }
    });
    e.preventDefault();
    }

  }
  );

  $('.suscribir').on('click', function(e){
    $target = $(e.target);
    const data = $target.attr('data');
    const numero = $("#dato").val();
    const idc = $target.attr('idcliente');
    console.log(data+" -> "+numero+" -> "+idc);
    alert(" CLICK EN SUSCRIBIR ");
    $.ajax({
      type:'POST',
      url:'/suscribir/' + data + '/' + numero + '/' + idc
    });
  });

  $('.eliminar-suscripcion').on('click', function(e){
    $target = $(e.target);
    const numero = $target.attr('numero');
    const id = $target.attr('id');
    const producto = $target.attr('producto');
    $.ajax({
        type:'POST',
        url:'/admin/eliminar-suscripcion/' + producto + '/' + numero
      });
  });

  $('#example').on('click', '.eliminar-suscripcion1', function(e){
    console.log("HOLAAAA!");
    $target = $(e.target);
    const numero = $target.attr('numero');
    const producto = $target.attr('producto');
    const prefix = $target.attr('prefix');
    const id = $target.attr('id');
    //OBTENIENDO EL PATH
    var path = location.pathname.replace(",", "/");
    console.log("LA DIRECCION URL ES ->> "+ path);
   
    //SMALLBOX PLUGIN ( PLUGIN DE VENTANAS)
    $.smallBoxKill();
    $.smallBox({
        title:"¡Cuidado!",
        width: 600,
        content:"Estas intentando eliminar una suscripción, presiona en confirmar",
        colortime:2000,
        colors:["#DE594C","#D0582A"],
        buttons:["CONFIRMAR"],
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      },function(action, button){
        $.ajax({
          type:'POST',
          url:'/eliminar-suscripcion/' + id + '/' + numero + '/' + prefix,
          success: function(result){
            if (path != '/home') {
            window.location.href = "/users/mis-suscripciones";
            }else{
              window.location.href = "/home";
            }
          },
          error: function(err){
            console.log(err);
          }
            
        });
    });
  });
//TOOLTIP DE LAS TABLAS PARA DAR A CONOCER PCA(PROVEEDOR DE OCNTENIDO ASOCIADO
  $(function () {
  $('[data-toggle="tooltip"]').tooltip()
});


//ELIMINAR SUSCRIPCIONES DEL DASHBOARD
 $('body').on('click', '.eliminar-suscripcion1', function(e){
    console.log("HOLAAAA!");
    $target = $(e.target);
    const numero = $target.attr('numero');
    const producto = $target.attr('producto');
    const prefix = $target.attr('prefix');
    const id = $target.attr('id');
    //OBTENIENDO EL PATH
    var path = location.pathname.replace(",", "/");
    console.log("LA DIRECCION URL ES ->> "+ path);
   console.log("Numero -> "+numero+" Producto -> "+producto+" Prefix -> "+prefix+" ID -> "+id);
    //SMALLBOX PLUGIN ( PLUGIN DE VENTANAS)
    $.smallBoxKill();
    $.smallBox({
        title:"¡Cuidado!",
        width: 600,
        content:"Estas intentando eliminar una suscripción, presiona en confirmar",
        colortime:2000,
        colors:["#DE594C","#D0582A"],
        buttons:["CONFIRMAR"],
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      },function(action, button){
        $.ajax({
          type:'POST',
          url:'/eliminar-suscripcion/' + id + '/' + numero + '/' + prefix,
          success: function(result){
            if (path != '/home') {
            window.location.href = "/users/mis-suscripciones";
            }else{
              window.location.href = "/home";
            }
          },
          error: function(err){
            console.log(err);
          }
            
        });
    });
  });







    $('.eliminar-suscripcion2').on('click', function(e){
    $target = $(e.target);
    const numero = $target.attr('numero');
    const producto = $target.attr('producto');
    const prefix = $target.attr('prefix');
    const id = $target.attr('id');
    const Linea = $target.attr('Linea');
    const NumeroCompleto = (Linea+"-"+numero);

    $.smallBoxKill();
    $.smallBox({
        title:"¡Cuidado!",
        width: 600,
        content:"Estas intentando eliminar una suscripción, presiona en confirmar",
        colortime:2000,
        colors:["#DE594C","#D0582A"],
        buttons:["CONFIRMAR"],
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      },function(action, button){
        $.ajax({
          type:'POST',
          url:'/admin/eliminar-suscripciones/' + producto + '/' + numero + '/' + prefix,
          success: function(result){
            window.location.href = "/admin/suscripciones/"+NumeroCompleto+"/"+id+"";
          },
          error: function(err){
            console.log(err);
          }
            
        });
    });
  });

  $('.activarTlf').on('click', function(e){
    $target = $(e.target);
    const numero = $target.attr('data-numero');
      $.ajax({
        type:'POST',
        url:'/admin/activate/' + numero
      });
  });

   $('.desactivarTlf').on('click', function(e){
    $target = $(e.target);
    const numero = $target.attr('data-numero');
      $.ajax({
      type:'POST',
      url:'/admin/desactivate/' + numero
    });
  });

  $('.admin-delete').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    const numero = $target.attr('data-recipient')
    if(confirm('Quieres desactivar la suscripción?')){
      $.ajax({
        type:'POST',
        url:'/admin/eliminar-suscripcion/' + id + '/' + numero
      });
    }

  });

  $('.idx').on('click',function(e){
    $target = $(e.target);
    var value = $(this).attr('data-tlf');
    $('.verificar').attr('data-numero',value);
    console.log(value);
  });

  $('.idx1').on('click', function(e){
    $target = $(e.target);
    var shortcode = $(this).attr('shortcode');
    $('.cambiar-notificaciones').attr('data-shortcode',shortcode);
    var numero = $(this).attr('numero');
    $('.cambiar-notificaciones').attr('data-numero',numero);

  })

  $('.newpwd1').on('click', function(e){
    var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/;
    if((document.getElementById('password').value).length < 8){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"El mínimo de caracteres es de 8",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
    }
    else if(!(document.getElementById('password').value).match(regex)){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"La debe contener tanto números, letras minúsculas y mayúsculas y simbolos especiales",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
    }
    else if(document.getElementById('password').value != document.getElementById('password1').value){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        content:"Las contraseñas no coinciden",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
    }
  })

  $('.idx2').on('click', function(e){
    $target = $(e.target);
    var shortcode = $(this).attr('shortcode');
    $('.cambiar-notificaciones1').attr('data-shortcode',shortcode);
  })



//ESTO SE UTILIZA PARA VERIFICAR QUE EL CODIGO ES EL CORRECTO
  $('.check-code').on('click', function(e){
    var code = document.getElementById('codigo').value;

    //VALIDANDO INPUT QUE ESTE VACIO 
    $.smallBoxKill();
            $.smallBox({
              title:"¡No se encontro usuario!",
              content:"Este codigo de validacion no pertenece a ningun usuario.",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
    }); 
 
    $.ajax({
      type: 'POST',
      url: '/reenviarcontrasena/' + code,
       success: function(response, text, xhr) {
          console.log("Cambio de password para: \n",response);

          if(response.find == false){
            $.smallBoxKill();
            $.smallBox({
              title:"¡No se encontro usuario!",
              content:"Este codigo de validacion no pertenece a ningun usuario.",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            }); 
              e.preventDefault();
            }else {
              $.smallBoxKill();
              $.smallBox({
              title:"¿Desea restaurar contraseña?",
              content:""+response.nombre+" "+response.apellido,
              colortime:2000,
              colors:["#28A34F","#21AFAB"],
              buttons:["Continuar"],
              colortime:2000,
              sound: false,
              colors:["#28A34F","#21AFAB"],
            },function(action, button){
              window.location.href = "/tknuevacontrasena/"+response.id;
            });
            }
       }
    })
  });

//ESTO SE UTILIZA PARA ENVIAR EL MENSAJE DE TEXTO
  $('.enviar-sms').on('click', function(e){
    e.preventDefault();
    var operadora = document.getElementById('operadora').value;
    var telefono = document.getElementById('telefono').value;
    
    $.ajax({
      type: 'POST',
      url: '/recoverPass/'+operadora+'/'+telefono+'',
       success: function(data, text, xhr) {
         if(data == 'ERROR'){
            $.smallBoxKill();
            $.smallBox({
              title:"¡Numero no registrado!",
              content:"El numero no pertenece a ningun usuario.",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            }); 
              e.preventDefault();
            }else {
              $.smallBoxKill();
              $.smallBox({
              title:"¡Mensaje enviado!",
              content:"Revisa los mensajes en tu dispositivo movil.",
              colortime:2000,
              colors:["#28A34F","#21AFAB"],
              buttons:["Continuar"],
              colortime:2000,
              sound: false,
              colors:["#28A34F","#21AFAB"],
            },function(action, button){
              
              //window.location.href = "/auth/signin";
            });
            }
       }
    })
  });


//CHEK QUE EL CORREO INGRESADO POR USUARIO SE ENCUENTRE EN BBDD (RECUPERAR CONTRASEÑA)
  $('.enviar-correo').on('click', function(e){
    e.preventDefault();
    var correo = document.getElementById('correo').value;
    
    $.ajax({
      type: 'POST',
      url: '/RecoverPassEmail/' + correo,
       success: function(response, text, xhr) {
         if(response.find == false){
            $.smallBoxKill();
            $.smallBox({
              title: response.message,
              content:"Correo no asociado a ninguna cuenta",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            }); 
              e.preventDefault();
            }else {
              $.smallBoxKill();
              $.smallBox({
              title:"¡Correo enviado!",
              content:"Revisa tu bandeja de entrada.",
              colortime:2000,
              colors:["#28A34F","#21AFAB"],
              buttons:["Continuar"],
              colortime:2000,
              sound: false,
              colors:["#28A34F","#21AFAB"],
            },function(action, button){
              
              //window.location.href = "/auth/signin";
            });
            }
        }
       
    })
  });

//COMPARAR TOKEN INGRESADO Y TOKEN EN BBDD
 $('.check-token').on('click', function(e){
    e.preventDefault();
    var token = document.getElementById('token').value;
    
    $.ajax({
      type: 'POST',
      url: '/checkToken/'+token,
       success: function(response, text, xhr) {
         if(response.comparation == false){
            $.smallBoxKill();
            $.smallBox({
              title: response.message,
              content:"El token no esta registrado en el sistema.",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            }); 
              e.preventDefault();
            }else {
              $.smallBoxKill();
              $.smallBox({
              title:"¿Desea cambiar contraseña?",
              content:response.user.first_name+" "+response.user.last_name,
              colortime:2000,
              colors:["#28A34F","#21AFAB"],
              buttons:["Continuar"],
              colortime:2000,
              sound: false,
              colors:["#28A34F","#21AFAB"],
            },function(action, button){
              
              window.location.href = "/tknuevacontrasena/"+response.user.id;
            });
            }
        }
       
    })
  });







  $('.verificar').on('click',function(e){
    $target = $(e.target);
    const numero = document.getElementById('numero').value;
    var value = $(this).attr('data-numero');
    if(numero.length != 7){
      $.smallBoxKill();
      $.smallBox({
        title:"¡Código no válido!",
        width: 550,
        content:"Asegurate de colocar un código con al menos 7 caracteres",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
      e.preventDefault();
    } else {
      $.ajax({
      type:'POST',
      url:'/verificar/' + value + '/' + numero,
        success: function(data, text, xhr) {

            console.log(data);
            if(data == 'ERROR'){
            $.smallBoxKill();
            $.smallBox({
              title:"¡Código incorrecto!",
              content:"Asegurate de colocar bien el código",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            });	
              e.preventDefault();
              //window.location.href="/users/numeros"
            }else {
              $.smallBoxKill();
              $.smallBox({
              title:"¡Muy Bien!",
              content:"Tu teléfono está activo",
              colortime:2000,
              colors:["#28A34F","#21AFAB"],
              buttons:["Continuar"],
              colortime:2000,
              sound: false,
              colors:["#28A34F","#21AFAB"],
            },function(action, button){
              
              window.location.href = "/users/numeros";
            });
            }
        },
        error: function(err) {
            console.log('¡Error en la base de datos!');
        }
    });
    }

  });


  $('.cambiar-notificaciones').on('click',function(e){
    $target = $(e.target);
    var value = $(this).attr('data-numero');
    var shortcode = $(this).attr('data-shortcode');
    var numerovalue = document.getElementById('numero').value;
     if(!numerovalue.match(/^[0-9]+$/)){
      alert('Debes ingresar un número');
      e.preventDefault();
    }else {
      $.ajax({
        type: 'POST',
        url: '/admin/modificar/'+ shortcode + '/' + value + '/' + numerovalue
      })
    } 

  });

  $('.changeNotifications').on('click', function(e) {
    $target = $(e.target);
    const id_producto = $(this).attr('id-producto');
    const value = $(this).parent().find('.brother-input').val()

    $.ajax({
      type: 'PUT',
      url: '/admin/smspremium/' + id_producto + '/' + value,
      success: function(data, text, xhr){
        if(data == 'OK'){
          window.location.href = "/admin/notifications";
            
        }else {
          $.smallBox({
            title:"¡Error!",
            content:"Ocurrió algo inesperado..",
            colortime:2000,
            sound: false,
            colors:["#DE594C","#D0582A"],
          }); 
          e.preventDefault();
        }
      }
    })
  })

   $('.cambiar-notificaciones1').on('click',function(e){
    $target = $(e.target);
    var shortcode = $(this).attr('data-shortcode');
    var numerovalue = document.getElementById('numero').value;
     if(!numerovalue.match(/^[0-9]+$/)){
        $.smallBox({
          title:"¡Error!",
          content:"Debes ingresar un número valido",
          colortime:2000,
          sound: false,
          colors:["#DE594C","#D0582A"],
        }); 
      e.preventDefault();
    }else {
      $.ajax({
        type: 'PUT',
        url: '/admin/smspremium/' + shortcode + '/' + numerovalue,
        success: function(data, text, xhr){
          if(data == 'OK'){
            
              window.location.href = "/admin/notifications";
            
          }else {
            $.smallBox({
              title:"¡Error!",
              content:"Ocurrió algo inesperado..",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            });	
            e.preventDefault();
          }
        }
      })
    } 

  });

 $('.desactivated').on('click',function(e){
    $target = $(e.target);
    var value = $(this).attr('data-id');
    $.smallBoxKill();
    $.smallBox({
        title:"¡Cuidado!",
        width: 600,
        content:"Estas intentando desactivar un número telefónico, presiona en confirmar",
        colortime:2000,
        colors:["#DE594C","#D0582A"],
        buttons:["CONFIRMAR"],
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      },function(action, button){
       $.ajax({
         type: 'POST',
         url: '/admin/desactivate-email/' + value,
          success: function(result){
            window.location.href = "/admin/users";
          },
          error: function(err){
            console.log(err);
          }
            
        });
    });
 });

 $('.selectAllCustom').on('click', function() {
   if($(this).is(':checked')) {
    $('#example input:checkbox:not(:checked):not(:disabled)').prop('checked',true)
   } else {
     $('#example input:checkbox:checked:not(:disabled)').prop('checked',false)
   }
 })


$('.iniciar_suscripcion').on('click', function(){

    var suscripciones = new Array();
    var suscripcionesCompletadas = '';
    var inicioSuscripciones = new Array();
    var ajaxSend = false;
    var text = '';

    // console.log('elementos seleccionados : \n')

    var input = $('input[name="producto"]');
    input.each(function(index, element){
      suscripciones.push( $(element).attr("descripcion") );
      $(element).attr("id", index);
    });

    // $('#example').on('click', '.eliminar-suscripcion1', function(e)

    var x = $("input:checkbox:checked:not(:disabled)");
    if(x.length > 0) {

    $("#example input:checkbox:checked:not(:disabled)").each(function(){
      suscripcionesCompletadas+=( String($(this).attr("descripcion") ) + "<br>")
    })

      $.metroMessageBox({
        title: "Estas intentando suscribirte a los siguientes productos: ",
        content: suscripcionesCompletadas,
        buttons:["Confirmar","Cancelar"],
        icons:["fa-check", "fa-times"],
        activebutton: "#2C998E",
        sound: false
      },function(action, button){
      
        if(button == 'Cancelar') {
          $.smallBoxKill();
        } else {
          var clase = $('.selectpicker');
      // console.log($('.selectpicker'));
      clase.each(function(index, element){
        $(element).attr("id", "value" + (index));
      });

      var input = $('input[name="producto"]');
      input.each(function(index, element){
        $(element).attr("id", index);
      });

      if ($('input[name="producto"]').is(':checked:not(:disabled)')) {

          var i = 0;
        $('.checkbox:checked:not(:disabled)').each(
          function(){
            var numero = $("#value" + $(this).attr("id") ).val();
            var fin = (numero.search('-'));
            var operadorax = numero.substr(0, fin);
            var fin_operadoax = operadorax.search(' ');
            var operadorax = operadorax.substr(0, fin_operadoax)
            var operadoraux = $(this).attr('operadora');
            var fin_operadoaux = operadoraux.search(' ');
            var operadoraux = operadoraux.substr(0, fin_operadoax)
            var aux = operadoraux.localeCompare(operadorax);
            
            i++;
            // cadena.substr(inicio[, longitud])
            var comprobation = 1;

            for(i=0 ; i<operadoraux.length - 1; i++) {
              if(operadorax[i] != operadoraux[i]){
                comprobation = 0;
                break;
              }
            }

            if(comprobation == 1){
              $.smallBoxKill();

              $.ajax({
              type:'POST',
              url:'/suscribir/' + $(this).attr('data-id')+ '/' + numero + '/' + $(this).attr('cliente-id'),
              success: function(data, text, xhr){
                if(data == "OK") {
                  location.reload();
                } else {
                  $.smallBoxKill();
                  $.smallBox({
                    title:"¡Error!",
                    width: 500,
                    content:"Ya estás suscrito a este producto",
                    colortime:2000,
                    sound: false,
                    colors:["#DE594C","#D0582A"],
                  });	
                }
              },
              error: function(err){
                alert(err);
              }
            });

          } else{
              $.smallBoxKill();
              $.smallBox({
                title:"¡Error!",
                width: 500,
                content:"No puedes suscribirte a un producto con una operadora distinta",
                colortime:2000,
                sound: false,
                colors:["#DE594C","#D0582A"],
              });	
              event.preventDefault();
            } 
            
          }
        )
      } else {
        $.smallBoxKill();
        $.smallBox({
          title:"¡Error!",
          width: 300,
          content:"Debes seleccionar al menos 1 producto",
          colortime:2000,
          sound: false,
          colors:["#DE594C","#D0582A"],
        });	
      }
        }
      });
    } else {
      $.smallBoxKill();
      $.smallBox({
        title:"¡Error!",
        width: 300,
        content:"Debes seleccionar al menos 1 producto",
        colortime:2000,
        sound: false,
        colors:["#DE594C","#D0582A"],
      });	
    }




})

//MOSTRANDO ALERTA AL USUARIO SI TIENE ALGUN NUMERO SIN VERIFICAR
$(document).ready(function() {
  var path = window.location.pathname;
  if (path == "/home") {
    $.ajax({
      url: '/users/numeros/dashboard',
      type: 'GET',
    })
    .done(function(response) {
      //HACIENDO PUSH DE NUMEROS SIN VERIFICAR
      var sin_verificar = [];
        for (var i = 0; i < response.length; i++) {
          if (response[i].ACTIVO == 0) {sin_verificar.push(response[i]);}
        };
          if (sin_verificar.length > 0) toastr.info('Posee un numero sin verificar: <br>'+(sin_verificar[0].PREFIJO +'-'+ sin_verificar[0].TELEFONOS)+'','Ups!');
          if (sin_verificar.length== 0) toastr.success('Todos tus numeros se encuentran verificados y listos para suscribirse.','¡Felicitaciones!');
    });
  };
});

//CONTROLADOR PARA OBTENER NUMEROS EN EL DASHBOARD
$('.suscribe').on('click',function(e){
    $target = $(e.target);
    var id_producto = $(this).attr('id_producto');
    var id_cliente = $(this).attr('id_cliente');
    


      $.ajax({
        type: 'GET',
        url: '/users/numeros/dashboard',
        success: function(response, text, xhr){
          if(response){
            console.log(response);
            var buttons = {
              contenido: []
            };

            


            //ELIMINANDO NUMEROS QUE NO ESTEN VERIFICADOS
            for (var i = 0; i < response.length; i++) {
              if (response[i].ACTIVO == 0) {response.splice(i, 1)}
            };
          //HACIENDO PUSH DE NUMEROS PARA MOSTRARLOS COMO BOTONES
            for (var i = 0; i < response.length; i++) {
              buttons.contenido.push(response[i].PREFIJO+"-"+response[i].TELEFONOS);
            };
           



   $.metroMessageBox({
      title: "¡Elije el numero con el cual deseas suscribirte!",
      buttons:buttons.contenido,
      activebutton: "#2C998E",
      sound: false
    },function(action, button){
       //SUSCRIBIENDOME
       var Numero = button;
       var campos     = Numero.split('-');
       var Linea      = campos[0];
       var Recipiente = campos[1];
       var Product_id = id_producto;
       var Cliente_id = id_cliente;
       //DEBUG
       //console.log("Numero -> "+Numero+" Linea -> "+Linea+" Recipiente -> "+Recipiente);
       //console.log("Cliente_id ->> "+Cliente_id+"  Product_id ->>  "+Product_id);
       



       //SUSCRIBIENDOME (AJAX)
       $.ajax({
              type:'POST',
              url:'/suscribirDashboard/'+Product_id+'/'+Linea+'/'+Recipiente+'/'+Cliente_id,
              success: function(data, text, xhr){
                if(data == "OK") {
            $.smallBox({
              title:"¡Felicidades!",
              content:"Te suscribiste al producto seleccionado",
              colortime:2000,
              colors:["#28A34F","#21AFAB"],
              buttons:["Continuar"],  
              colortime:2000,
              sound: false,
              colors:["#28A34F","#21AFAB"],
            },function(action, button){
              location.reload();  
            }); 


                } else {
                  $.smallBoxKill();
                  $.smallBox({
                    title:"¡Error!",
                    width: 500,
                    content:"Ya estás suscrito a este producto",
                    colortime:2000,
                    sound: false,
                    colors:["#DE594C","#D0582A"],
                  }); 
                }
              },
              error: function(err){
                console.log(err);
              }
            });




       
    });




          }else {
            console.log("NO SE RECIBIERON DATOS");
          }
        },
        error: function(err){
          alert('error');
        }
      })
    

    

 })
 




 $('.activated').on('click',function(e){
    $target = $(e.target);
    var value = $(this).attr('data-id');
      $.ajax({
        type: 'POST',
        url: '/admin/activate-email/' + value,
        success: function(data, text, xhr){
          if(data == 'OK'){
            $.smallBoxKill();
            $.smallBox({
              title:"¡Muy Bien!",
              content:"El e-mail de activó correctamente, presiona en continuar",
              colortime:2000,
              width:500,
              colors:["#28A34F","#21AFAB"],
              buttons:["CONTINUAR"],
              colortime:2000,
              sound: false,
              colors:["#28A34F","#21AFAB"],
            },function(action, button){
              
              window.location.href = "/admin/users";
            });
          }else {
            $.smallBoxKill();
            $.smallBox({
              title:"¡Error!",
              content:"Ocurrió algo inesperado..",
              colortime:2000,
              sound: false,
              colors:["#DE594C","#D0582A"],
            });	
          }
        },
        error: function(err){
          alert('error');
        }
      })
    

    

 })
});
