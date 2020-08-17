const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const morgan = require("morgan");

const user = require("./routes/user");

const app = express();
app.use(express.json());

app.use(morgan("dev"));

app.use("/api/v1/user", user);

const PORT = process.env.PORT || 5990;

app.listen(PORT, console.log(`Server running in port ${PORT}!`));
