var express = require('express');
var multer = require('multer'); // npm install multer  // https://github.com/expressjs/multer // 1stly instal multer npm and reqiure this in a variable
var path = require('path'); // reqiure path, inbulid lib // use for path when upload file to store image for specific path
var empModel= require('../modules/employee');//exports employee.js file in a variable empModel
var router = express.Router();
var employee=empModel.find({}); // find () for find all data in employee.js store in a var employee
var uploadModel= require('../modules/upload'); // require file upload.js
var imageData=uploadModel.find({});
var jwt = require('jsonwebtoken'); //https://www.npmjs.com/package/jsonwebtoken after insatll require

//=======================================================================================================================
//https://github.com/expressjs/multer  must read this doc 
 

//now middleware create krne h multer ke through jo ki handle krega tem folder jha image upload hoga
   /*
      DiskStorage

        The disk storage engine gives you full control on storing files to disk.

        var storage = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, '/tmp/my-uploads')
          },
          filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.fieldname + '-' + uniqueSuffix)
          }
        })

        var upload = multer({ storage: storage })
   */
//=======================================================================================================================
  // define static path for image upload 
  //const app=express();       // ye tarika v h 
  //app.use(express.static('public')) ye tarika v h static definekrne ka
  router.use(express.static(__dirname+"./public/"));   //static definekrne k lie '.use ' hi likhte h


//for local storage ko reqiure kene k lie // https://www.npmjs.com/package/node-localstorage
  if (typeof localStorage === "undefined" || localStorage === null) {
	  const LocalStorage = require('node-localstorage').LocalStorage //yha var ko const kr denge kuki hmko aage isko use kena h
	 
	  localStorage = new LocalStorage('./scratch');
}




  //define multer function
  var Storage= multer.diskStorage({ // yha ek multer ka temp storage ka process define kiye jisko variable m store kiye ,
    //h or is variable ko pass krnge jab final multer function define krenge uplaod krne k lie
    destination:"./public/uploads",//diskstorage m destination define krte h image folder ka
    filename:(req,file,cb)=>{//2nd filename define krte h jo ki func ke sath work krta h 3 parameter ke sath ecma script,
      //1at para jo h request k lie 2nd para h file name k lie means input type file jo hota h,
      //3rd para hota callback fun h 
      cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));//is cb fun m null hota 1st ,
      //2nd file ,file.fieldname  means jo v field ka naam usko uthaega , yha name file hi diya hua h wahi utheaga,name="file"
      //3rd fieldname means <input type="file" class="form-control" name="file" required>//name="file"ye wala
    }

  }); 

  //define now middleware, jo ki choose krne or upload hone ke beech ka process h
  var upload = multer({
    storage:Storage
  //}).single('imgs');// 'file' jo h parameter m wo input type file ka name h, name="imgs", jo uploadfileejs m h 
}).single('file');
// for upload post router
router.post('/upload', upload, function(req, res, next) {
  var imageFile = req.file.filename; // for image save in db  k lie uploadModel require kiye h,
  // phle file ka naam get krke variable m save kiye step1
  var success = req.file.filename+ "Upload Succesfully";
  var imageDetails = new uploadModel({ //fr step 2 m saving k lie db m uploadmodel jo ki require file h db model ka,
    // usko gey filename dekar ek var m store kiye
      imagename:imageFile
     });
  //res.render('upload-file', { title: 'Upload File', success:success });
   imageDetails.save(function(err,doc){  // yha step 3 m db m save ke rhe hor phlwe wale render ko is func m daalenge
    //ab step 3 tak data db m save ho gya ab data fetch krna h or show krwana h image ka , 
    //new image save krwane k lie post router or already save imgko dikahne k lie get router m code krneg
    if (err) throw err;
    imageData.exec(function(err,data){ //yedb se image fetch krne k lie h post router pefr render krega uplaod file page pe
     if(err) throw err;
     res.render('upload-file', { title: 'Upload File', records:data, success:success });
    });
    //res.render('upload-file', { title: 'Upload File', success:success });
    });
});

//function for check stateless auth
function checkLogin(req,res,next){
  var myToken = localStorage.getItem('myToken');  // yha par get krenge token fr usko niche condtion m verify krenge
  try {
        jwt.verify(myToken, 'loginToken');
    } 
    catch(err) {
        res.send("You need to login access this page");
      }
      next();
}

