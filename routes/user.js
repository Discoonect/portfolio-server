const express = require("express");

const { createUser, login } = require("../controllers/user");

const auth = require("../middleware/auth");
const router = express.Router();

router.route("/").post(createUser);
router.route("/login").post(login);

module.exports = router;
