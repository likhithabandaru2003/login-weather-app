const express = require('express');
const passport = require('passport');
const session =require('express-session');
const path=require('path');
const app=express();
const mime = require('mime');
require('./auth');
require('./weather');
app.use(express.json());
app.use(express.static(path.join(__dirname,"client")));
app.use(express.static(path.join(__dirname,"weather")));
app.get('/auth/style.css', function(req, res) {
    const filePath = __dirname+'/weather/style.css'; 
    const mimeType = mime.lookup(filePath);
  
    if (mimeType) {
      res.setHeader('Content-Type', mimeType);
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  });
  app.get('/auth/script.js', function(req, res) {
    const filePath = __dirname+'/weather/script.js'; 
    const mimeType = mime.lookup(filePath);
  
    if (mimeType) {
      res.setHeader('Content-Type', mimeType);
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found');
    }
  });
function isLoggedIn(req,res,next){
    req.user ? next() : res.sendStatus(401);
}

app.get('/',(res,req)=>{
    res.sendFile('./client/index.html')
});

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
app.use(passport.initialize());
app.use(passport.session());
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
}));
app.get('/auth/google/failure',(req,res)=>{
    res.send('Failed to Loggedin')
});

app.get('/auth/protected',isLoggedIn,(req,res)=>{
    res.sendFile(__dirname+"/weather/index.html")
});

app.listen(5000,()=>{
    console.log('listening at port 5000');
});
