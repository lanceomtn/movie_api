//require modules
const express = require('express');
const morgan = require('morgan');
const app = express();

//create movie data
let movies = [
  {
    title: 'American Beauty',
    director: 'Sam Mendes',
    genre: 'Drama',
    year: 1999
  },
  {
    title: 'American Hustle',
    director: 'David Russell',
    genre: ['Crime', 'Drama'],
    year: 2013
  },
  {
    title: 'American Pie',
    director: 'Paul Weitz',
    genre: 'Comedy',
    year: 1999
  },
  {
    title: 'Argo',
    director: 'Ben',
    genre: ['Biography', 'Drama', 'Thriller'],
    year: 2012
  },
  {
    title: 'Better Off Dead',
    director: 'Savage Steve Holland',
    genre: ['Comedy', 'Romance'],
    year: 1985
  },
  {
    title: 'Black Hawk Down',
    director: 'Ridley Scott',
    genre: ['Drama', 'History', 'War'],
    year: 2001
  },
  {
    title: 'Bull Durham',
    director: 'Ron Shelton',
    genre: ['Comedy', 'Romance', 'Sport'],
    year: 1988
  },
  {
    title: 'Catch Me If You Can',
    director: 'Steven Spielberg',
    genre: ['Biography', 'Crime', 'Drama'],
    year: 2002
  },
  {
    title: 'Charlie Wilson\'s War',
    director: 'Mike Nichols',
    genre: ['Biography', 'Comdedy', 'Drama'],
    year: 2007
  },
  {
    title: 'Chasing Amy',
    director: 'Kevin Smith',
    genre: ['Comedy', 'Drama', 'Romance'],
    year: 1997
  }
];

//create middleware functions
app.use(morgan('common')); //log requests to terminal
app.use(express.static('public'));  //routes all requests for static files to files in the public folder
app.use(express.json());

//display index(homepage) request/response
app.get('/', (req, res) =>{
  res.send('Welcome to My Movies!'); //respond to index route
});

//display documentation page request/response
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname }
    );
});

//get all movies request/response
app.get('/movies', (req, res) =>{
res.status(200).json(movies)
});

//display data from movie title request/response
app.get('/movies/:title', (req, res) => {
    res.json(movies.find( (movie) => {
        return movie.title === req.params.title
    }));
});

//display data about genre by title
app.get('/movies/:title/genre', (req, res) => {
    res.send('Successful GET request returning data about a genre.');
});

//display data about a director by name
app.get('/movies/director/:name', (req, res) => {
    res.send('Successful GET request returning data about a director.');
});

//new user registration
app.post('/users', (req, res) => {
    res.send('Successful POST request - new user is registered');
});

//allow users to update their user info (username)
app.put('/users/:id/info', (req, res) => {
    res.send('Successful PUT request - user info is updated');
});

//allow users to add a movie to their list of favorites
app.post('/users/:id/favorites', (req, res) => {
    res.send('Successful POST request - user added a movie to their favorites');
});

//allow users to remove a movie from their list of favorites
app.delete('/users/:id/favorites', (req, res) => {
    res.send('Successful DELETE request - user removed movie from favorites');
});

//allow existing users to deregister
app.delete('/users', (req, res) => {
    res.send('Successful DELETE request - user has deregistered');
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
