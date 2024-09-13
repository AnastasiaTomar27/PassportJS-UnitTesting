require('module-alias/register')
const path = require('path')
require('dotenv').config({path: path.resolve('config/dev.env')})
const mongoose = require('mongoose');
require('@mongooseConnection')
//const { connectDB } = require('./mongoose/connection')
const express = require('express');
const rootRouter = require('@root');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')


app = express();  

//Define the MongoDB URI based on the environment
// const mongoUri = process.env.NODE_ENV === 'test'
//   ? 'mongodb://localhost:27017/test' // Replace with actual test URI if needed
//   : process.env.MONGODB_URL;

// connectDB();

app.use(express.json()); // we are telling Express to allow json data to be posted to the server
app.use(cookieParser("session js learning")); // it makes the cookies easily readable from the request.cookies
app.use(
    session({
        name: "connect.sid",
        secret: "session js",
        saveUninitialized: false, // false means only when we modife session data ogbect, data will be stored to the session store 
        resave: false, // false means it will not resave cookies every time, expired date wil stay the same
        cookie: {
            maxAge: 60000 * 60 // 60000 mlsec = 60 sec = 1 min, 60000 * 60 = 1 hour
        },
        store: MongoStore.create({
            client: mongoose.connection.getClient()
            //mongoUrl:mongoUri
    })
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(rootRouter);

module.exports = app;