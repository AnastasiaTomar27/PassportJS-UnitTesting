const { Router } = require('express');
const { validationResult, checkSchema, matchedData } = require('express-validator');
const mockUsers = require('../utils/constants');
const schema = require('../utils/validationSchemas');

const router = Router();

const resolveIndexByUserId = (request, response, next) => {
    const {
        params: {id},
    } = request;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return response.sendStatus(400);
    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
    if (findUserIndex === -1) return response.sendStatus(404);
    request.findUserIndex = findUserIndex;
    next();
}

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