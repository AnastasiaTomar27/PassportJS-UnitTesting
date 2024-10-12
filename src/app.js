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
        secret: "s6>?[Ty^AqQGd7$!k]j:5w%bDKr)aS;/&_,+4uVR@fYP-L(H{8fW*$Q`/k%+E92axVdbHsJ;LD-35^ZK('>]t$,/b+^Xd;.2hT7]~K_<jrQHR3JWw[E&UZ)Vv!9gc>6DhW'Z_N!*mwzqSC;v~UDj9,M-Kt)}$e7n{:f6P=<r/g^A>cx?8t<E.,DJ`6r>Y4mqkdhXSMvT)K;^y8[9#FUW*L$3!scu2(V]&7",
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