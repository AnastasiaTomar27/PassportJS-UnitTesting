const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const {MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../mongoose/schemas/user');
const user1 = {
    username: 'user123',
    displayName: 'User123',
    password: 'hello123'
}
beforeEach(async() => {
    await User.deleteMany({})
    await User(user1).save()
    
})
describe("Register user", () => {
    test('Should sign up for a user', async () => {
        const response = await request(app).post('/api/users/register')
        .send({
            username: 'olga',
            displayName: 'Olga',
            password: 'test123'
        })
        expect(response.statusCode).toBe(201)
    })
})
describe('Session Cookie', () => {
    it('should set a session cookie', async () => {
        const response = await request(app).get('/api/users/getall');
        expect(response.statusCode).toBe(200);  

      

    });
});

// describe("Log in user", () => {
//     it('Should login for a user', async () => {
//         const response = await request(app).post('/api/users/auth')
//         .send({
//             username: user1.username,
//             password: user1.password
//         });
//         //expect(200)
//         //expect(response.statusCode).toEqual(200);
//         expect(response.body).toEqual("Successfully authenticated!")
//     })
// })
describe("get users", () => {
    test('should respond with a list of users', async () => {
        const response = await request(app).get("/api/users");
        expect(response).toMatchObject[{username: user1.username, displayName: user1.displayName, password: user1.password }]
    })
})