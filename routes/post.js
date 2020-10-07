const express = require("express");

const {
  upload,
  update,
  deletepost,
  allpost,
  one,
  getpostphotourl,
  bestpost,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/upload").post(auth, upload);
router.route("/getpostphotourl/:user_id").get(getpostphotourl);
router.route("/one/:post_id").get(auth, one);
router.route("/allpost").get(auth, allpost);
router.route("/:post_id").put(auth, update).delete(auth, deletepost);
router.route("/bestpost").get(bestpost);
module.exports = router;
