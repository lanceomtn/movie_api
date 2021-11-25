//require modules
const express = require('express');
  morgan = require('morgan');
  mongoose = ('mongoose');
  bodyParser = require('body-parser');
  Models = require('./models.js');

const app = express();

const Moview = Models.Movie;
const Users = Models.User;

//connect to local database
mongoose.connect('mongodb://localhost:27017/myMoviesDB', {
  useNewUrlParser: true, useUnifiedTopology: true });

//create middleware functions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(morgan('common')); //log requests to terminal
app.use(express.static('public'));  //routes all requests for static files to files in the public folder
app.use(express.json());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport.js');


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
app.get('/movies', (req, res) =>{
res.status(200).json(movies)
});

//return data about a single movie by title
app.get('/movies/:title', (req, res) => {
    res.json(movies.find( (movie) => {
        return movie.title === req.params.title
    }));
});

//return data about a genre by genre name
app.get('/movies/:title/genre', (req, res) => {
    res.send('Successful GET request returning data about a genre.');
});

//return data about a director by director name
app.get('/movies/director/:name', (req, res) => {
    res.send('Successful GET request returning data about a director.');
});

//allow new users to register
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            email: req.body.email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
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
      res.status(500).send('Error: ' + err);
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

//allow users to update their user info
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:id/favorites', (req, res) => {
    res.send('Successful DELETE request - user removed movie from favorites');
});

//allow existing users to deregister
app.delete('/users/:Username', (req, res) => {
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
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
