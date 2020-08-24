const express = require("express");

const {
  uploadpost,
  myPost,
  getfollowerPost,
  updatepost,
  deletepost,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/uploadpost").post(auth, uploadpost);
router.route("/me").get(auth, myPost);
router.route("/followerpost").get(auth, getfollowerPost);
router.route("/updatepost/:post_id").put(auth, updatepost);
router.route("/deletepost/:post_id").delete(auth, deletepost);
module.exports = router;
