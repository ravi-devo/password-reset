const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const baseURL = 'http://localhost:8000'
const path = require('path');

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

            res.json({ message: "User signed in successfully.", token, username: user.username });

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
    },

    forgotPassword: async (req, res) => {
        const { username } = req.body;
        const user = await Users.findOne({ username: username });

        if (!user) {
            return res.json({ message: "The user doesn't exist in the database, please check the username." });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1);

        //Storing the token in database and expiration set to 1 hour
        await Users.findOneAndUpdate(user._id, { token, tokenExpiresAt });

        const resetLink = `${baseURL}/api/users/resetPassword/${token}`;
        const mailOptions = {
            from: config.EMAIL,
            to: username,
            subject: 'Reset Your Password',
            text: `Click the following link to reset your password: ${resetLink}`,
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.EMAIL,
                pass: config.APP_PASSWORD
            }
        });

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).send('Error sending email');
            } else {
                console.log('Email sent:', info.response);
                res.send('Email sent. Check your inbox for the reset link.');
            }
        });
    },

    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            const user = await Users.findOne({ token });
    
            if(!user){
                return res.json({message: "Invalid token"});
            }
    
            if (new Date() > user.tokenExpiresAt) {
                return res.json({ message: "Your token has expired, please request a new password reset link." })
            }
    
            res.render(path.join(__dirname, '../views', 'setPassword'), { token });
        } catch (error) {
            return res.status(500).json({message: "Internal server error", error});
        }
    },

    setPassword: async (req, res) => {
        try {
            const {token, newPassword} = req.body;
            const user = await Users.findOne({token});
            const hashedPassword = await bcrypt.hash(newPassword, 10);
    
            user.password = hashedPassword;
            user.token = null;
            user.tokenExpiresAt = null;
            await user.save();
    
            res.json({message: "Password changed successfully."})
        } catch (error) {
            res.json({message: "Internal server error.", error})
        }

    }
}

module.exports = userController;