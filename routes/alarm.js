const express = require("express");

const {
  postlike,
  comment,
  followalarm,
} = require("../controllers/alarm");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/postlike").get(auth, postlike);
router.route("/comment").get(auth, comment);
router.route("/followalarm").get(auth, followalarm);

module.exports = router;
