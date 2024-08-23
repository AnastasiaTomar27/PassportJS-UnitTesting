const path = require('path')
require('dotenv').config({path: path.resolve('config/dev.env')})
const mongoose = require('mongoose');
require('./mongoose/connection')
const express = require('express');
const rootRouter = require('./routes/root');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')

app = express();   

app.use(express.json()); // we are telling Express to allow json data to be posted to the server
app.use(cookieParser("session js learning")); // it makes the cookies easily readable from the request.cookies
app.use(
    session({
        secret: "session js",
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 60000 * 60
        },
        store: MongoStore.create({
            client: mongoose.connection.getClient()
    })
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(rootRouter);

module.exports = app;