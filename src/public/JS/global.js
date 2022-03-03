const socket=io();
var difumedError, hoy=new Date(), dateNow=hoy, overFloatObject=false, floatObjectShow=false, comprobanteEdit='';

function busqueda(busqueda, place){
	countB=busqueda.length;
	countP=place.length;
	resultado=false;
	busqueda=busqueda.toLowerCase();
	place=place.toLowerCase();

	if(countB<countP){
		for (let i = 0; i < countP-countB+1; i++) {
			if(place.substr(i,i+(countB-1))==busqueda){
				resultado=true;
				break;
			}
		}
	}else{
		if(busqueda==place){
			resultado=true;
		}
	}

	return resultado;
}

function getId(node){
	return node.attributes['id'].textContent;
}

function convertDom(node){
	return $('#'+getId(node));
}

function sizeRecort(size){
	size=size.substr(0,size.length-2);
	return size;
}

function getIndex(texto, index){
	let result=[], count=0;
	for(let i=0; i<texto.length; i++){
		if(texto.charAt(i)==index){
			result[count]=i;
			count++;
		}
	}

	if(result.length<1){
		result=false;
	}

	return result;
}

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

function validateCi(ci){
	let result='', valid=false;
	ci=ci.trim();

	for(let i=0; i<ci.length; i++){
		if(ci.charAt(i)!='.'){
			result=result+ci.charAt(i);
		}
	}

	if(!Number(result)==false){
		valid=true;
	}

	return valid;
}

