require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;
const EMAIL = process.env.EMAIL;
const APP_PASSWORD = process.env.PASSWORD;

module.exports = { MONGODB_URI, PORT, SECRET_KEY, EMAIL, APP_PASSWORD };