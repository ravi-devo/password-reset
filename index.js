const express = require("express");
const config = require("./utils/config");

const app = express();
const db = require("./db/db");
const userRoutes = require("./routes/userRoutes");

app.use(express.json());
db();

app.use('/api/users', userRoutes);

app.listen(config.PORT, () => {
    console.log("App is running...");
})