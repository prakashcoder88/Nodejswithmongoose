const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
require("dotenv").config();

const rootuser = require("../../models/Admin");
const responsemessage = require("../../utils/ResponseMessage.json");
const sendEmail = require("../../services/EmailService");
const { passwordencrypt, otp, validatePassword} = require("../../services/CommonService");
const { admingenerateJwt } = require("../../utils/jwt");
require("../../middleware/FileUpload");

let isadminuser = true;

exports.AdminSingup = async (req, res) => {
  if (isadminuser) {
    return res.status(400).json({
      status: 400,
      message: responsemessage.SINGUPERROR,
    });
  }

  let { UserName, email, mobile, password } = req.body;

  if (!UserName || !password) {
    return res.status(400).json({
      status: 400,
      message: responsemessage.USERDETAILS,
    });
  } else {
    try {
      // let { UserName, email, mobile, password } = req.body;

      const userexist = await adminuser.findOne({ UserName });

      if (userexist) {
        res.status(400).json({
          status: 400,
          message: responsemessage.EXIST,
        });
      } else {
        email = email.toLowerCase();
        password = await passwordencrypt(password);

        let adminuserdata = new adminuser({ UserName, email, mobile, password });
        await adminuserdata.save();

        // isadminuser = true;

        res.status(201).json({ 
          status:201,
          message: responsemessage.CREATE });
      }
    } catch (error) {
      // console.error("Error creating adminuser:", error);
      res.status(500).json({ 
        status:500,
        message: responsemessage.SERVERERROR });
    }
  }
};

exports.AdminSingIn = async (req, res) => {
  const { UserName, password } = req.body;

  try {
    const adminUser = await rootuser.findOne({ UserName });

    if (!adminUser) {
      return res.status(401).json({ 
        status:401,
        error: "Invalid credentials" });
    } else {
      const isPasswordValid = await bcrypt.compare(
        password,
        adminUser.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ 
          status:401,
          error: true, 
          message: responsemessage.NOTMATCH });
      } else {
        const { error, token } = await admingenerateJwt(adminUser._id);

        if (error) {
          return res.status(400).json({
            status:400,
            message: responsemessage.TOKEN,
          });
        } else {
          adminUser.token = token;
          await adminUser.save();
console.log(adminUser);
          return res.status(201).json({
            status:201,
            token: token,
            message: responsemessage.adminSUCCESS,
          });
        }
      }
    }
  } catch (err) {
    return res.status(400).json({
      status:400,
      message: responsemessage.NOTSUCCESS,
    });
  }
};

exports.AdminForgotPassword = async (req, res) => {
  try {
    const { empEmail, newPassword, confirmPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.PASSWORDVALIDATE,
      });
    } else {
      const user = await root.findOne({ empEmail });
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: responsemessage.NOTFOUND,
        });
      } else {
        if (newPassword !== confirmPassword) {
          return res.status(400).json({
            status: 400,
            message: responsemessage.NOTMATCH,
          });
        } else if (
          user.otpExpire <
          new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        ) {
          return res.status(400).json({
            status: 400,
            message: responsemessage.TIMEOUT,
            
          });
        
        } else {
          const passwordHash = await passwordencrypt(newPassword);
          const updateUser = await root.findByIdAndUpdate(
            { _id: user._id },
            { $set: { otp: null, password: passwordHash, otpExpire: null } },
            { new: true }
          );
          console.log(user.otpExpire);
          // user.password = passwordHash;
          // await user.save();

          return res.status(200).json({
            status: 200,
            message: responsemessage.PASSWORDCHANGE,
          });
        }
        // }
      }
    }
  } catch (error) {
    // console.error("reset-password-error", error);
    return res.status(500).json({
      status: 500,
      message: responsemessage.SERVERERROR,
    });
  }
};


