const express = require("express");

const {
  addcomment,
  updatecomment,
  deletecomment,
  getcomment,
} = require("../controllers/comment");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/addcomment").post(auth, addcomment);
router.route("/updatecomment").put(auth, updatecomment);
router.route("/deletecomment").delete(auth, deletecomment);
router.route("/getcomment").get(auth, getcomment);
module.exports = router;
