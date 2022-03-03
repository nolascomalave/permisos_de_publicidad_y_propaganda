module.exports=function verifyRoles(...roles){
    return (req, res, next)=>{
        if(!roles.some(role=> role===req.session.usuario.tipo_usuario)) return res.status(403).json({message:'¡Usted no tiene los permisos necesarios para realizar ésta operación!'});
        return next();
    }
}