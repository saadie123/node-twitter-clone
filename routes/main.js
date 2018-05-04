const router = require('express').Router();
const fs = require('fs');
const validator = require('validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');
const Tweet = require('../models/Tweet');
const auth = require('../middlewares/auth');
const {isEmpty,uploadDir} = require('../helpers/helpers.js');

router.get('/', async (req, res) => {
    if(req.user){
        const tweets = await Tweet.find().populate('author').sort({'created':'desc'});
        if(!tweets){
            return res.render('main/home',{message: 'You have no tweets!'});
        }
        res.render('main/home', {tweets});
    }else{
        res.render('main/landing');
    }
});


router.get('/register', auth.preAuthCheck,(req, res) => {
    res.render('account/register');
});

router.get('/login', auth.preAuthCheck,(req, res) => {
    res.render('account/login');
});

router.get('/update-profile', async (req, res)=> {
    const user = await User.findById(req.user.id);
    const form = {
        name: user.name,
        email: user.email
    }
    res.render('main/update-profile',{form,profilePic:user.profilePic});
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_message', 'You have logged out!');
    res.redirect('/login');
});



router.post('/register', auth.preAuthCheck,async (req, res) => {
    const oldUser = await User.findOne({email:req.body.email});
    const errors = {
        profilePic: [],
        name: [],
        email: [],
        password: [],
        confirmPassword: []
    }
    if(isEmpty(req.files)){
        errors.profilePic.push({message: 'Please choose your profile picture'});
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
    if(oldUser){
        errors.email.push({message: 'An account is already registered with this email!'});
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
    if(errors.name.length > 0 || errors.email.length > 0 || errors.password.length > 0 || errors.confirmPassword.length > 0 || errors.profilePic.length > 0){
        res.render('account/register',{errors,form:req.body});
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, async (err, hash) => {
                if(err){
                    console.log(error);
                    return
                }
                try {
                    const file = req.files.profilePic;
                    const fileName = Date.now() + '-'+file.name;
                    file.mv(`./public/uploads/${fileName}`, (error) => {
                        if(error) console.log(error);
                    });
                    const user = new User({
                        profilePic: fileName,
                        name: req.body.name,
                        email: req.body.email,
                        password: hash
                    });
                    await user.save();
                    req.flash('success_message', 'You have registered successfully. Please login now!');
                    res.redirect('/login');
                } catch (error) {
                    console.log(error);
                }
            });
        });
    }
});

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser( async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(null, false);
        console.log(error);
    }
});

passport.use(new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
    try {
        const user = await User.findOne({email});
        if(!user){
            return done(null, false, {message: 'No user was found with this email!'});
        }
        bcrypt.compare(password, user.password, (err, matched) => {
            if (err) {
                console.log(err);
                return err
            }
            if(!matched){
                return done(null, false, {message:'Incorrect password!'});
            }
            done(null, user);
        })
    } catch (error) {
        console.log(error);
    }
}));

router.post('/login', auth.preAuthCheck, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


router.post('/update-profile', async (req, res)=>{
    const errors = {
        name: [],
        email: [],
        profilePic: []
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
    if(errors.name.length > 0 || errors.email.length > 0 || errors.profilePic.length > 0){
        const profilePic = req.user.profilePic;
        res.render('main/update-profile',{errors,form:req.body, profilePic});           
    }
    else{
        let body = {
            name: req.body.name,
            email: req.body.email
        }
        if(!isEmpty(req.files)){
            let user = await User.findById(req.user.id);
            fs.unlink(uploadDir+user.profilePic,(error)=>{
                if(error) console.log(error);
            });
            let file = req.files.profilePic;
            const fileName = Date.now()+'-'+file.name;
            file.mv(`./public/uploads/`+fileName, error =>{
                if(error) console.log(error);
            });
            body.profilePic = fileName;
        }
        const updatedUser = await User.findByIdAndUpdate(req.user.id,{$set:body},{new:true});
        req.flash('success_message',`Your profile has been updated!`);
        res.redirect('/update-profile');
    }
    
});

module.exports = router;