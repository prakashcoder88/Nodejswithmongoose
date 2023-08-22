const nodemailer = require("nodemailer");

// const Otp = require("./CommonService")
require("../models/User")


const {auth_email, auth_pass} = process.env;

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d62af087dbbc5b",
    pass: "4c4688768fcd6f"
  }
});


module.exports = transport