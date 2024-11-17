const { validationResult, matchedData, body } = require('express-validator');
const passport = require('@local-strategy');
const User = require('@user');
const mongoose = require('mongoose');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

exports.register = [
    [
    body("username").notEmpty().isLength({ max: 20 }).withMessage('Username must be maximum of 20 characters.').isString(),
    body("displayName").notEmpty().isLength({ max: 20 }).withMessage('Displayname must be maximum of 20 characters.').isString(),
    body("password").notEmpty().isLength({ max: 20 }).withMessage('Password must be maximum of 20 characters.').isString()
        .custom(async (value) => {
            const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])/;
            if (!passwordRegex.test(value)) {
                throw new Error(); }
            }).withMessage("User password configuration is invalid"),
    body("role").optional().isIn(['user', 'admin']).withMessage('Invalid role')
    .custom(async (role, { req }) => {
        // If the user selects 'admin', validate the password
        if (role === 'admin') {
            const { adminPassword } = req.body;
            if (adminPassword !== ADMIN_PASSWORD) {
                throw new Error('Incorrect admin password.');
            }
        }
        return true;
    }).withMessage('Role selection failed.')   
    ],
    async (request, response) => {
        const result = validationResult(request);

        if (!result.isEmpty()) {
            return response.status(400).json({ errors: result.array() });
        }     

        const data = matchedData(request);
        const newUser = new User(data); // When I create or update a user document and call .save(), Mongoose triggers the pre('save') middleware.

        await newUser.save()
            .then((user) => {
                return response.status(201).json({
                    success: true,
                    msg: "User created",
                    data: {
                        name: user.username,
                        displayName: user.displayName,
                    }
                });                    
            })
            .catch((e) => {
                //console.error("Error while saving user:", e); 
                if (e.code === 11000) {
                    return response.status(400).send({ errors: [{msg: "User already registered!"}] });
                } else {
                    return response.status(500).send({ errors: [{msg: "An error occurred while registering the user."}] });
                }
            });
    }
]

exports.login = [ 
    [
        body("username").notEmpty().isString(),
        body("password").notEmpty()
    ],
    async (request, response, next) => {
        const result = validationResult(request);

        if (!result.isEmpty()) {
            return response.status(400).send({ errors: result.array() });
        }
        
        passport.authenticate("local", (err, user, info) => {
            //console.log("err, user, info", err, user, info);
            if (err) {
                return response.status(500).send({ errors: [{ msg: "Internal Server Error" }] });
            }
            if (!user) {
                return response.status(401).send({ errors: [{ msg: "Access Denied" }] });
            }

            // It starts the session for the user.
            // It calls passport.serializeUser to store the user’s ID (or some identifier) in the session
            // It attaches the authenticated user to req.user for this specific request only.
            request.logIn(user, async (err) => { 
                if (err) {
                    // Handle the error in case `logIn` fails
                    return response.status(500).json({ errors: [{ msg: "Failed to log in user" }] });
                }

                return response.status(200).json({
                    message: "User successfully authenticated!",
                    data: {
                        name: user.username,
                        displayName: user.displayName
                    }
                }); 
            });
        })(request, response, next); // passing the arguments to `passport.authenticate`
    }
]

exports.profile = async (request, response) => {
    return response.status(200).json({
        message: `Hello, ${request.user.username}!`,
        data: {
            name: request.user.username,
            displayName: request.user.displayName
        }
    });
};

exports.logout =  async (request, response) => {
    try {
        // Wrap the logout function in a Promise to use 'await'
        await new Promise((resolve, reject) => {
            request.logout((err) => {
                if (err) {
                    reject(err);  // Reject if there's an error during logout
                } else {
                    resolve();  // Resolve when logout is successful
                }
            });
        });

        // Destroy the session after logging out
        request.session.destroy((err) => {
            if (err) {
                return response.status(500).json({ errors: [{ msg: "Failed to destroy session" }] });
            }

            // Successfully logged out and session destroyed
            return response.status(200).json({ message: "Successfully logged out" });
        });

    } catch (err) {
        // If logout failed
        return response.status(500).json({ errors: [{ msg: "Logout failed" }] });
    }
};

// no restrictions for the route
exports.getall = async (request, response) => {
    try {
        const users = await User.find();
        
        const userData = users.map(user => ({
            name: user.username,        
            displayName: user.displayName
        }));
        
        return response.status(200).json({
            msg: "All users:",
            data: userData
        });
    } catch (err) {
        console.log(err);
        return response.status(500).json({ errors: [{ msg:'Error retrieving users' }] });
    }
};

// only admin has access
exports.getbyid = async (request, response) => {
    const userId = request.body.userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return response.status(400).json({ errors: [{ msg: "Invalid ID format" }] });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return response.status(404).json({ errors: [{msg: `Cannot find any user with ID ${userId}` }] });
        }
        return response.status(200).json({
            msg: "User was successfully founded",
            data: {
                name: user.username,
                displayName: user.displayName
            }
        });
    } catch(error) {
        next(error); // it passes error to global error handler in application.js
    }
};

// only admin has access
exports.update = async (request, response) => {
    const userId = request.body.userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return response.status(400).json({ message: "Invalid ID format" });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, request.body, { new: true });
        if (!updatedUser) {
            return response.status(404).json({errors: [{msg: `Cannot find any user with ID ${userId}` }] })
        }
        response.status(201).json({
            msg: "User successfully updated",
            data: {
                name: updatedUser.username,
                displayName: updatedUser.displayName
            }
        });
    } catch(error) {
        return response.status(500).json({errors: [{ msg: `Error updating user with ID ${userId}` }] });
    }
};

// only admin has access
// soft deletion, I just mark user as deletedAt in db
exports.deleteUser = async (request, response) => {
    const userId = request.body.userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return response.status(400).json({ errors: [{ msg: "Invalid ID format" }] });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return response.status(404).json({message: `Cannot find any user with ID ${userId}` })
        }
        await User.findByIdAndUpdate(userId, {...user._doc, deletedAt: new Date() });
        response.status(200).json({message: "User deleted successfully"});
    } catch(error) {
        return response.status(500).json({errors: [{ msg: `Error deliting user with ID ${userId}` }] });
    }
};




