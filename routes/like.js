const express = require("express");

const {
  post,
  deletelike,
  count,
  user,
} = require("../controllers/like");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/count/:post_id").get(count);
router.route("/user/:post_id").get(user);
router.route("/post").post(auth, post).delete(auth, deletelike);

module.exports = router;
