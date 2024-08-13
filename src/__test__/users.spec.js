const request = require('supertest');
const router = require('../index');
// const mockUsers = require('../utils/constants');

afterAll(async () => {
    router.close()
  });


describe('GET  /api/users', () => {

    describe("get users", () => {
        test('should respond with a list of users', async () => {
            const response = await request(router).get("/api/users");
            expect(response.body.Users).toBeDefined();
        })
    })

    describe("get user by ID", () => {
        test('should get user by id', async () => {
            const response = await request(router).get("/api/users/:id");
            expect(response.body.user).toBeDefined();
        })
    })
    
})



describe('AUTHANTICATION  /api/auth', () => {

    describe("given a username and password", () => {
        test('should respond with a 200 status code', async () => {
            const response = await request(router).post("/api/auth").send({
                username: "anastasia",
                password: "hello123"
            });
    
            expect(response.statusCode).toBe(200);
        })
        
    })
    
    describe("when the username and password is missing", () => {
        test("should respond with a status code of 400", async () => {
            const bodyData = [
                {username: "anastasia"},
                {password: "hello123"},
                {}
            ]
            for (const body of bodyData) {
                const response = await request(router).post("/api/auth").send(body)
                expect(response.statusCode).toBe(400);
            }
        })
    })
    
})
