const express=require('express'),
router=express.Router(),
path=require('path'),
multer=require('multer'),
upload=multer(),
bcrypt=require('bcryptjs');

function validateName(name, typeName, val){
	let memory="";
	if(name.length>0){
		if(gf.isName(name)==false){
			memory='¡El '+typeName+' del usuario no debe contener números ni caractéres especiales, a excepción del caracter "-"!';
			val=false;
		}else if(name.length>50){
			memory='¡El '+typeName+' del usuario no debe exceder los 50 caracteres!';
			val=false;
		}else if(name.length<2){
			memory='¡El '+typeName+' del usuario no debe definirse por menos de 2 caracteres!';
			val=false;
		}
	}else{
		memory='¡Debe introducir el '+typeName+' del usuario!';
		val=false;
	}

	return { val, memory }
}

router.get('/', async (req, res)=>{
	if(('usuario' in req.session) && (req.session.usuario.tipo_usuario=='Desarrollador' || req.session.usuario.tipo_usuario=='Administrador')){
		const pool=require('../database.js');
		
		await pool.query('SELECT * FROM usuarios', (err, result, fields)=>{
			if(err){
				res.render('usuarios', { resultado: err, usuario: req.session.usuario });
			}else{
				res.render('usuarios', { resultado: result, usuario: req.session.usuario });
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

router.get('/add', async (req, res)=>{
	if(('usuario' in req.session) && (req.session.usuario.tipo_usuario=='Desarrollador' || req.session.usuario.tipo_usuario=='Administrador')){
		res.render('nuevoUsuario', {typeform: 'add'});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/add', async (req, res)=>{
	if(('usuario' in req.session) && (req.session.usuario.tipo_usuario=='Desarrollador' || req.session.usuario.tipo_usuario=='Administrador')){
		const pool=require('../database.js');
		let valid=true, errors={};

		let nombre=gf.sanitizeString(gf.firstCharName(req.body.nombre)),
		apellido=gf.sanitizeString(gf.firstCharName(req.body.apellido)),
		cedula=gf.sanitizeString(gf.extractNumberInText(gf.extractNumberInText(req.body.cedula))),
		cargo=gf.sanitizeString(gf.firstCharName(req.body.cargo)),
		typeUser=gf.sanitizeString(req.body.typeUser);

		values={
			nombre,
			apellido,
			cedula,
			cargo,
			typeUser
		}

		let nombreValidate=validateName(nombre, 'nombre', valid);
		valid=nombreValidate.val;
		if(nombreValidate.memory.length>0){
			errors.nombre=nombreValidate.memory;
		}

		let apellidoValidate=validateName(apellido, 'apellido', valid);
		valid=apellidoValidate.val;
		if(apellidoValidate.memory.length>0){
			errors.apellido=apellidoValidate.memory;
		}

		if(cedula.length>0){
			if(isNaN(cedula)){
				errors.cedula='¡El número de cédula no debe estar compuesto por números naturales!';
				valid=false;
			}else if(cedula.length<7){
				errors.cedula='¡El usuario debe estar apto para trabajar!';
				valid=false;
			}else if(cedula.length>9){
				errors.cedula='¡Actualmente no existen más de 999.999.999 personas registradas en los registros de ciudadanía venezolana!';
				valid=false;
			}
		}else{
			errors.cedula='¡Debe introducir el número de cédula del usuario!';
			valid=false;
		}

		if(cargo.length>0){
			if(cargo.length<4){
				errors.cargo="¡El cargo no debe contener, como mínimo, 4 caracteres!";
				valid=false;
			}else if(cargo.length>50){
				errors.cargo="¡El cargo debe contener, como máximo, 50 caracteres!";
				valid=false;
			}else if(gf.extractNumberInText(cargo).length>0){
				errors.cargo="¡El cargo no debe contener caracteres numéricos!";
				valid=false;
			}
		}else{
			errors.cargo="¡Debe definir el cargo!";
			valid=false;
		}

		/*let cargoValidate=validateName(cargo, 'cargo', valid);
		valid=cargoValidate.val;
		if(cargoValidate.memory.length>0){
			errors.cargo=cargoValidate.memory;
		}*/

		if(typeUser!='Administrador' && typeUser!='Analista' && typeUser!='Desarrollador'){
			errors.typeUser='¡Los únicos valores aceptados como tipo de usuario son "Administrador", "Analista" y "Desarrollador"';
			valid=false;
		}

		if(valid==false || errors.length>0){
			res.render('nuevoUsuario', { errors, values, typeform:'add' });
		}else{
			let username=gf.destilde(apellido).toUpperCase()+gf.destilde(nombre.charAt(0)).toUpperCase();
			let salt=bcrypt.genSaltSync(10), hash=bcrypt.hashSync(cedula, salt);

			await pool.query('SELECT username FROM usuarios WHERE username LIKE ?', [username+'%'], async (err, result, fields)=>{
				if(err){
					res.render('nuevoUsuario', { err , typeform: 'add'});
					console.log(err);
				}else{
					let usernames=[];

					for(let i=0; i<result.length; i++){
						usernames.push(result[i].username.toLowerCase());
					}
					usernames.sort();

					username=gf.username(nombre, apellido, usernames).toUpperCase();

					await pool.query('SELECT idDocument FROM usuarios WHERE idDocument=?', [cedula], async (errores, resulter)=>{
						if(err){
							res.render('nuevoUsuario', {err:error, typeform:'add'});
						}else{
							if(resulter.length>0){
								errors.cedula='¡La cédula introducida ya se encuentra registrada!';
								res.render('nuevoUsuario', { errors, values, typeform: 'add' });
							}else{
								await pool.query('INSERT INTO usuarios (idDocument, nombre, apellido, cargo, tipo_usuario, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)', [cedula, nombre, apellido, cargo, typeUser, username, hash], (error, resultados)=>{
									if(error){
										res.render('nuevoUsuario', {err:error, typeform: 'add'});
									}else{
										res.redirect('/usuarios');
									}
								});
							}
						}
					});

				}
			});

			pool.end((err)=>{
				if(err){
					console.log(err);
				}
			});
		}
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.get('/edit/:username', async (req, res)=>{
	if(('usuario' in req.session) && (req.session.usuario.tipo_usuario=='Desarrollador' || req.session.usuario.tipo_usuario=='Administrador')){
		let pool=require('../database.js');

		await pool.query('SELECT * FROM usuarios WHERE username=?', [req.params.username], (err, result, fields)=>{
			if(err){
				res.send({
					message: '¡Ha ocurrido un error en la base de datos al obtener la información de usuario seleccionado!'
				});
			}else{
				if(req.session.usuario.indicador==result[0].username || result[0].tipo_usuario=='Desarrollador'){
					res.redirect('http://'+req.headers.host+'/usuarios');
				}else{
					let values={
						nombre:result[0].nombre,
						apellido:result[0].apellido,
						cedula: result[0].idDocument,
						cargo:result[0].cargo,
						tipo_usuario:result[0].tipo_usuario,
						username:result[0].username
					}
					res.render('nuevoUsuario', { values, typeform: 'edit' });
				}
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

router.post('/edit/:username', async (req, res)=>{
	if(('usuario' in req.session) && (req.session.usuario.tipo_usuario=='Desarrollador' || req.session.usuario.tipo_usuario=='Administrador')){
		let pool=require('../database.js'), valid=true, errors={};

		let nombre=gf.sanitizeString(gf.firstCharName(req.body.nombre)),
		apellido=gf.sanitizeString(gf.firstCharName(req.body.apellido)),
		cedula=gf.sanitizeString(gf.extractNumberInText(req.body.cedula)),
		cargo=gf.sanitizeString(gf.firstCharName(req.body.cargo)),
		typeUser=gf.sanitizeString(req.body.typeUser),
		username=gf.sanitizeString(req.body.username);

		values={
			nombre,
			apellido,
			cedula,
			cargo,
			typeUser,
			username
		}

		let nombreValidate=validateName(nombre, 'nombre', valid);
		valid=nombreValidate.val;
		if(nombreValidate.memory.length>0){
			errors.nombre=nombreValidate.memory;
		}

		let apellidoValidate=validateName(apellido, 'apellido', valid);
		valid=apellidoValidate.val;
		if(apellidoValidate.memory.length>0){
			errors.apellido=apellidoValidate.memory;
		}

		if(cedula.length>0){
			if(isNaN(cedula)){
				errors.cedula='¡El número de cédula no debe estar compuesto por números naturales!';
				valid=false;
			}else if(cedula.length<7){
				errors.cedula='¡El usuario debe estar apto para trabajar!';
				valid=false;
			}else if(cedula.length>9){
				errors.cedula='¡Actualmente no existen más de 999.999.999 personas registradas en los registros de ciudadanía venezolana!';
				valid=false;
			}
		}else{
			errors.cedula='¡Debe introducir el número de cédula del usuario!';
			valid=false;
		}

		if(cargo.length>0){
			if(cargo.length<4){
				errors.cargo="¡El cargo no debe contener, como mínimo, 4 caracteres!";
				valid=false;
			}else if(cargo.length>50){
				errors.cargo="¡El cargo debe contener, como máximo, 50 caracteres!";
				valid=false;
			}else if(gf.extractNumberInText(cargo).length>0){
				errors.cargo="¡El cargo no debe contener caracteres numéricos!";
				valid=false;
			}
		}else{
			errors.cargo="¡Debe definir el cargo!";
			valid=false;
		}

		/*let cargoValidate=validateName(cargo, 'cargo', valid);
		valid=cargoValidate.val;
		if(cargoValidate.memory.length>0){
			errors.cargo=cargoValidate.memory;
		}*/

		if(typeUser!='Administrador' && typeUser!='Analista' && typeUser!='Desarrollador'){
			errors.typeUser='¡Los únicos valores aceptados como tipo de usuario son "Administrador", "Analista" y "Desarrollador"';
			valid=false;
		}

		if(valid==false || errors.length>0){
			res.render('nuevoUsuario', { errors, values, typeform:'edit' });
		}else{
			await pool.query('SELECT * FROM usuarios WHERE idDocument=?', [cedula], (error, resultado)=>{
				if(error){
					res.send(error);
				}else{
					let edit=async ()=>{
						await pool.query('UPDATE usuarios SET nombre=?, apellido=?, idDocument=?, cargo=?, tipo_usuario=? WHERE username=?', [nombre, apellido, cedula, cargo, typeUser, username], (err, result, fields)=>{
							if(err){
								res.send(err);
							}else{
								res.redirect('/usuarios');
							}
						});
					}
					if(resultado.length>0){
						if(resultado[0].username!=username){
							errors.cedula='¡El número de cédula introducido ya se encuentra registrado en otro usuario!';
							res.render('nuevoUsuario', { errors, values, typeform:'edit' });
						}else{
							edit();
						}
					}else{
						edit();
					}
				}
			});

			pool.end((err)=>{
				if(err){
					console.log(err);
				}
			});
		}
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/delete', upload.none(), async (req, res)=>{
	if(('usuario' in req.session) && (req.session.usuario.tipo_usuario=='Desarrollador' || req.session.usuario.tipo_usuario=='Administrador')){
		let pool=require('../database.js');

		await pool.query('DELETE FROM usuarios WHERE username=?', [req.body.username], (err, result, fields)=>{
			if(err){
				res.send(err);
			}else{
				res.send({
					success: '¡El usuario ha sido eliminado correctamente!'
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

router.post('/login', upload.none(), async (req, res)=>{
	let pool=require('../database.js'), valid=true, {indicador, password}=req.body, errors={};
	indicador=gf.sanitizeString(indicador).toUpperCase();

	if(indicador.length<1){
		errors.indicador='¡Debe introducir su indicador de usuario!';
		valid=false;
	}else if(indicador.length<3){
		errors.indicador='¡El indicador debe contener, por lo menos, 3 letras!';
		valid=false;
	}else if(indicador.length>51){
		errors.indicador='¡El indicador debe contener, como máximo, 51 letras!';
		valid=false;
	}else if(gf.extractNumberInText(indicador).length>0){
		errors.indicador='¡El indicador no debe contener números!';
		valid=false;
	}

	if(password.length<1){
		errors.password='¡Debe introducir la contraseña!';
		valid=false;
	}else if(password.length<6){
		errors.password='¡La contraseña debe contener, por lo menos, 6 caracteres!';
		valid=false;
	}else if(password.length>30){
		errors.password='¡La contraseña no debe contener más de 30 caracteres!';
		valid=false;
	}

	if(valid==false || (('password' in errors) || ('indicador' in errors))){
		res.send(errors);
	}else{

		await pool.query('SELECT * FROM usuarios WHERE username=?', [indicador], async (err, result, fields)=>{
			if(err){
				res.send(err);
			}else{
				if(result.length<1){
					errors.indicador='¡Usuario no encontrado!';
					res.send(errors);
				}else{

					if(bcrypt.compareSync(password, result[0].password)==true){
						req.session.usuario={
							indicador: result[0].username,
							nombre: result[0].nombre,
							apellido: result[0].apellido,
							cargo: result[0].cargo,
							tipo_usuario: result[0].tipo_usuario,
						};
						res.send({
							success: '¡Usuario Correcto!'
						});
					}else{
						errors.password='¡Contraseña incorrecta!';
						res.send(errors);
					}
				}
			}
		});

		pool.end((err)=>{
			if(err){
				console.log(err);
			}
		});
	}
});

module.exports=router;