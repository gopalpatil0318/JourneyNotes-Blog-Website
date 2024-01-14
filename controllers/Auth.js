const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailsender");
const OTP = require("../models/OTP");
const User = require("../models/user");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const homeStartingContent = `Welcome to the Blog Website!❤️ Unleash your creativity and share your 
thoughts with the world. Explore our diverse collection of blog posts written by our community members. 
From insightful articles to personal stories, there's something for everyone. Click "Read More" 👆 to dive deeper. 
Click "Compose➕" to create your own blog post. Join our community, express yourself, 
and let your voice be heard. Happy blogging!✨`;



const Blog = require("../models/blog");

exports.getAllPost = async (req, res) => {

    Blog.find({})
        .then((posts) => {
            res.render("home", {
                homeStartingContent: homeStartingContent,
                posts: posts,
                isLoggedIn: true
            });
        })
        .catch((err) => {
            console.log("Error getting data", err);
            res.redirect("/");
        });

}

exports.sendotp = async (req, res) => {
    try {

        const email = req.body.email;
        const name = req.body.name;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required to send OTP',
            });
        }

        const checkPresent = await User.findOne({ email });

        if (checkPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already registered',
            });
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        const otpBody = await OTP.create(otpPayload);

        res.status(200).render("register", { successMessage: "OTP Sent Successfully", emailText: email, nameText: name });

    } catch (error) {
        console.log(error.message);
        return res.status(200).render("register");
    }
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, otp } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).render("register", { errorMessage: "Password & Confirm Password does not matched" });
        }
        // Check if student already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render("login", { errorMessage: "User Already Registered !" });
        }

        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

        if (response.length === 0) {
            // OTP not found for the email
            return res.status(400).render("register", { errorMessage: "The OTP is not valid" });

        } else if (otp !== response[0].otp) {
            // Invalid OTP
            return res.status(400).render("register", { errorMessage: "The OTP is not valid" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            name,
            password: hashedPassword,
        });


        return res.status(200).redirect('/');

    } catch (error) {
        console.error(error);
        return res.status(500).render("register", {
            errorMessage: `Email validation failed. Please try again later`
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        // If student not found with provided email
        if (!user) {
            return res.status(401).render('login', {
                errorMessage: `No User Found`
            });
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { email: user.email, name: user.name },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h"
                }
            )

            // Save token to student document in database
            user.token = token
            await user.save();

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).redirect("/home");

        } else {
            return res.status(401).render("login", { errorMessage: `Incorrect Password` })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).render("login", {
            errorMessage: `Login Failure Please Try Again}`
        })
    }
}
