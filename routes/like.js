const express = require("express");

const { likepost, deletelikepost } = require("../controllers/like");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/likepost").post(auth, likepost);
router.route("/deletelikepost").delete(auth, deletelikepost);
module.exports = router;
