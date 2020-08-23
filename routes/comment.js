const express = require("express");

const { addcomment } = require("../controllers/comment");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/addcomment").post(auth, addcomment);
module.exports = router;
