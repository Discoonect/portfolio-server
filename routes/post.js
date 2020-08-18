const express = require("express");

const { upload } = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, upload);

module.exports = router;
