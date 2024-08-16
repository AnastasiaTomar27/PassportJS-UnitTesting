const { Router } = require('express');
const { validationResult, checkSchema, matchedData } = require('express-validator');
const mockUsers = require('@constants');
const schema = require('@validationSchemas');

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

router.post(
    "/api/users", 
    checkSchema(schema), 
    (request, response) => {
        const result = validationResult(request);

        if (!result.isEmpty())
            return response.status(400).send({ errors: result.array() });

        const data = matchedData(request);

        const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...data };
        mockUsers.push(newUser);
        return response.status(201).send(newUser);
    })

module.exports = router;