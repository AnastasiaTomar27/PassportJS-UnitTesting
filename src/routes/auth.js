const { Router } = require('express');
const { validationResult, body } = require('express-validator');
const passport = require('../strategies/local-strategy');
const isAuthenticated = require('../utils/isAuthenticatedMiddleware');

const router = Router();

router.post(
    '/api/users/login', 
    [
        body("username").notEmpty().isLength({ max: 100 }).withMessage('Username must be maximum of 100 characters.').isString(),
        // body("password").notEmpty().isLength({ max: 100 }).withMessage('Username must be maximum of 100 characters.').isString().custom(async value => {
        //     if (!("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,}$").test(value)) { throw new Error(); }
        // }).withMessage("User password configuration is invalid")
        body("password").notEmpty().isLength({ max: 100 }).withMessage('Username must be maximum of 100 characters.').isString()
    ],
    async (request, response, next) => {
        const result = validationResult(request);

        if (!result.isEmpty())
            return response.status(400).send({ errors: result.array() });
        next();
    },
   passport.authenticate("local"), 
    (request, response) => {
        if (!request.user) {
            response.status(401).send({ message: "Access Denied" })
        } else {
            response.status(200).send({message: "Successfully authenticated!"});
        }
    }
    
);

router.get('/api/auth/status', isAuthenticated, (request, response) => {
    console.log('Inside /auth/status endpoint');
    console.log(request.user);
    console.log(request.session);
    return response.send(request.user) 
});

router.post('/api/auth/logout', isAuthenticated, (request, response) => {
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        response.sendStatus(200);
    });
});


module.exports = router;