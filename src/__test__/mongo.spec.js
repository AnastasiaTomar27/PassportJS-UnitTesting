const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../mongoose/schemas/user');
const session = require('supertest-session');
const { disconnectDB } = require('../mongoose/connection');

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
    password: 'Hello123'
}
const adminUser = {
    username: 'admin123',
    displayName: 'Admin User',
    password: "Hello123",
    role: 'admin'
};

let userId;
let user2Id;
let agent; // The agent remembers cookies and headers between requests, simulating a real user's browser.

var testSession = null;

let secondAgent;

beforeEach(async () => {
    await User.deleteMany({}); // Clear the collection before each test

    // Creating users directly in the database using Mongoose  instead of making HTTP requests via request(app).post('/api/users/register')
    const $user1 = await User.create(user1);
    const $user2 = await User.create(user2);
    const $adminUser = await User.create(adminUser);

    userId = $user1._id;
    user2Id = $user2._id;
    adminId = $adminUser._id;
    agent = request.agent(app); // Creating a session agent.. Without agent, the server treats each request as coming from a new client
    secondAgent = request.agent(app); 
    testSession = session(app); // For handling session in tests   
});


describe("Session test", () => {
    it('should fail accessing a restricted page', function (done) {
        testSession.get('/api/profile')
          .expect(401)
          .end(done)
      });
      
    it('should register user', function (done) {
    testSession.post('/api/register')
        .send({ username: 'foo', password: 'Password1', displayName: 'Foo' })
        .expect(201)
        .end(done);
    });
    
    test('cookies should be defined and contain connect.sid', async () => {
        const response = await request(app).post('/api/login')
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
            const response = await request(app).post('/api/register')
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
            const response = await request(app).post('/api/register')
            .send({
                username: user1.username,
                displayName: user1.displayName,
                password: user1.password
            })
            expect(response.statusCode).toBe(400)
            expect(response.body.errors[0].msg).toBe("User already registered!");
        })
    })
    describe('username length is more than 20 characters', () => {
        test("should respond with a 400 status code and error message ", async () => {
            const response = await request(app).post("/api/register").send({
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
        });
        
        it("should fail if password does not meet the criteria (missing uppercase)", async () => {
            const response = await request(app)
              .post("/api/register")
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
              .post("/api/register")
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
              .post("/api/register")
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
            const response = await request(app).post("/api/register").send({
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
            const response = await request(app).post("/api/register").send({
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
});

describe("Authentication - Log in user", () => { 
    describe("Logging with valid credentials as a user", () => {
        it('Should login for a user', async () => {
            const response = await request(app).post('/api/login')
            .send({
                username: user1.username,
                password: user1.password
            });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
              "message": "Successfully authenticated!",
              "data": {
                  "displayName": "User123",
                  "name": "user123"
              }
          });
        })      
    });
    describe("Logging with valid credentials as an admin", () => {
        it('Should login for an admin', async () => {
            const user = new User({
                username: "Anastasia",
                displayName: "anastasia",
                password: "Password123",
                role: "admin"

            });
            await user.save();

            const response = await request(app).post('/api/login')
            .send({
                username: "Anastasia",
                password: "Password123"
            });
            expect(response.statusCode).toEqual(200);
            expect(response.body).toEqual({
              "message": "Successfully authenticated!",
              "data": {
                  "displayName": "anastasia",
                  "name": "Anastasia",
                  "role": "admin"
              }
          });
        })      
    })
   
    describe("Logging with invalid credentials", () => {
      it('USERNAME MISSING: Should return status 400 and error', async () => {
        const response = await request(app).post('/api/login')
        .send({
            password: user1.password
        });

        expect(response.statusCode).toEqual(400);
        expect(response.body.errors[0].msg).toBe("Invalid value");

      });
      it('USERNAME IS NOT A STRING: Should return status 400 and error', async () => {
        const response = await request(app).post('/api/login')
        .send({
            username: 123,
            password: user1.password
        });

        expect(response.statusCode).toEqual(400);
        expect(response.body.errors[0].msg).toBe("Invalid value");
      });
      it('PASSWORD IS MISSING: Should return status 400 and error', async () => {
        const response = await request(app).post('/api/login')
        .send({
            username: user1.username
        });

        expect(response.statusCode).toEqual(400);
        expect(response.body.errors[0].msg).toBe("Invalid value");
      });
      it('PASSWORD IS NOT A STRING: Should return status 400 and error', async () => {
        const response = await request(app).post('/api/login')
        .send({
            username: user1.username,
            password: 123
        });

        expect(response.statusCode).toEqual(400);
        expect(response.body.errors[0].msg).toBe("Invalid value");
      });
    });        
});

describe("GET /api/getall", () => {
    it("should return 403 if user is not an admin", async () => {
        await agent.post('/api/login')
            .send({
                username: user1.username,
                password: user1.password
            });
        const response = await agent.get('/api/getall')
        
        expect(response.statusCode).toBe(403);
        expect(response.body).toMatchObject({
            errors: [{
                msg: "Access denied. You do not have the required permissions to access this resource."
            }]
        });
    });

    it("should return 200 and a list of users if user is an admin", async () => {
        await agent.post('/api/login')
            .send({
                username: adminUser.username,
                password: adminUser.password
            });

        const response = await agent
            .get('/api/getall')

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("msg", "All users:");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: user1.username,
                    displayName: user1.displayName,
                    userId: userId.toString() // The userId in MongoDB is typically represented as an ObjectId type, which is different from a regular JavaScript string.
                }),
                
            ])
        );
        
    });

    it("should return 500 if an error occurs in the database", async () => {
        await agent.post('/api/login')
            .send({
                username: adminUser.username,
                password: adminUser.password
            });
        jest.spyOn(User, "find").mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        const response = await agent
            .get('/api/getall')

        expect(response.statusCode).toBe(500);
        expect(response.body).toMatchObject({
            errors: [{ msg: "Error retrieving users" }]
        });
    });
});

describe("GET /api/getbyid", () => {
  it("should return 400 if ID format is invalid", async () => {
    await agent.post('/api/login')
            .send({
                username: adminUser.username,
                password: adminUser.password
            });
      const response = await agent.get('/api/getbyid').send({
          userId: "invalid-id-format"
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
          errors: [{ msg: "Invalid ID format" }]
      });
  });

  it("should return 404 if user with given ID does not exist", async () => {
    await agent.post('/api/login')
            .send({
                username: adminUser.username,
                password: adminUser.password
            });
    const nonExistentUserId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId that doesn't exist
      const response = await agent.get('/api/getbyid').send({
          userId: nonExistentUserId
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
          errors: [{ msg: `Cannot find any user with ID ${nonExistentUserId}` }]
      });
  });

  it("should return 200 and user details for a valid user ID", async () => {
    await agent.post('/api/login')
            .send({
                username: adminUser.username,
                password: adminUser.password
            });  
    const response = await agent.get('/api/getbyid').send({
          userId: userId 
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({
          msg: "User was successfully founded",
          data: {
              name: user1.username,
              displayName: user1.displayName
          }
      });
  });

  it("should return 500 if a database error occurs", async () => {
    await agent.post('/api/login')
            .send({
                username: adminUser.username,
                password: adminUser.password
            });
      jest.spyOn(User, "findById").mockImplementationOnce(() => {
          throw new Error("Database error");
      });

      const response = await agent.get('/api/getbyid').send({
          userId: userId
      });

      expect(response.statusCode).toBe(500);
      expect(response.body).toMatchObject({
          errors: [{ msg: "Internal server error. Please try again later." }]
      });
  });
});

describe("update user", () => {
    describe("should update user by ID", () => {
        test('should respond with a 201 status and update user', async () => {
            await agent.post('/api/login')
            .send({
                username: adminUser.username,
                password: adminUser.password
            });
            const response = await agent.put('/api/update')
            .send({
                userId: userId,
                username: "ilona",
                displayName: "Ilona",
                password: "Ilona1"
            });
            expect(response.statusCode).toBe(201)
            expect(response.body).toMatchObject[{username: 'ilona', displayName: 'Ilona', password: 'Ilona1' }]
        })
    })
    describe("user tries to access api/update route", () => {
        test('should respond with a 403 status', async () => {
            await agent.post('/api/login')
            .send({
                username: user1.username,
                password: user1.password
            });
            const response = await agent.put('/api/update')
            .send({
                userId: user2Id,
                username: "ilona",
                
            });
            expect(response.statusCode).toBe(403);
            expect(response.body).toMatchObject({
                errors: [{
                    msg: "Access denied. You do not have the required permissions to access this resource."
                }]
            });
        });
        it("should return 400 if user ID format is invalid", async () => {
            await agent.post('/api/login').send({
                username: adminUser.username,
                password: adminUser.password,
            });
        
            const invalidId = "123"; // Invalid ObjectId format
            const response = await agent.put('/api/update').send({
                userId: invalidId,
                displayName: "Maria"
            });
        
            expect(response.statusCode).toBe(400);
            expect(response.body).toMatchObject({
                message: "Invalid ID format",
            });
        });
        it("should return 404 if the user is not found by ID", async () => {
            await agent.post('/api/login')
                .send({
                    username: adminUser.username,
                    password: adminUser.password,
                });
        
            const nonExistentUserId = new mongoose.Types.ObjectId(); 

            const response = await agent.put('/api/update').send({
                userId: nonExistentUserId,
                displayName: "Some New Name"
            });
        
            expect(response.statusCode).toBe(404);
            expect(response.body).toMatchObject({
                errors: [{ msg: `Cannot find any user with ID ${nonExistentUserId}` }]
            });
        });
        
        
    })
})
describe("delete user", () => {
    describe("deliting user if user exists", () => {
        test('should respond with a 200 status and a message that user deleted', async () => {
            await agent.post('/api/login')
                .send({
                    username: adminUser.username,
                    password: adminUser.password,
                });

            const response = await agent.delete('/api/deleteUser')
                .send({
                    userId: userId
                });
    
            expect(response.statusCode).toBe(200)
            expect(response.body).toEqual({ "message": "User deleted successfully" })

            // checking whether  user that was soft deleted marked in the database as deletedAt
            const deletedUser = await User.findById(userId);
            expect(deletedUser).not.toBeNull();
            expect(deletedUser.deletedAt).toBeDefined();
        })
    });

    describe("user doesn't exist", () => {
        test('should respond with a 404 status and a message that user cannot be find', async () => {
            await agent.post('/api/login')
                .send({
                    username: adminUser.username,
                    password: adminUser.password,
                });
            const userID = '66ca5f93412e4bcae72ed3b3'
            const response = await agent.delete('/api/deleteUser')
                .send({
                    userId: userID
                });
            
            expect(response.statusCode).toBe(404)
            expect(response.body).toEqual({ "message": "Cannot find any user with ID 66ca5f93412e4bcae72ed3b3" })

        })
    })
    describe("invalid user ID", () => {
        test('should respond with a 400 status ', async () => {
            await agent.post('/api/login')
                .send({
                    username: adminUser.username,
                    password: adminUser.password,
                });
            const userID = '66ca5f93412e'
            const response = await agent.delete('/api/deleteUser')
                .send({
                    userId: userID
                })
            expect(response.statusCode).toBe(400)
            expect(response.body).toEqual({
                errors: [{
                    msg: "Invalid ID format"
                }]
            });
        })
    })
})
describe("user profile access", () => {
    describe("user not authenticated", () => {
        test('should respond with a message "Not Authenticated" and a 401 status code', async () => {
            const response = await request(app).get("/api/profile");
            expect(response.statusCode).toBe(401)
            expect(response.body).toEqual({ "message": "Not Authenticated" })
        })
    })
    describe("user authenticated as a user, not admin", () => {
        test('should respond with a message "User Profile"', async () => {
          await agent.post('/api/login').send({
            username: user1.username,
            password: user1.password
        });  
          
            const response = await agent.get("/api/profile");

            expect(response.body).toEqual({
                message: "Hello, user123!", 
                data: {
                    displayName: "User123",
                    name: "user123"
                }
            });
        });
    });
    describe("user authenticated as an admin", () => {
        test('should respond with a message "User Profile"', async () => {
          await agent.post('/api/login').send({
            username: adminUser.username,
            password: adminUser.password
        });  
          
            const response = await agent.get("/api/profile");

            expect(response.body).toEqual({
                message: "Hello, admin123!", 
                data: {
                    displayName: "Admin User",
                    name: "admin123",
                    role: "admin"
                }
            });
        });
    });
});
describe("User logout", () => {
    describe("user not authenticated", () => {
        test('should respond with a message "Not Authenticated" and a 401 status code', async () => {
            const response = await request(app).post("/api/logout");
            expect(response.statusCode).toBe(401)
            expect(response.body).toEqual({ "message": "Not Authenticated" })
        })
    })
    describe("user authenticated", () => {
        test('should respond with a message "Successfully logged out" and a 200 status code', async () => {
            await agent.post('/api/login').send({
                username:user1.username,
                password: user1.password
            });  
            const response = await agent.post("/api/logout");
            expect(response.statusCode).toBe(200)
            expect(response.body).toEqual({ "message": "Successfully logged out" })
            
            // now user can't access profile route
            const responseProfile = await agent.get('/api/profile')

            expect(responseProfile.statusCode).toBe(401);
            expect(responseProfile.body).toEqual({ "message": "Not Authenticated" })
        })

         
    })
})
describe("Switching sessions", () => {
    describe("one user logout and another user log in", () => {
        test('should respond with a message "User Profile" and a 200 status code', async () => {
          // log in as a first user
          await agent.post('/api/login').send({
            username:user1.username,
            password: user1.password
          });   
          // log out as a first user
          await agent.post("/api/logout");

          // Authenticate the second user
          await secondAgent.post('/api/login').send({
              username: user2.username,
              password: user2.password
          });

          // Verify second user session
          const profileResponse = await secondAgent.get("/api/profile");
          expect(profileResponse.statusCode).toBe(200);
          expect(profileResponse.body).toEqual({
            message: "Hello, user456!", 
            data: {
                displayName: "User456",
                name: "user456"
            }
        });
        })
    })
    
})

