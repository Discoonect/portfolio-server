const express = require("express");

const {
  signup,
  login,
  logout,
  adios,
  checkid,
} = require("../controllers/user");

const auth = require("../middleware/auth");
const router = express.Router();

router.route("/signup").post(signup);
router.route("/checkid").post(checkid);
router.route("/login").post(login);
router.route("/logout").delete(auth, logout);
router.route("/adios").delete(auth, adios);

module.exports = router;
