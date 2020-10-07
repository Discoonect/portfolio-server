const express = require("express");

const {
  addcomment,
  deletecomment,
  comment,
  countcomment,
} = require("../controllers/comment");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, addcomment).delete(auth, deletecomment);
router.route("/:post_id").get(comment);
router.route("/countcomment/:post_id").get(countcomment);
module.exports = router;
