const fs = require("fs");
var employees = []; 
var departments = [];

module.exports.initialize = function(){
    
    return new Promise(function(resolve,reject){
    try{
        fs.readFile('./data/employees.json', function(err, data){
       if(err){  
            throw err;    
        }        
        employees = JSON.parse(data);
    }); 
        fs.readFile('./data/departments.json', function(err,data){
        if(err){            
            throw err;
        }
        departments = JSON.parse(data);
        });
    }catch(ex){
    reject("Problems reading file!");
    
    }
    resolve("Successful!");
    });

}
module.exports.getAllEmployees = function(){
    
    var AllEmployees = [];
    return new Promise(function(resolve,reject){
        for (var i = 0; i < employees.length; i++) {
            AllEmployees.push(employees[i]);
        }
        if (AllEmployees.length == 0){
            reject("No results returned!(empty array)");
        }
        resolve(AllEmployees);
    })
}
module.exports.getManagers = function() {
    var Managers = []; 
    return new Promise(function(resolve,reject){
        if(employees.length == 0){
            reject("No results returned!");
        }
        else
        {
            for (var i = 0; i < employees.length; i++) 
            {
    
            if (employees[i].isManager == true) {
    
                Managers.push(employees[i]);       
                }
            }            
            if (Managers.length == 0) {

                reject("No results returned !(empty array)");
            }
        }
        resolve(Managers);     
    });
}
module.exports.getDepartments = function() {
    
    var depart = [];
    return new Promise(function(resolve,reject){
    
        if(employees.length == 0){
    
            reject("No results returned!");   
        }
    else{
        for (var i = 0; i < departments.length; i++) {
            depart.push(departments[i]);       
            }
            if (depart.length == 0) {
                reject("No results returned!(empty array)");
            }
        }
        resolve(depart);
    });
}
module.exports.addEmployee = function(employeeData)   {

    return new Promise((resolve,reject)=>{

        employeeData.isManager == "undefined"?false:true;
        employeeData.employeeNum = employees.length + 1;
        employees.push(employeeData);
        resolve("Success");
    });
}

module.exports.getEmployeesByStatus = (ui_status)=>{

    return new Promise(function(resolve,reject) {
        
        let tempArr = [];

        for(let i = 0; i < employees.length; i++)
        {
            if(employees[i].status == ui_status)
            {
                tempArr[i] = employees[i];
            }
        }
        if(employees.length === 0)
        {
            reject("cant return employees by status");
            resolve(tempArr);
        }
    });
}

module.exports.getEmployeesByDepartment = (ui_department) => { 

    return new Promise(function (resolve,reject){
        let tempArr = [];
        for(let i = 0; i < employees.length; i++)
        {
            if(employees[i].department == ui_department)
            {
                tempArr[i] = employees[i];
            }
        }
        if(employees.length === 0)
        {
            reject("cant return employees by department!!!");
            resolve(tempArr);
        }
    });
}

module.exports.getEmployeesByManager = (ui_managerNum) => {

        return new Promise((resolve,reject) =>{
            let tempArr = [];
            for(let i = 0; i < employees.length; i++)
            {
                if(employees[i].employeeManagerNum == ui_managerNum)
                {
                        tempArr[i] = employees[i];
                }
            }
            if(employees.length === 0)
            {
                reject("Failed to get employees for managers");
                resolve(tempArr);
            }
        });
}
module.exports.getEmployeesByNum = function(num){

    return new Promise((resolve,reject) => {

        for(let i = 0; i < employees.length; i++)
        {
            if(employees[i].employeeNum = num)
            {
                console.log(i);
                resolve(employees[i]);
            }
        }
        reject("Could not find employee");
    });
}

module.exports.updateEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise((resolve, reject) => {
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].employeeNum == employeeData.employeeNum) {
                employees.splice(employeeData.employeeNum - 1, 1, employeeData);
            }
        }
        if (employees.length == 0) {
            reject("No Result Returned!!!");
        }
        resolve(employees);
    });
}