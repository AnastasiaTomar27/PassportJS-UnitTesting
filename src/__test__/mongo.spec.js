const app = require('../app');
const request = require('supertest');
const User = require('../mongoose/schemas/user');
const session = require('supertest-session');
const { disconnectDB } = require('../mongoose/connection');

// beforeAll (async() => {
//     await connectDB();
//     console.log("Connected to in-memory MongoDB");
// });
afterAll (async() => {
    await disconnectDB();
    console.log("Disconnected from in-memory MongoDB");
});

const user1 = {
    username: 'user123',
    displayName: 'User123',
    password: 'Hello123'
}
const user2 = {
    username: 'user456',
    displayName: 'User456',
    password: 'Hello456'
}

let userId;
let agent;
var testSession = null;

let secondAgent;

beforeEach(async () => {
    await User.deleteMany({}); // Clear the collection before each test

        // Creating users directly in the database using Mongoose  instead of making HTTP requests via request(app).post('/api/users/register')
    const $user1 = await User.create(user1);
    const $user2 = await User.create(user2);

    userId = $user1._id;
    agent = request.agent(app); // Creating a session agent
    testSession = session(app); // For handling session in tests

    await agent.post('/api/users/auth').send({
        username: user1.username,
        password: user1.password
    });    
});


describe("Session test", () => {
    it('should fail accessing a restricted page', function (done) {
        testSession.get('/api/users/auth/profile')
          .expect(401)
          .end(done)
      });
      
    it('should register user', function (done) {
    testSession.post('/api/users/register')
        .send({ username: 'foo', password: 'Password1', displayName: 'Foo' })
        .expect(201)
        .end(done);
    });
    
    test('cookies should be defined and contain connect.sid', async () => {
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
                password: 'Hello123'
            })
            expect(response.statusCode).toBe(201)
            expect(response.body).toMatchObject[{username: 'olga', displayName: 'Olga', password: 'Hello123' }]
        })
    })
    describe("user already exists", () => {
        test('should respond with a 201 status code and user details', async () => {
            const response = await request(app).post('/api/users/register')
            .send({
                username: user1.username,
                displayName: user1.displayName,
                password: user1.password
            })
            expect(response.statusCode).toBe(400)
            expect(response.body).toEqual({"message": "User already registered!"});
        })
    })
    describe('username length is more than 20 characters', () => {
        test("should respond with a 400 status code and error message ", async () => {
            const response = await request(app).post("/api/users/register").send({
                username: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                displayName: "Anastasia",
                password: "Hello123"
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
        test("adding very long username should respond with a 400 status code and error message", async () => {
            const response = await request(app).post("/api/users/register").send({
                username: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                displayName: "Anastasia",
                password: "Hello123"
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).not.toBeNull();
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toEqual({
                type: 'field',
                value: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                msg: 'Username must be maximum of 20 characters.',
                path: 'username',
                location: 'body'
              });
        })
        it("should fail if password does not meet the criteria (missing uppercase)", async () => {
            const response = await request(app)
              .post("/api/users/register")
              .send({
                username: "testUser",
                displayName: "testDisplayName",
                password: "password123", // No uppercase
              });
        
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  msg: "User password configuration is invalid",
                }),
              ])
            );
        });
        it("should fail if password does not meet the criteria (missing lowercase)", async () => {
            const response = await request(app)
              .post("/api/users/register")
              .send({
                username: "testUser",
                displayName: "testDisplayName",
                password: "PASSWORD123", // No lowercase
              });
        
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  msg: "User password configuration is invalid",
                }),
              ])
            );
          });
        
          it("should fail if password does not meet the criteria (missing number)", async () => {
            const response = await request(app)
              .post("/api/users/register")
              .send({
                username: "testUser",
                displayName: "testDisplayName",
                password: "Password", // No number
              });
        
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  msg: "User password configuration is invalid",
                }),
              ])
            );
          });
        

    })
    describe('displayname length is more than 20 characters', () => {
        test("should respond with a 400 status code and error message", async () => {
            const response = await request(app).post("/api/users/register").send({
                username: "anastasia",
                displayName: "Anastasiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                password: "Hello123"
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
                password: "Hello123333333333333333333333333333333333333333333"
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.errors).not.toBeNull();
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toEqual({
                type: 'field',
                value: 'Hello123333333333333333333333333333333333333333333',
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
        it('Should fail because username length is more than 20 characters', async () => {
            const response = await request(app).post('/api/users/auth')
            .send({
                username: "Markussssssssssssssssssssssssssssssssssssssssssssssssss",
                password: "Hello123"
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
    describe("Invalid password", () => {
        it('Should fail because password length is more than 20 characters', async () => {
            const response = await request(app).post('/api/users/auth')
            .send({
                username: "Markus",
                password: "Hello1233333333333333333333333333333333333333333333333"
            });
            expect(response.statusCode).toEqual(400);
            expect(response.body.errors).not.toBeNull();
            expect(response.body.errors.length).toBe(1);
            expect(response.body.errors[0]).toEqual({
                type: "field",
                value: "Hello1233333333333333333333333333333333333333333333333",
                msg: "Password must be maximum of 20 characters.",
                path: "password",
                location: "body"
              });
        })
        it('should fail if password does not meet the criteria (missing uppercase)', async () => {
            const response = await request(app)
              .post('/api/users/auth')
              .send({
                username: 'testUser',
                password: 'password123', // No uppercase
              });
        
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  msg: 'User password configuration is invalid',
                }),
              ])
            );
          });
        
          it('should fail if password does not meet the criteria (missing lowercase)', async () => {
            const response = await request(app)
              .post('/api/users/auth')
              .send({
                username: 'testUser',
                password: 'PASSWORD123', // No lowercase
              });
        
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  msg: 'User password configuration is invalid',
                }),
              ])
            );
          });
        
          it('should fail if password does not meet the criteria (missing number)', async () => {
            const response = await request(app)
              .post('/api/users/auth')
              .send({
                username: 'testUser',
                password: 'Password', // No number
              });
        
            expect(response.status).toBe(400);
            expect(response.body.errors).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  msg: 'User password configuration is invalid',
                }),
              ])
            );
          });
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
        test('should respond with a 404 status because user with this ID does not exist', async () => {
            const userID = '507f1f77bcf86cd799439011';
            const response = await request(app).get(`/api/users/getbyid/${userID}`);
            expect(response.body).toEqual({ "message": `Cannot find any user with ID ${userID}` })
            expect(response.statusCode).toBe(404);
        })
    })
    describe("user ID is invalid", () => {
        test('should respond with a 400 status because user ID is invalid, it is a string', async () => {
            const userID = '66ca437';
            const response = await request(app).get(`/api/users/getbyid/${userID}`);
            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ "message": "Invalid ID format" })
        })
    })
})
describe("update user", () => {
    describe("should update user by ID", () => {
        test('should respond with a 201 status and update user', async () => {
            const response = await request(app).put(`/api/users/update/${userId}`)
            .send({
                username: "ilona",
                displayName: "Ilona",
                password: "Ilona1"
            });
            expect(response.statusCode).toBe(201)
            expect(response.body).toMatchObject[{username: 'ilona', displayName: 'Ilona', password: 'Ilona1' }]

        })
    })
})
describe("delete user", () => {
    describe("deliting user if user exists", () => {
        test('should respond with a 200 status and a message that user deleted', async () => {
            const response = await request(app).delete(`/api/users/delete/${userId}`)
            expect(response.statusCode).toBe(200)
            expect(response.body).toEqual({ "message": "User deleted successfully" })

            // checking whether  user that was soft deleted marked in the database as deletedAt
            const deletedUser = await User.findById(userId);
            expect(deletedUser).not.toBeNull();
            expect(deletedUser.deletedAt).toBeDefined();
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
        test('should respond with a message "Successfully logged out" and a 200 status code', async () => {
            const response = await agent.post("/api/users/auth/logout");
            expect(response.statusCode).toBe(200)
            expect(response.body).toEqual({ "message": "Successfully logged out" })

        })
    })
    afterEach(async () => {
      // Log out 
      await agent.post("/api/users/auth/logout");
    })
})
describe("Switching sessions", () => {
    describe("one user logout and another user log in", () => {
        test('should respond with a message "User Profile" and a 200 status code', async () => {
          // log in as a first user
          await agent.post('/api/users/auth').send({
            username:user1.username,
            password: user1.password
        });   
          // log out as a first user
          await agent.post("/api/users/auth/logout");
          
          // Register second user
          const response2 = await request(app).post('/api/users/register').send(user2);
          secondAgent = request.agent(app);

          // Authenticate the second user
          await secondAgent.post('/api/users/auth').send({
              username: user2.username,
              password: user2.password
          });

          // Verify second user session
          const profileResponse = await secondAgent.get("/api/users/auth/profile");
          expect(profileResponse.statusCode).toBe(200);
          expect(profileResponse.body).toEqual({ "message": "User Profile" });

        })
    })
    
})

