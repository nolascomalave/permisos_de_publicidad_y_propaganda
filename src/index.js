const express=require('express'),
session=require('express-session'),
//SQLStore=require('express-mysql-session'),
mysql=require('mysql'),
pool=require('./database.js');
//cookieParser=require('cookie-parser'),
path=require('path');


// Starting App:
const app=express();
require('./lib/createAdmin.js')(pool);



// Settigns:
app.set('port', 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// Session Settings:
const sessionOptions={
	host: 'localhost',
	port: app.get('port'),
	user: 'root',
	password: '',
	database: 'asuntos_publicos'
}

const conexion=mysql.createConnection(sessionOptions)/* ,
sessionStorage=new SQLStore({

}, conexion); */;


// Middlewares:
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({
	key: 'permisos_municipales_pass',
	secret: 'permisos_municipales',
	resave: false,
	saveUninitialized: false
}));
//app.use(require('./middlewares/createSession.js'));




// Routes:
app.use(require('./routes/authentications.js'));
app.use('/venta_de_bebidas', require('./routes/bebidas.js'));
app.use('/eventos_especiales', require('./routes/eventos.js'));
app.use('/publicidad_y_propaganda', require('./routes/publicidad.js'));
app.use('/usuarios', require('./routes/usuarios.js'));

app.get('/ayuda', (req, res)=>{
	if('usuario' in req.session){
		if(req.session.usuario.tipo_usuario!='Administrador' && req.session.usuario.tipo_usuario!='Desarrollador'){
			res.sendFile(path.join(__dirname, 'help-files/admin.pdf'));
		}else{
			res.sendFile(path.join(__dirname, 'help-files/user.pdf'));
		}
	}else{
		res.redirect('http://'+req.headers.host);
	}
});


// Statics:
app.use(express.static(path.join(__dirname, 'public')));



// Starting Server:
const server=app.listen(app.get('port'), ()=>{
	console.log('¡Servidor Iniciado Correctamente!');
});


// Servidor Socket:-----------------------------------------

// Inicialización:
const SocketIO=require('socket.io'),
io=SocketIO(server);

// Socket-Server is Listening Peticions:
io.on('connection', (socket)=>{
	console.log('¡Se ha detectado una conexión!', socket.id);

	function socketEdit(socketDirection, table){
		socket.on(socketDirection, async (data)=>{
			let pool=require('./database'), sql='SELECT * FROM '+table+' WHERE id=?';

			await pool.query(sql, [data.permiso], (err, result, fields)=>{
				if (err) {
					io.sockets.emit(socketDirection, err);
				}else if(result.length>0){
					io.sockets.emit(socketDirection, {
						permiso: result[0],
						id: data.id
					});
				}else{
					io.sockets.emit(socket, {
						errno: '¡NOT FOUND!',
						message: '¡Permiso no encontrado!',
						code: 'ERRPERMIT'
					});
				}
			});

			pool.end();
		});
	}

	// Permiso de Bebidas Alcohólicas:
		// Nuevo Permiso:
		socket.on('bebidas:nuevo-permiso', async (data)=>{
			let pool=require('./database');
			//console.log(data);
			//io.sockets.emit('bebidas:nuevo-permiso', data);

			await pool.query('SELECT * FROM permisos_bebidas WHERE codigo_permiso=?', [data.permiso], (err, result, fields)=>{
				if(err){
					io.sockets.emit('bebidas:nuevo-permiso', err);
				}else{
					if(result.length>0){
						io.sockets.emit('bebidas:nuevo-permiso', result[0]);
					}else{
						io.sockets.emit('bebidas:nuevo-permiso', {
							errno: '¡NOT FOUND!',
							message: '¡Permiso no encontrado!',
							code: 'ERRPERMIT'
						});
					}
				}
			});

			pool.end();
		});


		// Edición de Permiso:
		socketEdit('bebidas:edit-permiso', 'permisos_bebidas');

		// Aprobación de Permiso:
		socketEdit('bebidas:aprobate-permiso', 'permisos_bebidas');

		socketEdit('bebidas:cancel-permiso', 'permisos_bebidas');
		

	// Permiso de Eventos Especiales:
		// Nuevo Permiso:
		socket.on('eventos:nuevo-permiso', async (data)=>{
			let pool=require('./database');
			//console.log(data);
			//io.sockets.emit('bebidas:nuevo-permiso', data);

			await pool.query('SELECT * FROM permisos_eventos WHERE codigo_permiso=?', [data.permiso], (err, result, fields)=>{
				if(err){
					io.sockets.emit('eventos:nuevo-permiso', err);
				}else{
					if(result.length>0){
						io.sockets.emit('eventos:nuevo-permiso', result[0]);
					}else{
						io.sockets.emit('eventos:nuevo-permiso', {
							errno: '¡NOT FOUND!',
							message: '¡Permiso no encontrado!',
							code: 'ERRPERMIT'
						});
					}
				}
			});

			pool.end();
		});

	// Edición de Permiso:
		socketEdit('eventos:edit-permiso', 'permisos_eventos');

	// Aprobación de Permiso:
		socketEdit('eventos:aprobate-permiso', 'permisos_eventos');

	// Cancelación de Permiso:
		socketEdit('eventos:cancel-permiso', 'permisos_eventos');


	// Permiso de Publicidad y Propaganda:
		// Nuevo Permiso:
		socket.on('publicidad:nuevo-permiso', async (data)=>{
			let pool=require('./database');
			//console.log(data);
			//io.sockets.emit('bebidas:nuevo-permiso', data);

			await pool.query('SELECT * FROM permisos_publicidad WHERE codigo_permiso=?', [data.permiso], (err, result, fields)=>{
				if(err){
					io.sockets.emit('publicidad:nuevo-permiso', err);
				}else{
					if(result.length>0){
						io.sockets.emit('publicidad:nuevo-permiso', result[0]);
					}else{
						io.sockets.emit('publicidad:nuevo-permiso', {
							errno: '¡NOT FOUND!',
							message: '¡Permiso no encontrado!',
							code: 'ERRPERMIT'
						});
					}
				}
			});

			pool.end();
		});

	// Edición de Permiso:
		socketEdit('publicidad:edit-permiso', 'permisos_publicidad');

	// Aprobación de Permiso:
		socketEdit('publicidad:aprobate-permiso', 'permisos_publicidad');

	// Cancelación de Permiso:
		socketEdit('publicidad:cancel-permiso', 'permisos_publicidad');

	socket.on('bebidas:delete', (data)=>{
		io.sockets.emit('bebidas:delete', data);
	});

	socket.on('publicidad:delete', (data)=>{
		io.sockets.emit('publicidad:delete', data);
	});

	socket.on('eventos:delete', (data)=>{
		io.sockets.emit('eventos:delete', data);
	});
});