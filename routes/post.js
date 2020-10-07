const express = require("express");

const {
  upload,
  update,
  deletepost,
  allpost,
  one,
  photourl,
  best,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/best").get(best);
router.route("/photourl/:user_id").get(photourl);
router.route("/upload").post(auth, upload);
router.route("/allpost").get(auth, allpost);
router.route("/:post_id").put(auth, update).delete(auth, deletepost).get(auth, one);

module.exports = router;
