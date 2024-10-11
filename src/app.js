require('module-alias/register')
const path = require('path')
require('dotenv').config({path: path.resolve('config/dev.env')})
require('@mongooseConnection')
const { connectDB } = require('./mongoose/connection')
const express = require('express');
const rootRouter = require('@root');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');

app = express();  

connectDB()

//Define the MongoDB URI based on the environment
const mongoUri = process.env.NODE_ENV === 'test'
  ? 'mongodb://localhost:27017/test' 
  : process.env.MONGODB_URL;


app.use(express.json()); // we are telling Express to allow json data to be posted to the server
app.use(cookieParser("session js learning")); // it makes the cookies easily readable from the request.cookies
app.use(
    session({
        name: "connect.sid",
        secret: "550b675cf9664e9035f9cd4f2d786bb9647f80b28fca7cc37b6f95b0173d9228d0fcfc00d3b5437f4896eff783c121b72afed4022b9fdd952a6e5a5f3d2eabb3",
        saveUninitialized: false, // false means only when we modife session data ogbect, data will be stored to the session store 
        resave: false, // false means it will not resave cookies every time, expired date wil stay the same
        cookie: {
            maxAge: 60000 * 60 // 60000 mlsec = 60 sec = 1 min, 60000 * 60 = 1 hour
        },
        store: MongoStore.create({
            //client: mongoose.connection.getClient()
            mongoUrl:mongoUri
    })
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(rootRouter);

module.exports = app;