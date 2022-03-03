const fs=require('fs');

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

function destilde(name){
	let mal='áäàâéèêëíïîìóòôöúûùü', bien='aaaaeeeeiiiioooouuuu', abc='abcdefghijklmnñopqrstuvwxyz';

	name=name.toLowerCase().split('');

	for(let i=0; i<name.length;i++){
		for (let j = 0; j < mal.length; j++) {
			if(name[i]==mal.charAt(j)){
				name[i]=bien.charAt(j);
			}
		}
	}

	return name.join('');
}

function quitEnhe(texto){
	let string='';
	texto=texto.toLowerCase();
	for(let i=0; i<texto.length; i++){
		if(texto.charAt(i)!='ñ' && texto.charAt(i)!='Ñ'){
			string=string+texto.charAt(i);
		}else{
			string=string+'n';
		}
	}

	return string;
}

function busqueda(busqueda, place){
	countB=busqueda.length;
	countP=place.length;
	resultado=false;
	busqueda=destilde(busqueda.toLowerCase());
	place=destilde(place.toLowerCase());

	if(countB<countP){
		for(let i=0;i<countP-countB+1;i++){
			if(place.substring(i,i+(countB))==busqueda){
				resultado=true;
				break;
			}
		}
	}else if(busqueda==place){
		resultado=true;
	}

	return resultado;
}

function resaltSearch(busqueda, place){
	countB=busqueda.length;
	countP=place.length;
	exist=false;
	lowerBusqueda=sanitizeString(destilde(busqueda.toLowerCase().trim()));
	lowerPlace=sanitizeString(destilde(place.toLowerCase().trim()));
	resultado='';

	start=0;
	end=0;

	if(countB<countP){
		for(let i=0;i<countP-countB+1;i++){

			//if(lowerPlace.substring(i, i+(countB-1))==lowerBusqueda){
			if(lowerPlace.substring(i,i+(countB))==lowerBusqueda){
				exist=true;
				start=i;
				end=i+(countB-1);
				break;
			}
		}
		if(exist==true && lowerBusqueda.length>0){
			if(start==0){
				resultado='<i class="resaltSearch">'+place.substring(0, end+1)+'</i>';
			}else{
				resultado=place.substring(0, start);
				resultado=resultado+'<i class="resaltSearch">'+place.substring(start, end+1)+'</i>';
			}
			resultado=resultado+place.substring(end+1, place.length);
		}else{
			resultado=place;
		}
	}else{
		if(busqueda==place){
			exist=true;
			resultado='<i class="resaltSearch">'+place+'</i>';
		}else{
			resultado=place;
		}
	}

	return resultado;		
}

