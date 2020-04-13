/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _CHIRAG ALWANI___ Student ID: _153444179_____ Date: _12 OCT 2018____
*
* Online (Heroku) Link: ________________________________________________________
*
********************************************************************************/
var express = require("express");
var multer = require("multer");
var app=express();
var path=require("path");
var data_service = require("./data-service.js");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
var HTTP_port = process.env.PORT || 8080;   

// Assignment 3
const fs = require("fs");

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
        
}});
const upload = multer({storage:storage});



app.post("/images/add",upload.single("imageFile"),(req,res)=>{
    res.redirect(path.join(__dirname,"/images"));
});

app.get("/images",(req,res)=>{
    fs.readdir(path.join(__dirname, "public/images/uploaded"),function(err,items){
        console.log(items);
        var images ={
            image:[]
        };
        images.image = items;
        res.json(images);
    });
});



app.get("/employees/add", function(req,res) {
    res.sendFile(path.join(__dirname,"/views/addEmployee.html"));
});

app.get("/images/add", function(req,res){
    res.sendFile(path.join(__dirname,"/views/addImage.html"));
});


app.post("/employees/add", (req,res)=>{

    ds.addEmployee(req.body).then((data)=>{
        res.redirect("/employees");

    }).catch((err)=>{
        res.status(505).send(`OOPS! 505 ERROR!\n Error: ${err.message}`);
    });
});


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
});

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





