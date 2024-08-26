const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../mongoose/schemas/user');
const session = require('supertest-session');
const { displayName } = require('../../jest.config');

const user1 = {
    username: 'user123',
    displayName: 'User123',
    password: 'hello123'
}

let userId;
let agent;
var testSession = null;
let sessionCookie;

beforeEach(async() => {
    await User.deleteMany({})
    const response = await request(app).post('/api/users/register').send(user1)

    userId = response.body._id;
    agent = request.agent(app);
    testSession = session(app);

    await agent.post('/api/users/auth').send({
        username:user1.username,
        password: user1.password
    });
    
});
describe("Session test", () => {
    it('should fail accessing a restricted page', function (done) {
        testSession.get('/api/users/auth/profile')
          .expect(401)
          .end(done)
      });
      
    it('should sign in', function (done) {
    testSession.post('/api/users/register')
        .send({ username: 'foo', password: 'password', displayName: 'Foo' })
        .expect(201)
        .end(done);
    });
    
    test('cookies should be defined and contain user_sid', async () => {
        const response = await request(app).post('/api/users/auth')
        .send({
            username: user1.username,
            password: user1.password
        });
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toMatch(/connect.sid/); 
    })
    })

describe("Register user", () => {
    describe("sign up for a user with correct credentials", () => {
        test('should respond with a 201 status code and user details', async () => {
            const response = await request(app).post('/api/users/register')
            .send({
                username: 'olga',
                displayName: 'Olga',
                password: 'hello123'
            })
            expect(response.statusCode).toBe(201)
            expect(response.body).toMatchObject[{username: 'olga', displayName: 'Olga', password: 'hello123' }]
        })
    })
    describe('username length is more than 20 characters', () => {
        test("should respond with a 400 status code and error message ", async () => {
            const response = await request(app).post("/api/users/register").send({
                username: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                displayName: "Anastasia",
                password: "hello123"
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).not.toBeNull();
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toEqual({
                type: 'field',
                value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                msg: 'Username must be maximum of 20 characters.',
                path: 'username',
                location: 'body'
              });
    
        })
    })
    describe('displayname length is more than 20 characters', () => {
        test("should respond with a 400 status code and error message", async () => {
            const response = await request(app).post("/api/users/register").send({
                username: "anastasia",
                displayName: "Anastasiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                password: "hello123"
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).not.toBeNull();
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toEqual({
                type: 'field',
                value: 'Anastasiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                msg: 'Displayname must be maximum of 20 characters.',
                path: 'displayName',
                location: 'body'
              });
    
        })
    })
    describe('password length is more than 20 characters', () => {
        test("should respond with a 400 status code and error message", async () => {
            const response = await request(app).post("/api/users/register").send({
                username: "anastasia",
                displayName: "Anastasia",
                password: "hello123333333333333333333333333333333333333333333"
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).not.toBeNull();
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toEqual({
                type: 'field',
                value: 'hello123333333333333333333333333333333333333333333',
                msg: 'Password must be maximum of 20 characters.',
                path: 'password',
                location: 'body'
            });
        })
    })
})
describe("Authentication - Log in user", () => { 
    describe("Logging with valid credentials", () => {
        it('Should login for a user', async () => {
            const response = await request(app).post('/api/users/auth')
            .send({
                username: user1.username,
                password: user1.password
            });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({"message": "Successfully authenticated!"})
        })      
    })
   
    describe("Invalid username", () => {
        it('Should login for a user', async () => {
            const response = await request(app).post('/api/users/auth')
            .send({
                username: "Markussssssssssssssssssssssssssssssssssssssssssssssssss",
                password: "hello123"
            });
            expect(response.statusCode).toEqual(400);
            expect(response.body.errors).not.toBeNull();
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toEqual({
                type: "field",
                value: "Markussssssssssssssssssssssssssssssssssssssssssssssssss",
                msg: "Username must be maximum of 20 characters.",
                path: "username",
                location: "body"
              });
        })
    })
    describe("Invalid username", () => {
        it('Should login for a user', async () => {
            const response = await request(app).post('/api/users/auth')
            .send({
                username: "Markus",
                password: "hello1233333333333333333333333333333333333333333333333"
            });
            expect(response.statusCode).toEqual(400);
            expect(response.body.errors).not.toBeNull();
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toEqual({
                type: "field",
                value: "hello1233333333333333333333333333333333333333333333333",
                msg: "Username must be maximum of 20 characters.",
                path: "password",
                location: "body"
              });
        })
    })

    
})
describe("get all users", () => {
    test('should respond with a list of users', async () => {
        const response = await request(app).get("/api/users");
        expect(response.body).not.toBeNull();
        expect(response.body).toMatchObject[user1]
    })
})
describe("get user by ID", () => {
    describe("user ID exists", () => {
        test('should respond with a 200 status and user details', async () => {
            const response = await request(app).get(`/api/users/getbyid/${userId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject[user1]
        })
    })
    describe("user ID doesn't exist", () => {
        test('should respond with a 400 status because user with this ID does not exist', async () => {
            const userID = '66ca4374df0a99a8061807';
            const response = await request(app).get(`/api/users/getbyid/${userID}`);
            expect(response.statusCode).toBe(400);
        })
    })
    describe("user ID is invalid", () => {
        test('should respond with a 400 status because user with this ID does not exist', async () => {
            const userID = '66ca437';
            const response = await request(app).get(`/api/users/getbyid/${userID}`);
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ "message": "Invalid ID format" })
        })
    })
})
describe("update user", () => {
    describe("should update user by ID", () => {
        test('should respond with a 400 status because ID is a string', async () => {
            const response = await request(app).put(`/api/users/update/${userId}`)
            .send({
                username: "ilona",
                displayName: "Ilona",
                password: "Ilona"
            });
            expect(response.statusCode).toBe(200)
            expect(response.body).toMatchObject[{username: 'ilona', displayName: 'Ilona', password: 'Ilona' }]

        })
    })
})
describe("delete user", () => {
    describe("deliting user if user exists", () => {
        test('should respond with a 200 status and a message that user deleted', async () => {
            const response = await request(app).delete(`/api/users/delete/${userId}`)
            expect(response.statusCode).toBe(201)
            expect(response.body).toEqual({ "message": "User deleted successfully" })
        })
    })
    describe("user doesn't exist", () => {
        test('should respond with a 404 status and a message that user cannot be find', async () => {
            const userID = '66ca5f93412e4bcae72ed3b3'
            const response = await request(app).delete(`/api/users/delete/${userID}`)
            
            expect(response.statusCode).toBe(404)
            expect(response.body).toEqual({ "message": "Cannot find any user with ID 66ca5f93412e4bcae72ed3b3" })

        })
    })
    describe("invalid user ID", () => {
        test('should respond with a 400 status ', async () => {
            const userID = '66ca5f93412e'
            const response = await request(app).delete(`/api/users/delete/${userID}`)
            expect(response.statusCode).toBe(400)
            expect(response.body).toEqual({ "message": "Invalid ID format" })

        })
    })
})
describe("user profile access", () => {
    describe("user not authenticated", () => {
        test('should respond with a message "Not Authenticated" and a 401 status code', async () => {
            const response = await request(app).get("/api/users/auth/profile");
            expect(response.statusCode).toBe(401)
            expect(response.body).toEqual({ "message": "Not Authenticated" })
        })
    })
    describe("user authenticated", () => {
        test('should respond with a message "User Profile"', async () => {
            const response = await agent.get("/api/users/auth/profile");
            expect(response.body).toEqual({ "message": "User Profile" })
        })
    })
})
describe("User logout", () => {
    describe("user not authenticated", () => {
        test('should respond with a message "Not Authenticated" and a 401 status code', async () => {
            const response = await request(app).post("/api/users/auth/logout");
            expect(response.statusCode).toBe(401)
            expect(response.body).toEqual({ "message": "Not Authenticated" })
        })
    })
    describe("user authenticated", () => {
        test('should respond with a message "User Profile"', async () => {
            const response = await agent.post("/api/users/auth/logout");
            expect(response.statusCode).toBe(200)
        })
    })
})

