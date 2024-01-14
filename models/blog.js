const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    image: {
        data: Buffer,
        contentType: String
    }
});

module.exports = new mongoose.model("Blog", blogSchema);

