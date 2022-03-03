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

function puntoDigito(number){

	number=extractNumberInText(number);

	if(number.length>0 && Number(number)==0){
		number='';
	}

	let numero='';
	for(let i=0;i<number.length;i++){
		if(number.charAt(i)!='.'){
			numero=numero+number.charAt(i);
		}
	}
	number=numero;

	let n=3;
	let x=0;
	if(number.length>n+x){
		if(number>999){
			number=number.split('');
			do{
				let j=n+x;
				let h=0;
				for(let i=0; i<=n+x; i++){
					let act=number.length-h;
					number[number.length-h]=number[act-1];
					h++;
				}
				x++;
				number[number.length-n-x]='.';
				n=n+3;
			}while(number.length>n+x);
			number=number.join('');
		}else{
			number=number;
		}
	}

	return number;
}

function isLetter(letter){
	let ascii = letter.toUpperCase().charCodeAt(0);
	return ascii > 64 && ascii < 91;
}

function idDocumentFormat(input){
	function validate(dom){
		if(isLetter(dom.val().charAt(0))!=true){
			dom.val(puntoDigito(dom.val()));
		}else{
			//dom.val(rifFormat(dom.val()));
		}
	}
	validate(input);
	input.keypress(()=>{
		validate(input);
	});input.keydown(()=>{
		validate(input);
	});input.keyup(()=>{
		validate(input);
	});
}

function firstUpper(name){
	let complete='';

	for(let i=0;i<name.length;i++){
		if(i==0){
			complete=complete+name.charAt(i).toUpperCase();
		}else{
			complete=complete+name.charAt(i).toLowerCase();
		}
	}

	return complete;
}

function firstCharName(name){
	name=name.split(' ');

	for(let i=0;i<name.length;i++){
		name[i]=firstUpper(name[i]);
	}

	name=name.join(' ');

	return name;
}

function insertName(id){
	id.keypress(()=>{
		id.val(firstCharName(extractOnlyText(id.val())));
	});id.keydown(()=>{
		id.val(firstCharName(extractOnlyText(id.val())));
	});id.keyup(()=>{
		id.val(firstCharName(extractOnlyText(id.val())));
	});
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

function deleteUser(username){

	confirm('¿Desea eliminar al usuario "'+username+'"?', ()=>{
		$('#charger').show().css('display', 'flex');
		let dataDelete=new FormData();
		dataDelete.append('username', username);

		let dataDeleteLocation='/usuarios/delete';
		let dataDeletePeticion=$.ajax({
			url: dataDeleteLocation,
			type:'post',
			dataType:'json',
			data:dataDelete,
			cache:false,
			contentType:false,
			processData:false
		}).then((response)=>{
			$('#charger').hide();
			if('errno' in response){
				confirm('¡Ha ocurrido un error al cancelar eliminar el registro del usuario<br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.code+'</span>', null, true);
			}else{
				confirm(response.success, ()=>{
					window.location=window.location;
				}, true);
			}
		}).fail(()=>{
			$('#charger').hide();
		});

		failPeticion(dataDeletePeticion);
	}, false);
}

$(document).ready(()=>{

	if(window.location.pathname=='/usuarios/' || window.location.pathname=='/usuarios'){
		for(let i=0; i<$('.user-card').length; i++){
			if($('#'+$('.user-card')[i].id+' .delete').length>0){
				$('#'+$('.user-card')[i].id+' .delete').click(()=>{
					deleteUser($('.user-card .delete')[i].id);
				});
			}
		}
	}else if(window.location.pathname=='/password/' || window.location.pathname=='/password'){
		
	}else{
		insertName($('input[name=nombre]'));
		insertName($('input[name=apellido]'));
		insertName($('input[name=cargo]'));

		idDocumentFormat($('input[name=cedula]'));
	}

	$('#charger').hide();
});



$('#closeSession').ready(()=>{
	$('#closeSession').click(()=>{
		confirm('¿Desea cerrar sesión?', ()=>{
			window.location=window.location.origin+'/close';
		});
	});
});