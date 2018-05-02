const router = require('express').Router();
const async = require('async');

const Tweet = require('../models/Tweet');
const auth = require('../middlewares/auth');

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

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_message', 'You have logged out!');
    res.redirect('/login');
});


module.exports = router;