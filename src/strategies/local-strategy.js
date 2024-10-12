const passport = require('passport');
const { Strategy } = require('passport-local');
const  User  = require('@user');

passport.serializeUser((user, done) => { // to tell passport how to serialize user data into the session (it stores user ID to session data)
    //console.log('Inside Serialize User');
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => { // to take that ID and unpack, reveal who the actual user is (searcheas for the user in database or in array) and then it stores that user object into the request object (then we can reference request.user when we make requests)
    //console.log('Inside Deserializer');
    //console.log(`Deserializing User ID: ${id}`);
    try {
        const findUser = await User.findById(id);
        // if (!findUser) throw new Error("User Not Found");
        if (!findUser) {
            done(null);
        }
        done(null, findUser);
    } catch (err) {
        done(err, null);
    }
})

passport.use("local",
    new Strategy(async (username, password, done) => {
        try {
            const findUser = await User.findOne({ username });
            // if (!findUser) throw new Error("User not found");
            if (!findUser) {
                return done(null, { message: "User not found" });
            }
            const isMatch = await findUser.comparePassword(password);
            // if (!isMatch) throw new Error("Bad Credentials");
            if (!isMatch) {
                return done(null, { message: "Invalid credentials" });
            }

            if (findUser.deletedAt) {
                // throw new Error("User deleted");
                return done(null, { message: "User account deleted" });
            }
            done(null, findUser);
        } catch (err) {
            return done(err, null);
        }
    })
);

module.exports = passport;