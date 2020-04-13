/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _HarshKumar Patel___ Student ID: _118151174_____ Date: _23 NOV 2018____
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


app.get("/employees/add", (req, res) => {
    data_service.getDepartments().then((data) => {
        res.render("addEmployee", { departments: data });
    }).catch(() => {
        res.render("addEmployee", { departments: [] });
    })
});

app.get("/images/add", function(req,res) {
    res.render('addImage');
});

app.post("/employees/add", (req, res) => {
    console.log(`req.body >>>>>>>>>>>>>>>>>>>> ${req.body}`);
    data_service.addEmployee(req.body).then((data) => {
        console.log(data);
        res.redirect("/employees");
    }).catch((err) => {
        res.status(505).send(`OOPS! 505 ERROR!\n Error:  ${err.message}`);
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


app.get("/employee/:empNum", (req, res) => {
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


app.get("/departments", (req, res) => {
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

app.post("/employee/update", (req, res) => {
    data_service.updateEmployee(req.body).then((data) => {
        console.log("data::");
        console.log(req.body);
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    })
});

app.get(`/departments/add`, (req, res) => {
    console.log(`get /departments/add`);
    res.render("addDepartment", {});
})

app.post(`/departments/add`, (req, res) => {
    console.log(`post /departments/add`);
    data_service.addDepartment(req.body).then(() => {
        res.redirect(`/departments`);
    }).catch((err) => {
        res.status(500).send(`Server error! ${err}`); //when to use err.message then?
    })
})

app.post(`/department/update`, (req, res) => {
    data_service.updateDepartment(req.body).then(() => {
        res.redirect(`/departments`);
    }).catch(() => {
        res.status(500).send(`Server error! ${err}`);
    })
})

app.get(`/department/:departmentId`, (req, res) => {
    data_service.getDepartmentById(req.params.departmentId).then((data) => {
        res.render(`department`, {department: data})
    }).catch(() => {
        res.status(500).send("Department Not Found");
    })
})


app.get('/departments/delete/:departmentId', (req, res) => {
    data_service.deleteDepartmentById(req.params.departmentId).then(() => {
        res.redirect('/departments');
    }).catch((err) => {
        res.status(500).send("Department Not Found");
    })
})

app.get("/employees/delete/:empNum", (req, res) => {
    data_service.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect("/employees");
    }).catch(() => {
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    });
});


data_service.initialize().then(() =>{
    app.listen(HTTP_port, onHttp);

	}).catch((err) =>{
    console.log("Not able to connect to the server");
});

app.use(function(req, res)
{
    res.status(404).send("Page not found!");
});
