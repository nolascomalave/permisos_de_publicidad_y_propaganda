async function deleteItem(id){
	let body=new FormData(), aborter=new AbortController();
	setTimeout(()=>aborter.abort(), 30000);
	$('#charger').show().css('background', 'rgba(250,250,250,0.75)');
	body.append('id', id);

	try{
		let response=await fetch('/venta_de_bebidas/', {method:'DELETE', body, signal:aborter.signal});

		switch(response.status){
			case 401:
				window.location(window.location.origin);
				break;
			case 403:
				confirm('¡Usted no tiene los permisos necesarios para realizar ésta operación!', null, true);
				break;
			case 404:
				confirm('¡Permiso no encontrado!', null, true);
				break;
			case 409:
				let res=await response.json();
				confirm(res.message, null, true);
				break;
			case 200:
				$('#viewItemForm header button').click();
				socket.emit('bebidas:delete', id);
				confirm('El permiso ha sido eliminado exitosamente!', ()=>window.location.reload(), true);
				break;
			default:
				confirm('¡Ha ocurrido un error en la base de datos al intentar eliminar el permiso!', null, true);
				break;
		}
	}catch(e){
		if(aborter.signal.aborted)
		confirm(aborter.signal.aborted ? '¡El tiempo de espera de la petición ha sido excedido!' :'¡Ha ocurrido un error en la base de datos al intentar eliminar el permiso!', null, true);
	}

	$('#charger').hide().css('background', 'none');
}

