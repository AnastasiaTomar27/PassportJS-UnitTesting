const { mongoose } = require("mongoose");
const bcrypt = require('bcrypt');

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
    },
    role: {
        type: String,
        enum: ['user', 'admin'], 
        default: 'user'
    },
    deletedAt: {
        type: Date,
        default: null
    }
},
{
    timestamps: true
}
);

// The pre('save') middleware ensures that the password is hashed before a user record is saved in the database.
UserSchema.pre('save', async function (next) {
    const user = this;

    // If the password field is not modified
    if (!user.isModified('password')) {
        return next();
    }

    // Generate a salt and hash the password
    try {
        const salt = await bcrypt.genSalt(10); // A "salt" is a random string added to the password to make the hash more secure. (for ex salt = r4nd0mStr1ng.)
        const hash = await bcrypt.hash(user.password, salt); // The password mySecret123 and the salt r4nd0mStr1ng are combined and hashed using bcrypt. (hashed password = $2b$10$eW6U...O2Dn1CR.)
        user.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

// The comparePassword method checks if the user’s input matches the hashed password stored in the database.
UserSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};



const User = mongoose.model("User", UserSchema);

module.exports = User;