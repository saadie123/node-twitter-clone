module.exports = {
    preAuthCheck = (req, res, next) => {
        if(!req.user){
            next();
        } else {
            res.redirect('/');
        }
    }
}