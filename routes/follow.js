const express = require("express");

const { following, deletefollow } = require("../controllers/follow");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/following").post(auth, following);
router.route("/deletefollow").delete(auth, deletefollow);

module.exports = router;
