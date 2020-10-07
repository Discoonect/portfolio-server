const express = require("express");

const {
  addcomment,
  deletecomment,
  getcomment,
  countcomment,
} = require("../controllers/comment");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, addcomment);
router.route("/deletecomment").delete(auth, deletecomment);
router.route("/getcomment/:post_id").get(getcomment);
router.route("/countcomment/:post_id").get(countcomment);
module.exports = router;
