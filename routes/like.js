const express = require("express");

const {
  post,
  deletelikepost,
  countlikepost,
  likepostuser,
} = require("../controllers/like");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/countlikepost/:post_id").get(countlikepost);
router.route("/likepostuser/:post_id").get(likepostuser);
router.route("/post").post(auth, post);
router.route("/deletelikepost").delete(auth, deletelikepost);

module.exports = router;
