const express = require("express");
const config = require("./utils/config");

const app = express();
const db = require("./db/db");
const userRoutes = require("./routes/userRoutes");
const path = require('path');
const bodyParser = require('body-parser');

app.use(express.json());
db();

// Set EJS as the view engine
app.set('view engine', 'ejs');

//Body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

app.use('/api/users', userRoutes);

app.listen(config.PORT, () => {
    console.log("App is running...");
})