// for upload get router
router.get('/upload', function(req, res, next) {
   imageData.exec(function(err,data){ // img db se get krke show krne k lie get router m
    if(err) throw err;
    res.render('upload-file', { title: 'Upload File', records:data, success:'' });
  });
});



/* GET home page. */
router.get('/', checkLogin, function(req, res, next) {
  employee.exec(function(err,data){  // employee is a ver that is exec all data and show in a index page
    if(err) throw err;
    res.render('index', { title: 'Employee Records',records:data, success:'' });//records m sab data h jo index ejs pahe pe records ko call krenge forecah m , aaray se data  nikal nikal kr show karwaenge

  });
  
});

/* login */
  router.get('/login', function(req,res,next){
  var token = jwt.sign({ foo: 'bar' }, 'loginToken'); 
  localStorage.setItem('myToken', token);  // localStorage ko as a session samjho
  res.send("Login Successfully");
  });

  /* logout */
  router.get('/logout', function(req,res,next){
    localStorage.removeItem('myToken');
    res.send("Logout Successfully");
    });


router.post("/", upload, function(req, res, next) {
  var empDetails = new empModel({
  name: req.body.uname,
  email: req.body.email,
  etype: req.body.emptype,
  hourlyrate: req.body.hrlyrate,
  totalhour: req.body.ttlhr,
  total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
  image:req.file.filename,  // left side wala column name h or right side wala file ka naam jo html se aaega
  });
  //console.log(empDetails);

   empDetails.save(function(err,res1){// .save wale m func islie baney h taki value jab insert ho to bina 
    //refersh ke page pe data show ho , or isme 'res1' pass kiye h qki alreay 'res pass kar chuke hai
    // fr krenge to niche walw res m chala jaeaga.

     if(err) throw err;
    // res.redirect("/");// after submit data and show data, ye '/' root pr rediret hoga or
     // page refersh krne pe last value fr se insert nhi hoga, agar nhi karenge to
     // page refersh pe last value add hota rahega.
     employee.exec(function(err,data){  // employee is a ver that is exec all data and show in a index page
      if(err) throw err;
      //res.render('index', { title: 'Employee Records',records:data, success:'Data Inserted Successfully'});//records m sab data h jo index ejs pahe pe records ko call krenge forecah m , aaray se data  nikal nikal kr show karwaenge
      res.render('index', { title: 'Employee Records', records:data, success:'Record Inserted Successfully' });
    });
   }); 
  
});

//for search

router.post('/search', function(req, res, next) {
  var flrtName = req.body.fltrname; // fltrname ye index.js ke html ka name h text box ka
  var flrtEmail = req.body.fltremail;
  var fltremptype = req.body.fltremptype;

  if(flrtName !='' && flrtEmail !='' && fltremptype !=''){ // agar tino cond m data h to work krega
  
     var flterParameter={ $and:[{ name:flrtName}, //$and lga kar query likha jata h
      {$and:[{email:flrtEmail},{etype:fltremptype}]}
       ] 
         }
    }else if(flrtName !='' && flrtEmail =='' && fltremptype !=''){//is cond m email blank hua to woek hoga 
    var flterParameter={ $and:[{name:flrtName},{etype:fltremptype}]//work blank rhega isle email wala cond query m nhi h ,
    // cahe to OR cond v lga kar use kar sakte h with email
    //2 field ka query h to second time $and ka need nhi h
    }
    
    }else if(flrtName =='' && flrtEmail !='' && fltremptype !=''){//name fiels blank hoga to
    
      var flterParameter={ $and: [{email:flrtEmail},{etype:fltremptype}] //name ka query nhi h
     }
    } else if(flrtName =='' && flrtEmail =='' && fltremptype !=''){ //ye emptype field pe work hoga ye cond

      var flterParameter={etype:fltremptype}
    }
    else{
      var flterParameter={} // agar koi cond nhi hua to sara data show hoga is flterparameter m like db.in.find({})
    }
      
   var employeeFilter=empModel.find(flterParameter); //empModel jo ki require kiye hue h employee.js page ko,uska object
   //banaey h 'employeeFilter'or find func m 'flterParameter' pass kiye h jisme sara qury run kr rha h,
   //or 'employeeFilter' ab exec hoga employee ki jagah jo insert wale m use kiye h("employee.exec(function(err,data)")
      employeeFilter.exec(function(err,data){  
      if(err) throw err;
      res.render('index', { title: 'Employee Records',records:data, success:'' });
      }); 
});

