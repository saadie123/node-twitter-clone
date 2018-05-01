const async = require('async');
const Tweet = require('../models/Tweet');
const User = require('../models/User');
module.exports = (io) => {
    io.on('connect', (socket) => {
        console.log("User Connected");
        const user = socket.request.user
        socket.on('tweet', (data)=>{
            async.parallel([
                function (callback) {
                    io.emit('message', {tweet:data, user});
                },
                function (callback) {
                    const tweet = new Tweet({
                        content: data.content,
                        author: user.id
                    });
                    tweet.save().then(tweet => {
                        callback(tweet);
                    });
                },
                function (tweet) {
                    User.findByIdAndUpdate(user.id,{$push: {tweets: {tweet:tweet.id}}},{new: true})
                    .then(updatedUser=>{
                        console.log("tweet saved");
                        tweet(updatedUser);
                    });
                }
            ]);
        });
    });
}