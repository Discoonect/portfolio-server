const express = require("express");

const {
  following,
  deletefollow,
  userfollowing,
  userfollower,
  checkfollow,
} = require("../controllers/follow");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/following").post(auth, following);
router.route("/deletefollow").post(auth, deletefollow);
router.route("/userfollowing/:user_id").get(userfollowing);
router.route("/userfollower/:user_id").get(userfollower);
router.route("/checkfollow/:following_id").get(auth, checkfollow);
module.exports = router;
