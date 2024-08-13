const request = require('supertest');
const router = require('../index');
const mockUsers = require('../utils/constants');
const schema = require('../utils/validationSchemas');


afterAll(async () => {
    router.close()
  });


describe('GET  /api/users', () => {

    describe("get users", () => {
        test('should respond with a list of users', async () => {
            const response = await request(router).get("/api/users");
            expect(response.body.Users).toBeDefined();
            expect(response.Users).toEqual[{"displayName": "Anastasia", "id": 1, "password": "hello123", "username": "anastasia"}, {"displayName": "Jack", "id": 2, "password": "hello124", "username": "jack"}, {"displayName": "Adam", "id": 3, "password": "hellohello", "username": "adam"}, {"displayName": "Tina", "id": 4, "password": "test123", "username": "tina"}, {"displayName": "Jason", "id": 5, "password": "hello123", "username": "jason"}, {"displayName": "Henry", "id": 6, "password": "hello123", "username": "henry"}, {"displayName": "Marilyn", "id": 7, "password": "hello123", "username": "marilyn"}]
        })
    })

    describe("get user by ID", () => {
        describe("not valid user ID", () => {
            test('should respond with a 400 status because ID is a string', async () => {
                const userID = 'hjkkhh';
                const response = await request(router).get(`/api/users/${userID}`);
                expect(response.statusCode).toBe(400);
                expect(response.body.message).toBe("Bad Request. Invalid ID");
            })
            test('should respond with a 404 status because user with this ID does not exist', async () => {
                const userID = 10;
                const response = await request(router).get(`/api/users/${userID}`);
                expect(response.statusCode).toBe(404);
                expect(response.body.message).toBe("User does not exist");
            })
        })
        describe("valid user ID", () => {
            test("should respond with a 200 status", async () => {
                const userId = 1;
                const response = await request(router).get(`/api/users/${userId}`);
                expect(response.statusCode).toBe(200);
            })
        })
        
    })
    
})

// describe('POST /api/users - adding a new user', () => {
//     describe('', () => {
//         test("username length is not between 3-32 characters", async () => {
//             const response = await request(router).post("/api/auth").send({
//                 username: "an"
//             });
    
//             expect(response.statusCode).toBe(400);
//             expect(response.body.message).toBe({errors});

//         })
//     })
// })

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
