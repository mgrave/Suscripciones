var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo",
                       "Junio","Julio","Agosto","Septiembre","Octubre",
                       "Noviembre","Diciembre");
var f=new Date();
var a = $('p#fecha');

a.html(f.getDate() + " de " + meses[f.getMonth()] + " de " + f.getFullYear())
//document.write(f.getDate() + " de " + meses[f.getMonth()] + " de " + f.getFullYear());
