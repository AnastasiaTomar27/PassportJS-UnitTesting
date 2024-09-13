const { Router } = require('express');
const { validationResult, matchedData, body } = require('express-validator');
const User = require('@user');
//const { hashPassword } = require('@helpers');
const mongoose = require('mongoose');

const router = Router();

router.post(
    "/api/users/register", 
    [
    body("username").notEmpty().isLength({ max: 20 }).withMessage('Username must be maximum of 20 characters.').isString(),
    body("displayName").notEmpty().isLength({ max: 20 }).withMessage('Displayname must be maximum of 20 characters.').isString(),
    // body("password").notEmpty().isLength({ max: 100 }).withMessage('Username must be maximum of 100 characters.').isString().custom(async value => {
    //     if (!("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,}$").test(value)) { throw new Error(); }
    // }).withMessage("User password configuration is invalid")
    body("password").notEmpty().isLength({ max: 20 }).withMessage('Password must be maximum of 20 characters.').isString()
    ],
    async (request, response) => {
        const result = validationResult(request);

        if (!result.isEmpty()) {
            return response.status(400).send({ errors: result.array() });
        }     

        const data = matchedData(request);
        const newUser = new User(data);
        try {
            const userAvailable = await User.findOne({username: data.username});
            if (userAvailable) {
                return response.status(400).json({message: "User already registered!"});
            }
            const savedUser = await newUser.save();
            return response.status(201).send(savedUser);
        } catch (err) {
            console.log(err);
            return response.status(400);
        }
    }
);
router.get(
    "/api/users/getall", async (request, response) => {
        try {
            const data = await User.find();
            return response.json(data);
        } catch(err) {
            console.log(err);
            return response.status(400).json(data);
        }
});

router.get("/api/users/getbyid/:id", async (request, response) => {
    const id = request.params.id;
     // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return response.status(404).json({message: `Cannot find any user with ID ${id}`});
        }
        return response.status(200).send(user);
    } catch(err) {
        console.log(err);
        return response.status(400);
    }

});

router.put("/api/users/update/:id", async (request, response) => {
    const id = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ message: "Invalid ID format" });
    }
    try {
        const user = await User.findByIdAndUpdate(id, request.body, { new: true });
        if (!user) {
            return response.status(404).json({message: `Cannot find any user with ID ${id}` })
        }
        const updatedUser = await User.findById(id);
        response.status(201).json(updatedUser);
    } catch(err) {
        console.log(err);
        return response.status(400);
    }
});

// router.patch('/api/users/:id', (request, response) => {
//     const { body, findUserIndex } = request;
//     mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body };
//     return response.sendStatus(200);
// });

router.delete('/api/users/delete/:id', async (request, response) => {
    const id = request.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ message: "Invalid ID format" });
    }
    try {
        const user = await User.findById(id);
        if (!user) {
            return response.status(404).json({message: `Cannot find any user with ID ${id}` })
        }
        await User.findByIdAndUpdate(id, {...user._doc, deletedAt: new Date() });
        response.status(200).json({message: "User deleted successfully"});
    } catch(err) {
        console.log(err);
        return response.status(400);
    }
});

module.exports = router;



