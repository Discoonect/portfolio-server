const express = require("express");

const {
  likepost,
  deletelikepost,
  countlikepost,
  likepostuser,
} = require("../controllers/like");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/likepost").post(auth, likepost);
router.route("/deletelikepost").delete(auth, deletelikepost);
router.route("/countlikepost/:post_id").get(countlikepost);
router.route("/likepostuser/:post_id").get(likepostuser);
module.exports = router;
