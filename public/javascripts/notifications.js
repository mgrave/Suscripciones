$(document).ready(function(){
		/*$.smallBox({
	  title:"¡Hay algo mal!",
	  content:"El número no es correcto",
	  colortime:2000,
	  colors:["#B00B10","#F1591B"],
	});	

		$.smallBox({
	  title:"¡Muy Bien!",
	  content:"Agregaste un nuevo número",
	  colortime:2000,
	  colors:["#0BB058","#5938E0"],
	});	*/

	if($('.notificar').length > 0){
		$.smallBoxKill();
		$.smallBox({
			position:4,
			title:"¡Bienvenido!",
			content:"Gracias por usar nuestros servicios!",
			fa:"fa-star-o",
			color:"#28A34F",
			sound: false,
		});
	}

	$('.empezar').on('click', function(e){
		$.smallBoxKill();
		$.metroSidePanel({
			position:2,
			title: "<h1><i class='fa fa-question-circle custom-help' aria-hidden='true'></i></h1><h3> Paso a paso : </h3> ",
			content: "1. Dirígete a la pestaña de teléfonos y agrega un nuevo numero<br><br>2. Verifica tu teléfono a través de un código que te enviaremos.<br><br>3. ¡Ya estas listo para suscribirte! <br> ",
			faloading: "fa-sun-o",
			backgroundcontent: "#18C1AF",
			timeout:50000,
		});
	})

	$('.nosotros').on('click', function(e){
		$.smallBoxKill();
		$.metroSidePanel({
			title: "<br>Insignia Mobile C.A.",
			content: "Mision<br><p class='font-minum'>En insignia somos la empresa de Desarrollo de Software enfocada en ofrecer servicios, soluciones y aplicaciones móviles y web, de alta disponibilidad (24/7), escalabilidad, confiabilidad e inmediatez, que aseguren la total satisfacción de nuestros clientes y usuarios finales.</p><br><br>Vision<br><p class='font-minum'>En insignia trabajamos para que todos los abonados móviles usen nuestras aplicaciones, y seamos identificados por la calidad en nuestros servicios y aplicaciones, y liderazgo en la innovación de aplicaciones para el manejo de información interactiva.</p><br><br>Valores<br><p class='font-minum'>Satisfacción de nuestros clientes y usuarios. Cumplimiento de fechas de entrega. Calidad de productos y servicios. Responsabilidad social. Proactividad. Trabajo en equipo.</p>",
			faloading: "fa-sun-o",
			backgroundcontent: "#18C1AF",
			timeout:25000,
		});
	})

});
