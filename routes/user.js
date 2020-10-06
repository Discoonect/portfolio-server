const express = require("express");

const {
  signup,
  login,
  logout,
  adios,
  checkid,
  mypage,
  mypage2,
  myintroduce,
  profilephoto,
  deleteprofilephoto,
  userpage,
  userpage2,
} = require("../controllers/user");

const auth = require("../middleware/auth");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/checkid").post(checkid);
router.route("/login").post(login);
router.route("/logout").delete(auth, logout);
router.route("/adios").delete(auth, adios);
router.route("/mypage").get(auth, mypage)
router.route("/mypage2").get(auth, mypage2);
router.route("/userpage/:user_id").get(userpage);
router.route("/userpage2/:user_id").get(userpage2);
router.route("/myintroduce").post(auth, myintroduce);
router.route("/profilephoto").post(auth, profilephoto).delete(auth, deleteprofilephoto);


module.exports = router;
