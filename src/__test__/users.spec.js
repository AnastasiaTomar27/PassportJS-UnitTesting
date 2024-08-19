const request = require('supertest');
const router = require('../index');
const mockUsers = require('../utils/constants');
//const { password } = require('../utils/authSchemas');


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
                expect(response.Users).toEqual[{"displayName": "Anastasia", "id": 1, "password": "hello123", "username": "anastasia"}] 
            })
        })
        
    })
    
})

describe('POST /api/users - adding a new user', () => {
    // describe('username length is not between 3-32 characters', () => {
    //     test("should respond with a 400 status code", async () => {
    //         const response = await request(router).post("/api/auth").send({
    //             username: "an",
    //             displayName: "Anastasia"
    //         });
    
    //         expect(response.statusCode).toBe(400);
    //         expect(response.body.errors[0]).toBe('Username must be at least 3 characters with a maximum of 32 characters.');

    //     })
    // })
    describe('username is empty', () => {
        test("should respond with a 400 status code", async () => {
            const response = await request(router).post("/api/auth").send({
                username: "anna",
                displayName: "Anna"

            });
    
            expect(response.statusCode).toBe(400);

        })
    })
    describe('username is not a string', () => {
        test("should respond with a 400 status code", async () => {
            const response = await request(router).post("/api/auth").send({
                username: 3,
                displayName: "Anastasia"
            });
    
            expect(response.statusCode).toBe(400);

        })
    })
    describe('displayname is empty', () => {
        test("should respond with a 400 status code", async () => {
            const response = await request(router).post("/api/auth").send({
                username: "anastasia",
                displayName: ""
            });
    
            expect(response.statusCode).toBe(400);

        })
    })
    
})

describe('AUTHANTICATION  /api/auth', () => {

    describe("given a correct username and password", () => {
        test('should respond with a 200 status code', async () => {
            const response = await request(router).post("/api/auth").send({
                username: "anastasia",
                password: "hello123"
            });
    
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Successfully authenticated!");
        })
        
    })
    
    describe("when the username and/or password is missing", () => {
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

    // describe("when the username and/or password are incorrect", () => {
    //     test("should throw an error", async () => {
    //         const bodyData = [
    //             {username: "anasta", password: "hello123"},
    //             {password: "hello", username: "anastasia"}
    //         ]
    //         for (const body of bodyData) {
    //             const response = await request(router).post("/api/auth").send(body)
    //             expect()
    //         }
            
    //     })
    // })
    
})