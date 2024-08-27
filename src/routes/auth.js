const { Router } = require('express');
const { validationResult, body } = require('express-validator');
const passport = require('@local-strategy');
const isAuthenticated = require('@isAuthenticated');

const router = Router();

router.post(
    '/api/users/auth', 
    [
        body("username").notEmpty().isLength({ max: 20 }).withMessage('Username must be maximum of 20 characters.').isString(),
        // body("password").notEmpty().isLength({ max: 100 }).withMessage('Username must be maximum of 100 characters.').isString().custom(async value => {
        //     if (!("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]){8,}$").test(value)) { throw new Error(); }
        // }).withMessage("User password configuration is invalid")
        body("password").notEmpty().isLength({ max: 20 }).withMessage('Username must be maximum of 20 characters.').isString()
    ],
    async (request, response, next) => {
        const result = validationResult(request);

        if (!result.isEmpty()) {
            return response.status(400).send({ errors: result.array() });
        }
        next();
    },
   passport.authenticate("local"), 
    (request, response) => {
        if (!request.user) {
            response.status(401).send({ message: "Access Denied" }) // it will never happen because in passport it throws error, right?
        } else {
            response.status(200).send({message: "Successfully authenticated!"});
        }
        console.log(request.user)
        console.log(request.session)

        // console.log(request.session)
        // console.log(request.session.id)

    // request.sessionStore.get(request.session.id, (err, sessionData) => {
    //     if (err) {
    //         console.log(err);
    //         throw err;
    //     }
    //     console.log(sessionData);
    // })
    })

    


router.get('/api/users/auth/profile', isAuthenticated, (request, response) => {
    

    //return response.send(request.user)
    return response.send({message: "User Profile"});
});

router.post('/api/users/auth/logout', isAuthenticated, (request, response) => {
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        response.sendStatus(200);
    });
});


module.exports = router;