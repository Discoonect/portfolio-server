const express = require("express");

const { postlikealarm } = require("../controllers/alarm");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/postlikealarm").get(auth, postlikealarm);

module.exports = router;