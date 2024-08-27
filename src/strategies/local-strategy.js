const passport = require('passport');
const { Strategy } = require('passport-local');
const  User  = require('@user');
const { comparePassword } = require('@helpers');

passport.serializeUser((user, done) => { // to tell passport how to serialize user data into the session (it stores user ID to session data)
    console.log('Inside Serialize User');
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => { // to take that ID and unpack, reveal who the actual user is (searcheas for the user in database or in array) and then it stores that user object into the request object (then we can reference request.user when we make requests)
    console.log('Inside Deserializer');
    console.log(`Deserializing User ID: ${id}`);
    try {
        const findUser = await User.findById(id);
        if (!findUser) throw new Error("User Not Found");
        done(null, findUser);
    } catch (err) {
        done(err, null);
    }
})

passport.use(
    new Strategy(async (username, password, done) => {
        try {
            const findUser = await User.findOne({ username });
            if (!findUser) throw new Error("User not found");
            if (!comparePassword(password, findUser.password)) throw new Error("Bad Credentials");
            done(null, findUser);
        } catch (err) {
            done(err, null);
        }
    })
);

module.exports = passport;