const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        trim: true
    },
    password: {
        type: String,
    },
    token: {
        type: String,
    }
});


module.exports = mongoose.model('User', userSchema);
