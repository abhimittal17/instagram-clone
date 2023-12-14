const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/instagram-clone');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  bio: {
    type: String,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post',
  }],
});

userSchema.plugin(plm); //hum deserialise aur serialise provide karta haa 

module.exports = mongoose.model('user', userSchema);