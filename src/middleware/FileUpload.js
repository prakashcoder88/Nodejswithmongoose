const express = require("express");
const multer = require("multer");
const path = require("path");
const EmpRegister = require("../models/User");

// const fs = require("fs");
// const frontEndUrl = "http://localhost:1000/public";
require("../models/User");
require("../models/Admin");

// const maxSize = 2 * 1024 * 1024;

// File UploadPath
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profile") {
      cb(null, "public/profile");
    } else if (file.fieldname === "document") {
      cb(null, "public/document");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: (req, file, cb) =>{
    cb(null, file.originalname);
  },
});

let uploadFile = multer({ storage: storage }).fields([
  { name: "profile", maxCount: 1 },
  { name: "document" },
]);





module.exports = function (req, res, next) {
  uploadFile(req, res, (error) => {
    if (error) {
      res.status(400).send("Something went wrong!");
    } else {
      if (req.files && req.files.profile) {
        req.profileUrl = req.files.profile[0].filename;

       
      }

      if (req.files && req.files.document) {
        req.documentUrl = req.files.document.map((file) => { 
          return file.filename
          
        });
        // console.log( req.documentUrl);
      }


      next();
    }
  });
}





// module.exports = uploadFile;
