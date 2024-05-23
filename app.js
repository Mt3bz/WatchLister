const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const axios = require('axios');
const fetch = require('node-fetch');
const User = require('./models/User');
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require('connect-flash');
const session = require("express-session");
const bcrypt = require("bcrypt");
const Movie = require('./models/movie'); // Import the Movie model
const connectDB = require('./server/config/db');



// create the app
const app = express();
const port = 5000;


app.use(express.urlencoded({extended: true}));
app.use(express.json());


// Static Files
app.use(express.static('public'));


// Templating in engine
app.set('view engine', 'ejs');





// connect to db
connectDB();



app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'WebProject',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false,
    maxAge: 1000 * 60 * 60,
   }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated() || req.session.userId) {
    return next(); // Allow access if user is authenticated and session userId exists
  } else {
    req.flash('error', 'Please log in to access this page'); // Set flash message
    return res.redirect('/login'); // Redirect to login page
  }
}

// Handling user signup
app.post("/register", async (req, res) => {
  try {
    // 1. Validate username uniqueness (replace with your actual model logic)
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      req.flash('error', 'Username already exists'); // Set flash message
      return res.redirect('/register'); // Redirect back to registration page
    }

    // 2. Hash password securely using bcrypt
    const saltRounds = 10; // Adjust as needed (higher = more secure, but slower)
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // 3. Create user with hashed password
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
    });

    req.flash('success', 'User created successfully!'); // Set success message
    return res.redirect('/login'); // Redirect to login page
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred during registration'); // Set error message
    return res.redirect('/register'); // Redirect back to registration page
  }
});



//Handling user login


app.post('/login', async function (req, res) {
  try {
    // Check if the user exists
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      req.flash('error', 'User doesn\'t exist');
      return res.redirect('/login');
    }

    // Compare hashed passwords securely
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/login');
    }

    // Login successful
    req.session.userId = user._id;
    console.log('Session expiry time:', req.session.cookie.maxAge);

    // Redirect to mylist page
    return res.redirect('/mylist');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred during login');
    return res.redirect('/login');
  }
});




// Handling user logout
app.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    req.user = null; // Manually remove user from the session
    res.redirect('/home');
  });
});




// Save movie to user's library
async function addToLibrary(req, res) {
  if (!req.isAuthenticated() && !req.session.userId) {
    // User is not authenticated or session userId is not set
    return res.redirect('/login');
  }

  const { title, poster_path, vote_average } = req.body;
  const userId = req.isAuthenticated() ? req.user._id : req.session.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the movie already exists in the user's library
    const existingMovie = await Movie.findOne({ title });

    if (existingMovie) {
      const isMovieInLibrary = user.movies.some(movie => movie.equals(existingMovie._id));
      if (isMovieInLibrary) {
        req.flash('error', 'Movie already in library');
        return res.redirect('/mylist');
      } else {
        user.movies.push(existingMovie._id);
        await user.save();
        req.flash('success', 'Movie added to library successfully');
        return res.redirect('/mylist');
      }
    }

    const newMovie = new Movie({
      title,
      poster_path,
      vote_average,
    });

    await newMovie.save();
    user.movies.push(newMovie._id);
    await user.save();

    req.flash('error', 'Movie added to library successfully');
    return res.redirect('/home');
  } catch (error) {
    console.error('Error saving movie to user:', error);
    req.flash('error', 'Error saving movie to library');
    return res.redirect('/home');
  }
}

app.post('/library', isLoggedIn, addToLibrary);



app.get('/mylist', isLoggedIn, async function (req, res) {
  try {
    const userId = req.isAuthenticated() ? req.user._id : req.session.userId;
    const user = await User.findById(userId).populate('movies').exec();

    if (!user) {
      console.log('User not found');
      return res.redirect('/login');
    }
    res.render("mylist", { flash: req.flash("error")[0], user: user });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).send('Error fetching user data');
  }
});


app.post("/mylist/:movieId/watched", isLoggedIn, async function (req, res) {
  try {
    const userId = req.session.userId;
    const movieId = req.params.movieId;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found");
      return res.redirect("/login");
    }

    // Remove the movie from user's movies array by movieId
    user.movies.pull(movieId);
    await user.save();
    req.flash('error', 'Movie removed from your list');
    console.log("Movie marked as watched and removed from user's list");

    // Redirect the user back to the mylist page
    res.redirect("/mylist");
  } catch (err) {
    console.error("Error marking movie as watched:", err);
    return res.status(500).send("Error marking movie as watched");
  }
});



// Routes
app.use('/', require('./server/routes/index'))
app.listen(port, ()=>{
  console.log(`App Listening on port ${port}`);
})