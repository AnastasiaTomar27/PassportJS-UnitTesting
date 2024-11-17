const passport = require('passport');
const { Strategy } = require('passport-local');
const  User  = require('@user');

// Called when the user logs in. It saves their ID in the session.
passport.serializeUser((user, done) => { 
    //console.log('Inside Serialize User');
    done(null, user.id);
})

// Called on every request after login. It fetches the user info based on the saved session ID and attaches it to req.user, so you can use it in your route handlers.
passport.deserializeUser(async (id, done) => { 
    //console.log('Inside Deserializer');
    //console.log(`Deserializing User ID: ${id}`);
    try {
        const findUser = await User.findById(id);
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
                return done(null, false); //null - no errors on the server side, false - error in user auth
            }
            const isMatch = await findUser.comparePassword(password);
            // if (!isMatch) throw new Error("Bad Credentials");
            if (!isMatch) {
                return done(null, false);
            }

            if (findUser.deletedAt) {
                // throw new Error("User deleted");
                return done(null, false);
            }
            done(null, findUser);
        } catch (err) {
            return done(err, null);
        }
    })
);

module.exports = passport;