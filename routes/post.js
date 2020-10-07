const express = require("express");

const {
  upload,
  update,
  deletepost,
  getallpost,
  getonepost,
  getpostphotourl,
  bestpost,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/upload").post(auth, upload);
router.route("/getpostphotourl/:user_id").get(getpostphotourl);
router.route("/getonepost/:post_id").get(auth, getonepost);
router.route("/getallpost").get(auth, getallpost);
router.route("/:post_id").put(auth, update);
router.route("/deletepost/:post_id").delete(auth, deletepost);
router.route("/bestpost").get(bestpost);
module.exports = router;
