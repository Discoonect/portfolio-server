const express = require("express");

const {
  post,
  deletelike,
  count,
  likepostuser,
} = require("../controllers/like");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/count/:post_id").get(count);
router.route("/likepostuser/:post_id").get(likepostuser);
router.route("/post").post(auth, post).delete(auth, deletelike);

module.exports = router;
