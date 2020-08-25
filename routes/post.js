const express = require("express");

const {
  uploadpost,
  myPost,
  getallpost,
  updatepost,
  deletepost,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/uploadpost").post(auth, uploadpost);
router.route("/mypost").get(auth, myPost);
router.route("/getallpost").get(auth, getallpost);
router.route("/updatepost/:post_id").put(auth, updatepost);
router.route("/deletepost/:post_id").delete(auth, deletepost);
module.exports = router;
