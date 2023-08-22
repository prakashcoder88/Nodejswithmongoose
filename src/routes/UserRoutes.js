const express = require("express");
const userdata = require("../controller/user/UserController")
const CommonService = require("../services/CommonService")
const uploadFile = require("../middleware/FileUpload")
const router = express.Router();

const {UserValidateToken} = require("../middleware/auth")



router.post("/singup", uploadFile, userdata.SingUp);
router.post("/singin",  userdata.singin);
router.post('/singout', UserValidateToken,userdata.Userlogout)

router.patch("/resetpassword", UserValidateToken, userdata.ResetPassword);
router.post("/SendOTP",  userdata.SendOTP);
router.post("/forgotpassword", userdata.ForgotPassword)

router.post("/verifyotp",  CommonService.VerifyOTP);
router.post('/upload', UserValidateToken,uploadFile,userdata.Upload)


router.get("/empdata", UserValidateToken,userdata.employeeFind);
router.delete("/empdelete", UserValidateToken,userdata.employeeDelete);
router.patch("/empupdate", UserValidateToken,uploadFile,userdata.employeeUpdate);

module.exports = router;