//for delete

router.get('/delete/:id', function(req, res, next) {
  var id = req.params.id; // id get kar he h yha by req.params.id, yha url m (':id') h upper lslie yha v 'id' likhenge,
  // or ek id naame ke var m store kr lie 
  var del = empModel.findByIdAndDelete(id);//empModel reqiure kiy ahua file ka object h usko del naam ke var m store kiye,
  //or findbyidanddelete func m id pass kiye jo id getkiya hua h upper wale line m

  del.exec(function(err,data){ 
    if(err) throw err;
    //res.redirect("/");
    employee.exec(function(err,data){  
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data, success:'Record Deleted Successfully' });
	  });
    //res.render('index', { title: 'Employee Records',records:data });//records m sab data h jo index ejs pahe pe records ko call krenge forecah m , aaray se data  nikal nikal kr show karwaenge

  });
  
});


//update   //edit wale page pe data update krke submitkrenge fr ye func work hoha or data save.

  //https://mongoosejs.com/docs/queries.html

   //this code for if we not update image filed
   router.post('/update/', upload, function(req, res, next) {
   if(req.file){
     var dataRecords= {//ye wala edit.js m hidden field m liya hua h
      name: req.body.uname,
      email: req.body.email,
      etype: req.body.emptype,
      hourlyrate: req.body.hrlyrate,
      totalhour: req.body.ttlhr,
      total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
      image:req.file.filename,
     }
   }else{
    var dataRecords= {
      name: req.body.uname,
      email: req.body.email,
      etype: req.body.emptype,
      hourlyrate: req.body.hrlyrate,
      totalhour: req.body.ttlhr,
      total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
    
   }
  }
//this code is true for update
   /*var update = empModel.findByIdAndUpdate(req.body.id,{//ye wala edit.js m hidden field m liya hua h
    name: req.body.uname,
    email: req.body.email,
    etype: req.body.emptype,
    hourlyrate: req.body.hrlyrate,
    totalhour: req.body.ttlhr,
    total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
    image:req.file.filename,
   });*/
   var update = empModel.findByIdAndUpdate(req.body.id,dataRecords);//ye line h datarecoreds ki image mile to ok namile to error na aae 
   update.exec(function(err,data){  
    if(err) throw err;
    //res.redirect("/");
    employee.exec(function(err,data){  
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data, success:'Record Updated Successfully' });
	  });
   // viewTitle:"Update Sucessfully";

  });
  
});
//for edit

router.get('/edit/:id', function(req, res, next) {
  var id = req.params.id;// dynamic get ho rha yha using 'req.params.id' id jo h jo get fun m likjengesame wahi,
  //yha likhna hoga
  var edit = empModel.findById(id);//yha 'empModel' kanew var bnaey h edit naam se. empmodel reqiure file h employee.js ,
  //ka or find by id kr rha or is fun m id pass kiye h jo dynamic id get ho rha h 
  
  edit.exec(function(err,data){  
    if(err) throw err;
    res.render('edit', { title: 'Edit Employee Record',editData:data });//records m sab data h jo index ejs pahe pe records ko call krenge forecah m , aaray se data  nikal nikal kr show karwaenge
    
  });
  
});

//update 2 with save on all time 

/*router.post("/update/", function(req, res, next) {
  var empDetails = new empModel({
  name: req.body.uname,
  email: req.body.email,
  etype: req.body.emptype,
  hourlyrate: req.body.hrlyrate,
  totalhour: req.body.ttlhr,
  total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
  });
  
   empDetails.save(function(err,res1){
     if(err) throw err;
     res.redirect("/");
     employee.exec(function(err,data){  
      if(err) throw err;
      res.render('index', { title: 'Employee Records',records:data });
      });
   }); 
  
});*/


module.exports = router;
