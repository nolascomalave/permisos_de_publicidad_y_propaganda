function getItemFunction(response){
	let today=adaptNumDay(hoy.getDate())+'/'+adaptNumDay(hoy.getMonth()+1)+'/'+adaptNumDay(hoy.getFullYear());
	//console.log(response);
	if('errno' in response.result){
		confirm('¡Ha ocurrido un error al obtener los datos del permiso seleccionado!<br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.result.code+'</span>', null, true);
	}else{
		let compareDate=[today, response.result.habilitacion];
		compareDate.sort();
		$('#creador i').html(response.result.creador);
		if(response.result.editor.length>0){
			$('#editor i').html(response.result.editor);
			$('#editor').show();
		}else{
			$('#editor').hide();
		}

		$('#viewItemForm section nav').append(`
			<a id="printItem" href="/eventos_especiales/permiso/eventos-especiales_`+response.result.codigo_permiso+`" target="_blank">
				<button title="Imprimir Permiso">
					<i class="li-icon fas fa-print"></i>
				</button>
			</a>
		`);
		if(response.result.emitido==0){
			if(response.usuario.tipo_usuario=="Desarrollador" || response.usuario.tipo_usuario=="Administrador"){
				$('#printItem').before(`
					<button title="Editar" id="editItem">
						<i class="li-icon fas fa-pen-square"></i>
					</button>
				`);
			}

			$('#viewItemForm section nav').append(`
				<button title="Aprobar Permiso" id="aprobateItem">
					<i class="li-icon fas fa-check-square"></i>
				</button>
			`);

			$('#aprobateItem').click(()=>{
				$('#aprobatePermiso').fadeIn(250).css('display', 'flex');
				$('#aprobateItemSelector')[0].focus();
			});
		}
		$('#viewItemForm section nav').append(`
			<button title="Regresar" id="backEdit">
				<i class="li-icon fas fa-arrow-left"></i>
			</button>
		`);

		if(response.result.emitido==1){
			if(response.result.cancelado==0){
				$('#viewItemForm section .status').append(`
					<div class="emited">Emitido</div>
				`);
			}
		}else{
			$('#viewItemForm section .status').append(`
				<div class="noEmited">No Emitido</div>
			`);
		}
		comprobanteEdit=response.result.comprobante_de_pago;
		$('#infHabilitacion').html(getFormatedDate(response.result.habilitacion));
		$('#infCodigoPermiso').html(response.result.codigo_permiso);
		$('#infVencimiento').html(getFormatedDate(response.result.vencimiento));
		$('#infHorario').html(response.result.horario);
		$('#infRequisitor').html(response.result.requisitor_nombre+` `+response.result.requisitor_apellido);
		$('#infRequisitorDoc').html(response.result.requisitor_doc);
		$('#infRequisitorTlf').html(response.result.requisitor_tlf);
		$('#infRequisitorHabitacion').html(response.result.requisitor_habitacion);
		$('#infSector').html(response.result.sector_permisado);
		$('#infEvento').html(response.result.nombre_evento);
		$('#infTipoEvento').html(response.result.tipo_evento);
		$('#editOtrosService').val(response.result.servicio_otros);
		$('#editNombreEvento').val(response.result.nombre_evento);

		validateOptionCheck($('#servicesComida i'), response.result.servicio_comida, $('#editComidasService'));
		validateOptionCheck($('#servicesBebidas i'), response.result.servicio_bebidas, $('#editBebidasService'));
		validateOptionCheck($('#servicesConfiteria i'), response.result.servicio_confiteria, $('#editConfiteriaService'));
		validateOptionCheck($('#servicesVarios i'), response.result.servicio_articulos_varios, $('#editVariosService'));
		validateOptionCheck($('#servicesHeladeria i'), response.result.servicio_heladeria, $('#editHeladeriaService'));

		if(response.result.servicio_otros.length>0){
			$('#servicesOtros i').removeClass('fa-times').addClass('fa-check');
			$('#servicesOtros .inf').html(response.result.servicio_otros);
			$('#editActivateOtrosService')[0].checked=1;
		}else{
			$('#servicesOtros .inf').html(response.result.servicio_otros);
			$('#servicesOtros i').removeClass('fa-check').addClass('fa-times');
			$('#editActivateOtrosService')[0].checked=0;
		}


		showEventType($('#editTipoEvento'), $('#editOtroEventoContent'));
		showOtherService($('#editActivateOtrosService'), $('#editOtrosService'));

		if(response.result.dat_confirmacion==1){
			$('#viewItemForm section .status div').before(`
				<div class="needDat">
					<i class="li-icon fas fa-exclamation"></i>
					Necesita Firma de la DAT.
				</div>
			`);

			$('#viewItemForm section #viewEdit').append(`
				<div class="comprobanteButton" id="infComprobante">
					<center class="centerFlex">
						<a href="/server-files/asuntos_publicos/permisos_municipales/eventos/`+response.result.comprobante_de_pago+`" target="_blank">
							<button class="centerFlex" title="Ver Comprobante de Pago" id="pagoComprobanteButton">
								<i class="li-icon fas fa-file-pdf"></i>
							</button>
						</a>
					</center>
					<label><b>Comprobante de Pago</b></label>
				</div>
			`);
		}

		if(response.result.emitido==1){
			if(response.result.cancelado==0){
				$('#printItem').remove();
				if(response.usuario.tipo_usuario=="Desarrollador" || response.usuario.tipo_usuario=="Administrador"){
					$('#viewItemForm section nav').append(`
						<button id="cancelEmition" title="Cancelar Permiso">
							<i class="li-icon fas fa-window-close"></i>
						</button>
					`);
				}
				$('#viewItemForm section #viewEdit').append(`
					<div class="comprobanteButton">
						<center class="centerFlex">
							<a href="/server-files/asuntos_publicos/permisos_municipales/eventos/`+response.result.permiso_autorizado+`" target="_blank">
								<button class="centerFlex" title="Ver Permiso Aprobado">
									<i class="li-icon fas fa-file-pdf"></i>
								</button>
							</a>
						</center>
						<label><b>Permiso Autorizado</b></label>
					</div>
				`);
			}else{
				$('#printItem').remove();
				$('#viewItemForm section .status').append(`
					<div class="needDat">
						Cancelado
					</div>
				`);

				$('.commentCancelation').html(`
					<p>`+response.result.observacion+`</p>
				`).show();
			}
		}

		$('#editItem').click(()=>{
			$('#editHabilitacion').val(response.result.habilitacion.substring(0,10));
			$('#editVencimiento').val(response.result.vencimiento.substring(0,10));
			if(response.result.dat_confirmacion==1){
				$('#edit-dat-firma')[0].checked=true;
			}else{
				$('#edit-dat-firma')[0].checked=false;
			}
			dat_firma_form($('#edit-dat-firma-content input'), $('#editComprobanteContent'), true);
			$('#editRequisitorNombre').val(response.result.requisitor_nombre);
			$('#editRequisitorApellido').val(response.result.requisitor_apellido);
			$('#editRequisitorDoc').val(response.result.requisitor_doc);
			$('#editTlfRequisitor').val(response.result.requisitor_tlf);
			$('#editHabitacionRequisitor').val(response.result.requisitor_habitacion);
			$('#editSector').val(response.result.sector_permisado);

			$('#viewItemForm .status, #viewEdit').slideUp(500);
			$('#editerForm').slideDown(500);
			$('#viewItemForm nav button, #printItem').hide();
			$('#backEdit').show();
			$('#editComprobanteContent input').val('');
			haveValue($('#editComprobanteContent'), true);
			$('#editHabilitacion').focus();
		});$('#backEdit').click(()=>{
			$('#viewItemForm .status, #viewEdit').slideDown(500);
			$('#viewItemForm nav button, #printItem').show();
			$('#editerForm').slideUp(500);
			$('#backEdit').hide();
		});

		$('#cancelEmition').click(()=>{
			$('#cancelPermit').fadeIn().css('display', 'flex');
		});

		$('#viewItemForm nav button, #viewItemForm .status, #viewEdit').show();
		$('#editerForm, #backEdit').hide();
		$('#viewItemForm').css('display', 'flex').show();
		$('#viewSection').fadeIn();
		formSectionResize($('#viewItemForm'));
	}
}

function showEventType(select, content){
	let contentId=content.attr('id');
	if(select.val()=='Otro'){
		$('#'+contentId+' input').attr('required','');
		content.slideDown();
	}else{
		$('#'+contentId+' input').removeAttr('required');
		content.slideUp();
	}
}

$(document).ready(()=>{

	searchItems('/eventos_especiales/search', '/eventos_especiales/get');
	$('#statusPermit').change(()=>{
		searchItems('/eventos_especiales/search', '/eventos_especiales/get');
	});
	$('#searcher').keyup(()=>{
		searchItems('/eventos_especiales/search', '/eventos_especiales/get');
	});
	$('#cleanerSearch').click(()=>{
		$('#statusPermit').val('Todos');
		$('#searcher').val('');
		searchItems('/eventos_especiales/search', '/eventos_especiales/get');
	});

	$('#add, #addFirst').click(()=>{
		showEventType($('#tipoEvento'), $('#otroEventoContent'));
		showOtherService($('#activateOtrosService'), $('#otrosService'));
		showEventType($('#editTipoEvento'), $('#editOtroEventoContent'));
		showOtherService($('#editActivateOtrosService'), $('#editOtrosService'));
	});

	showEventType($('#tipoEvento'), $('#otroEventoContent'));
	$('#tipoEvento').change(()=>{
		showEventType($('#tipoEvento'), $('#otroEventoContent'));
	});

	for(let i=1; i<$('#newItemForm .check').length-1; i++){
		knowAllSelect($('#'+$('#newItemForm .check input')[i].attributes['id'].nodeValue), $('#selectAllService'), $('#newItemForm'));
	}
	selectAllChecks($('#selectAllService'), $('#newItemForm'));
	showOtherService($('#activateOtrosService'), $('#otrosService'));
	$('#activateOtrosService').click(()=>{
		showOtherService($('#activateOtrosService'), $('#otrosService'));
	});

	showEventType($('#editTipoEvento'), $('#editOtroEventoContent'));
	$('#editTipoEvento').change(()=>{
		showEventType($('#editTipoEvento'), $('#editOtroEventoContent'));
	});

	for(let i=1; i<$('#viewItemForm .check').length-1; i++){
		knowAllSelect($('#'+$('#viewItemForm .check input')[i].attributes['id'].nodeValue), $('#editSelectAllService'), $('#viewItemForm'));
	}
	selectAllChecks($('#editSelectAllService'), $('#viewItemForm'));
	showOtherService($('#editActivateOtrosService'), $('#editOtrosService'));
	$('#editActivateOtrosService').click(()=>{
		showOtherService($('#editActivateOtrosService'), $('#editOtrosService'));
	});

	$('#itemForm').submit((e)=>{
		e.preventDefault();
		$('#itemForm .error').html('');
		$('#newItemForm .contenedor section').animate({
			scrollTop: 0
		}, 500);


		//console.log(validatePhone($('#tlfRequisitor').val().trim()));

		let habilitacion=$('#habilitacion').val().trim(),
		vencimiento=$('#vencimiento').val().trim(),
		horarioInicio=$('#horarioInicio').val().trim(),
		horarioFin=$('#horarioFin').val().trim(),
		nombre=sanitizeString($('#requisitorNombre').val().trim()),
		apellido=sanitizeString($('#requisitorApellido').val().trim()),
		idDocument=sanitizeString(firstUpper($('#requisitorDoc').val().trim())),
		tlf=sanitizeString($('#tlfRequisitor').val().trim()),
		habitacion=sanitizeString($('#habitacionRequisitor').val().trim()),
		sector=sanitizeString($('#sector').val().trim()),
		nombreEvento=sanitizeString($('#nombreEvento').val().trim());
		comprovateServices=false;

		let valid=true;

		// Validación de Fechas:---------------------------------
		if(habilitacion==''){
			$('#habilitacionError').html('¡Debe introducir una fecha!');
			valid=false;
		}else{
			let today=dateNow.getFullYear()+'-'+adaptNumDay(dateNow.getMonth()+1)+'-'+adaptNumDay(dateNow.getDate()), diferenceDay=getDiferenceDays(habilitacion, today);
			if(diferenceDay.diferenceDays<-3){
				$('#habilitacionError').html('¡La fecha de habilitación del permiso no debe ser de más de 3 días antes del día de hoy!');
				valid=false;
			}else if(diferenceDay.diferenceDays>30){
				$('#habilitacionError').html('¡No se puede registrar el permiso con más de 30 días de adelanto!');
				valid=false;
			}
		}if(vencimiento==''){
			$('#vencimientoError').html('¡Debe introducir una fecha!');
			valid=false;
		}else{
			let diference=getDiferenceDays(vencimiento, habilitacion);
			if(diference.diferenceYears<=-1){
				$('#vencimientoError').html('¡La fecha de vencimiento no debe preceder la fecha de habilitación!');
				valid=false;
			}else{
				if(diference.diferenceDays<0){
					$('#vencimientoError').html('¡La fecha de habilitación no debe ser después de la fecha de vencimiento!');
					valid=false;
					//$('#habilitacionError').html('¡La fecha de habilitación no debe exceder los 3 días de retraso!');
				}else if(diference.diferenceDays>90){
					$('#vencimientoError').html('¡El permiso no debe permanecer vigente por más de 90 días!');
					valid=false;
				}
			}
		}
		//-------------------------------------------

		if(Number(extractNumberInText(convertMilitaryHours(horarioInicio).substring(0,5)))>Number(extractNumberInText(convertMilitaryHours(horarioFin).substring(0,5)))){
			if(getDiferenceDays(vencimiento, habilitacion).diferenceDays<1){
				$('#horarioError').html('¡La hora de habilitación del permiso no puede ser mayor a la hora de su fin si el evento solo dura un día!');
				valid=false;
			}
		}

		if(idDocument.length<1){
			$('#requisitorDocError').html('¡Debe introducir un RIF o Número de Cédula del Requisitor!');
			valid=false;
		}else{
			if(!Number(idDocument.charAt(0))==false && validateCi(idDocument)==false){
				$('#requisitorDocError').html('¡Debe introducir un RIF o Número de Cédula válido!');
				valid=false;
			}else{
				if(validateRif(idDocument)==false && isLetter(idDocument)==true){
					$('#requisitorDocError').html('¡Debe introducir un RIF o Número de Cédula válido!');
					valid=false;
				}
			}
		}

		if(tlf.length<1){
			$('#tlfRequisitorError').html('¡Debe introducir un número telefónico!');
			valid=false;
		}else if(validatePhone(tlf)==false){
			$('#tlfRequisitorError').html('¡Debe introducir un número telefónico válido!');
			valid=false;
		}

		if(habitacion.length>0){
			if(habitacion.length<5){
				$('#habitacionRequisitorError').html('¡La Dirección de la Habitación debe contener, como mínimo, 5 caractéres!');
				valid=false;
			}else if(habitacion.length>1000){
				$('#habitacionRequisitorError').html('¡La Dirección de la Habitación debe contener, como máximo, 1000 caractéres!');
				valid=false;
			}
		}else{
			$('#habitacionRequisitorError').html('¡Debe introducir la Dirección de Habitación del Requisitor!');
			valid=false;
		}

		if($('#tipoEvento').val()=='Otro'){
			if($('#otroEvento').val().trim().length<1){
				$('#otroEventoError').html('¡Debe introducir el tipo de evento!');
				valid=false;
			}else{
				if($('#otroEvento').val().trim().length<5){
					$('#otroEventoError').html('¡El tipo de evento debe contener, por lo menos, 5 caractéres!')
					valid=false;
				}else if($('#otroEvento').val().trim().length>100){
					$('#otroEventoError').html('¡El tipo de evento debe contener, máximo, 100 caractéres!')
					valid=false;
				}
			}
		}

		if(nombreEvento.length<1){
			$('#nombreEventoError').html('¡Debe introducir el nombre del evento!');
			valid=false;
		}else{
			if(nombreEvento.length<5){
				$('#nombreEventoError').html('¡El nombre del evento debe ser descrito por 5 caractéres o más!');
				valid=false;
			}else if(nombreEvento.length>76){
				$('#nombreEventoError').html('¡El nombre del evento debe ser descrito por 76 caractéres o menos!');
				valid=false;
			}
		}

		for(let i=1; i<$('#newItemForm .check').length; i++){
			if($('#newItemForm .check input')[i].checked==1){
				comprovateServices=true;
			}
		}
		console.log(comprovateServices);
		if(comprovateServices==false){
			$('#otrosServiceError').html('Debe seleccionar un tipo de servicio');
			valid=false;
		}

		if($('#activateOtrosService')[0].checked==1){
			if($('#otrosService').val().trim().length<1){
				$('#otrosServiceError').html('¡Debe introducir el tipo de servicio!');
				valid=false;
			}else{
				if($('#otrosService').val().trim().length<5){
					$('#otrosServiceError').html('¡El servicio debe ser descrito, por lo menos, por 5 caractéres!');
					valid=false;
				}else if($('#otrosService').val().trim().length>100){
					$('#otrosServiceError').html('¡El servicio debe ser descrito por menos de 100 caractéres!');
					valid=false;
				}
			}
		}

		if($('#dat-firma-content input').is(':checked')){
			let comprobante=$('#comprobante')[0].files[0];

			if($('#comprobante').val().length>0){
				if(comprobante.type!='application/pdf'){
					$('#comprobanteError').html('¡El archivo seleccionado debe estar en formato "PDF"!')
					valid=false;
				}else{
					if(comprobante.size>10000000){
						$('#comprobanteError').html('¡El archivo seleccionado debe pesar menos de 10 megabytes!')
						valid=false;
					}
				}
			}else{
				$('#editComprobanteError').html('¡Debe seleccionar un el comprobante de pago en formato "PDF"!');
			}
		}


		if(valid==true){
			$('#charger').show().css('background', 'rgba(250,250,250,0.75)');
			
			let newPermiso=new FormData();
			newPermiso.append('today', adaptNumDay(hoy.getFullYear())+'-'+adaptNumDay(hoy.getMonth()+1)+'-'+adaptNumDay(hoy.getDate()));
			newPermiso.append('horario', horarioInicio+' - '+horarioFin);
			newPermiso.append('habilitacion', habilitacion);
			newPermiso.append('vencimiento', vencimiento);
			newPermiso.append('nombre', nombre);
			newPermiso.append('apellido', apellido);
			newPermiso.append('idDocument', idDocument);
			newPermiso.append('tlf', tlf);
			newPermiso.append('habitacion', habitacion);
			newPermiso.append('sector', sector);
			newPermiso.append('nombre_evento', nombreEvento);


			if($('#tipoEvento').val()=='Otro'){
				newPermiso.append('tipo_evento', sanitizeString($('#otroEvento').val().trim()));
			}else{
				newPermiso.append('tipo_evento', $('#tipoEvento').val());
			}
			addCheck(newPermiso, $('#comidasService'), 'servicio_comida');
			addCheck(newPermiso, $('#bebidasService'), 'servicio_bebidas');
			addCheck(newPermiso, $('#confiteriaService'), 'servicio_confiteria');
			addCheck(newPermiso, $('#variosService'), 'servicio_varios');
			addCheck(newPermiso, $('#heladeriaService'), 'servicio_heladeria');

			if($('#activateOtrosService')[0].checked==0){
				newPermiso.append('servicio_otros', '');
			}else{
				newPermiso.append('servicio_otros', $('#otrosService').val());
			}

			if($('#dat-firma-content input').is(':checked')){
				newPermiso.append('comprobante', $('#comprobante')[0].files[0]);
			}
			let newPermisoPeticionLocation='/eventos_especiales/add';
			let newPermisoPeticion=$.ajax({
				url: newPermisoPeticionLocation,
				type:'post',
				dataType:'json',
				data:newPermiso,
				cache:false,
				contentType:false,
				processData:false
			});

			newPermisoPeticion.then((response)=>{
				console.log(response);
				if('errno' in response){
					if(response.code=='ERRDATE'){
						confirm('¡Ha ocurrido un error al registrar el archivo <br> <span style="text-decoration:underline;">La fecha de su computador es distinta a la fecha de hoy (Fecha Actual: '+response.date+')</span>', null, true);
					}else{
						confirm('¡Ha ocurrido un error al registrar el archivo <br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.code+'</span>', null, true);
					}
				}else{
					socket.emit('eventos:nuevo-permiso', {
						permiso: response.permiso
					});

					$('#viewSection, #newItemForm').fadeOut();
					confirm('¡Se ha registrado correctamente el permiso!', null, true);
				}
				$('#charger').hide();
			}).catch(()=>{
				$('#charger').hide();
			});

			failPeticion(newPermisoPeticion, 'registrar el permiso', newPermisoPeticionLocation);
		}

		//confirm('prueba', null, true);
	});

	$('#editItemForm').submit((e)=>{
		e.preventDefault();
		$('#editItemForm .error').html('');
		$('#viewItemForm .contenedor section').animate({
			scrollTop: 0
		}, 500);


		//console.log(validatePhone($('#tlfRequisitor').val().trim()));

		let habilitacion=$('#editHabilitacion').val().trim(),
		vencimiento=$('#editVencimiento').val().trim(),
		horarioInicio=$('#editHorarioInicio').val().trim(),
		horarioFin=$('#editHorarioFin').val().trim(),
		nombre=sanitizeString($('#editRequisitorNombre').val().trim()),
		apellido=sanitizeString($('#editRequisitorApellido').val().trim()),
		idDocument=sanitizeString(firstUpper($('#editRequisitorDoc').val().trim())),
		tlf=sanitizeString($('#editTlfRequisitor').val().trim()),
		habitacion=sanitizeString($('#editHabitacionRequisitor').val().trim()),
		sector=sanitizeString($('#editSector').val().trim()),
		nombreEvento=sanitizeString($('#editNombreEvento').val().trim());
		comprovateServices=false;

		let valid=true;

		// Validación de Fechas:---------------------------------
		if(habilitacion==''){
			$('#editHabilitacionError').html('¡Debe introducir una fecha!');
			valid=false;
		}else{
			let today=dateNow.getFullYear()+'-'+adaptNumDay(dateNow.getMonth()+1)+'-'+adaptNumDay(dateNow.getDate()), diferenceDay=getDiferenceDays(habilitacion, today);
			if(diferenceDay.diferenceDays<-3){
				$('#editHabilitacionError').html('¡La fecha de habilitación del permiso no debe ser de más de 3 días antes del día de hoy!');
				valid=false;
			}else if(diferenceDay.diferenceDays>30){
				$('#editHabilitacionError').html('¡No se puede registrar el permiso con más de 30 días de adelanto!');
				valid=false;
			}
		}if(vencimiento==''){
			$('#editVencimientoError').html('¡Debe introducir una fecha!');
			valid=false;
		}else{
			let diference=getDiferenceDays(vencimiento, habilitacion);
			if(diference.diferenceYears<=-1){
				$('#editVencimientoError').html('¡La fecha de vencimiento no debe preceder la fecha de habilitación!');
				valid=false;
			}else{
				if(diference.diferenceDays<0){
					$('#editVencimientoError').html('¡La fecha de habilitación no debe ser después de la fecha de vencimiento!');
					valid=false;
					//$('#habilitacionError').html('¡La fecha de habilitación no debe exceder los 3 días de retraso!');
				}else if(diference.diferenceDays>90){
					$('#editVencimientoError').html('¡El permiso no debe permanecer vigente por más de 90 días!');
					valid=false;
				}
			}
		}
		//-------------------------------------------

		if(Number(extractNumberInText(convertMilitaryHours(horarioInicio).substring(0,5)))>Number(extractNumberInText(convertMilitaryHours(horarioFin).substring(0,5)))){
			if(getDiferenceDays(vencimiento, habilitacion).diferenceDays<1){
				$('#editHorarioError').html('¡La hora de habilitación del permiso no puede ser mayor a la hora de su fin si el evento solo dura un día!');
				valid=false;
			}
		}

		if(idDocument.length<1){
			$('#editRequisitorDocError').html('¡Debe introducir un RIF o Número de Cédula del Requisitor!');
			valid=false;
		}else{
			if(!Number(idDocument.charAt(0))==false && validateCi(idDocument)==false){
				$('#editRequisitorDocError').html('¡Debe introducir un RIF o Número de Cédula válido!');
				valid=false;
			}else{
				if(validateRif(idDocument)==false && isLetter(idDocument)==true){
					$('#editRequisitorDocError').html('¡Debe introducir un RIF o Número de Cédula válido!');
					valid=false;
				}
			}
		}

		if(tlf.length<1){
			$('#editTlfRequisitorError').html('¡Debe introducir un número telefónico!');
			valid=false;
		}else if(validatePhone(tlf)==false){
			$('#editTlfRequisitorError').html('¡Debe introducir un número telefónico válido!');
			valid=false;
		}

		if(habitacion.length>0){
			if(habitacion.length<5){
				$('#editHabitacionRequisitorError').html('¡La Dirección de la Habitación debe contener, como mínimo, 5 caractéres!');
				valid=false;
			}else if(habitacion.length>1000){
				$('#editHabitacionRequisitorError').html('¡La Dirección de la Habitación debe contener, como máximo, 1000 caractéres!');
				valid=false;
			}
		}else{
			$('#editHabitacionRequisitorError').html('¡Debe introducir la Dirección de Habitación del Requisitor!');
			valid=false;
		}

		if($('#editTipoEvento').val()=='Otro'){
			if($('#editOtroEvento').val().trim().length<1){
				$('#editOtroEventoError').html('¡Debe introducir el tipo de evento!');
				valid=false;
			}else{
				if($('#editOtroEvento').val().trim().length<5){
					$('#editOtroEventoError').html('¡El tipo de evento debe contener, por lo menos, 5 caractéres!')
					valid=false;
				}else if($('#editOtroEvento').val().trim().length>100){
					$('#editOtroEventoError').html('¡El tipo de evento debe contener, máximo, 100 caractéres!')
					valid=false;
				}
			}
		}

		if(nombreEvento.length<1){
			$('#editNombreEventoError').html('¡Debe introducir el nombre del evento!');
			valid=false;
		}else{
			if(nombreEvento.length<5){
				$('#editNombreEventoError').html('¡El nombre del evento debe ser descrito por 5 caractéres o más!');
				valid=false;
			}else if(nombreEvento.length>76){
				$('#editNombreEventoError').html('¡El nombre del evento debe ser descrito por 76 caractéres o menos!');
				valid=false;
			}
		}

		for(let i=1; i<$('#viewItemForm .check').length; i++){
			if($('#viewItemForm .check input')[i].checked==1){
				comprovateServices=true;
			}
		}
		console.log(comprovateServices);
		if(comprovateServices==false){
			$('#editOtrosServiceError').html('Debe seleccionar un tipo de servicio');
			valid=false;
		}

		if($('#editActivateOtrosService')[0].checked==1){
			if($('#editOtrosService').val().trim().length<1){
				$('#editOtrosServiceError').html('¡Debe introducir el tipo de servicio!');
				valid=false;
			}else{
				if($('#editOtrosService').val().trim().length<5){
					$('#editOtrosServiceError').html('¡El servicio debe ser descrito, por lo menos, por 5 caractéres!');
					valid=false;
				}else if($('#editOtrosService').val().trim().length>100){
					$('#editOtrosServiceError').html('¡El servicio debe ser descrito por menos de 100 caractéres!');
					valid=false;
				}
			}
		}

		if(comprobanteEdit.length<1 && $('#edit-dat-firma-content input').is(':checked') && $('#editComprobante')[0].files.length<1){
			$('#editComprobanteError').html('¡Debe seleccionar el comprobante de pago en formato "PDF"!');
			valid=false;
		}else if($('#edit-dat-firma-content input').is(':checked') && $('#editComprobante')[0].files.length>0){
			let comprobante=$('#editComprobante')[0].files[0];

			if(comprobante.type!='application/pdf'){
				$('#editComprobanteError').html('¡El archivo seleccionado debe estar en formato "PDF"!');
				valid=false;
			}else{
				if(comprobante.size>10000000){
					$('#editComprobanteError').html('¡El archivo seleccionado debe pesar menos de 10 megabytes!');
					valid=false;
				}
			}
		}


		if(valid==true){
			$('#charger').show().css('background', 'rgba(250,250,250,0.75)');
			
			let editPermiso=new FormData();
			editPermiso.append('today', adaptNumDay(hoy.getFullYear())+'-'+adaptNumDay(hoy.getMonth()+1)+'-'+adaptNumDay(hoy.getDate()));
			editPermiso.append('permiso', $('#editItemForm').attr('value'));
			editPermiso.append('horario', horarioInicio+' - '+horarioFin);
			editPermiso.append('habilitacion', habilitacion);
			editPermiso.append('vencimiento', vencimiento);
			editPermiso.append('nombre', nombre);
			editPermiso.append('apellido', apellido);
			editPermiso.append('idDocument', idDocument);
			editPermiso.append('tlf', tlf);
			editPermiso.append('habitacion', habitacion);
			editPermiso.append('sector', sector);
			editPermiso.append('nombre_evento', nombreEvento);
			if($('#editTipoEvento').val()=='Otro'){
				editPermiso.append('tipo_evento', sanitizeString($('#editOtroEvento').val().trim()));
			}else{
				editPermiso.append('tipo_evento', $('#editTipoEvento').val());
			}
			addCheck(editPermiso, $('#editComidasService'), 'servicio_comida');
			addCheck(editPermiso, $('#editBebidasService'), 'servicio_bebidas');
			addCheck(editPermiso, $('#editConfiteriaService'), 'servicio_confiteria');
			addCheck(editPermiso, $('#editVariosService'), 'servicio_varios');
			addCheck(editPermiso, $('#editHeladeriaService'), 'servicio_heladeria');

			if($('#editActivateOtrosService')[0].checked==0){
				editPermiso.append('servicio_otros', '');
			}else{
				editPermiso.append('servicio_otros', $('#editOtrosService').val());
			}

			if($('#edit-dat-firma-content input').is(':checked')){
				editPermiso.append('needPermiso', true);
				if($('#editComprobante')[0].files.length>0){
					editPermiso.append('comprobante', $('#editComprobante')[0].files[0]);
				}
			}else{
				editPermiso.append('needPermiso', false);
			}

			let editPermisoPeticionLocation='/eventos_especiales/edit';
			let editPermisoPeticion=$.ajax({
				url: editPermisoPeticionLocation,
				type:'post',
				dataType:'json',
				data:editPermiso,
				cache:false,
				contentType:false,
				processData:false
			});

			editPermisoPeticion.then((response)=>{
				if('errno' in response){
					if(response.code=='ERRDATE'){
						confirm('¡Ha ocurrido un error al editar el archivo <br> <span style="text-decoration:underline;">La fecha de su computador es distinta a la fecha de hoy (Fecha Actual: '+response.date+')</span>', null, true);
					}else if(response.code=='ERRPERMIT'){
						confirm('¡Ha ocurrido un error al editer el archivo <br> <span style="text-decoration:underline;">'+response.message+'</span>', null, true);
					}else{
						confirm('¡Ha ocurrido un error al editar el archivo <br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.code+'</span>', null, true);
					}
				}else{
					let socketReceptor='eventos:edit-permiso';
					socket.emit(socketReceptor, {
						permiso: response.permiso,
						id: socket.id,
						socket:socketReceptor
					});
					console.log(response);
					confirm('¡Se ha editado correctamente el permiso!', null, true);
				}
				$('#charger').hide();
			}).catch(()=>{
				console.log('Hola');
				$('#charger').hide();
			});

			failPeticion(editPermisoPeticion, 'editar el permiso', editPermisoPeticionLocation);
		}

	});

	$('#aprobatePermisoForm').submit((e)=>{
		e.preventDefault();
		aprobateItem('/eventos_especiales/aprobate', (response)=>{
			if('errno' in response){
				confirm('¡Ha ocurrido un error al aprobar el permiso<br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.code+'</span>', null, true);
			}else{
				closeAprobation();
				let socketReceptor='eventos:aprobate-permiso';
					socket.emit(socketReceptor, {
						permiso: response.permiso,
						id: socket.id,
						socket:socketReceptor
					});
				confirm('¡Se ha aprobado correctamente la emisión del permiso!', null, true);
			}
		});
	});

	$('#cancelPermit form').submit((e)=>{
		e.preventDefault();
		$('#cancelPermit form .error').html('');

		cancelPermitForm('/eventos_especiales/cancel', 'eventos');
	});

	for(let i=0; i<$('.item').length; i++){
		convertDom($('.item')[i]).click(()=>{
			getItem(convertDom($('.item')[i]), '/eventos_especiales/get', getItemFunction);
		});
	}
});


// Web Sockets:
$(document).ready(()=>{
	// Adjunción de nuevo Permiso:
	socket.on('eventos:nuevo-permiso', function(data){
		let funcion={
			add: ()=>{
				let plantilla=`
					<button class="item disaproved" id="item`+data.id+`" style="display:none;">
						<div class="codeItem">
							<b>Cod:</b> `+data.codigo_permiso+`
						</div>
						<div class="title-item truncado">
							<b>Requisitor:</b> `+data.requisitor_nombre+` `+data.requisitor_apellido+`
						</div>
						<div class="data-item">
							<div><b>Emisión:</b> `+getFormatedDate(data.habilitacion)+`</div>
							<div><b>Vencimiento:</b> `+getFormatedDate(data.vencimiento)+`</div>
						</div>
					</button>
				`;
				searchItems('/eventos_especiales/search', '/eventos_especiales/get');
				$('#itemsSection').prepend(plantilla);
				if(data.emitido!=0){
					$('#item'+data.id).removeClass('disaproved');
					$('#item'+data.id).addClass('disaproved');
				}
				$('#item'+data.id).click(()=>{
					getItem($('#item'+data.id), '/eventos_especiales/get', getItemFunction);
				});
				$('#item'+data.id).slideDown(250);
			}
		}

		if($('.item').length<1){
			$('#addFirst').slideUp(250);
			setTimeout(()=>{
				$('#addFirst').remove();
			}, 250);
			funcion.add();
		}else{
			funcion.add();
		}
	});


function actualizeItem(data, callback){
	function uploadScreenEdit(){
		$('#viewItemForm section nav').html('');
		$('#viewItemForm section .status').html('');
		$('#viewItemForm section .comprobanteButton').remove();
		getItem($('#item'+data.permiso.id), '/eventos_especiales/get', getItemFunction);
	}
	if('id' in data){
		if(data.id==socket.id){
			uploadScreenEdit();
		}else if($('#editItemForm').attr('value')==data.permiso.id){
			confirm('¡El permiso actual ha sido actualizado desde otra sesión, por lo tanto se actualizó la vista del mismo!', null, true);
			uploadScreenEdit();
		}
		callback();
	}
}

	// Edición de Permiso:
	socket.on('eventos:edit-permiso', function(data){
		actualizeItem(data, ()=>{
			//$('#item'+data.permiso.id+' .codeItem').html('<b>Cod:</b> '+data.permiso.codigo_permiso);
			$('#item'+data.permiso.id+' .title-item, #itemResult'+data.permiso.id+' .title-item').html('<b>Requisitor:</b> '+data.permiso.requisitor_nombre+' '+data.permiso.requisitor_apellido);
			$('#item'+data.permiso.id+' .data-item, #itemResult'+data.permiso.id+' .data-item').html(`
				<div><b>Emisión:</b> `+getFormatedDate(data.permiso.habilitacion)+`</div>
				<div><b>Vencimiento:</b> `+getFormatedDate(data.permiso.vencimiento)+`</div>
			`);
		});
	});

	socket.on('eventos:aprobate-permiso', function(data){
		actualizeItem(data, ()=>{
			$('#item'+data.permiso.id).removeClass('disaproved');
			$('#item'+data.permiso.id).addClass('aproved');
		});
	});

	socket.on('eventos:cancel-permiso', function(data){
		actualizeItem(data, ()=>{
			$('#item'+data.permiso.id).removeClass('aproved');
			$('#item'+data.permiso.id).addClass('canceled');
		});
	});
});