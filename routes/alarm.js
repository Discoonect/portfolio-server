const express = require("express");

const {
  postlike,
  comment,
  follow,
} = require("../controllers/alarm");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/postlike").get(auth, postlike);
router.route("/comment").get(auth, comment);
router.route("/follow").get(auth, follow);

module.exports = router;