exports.AdminResetPassword = async (req, res) => {
  try {
    const adminId = req.currentUser;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword || !oldPassword) {
      return res.status(403).json({
        message: responsemessage.FILDSREQUIRE,
      });
    }else if (!validatePassword(newPassword)) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.PASSWORDVALIDATE,
      });
    }  
    else {
      // const adminuserId = req.currentUser;

      let adminUser = await root.findById(adminId);

      if (!adminUser) {
        return res.json({
          message: responsemessage.NOTFOUND,
        });
      } else {
        if (newPassword !== confirmPassword) {
          return res.status(400).json({
            message: responsemessage.NOTMATCH,
          });
        } else {
          const isSamePassword = await bcrypt.compare(
            oldPassword,
            adminUser.password
          );
          if (!isSamePassword) {
            return res.status(400).json({ message: responsemessage.OLDPASSWORD });
          } else {
            const isNewPasswordSame = await bcrypt.compare(
              newPassword,
              adminUser.password
            );
            if (isNewPasswordSame) {
              return res.status(400).json({
                message: responsemessage.OLDPASSWORDMATCH,
              });
            } else {
              const passwordHash = await passwordencrypt(
                newPassword,
                adminUser.password
              );
              const updateUser = await root.findByIdAndUpdate(
                { _id: adminUser._id },
                { $set: { password: passwordHash } },
                { new: true }
              );

              return res.status(201).json({
                status:201,
                message: responsemessage.PASSWORDCHANGE,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      status:500,
      message: responsemessage.SERVERERROR,
    });
  }
};

exports.UpdateAdminData = async (req, res) => {
  try {
    let { email, mobile, _id } = req.body;
    const adminEmail = email ? email.toLowerCase() : undefined;
    const admindata = await adminuser.findById({ _id });
    // console.log(adminuserdata);
    if (!admindata) {
      return res.status(400).json({ 
        status:400,
        message: responsemessage.NOTFOUND });
    } else {
      // email = email.toLowerCase();
      let admindata = {
        // email,
        mobile,
        profile: req.profileUrl,
      };
      if (email) {
        admindata.email = adminuserEmail;
      } else {
        const UpdateUser = await adminuser.findByIdAndUpdate(
          { _id },
          { $set: admindata },
          { new: true }
        );

        res.status(201).json({ 
          status:201,
          message: responsemessage.UPDATE });
      }
    }
  } catch (error) {
    return res.status(500).json({ 
      status:500,
      message: responsemessage.SERVERERROR });
  }
};

exports.SendOTP = async (req, res) => {
  try {
    const { empEmail } = req.body;

    if (!empEmail) {
      return res.status(400).json({
        status:400,
        message: responsemessage.NOTPROCCESS,
      });
    } else {
      let user = await root.findOneAndUpdate({empEmail});
      console.log(user);
      if (!user) {
        return res.json({
          status:400,
          message: responsemessage.CHECKEMAILID,
        });
      // } else {
      //   let response = await sendEmail(user.empEmail, otp);
      //   // console.log(response);
      //   if (response.error) {
      //     return res.status(400).json({
      //       status:400,
      //       message: responsemessage.NOTSENDEMAIL,
      //     });
        } else {
          let expiry = Date.now() + 2 * 60 * 1000;
          const expiryIST = new Date(expiry).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          });

          // user.otp = otp;
          // user.otpExpire = expiryIST;

          // await user.save();
          const updateUser = await root.findByIdAndUpdate(
            {_id: user._id},
            {$set: { otp: otp, otpExpire: expiryIST }},
            { new: true }
          );
          // console.log(updateUser);
        }
        return res.status(200).json({
          status:200,
          user:otp,
          otpExpire: user.otpExpire,
          message: responsemessage.FOUNDDETAILS,
        });
    //   }
    }
  } catch (error) {
    console.error("OTP json-error", error);
    return res.status(500).json({ 
      status:500,
      message: responsemessage.SERVERERROR });
  }
};

exports.Adminlogout = async (req, res) => {
  try {
    const adminId = req.currentUser;
    let adminUser = await adminuser.findById(adminId);

    if (!adminUser) {
      return res.status(400).json({ 
        status:400,
        message: responsemessage.NOTFOUND });
    } else {
      
      return res.status(200).json({ 
        status:200,
        message: responsemessage.USERLOGOUT });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status:500,
      message: responsemessage.LOGOUTERROR });
  }
};
