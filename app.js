//"use strict";
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');
const config= require('./config/database');
const passport = require('passport');

mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once('open',function () {
   console.log('Connected to MongoDB');
});

//check for db errors
db.on('error',function (err) {
   console.log(err);
});

//Init app
const app=express();

//Bring in models

let Article = require('./models/article');

//Load view engine

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname,'public')));


//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    //cookie: { secure: true }
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express-Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param,msg,value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while (namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

//Passport Config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Global Variable for logout
app.get('*',function (req,res,next) {
   res.locals.user = req.user || null;
   next();  //Calls the next route
});

//Home Route
app.get('/',function (req,res) {
   /* let articles = [
        {
            id: 1,
            title:'Article One',
            author:'Abc',
            body:'This is article one'
        },
        {
            id: 2,
            title:'Article Two',
            author:'Abc1',
            body:'This is article two'
        },
        {
            id: 3,
            title:'Article Three',
            author:'Abc2',
            body:'This is article three'
        },
    ];*/


   Article.find({},function (err, articles) {
        if(err){
            console.log(err);
        }
        else{
            res.render('index',{
                title: 'Articles',
                articles: articles
            });
        }
   });

});


//Route Files
let articles = require('./routes/articles');
let users = require('./routes/users')
app.use('/articles', articles);
app.use('/users', users);





//Start Server
app.listen(3000,function () {
    console.log('Server started on port 3000');
});