// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URL)
// console.log("Connected to MongoDB")

const mongoose = require('mongoose');
const { MongoMemoryServer }  = require('mongodb-memory-server');

let mongod = null;
let isConnected = false;

const connectDB = async () => {
    if (!isConnected) {
        if (process.env.NODE_ENV === 'test') {
            // Use in-memory MongoDB for testing
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('Connected to in-memory MongoDB');
        } else {
            // Use production MongoDB connection string
            const uri = process.env.MONGODB_URL; // Your production MongoDB URI
            await mongoose.connect(uri);
            console.log('Connected to production MongoDB');
        }
        isConnected = true;
    }
};

const disconnectDB = async () => {
    if (isConnected) {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        if (mongod) {
            await mongod.stop(); // Stop in-memory MongoDB
        }
        isConnected = false;

    }
};

module.exports = { connectDB, disconnectDB };
