"use strict";
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');

mongoose.connect('mongodb://localhost/nodekb');
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
    saveUninitialized: true,
    cookie: { secure: true }
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Express-Validator Middleware
/*app.use(expressValidator({
    errorFormatter: function(param,msg,value){
        var namespace = pram.split('.')
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
}));*/

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


//Get Single Article
app.get('/article/:id',function (req,res) {
    Article.findById(req.params.id, function (err,article) {
        res.render('article',{
            article: article
        });
        //console.log(article);
        //return;
    });
});

//Load Edit Article
app.get('/article/edit/:id',function (req,res) {
    Article.findById(req.params.id,function (err,article) {
       res.render('edit_article',{
           title: 'Edit Article',
           article: article
       });
    });
});

//After clicking on Edit article
app.post('/articles/edit/:id', function (req,res) {

    let article = {};
    article.title=req.body.title;
    article.author=req.body.author;
    article.body=req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article,function (err) {
        if(err){
            console.log(err);
            return;
        } else{
            res.redirect('/');
        }

    });

});


app.delete('/article/:id', function (req,res) {
   let query = {_id:req.params.id}

   Article.remove(query, function (err) {
      if(err){
          console.log(err);
      }
      res.send('Success');
   });
});

//Add route
app.get('/articles/add',function (req,res) {
   res.render('add_article',{
       title: 'Add Articles'
   }) ;
});


//Add Submit POST Route
//After clicking on Submit
app.post('/articles/add', function (req,res) {

    let article = new Article();
    article.title=req.body.title;
    article.author=req.body.author;
    article.body=req.body.body;

    article.save(function (err) {
       if(err){
           console.log(err);
           return;
       } else{
         req.flash('success', 'Article Added');
         res.redirect('/');
       }

    });

});


//Start Server
app.listen(3000,function () {
    console.log('Server started on port 3000');
});