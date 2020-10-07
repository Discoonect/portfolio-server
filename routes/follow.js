const express = require("express");

const {
  follow,
  deletefollow,
  following,
  follower,
  checkfollow,
} = require("../controllers/follow");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, follow).delete(auth, deletefollow);
router.route("/following/:user_id").get(following);
router.route("/follower/:user_id").get(follower);
router.route("/checkfollow/:following_id").get(auth, checkfollow);
module.exports = router;
