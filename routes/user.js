const express = require("express");

const { createUser, login, logout } = require("../controllers/user");

const auth = require("../middleware/auth");
const router = express.Router();

router.route("/").post(createUser);
router.route("/login").post(login);
router.route("/logout").delete(auth, logout);

module.exports = router;
