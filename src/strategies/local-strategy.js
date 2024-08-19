const passport = require('passport');
const { Strategy } = require('passport-local');
const  mockUsers  = require('../utils/constants');
const  User  = require('../mongoose/schemas/user');

passport.serializeUser((user, done) => { // to tell passport how to serialize user data into the session (it stores user ID to session data)
    console.log('Inside Serialize User');
    console.log(user);
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => { // to take that ID and unpack, reveal who the actual user is (searcheas for the user in database or in array) and then it stores that user object into the request object (then we can reference request.user when we make requests)
    console.log('Inside Deserializer');
    console.log(`Deserializing User ID: ${id}`);
    try {
        //const findUser = mockUsers.find((user) => user.id === id);
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
            // checking for an user in mockUsers
            // const findUser = mockUsers.find((user) => user.username === username);
            // if (!findUser) throw new Error('User not found.')
            //     if (findUser.password !== password)
            //         throw new Error("Invalid Credentials.");
            
            // checking for an user in the database
            const findUser = await User.findOne({ username });
            if (!findUser) throw new Error("User not found");
            if (findUser.password !== password) throw new Error("Bad Credentials");
            done(null, findUser);
        } catch (err) {
            done(err, null);
        }
    })
);

module.exports = passport;