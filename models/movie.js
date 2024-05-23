// movie.js

const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  poster_path: String,
  vote_average: Number,
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;