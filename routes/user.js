const router = require('express').Router();

const User = require('../models/User');
const Tweet = require('../models/Tweet');
const auth = require('../middlewares/auth');


router.get('/:id', async (req, res) => {
    try {
        const tweets = await Tweet.find({ author: req.params.id }).populate('author');
        const user = await User.findOne({ _id: req.params.id}).populate('following').populate('followers');
        let follower = user.followers.some((friend) => {
            return friend.equals(req.user.id);
        });
        let currentUser = false;
        if(req.user.id === user.id){
            currentUser = true;
        }
        res.render('main/user', { foundUser:user, tweets, currentUser, follower });        
    } catch (error) {
        console.log(error);
    }
});


router.post('/follow/:id', async (req, res) => {
    try {
        await User.findOneAndUpdate({_id: req.user.id, following: {$ne: req.params.id}},{$push:{ following: req.params.id }});
        await User.findOneAndUpdate({_id: req.params.id, followers: {$ne: req.user.id}},{$push:{ followers: req.user.id }});
        res.json("Success");
    } catch (error) {
        console.log(error);
        res.json({error});
    }
});

router.post('/unfollow/:id', async (req, res) => {
    try {
        await User.findOneAndUpdate({_id: req.user.id},{$pull:{ following: req.params.id }});
        await User.findOneAndUpdate({_id: req.params.id},{$pull:{ followers: req.user.id }});
        res.json("Success");
    } catch (error) {
        console.log(error);
        res.json({error});
    }
});

module.exports = router;