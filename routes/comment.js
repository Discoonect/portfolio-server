const express = require("express");

const { addcomment, updatecomment } = require("../controllers/comment");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/addcomment").post(auth, addcomment);
router.route("/updatecomment").put(auth, updatecomment);
module.exports = router;
