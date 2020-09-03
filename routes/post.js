const express = require("express");

const {
  uploadpost,
  getmypost,
  updatepost,
  deletepost,
  getallpost,
  mypost,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/uploadpost").post(auth, uploadpost);
router.route("/getmypost").get(auth, getmypost);
router.route("/mypost/:post_id").get(auth, mypost);
router.route("/getallpost").get(auth, getallpost);
router.route("/updatepost/:post_id").put(auth, updatepost);
router.route("/deletepost/:post_id").post(auth, deletepost);
module.exports = router;
