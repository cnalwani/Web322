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
        }else{
    
            for (var i = 0; i < employees.length; i++) {
    
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
