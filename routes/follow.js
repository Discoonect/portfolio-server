const express = require("express");

const {
  following,
  deletefollow,
  myfollowing,
  myfollower,
} = require("../controllers/follow");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/following").post(auth, following);
router.route("/deletefollow").post(auth, deletefollow);
router.route("/myfollowing").get(auth, myfollowing);
router.route("/myfollower").get(auth, myfollower);
module.exports = router;
