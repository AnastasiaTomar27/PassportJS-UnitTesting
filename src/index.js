const express = require('express');
const rootRouter = require('./routes/root');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();
    
mongoose.connect("mongodb://localhost/expressJS")
    .then(() => console.log('Connected to Database'))
    .catch((err) => console.log(`Error: ${err}`));

    app.use(express.json()); // we are telling Express to allow json data to be posted to the server
app.use(cookieParser("session js learning"));
app.use(
    session({
        secret: "session js",
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 60000 * 60
        }
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(rootRouter);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
});

app.get("/", (request, response) => {
    console.log(request.session);
    console.log(request.session.id);
    request.session.visited = true;
    response.cookie("hello", "world", {maxAge: 60000 * 60 * 2, signed: true });
    response.status(201).send({msg: "Hello"});
});

module.exports = server;

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