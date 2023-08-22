const express = require("express");
const admindata = require("../controller/admin/AdminController")
const useraccess = require("../controller/admin/UserManegment")
const CommonService = require("../services/CommonService")
const uploadFile = require("../middleware/FileUpload")
const router = express.Router();

const {adminauthenticationToken} = require("../middleware/auth")

//Admin Routes
router.post("/signup",  admindata.AdminSingup);
router.post("/signin",  admindata.AdminSingIn);
router.patch("/update", adminauthenticationToken,uploadFile,admindata.UpdateAdminData)
router.patch("/resetpassword",  adminauthenticationToken,admindata.AdminResetPassword);
router.post("/SendOTP",  admindata.SendOTP);
router.patch("/forgotpassword",  admindata.AdminForgotPassword);
router.post("/singout", adminauthenticationToken,admindata.Adminlogout);
router.post("/verifyotp",  CommonService.VerifyOTP);




//User Routes
router.post("/usersingup",  adminauthenticationToken,uploadFile,useraccess.SingUp);
router.get("/userfind", adminauthenticationToken,useraccess.userFind);
router.get("/alluser", adminauthenticationToken,useraccess.userFindAll);
router.delete("/userdelete", adminauthenticationToken,useraccess.userDelete);
router.patch("/userupdate", adminauthenticationToken,uploadFile,useraccess.userUpdate,);
router.patch("/useractive", adminauthenticationToken,useraccess.userActive);

module.exports = router;