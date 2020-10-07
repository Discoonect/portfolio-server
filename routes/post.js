const express = require("express");

const {
  upload,
  updatepost,
  deletepost,
  getallpost,
  getonepost,
  getpostphotourl,
  bestpost,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, upload);
router.route("/getpostphotourl/:user_id").get(getpostphotourl);
router.route("/getonepost/:post_id").get(auth, getonepost);
router.route("/getallpost").get(auth, getallpost);
router.route("/updatepost/:post_id").put(auth, updatepost);
router.route("/deletepost/:post_id").delete(auth, deletepost);
router.route("/bestpost").get(bestpost);
module.exports = router;
