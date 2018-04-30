const router = require('express').Router();
const validator = require('validator');
const bcrypt = require('bcrypt');

const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('main/landing');
});

router.get('/register', (req, res) => {
    res.render('main/register');
});
router.post('/register', (req, res) => {
    const errors = {
        name: [],
        email: [],
        password: [],
        confirmPassword: []
    }
    if(!req.body.name){
        errors.name.push({message:"Name is required!"});
    }
    if(!req.body.email){
        errors.email.push({message:'Email is required!'});
    }
    if(!validator.isEmail(req.body.email)){
        errors.email.push({message:'Please enter a valid email address!'});
    }
    if(!req.body.password){
        errors.password.push({message:'Password is required!'});
    }
    if(req.body.password.length < 8){
        errors.password.push({message:'Password must be at least 8 characters'});
    }
    if(req.body.password !== req.body.confirmPassword){ 
        errors.confirmPassword.push({message:'Passwords do not match!'});      
    }
    if(!req.body.confirmPassword){
        errors.confirmPassword.push({message:'Please confirm your password!'});
    }
    if(errors.name.length > 0 || errors.email.length > 0 || errors.password.length > 0 || errors.confirmPassword.length > 0){
        res.render('main/register',{errors,form:req.body});
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, async (err, hash) => {
                if(err){
                    console.log(error);
                    return
                }
                try {
                    const user = new User({
                        name: req.body.name,
                        email: req.body.email,
                        password: hash
                    });
                    await user.save();
                    res.redirect('/');
                } catch (error) {
                    console.log(error);
                }
            });
        });
    }
})

module.exports = router;