const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const EmpRegister = require("../../models/User");

const { passwordencrypt, otp } = require("../../services/CommonService");
const responsemessage = require("../../utils/ResponseMessage.json");
const { generateJwt } = require("../../utils/jwt");
require("../../services/EmailService");
require("../../middleware/FileUpload");

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
    
    firstName = firstName.replace(/\s/g, "");
    lastName = lastName.replace(/\s/g, "");
    empEmail = empEmail.replace(/\s/g, "");

    if (!firstName || !lastName || !empEmail || !empMobile) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.FILDSREQUIRE,
      });
    } else if (!validatePassword(password)) {
      return res.status(400).json({
        status: 400,
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
          Math.floor(Math.random().toFixed(2) * 100);
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

        empdata.save().then((data, error) => {
          if (error) {
            return res.status(400).json({
              status: 400,
              message: responsemessage.NOTCREATE,
            });
          } else {
            return res.status(201).json({
              status: 201,
              message: responsemessage.CREATE,
              empdata: data,
            });
          }
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

// exports.singin = async (req, res) => {
//   try {
//     let { empEmail, password } = req.body;

//     let userLogin = await EmpRegister.findOne({ empEmail });

//     if (!userLogin) {
//       return res.status(404).json({
//         message: responsemessage.NOTFOUND,
//       });
//     } else {
//       if (userLogin.isactive) {
//         return res.status(400).json({
//           message: responsemessage.ISACTIVE,
//         });
//       } else {
//         const isvalid = await bcrypt.compare(password, userLogin.password);

//         if (!isvalid) {
//           return res.status(400).json({
//             message: responsemessage.NOTMATCH,
//           });
//         } else {
//           const { error, token } = await generateJwt(userLogin._id);
//           if (error) {
//             return res.status(500).json({
//               message: responsemessage.TOKEN,
//             });
//           } else {
//             userLogin.token = token;
//             await userLogin.save();

//             return res.json({
//               token: token,
//               message: responsemessage.SUCCESS,
//             });
//           }
//         }
//       }
//     }
//   } catch (err) {
//     return res.status(500).json({
//       message: responsemessage.NOTSUCCESS,
//     });
//   }
// };

// exports.ForgotPassword = async (req, res) => {
//   try {
//     const { empEmail, otp, newPassword, confirmPassword } = req.body;

//     const user = await EmpRegister.findOne({ empEmail });
//     if (!user) {
//       return res.status(404).json({ message: responsemessage.NOTFOUND });
//     } else {
//       if (user.otp !== otp) {
//         return res.status(400).json({ message: responsemessage.NOTMATCHOTP });
//       }

//       user.otp = "";
//       user.otpExpire = "";
//       await user.save();

//       if (newPassword !== confirmPassword) {
//         return res.status(400).json({ message: responsemessage.NOTMATCH });
//       } else {
//         const isSamePassword = await bcrypt.compare(newPassword, user.password);
//         if (isSamePassword) {
//           return res.status(400).json({
//             message: responsemessage.OLDPASSWORDMATCH,
//           });
//         } else {
//           const passwordHash = await passwordencrypt(newPassword);
//           user.password = passwordHash;
//           await user.save();

//           return res.json({ message: responsemessage.PASSWORDCHANGE });
//         }
//       }
//     }
//   } catch (error) {
//     // console.error("reset-password-error", error);
//     return res.status(500).json({ message: responsemessage.SERVERERROR });
//   }
// };

// exports.ResetPassword = async (req, res) => {
//   try {
//     const { empEmail, oldPassword, newPassword, confirmPassword } = req.body;
//     if (!empEmail || !newPassword || !confirmPassword || !oldPassword) {
//       return res.status(403).json({
//         error: true,
//         message: "Could not process request. Please provide all fields",
//       });
//     }

//     const user = await EmpRegister.findOne({ empEmail });
//     if (!user) {
//       return res.json({
//         message: "User not found",
//       });
//     } else {
//       if (newPassword !== confirmPassword) {
//         return res.status(400).json({
//           message: "Passwords do not match",
//         });
//       }

//       const isSamePassword = await bcrypt.compare(oldPassword, user.password);
//       if (!isSamePassword) {
//         return res.status(400).json({ message: "Incorrect current password" });
//       }

//       const isNewPasswordSame = await bcrypt.compare(
//         newPassword,
//         user.password
//       );
//       if (isNewPasswordSame) {
//         return res.status(400).json({
//           message: "New password must be different from the old password",
//         });
//       }
//     }
//     const passwordHash = await passwordencrypt(newPassword, user.password);
//     user.password = passwordHash;

//     await user.save();

//     return res.json({
//       message: "Password has been changed",
//     });
//   } catch (error) {
//     console.error("reset-password-error", error);
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };

// exports.verifyotp = async (req, res) => {
//   const {empEmail, otp } = req.body;

//   // Check if the OTP is valid.
//   const user = await EmpRegister.findOne({ empEmail});
//   if (!user || user.otpExpire < new Date()) {
//     return res.status(400).json("Invalid OTP");
//   }

//   // Update the user's password.
//   const password = await req.body.password;

//   EmpRegister.findByIdAndUpdate({ _id: user._id }, { password: password });
//   return EmpRegister;

//   // Delete the OTP.
//   // await user.delete();

//   res.json("Password reset successfully");
// };

// exports.Upload = async (req, res) => {
//   try {
//     if (!req.fileurl || req.fileurl.length === 0) {
//       return res.status(400).json({ message: "Please upload a file!" });
//     }
//     res.status(200).json({
//       message: "Uploaded the file successfully. ",
//       fileurls: req.fileurl,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: `Could not upload the file: ${req.file.originalname}. ${error}`,
//     });
//   }
// };

exports.userFind = async (req, res) => {
  try {
    const { _id } = req.body;
    let userdata = await EmpRegister.findById(_id);

    if (!userdata) {
      return res.status(404).json({
        status: 404,
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
// exports.userFindAll = async (req, res) => {
//   try {
//     let userdata = await EmpRegister.find();

//     res.status(200).json({
//       status: 200,
//       userdata,
//       message: responsemessage.FOUNDUSER,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: 500,
//       message: responsemessage.SERVERERROR,
//     });
//   }
// };
exports.userFindAll = async (req, res) => {
  try {
const {empCode, empName} = req.body
    const data ={}
    if(empName){
      data.empName = empName;
    }
    if(empCode){
      data.empCode = empCode
    }

    let userdata = await EmpRegister.aggregate([
      { $match: {isactive:true}
       },
   {
    $project: 
    {
      empName:1,
      empCode:1
    }
   }
   
    ]);;

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



exports.userDelete = async (req, res) => {
  try {
    const { empCode, _id } = req.body;
    // console.log(empCode);
    const user = await EmpRegister.findByIdAndUpdate({ _id });
    // console.log(user);
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
    res.status(500).json({
      status: 500,
      message: responsemessage.DELETEERROR,
    });
  }
};

exports.userUpdate = async (req, res) => {
  try {
    let { _id, empEmail, empMobile, profile, document } = req.body;

    const employeeEmail = empEmail ? empEmail.toLowerCase() : undefined;

    let existemployee = await EmpRegister.findOne({
      $or: [{ empEmail }, { empMobile }],
    });
    // console.log(existemployee);
    if (existemployee) {
      res.status(400).json({
        status: 400,
        message: responsemessage.EXIST,
      });
    } else {
      const userdata = await EmpRegister.findById({ _id });

      if (!userdata) {
        return res.status(400).json({
          status: 400,
          message: responsemessage.NOTFOUND,
        });
      } else {
        // empEmail = empEmail.toLowerCase();
        let userdata = {
          empEmail: employeeEmail,
          empMobile,
          profile: req.profileUrl,
          document: req.documentUrl,
        };

        const UpdateUser = await EmpRegister.findByIdAndUpdate(
          { _id },
          { $set: userdata },
          { new: true }
        );
        // console.log(UpdateUser);
        res.status(201).json({
          status: 201,
          message: responsemessage.UPDATE,
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: responsemessage.SERVERERROR,
    });
  }
};

// exports.Userlogout = async (req, res) => {
//   try {
//     const userId = req.currentUser;
//     let user = await EmpRegister.findById(userId);

//     const User = await EmpRegister.findByIdAndUpdate(
//       { _id: user._id },

//       { new: true }
//     );

//     return res.status(200).json({
//       status: 200,
//       message: responsemessage.USERLOGOUT,
//     });
//   } catch (error) {
//     // console.log(error);

//     return res.status(500).json({
//       status:500,
//       message: responsemessage.SERVERERROR });
//   }
// };

exports.userActive = async (req, res) => {
  try {
    let user = await EmpRegister.findOne({ _id });
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: responsemessage.NOTFOUND,
      });
    } else {
      user.isactive = false;
      await user.save();

      return res.status(200).json({
        status: 200,
        message: responsemessage.USERACTIVE,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: responsemessage.ACTIVEERROR,
    });
  }
};


