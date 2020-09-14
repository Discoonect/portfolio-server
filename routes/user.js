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
} = require("../controllers/user");

const auth = require("../middleware/auth");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/checkid").post(checkid);
router.route("/login").post(login);
router.route("/logout").delete(auth, logout);
router.route("/adios").delete(auth, adios);
router.route("/mypage").get(auth, mypage);
router.route("/mypage2").get(auth, mypage2);
router.route("/myintroduce").put(auth, myintroduce);
router.route("/profilephoto").post(auth, profilephoto);

module.exports = router;
