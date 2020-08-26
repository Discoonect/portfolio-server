const express = require("express");

const {
  likepost,
  deletelikepost,
  countlikepost,
  likecomment,
  deletelikecomment,
} = require("../controllers/like");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/likepost").post(auth, likepost);
router.route("/deletelikepost").delete(auth, deletelikepost);
router.route("/countlikepost/:post_id").get(countlikepost);
router.route("/likecomment").post(auth, likecomment);
router.route("/deletelikecomment").delete(auth, deletelikecomment);
module.exports = router;