function quitFalseChars(text){
	let abc='abcdefghijklmnñopqrstuvwxyz1234567890', clearText='';

	text=text.toLowerCase();

	for (let i = 0; i < text.length; i++) {
		for(let j=0; j<abc.length;j++){
			if(text.charAt(i)==abc.charAt(j)){
				clearText=clearText+abc.charAt(j);
			}
		}
	}

	return clearText;
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

function quitSpace(text){
	let extracto='';

	for(let i=0;i<text.length;i++){
		if(text.charAt(i)!=' '){
			extracto=extracto+text.charAt(i);
		}
	}

	return String(extracto);
}

function adaptNum(num){
	let result='';
	//console.log(String(num).length);
	switch (String(num).length){
		case 1:
			result=String('00'+num);
			break;
		case 2:
			result=String('0'+num);
			break;
		default :
			result=String(num);
			break;
	}
	return result;
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

		//console.log(countDaysInYears);

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
	let day=date.substr(8,2), month='01';

	switch (date.substr(4,3).toLowerCase()){
		case 'jan':
			month='01';
			break;
		case 'feb':
			month='02';
			break;
		case 'mar':
			month='03';
			break;
		case 'apr':
			month='04';
			break;
		case 'may':
			month='05';
			break;
		case 'jun':
			month='06';
			break;
		case 'jul':
			month='07';
			break;
		case 'aug':
			month='08';
			break;
		case 'sep':
			month='09';
			break;
		case 'oct':
			month='10';
			break;
		case 'nov':
			month='11';
			break;
		case 'dec':
			month='12';
			break;
		default:
			month='01';
			break;

	}

	return day+'/'+month+'/'+date.substr(11,4);//date.substr(8,2)+'/'+date.substr(5,2)+'/'+date.substr(0,4);
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

function deleteFile(file){
	if(fs.existsSync(file)){
		fs.unlinkSync(file);
	}
}

function moveFiles(oldFile, newFile){
	if(fs.existsSync(oldFile)){
		let data=fs.readFileSync(oldFile);
		if(data){
			fs.writeFileSync(newFile, data);
			deleteFile(oldFile);
		}
	}
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

function isLetter(letter){
	let ascii = letter.toUpperCase().charCodeAt(0);
	return ascii > 64 && ascii < 91;
}

function isName(name){
	let valid=true;
	name=quitEnhe(destilde(name));
	for(let i=0; i<name.length; i++){
		if(!isNaN(name.charAt(i)) || isLetter(name.charAt(i))==false){
			valid=false;
		}
	}

	return valid;
}

function username(name, fname, arreglo){
	let abc='abcdefghijklmnñopqrstuvwxyz', username=quitEnhe(destilde(fname+name.charAt(0)).toLowerCase()), exist=false;

	for(let i=0; i<arreglo.length; i++){
		if(username==arreglo[i]){
			exist=true;
			break;
		}
	}

	if(exist==true){
		let count=1, uncount=1, iterations=[0];

		do{
			let add='';
			for(let i=0; i<iterations.length; i++){
				add=add+abc.charAt(iterations[i]);
			}

			username=username+add;

			for(let j=0; j<27; j++){
				exist=false;
				username=username.split('');
				username[username.length-1]=abc.charAt(j);
				username=username.join('');
				for(let i=0; i<arreglo.length; i++){
					if(username==arreglo[i]){
						exist=true;
						break;
					}
				}
				if(exist==false){
					break;
				}
			}

			if(exist==true){
				username=username.substring(0, fname.length+1);

				if(iterations.length>1){
					for(let i=iterations.length; i>0; i--){
						if(iterations[i-1]<26){
							iterations[i-1]++;
							break;
						}else{
							iterations[i-1]=0;
							if(i-1==0){
								iterations.push(0);
								break;
							}
						}
					}
				}else{
					iterations.push(0);
				}
			}
		}while(exist==true);
	}

	//console.log(arreglo);

	return username;
}

function numberEMonth(month){
	let result=null;

	month=month.toString();

	switch (month.toLowerCase()){
		case 'jan':
			result=1;
			break;
		case 'feb':
			result=2;
			break;
		case 'mar':
			result=3;
			break;
		case 'apr':
			result=4;
			break;
		case 'may':
			result=5;
			break;
		case 'jun':
			result=6;
			break;
		case 'jul':
			result=7;
			break;
		case 'aug':
			result=8;
			break;
		case 'sep':
			result=9;
			break;
		case 'oct':
			result=10;
			break;
		case 'nov':
			result=11;
			break;
		case 'dec':
			result=12;
			break;
		default:
			result=null;
			break;
	}

	return result;
}

function numberMonth(month){
	let result=null;

	switch (month.toLowerCase()){
		case 'enero':
			result=1;
			break;
		case 'febrero':
			result=2;
			break;
		case 'marzo':
			result=3;
			break;
		case 'abril':
			result=4;
			break;
		case 'mayo':
			result=5;
			break;
		case 'junio':
			result=6;
			break;
		case 'julio':
			result=7;
			break;
		case 'agosto':
			result=8;
			break;
		case 'septiembre':
			result=9;
			break;
		case 'octubre':
			result=10;
			break;
		case 'noviembre':
			result=11;
			break;
		case 'diciembre':
			result=12;
			break;
		default:
			result=null;
			break;
	}

	return result;
}

function convertToDate(fecha){
	fecha=fecha.toString().split(' ');
	return adaptNumDay(fecha[2])+'/'+adaptNumDay(numberEMonth(fecha[1]))+'/'+adaptNumDay(fecha[3]);
}

function renderizador(object, data){
	let objetos=data.match(/{{[^<>{]*[^<>}]}}/gi), objects=[];

	for(let i=0; i<objetos.length; i++){
		let objeto=sanitizeString(objetos[i].substring(2, objetos[i].length-3));

		if (objeto in object) {
			data=data.replace(eval('/{{[^<>]*'+objeto+'[^<>]*}}/gi'), eval('object.'+objeto));
		}
	}

	return data;
}

gf={
	puntoDigito,
	extractNumberInText,
	extractOnlyText,
	quitSpace,
	adaptNum,
	adaptNumDay,
	getDiferenceDays,
	getFormatedDate,
	militaryHours,
	hoursDay,
	convertMilitaryHours,
	deleteFile,
	moveFiles,
	busqueda,
	destilde,
	quitEnhe,
	quitFalseChars,
	resaltSearch,
	sanitizeString,
	firstUpper,
	firstCharName,
	isLetter,
	isName,
	username,
	renderizador,
	numberEMonth,
	numberMonth,
	convertToDate
}

//gf.validateStartDate('2021-03-22');

module.exports=gf;