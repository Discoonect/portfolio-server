const express = require("express");

const {
  upload,
  update,
  deletepost,
  all,
  one,
  photourl,
  best,
} = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/upload").post(auth, upload);
router.route("/photourl/:user_id").get(photourl);
router.route("/:post_id").get(auth, one).put(auth, update).delete(auth, deletepost);
router.route("/all").get(auth, all);
router.route("/best").get(best);
module.exports = router;
