const express=require('express'),
multer=require('multer'),
router=express.Router(),
path=require('path'),
fs=require('fs'),
upload=multer(),
pdf=require('html-pdf');

// Funciones Usadas:
const gf=require('../globalFunctions');

function converToBooleanService(service){
	let result=0;
	if(service==true || service=='true'){
		result=1;
	}
	return result;
}

// Multer Settings:
const storageProyect= multer.diskStorage({
	destination: path.join(__dirname, /*'../public/server-files/asuntos_publicos/permisos_municipales/eventos/'),*/'../public/server-files/temps/'),
	filename: (req, file, funcion)=>{
		if('usuario' in req.session){
			funcion(null, file.fieldname+'_de_pago_'+Date.now()+file.originalname.substr(file.originalname.lastIndexOf('.'), file.originalname.length-1));
		}
	}
});

const storageAprobate= multer.diskStorage({
	destination: path.join(__dirname, /*'../public/server-files/asuntos_publicos/permisos_municipales/eventos/'),*/'../public/server-files/temps/'),
	filename: (req, file, funcion)=>{
		if('usuario' in req.session){
			funcion(null, 'permiso_autorizado'+Date.now()+file.originalname.substr(file.originalname.lastIndexOf('.'), file.originalname.length-1));
		}
	}
});

const uploadProyect=multer({
	storage: storageProyect
}).single('comprobante');

const uploadAprobate=multer({
	storage: storageAprobate
}).single('permiso_aprobado');

