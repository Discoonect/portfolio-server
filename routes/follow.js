const express = require("express");

const {
  following,
  deletefollow,
  myfollowing,
} = require("../controllers/follow");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/following").post(auth, following);
router.route("/deletefollow").post(auth, deletefollow);
router.route("/myfollowing").get(auth, myfollowing);
module.exports = router;
