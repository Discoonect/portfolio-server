const express = require("express");

const { follow, deletefollow } = require("../controllers/follow");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/").post(auth, follow);
router.route("/deletefollow").delete(auth, deletefollow);

module.exports = router;
