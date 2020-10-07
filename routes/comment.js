const express = require("express");

const {
  addcomment,
  deletecomment,
  comment,
  count,
} = require("../controllers/comment");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, addcomment).delete(auth, deletecomment);
router.route("/:post_id").get(comment);
router.route("/count/:post_id").get(count);
module.exports = router;
