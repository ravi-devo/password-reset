const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

const userController = {
    signIn: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await Users.findOne({ username: username });

            //If user doesn't registered returning an error
            if (!user) {
                return res.status(404).json({ message: "User doesn't exist, please register before logging in." })
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);

            //If the password doesn't match, returning an error
            if (!isPasswordMatch) {
                return res.status(401).json({ message: "Incorrect credentials, please check your username and password" })
            }

            const options = {
                'expiresIn': '1hr'
            }

            const secretKey = config.SECRET_KEY;

            const payload = {
                id: user._id,
                name: user.firstName,
                username: user.username
            }

            const token = jwt.sign(payload, secretKey, options);

            res.json({message: "User signed in successfully.", token, username: user.username});

        } catch (error) {
            res.status(500).json({ message: "Internal server error", error });
        }
    },

    signUp: async (req, res) => {
        try {
            const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            const { firstName, lastName, phoneNumber, username, password } = req.body;
            const isUserExist = await Users.findOne({ username: username });

            //Checking if user exists in database.
            if (isUserExist) {
                return res.json({ message: "User already exists, please sign in using the credentials." })
            }

            //Checking if the username is provided within the criteria
            if (gmailRegex.test(username)) {
                const hashedPassword = await bcrypt.hash(password, 10);
                const createUser = {
                    firstName, lastName, phoneNumber, username, password: hashedPassword
                };

                //Pushing the user into the database
                await Users.create(createUser);
                return res.json({ message: "User registered successfully." });
            } else {
                return res.status(400).json({ message: "Here only gmail email is allowed, please use a valid gmail address as the username." })
            }

        } catch (error) {
            res.status(500).json({ message: "Error registering user", error });
        }
    }
}

module.exports = userController;