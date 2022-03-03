const bcrypt = require("bcryptjs");

module.exports=async function createAdmin(pool){
    try{
        let exist=await pool.query('SELECT idDocument FROM usuarios WHERE username=?', ['ADMIN']);
        if(!exist[0]===false) return;

        let user=await pool.query('INSERT INTO usuarios (idDocument, nombre, apellido, cargo, tipo_usuario, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)', ['0000000', 'ADMIN', 'ADMIN', 'ADMIN', 'Desarrollador', 'ADMIN', bcrypt.hashSync('ADMINS', bcrypt.genSaltSync(10))]);
    }catch(e){
        console.log(e);
    }
}