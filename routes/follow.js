const express = require("express");

const {
  follow,
  deletefollow,
  userfollowing,
  userfollower,
  checkfollow,
} = require("../controllers/follow");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, follow);
router.route("/deletefollow").delete(auth, deletefollow);
router.route("/userfollowing/:user_id").get(userfollowing);
router.route("/userfollower/:user_id").get(userfollower);
router.route("/checkfollow/:following_id").get(auth, checkfollow);
module.exports = router;
