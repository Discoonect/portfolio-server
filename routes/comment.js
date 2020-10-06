const express = require("express");

const {
  addcomment,
  deletecomment,
  getcomment,
  count,
} = require("../controllers/comment");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/addcomment").post(auth, addcomment).delete(auth, deletecomment);
router.route("/:post_id").get(getcomment);
router.route("/count/:post_id").get(count);
module.exports = router;
