const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        validate:{
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email address'
        }
    },
    password: {
        type: String,
        required: true
    },
    tweets: [{
        tweet: { type: mongoose.SchemaTypes.ObjectId, ref: 'tweets'}
    }],
    following: [{
        type: mongoose.SchemaTypes.ObjectId, ref: 'users'
    }],
    followers: [{
        type: mongoose.SchemaTypes.ObjectId, ref: 'users'
    }]
});

module.exports = mongoose.model('users', userSchema);