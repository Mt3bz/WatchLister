
// Filename - model/User.js
 
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
const User = new Schema({
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    movies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie' // reference to the Movie model
    }]
  });
  
 
User.plugin(passportLocalMongoose);
 
module.exports = mongoose.model('User', User)