function isLetter(letter){
	let ascii = letter.toUpperCase().charCodeAt(0);
	return ascii > 64 && ascii < 91;
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

function adaptNum(num){
	switch (num.length){
		case 1:
			num='00'+num;
			break;
		case 2:
			num='0'+num;
			break;
		default :
			num=num;
			break;		
	}
	return num;
}

function adaptNumDay(num){
	let result='';
	//console.log(String(num).length);
	switch (String(num).length){
		case 1:
			result=String('0'+num);
			break;
		default :
			result=String(num);
			break;
	}
	return result;
}

function validatePhone(phone){
	let tlf='', valid=false;

	for(let i=0; i<phone.length;i++){
		if(phone.charAt(i)!=' '){
			tlf=tlf+phone.charAt(i);
		}
	}
	phone=tlf;
	tlf='';

	if(phone.length>0){
		for(let i=0; i<phone.length; i++){
			if(tlf.charAt(i)=='+' || Number(phone)){
				tlf=tlf+phone.charAt(i);
			}
		}

		phone=tlf;

		if((phone.length==11 && !Number(phone)==false) || ((phone.length==11 || phone.length==14 || phone.length==13) && (phone.charAt(0)=='+' || !Number(phone.charAt(0))==false) && (!Number(phone.substr(phone.charAt(1), phone.length-1))==false))){
			valid=true;
		}
	}

	return valid;
}

/*function rifFormat(rif){
	let format='';
	console.log(rif.substr(3, rif.length-1));

	for(let i=0;i<rif.length;i++){
		if(rif.length<=2 && !Number(rif.charAt(0))){
			format=format+rif.charAt(i)+'-';
		}else if(rif.length>2){
			if(isLetter(rif.charAt(0)) && rif.charAt(1)=='-'){
				if(rif.length<11 && Number(rif.substr(2, rif.length-1))){
					if (rif.length==10) {
						format=format+'-';
					}else{
						format=format+rif.charAt(i);
					}
				}else if(Number(rif.charAt(11))){
					format=format+rif.charAt(i);
				}
			}
		}
	}

	return format;
}*/

function idDocumentFormat(input){
	function validate(dom){
		if(isLetter(dom.val().charAt(0))!=true){
			dom.val(puntoDigito(dom.val()));
		}else{
			//dom.val(rifFormat(dom.val()));
		}
	}
	input.keypress(()=>{
		validate(input);
	});input.keydown(()=>{
		validate(input);
	});input.keyup(()=>{
		validate(input);
	});
}

function validateRif(rif){
	let valid=false;
	rif=rif.trim();

	if(rif.length==12){
		if((rif.charAt(0).toUpperCase()=='J' || rif.charAt(0).toUpperCase()=='V' || rif.charAt(0).toUpperCase()=='E' || rif.charAt(0).toUpperCase()=='P' || rif.charAt(0).toUpperCase()=='G') && rif.charAt(1)=='-' && Number(rif.substr(2, 8)) && rif.charAt(10)=='-' && Number(rif.charAt(11))){
			valid=true;
		}else{
			valid=false;
		}
	}else{
		valid=false;
	}
	return valid;
}

/*function VerifRIF(RIF){
	//
	// Función JavaScript VerifRIF Versión 1, 18/Marzo/2002
	// Recibe el Numero de RIF sin separadores y devuelve
	// True si el RIF es correcto
	//
	var SumRIF;
	var NumRif;
	NumRif = RIF
	var cadena = new Array();
	if (NumRif.length == 10)
	{
	for (i = 0; i < 10; i++)
	{
	cadena[i] = NumRif.substr(i,1);
	}
	cadena[0] = 0;
	if ((NumRif.substr(0,1) == "V")||(NumRif.substr(0,1) == "v")) cadena[0] = 1
	if ((NumRif.substr(0,1) == "E")||(NumRif.substr(0,1) =="e")) cadena[0] = 2
	if ((NumRif.substr(0,1) == "J")||(NumRif.substr(0,1) == "j")) cadena[0] = 3
	if ((NumRif.substr(0,1) == "P")||(NumRif.substr(0,1) == "p")) cadena[0] = 4
	if ((NumRif.substr(0,1) == "G")||(NumRif.substr(0,1) == "g")) cadena[0] = 5
	cadena[0] = cadena[0] * 4
	cadena[1] = cadena[1] * 3
	cadena[2] = cadena[2] * 2
	cadena[3] = cadena[3] * 7
	cadena[4] = cadena[4] * 6
	cadena[5] = cadena[5] * 5
	cadena[6] = cadena[6] * 4
	cadena[7] = cadena[7] * 3
	cadena[8] = cadena[8] * 2
	SumRIF = cadena[0] + cadena[1] + cadena[2] + cadena[3] +
	cadena[4] + cadena[5] + cadena[6] + cadena[7] + cadena[8];
	EntRIF = parseInt(SumRIF/11);
	Residuo = SumRIF - (EntRIF * 11)
	DigiVal = 11 - Residuo;
	if (DigiVal > 9)
	DigiVal = 0;
	if (DigiVal == cadena[9])
	return true;
	else
	return false;
	}
	else return false;
}*/

function insertName(id){
	id.keypress(()=>{
		id.val(firstCharName(extractOnlyText(id.val())));
	});id.keydown(()=>{
		id.val(firstCharName(extractOnlyText(id.val())));
	});id.keyup(()=>{
		id.val(firstCharName(extractOnlyText(id.val())));
	});
}

function validateLeapYear(year){
	let fecha=new Date(), leapYear=2020, valid=false;
	if(year<=leapYear){
		for(let i=leapYear; i>=year; i=i-4){
			if(i==year){
				valid=true;
			}
		}
	}else{
		for(let i=leapYear; i<=year; i=i+4){
			if(i==year){
				valid=true;
			}
		}
	}

	return valid;
}

/*function evalDates(date1, date2){
	let arreglo=[date1, date2];

	return arreglo.sort();
}*/

function getDiferenceDays(date1, date2){
	let fecha=new Date(), dateParam1={
		day: Number(date1.substr(8, 2)),
		month: Number(date1.substr(5, 2)),
		year: Number(date1.substr(0, 4))
	}, dateParam2={
		day: Number(date2.substr(8, 2)),
		month: Number(date2.substr(5, 2)),
		year: Number(date2.substr(0, 4))
	}, daysInMonth=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	let countDays1=0, arrayDays1=[], countDays2=0, arrayDays2=[], diferenceYears=0, diferenceDays;

	dateParam1.daysMonth=daysInMonth;
	dateParam2.daysMonth=daysInMonth;

	if(validateLeapYear(dateParam1.year)){
		dateParam1.daysMonth[1]=29;
	}
	if(validateLeapYear(dateParam2.year)){
		dateParam2.daysMonth[1]=29;
	}

	function getDays(dateParam, arrayDays, countDays){
		if(dateParam.month>1){
			for(let i=0; i<dateParam.month-1; i++){
				if(i>1){
					arrayDays[i]=dateParam.daysMonth[i];
				}else{
					arrayDays[i]=dateParam.daysMonth[i];
				}
			}
			if(dateParam.month>1){
				arrayDays[arrayDays.length]=dateParam.day;
			}
			for(let i=0; i<arrayDays.length; i++){
				countDays=countDays+arrayDays[i];
			}
		}else{
			countDays=dateParam.day;
		}
		return countDays;
	}


	countDays1=getDays(dateParam1, arrayDays1, countDays1);
	countDays2=getDays(dateParam2, arrayDays2, countDays2);

	if(dateParam2.year>dateParam1.year || dateParam2.year<dateParam1.year){
		let countDaysInYears=0;

		diferenceYears=dateParam1.year-dateParam2.year;

		if(diferenceYears>=1){
			for(let i=0; i<diferenceYears; i++){
				if(validateLeapYear(dateParam1.year-i+1)){
					countDaysInYears=countDaysInYears+366;
				}else{
					countDaysInYears=countDaysInYears+365;
				}
			}

			let restDay=365-countDays2;
			if(validateLeapYear(dateParam2.year)){
				restDay=366-countDays2;
			}

			if(validateLeapYear(dateParam1.year)){
				diferenceDays=countDaysInYears-(365-countDays1)+restDay;
			}else{
				diferenceDays=countDaysInYears-countDays1+(365-countDays2);
			}
		}else if(diferenceYears<=-1){
			for(let i=0; i>diferenceYears; i--){
				if(validateLeapYear(dateParam1.year+i-1)){
					countDaysInYears=countDaysInYears+366;
				}else{
					countDaysInYears=countDaysInYears+365;
				}
			}

			let restDay=365-countDays2;
			if(validateLeapYear(dateParam2.year)){
				restDay=366-countDays2;
			}

			if(validateLeapYear(dateParam1.year)){
				diferenceDays=countDaysInYears+(365-countDays1)-restDay;
			}else{
				diferenceDays=countDaysInYears+countDays1-(365-countDays2);
			}
		}

	}else{
		diferenceDays=countDays1-countDays2;
	}

	let result={
		diferenceYears,
		diferenceDays
	}
	
	return result;
}

function getFormatedDate(date){
	date=date.toString();
	return adaptNumDay(date.substr(8,2))+'/'+adaptNumDay(date.substr(5,2))+'/'+adaptNumDay(date.substr(0,4));
}

function militaryHours(){
	let horas=[];

	for(let i=0; i<24; i++){
		//horas=horas+'<option value="'+adaptNumDay(i)+':00">'+adaptNumDay(i)+':00</option>';
		//horas=horas+'<option value="'+adaptNumDay(i)+':30">'+adaptNumDay(i)+':30</option>';
		horas.push(adaptNumDay(i)+':00');
		horas.push(adaptNumDay(i)+':30');
	}

	return horas;
}

function hoursDay(){
	let hours=militaryHours(), horas=[];
	for(let i=0; i<hours.length; i++){
		switch(Number(hours[i].substring(0,2))){
			case 0:
				horas.push(adaptNumDay(12)+hours[i].substring(2,hours[i].length)+' a.m.');
				break;
			case 12:
				horas.push(adaptNumDay(12)+hours[i].substring(2,hours[i].length)+' m.');
				break;
			case 13:
				horas.push(adaptNumDay(1)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 14:
				horas.push(adaptNumDay(2)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 15:
				horas.push(adaptNumDay(3)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 16:
				horas.push(adaptNumDay(4)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 17:
				horas.push(adaptNumDay(5)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 18:
				horas.push(adaptNumDay(6)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 19:
				horas.push(adaptNumDay(7)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 20:
				horas.push(adaptNumDay(8)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 21:
				horas.push(adaptNumDay(9)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 22:
				horas.push(adaptNumDay(10)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			case 23:
				horas.push(adaptNumDay(11)+hours[i].substring(2,hours[i].length)+' p.m.');
				break;
			default:
				horas.push(hours[i]+' a.m.');
				break;
		}
	}

	return horas;
}

function convertMilitaryHours(hour){
	let hora='';

	if(hour.substring(0,2)=='12'){
		if(hour.length>8){
			hora='00'+hour.substring(2,5);
		}else{
			hora='12'+hour.substring(2,5);
		}
	}else{
		if(hour.substring(6,10)=='p.m.'){
			switch(Number(hour.substring(0, 2))){
				case 1:
					hora='13'+hour.substring(2,5);
					break;
				case 2:
					hora='14'+hour.substring(2,5);
					break;
				case 3:
					hora='15'+hour.substring(2,5);
					break;
				case 4:
					hora='16'+hour.substring(2,5);
					break;
				case 5:
					hora='17'+hour.substring(2,5);
					break;
				case 6:
					hora='18'+hour.substring(2,5);
					break;
				case 7:
					hora='19'+hour.substring(2,5);
					break;
				case 8:
					hora='20'+hour.substring(2,5);
					break;
				case 9:
					hora='21'+hour.substring(2,5);
					break;
				case 10:
					hora='22'+hour.substring(2,5);
					break;
				case 11:
					hora='23'+hour.substring(2,5);
					break;
			}
		}else{
			hora=hour.substring(0,5);
		}
	}
	return hora;
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

function formSectionResize(form, more){
	let actualForm=form.attr('id');
	if(sizeRecort($('#'+actualForm+' .contenedor').css('height')) > window.innerHeight*0.9){
		$('#'+actualForm+' .contenedor section').css('height', sizeRecort($('#'+actualForm+' .contenedor').css('height'))-sizeRecort($('#'+actualForm+' .contenedor header').css('height')));
	}else{
		$('#'+actualForm+' .contenedor section').css('height', '100%');
	}
}

// Función que muestra y oculta el selector del comprobante del permiso cuando se requiere la firma de la DAT.
function dat_firma_form(checkbox, content, edit){
	let contentId=content.attr('id'), inputId=$('#'+contentId+' input').attr('id');
	if(checkbox[0].checked==true){
		$('#'+contentId+', #'+inputId+'Error').slideDown(500);
		if(edit==false){
			$('#'+inputId).attr('required','');
		}
	}else{
		$('#'+contentId+', #'+inputId+'Error').slideUp(500);
		if(edit==false){
			$('#'+inputId).removeAttr('required');
		}
	}
}

function validateOptionCheck(option, value, checkbox){
	if(value==1 || value=='1'){
		option.removeClass('fa-times').addClass('fa-check');
		checkbox[0].checked=1;
	}else{
		option.removeClass('fa-check').addClass('fa-times');
		checkbox[0].checked=0;
	}
}

function addCheck(dataForm, check, title){
	dataForm.append(title, check[0].checked);
}

function selectAllChecks(check, form){
	let formId=form.attr('id');
	check.change(()=>{
		if(check[0].checked==1){
			for(let i=1; i<$('#'+formId+' .check').length-1; i++){
				$('#'+formId+' .check input')[i].checked=true;
			}
		}else{
			for(let i=1; i<$('#'+formId+' .check').length-1; i++){
				$('#'+formId+' .check input')[i].checked=false;
			}
		}
	});
}

function knowAllSelect(check, slector, form){
	let formId=form.attr('id'), funcion=()=>{
		let all=true;
		for(let i=1; i<$('#'+formId+' .check').length-1; i++){
			if($('#'+formId+' .check input')[i].checked==0){
				all=false;
			}
		}
		if(all==true){
			slector[0].checked=true;
		}else{
			slector[0].checked=false;
		}
	};

	funcion();
	check.change(()=>{
		funcion();
	});
}

function showOtherService(check, input){
	if(check[0].checked==true){
		check[0].parentNode.childNodes[3].innerHTML='Otros:<span class="obligatory">*</span>';
		input.attr('required','').slideDown();
	}else{
		check[0].parentNode.childNodes[3].innerHTML='Otros:'
		input.removeAttr('required').slideUp();
	}
}

function showNewForm(boton){
	boton.click(()=>{
		$('#viewSection').fadeIn();
		$('#newItemForm').css('display','flex').fadeIn();
		$('#newItemForm .contenedor section').css('height', sizeRecort($('#newItemForm .contenedor').css('height'))-sizeRecort($('#newItemForm .contenedor header').css('height')));
		$('#habilitacion').focus();
	});
}

function showViewForm(item){
	item.click(()=>{
		$('#viewSection').fadeIn();
	});
}

// Función para comprobar el archivo seleccionado como comprobante:
function comprobanteValue(comprobante){
	let comprobanteId=comprobante.attr('id');

	$('#'+comprobanteId+'Error').html('');
	if(comprobante.val().length>0){
		let file=comprobante[0].files[0];

		if(file.type!='application/pdf'){
			$('#'+comprobanteId+'Error').html('¡El archivo seleccionado debe estar en formato "PDF"!');
			valid=false;
		}else{
			if(file.size>10000000){
				$('#'+comprobanteId+'Error').html('¡El archivo seleccionado debe pesar menos de 10 megabytes!');
				valid=false;
			}
		}
	}
}

// Función que muestra el nombre del archivo seleccionado commo comprobante del permiso.
function haveValue(id, edit){
	let title='Agregar', floatTitle='Agregar Comprobante';

	if(edit==true){
		title='Cambiar';
		floatTitle='Cambiar Comprobante';
	}

	id=id.attr('id');
	if($('#'+id+' input')[0].files.length>0){
		$('#'+id+' div span').html($('#'+id+' input')[0].files[0].name);
		$('#'+id+' div').attr('title', $('#'+id+' input')[0].files[0].name);
	}else{
		$('#'+id+' div span').html(title);
		$('#'+id+' div').attr('title', floatTitle);
	}
	comprobanteValue($('#'+id+' input'));
}

// Función para obtener los datos del permiso registrado:
function getItem(item, url, callback){
	itemId=extractNumberInText(item.attr('id'));
	$('#charger').show().css('background', 'rgba(250,250,250,0.75)');

	let message='obtener la información del permiso', data=new FormData();
	data.append('id', itemId);
	let getItemPeticion=$.ajax({
		url: url,
		type:'post',
		dataType:'json',
		data:data,
		cache:false,
		contentType:false,
		processData:false
	});

	getItemPeticion.then((response)=>{
		$('#editItemForm').attr('value', response.result.id);
		callback(response);
		$('#charger').hide();
	}).catch(()=>{
		$('#charger').hide();
	});

	failPeticion(getItemPeticion, message, url);
}

function cancelEmit(url, callback){
	$('#charger').show().css('background', 'rgba(250,250,250,0.75)');
	let emitionData=new FormData();
	emitionData.append('permiso', $('#editItemForm').attr('value'));
	emitionData.append('observacion', sanitizeString($('#observation-cancel').val().trim()));

	let emitPeticion=$.ajax({
		url: url,
		type:'post',
		dataType:'json',
		data:emitionData,
		cache:false,
		contentType:false,
		processData:false
	});

	emitPeticion.then((response)=>{
		formSectionResize($('#viewItemForm'));
		callback(response);
		$('#charger').hide();
	}).catch(()=>{
		$('#charger').hide();
	});

	failPeticion(emitPeticion, 'realizar el proceso de cancelación del permiso', url);
}

function cancelPermitForm(url, receptor){
	if($('#observation-cancel').val().trim().length>0){
		if($('#observation-cancel').val().trim().length<10){
			$('#observation-cancelError').html('¡Debe introducir, por lo menos 10 caractéres que justifiquen la cancelación del permiso!');
		}else if($('#observation-cancel').val().trim().length>250){
			$('#observation-cancelError').html('¡La máxima cantidad de caractéres aceptada es de 250!');
		}else{
			confirm('¡Una vez cancelado el permiso no podrá habilitarse nuevamente, ¿confirma la cancelación del permiso?!', ()=>{
				cancelEmit(url, (response)=>{
					if('errno' in response){
						confirm('¡Ha ocurrido un error al cancelar la emisión del permiso<br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.code+'</span>', null, true);
					}else{
						closeCancelation();

						let socketReceptor=receptor+':cancel-permiso';
						socket.emit(socketReceptor, {
							permiso: response.permiso,
							id: socket.id,
							socket:socketReceptor
						});
						confirm(response.success, null, true);
					}
				});
			});
		}
	}else{
		$('#observation-cancelError').html('¡Debe introducir la una observación que justifique la cancelación del permiso!');
	}
}

function aprobateItem(url, callback){
	let valid=true, aprobaterFile=$('#aprobateItemSelector')[0].files[0];

	if(aprobaterFile.type!='application/pdf'){
		$('#aprobateItemSelectorError').html('¡El archivo seleccionado debe estar en formato "PDF"!');
		valid=false;
	}else{
		if(aprobaterFile.size>10000000){
			$('aprobateItemSelectorError').html('¡El archivo seleccionado debe pesar menos de 10 megabytes!');
			valid=false;
		}
	}

	if(valid==true){
		confirm('¡Una vez registrado el archivo seleccionado, éste comprobará la validéz del permiso y no prodrá editarse más!', ()=>{
			$('#charger').show().css('background', 'rgba(250,250,250,0.75)');
			let aprobateData=new FormData();

			aprobateData.append('permiso_aprobado', aprobaterFile);
			aprobateData.append('permiso', $('#editItemForm').attr('value'));

			let sendAprobateFile=$.ajax({
				url: url,
				type:'post',
				dataType:'json',
				data:aprobateData,
				cache:false,
				contentType:false,
				processData:false
			});

			sendAprobateFile.then((response)=>{

				callback(response);

				$('#charger').hide();
			}).catch(()=>{
				$('#charger').hide();
			});
			failPeticion(sendAprobateFile, 'realizar el proceso de aprobación del permiso', url);
		});
	}
}

/*function comprobanteButton(comprobante){
	let comprobanteId=comprobante.attr('id'), overObject=true;
	$('#'+comprobanteId+' button').click(()=>{
		$('#'+comprobanteId+' .optionsButtons').show();
	});

	$('#'+comprobanteId+' .optionsButtons, #'+comprobanteId+' button').mouseover(()=>{
		overObject=true;
	}).mouseout(()=>{
		overObject=false;
	});

	$('body, html').click(()=>{
		if(overObject==false){
			$('#'+comprobanteId+' .optionsButtons').hide();
		}
	});
}*/

function closeAprobation(){
	$('#aprobatePermiso').fadeOut(250);
	$('#aprobatePermiso input').val('');
	setTimeout(()=>{
		$('#aprobatePermiso').attr('title', '');
		$('#aprobatePermiso .title').html('¡Introduzca una copia del Permiso firmado y sellado!');
		$('#aprobatePermiso .error').html('');
		$('#aprobatePermiso .inputFile div p').html('');
		$('#sendAprobate').hide();
	}, 250);
}

function closeCancelation(){
	$('#cancelPermit').fadeOut(250);
	setTimeout(()=>{
		$('#cancelPermit form .error').html('');
		$('#cancelPermit form textarea').val('');
	},250);
}

function searchItems(url, url2){
	let location='';
	location=window.location+url.substr(url.lastIndexOf('/'), url.length-(url.lastIndexOf('/')-1));
	if($('#statusPermit').val()!='Todos' || $('#searcher').val().trim().length>0){
		$('#cleanerSearch').show();
		let searchData=new FormData(), messageNotFound='Todos los permisos';

		if($('#statusPermit').val()=='No Emitido'){
			messageNotFound='Permisos no emitidos';
		}else if($('#statusPermit').val()=='Emitido'){
			messageNotFound='Permisos emitidos';
		}

		searchData.append('estado', $('#statusPermit').val());
		searchData.append('busqueda', sanitizeString($('#searcher').val().trim()));

		let searchPeticion=$.ajax({
			url: url,
			type:'post',
			dataType:'json',
			data:searchData,
			cache:false,
			contentType:false,
			processData:false
		});

		searchPeticion.then((response)=>{
			if(('errno' in response)==false){
				if(response.plantilla.length>0){
					if($('#searcher').val().trim().length>0){
						$('#searchSection header').html('Resultados de búsqueda para "<span>'+messageNotFound+': '+sanitizeString($('#searcher').val().trim())+'</span>":').show();
					}else{
						$('#searchSection header').html('Resultados de búsqueda para "<span>'+messageNotFound+'</span>":').show();
					}
					$('#searchSection blockquote').html(response.plantilla);
					for(let i=0; i<$('#searchSection .item').length; i++){
						convertDom($('#searchSection .item')[i]).click(()=>{
							getItem(convertDom($('#searchSection .item')[i]), url2, getItemFunction);
						});
					}
				}else{
					$('#searchSection header').hide();
					$('#searchSection blockquote').html(`
						<div class="notFound">
							<p>No hay resultados de búsqueda para:</p>
							<span>`+messageNotFound+`: "`+sanitizeString($('#searcher').val().trim())+`"</span>
						</div>
					`);
				}
				$('#searchSection').show();
				$('#itemsSection').hide();
			}else{
				$('#searchSection blockquote').html(`
					<div class="notFound">
						<p>
							¡Ha ocurrido un error al obtener los dátos desde la base de datos!
						</p>
						<b style="color:none;text-decoration:underline;">
							Código de Error:
						</b>
						<span style="color:black;"> `+response.errno+`</span>
					</div>
				`);
				$('#searchSection header').hide();
				$('#searchSection').show();
				$('#itemsSection').hide();
			}
		}).fail(()=>{
			$('#searchSection header').hide();
			$('#searchSection blockquote').html(`
				<div class="notFound">
					<p>¡Error de conexión con el servidor a través de la ruta "`+location+`"!</p>
				</div>
			`);
			$('#searchSection').show();
			$('#itemsSection').hide();
		});
	}else{
		$('#cleanerSearch').hide();
		$('#searchSection').hide();
		$('#searchSection header').html('');
		$('#searchSection blockquote').html('');
		$('#itemsSection').show();
	}

}

$(document).ready(()=>{
	console.log('¡JQuery Cargado!');

	//comprobanteButton($('#infComprobante'));

	showNewForm($('#add, #addFirst'));

	$('#buscador').submit((e)=>{
		e.preventDefault();
	});

	idDocumentFormat($('#requisitorDoc'));
	insertName($('#requisitorNombre'));
	insertName($('#requisitorApellido'));
	idDocumentFormat($('#editRequisitorDoc'));
	insertName($('#editRequisitorNombre'));
	insertName($('#editRequisitorApellido'));

	haveValue($('#comprobanteContent'), false);
	$('#comprobanteContent input').change((e)=>{
		haveValue($('#comprobanteContent'), false);
	});
	$('#editComprobanteContent input').change((e)=>{
		haveValue($('#editComprobanteContent'), true);
	});

	dat_firma_form($('#dat-firma-content input'), $('#comprobanteContent'), false);
	$('#dat-firma-content input').change((e)=>{
		dat_firma_form($('#dat-firma-content input'), $('#comprobanteContent'), false);
	});

	dat_firma_form($('#edit-dat-firma'), $('#editComprobanteContent'), true);
	$('#edit-dat-firma').change((e)=>{
		dat_firma_form($('#edit-dat-firma'), $('#editComprobanteContent'), true);
	});

	$('#newItemForm header button').click(()=>{
		let haveDateForm=false, checkbox='';
		for(let i=0; i<$('#viewSection input').length; i++){
			let input=convertDom($('#viewSection input')[i]);

			if(input.attr('type')=='checkbox'){
				checkbox=input;
			}else{
				if(input.attr('type')=='file' && input[0].files.length>0){
					if(checkbox!='' && checkbox.is(':checked')){
						haveDateForm=true;
					}
				}else if(input.val().length>0){
					haveDateForm=true;
				}
			}
		}

		for(let i=0; i<$('#viewSection textarea').length; i++){
			let textarea=convertDom($('#viewSection textarea')[i]);

			if(textarea.val().length>0){
				haveDateForm=true;
			}
		}

		if(haveDateForm==true){
			confirm('¡Tiene celdas llenas del formulario actual que, al cerrar, se limpiarán! ¿Desea cerrar de todas formas?', ()=>{
				$('#viewSection, #newItemForm').fadeOut(250);
				setTimeout(()=>{
					$('#dat-firma')[0].checked=0;
					dat_firma_form($('#dat-firma-content input'), $('#comprobanteContent'), false);

					for(let i=0; i<$('#viewSection input').length; i++){
						let input=convertDom($('#viewSection input')[i]);

						if(input.attr('type')!='checkbox'){
							input.val('');
						}
					}

					for(let i=0; i<$('#viewSection textarea').length; i++){
						convertDom($('#viewSection textarea')[i]).val('');
					}

					for(let i=0; i<$('#viewSection input[type="checkbox"]').length; i++){
						let input=convertDom($('#viewSection input[type="checkbox"]')[i])[0];
						input.checked=0;
					}

					for(let i=0; i<$('#viewSection select').length; i++){
						let selectId=convertDom($('#viewSection select')[i]).attr('id');
						convertDom($('#viewSection select')[i]).val($('#'+selectId+' option')[0].innerHTML);
					}
					haveValue($('#comprobanteContent'), false);
				},250);
			});
		}else{
			$('#viewSection, #newItemForm').fadeOut(250);
			setTimeout(()=>{
				for(let i=0; i<$('#viewSection input[type="checkbox"]').length; i++){
					let input=convertDom($('#viewSection input[type="checkbox"]')[i])[0];
					input.checked=0;
				}

				for(let i=0; i<$('#viewSection select').length; i++){
					let selectId=convertDom($('#viewSection select')[i]).attr('id');
					convertDom($('#viewSection select')[i]).val($('#'+selectId+' option')[0].innerHTML);
				}

				for(let i=0; i<$('#viewSection input[type="checkbox"]').length; i++){
					let input=convertDom($('#viewSection input[type="checkbox"]')[i])[0];
					input.checked=0;
				}

				$('#dat-firma')[0].checked=0;
				dat_firma_form($('#dat-firma-content input'), $('#comprobanteContent'), false);
			},250);
		}
	});

	$('#viewItemForm header button').click(()=>{
		$('#editItemForm').removeAttr('value');
		$('#viewSection, #viewItemForm').fadeOut(250);
		setTimeout(()=>{
			$('#viewItemForm .commentCancelation').html('').hide();
			$('#viewItemForm section nav').html('');
			$('#viewItemForm section .status').html('');
			$('#viewItemForm section .comprobanteButton').remove();

			$('#edit-dat-firma')[0].checked=0;
			//dat_firma_form($('#edit-dat-firma-content input'), $('#editComprobanteContent'));

			for(let i=0; i<$('#viewSection input').length; i++){
				let input=convertDom($('#viewSection input')[i]);

				if(input.attr('type')!='checkbox'){
					input.val('');
				}
			}
			
			for(let i=0; i<$('#viewSection input[type="checkbox"]').length; i++){
				let input=convertDom($('#viewSection input[type="checkbox"]')[i])[0];
				input.checked=0;
			}

			for(let i=0; i<$('#viewSection select').length; i++){
				let selectId=convertDom($('#viewSection select')[i]).attr('id');
				convertDom($('#viewSection select')[i]).val($('#'+selectId+' option')[0].innerHTML);
			}

			for(let i=0; i<$('#viewSection textarea').length; i++){
				convertDom($('#viewSection textarea')[i]).val('');
			}
			haveValue($('#editComprobanteContent'), true);
		}, 250);
	});

	$('#aprobatePermiso form .close').click(()=>{
		closeAprobation();
	});
	$('#aprobatePermiso input').change(()=>{
		if($('#aprobatePermiso input').val().length>0){
			$('#aprobatePermiso .title').html('Archivo seleccionado:');
			$('#aprobatePermiso').attr('title', $('#aprobatePermiso input')[0].files[0].name);
			$('#aprobatePermiso .inputFile div p').html($('#aprobatePermiso input')[0].files[0].name);
			$('#sendAprobate').slideDown(150);
			comprobanteValue($('#aprobateItemSelector'));
		}else{
			$('#aprobatePermiso .inputFile div p').html('');
			$('#aprobatePermiso').attr('title', '');
		}
	});

	$('#cancelPermit form .close').click(()=>{
		closeCancelation();
	});

	$('#charger').hide();

	formSectionResize($('#newItemForm'));
	formSectionResize($('#viewItemForm'));
	$(window).resize(()=>{
		formSectionResize($('#newItemForm'));
		formSectionResize($('#viewItemForm'));
	});
});

$('#closeSession').ready(()=>{
	$('#closeSession').click(()=>{
		confirm('¿Desea cerrar sesión?', ()=>{
			window.location=window.location.origin+'/close';
		});
	});
});