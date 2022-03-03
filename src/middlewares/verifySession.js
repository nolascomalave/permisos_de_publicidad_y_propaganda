module.exports=function(req, res, next){
    if(!req.session.usuario) return res.status(401, '¡No ha iniciado sessión!');
    return next();
}