const express = require("express");

const {
  addcomment,
  updatecomment,
  deletecomment,
  getpostcomment,
} = require("../controllers/comment");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/addcomment").post(auth, addcomment);
router.route("/updatecomment").put(auth, updatecomment);
router.route("/deletecomment").delete(auth, deletecomment);
router.route("/getpostcomment").get(auth, getpostcomment);
module.exports = router;
