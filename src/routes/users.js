const { Router } = require('express');
const { validationResult, matchedData, body } = require('express-validator');
const User = require('../mongoose/schemas/user');
const { hashPassword } = require('../utils/helpers');

const router = Router();

router.get(
    "/api/users/getall", async (request, response) => {
        try {
            const data = await User.find();
            return response.json(data);
        } catch(err) {
            console.log(err);
            return response.sendStatus(400).response.json(data);
        }
});

router.get("/api/users/getbyid/:id", async (request, response) => {
    const id = request.params.id;
    try {
        const user = await User.findById(id);
        return response.sendStatus(200).send(user);
    } catch(err) {
        console.log(err);
        return response.sendStatus(400);
    }

});

router.put("/api/users/update/:id", async (request, response) => {
    const id = request.params.id;
    try {
        const user = await User.findByIdAndUpdate(id, request.body);
        if (!user) {
            return response.sendStatus(404).json({message: `Cannot find any user with ID ${id}` })
        }
        const updatedUser = await User.findById(id);
        response.sendStatus(200).json(updatedUser);
    } catch(err) {
        console.log(err);
        return response.sendStatus(400);
    }
});

// router.patch('/api/users/:id', (request, response) => {
//     const { body, findUserIndex } = request;
//     mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body };
//     return response.sendStatus(200);
// });

router.delete('/api/users/delete/:id', async (request, response) => {
    const id = request.params.id;
    try {
        const user = await User.findById(id);
        if (!user) {
            return response.sendStatus(404).json({message: `Cannot find any user with ID ${id}` })
        }
        await User.findByIdAndDelete(id);
        response.sendStatus(201).json({message: "User deleted successfully"});
    } catch(err) {
        console.log(err);
        return response.sendStatus(400);
    }
});

router.post(
    "/api/users/register", 
    [
    body("username").notEmpty().isLength({ max: 100 }).withMessage('Username must be maximum of 100 characters.').isString(),
    body("displayName").notEmpty().isLength({ max: 100 }).withMessage('DisplayName must be maximum of 100 characters.').isString(),
    // body("password").notEmpty().isLength({ max: 100 }).withMessage('Username must be maximum of 100 characters.').isString().custom(async value => {
    //     if (!("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,}$").test(value)) { throw new Error(); }
    // }).withMessage("User password configuration is invalid")
    body("password").notEmpty().isLength({ max: 100 }).withMessage('Username must be maximum of 100 characters.').isString()
    ],
    async (request, response) => {
        const result = validationResult(request);

        if (!result.isEmpty())
            return response.status(400).send({ errors: result.array() });

        const data = matchedData(request);
        data.password = hashPassword(data.password);
        const newUser = new User(data);
        try {
            const savedUser = await newUser.save();
            return response.status(201).send(savedUser);
        } catch (err) {
            console.log(err);
            return response.status(400);
        }
    }
);

module.exports = router;