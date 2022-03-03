const mysql=require('mysql');
const { promisify }=require('util');

//const { database }=require('./keys.js');

const pool = mysql.createPool(require('./keys.js'));

pool.getConnection((err, connection)=>{
	if(err){
		if(err.code == 'PROTOCOL_CONNECTION_LOST'){
			console.log('¡La conexión con la Base de Datos ha sido cerrada!');
		}else if(err.code == 'ER_CON_COUNT_ERROR'){
			console.log('¡La Base de Datos tiene muchas conexiones!');
		}else if(err.code == 'ECONNREFUSED'){
			console.log('¡La conexión con la Base de Datos ha sido rechazada!');
		}else{
			console.log(err);
		}
	}else{
		connection.release();
		console.log('¡Base de Datos Conectada!');
	}
	return;
});

pool.query=promisify(pool.query);

module.exports=pool;