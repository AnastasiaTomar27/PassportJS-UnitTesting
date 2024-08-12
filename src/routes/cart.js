const { Router } = require('express');
const { validationResult, checkSchema, matchedData } = require('express-validator');
const mockUsers = require('../utils/constants');
const schema = require('../utils/cartValidationSchemas');

const router = Router();

router.post(
    "/api/cart", 
    checkSchema(schema), 
    (request, response) => {
        if (!request.session.user) return response.sendStatus(401);
       
        const result = validationResult(request);
        if (!result.isEmpty())
            return response.status(400).send({ errors: result.array() });

        const item = matchedData(request);

        const { cart } = request.session;

        if (cart) {
            cart.push(item);
        } else {
            request.session.cart = [item];
        }
        return response.status(201).send(item);
    }
);

router.get(
    "/api/cart",
    (request, response) => {
        if (!request.session.user) return response.sendStatus(401);
        return response.send(request.session.cart ?? []);
    }
)

module.exports = router;