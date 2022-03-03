const pool = require("../database");
const createAdmin=require('../lib/createAdmin.js');

module.exports=async function createSession(req, res, next){
    if('usuario' in req.session) return next();
    try{
        let admin=await pool.query('SELECT * FROM usuarios WHERE username=?', ['ADMIN']);
        admin=admin[0] || null;
        if(!admin) console.log('¡No se ha podido encontrar al usuario administrador!');
        else req.session.usuario={
            indicador: admin.username,
            nombre: admin.nombre,
            apellido: admin.apellido,
            cargo: admin.cargo,
            tipo_usuario: admin.tipo_usuario,
        };
        return next();
    }catch(e){
        console.log('¡Ha ocurrido un error al crear la sesión del usuario administrador!');
        return next();
    }
}