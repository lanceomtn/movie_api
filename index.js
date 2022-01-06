//require modules
const express = require('express');
  morgan = require('morgan');
  mongoose = require('mongoose');
  bodyParser = require('body-parser');
  Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const app = express();

const Movies = Models.Movie;
const Users = Models.User;

//connect to local database
//mongoose.connect('mongodb://localhost:27017/myMoviesDB', {
  //useNewUrlParser: true, useUnifiedTopology: true });

//connect to online database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true, useUnifiedTopology: true });

//create middleware functions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(morgan('common')); //log requests to terminal
app.use(express.static('public'));  //routes all requests for static files to files in the public folder
app.use(express.json());

//import passport js module
const passport = require('passport');
require('./passport');

app.use(passport.initialize());

//install cors
const cors = require('cors');
app.use(cors());
 

//import the auth endpoint
const auth = require('./auth')(app);

//display index(homepage)
app.get('/', (req, res) =>{
  res.send('Welcome to My Movies!');
});

//display documentation page
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname }
    );
});

//return a list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then(function(movies) {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//return data about a single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title : req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//return data about a genre by genre name
app.get('/movies/genres/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Genre.Name" : req.params.name })
    .then((genre) => {
      res.json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//return data about a director by director name
app.get('/movies/directors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ "Director.Name" : req.params.name })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//allow new users to register
app.post('/users',
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('email', 'email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            email: req.body.email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Error: ' + err);
    });
});

//get user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//allow users to update a userinfo by username
app.put('/users/:ID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ id: req.params.id }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      email: req.body.email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//allow existing users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//create error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error has been found!');
  next();
});

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
