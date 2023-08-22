const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const StatusCodes = require("http-status-codes");

const EmpRegister = require("../../models/User");

const {
  passwordencrypt,
  otp,
  validatePassword,
} = require("../../services/CommonService");
const responsemessage = require("../../utils/ResponseMessage.json");
const { generateJwt } = require("../../utils/jwt");
const sendEmail = require("../../services/EmailService");

const uploadFile = require("../../middleware/FileUpload");

exports.SingUp = async (req, res) => {
  try {
    let {
      empCode,
      empName,
      firstName,
      lastName,
      empEmail,
      empMobile,
      password,
    } = req.body;

    // firstName = firstName.replace(/\s/g, "");
    // lastName = lastName.replace(/\s/g, "");
    // empEmail = empEmail.replace(/\s/g, "");

    if (!firstName || !lastName || !empEmail || !empMobile) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.FILDSREQUIRE,
      });
    } else if (!validatePassword(password)) {
      return res.status(400).json({
        status: StatusCodes.BAD_REQUEST,
        message: responsemessage.PASSWORDVALIDATE,
      });
    } else {
      let existemail = await EmpRegister.findOne({ empEmail });
      let existphone = await EmpRegister.findOne({ empMobile });

      if (existemail || existphone) {
        const message =
          existemail && existphone
            ? `${responsemessage.EMAILEXITS} and ${responsemessage.MOBILEEXITS}`
            : existemail
            ? responsemessage.EMAILEXITS
            : responsemessage.MOBILEEXITS;

        res.status(400).json({ status: 400, message });
      } else {
        empCode = Math.floor(1000 + Math.random() * 9000);
        empName =
          (firstName + lastName).toLowerCase() +
          Math.floor(10 + Math.random() * 100);
        empEmail = empEmail.toLowerCase();
        password = await passwordencrypt(password);

        let empdata = new EmpRegister({
          empCode,
          firstName,
          lastName,
          empName,
          empEmail,
          empMobile,
          password,
          profile: req.profileUrl,
          document: req.documentUrl,
        });

        // empdata.save
        empdata
          .save()
          .then((data) => {
            return res.status(201).json({
              status: 201,
              message: responsemessage.CREATE,
              data: data,
            });
          })
          .catch((error) => {
            return res.status(400).json({
              status: 400,
              message: `${error}`,
            });
            // }
          });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: responsemessage.SERVERERROR,
    });
  }
};

exports.singin = async (req, res) => {
  try {
    let { empEmail, empMobile, password } = req.body;

    let userLogin = await EmpRegister.findOne({
      $or: [{ empEmail }, { empMobile }],
    });

    if (!userLogin) {
      return res.status(404).json({
        status: 404,
        error: true,
        message: responsemessage.NOTFOUND,
      });
    } else {
      if (userLogin.isactive) {
        return res.status(401).json({
          status: 401,
          message: responsemessage.ISACTIVE,
        });
      } else {
        const isvalid = await bcrypt.compare(password, userLogin.password);

        if (!isvalid) {
          return res.status(404).json({
            status: 404,
            error: true,
            message: responsemessage.NOTMATCH,
          });
        } else {
          const { error, token } = await generateJwt(userLogin._id);
          if (error) {
            return res.status(400).json({
              status: 400,
              error: true,
              message: responsemessage.TOKEN,
            });
          } else {
            return res.status(201).json({
              status: 201,
              userLogin: empEmail,
              empMobile,
              success: true,
              token: token,
              message: responsemessage.SUCCESS,
            });
          }
        }
      }
    }
  } catch (err) {
    // console.error("Login error", err);
    return res.status(401).json({
      status: 401,
      message: responsemessage.NOTSUCCESS,
    });
  }
};

exports.SendOTP = async (req, res) => {
  try {
    const { empEmail } = req.body;

    if (!empEmail) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.NOTPROCCESS,
      });
    } else {
      let user = await EmpRegister.findOne({
        empEmail,
      });
      // console.log(user);
      if (!user) {
        return res.json({
          message: responsemessage.CHECKEMAILID,
        });
        // } else {
        //   let response = await sendEmail(user.empEmail, otp);
        //   // console.log(response);
        //   if (response.error) {
        //     return res.status(503).json({
        //       status: 503,
        //       message: responsemessage.NOTSENDEMAIL,
        //     });
      } else {
        const expiry = Date.now() + 2 * 60 * 1000;
        const expiryIST = new Date(expiry).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });

        // user.otp = otp;
        // user.otpExpire = expiryIST;

        const updateUser = await EmpRegister.findByIdAndUpdate(
          { _id: user._id },
          { $set: { otp: otp, otpExpire: expiryIST } },
          { new: true }
        );
        console.log(updateUser);
      }
      return res.status(200).json({
        status: 200,
        user: otp,
        message: responsemessage.FOUNDDETAILS,
      });
      // }
    }
  } catch (error) {
    // console.error("OTP json-error", error);
    return res.status(500).json({
      status: 500,
      message: responsemessage.SERVERERROR,
    });
  }
};

