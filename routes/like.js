const express = require("express");

const {
  likepost,
  deletelikepost,
  countpost,
  user,
} = require("../controllers/like");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/post").post(auth, likepost).delete(auth, deletelikepost);
router.route("/countpost/:post_id").get(countpost);
router.route("/user/:post_id").get(user);

module.exports = router;
