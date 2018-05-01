const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'
    },
    content: String,
    created: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('tweets', tweetSchema);