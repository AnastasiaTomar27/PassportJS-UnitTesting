const app = require('./app')
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Running on Port ${port}`);
});

// app.get("/", (request, response) => {
//     console.log(request.session);
//     console.log(request.session.id);
//     request.session.visited = true;
//     response.cookie("hello", "world", {maxAge: 60000 * 60 * 2, signed: true });
//     response.status(201).send({msg: "Hello"});
// });

module.exports = app;

// "_moduleAliases": {
//     "@approot": ".",
//     "@constants": "src/utils/constants.js",
//     "@authSchemas": "src/utils/authSchemas.js",
//     "@local-strategy": "src/strategies/local-strategy.js",
//     "@root": "src/routes/root.js",
//     "@users": "src/routes/users.js",
//     "@cart": "src/routes/cart.js",
//     "@products": "src/routes/products.js",
//     "@auth": "src/routes/auth.js",
//     "@cartValidationSchemas": "src/utils/cartValidationSchemas.js",
//     "@validationSchemas": "src/utils/validationSchemas.js"    
//   },
//   "_moduleDirectories": [
//     "src",
//     "src/utils"
//   ],