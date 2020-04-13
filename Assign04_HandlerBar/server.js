/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _CHIRAG ALWANI___ Student ID: _153444179_____ Date: _2 NOV 2018____
*
* Online (Heroku) Link:  https://murmuring-scrubland-88071.herokuapp.com/
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

const exphbs = require("express-handlebars");

app.engine('.hbs', exphbs(
    {
        extname: '.hbs',
        defaultLayout: 'main',
        helpers: {
            navLink: function (url, options) {
                return '<li' +
                    ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                    '><a href="' + url + '">' + options.fn(this) + '</a></li>';
            },
            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                    throw new Error("Handlebars Helper equal needs 2 parameters");
                if (lvalue != rvalue) {
                    return options.inverse(this);
                } else {
                    return options.fn(this);
                }
            }
        }
    })
);
app.set('view engine', '.hbs');


// Assignment 3
const fs = require("fs");

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
        
}});

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

const upload = multer({storage:storage});

const Path = path.join(__dirname, "/public/images/uploaded");

app.get("/images", function(req,res){
    let images = [];
    fs.readdir(Path, function(err, items) {
      if (!err) {
        
        items.forEach(item => images.push(item));
        res.render("images", {data: images});
    }
    });
  });
app.get("/employees/add", function(req,res){
    res.render('addEmployee');
});

app.get("/images/add", function(req,res) {
    res.render('addImage');
});


app.post("/employees/add", (req,res)=>{

    data_service.addEmployee(req.body).then((data)=>{
        res.redirect("/employees");

    }).catch((err)=>{
        res.status(505).send(`OOPS! 505 ERROR!\n Error: ${err.message}`);
    });
});

app.post("/images/add",upload.single("imageFile"),(req,res)=>{

    res.redirect(301, "/images");


});

function onHttp(){
    console.log("Express http server listening on port " + HTTP_port);
}

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render('home'); 
});

app.get("/about", (req, res) => {
    res.render('about');
});

app.get("/employees", (req, res) => {

    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status).then((data) => {
            res.render("employees",{employees: data});
        }).catch((err) => {
            // res.status(500).send(`OOPS! ${err}`);
            res.render('employees',{message: err}); //TODO: ASK WHY IT DOES NOT RENDER THIS OR ANY BELOW
        })
    }
    else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department).then((data) => {
            res.render("employees",{employees: data});
        }).catch((err) => {
            res.render('employees',{message: err});
        })
    }
    else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager).then((data) => {
            res.render("employees",{employees: data});
        }).catch((err) => {
            res.render({message: "no results"});
        })
    }
    else {
        data_service.getAllEmployees().then((data) => {
            res.render("employees",{employees: data});
        }).catch((err) => {
            res.render({message: "no results"});
        })
    }
});

app.get("/employee/:value", (req, res) => {
 
   data_service.getEmployeesByNum(req.params.value).then((data) => {
       
        res.render("employee", { employee: data });
    }).catch((err) => {
        res.status(500).send(`Internal Error! ${err}`);
    })
});


app.get("/departments", (req, res) => {
    data_service.getDepartments().then((data) => {
        res.render('departments',{departments: data});
    }).catch((err) => {
        res.json(err.message);
    })
});

app.post("/employee/update", (req, res) => {
    data_service.updateEmployee(req.body).then((data) => {
        console.log("data::");
        console.log(req.body);
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    })
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