function getItemFunction(response){
	let today=adaptNumDay(hoy.getDate())+'/'+adaptNumDay(hoy.getMonth()+1)+'/'+adaptNumDay(hoy.getFullYear());
	//console.log(response.usuario);
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
			<a id="printItem" href="/venta_de_bebidas/permiso/bebidas-alcoholicas_`+response.result.codigo_permiso+`" target="_blank">
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

			if(response.usuario.tipo_usuario=="Desarrollador" || response.usuario.tipo_usuario=="Administrador"){
				$('#aprobateItem').after(`
					<button title="Eliminar" id="deleteItem">
						<i class="li-icon fas fa-trash"></i>
					</button>
				`);

				$('#deleteItem').click(()=>{
					let accept=confirm('¿Está segur@ de querer eliminar el permiso "'+response.result.codigo_permiso+'"?', ()=>deleteItem(response.result.id), false);
				});
			}

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
						<a href="/server-files/asuntos_publicos/permisos_municipales/bebidas/`+response.result.comprobante_de_pago+`" target="_blank">
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
							<a href="/server-files/asuntos_publicos/permisos_municipales/bebidas/`+response.result.permiso_autorizado+`" target="_blank">
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

$(document).ready(()=>{
	//---------------------
	searchItems('/venta_de_bebidas/search', '/venta_de_bebidas/get');
	$('#statusPermit').change(()=>{
		searchItems('/venta_de_bebidas/search', '/venta_de_bebidas/get');
	});
	$('#searcher').keyup(()=>{
		searchItems('/venta_de_bebidas/search', '/venta_de_bebidas/get');
	});
	$('#cleanerSearch').click(()=>{
		$('#statusPermit').val('Todos');
		$('#searcher').val('');
		searchItems('/venta_de_bebidas/search', '/venta_de_bebidas/get');
	});

	// Procesos a realizar al crear un permiso:
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
		sector=sanitizeString($('#sector').val().trim());

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

			//newPermiso.append('comprobante', $('#comprobante')[0].files[0]);
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

			if($('#dat-firma-content input').is(':checked')){
				newPermiso.append('comprobante', $('#comprobante')[0].files[0]);
			}
			let newPermisoPeticionLocation='/venta_de_bebidas/add';
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
				//console.log(response);
				if('errno' in response){
					if(response.code=='ERRDATE'){
						confirm('¡Ha ocurrido un error al registrar el archivo <br> <span style="text-decoration:underline;">La fecha de su computador es distinta a la fecha de hoy (Fecha Actual: '+response.date+')</span>', null, true);
					}else{
						confirm('¡Ha ocurrido un error al registrar el archivo <br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.code+'</span>', null, true);
					}
				}else{
					socket.emit('bebidas:nuevo-permiso', {
						permiso: response.permiso
					});
					$('#viewSection, #newItemForm').fadeOut();
					confirm('¡Se ha registrado correctamente el permiso!', null, true);
					$('#itemForm').reset();
				}
				$('#charger').hide();
			}).catch(()=>{
				$('#charger').hide();
			});

			failPeticion(newPermisoPeticion, 'registrar el permiso', newPermisoPeticionLocation);
		}

		//confirm('prueba', null, true);
	});

	// Procesos a realizar al editar un permiso:
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
		sector=sanitizeString($('#editSector').val().trim());

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
				$('#editHabilitacionError').html('¡No se puede editar el permiso con más de 30 días de adelanto!');
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

			if($('#edit-dat-firma-content input').is(':checked')){
				editPermiso.append('needPermiso', true);
				if($('#editComprobante')[0].files.length>0){
					editPermiso.append('comprobante', $('#editComprobante')[0].files[0]);
				}
			}else{
				editPermiso.append('needPermiso', false);
			}

			let editPermisoPeticionLocation='/venta_de_bebidas/edit';
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
					/*$('#viewItemForm section nav').html('');
					$('#viewItemForm section .status').html('');
					$('#viewItemForm section .comprobanteButton').remove();
					getItem($('#item'+response.permiso), '/venta_de_bebidas/get', getItemFunction);*/
					let socketReceptor='bebidas:edit-permiso';
					socket.emit(socketReceptor, {
						permiso: response.permiso,
						id: socket.id,
						socket:socketReceptor
					});
					confirm('¡Se ha editado correctamente el permiso!', null, true);
					$('#editItemForm').reset();
				}
				$('#charger').hide();
			}).catch(()=>{
				$('#charger').hide();
			});

			failPeticion(editPermisoPeticion, 'registrar el permiso', editPermisoPeticionLocation);
		}
	});


	$('#aprobatePermisoForm').submit((e)=>{
		e.preventDefault();
		aprobateItem('/venta_de_bebidas/aprobate', (response)=>{
			if('errno' in response){
				confirm('¡Ha ocurrido un error al aprobar el permiso<br> <span style="text-decoration:underline;">Código</span>:<span class="error"> '+response.code+'</span>', null, true);
			}else{
				closeAprobation();
				/*$('#viewItemForm section nav').html('');
				$('#viewItemForm section .status').html('');
				$('#viewItemForm section .comprobanteButton').remove();
				getItem($('#item'+response.permiso), '/venta_de_bebidas/get', getItemFunction);*/
				let socketReceptor='bebidas:aprobate-permiso';
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

		cancelPermitForm('/venta_de_bebidas/cancel', 'bebidas');
	});

	for(let i=0; i<$('.item').length; i++){
		convertDom($('.item')[i]).click(()=>{
			getItem(convertDom($('.item')[i]), '/venta_de_bebidas/get', getItemFunction);
		});
	}
});

// Web Sockets:
$(document).ready(()=>{
	// Adjunción de nuevo Permiso:
	socket.on('bebidas:nuevo-permiso', function(data){
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
				searchItems('/venta_de_bebidas/search', '/venta_de_bebidas/get');
				$('#itemsSection').prepend(plantilla);
				if(data.emitido!=0){
					$('#item'+data.id).removeClass('disaproved');
					$('#item'+data.id).addClass('disaproved');
				}
				$('#item'+data.id).click(()=>{
					getItem($('#item'+data.id), '/venta_de_bebidas/get', getItemFunction);
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
		getItem($('#item'+data.permiso.id), '/venta_de_bebidas/get', getItemFunction);
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
	socket.on('bebidas:edit-permiso', function(data){
		actualizeItem(data, ()=>{
			//$('#item'+data.permiso.id+' .codeItem').html('<b>Cod:</b> '+data.permiso.codigo_permiso);
			$('#item'+data.permiso.id+' .title-item, #itemResult'+data.permiso.id+' .title-item').html('<b>Requisitor:</b> '+data.permiso.requisitor_nombre+' '+data.permiso.requisitor_apellido);
			$('#item'+data.permiso.id+' .data-item, #itemResult'+data.permiso.id+' .data-item').html(`
				<div><b>Emisión:</b> `+getFormatedDate(data.permiso.habilitacion)+`</div>
				<div><b>Vencimiento:</b> `+getFormatedDate(data.permiso.vencimiento)+`</div>
			`);
		});
		/*function uploadScreenEdit(){
			$('#viewItemForm section nav').html('');
			$('#viewItemForm section .status').html('');
			$('#viewItemForm section .comprobanteButton').remove();
			getItem($('#item'+data.permiso.id), '/venta_de_bebidas/get', getItemFunction);
		}
		if('id' in data){
			if(data.id==socket.id){
				uploadScreenEdit();
			}else if($('#editItemForm').attr('value')==data.permiso.id){
				confirm('¡El permiso actual ha sido actualizado desde otra sesión, por lo tanto se actualizó la vista del mismo!', null, true);
				uploadScreenEdit();
			}

			//$('#item'+data.permiso.id+' .codeItem').html('<b>Cod:</b> '+data.permiso.codigo_permiso);
			$('#item'+data.permiso.id+' .title-item').html('<b>Requisitor:</b> '+data.permiso.requisitor_nombre+' '+data.permiso.requisitor_apellido);
			$('#item'+data.permiso.id+' .data-item').html(`
				<div><b>Emisión:</b> `+getFormatedDate(getFormatedDate(data.permiso.habilitacion))+`</div>
				<div><b>Vencimiento:</b> `+getFormatedDate(getFormatedDate(data.permiso.vencimiento))+`</div>
			`);
		}*/
	});

	// Aprobación de Permiso:
	socket.on('bebidas:aprobate-permiso', function(data){
		actualizeItem(data, ()=>{
			$('#item'+data.permiso.id).removeClass('disaproved');
			$('#item'+data.permiso.id).addClass('aproved');
		});
		/*function uploadScreenEdit(){
			$('#viewItemForm section nav').html('');
			$('#viewItemForm section .status').html('');
			$('#viewItemForm section .comprobanteButton').remove();
			getItem($('#item'+data.permiso.id), '/venta_de_bebidas/get', getItemFunction);
		}
		if('id' in data){
			if(data.id==socket.id){
				uploadScreenEdit();
			}else if($('#editItemForm').attr('value')==data.permiso.id){
				confirm('¡El permiso actual ha sido actualizado desde otra sesión, por lo tanto se actualizó la vista del mismo!', null, true);
				uploadScreenEdit();
			}

			$('#item'+data.permiso.id).removeClass('disaproved');
			$('#item'+data.permiso.id).addClass('aproved');
		}*/
	});

	socket.on('bebidas:cancel-permiso', function(data){
		actualizeItem(data, ()=>{
			$('#item'+data.permiso.id).removeClass('aproved');
			$('#item'+data.permiso.id).addClass('canceled');
		});
	});

	socket.on('bebidas:delete', function(data){
		$('#item'+data).remove();
	});
});