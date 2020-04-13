/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: __CHIRAG ALWANI ______ Student ID: _153444179_____ Date: _29 SEPT 2018______
*
* Online (Heroku) Link: https://secret-meadow-49855.herokuapp.com
*
********************************************************************************/
var express = require("express");
var app=express();
var path=require("path");
var data_service = require("./data-service.js");
var HTTP_port = process.env.PORT || 8080;

function onHttp(){
    console.log("Express http server listening on port " + HTTP_port);
}
app.use(express.static('public'));
app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"/views/home.html"));
});

app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});
app.get("/employees", function(req,res)
{
    data_service.getAllEmployees().then(function(data) {
                res.json(data);
    }).catch(function(err)
    {
                res.json({message: err});
    })
})
app.get("/managers", function(req, res)
{
    data_service.getManagers().then(function(data)
    {
        res.json(data);
    }).catch(function(err)
    {
        res.json({ message: err });
    });
});
app.get("/departments",function(req,res)
{
    data_service.getDepartments().then(function(data)
    {
        res.json(data);
    }).catch(function(err)
    {
        res.json({ message: err });
    });
}); 
data_service.initialize() .then(() =>{

    app.listen(HTTP_port, onHttp);

	}).catch((err) =>{
    console.log("Not able to connect to the server");
});
app.use(function(req, res)
{
    res.status(404).send("Page not found!");
});







