const { Schema, default: mongoose } = require("mongoose");
const { displayName } = require("../../utils/validationSchemas");
const { password } = require("../../utils/authSchemas");

const UserSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
    },
    displayName: mongoose.Schema.Types.String,
    password: {
        type: mongoose.Schema.Types.String,
        required: true
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;