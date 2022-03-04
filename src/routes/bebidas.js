const express=require('express'),
multer=require('multer'),
router=express.Router(),
path=require('path'),
fs=require('fs'),
upload=multer(),
pdf=require('html-pdf');

// Funciones Usadas:
const gf=require('../globalFunctions');

// Middlewares:
const verifySession=require('../middlewares/verifySession');
const verifyRoles=require('../middlewares/verifyRoles');

// Multer Settings:
const storageProyect= multer.diskStorage({
	destination: path.join(__dirname, /*'../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'),*/'../public/server-files/temps/'),
	filename: (req, file, funcion)=>{
		if('usuario' in req.session){
			funcion(null, file.fieldname+'_de_pago_'+Date.now()+file.originalname.substr(file.originalname.lastIndexOf('.'), file.originalname.length-1));
		}
	}
});

const storageAprobate= multer.diskStorage({
	destination: path.join(__dirname, /*'../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'),*/'../public/server-files/temps/'),
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
		await pool.query('SELECT * FROM permisos_bebidas', (err, result, fields)=>{
			if(err){
				res.render('global', {
					permisos: err,
					titlePage: 'Venta de Bebidas Alcohólicas',
					titleResources: "bebidas",
					host: req.headers.host.substring(0, 10),
					tipo_usuario: req.session.usuario.tipo_usuario
				});
			}else{
				res.render('global', {
					permisos: result,
					titlePage: 'Venta de Bebidas Alcohólicas',
					titleResources: "bebidas",
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
		await pool.query('SELECT * FROM permisos_bebidas WHERE id=?', [req.body.id], (err, result, fields)=>{
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
		
		await pool.query('SELECT * FROM permisos_bebidas', (err, resultados, fields)=>{
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
			await pool.query('SELECT * FROM permisos_bebidas WHERE codigo_permiso LIKE ?', [hoy.getFullYear()+'%'], async (err, result, fields)=>{
				if(err){
					res.send(err);
					if('file' in req){
						gf.deleteFile(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
					}
				}else{
					let lastPermiso='';

					if('file' in req){
						if(fs.existsSync(path.join(__dirname, "../public/server-files/temps/"+req.file.filename))){
							let data=fs.readFileSync(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
							if(data){
								fs.writeFileSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+req.file.filename), data);
								fs.unlinkSync(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
							}else{
								res.send(errorFile);
							}
						}

						fileName=req.file.filename;
					}

					if(result.length>0){
						lastPermiso=result[result.length-1].codigo_permiso;
						lastPermiso=fecha.getFullYear()+'-'+gf.adaptNum(Number(Number(lastPermiso.substr(5, lastPermiso.length-1))+1));
						//await pool.query('INSERT INTO permisos_bebidas (id, codigo_permiso, emicion, dat_confirmacion, requisitor_nombre, requisitor_nombre_apellido, requisitor_doc, requisitor_tlf, requisitor_habitacion, sector_permisado, comprobante_de_pago, permiso_autorizado, creador, editor, fecha_creacion, emitido) VALUES(null, ?, 1, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, null, 1)', []);
					}else{
						lastPermiso=fecha.getFullYear()+'-'+gf.adaptNum(1);
					}

					let datConfirmacion=0, pagoDoc='';

					if('file' in req){
						datConfirmacion=1;
						pagoDoc=req.file.filename;
					}
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
						pagoDoc,
						"",
						req.session.usuario.nombre+' '+req.session.usuario.apellido,
						"",
						0,
						0,
						""
					];

					await pool.query('INSERT INTO permisos_bebidas (id, codigo_permiso, habilitacion, vencimiento, horario, dat_confirmacion, requisitor_nombre, requisitor_apellido, requisitor_doc, requisitor_tlf, requisitor_habitacion, sector_permisado, comprobante_de_pago, permiso_autorizado, creador, editor, emitido, cancelado, observacion) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, (error, resultado, filas)=>{
						if(error){
							res.send(error);
							console.log(error);
							if('file' in req){
								if(fs.existsSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+req.file.filename))){
									fs.unlinkSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+req.file.filename));
								}
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
			await pool.query('SELECT * FROM permisos_bebidas WHERE id=?', [req.body.permiso], async (err, result, fields)=>{
				if(err){
					res.send(err);
				}else if(result[0].id==req.body.permiso){
					let datConfirmacion=0, comprobantName=result[0].comprobante_de_pago;

					if(req.body.needPermiso=='true'){
						datConfirmacion=1;
						if('file' in req){
							comprobantName=req.file.filename;

							if(fs.existsSync(path.join(__dirname, "../public/server-files/temps/"+req.file.filename))){
								let data=fs.readFileSync(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
								if(data){
									fs.writeFileSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+req.file.filename), data);
									fs.unlinkSync(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
								}
							}

							if(result[0].comprobante_de_pago.length>0){
								if(fs.existsSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+result[0].comprobante_de_pago))){
									fs.unlinkSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+result[0].comprobante_de_pago));
								}
							}
						}
					}else if('file' in req){
						gf.deleteFile(path.join(__dirname, "../public/server-files/temps/"+req.file.filename));
					}else if(result[0].comprobante_de_pago.length>0){
						if(fs.existsSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+result[0].comprobante_de_pago))){
							fs.unlinkSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+result[0].comprobante_de_pago));
						}
						comprobantName='';
					}

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
						comprobantName,
						"",
						result[0].creador,
						req.session.usuario.nombre+' '+req.session.usuario.apellido,
						null,
						0,
						req.body.permiso
					];

					await pool.query('UPDATE permisos_bebidas SET habilitacion=?, vencimiento=?, horario=?, dat_confirmacion=?, requisitor_nombre=?, requisitor_apellido=?, requisitor_doc=?, requisitor_tlf=?, requisitor_habitacion=?, sector_permisado=?, comprobante_de_pago=?, permiso_autorizado=?, creador=?, editor=?, fecha_creacion=?, emitido=? WHERE id=?', values, async (error, resultado, filas)=>{
						if(error){
							if('file' in req){
								if(fs.existsSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+req.file.filename))){
									fs.unlinkSync(path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+req.file.filename));
								}
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

		await pool.query('UPDATE permisos_bebidas SET permiso_autorizado=?, emitido=1 WHERE id=?', [req.file.filename, req.body.permiso], (err, result, fields)=>{
			if(err){
				res.send(err);
			}else{
				gf.moveFiles(path.join(__dirname, "../public/server-files/temps/"+req.file.filename), path.join(__dirname, '../public/server-files/asuntos_publicos/permisos_municipales/bebidas/'+req.file.filename));
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

		await pool.query('UPDATE permisos_bebidas SET cancelado=?, observacion=? WHERE id=?', [1, req.body.observacion, req.body.permiso], (err, result, fields)=>{
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

router.delete('/', verifySession, verifyRoles('Administrador', 'Desarrollador'), upload.none(), async (req, res)=>{
	let pool=require('../database.js');

	try{
		let permisoToDelete=await pool.query('SELECT comprobante_de_pago, id, codigo_permiso, emitido FROM permisos_bebidas WHERE id=?', [req.body.id]);
		permisoToDelete=permisoToDelete[0] || null;
		if(!permisoToDelete) return res.status(404).json({message:'¡Permiso no encontrado!'});
		if(!permisoToDelete.emitido===false) return res.status(409).json({message:'El permiso no puede ser eliminado una vez ha sido aprobado!'});

		let {comprobante_de_pago, id:deletedId}=permisoToDelete, year=permisoToDelete.codigo_permiso.replace(/\-\d+/, '');
		let permisos=await pool.query('SELECT emitido, cancelado, id, codigo_permiso FROM permisos_bebidas WHERE codigo_permiso LIKE ?', [year+'-%']);

		let existAprobated=permisos.some(el=> el.emitido===1 ? el.id>deletedId ? true : false : false);
		if(existAprobated===true) return res.status(409).json({message:'¡El permiso no puede ser eliminado debido a que existen permisos que han sido aprobados después de haberse creado éste permiso!'});

		gf.deleteFile(path.join(__dirname, '../public/server-files/asuntos_publicos/bebidas/'+comprobante_de_pago));
		permisoToDelete=await pool.query('DELETE FROM permisos_bebidas WHERE id=?', [req.body.id]);
		await permisos.forEach(async permiso=>{
			if(permiso.id>deletedId){
				let code=year+'-'+gf.adaptNum((Number(permiso.codigo_permiso.replace(/\d+\-/, ''))-1));
				await pool.query('UPDATE permisos_bebidas SET codigo_permiso=? WHERE id=?', [code, permiso.id]);
			}
		});
		return res.status(200).json({message:'¡El permiso ha sido eliminado!'});
	}catch(e){
		return res.status(500).json({message: '¡Ha ocurrido un error al realizar la operación!', error:e});
	}
});

router.get('/permiso/:permiso', (req,res,next)=>{
	if('usuario' in req.session){
		next();
	}else{
		res.redirect('http://'+req.headers.host);
	}
}, async (req, res)=>{
	let pool=require('../database');
	let permiso=req.params.permiso.match(/\d{4}\-\d{3}$/gi), type=req.params.permiso.match(/^bebidas\-alcoholicas_/gi);

	if(permiso!=null && type!=null){
		await pool.query('SELECT * FROM permisos_bebidas WHERE codigo_permiso=?', [permiso[0]], (err, permisos)=>{
			if(err){
				res.send(err);
			}else if(permisos.length>0){
				let permiso=permisos[0];
				let params={
					host:req.headers.host,
					habilitacion: gf.convertToDate(permiso.habilitacion),
					codigo: permiso.codigo_permiso,
					vencimiento: gf.convertToDate(permiso.vencimiento),
					requisitor: permiso.requisitor_nombre+' '+permiso.requisitor_apellido,
					ci: permiso.requisitor_doc,
					horario: permiso.horario,
					hab_telf: permiso.requisitor_habitacion+' / '+permiso.requisitor_tlf,
					area_permisada: permiso.sector_permisado
				};

				let data=gf.renderizador(params, fs.readFileSync(path.join(__dirname, '../views/templates/permisos/bebidas.html')).toString());
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
	await pool.query('SELECT * FROM permisos_bebidas', (err, bebidas)=>{
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
				titleReport: 'Reporte Completo de Permisos de Venta de Bebidas Alcohólicas',
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