const express = require("express");

const { follow } = require("../controllers/follow");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, follow);

module.exports = router;
