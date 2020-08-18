const express = require("express");

const { upload, myPost } = require("../controllers/post");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, upload);
router.route("/me").get(auth, myPost);

module.exports = router;
