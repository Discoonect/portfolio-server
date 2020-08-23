const express = require("express");

const {
  upload,
  myPost,
  getfollowerPost,
  updatepost,
  deletepost,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, upload);
router.route("/me").get(auth, myPost);
router.route("/followerpost").get(auth, getfollowerPost);
router.route("/updatepost/:post_id").put(auth, updatepost);
router.route("/deletepost/:post_id").delete(auth, deletepost);
module.exports = router;