// Routes:
router.get('/', async (req, res)=>{
	if('usuario' in req.session){
		let pool=require('../database');
		await pool.query('SELECT * FROM permisos_eventos', (err, result, fields)=>{
			if(err){
				res.render('global', {
					permisos: err,
					titlePage: 'Eventos Especiales',
					titleResources: "eventos",
					host: req.headers.host.substring(0, 10),
					tipo_usuario: req.session.usuario.tipo_usuario
				});
			}else{
				res.render('global', {
					permisos: result,
					titlePage: 'Eventos Especiales',
					titleResources: "eventos",
					host: req.headers.host.substring(0, 10),
					tipo_usuario: req.session.usuario.tipo_usuario
				});
			}
		});

		pool.end(function (err) {
		  console.log(err);
		});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/get', upload.none() ,async (req, res)=>{
	if('usuario' in req.session){
		let pool=require('../database');
		await pool.query('SELECT * FROM permisos_eventos WHERE id=?', [req.body.id], (err, result, fields)=>{
			if(err){
				res.send({
					result: err,
					usuario: req.session.usuario
				});
			}else{
				res.send({
					result:result[0],
					usuario: req.session.usuario
				});
			}
		});

		pool.end(function (err) {
		  console.log(err);
		});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/search', upload.none(), async (req, res)=>{
	if('usuario' in req.session){
		let pool=require('../database');

		function plantillaLlena(dataContent, value){
			let plantilla=``;
			if(dataContent.emitido==0){
				plantilla=plantilla+`
					<button class="item disaproved" id="itemResult`+dataContent.id+`">
				`;
			}else{
				if(dataContent.cancelado==0){
					plantilla=plantilla+`
						<button class="item aproved" id="itemResult`+dataContent.id+`">
					`;
				}else{
					plantilla=plantilla+`
						<button class="item canceled" id="itemResult`+dataContent.id+`">
					`;
				}
			}
			plantilla=plantilla+`
					<div class="codeItem">
						<b>Cod:</b> `+value.codigo_permiso+`
					</div>
					<div class="title-item truncado">
						<b>Requisitor:</b> `+value.requisitor+`
					</div>
					<div class="data-item">
						<div><b>Emisión:</b> `+value.habilitacion+`</div>
						<div><b>Vencimiento:</b> `+value.vencimiento+`</div>
					</div>
				</button>
			`;
			return plantilla;
		}
		
		await pool.query('SELECT * FROM permisos_eventos', (err, resultados, fields)=>{
			if(err){
				res.send(err);
			}else{
				let plantilla=``, result=[], counter=resultados.length-1, estado=req.body.estado, busqueda=req.body.busqueda, html=``;

				for(let i=resultados.length-1; i>=0;i--){

					let condicion=gf.busqueda(busqueda, resultados[i].codigo_permiso);

					let value={
						codigo_permiso:resultados[i].codigo_permiso,
						habilitacion: gf.getFormatedDate(resultados[i].habilitacion),
						vencimiento: gf.getFormatedDate(resultados[i].vencimiento),
						requisitor: resultados[i].requisitor_nombre+' '+resultados[i].requisitor_apellido,
						requisitor_doc: resultados[i].requisitor_doc,
						requisitor_tlf: resultados[i].requisitor_tlf,
						sector_permisado: resultados[i].sector_permisado
					};
					
					condicion=condicion || gf.busqueda(busqueda, resultados[i].codigo_permiso);
					condicion=condicion || gf.busqueda(busqueda, gf.getFormatedDate(resultados[i].habilitacion));
					condicion=condicion || gf.busqueda(busqueda, gf.getFormatedDate(resultados[i].vencimiento));
					condicion=condicion || gf.busqueda(busqueda, resultados[i].requisitor_nombre+' '+resultados[i].requisitor_apellido);
					condicion=condicion || gf.busqueda(gf.destilde(busqueda), gf.destilde(resultados[i].requisitor_nombre+' '+resultados[i].requisitor_apellido));
					condicion=condicion || gf.busqueda(busqueda, resultados[i].requisitor_doc);
					condicion=condicion || gf.busqueda(busqueda, gf.extractNumberInText(resultados[i].requisitor_doc));
					condicion=condicion || gf.busqueda(busqueda, resultados[i].requisitor_tlf);
					condicion=condicion || gf.busqueda(busqueda, gf.extractNumberInText(resultados[i].requisitor_tlf));
					condicion=condicion || gf.busqueda(busqueda, resultados[i].sector_permisado);
					condicion=condicion || gf.busqueda(gf.destilde(busqueda), gf.destilde(resultados[i].sector_permisado));

					if(gf.busqueda(busqueda, resultados[i].codigo_permiso)){
						value.codigo_permiso=gf.resaltSearch(busqueda, resultados[i].codigo_permiso);
					}if(gf.busqueda(busqueda, gf.getFormatedDate(resultados[i].habilitacion))){
						value.habilitacion=gf.resaltSearch(busqueda, gf.getFormatedDate(resultados[i].habilitacion));
					}if(gf.busqueda(busqueda, gf.getFormatedDate(resultados[i].vencimiento))){
						value.vencimiento=gf.resaltSearch(busqueda, gf.getFormatedDate(resultados[i].vencimiento));
					}if(gf.busqueda(busqueda, resultados[i].requisitor_nombre+' '+resultados[i].requisitor_apellido) || gf.busqueda(gf.destilde(busqueda), gf.destilde(resultados[i].requisitor_nombre+' '+resultados[i].requisitor_apellido))){
						value.requisitor=gf.resaltSearch(busqueda, resultados[i].requisitor_nombre+' '+resultados[i].requisitor_apellido);
					}if(gf.busqueda(busqueda, resultados[i].requisitor_doc) || gf.busqueda(busqueda, gf.extractNumberInText(resultados[i].requisitor_doc))){
						value.requisitor_doc=gf.resaltSearch(busqueda, resultados[i].requisitor_doc);
					}if(gf.busqueda(busqueda, resultados[i].requisitor_tlf) || gf.busqueda(busqueda, gf.extractNumberInText(resultados[i].requisitor_tlf))){
						value.requisitor_tlf=gf.resaltSearch(busqueda, resultados[i].requisitor_tlf);
					}if(gf.busqueda(gf.destilde(busqueda), gf.destilde(resultados[i].sector_permisado)) || gf.busqueda(busqueda, resultados[i].sector_permisado)){
						value.sector_permisado=gf.resaltSearch(busqueda, resultados[i].sector_permisado);
					}

					if(estado=='Todos'){
						if(busqueda.length>0){
							if(condicion){
								//result.push(resultados[i]);
								plantilla=plantilla+plantillaLlena(resultados[i], value);
							}
						}else{
							//result.push(resultados[i]);
							plantilla=plantilla+plantillaLlena(resultados[i], value);
						}
					}else if(estado=='Emitido'){
						if(resultados[i].emitido==1){
							if(busqueda.length>0){
								if(condicion){
									//result.push(resultados[i]);
									plantilla=plantilla+plantillaLlena(resultados[i], value);
								}
							}else{
								//result.push(resultados[i]);
								plantilla=plantilla+plantillaLlena(resultados[i], value);
							}
						}
					}else{
						if(resultados[i].emitido==0){
							if(busqueda.length>0){
								if(condicion){
									//result.push(resultados[i]);
									plantilla=plantilla+plantillaLlena(resultados[i], value);
								}
							}else{
								//result.push(resultados[i]);
								plantilla=plantilla+plantillaLlena(resultados[i], value);
							}
						}
					}
				}

				res.send({
					plantilla: plantilla
				});
			}
		});

		pool.end(function (err) {
		  console.log(err);
		});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/add', uploadProyect, async (req, res)=>{
	if('usuario' in req.session){
		let pool=require('../database');
		let exist=false, fecha=new Date(), registro='', counter=1, existNumber=true, hoy=new Date();

		if(req.body.today==gf.adaptNumDay(hoy.getFullYear())+'-'+gf.adaptNumDay(hoy.getMonth()+1)+'-'+gf.adaptNumDay(hoy.getDate())){
			await pool.query('SELECT * FROM permisos_eventos WHERE codigo_permiso LIKE ?', [hoy.getFullYear()+'%'], async (err, result, fields)=>{
				if(err){
					res.send(err);
					if('file' in req){
						gf.deleteFile(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
					}
				}else{
					let lastPermiso='';
					
					if('file' in req){
						gf.moveFiles(path.join(__dirname, "../public/server-files/temps/"+req.file.filename), path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/eventos/'+req.file.filename));
						fileName=req.file.filename;
					}

					if(result.length>0){
						lastPermiso=result[result.length-1].codigo_permiso;
						lastPermiso=fecha.getFullYear()+'-'+gf.adaptNum(Number(Number(lastPermiso.substr(5, lastPermiso.length-1))+1));
					}else{
						lastPermiso=fecha.getFullYear()+'-'+gf.adaptNum(1);
					}

					let datConfirmacion=0, pagoDoc='';

					if('file' in req){
						datConfirmacion=1;
						pagoDoc=req.file.filename;
					}

					req.body.servicio_comida=converToBooleanService(req.body.servicio_comida);
					req.body.servicio_bebidas=converToBooleanService(req.body.servicio_bebidas);
					req.body.servicio_confiteria=converToBooleanService(req.body.servicio_confiteria);
					req.body.servicio_varios=converToBooleanService(req.body.servicio_varios);
					req.body.servicio_heladeria=converToBooleanService(req.body.servicio_heladeria);

					let values=[
						null,
						lastPermiso,
						req.body.habilitacion,
						req.body.vencimiento,
						req.body.horario,
						datConfirmacion,
						req.body.nombre,
						req.body.apellido,
						req.body.idDocument,
						req.body.tlf,
						req.body.habitacion,
						req.body.sector,
						req.body.nombre_evento,
						req.body.tipo_evento,
						req.body.servicio_comida,
						req.body.servicio_bebidas,
						req.body.servicio_confiteria,
						req.body.servicio_varios,
						req.body.servicio_heladeria,
						req.body.servicio_otros,
						pagoDoc,
						"",
						req.session.usuario.nombre+' '+req.session.usuario.apellido,
						"",
						0,
						0,
						""
					];

					await pool.query(`INSERT INTO permisos_eventos (id, codigo_permiso, habilitacion, vencimiento, horario, dat_confirmacion, requisitor_nombre, requisitor_apellido, requisitor_doc, requisitor_tlf, requisitor_habitacion, sector_permisado, nombre_evento, tipo_evento, servicio_comida, servicio_bebidas, servicio_confiteria, servicio_articulos_varios, servicio_heladeria, servicio_otros, comprobante_de_pago, permiso_autorizado, creador, editor, emitido, cancelado, observacion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, values, (error, resultado, filas)=>{
						if(error){
							res.send(error);
							if('file' in req){
								gf.deleteFile(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/eventos/'+req.file.filename));
							}
						}else{
							res.send({
								success: '¡Se ha registrado correctamente el permiso!',
								permiso: lastPermiso
							});
						}
					});
				}
			});
		}else{
			if('file' in req){
				gf.deleteFile(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
			}
			res.send({
				errno: '¡Fecha incorrecta!',
				message: '¡Fecha Incorrecta!',
				code: 'ERRDATE',
				date: gf.adaptNumDay(hoy.getDate())+'/'+gf.adaptNumDay(hoy.getMonth()+1)+'/'+gf.adaptNumDay(hoy.getFullYear())
			});
			//console.log(req.body.today+' == '+gf.adaptNumDay(hoy.getFullYear())+'-'+gf.adaptNumDay(hoy.getMonth()+1)+'-'+gf.adaptNumDay(hoy.getDate()))
		}

		pool.end(function (err) {
		  console.log(err);
		});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/edit', uploadProyect, async (req, res)=>{
	if('usuario' in req.session){
		let pool=require('../database');
		let exist=false, fecha=new Date(), registro='', counter=1, existNumber=true, hoy=new Date();
		if(req.body.today==gf.adaptNumDay(hoy.getFullYear())+'-'+gf.adaptNumDay(hoy.getMonth()+1)+'-'+gf.adaptNumDay(hoy.getDate())){
			await pool.query('SELECT * FROM permisos_eventos WHERE id=?', [req.body.permiso], async (err, result, fields)=>{
				if(err){
					res.send(err);
					if('file' in req){
						gf.deleteFile(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
					}
				}else if(result[0].id==req.body.permiso){
					let datConfirmacion=0, comprobantName=result[0].comprobante_de_pago;

					if(req.body.needPermiso=='true'){
						datConfirmacion=1;
						if('file' in req){
							comprobantName=req.file.filename;

							gf.moveFiles(path.join(__dirname, "../public/server-files/temps/"+req.file.filename), path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/eventos/'+req.file.filename));

							if(result[0].comprobante_de_pago.length>0){
								gf.deleteFile(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/eventos/'+result[0].comprobante_de_pago));
							}
						}
					}else if('file' in req){
						gf.deleteFile(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
					}else if(result[0].comprobante_de_pago.length>0){
						gf.deleteFile(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/eventos/'+result[0].comprobante_de_pago));
						comprobantName='';
					}

					req.body.servicio_comida=converToBooleanService(req.body.servicio_comida);
					req.body.servicio_bebidas=converToBooleanService(req.body.servicio_bebidas);
					req.body.servicio_confiteria=converToBooleanService(req.body.servicio_confiteria);
					req.body.servicio_varios=converToBooleanService(req.body.servicio_varios);
					req.body.servicio_heladeria=converToBooleanService(req.body.servicio_heladeria);

					let values=[
						req.body.habilitacion,
						req.body.vencimiento,
						req.body.horario,
						datConfirmacion,
						req.body.nombre,
						req.body.apellido,
						req.body.idDocument,
						req.body.tlf,
						req.body.habitacion,
						req.body.sector,
						req.body.nombre_evento,
						req.body.tipo_evento,
						req.body.servicio_comida,
						req.body.servicio_bebidas,
						req.body.servicio_confiteria,
						req.body.servicio_varios,
						req.body.servicio_heladeria,
						req.body.servicio_otros,
						comprobantName,
						"",
						result[0].creador,
						req.session.usuario.nombre+' '+req.session.usuario.apellido,
						null,
						0,
						req.body.permiso
					];

					await pool.query('UPDATE permisos_eventos SET habilitacion=?, vencimiento=?, horario=?, dat_confirmacion=?, requisitor_nombre=?, requisitor_apellido=?, requisitor_doc=?, requisitor_tlf=?, requisitor_habitacion=?, sector_permisado=?, nombre_evento=?, tipo_evento=?, servicio_comida=?, servicio_bebidas=?, servicio_confiteria=?, servicio_articulos_varios=?, servicio_heladeria=?, servicio_otros=?, comprobante_de_pago=?, permiso_autorizado=?, creador=?, editor=?, fecha_creacion=?, emitido=? WHERE id=?', values, async (error, resultado, filas)=>{
						if(error){
							if('file' in req){
								gf.deleteFile(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/eventos/'+req.file.filename));
							}
							res.send(error);
						}else{
							res.send({
								success: '¡Se ha editado correctamente el permiso!',
								permiso: req.body.permiso
							});
						}
					});
				}else{
					res.send({
						errno: '¡NOT FOUND!',
						message: '¡Permiso no encontrado!',
						code: 'ERRPERMIT'
					});
				}
			});
		}else{
			if('file' in req){
				gf.deleteFile(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
			}
			res.send({
				errno: '¡Fecha incorrecta!',
				message: '¡Fecha Incorrecta!',
				code: 'ERRDATE',
				date: gf.adaptNumDay(hoy.getDate())+'/'+gf.adaptNumDay(hoy.getMonth()+1)+'/'+gf.adaptNumDay(hoy.getFullYear())
			});
		}

		pool.end(function (err) {
		  console.log(err);
		});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/aprobate', uploadAprobate, async (req, res)=>{
	if('usuario' in req.session){
		let pool=require('../database.js');

		await pool.query('UPDATE permisos_eventos SET permiso_autorizado=?, emitido=1 WHERE id=?', [req.file.filename, req.body.permiso], (err, result, fields)=>{
			if(err){
				res.send(err);
			}else{
				gf.moveFiles(path.join(__dirname, "../public/server-files/temps/"+req.file.filename), path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/eventos/'+req.file.filename));
				res.send({
					success: '¡Se ha aprobado correctamente el permiso!',
					permiso: req.body.permiso
				});
			}
		});

		pool.end((err)=>{
			if(err){
				console.log(err);
			}
		});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/cancel', upload.none(), async (req, res)=>{
	if('usuario' in req.session){
		let pool=require('../database.js');
		
		await pool.query('UPDATE permisos_eventos SET cancelado=?, observacion=? WHERE id=?', [1, req.body.observacion, req.body.permiso], (err, result, fields)=>{
			if(err){
				res.send(err);
			}else{
				res.send({
					success: '¡Se ha cancelado la emisión del permiso correctamente!',
					permiso: req.body.permiso
				});
			}
		});

		pool.end((err)=>{
			if(err){
				console.log(err);
			}
		});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.get('/permiso/:permiso', (req,res,next)=>{
	//if('usuario' in req.session){
		next();
	//}else{
		//res.redirect('http://'+req.headers.host);
	//}
}, async (req, res)=>{
	let pool=require('../database');
	let permiso=req.params.permiso.match(/\d{4}\-\d{3}$/gi), type=req.params.permiso.match(/^eventos\-especiales_/gi);

	if(permiso!=null && type!=null){
		await pool.query('SELECT * FROM permisos_eventos WHERE codigo_permiso=?', [permiso[0]], (err, permisos)=>{
			if(err){
				res.send(err);
			}else if(permisos.length>0){
				let permiso=permisos[0], tipoPermiso=gf.destilde(permiso.tipo_evento.toLowerCase()),
				validateTrue=(val, text)=>{
					if(val==true || val==1){
						text='x';
					}
					return text;
				};
				let params={
					host:req.headers.host,
					habilitacion: gf.convertToDate(permiso.habilitacion),
					codigo: permiso.codigo_permiso,
					vencimiento: gf.convertToDate(permiso.vencimiento),
					requisitor: permiso.requisitor_nombre+' '+permiso.requisitor_apellido,
					ci: permiso.requisitor_doc,
					horario: permiso.horario,
					hab_telf: permiso.requisitor_habitacion+' / '+permiso.requisitor_tlf,
					area_permisada: permiso.sector_permisado,
					nombreEvento: permiso.nombre_evento,
					deportivo: '',
					cultural: '',
					benefico: '',
					educativo: '',
					religioso: '',
					otroTipoRow: '',
					otroTipo: '',
					comidas: '',
					bebidas: '',
					confiteria: '',
					articulos: '',
					heladeria: '',
					otrosServiciosRow: '',
					otrosServicios: ''
				};

				if(tipoPermiso=='deportivo'){
					params.deportivo='x';
				}else if(tipoPermiso=='cultural'){
					params.cultural='x';
				}else if(tipoPermiso=='benefico'){
					params.benefico='x';
				}else if(tipoPermiso=='educativo'){
					params.educativo='x';
				}else if(tipoPermiso=='religioso'){
					params.religioso='x';
				}else{
					params.otroTipoRow='x';
					params.otroTipo=permiso.tipo_evento;
				}

				params.comidas=validateTrue(permiso.servicio_comida, params.comidas);
				params.bebidas=validateTrue(permiso.servicio_bebidas, params.bebidas);
				params.confiteria=validateTrue(permiso.servicio_confiteria, params.confiteria);
				params.articulos=validateTrue(permiso.servicio_articulos_varios, params.articulos);
				params.heladeria=validateTrue(permiso.servicio_heladeria, params.heladeria);

				if(permiso.servicio_otros.trim().length>0){
					params.otrosServiciosRow='x';
					params.otrosServicios=permiso.servicio_otros;
				}

				let data=gf.renderizador(params, fs.readFileSync(path.join(__dirname, '../views/templates/permisos/eventos.html')).toString());
				let phantom=require('phantomjs').path, options = {
					"phantomPath":phantom,
					"format": 'A4'
				};

				pdf.create(data, options).toBuffer(function(err, buffer){
					res.setHeader('Content-Type', 'application/pdf');
					res.send(buffer);
				});
			}else{
				res.send({
					errno:'NOT EXIST DATA',
					message:'¡El permiso solicitado no existe!'
				});
			}
		});
	}else{
		res.send({
			errno:'ERROR DATA',
			message:'¡El permiso introducido en la url es incorrecto!'
		});
	}
});

router.get('/reporte', (req,res,next)=>{
	//if('usuario' in req.session){
		next();
	//}else{
		//res.redirect('http://'+req.headers.host);
	//}
}, async (req, res)=>{
	let pool=require('../database');
	await pool.query('SELECT * FROM permisos_eventos', (err, bebidas)=>{
		if(err){
			res.send(err);
		}else{
			let todos={
				count:0,
				html:``
			}, emitidos={
				count:0,
				html:``
			}, no_emitidos={
				count:0,
				html:``
			}, cancelados={
				count:0,
				html:``
			}, autorizados={
				count:0,
				html:``
			}, no_autorizados={
				count:0,
				html:``
			},
			addHtml=(json, html)=>{
				json.html=json.html+html;
				json.count++;
				return json;
			}, addNormal=(json, type, title)=>{
				if(json.count>0){
					json=`
						<div class="registros filter">
							<header><b>`+title+`: `+json.count+`</b></header>
							<section>
								<table>
									<tr>
										<th>Código</th>
										<th>Requisitor</th>
										<th>`+type+`</th>
										<th>F. de Registro</th>
									</tr>
									`+json.html+`
								</table>
							</section>
						</div>
					`;
				}else{
					json='';
				}

				return json;
			},params={
				host:req.headers.host,
				titleReport: 'Reporte Completo de Permisos de Eventos Especiales',
				todos,
				html:'',
				cuentas:''
			};

			bebidas=bebidas.reverse();

			bebidas.forEach(bebida =>{
				let plantilla_confirmacion=``, plantilla=``;
				plantilla=`
					<tr>
					<td>`+bebida.codigo_permiso+`</td>
					<td>`+bebida.requisitor_nombre+` `+bebida.requisitor_apellido+`</td>
				`;

				plantilla_confirmacion=plantilla;

				if(bebida.dat_confirmacion==1){
					plantilla=plantilla+`
							<td>Sí</td>
					`;
				}else{
					plantilla=plantilla+`
							<td>No</td>
					`;
				}

				plantilla=plantilla+`
						<td>`+gf.convertToDate(bebida.fecha_creacion)+`</td>
					<tr>
				`;

				if(bebida.emitido==0){
					no_emitidos=addHtml(no_emitidos, plantilla);
				}else if(bebida.cancelado==0){
					emitidos=addHtml(emitidos, plantilla);
				}else{
					cancelados=addHtml(cancelados, plantilla);
				}

				todos=addHtml(todos, plantilla);

				if(bebida.dat_confirmacion==0){
					plantilla_confirmacion=plantilla_confirmacion+`
							<td style="color: #dc3545;">No Emitido</td>
					`;
				}else{
					plantilla_confirmacion=plantilla_confirmacion+`
							<td style="color: #198754;">Emitido</td>
					`;
				}

				plantilla_confirmacion=plantilla_confirmacion+`
						<td>`+gf.convertToDate(bebida.fecha_creacion)+`</td>
					<tr>
				`;

				if(bebida.dat_confirmacion==0){
					no_autorizados=addHtml(no_autorizados, plantilla_confirmacion);
				}else{
					autorizados=addHtml(autorizados, plantilla_confirmacion);
				}
			});

			/*params.todos_count=todos.count;
			params.emitidos_count=emitidos.count;
			params.no_emitidos_count=no_emitidos.count;
			params.cancelados_count=cancelados.count;
			params.autorizados_count=autorizados.count;
			params.no_autorizados_count=no_autorizados.count;*/

			params.cuentas='Registrados: '+todos.count+' / Emitidos: '+emitidos.count+' / No Emitidos: '+no_emitidos.count+' / Cancelados: '+cancelados.count;

			params.todos=todos.html;

			no_emitidos=addNormal(no_emitidos, 'Autorizado por el DAT', 'Permisos no Emitidos');
			cancelados=addNormal(cancelados, 'Autorizado por el DAT', 'Permisos Cancelados');
			autorizados=addNormal(autorizados, 'Emisión', 'Permisos Autorizados');
			no_autorizados=addNormal(no_autorizados, 'Emisión', 'Permisos no Autorizados');
			emitidos=addNormal(emitidos, 'Autorizado por el DAT', 'Permisos Emitidos');

			params.html=emitidos+no_emitidos+cancelados+autorizados+no_autorizados;

			//res.send(params);

			let phantom=require('phantomjs').path, options = {
				"phantomPath":phantom,
				"format": 'A4'
			};
			let data=gf.renderizador(params, fs.readFileSync(path.join(__dirname, '../views/templates/reporte.html')).toString());

			pdf.create(data, options).toBuffer(function(err, buffer){
				res.setHeader('Content-Type', 'application/pdf');
				res.send(buffer);
			});
		}
	});
});

module.exports=router;