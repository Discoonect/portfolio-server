const express = require("express");

const {
  upload,
  updatepost,
  deletepost,
  allpost,
  onepost,
  photourl,
  bestpost,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/upload").post(auth, upload);
router.route("/photourl/:user_id").get(photourl);
router.route("/:post_id").get(auth, onepost).put(auth, updatepost).delete(auth, deletepost);
router.route("/allpost").get(auth, allpost);
router.route("/bestpost").get(bestpost);
module.exports = router;
