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
    director: 'Ben Affleck',
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

//get index request/response
app.get('/documentation', (req, res) => {
  res.sendFile ('public/documentation.html', {root: __dirname });
});

//get movies request/response
app.get('/movies', (req, res) =>{
res.json(movies);
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
