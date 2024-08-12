const request = require('supertest');
const router = require('../index');
const mockUsers = require('../utils/constants');

afterAll(async () => {
    router.close()
  });


// describe('Get users', () => {
//     test('should respond with a list of users', async () => {
//         const response = await request(router).get("/api/users");
//         expect(response.body.message).toBe(mockUsers);
//     })
// })



describe('Users authentication', () => {
    test('should respond with a 200 status code', async () => {
        const response = await request(router).post("/api/auth").send({
            "username": "anastasia",
            "password": "hello123"
        });

        expect(response.statusCode).toBe(200);
    })
})
