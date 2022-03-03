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

$('#closeSession').ready(()=>{
	$('#closeSession').click(()=>{
		confirm('¿Desea cerrar sesión?', ()=>{
			window.location=window.location.origin+'/close';
		});
	});
});