exports.ForgotPassword = async (req, res) => {
  try {
    const { empEmail, newPassword, confirmPassword } = req.body;

    if (!password || !confirmPassword || !email) {
      return res.status(403).json({
        status: 403,
        error: true,
        message: responsemessage.EMPTYFIELDS,
      });
    } else if (!validatePassword(newPassword)) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.PASSWORDVALIDATE,
      });
    } else {
      const user = await EmpRegister.findOne({ empEmail });
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
          const updateUser = await EmpRegister.findByIdAndUpdate(
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

exports.ResetPassword = async (req, res) => {
  try {
    const { empEmail, oldPassword, newPassword, confirmPassword } = req.body;

    if (!empEmail || !newPassword || !confirmPassword || !oldPassword) {
      return res.status(403).json({
        error: true,
        message: responsemessage.FILDSREQUIRE,
      });
    } else if (!validatePassword(newPassword)) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.PASSWORDVALIDATE,
      });
    } else {
      const user = await EmpRegister.findOne({ empEmail });
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
        } else {
          const isSamePassword = await bcrypt.compare(
            oldPassword,
            user.password
          );
          if (!isSamePassword) {
            return res.status(400).json({
              status: 400,
              message: responsemessage.NOTMATCH,
            });
          } else {
            const isNewPasswordSame = await bcrypt.compare(
              newPassword,
              user.password
            );
            if (isNewPasswordSame) {
              return res.status(400).json({
                status: 400,
                message: responsemessage.OLDPASSWORDMATCH,
              });
            } else {
              const passwordHash = await passwordencrypt(
                newPassword,
                user.password
              );
              const updateUser = await EmpRegister.findByIdAndUpdate(
                { _id: user._id },
                { $set: { password: passwordHash } },
                { new: true }
              );

              return res.status(200).json({
                status: 200,
                message: responsemessage.PASSWORDCHANGE,
              });
            }
          }
        }
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

exports.Upload = async (req, res) => {
  try {

    if (!req.profileUrl) {
      return res.status(400).json({ message: "Please upload a file!" });
    }
    res.status(200).json({
      message: "Uploaded the file successfully. ",
      fileurls: req.profileUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: `Could not upload the file: ${req.file.originalname}. ${error}`,
    });
  }
};

exports.employeeFind = async (req, res) => {
  try {
    let userdata = await EmpRegister.findById({ _id: req.currentUser });

    if (!userdata) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.NOTFOUND,
      });
    }
    res.status(200).json({
      status: 200,
      userdata,
      message: responsemessage.FOUNDUSER,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: responsemessage.SERVERERROR,
    });
  }
};


exports.employeeDelete = async (req, res) => {
  try {
    const user = await EmpRegister.findByIdAndUpdate({ _id: req.currentUser });
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.NOTFOUND,
      });
    } else {
      user.isactive = true;
      await user.save();
    }
    return res.status(200).json({
      status: 200,
      user,
      message: responsemessage.DELETE,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: responsemessage.SERVERERROR,
    });
  }
};

exports.employeeUpdate = async (req, res) => {
  try {
    let { empEmail, empMobile } = req.body;



   // empEmail = empEmail.toLowerCase();
    const employeeEmail = empEmail ? empEmail.toLowerCase() : undefined;

    await EmpRegister.validate({ empEmail, empMobile });

    let existemail = await EmpRegister.findOne({
      empEmail,
      _id: { $ne: req.currentUser },
    });
    let existphone = await EmpRegister.findOne({
      empMobile,
      _id: { $ne: req.currentUser },
    });

    if (existemail || existphone) {
      const message =
        existemail
          ? responsemessage.EMAILEXITS
          : responsemessage.MOBILEEXITS;

      res.status(400).json({ status: 400, message });
      
    }
    else {
  
     let userdata = await EmpRegister.findById({ _id: req.currentUser });
      // console.log(userdata);

      if (!userdata) {
        return res.status(400).json({
          status: 400,
          message: responsemessage.NOTFOUND,
        });
      } else {
 
        let userdata = {
          empEmail: employeeEmail,
          empMobile,
          profile:req.profileUrl,
          document:req.documentUrl
        
         
        };


        const UpdateUser = await EmpRegister.findByIdAndUpdate(
          { _id: req.currentUser },
          { $set: userdata },
          { new: true }
        );

        res.status(200).json({
          status: 200,
          message: responsemessage.UPDATE,
        });
      }
    
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      // message1: `${error}`,
      message: responsemessage.SERVERERROR,
    });
  }
};

exports.Userlogout = async (req, res) => {
  try {
    const userId = req.currentUser;
    let user = await EmpRegister.findById(userId);

    const User = await EmpRegister.findByIdAndUpdate(
      { _id: user._id },

      { new: true }
    );

    return res.status(200).json({
      status: 200,
      message: responsemessage.USERLOGOUT,
    });
  } catch (error) {
    // console.log(error);

    return res.status(500).json({
      status: 500,
      message: responsemessage.SERVERERROR,
    });
  }
};


