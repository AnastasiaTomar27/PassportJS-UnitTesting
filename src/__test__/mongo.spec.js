const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const {MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../mongoose/schemas/user');

beforeEach(async() => {
    await User.deleteMany()
})
describe("Register user", () => {
    test('Should sign up for a user', async () => {
        await request(app).post('/api/users/register')
        .send({
            username: 'olga',
            displayName: 'Olga',
            password: 'test123'
        })
        .expect(201)
    })
    
})

