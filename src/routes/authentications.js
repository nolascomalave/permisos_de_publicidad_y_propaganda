const express=require('express'),
bcrypt=require('bcryptjs'),
router=express.Router(),
path=require('path'),
fs=require('fs');

function validatePassword(password, val){
	let error='';
	if(password.length<1){
		error='¡Debe introducir la contraseña!';
		val=false;
	}else if(password.length<6){
		error='¡La contraseña debe contener, por lo menos, 6 caracteres!';
		val=false;
	}else if(password.length>30){
		error='¡La contraseña no debe contener más de 30 caracteres!';
		val=false;
	}

	return {error, val}
}

router.get('/', (req, res)=>{
	if('usuario' in req.session){
		res.render('inicio');
	}else{
		res.render('start');
	}
});

router.get('/close', (req, res)=>{
	delete req.session.usuario;
	res.redirect('http://'+req.headers.host);
});

router.get('/password', (req, res)=>{
	if('usuario' in req.session){
		res.render('password', {tipo_usuario:req.session.usuario.tipo_usuario});
	}else{
		res.redirect('http://'+req.headers.host);
	}
});

router.post('/password', async (req, res)=>{
	if('usuario' in req.session){
		let pool=require('../database.js'), valid=true, { password, pass1, pass2 }=req.body, errors={};

		let validPassword=validatePassword(password, valid);
		if(validPassword.error.length>0){
			valid=validPassword.val;
			errors.password=validPassword.error;
		}

		if(pass1==password){
			valid=false;
			errors.pass1='¡La nueva contraseña no debe ser igual a la contraseña actual!';
		}

		if(pass2!=pass1){
			valid=false;
			errors.pass2='¡Las contraseñas no coinciden!';
		}

		let validPass1=validatePassword(pass1, valid);
		if(validPass1.error.length>0){
			valid=validPass1.val;
			errors.pass1=validPass1.error;
		}

		let validPass2=validatePassword(pass2, valid);
		if(validPass2.error.length>0){
			valid=validPass2.val;
			errors.pass2=validPass2.error;
		}

		await pool.query('SELECT * FROM usuarios WHERE username=?', [req.session.usuario.indicador], async (err, result)=>{
			if(err){
				res.send(err);
			}else{
				if(bcrypt.compareSync(password, result[0].password)==false){
					errors.password='¡La contraseña es incorrecta!';
					res.render('password', { errors, values: req.body, tipo_usuario:req.session.usuario.tipo_usuario });
				}else{
					if(valid==true){
						let hash=bcrypt.hashSync(pass1, 10);
						await pool.query('UPDATE usuarios SET password=? WHERE username=?', [hash, req.session.usuario.indicador], (errno, resulter)=>{
							if(errno){
								res.send(errno);
							}else{
								res.redirect('http://'+req.headers.host+'/close');
							}
						});
					}else{
						res.render('password', { errors, values: req.body, tipo_usuario:req.session.usuario.tipo_usuario });
					}
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

module.exports=router;