const { Router } = require('express');
//const { validationResult, checkSchema, matchedData } = require('express-validator');
const mockUsers = require('../utils/constants');
const schema = require('../utils/authSchemas');
const passport = require('../strategies/local-strategy');

const router = Router();
// router.post(
//     '/api/auth', 
//     checkSchema(schema), 
//     (request, response) => {
//         const result = validationResult(request);

//         if (!result.isEmpty())
//             return response.status(400).send({ errors: result.array() });

//         const data = matchedData(request);

//         const findUser = mockUsers.find((user) => user.username === data.username);
//         if (!findUser || findUser.password !== data.password) 
//              return response.status(401).send({ msg: "Bad Credentials" });
        
//         request.session.user = findUser;
//         return response.status(200).send(findUser);
// });

// router.get('/api/auth/status', (request, response) => {
//     request.sessionStore.get(request.sessionID, (err, session) => {
//         console.log(session);
//     });
//     return request.session.user 
//     ? response.status(200).send(request.session.user) 
//     : response.status(401).send({ msg: "Not Authenticated" });
// });

router.post(
    '/api/auth', 
    passport.authenticate("local"), 
    (request, response) => {
        response.status(200).send({message: "Successfully authenticated!"});
})

router.get('/api/auth/status', (request, response) => {
    console.log('Inside /auth/status endpoint');
    console.log(request.user);
    console.log(request.session);
    return request.user ? response.send(request.user) : response.sendStatus(401);
});

router.post('/api/auth/logout', (request, response) => {
    if (!request.user) return response.sendStatus(401);
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        response.sendStatus(200);
    });
});


module.exports = router;