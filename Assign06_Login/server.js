/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _CHIRAG ALWANI___ Student ID: _153444179_____ Date: _7 DEC 2018____
*
* Online (Heroku) Link:    https://blooming-eyrie-45190.herokuapp.com/ 
*
********************************************************************************/
//mongodb://<dbuser>:<dbpassword>@ds111262.mlab.com:11262/web322_a6
var express = require("express");
var multer = require("multer");
var app=express();
var path=require("path");
var data_service = require("./data-service.js");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
var HTTP_port = process.env.PORT || 8080;   
const dataServiceAuth = require('./data-service-auth.js');
const clientSessions = require("client-sessions");
const exphbs = require("express-handlebars");
const fs = require("fs");


app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "secretString123", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

  app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

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

app.use(bodyParser.urlencoded({ extended: true }));
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

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

//login routes
app.get(`/login`,(req,res)=>{
    res.render('login');
})

app.get(`/register`,(req,res)=>{
    res.render('register');
})

app.post(`/register`, (req,res)=>{
    dataServiceAuth.registerUser(req.body).then(()=>{
        res.render(`register`,{successMessage: "User created"});
    }).catch((err)=>{
        res.render(`register`,{errorMessage: err, userName: req.body.userName});
    })
})
app.post(`/login`, (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName, // authenticated user's userName
                email: user.email, // authenticated user's email
            loginHistory: user.loginHistory // authenticated user's loginHistory
        }
        res.redirect('/employees');
    }).catch((err)=>{
        res.render(`login`, {errorMessage: err, userName: req.body.userName});
    })
})

app.get(`/logout`, (req,res)=>{
    req.session.reset();
    res.redirect('/');
})

app.get('/userHistory',ensureLogin,(req,res)=>{
    res.render(`userHistory`,{});
})

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}


app.post("/images/add",ensureLogin, upload.single("imageFile"),(req,res)=>{
    res.redirect("/images");
});

const Path = path.join(__dirname, "/public/images/uploaded");

app.get("/images",ensureLogin, (req, res) => {
    fs.readdir(path.join(__dirname, "public/images/uploaded"), function (err, items) {
        res.render('images', { data: items });
    });
});

app.get("/employees/add", ensureLogin, (req, res) => {
    data_service.getDepartments().then((data) => {
        res.render("addEmployee", { departments: data });
    }).catch(() => {
        res.render("addEmployee", { departments: [] });
    })
});

app.get("/images/add", ensureLogin, (req,res) => {
    res.render('addImage');
});

app.post("/employees/add",ensureLogin, (req, res) => {
 
    data_service.addEmployee(req.body).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(505).send(`OOPS! 505 ERROR!\n Error:  ${err.message}`);
    });
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

app.get("/employees",ensureLogin, (req, res) => {

    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status).then((data) => {
           // res.render("employees",{employees: data});
           if(data.length == 0 )
           {
               res.render("employee", {message: "no result"});
           } 
           else
           {
               res.render("employee",{message: "no result"});
           }
        }).catch((err) => {
            // res.status(500).send(`OOPS! ${err}`);
            res.render('employees',{message: err}); //TODO: ASK WHY IT DOES NOT RENDER THIS OR ANY BELOW
        })
    }
    else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department).then((data) => {
            //res.render("employees",{employees: data});
            if(data.length  == 0)
            {
                res.render("employees", {message:"no result"});
            }
            else
            {
                res.render("employees", {employees: data});
            }
        }).catch((err) => {
            res.render('employees',{message: err});
        })
    }
    else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager).then((data) => {
            //res.render("employees",{employees: data});
            if(data.length == 0)
            {
                res.render("employees", {message: "no result"});
            }
            else
            {
                res.render("employees", {employees:data});
            }  
        }).catch((err) => {
            res.render({message: "no results"});
        })
    }
    else {
        data_service.getAllEmployees().then((data) => {
  
            if(data.length == 0)
            {
                res.render("employees", {message: "no result"});
            }
            else
            {
                res.render("employees",{employees: data});
            }
        }).catch((err) => {
            res.render({message: "no results"});
        })
    }
});


app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data_service.getEmployeeByNum(req.params.empNum).then((data) => {
    if (data) {
    viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
    viewData.employee = null; // set employee to null if none were returned
    }
    }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
    }).then(data_service.getDepartments)
    .then((data) => {
    viewData.departments = data; // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
    for (let i = 0; i < viewData.departments.length; i++) {
    if (viewData.departments[i].departmentId == viewData.employee.department) {
    viewData.departments[i].selected = true;
    }
    }
    }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
    if (viewData.employee == null) { // if no employee - return an error
    res.status(404).send("Employee Not Found");
    } else {
    res.render("employee", { viewData: viewData }); // render the "employee" view
    }
    });
   });


app.get("/departments",ensureLogin, (req, res) => {
    data_service.getDepartments().then((data) => {
        //res.render('departments',{departments: data});
        if(data.length == 0)
        {
            res.render("departments", {message: "no result"})
        }
        else
        {
            res.render("departments", {departments:data});
        }
    }).catch((err) => {
        res.json(err.message);
    })
});

app.post("/employee/update", ensureLogin,  (req, res) => {
    data_service.updateEmployee(req.body).then((data) => {
        console.log("data::");
        console.log(req.body);
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    })
});

app.get(`/departments/add`, ensureLogin, (req, res) => {
    console.log(`get /departments/add`);
    res.render("addDepartment", {});
})

app.post(`/departments/add`, ensureLogin,  (req, res) => {
    console.log(`post /departments/add`);
    data_service.addDepartment(req.body).then(() => {
        res.redirect(`/departments`);
    }).catch((err) => {
        res.status(500).send(`Server error! ${err}`); //when to use err.message then?
    })
})

app.post(`/department/update`, ensureLogin, (req, res) => {
    data_service.updateDepartment(req.body).then(() => {
        res.redirect(`/departments`);
    }).catch(() => {
        res.status(500).send(`Server error! ${err}`);
    })
})

app.get(`/department/:departmentId`, ensureLogin, (req, res) => {
    data_service.getDepartmentById(req.params.departmentId).then((data) => {
        res.render(`department`, {department: data})
    }).catch(() => {
        res.status(500).send("Department Not Found");
    })
})


app.get('/departments/delete/:departmentId',ensureLogin, (req, res) => {
    data_service.deleteDepartmentById(req.params.departmentId).then(() => {
        res.redirect('/departments');
    }).catch((err) => {
        res.status(500).send("Department Not Found");
    })
})

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    data_service.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect("/employees");
    }).catch(() => {
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    });
});



data_service.initialize()
    .then(dataServiceAuth.initialize())
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
        console.log("unable to start server: " + err);
    });

app.use((req, res) => {
    res.status(404).sendfile(path.join(__dirname, "/views/error.html"));
});

