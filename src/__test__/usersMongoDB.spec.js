const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const router = require('../index');
const User = require('../mongoose/schemas/user');
//const {MongoClient} = require('mongodb');


describe('insert', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await mongoose.connect(globalThis.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db(globalThis.__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  test('should register a new user', async () => {
    const users = db.collection('users');

    const mockUser = { username: 'kira', displayName: 'Kira', password: "hello123 "};
    await users.insertOne(mockUser);

    const insertedUser = await users.findOne({username: 'kira'});
    expect(insertedUser).toEqual(mockUser);
  });
});