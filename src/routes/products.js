const { Router } = require('express');
const router = Router();

router.get("/api/products", (request, response) => {
    console.log(request.headers.cookie);
    console.log(request.cookies);
    console.log(request.signedCookies.hello);
    if (request.signedCookies.hello && request.signedCookies.hello === "world")
        return response.send([{ id: 123, name: "apples", price: 2.99 }]);
    return response.send({ msg: "Sorry. You need the correct cookie." });
});

module.exports = router;