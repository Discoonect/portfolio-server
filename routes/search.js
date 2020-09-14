const express = require("express");

const { search } = require("../controllers/search");

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/search").get(search);

module.exports = router;
