require('module-alias/register')
const path = require('path')
require('dotenv').config({path: path.resolve('config/dev.env')})
require('@mongooseConnection')
const { connectDB } = require('./mongoose/connection')
const express = require('express');
const routes = require('@routesUsers');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const secret = process.env.SECRET;
app = express();  

connectDB()

app.use(express.json()); // telling Express to allow json data to be posted to the server
app.use(cookieParser("session js learning")); // it makes the cookies easily readable from the request.cookies

if (process.env.NODE_ENV === 'test') {
    // In-memory session store for tests to avoid MongoDB connection issues during testing
    const sessionMemoryStore = new session.MemoryStore();  // In-memory session store
    app.use(
        session({
            name: "connect.sid",
            secret: secret,
            saveUninitialized: false,
            resave: false,
            cookie: {
                maxAge: 60000 * 60, // 1 hour
            },
            store: sessionMemoryStore, // Using in-memory store for tests
        })
    );
} else {
    // MongoDB store for production
    app.use(
        session({
            name: "connect.sid",
            secret: secret,
            saveUninitialized: false,
            resave: false,
            cookie: {
                maxAge: 60000 * 60, // 1 hour
            },
            store: MongoStore.create({
                client: mongoose.connection.getClient(), // Use actual MongoDB client in production
            }),
        })
    );
}


app.use(passport.initialize());
app.use(passport.session()); 
app.use("/api", routes);

app.use((req, res, next) => {
    res.status(404).json({
        errors: [{
            msg: "Resource not found. The URL you are trying to access does not exist."
        }]
    });
});

app.use((err, req, res, next) => {
    res.status(500).json({
        errors: [{
            msg: "Internal server error. Please try again later."
        }]
    });
});


module.exports = app;