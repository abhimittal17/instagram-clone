const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    picture: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    data: {
        type: Date,
        default: Date.now,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    caption: {
        type: String,
    },
});

module.exports = mongoose.model('post', postSchema);
