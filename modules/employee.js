var mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost:27017/employee', {useNewUrlParser: true, useUnifiedTopology: true});
var conn = mongoose.Connection;

var employeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    etype: String,
    hourlyrate: Number,
    totalhour: Number,
    total:Number,
    image:String,
  });

  var employeeModel = mongoose.model('Employee', employeeSchema);

  module.exports=employeeModel;