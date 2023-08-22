const bcrypt = require("bcrypt");
// const { model } = require("mongoose");
const EmpRegister = require("../models/User");
const adminuser = require("../models/Admin");
const responsemessage = require("../utils/ResponseMessage.json");




async function passwordencrypt(password) {
  let salt = await bcrypt.genSalt(10);
  let passwordHash = bcrypt.hash(password, salt);
  return passwordHash;
}

function validatePassword(password) {
  const pattern = /^[^\s]{6,10}$/;
  // /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$&%])(?!.*\s).{6,10}$/;
  return pattern.test(password);
}

const otp = Math.floor(1000 + Math.random() * 9000);

const VerifyOTP = async (req, res) => {
  let { empEmail, otp } = req.body;

  try {
    const user =
      (await EmpRegister.findOne({ empEmail })) ||
      (await adminuser.findOne({ empEmail }));

    if (!user) {
      return res.status(404).json({
        status: 400,
        message: responsemessage.NOTFOUND,
      });
    } else if (otp !== user.otp) {
      return res.status(400).json({
        statust: 400,
        message: responsemessage.OTPNOTMATCH,
      });
    } else if (
      user.otpExpire  <
        new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })
    ) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.OTPEXPIRED,
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: responsemessage.OTPVIRIFY,
      });
    }
  } catch (error) {
    // console.log("Error verifying OTP:", error);
    return res.status(500).json({
      status: 500,
      message: responsemessage.SERVERERROR,
    });
  }
};

// const upload = (req,res) =>{



// }


module.exports = { 
  passwordencrypt, 
  otp, 
  VerifyOTP,
  validatePassword };


