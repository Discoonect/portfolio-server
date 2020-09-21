const express = require("express");

const { postlikealarm, commentalarm } = require("../controllers/alarm");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/postlikealarm").get(auth, postlikealarm);
router.route("/commentalarm").get(auth, commentalarm);

module.exports = router;
