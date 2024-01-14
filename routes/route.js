// routes.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require('multer');
const {auth} = require("../middlewares/auth");
const { sendotp, signup, login, getAllPost } = require("../controllers/Auth");
const mongoose = require("mongoose");
require("dotenv").config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Blog = require("../models/blog");

const aboutContent = `Welcome to our blog website! We are a passionate community of writers, thinkers, and storytellers who believe in the power of words to inspire, educate, and entertain.
Our mission is to provide a platform where individuals from all walks of life can come together to share their experiences, knowledge, and perspectives.We believe that everyone has a unique voice and story to tell, and we are committed to giving them a platform to be heard.
Through our blog website, we aim to create a diverse and inclusive community where ideas can be freely expressed and conversations can flourish.Whether you're an aspiring writer, a seasoned professional, or simply someone who enjoys reading and engaging with thought-provoking content, you'll find a home here.
We encourage open dialogue, respectful discussions, and the exchange of ideas.We value different viewpoints and believe that through the sharing of diverse perspectives, we can foster understanding, empathy, and positive change.
So, whether you're here to read, write, or connect with like-minded individuals, we're thrilled to have you as part of our community.Join us on this exciting journey of exploration, learning, and self - expression.
Thank you for being a part of our blog website.Together, let's create a space where words have the power to inspire and make a difference.
Happy blogging!`;

const contactContent =
    "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


    
// ... (same constants and setup as in the original file)

router.get("/home", auth, getAllPost);

router.get("/about", (req, res) => {
    res.render("about", { aboutContent: aboutContent });

});

router.get("/contact", (req, res) => {
    res.render("contact", { contactContent: contactContent });
});

router.get("/compose",auth, (req, res) => {
    res.render("compose");
});

router.post("/compose", auth, upload.single('image'), (req, res) => {
    const heading = req.body.postTitle;
    const body = req.body.postBody;

    let imageData = null;
    let contentType = null;

    if (req.file) {

        imageData = req.file.buffer;
        contentType = req.file.mimetype;
    }

    console.log(req.body);
    const post = new Blog({
        title: heading,
        content: body,
        image: {
            data: imageData,
            contentType: contentType
        }
    });

    post.save()
        .then(() => {
            console.log("Post saved to database.");
        })
        .catch((err) => {
            console.log("Error saving post ", err);
        });

    res.redirect("/home");
});


router.get("/posts/:postId", auth, (req, res) => {
    const reqPostID = req.params.postId;

    Blog.findOne({ _id: reqPostID })
        .then((post) => {

            res.render("post", {
                postTitle: post.title,
                postBody: post.content,
                postImage: post.image
            });
        })
        .catch((err) => {
            console.log("Post Not Found", err);
            res.redirect("/home");
        });
});

router.get('/', (req, res) => {
    res.render("login");
});

router.post('/login', login);

router.get('/register', (req, res) => {
    res.render("sendotp");
});

router.post('/register', signup);

router.post('/sendotp', sendotp);

router.get("/logout", (req, res) => {
        res.clearCookie("token");
        res.redirect("/");
        console.log("User logout successfully");
});

module.exports = router;
