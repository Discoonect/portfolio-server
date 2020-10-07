const express = require("express");

const {
  post,
  deletelike,
  countlikepost,
  likepostuser,
} = require("../controllers/like");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/countlikepost/:post_id").get(countlikepost);
router.route("/likepostuser/:post_id").get(likepostuser);
router.route("/post").post(auth, post).delete(auth, deletelike);

module.exports = router;
