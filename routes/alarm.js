const express = require("express");

const {
  postlikealarm,
  comment,
  followalarm,
} = require("../controllers/alarm");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/postlikealarm").get(auth, postlikealarm);
router.route("/comment").get(auth, comment);
router.route("/followalarm").get(auth, followalarm);

module.exports = router;
