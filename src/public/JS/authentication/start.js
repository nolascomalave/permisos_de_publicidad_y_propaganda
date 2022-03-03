function extractNumberInText(text){
	let extracto='';

	for(let i=0;i<text.length;i++){
		if(!isNaN(text.charAt(i)) && text.charAt(i)!=' '){
			extracto=extracto+text.charAt(i);
		}
	}

	return extracto;
}

function extractOnlyText(text){
	let extracto='';

	for(let i=0;i<text.length;i++){
		if(isNaN(text.charAt(i)) || text.charAt(i)==' '){
			extracto=extracto+text.charAt(i);
		}
	}

	return String(extracto);
}

function quitSpace(text){
	let extracto='';

	for(let i=0;i<text.length;i++){
		if(text.charAt(i)!=' '){
			extracto=extracto+text.charAt(i);
		}
	}

	return String(extracto);
}

function failPeticion(peticion, title, location){
	location=window.location.protocol+'//'+window.location.host+location;

	function deleted(){
		$('#errorsSection .errorPeticion').fadeOut(250);
		setTimeout(()=>{
			$('#errorsSection').html('');
		}, 250);
	}

	function difumed(){
		difumedError=setTimeout(()=>{
			deleted();
		}, 10000);
	}

	peticion.catch(()=>{
		$('#errorsSection').html(`
			<div class="errorPeticion">
				<center class="titleError" title='Click para "Cerrar"'>
					Error de conexión al `+title+`.
				</center>
				<p class="truncado urlError">
					<span class="underline" title="`+location+`">`+location+`</span>
				</p>
				<p class="truncado">
					<span class="underline">Estado:</span><span>  `+peticion.readyState+`.</span>
				</p>
				<p class="truncado">
					<span class="underline">Conexión:</span><span> `+peticion.status+`.</span>
				</p>
			</div>
		`);

		difumed();

		$('#errorsSection .errorPeticion').mouseover(()=>{
			clearInterval(difumedError);
		});

		$('#errorsSection .errorPeticion').mouseout(()=>{
			difumed();
		});

		$('#errorsSection .errorPeticion').click(()=>{
			deleted()
		});
	})
}

function confirm(message, funcion, alert){
	let clicked=false, timeNow=new Date(), idMessage='confirm'+String(timeNow.getFullYear())+String(timeNow.getMonth())+String(timeNow.getDate())+String(timeNow.getHours())+String(timeNow.getMinutes())+String(timeNow.getSeconds())+String(timeNow.getMilliseconds());

	function confirmed(){
		$('#'+idMessage).fadeOut();
		setTimeout(()=>{
			$('#'+idMessage).remove();
		}, 500);
	}

	let messageStructure=`
		<div class="message" id="`+idMessage+`">
			<div>
				<p>`+message+`</p>
				<button class="accept">Aceptar</button>`;

	if(alert!=true){
		messageStructure=messageStructure+`
			<button class="cancel">Cancelar</button>`;
	}
				
	messageStructure=messageStructure+`
				<span class="cleaner"></span>
			</div>
		</div>
	`;


	$('#message-section').append(messageStructure);

	$('#'+idMessage+' .accept').click(()=>{
		if(clicked==false){
			clicked=true;
			confirmed();
			if((typeof funcion)=='function'){
				funcion();
			}
		}
	});

	$('#'+idMessage+' .cancel').click(()=>{
		if(clicked==false){
			clicked=true;
			confirmed();
		}
	});
}

function sanitizeString(string){
	string=string.trim();
	let result='';
	for(let i=0; i<string.length; i++){
		switch (string.charAt(i)){
			case '<':
				result=result+'&lt;';
				break;
			case '>':
				result=result+'&gt;';
				break;
			case '"':
				result=result+'&quot;';
				break;
			default:
				result=result+string.charAt(i);
				break;
		}
	}

	return result;
}

function textFormat(input){
	let funcion=()=>{
		input.val(quitSpace(extractOnlyText(input.val())).toUpperCase());
	}

	funcion();
	input.keypress(()=>{
		funcion();
	}).keydown(()=>{
		funcion();
	}).keyup(()=>{
		funcion();
	});
}

$(document).ready(()=>{
	textFormat($('#username'));

	$('#start-form').submit((e)=>{
		e.preventDefault();
		$('#start-form .error').html('');
		let valid=true, indicador=sanitizeString($('#username').val()).toLowerCase(),
		password=sanitizeString($('#password').val());

		if(indicador.length<1){
			$('#usernameError').html('¡Debe introducir su indicador de usuario!');
			valid=false;
		}else if(indicador.length<3){
			$('#usernameError').html('¡El indicador debe contener, por lo menos, 3 letras!');
			valid=false;
		}else if(indicador.length>51){
			$('#usernameError').html('¡El indicador debe contener, como máximo, 51 letras!');
			valid=false;
		}else if(extractNumberInText(indicador).length>0){
			$('#usernameError').html('¡El indicador no debe contener números!');
			valid=false;
		}

		if(password.length<1){
			$('#passwordError').html('¡Debe introducir la contraseña!');
			valid=false;
		}else if(password.length<6){
			$('#passwordError').html('¡La contraseña debe contener, por lo menos, 6 caracteres!');
			valid=false;
		}else if(password.length>30){
			$('#passwordError').html('¡La contraseña no debe contener más de 30 caracteres!');
			valid=false;
		}

		if(valid==true){
			let dataSession=new FormData();
			dataSession.append('indicador', indicador);
			dataSession.append('password', password);

			let sessionLocation='/usuarios/login';
			let sessionPeticion=$.ajax({
				url: sessionLocation,
				type:'post',
				dataType:'json',
				data:dataSession,
				cache:false,
				contentType:false,
				processData:false
			}).then((response)=>{
				if('errno' in response){
					//alert('Error');
					confirm('¡Ha ocurrido un error al autenticar el usuario<br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.code+'</span>', null, true);
				}else{
					if(('password' in response) || ('indicador' in response)){
						if('password' in response){
							$('#passwordError').html(response.password);
						}

						if('indicador' in response){
							$('#usernameError').html(response.indicador);
						}
					}else if('success' in response){
						location.reload();
					}
				}
				$('#charger').hide();
			}).fail(()=>{
				$('#charger').hide();
			});

			failPeticion(sessionPeticion, '¡Ha ocurrido un error al establecer conexión con el servidor!', sessionLocation);
		}
	});
});