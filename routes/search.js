const express = require("express")

const{searchuser} = require("../controllers/search")

const auth = require("../middleware/auth");

const router = express.Router();

router.route("/searchuser").get(searchuser)

module.exports = router;