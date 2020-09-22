const express = require("express");

const {
  postlikealarm,
  commentalarm,
  followalarm,
} = require("../controllers/alarm");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/postlikealarm").get(auth, postlikealarm);
router.route("/commentalarm").get(auth, commentalarm);
router.route("/followalarm").get(auth, followalarm);

module.exports = router;
