var express = require('express');
var empModel= require('../modules/employee');//exports employee.js file in a variable empModel
var router = express.Router();
var employee=empModel.find({}); // find () for find all data in employee.js store in a var employee


/* GET home page. */
router.get('/', function(req, res, next) {
  employee.exec(function(err,data){  // employee is a ver that is exec all data and show in a index page
    if(err) throw err;
    res.render('index', { title: 'Employee Records',records:data });//records m sab data h jo index ejs pahe pe records ko call krenge forecah m , aaray se data  nikal nikal kr show karwaenge

  });
  
});

router.post("/", function(req, res, next) {
  var empDetails = new empModel({
  name: req.body.uname,
  email: req.body.email,
  etype: req.body.emptype,
  hourlyrate: req.body.hrlyrate,
  totalhour: req.body.ttlhr,
  total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
  });
  //console.log(empDetails);

   empDetails.save(function(err,res1){// .save wale m func islie baney h taki value jab insert ho to bina 
    //refersh ke page pe data show ho , or isme 'res1' pass kiye h qki alreay 'res pass kar chuke hai
    // fr krenge to niche walw res m chala jaeaga.

     if(err) throw err;
     res.redirect("/");// after submit data and show data, ye '/' root pr rediret hoga or
     // page refersh krne pe last value fr se insert nhi hoga, agar nhi karenge to
     // page refersh pe last value add hota rahega.
     employee.exec(function(err,data){  // employee is a ver that is exec all data and show in a index page
      if(err) throw err;
      res.render('index', { title: 'Employee Records',records:data });//records m sab data h jo index ejs pahe pe records ko call krenge forecah m , aaray se data  nikal nikal kr show karwaenge
      });
   }); 
  
});

//for search

router.post("/search", function(req, res, next) {
  var flrtName = req.body.fltrname;
  var flrtEmail = req.body.fltremail;
  var fltremptype = req.body.fltremptype;

  if(flrtName !="" && flrtEmail !="" && fltremptype!="")
  {
     var flterParameter={ $and: [  {name:flrtName},
                        { $and: [ {email:flrtEmail},
                          {etype:fltremptype} ]  } ] }
                            
  }
    else if(flrtName !="" && flrtEmail =="" && fltremptype!=""){
      var flterParameter={ $and: [ {name:flrtName},   {etype:fltremptype}   ]  }
    }else
    if(flrtName =="" && flrtEmail !="" && fltremptype!=""){
      var flterParameter={ $and: [ {email:flrtEmail},   {etype:fltremptype}   ]  }
    } else{
      var flterParameter={} 
    }
        

   //var employeeFilter=empModel.find({}); iska mtlb h ki koi value nhi h ye to chal rha h or h to niche wala
   var employeeFilter=empModel.find(flterParameter); // uper call kiya hua tha niche v kiye h but object name diff h
      //employee.exec(function(err,data){
      employeeFilter.exec(function(err,data){  
      if(err) throw err;
      res.render('index', { title: 'Employee Records',records:data });
      }); 
});

module.exports = router;
