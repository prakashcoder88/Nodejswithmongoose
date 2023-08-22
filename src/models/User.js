const mongoose = require("mongoose");

// const bcrypt = require("bcrypt")

const empSchema = new mongoose.Schema(
  {
    empCode: {
      type: String,
    },
    empName: {
      type: String,
    },
    firstName: {
      type: String,
      require:false,
      match:[/^[a-z,A-Z]{3,10}$/,"FirstName at least 3 to 10 characters!"],
 
    },
    lastName: {
      type: String,
      require:false,
      match:[/^[a-z,A-Z]{3,10}$/,"Lastname at least 3 to 10 characters!"]
    },
    empEmail: {
      type: String,
      require:false,
      match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format."]
    },
    empMobile: {
      type: String,
      required: false,
      match: [/^[0-9]{6,13}$/, 'Enter valid mobile number with country code'],   
    },
    password: {
      type: String,
      require:false
    },
  
    otp: {
      type: String,
      required: false
      
    },
    otpExpire: {
      type: String,
      required: false
      
    },
    profile:{
      type:String,
      required: false,
    },
    document:{
      type: Array,
      required: false,
    },
    token: { 
      type: String,
      required: false,
    },
    
    isactive: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  { versionKey: false }
);

const EmpRegister = new mongoose.model("EmpRegister", empSchema);
module.exports = EmpRegister;
