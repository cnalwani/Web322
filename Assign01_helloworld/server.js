/************************************************************************
*********
*  WEB322: 
Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy
.  
*  No part of this 
assignment has been copied manually or electronically from any other sour
ce
*  (including web sites) or 
distributed to other students.
* 
*  Name: _CHIRAG ALWANI_____ Student ID: _153444179______ Date: ___9/12/2018___________
*
*  Online (Heroku) URL: __https://blooming-dusk-25968.herokuapp.com/______________
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.send("Chirag Alwani - 153444179");
    
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT);
