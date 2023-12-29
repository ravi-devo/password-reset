const mongoose = require("mongoose");
const config = require('../utils/config');

const db = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("DB connection established.")
    } catch (error) {
        console.log("Error connecting with DB.")
    }
}

module.exports = db;