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
        
        passport.authenticate("local", (err, user, info) => {
            console.log("err, user, info", err, user, info);

            // I don't need it, because I want to logIn user, so that I attach it to request and to the session
            // if (err) {
            //     console.log("errorrr")
            //     return response.json({err});
            // }
            // if (!user) {
            //     return response.json({ message: 'Access denied' });
            // }

            request.logIn(user, async (err) => {
                if (!request.user) {
                    response.status(401).send({ message: "Access Denied" }) 
                } else {
                    response.status(200).send({message: "Successfully authenticated!"});
                }
                
                console.log(request.user)
                console.log(request.session)
                
                request.sessionStore.get(request.session.id, (err, sessionData) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    console.log(sessionData);
                })
            })
        })(request, response, next); // passing the arguments to `passport.authenticate`
    }
)

router.get('/api/users/auth/profile', isAuthenticated, (request, response) => {
    

    //return response.send(request.user)
    return response.send({message: "User Profile"});
});

router.post('/api/users/auth/logout', isAuthenticated, (request, response) => {
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        request.session.destroy(($err) => {
            if ($err) return response.sendStatus(400);
            response.sendStatus(200);
        })
    });
});


module.exports = router;