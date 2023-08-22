const nodemailer = require('nodemailer');
const transpoter = require("../config/Email.config")
require("../models/User")

  async function sendEmail (empEmail, OTP){
    
  try {
   
     let mailOptions = {
          from: "demonodejs@outlook.com",
          to: empEmail,
          subject: "Forgot password rest",
          text: `You forgot password rest code is: ${OTP}`,
        };

        let info = await transpoter.sendMail(mailOptions);
        return { error: false };
  } catch (error) {
      console.error("send-email-error", error);
      return {
        error: true,
        message: "Cannot send email",
      };
  } 
  
  }
  
  module.exports = sendEmail