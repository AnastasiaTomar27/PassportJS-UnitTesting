const { Router } = require('express');
const { validationResult, checkSchema, matchedData, body } = require('express-validator');
const mockUsers = require('../utils/constants');
const schema = require('../utils/validationSchemas');
const User = require('../mongoose/schemas/user');
const resolveIndexByUserId = require('../utils/middlewares');
const router = Router();


router.get(
    "/api/users",
    (request, response) => {
        console.log(request.session);
        console.log(request.session.id);
        request.sessionStore.get(request.session.id, (err, sessionData) => {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log(sessionData);
        });
        response.send({Users: mockUsers});
    }
);

router.get("/api/users/:id", (request, response) => {
    const parsedId = parseInt(request.params.id);
    console.log(parsedId);
    if (isNaN(parsedId)) return response.status(400).send({ message: "Bad Request. Invalid ID" });
    
    const findUser = mockUsers.find((user) => user.id === parsedId);
    if (!findUser) return response.status(404).send({message: "User does not exist"});
    return response.send(findUser);
});

router.put("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { body, findUserIndex } = request;
    mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body };
    return response.sendStatus(200);
});

router.patch('/api/users/:id', resolveIndexByUserId, (request, response) => {
    const { body, findUserIndex } = request;
    mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body };
    return response.sendStatus(200);
});

router.delete('/api/users/:id', resolveIndexByUserId, (request, response) => {
    const { findUserIndex } = request;
    mockUsers.splice(findUserIndex, 1);    
    return response.sendStatus(200);
});

// Creating an user/ Saving to the database
router.post(
    "/api/users", 
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

        // Saving user to mockUsers
        // const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...data };
        // mockUsers.push(newUser);
        // return response.status(201).send(newUser);
    
        // Saving user to the database
        const newUser = new User(data);
        try {
            const savedUser = await newUser.save();
            return response.status(201).send(savedUser);
        } catch (err) {
            console.log(err);
            return response.sendStatus(400);
        }
    });

module.exports = router;