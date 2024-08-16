const express = require('express');
require('module-alias/register');
const rootRouter = require('@root');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const app = express();
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

const PORT = process.env.PORT || 3000;

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