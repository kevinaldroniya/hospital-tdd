const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

-----

const { login } = require('./auth');

describe('Login Function', () => {
  it('should return success for valid credentials', () => {
    const result = login('John@test.coom', 'test');
    expect(result).toEqual({ success: true, userId: 1, role: 'admin' });
  });

  it('should return failure for invalid credentials', () => {
    const result = login('invalid@test.com', 'wrong');
    expect(result).toEqual({ success: false, message: 'Invalid credentials' });
  });
});

-------
const users = require('./users.json'); // Assuming users.json is in the same directory

function login(email, password) {
  const user = users.find(user => user.email === email && user.password === password);
  if (user) {
    return { success: true, userId: user.id, role: user.role };
  } else {
    return { success: false, message: 'Invalid credentials' };
  }
}

module.exports = { login };

----
const express = require('express');
const bodyParser = require('body-parser');
const { login } = require('./auth'); // Adjust the path as necessary

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const result = login(email, password);

    if (result === 'success') {
        res.status(200).json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json(result); // Sends the { success: false, message: 'Invalid credentials' } object
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
----
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the auth module
jest.mock('./auth', () => ({
  login: jest.fn()
}));

const { login } = require('./auth');

// Setup Express app
const app = express();
app.use(bodyParser.json());
require('./auth.controller')(app); // Assuming auth.controller.js exports a function that takes the app as an argument

describe('POST /loggin', () => {
  it('should return 200 and success message for valid credentials', async () => {
    // Setup the mock to return success
    login.mockImplementation(() => ({ success: true, message: 'Login successful' }));

    const response = await request(app)
      .post('/loggin')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Login successful' });
    expect(login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should return 401 and error message for invalid credentials', async () => {
    // Setup the mock to return failure
    login.mockImplementation(() => ({ success: false, message: 'Invalid credentials' }));

    const response = await request(app)
      .post('/loggin')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ success: false, message: 'Invalid credentials' });
    expect(login).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
  });
});
----
const bodyParser = require('body-parser');
const { login } = require('./../auth/auth');

module.exports = function(app) {
    // Middleware to parse JSON bodies
    app.use(bodyParser.json());
    app.post('/login', (req, res) => {
        const { email, password } = req.body;
        const result = login(email, password);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(401).json(result);
        }
    });
};
-------------------
// register.test.js
const { register } = require('./auth'); // Adjust the path as necessary
const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper function to reset test data
const resetTestData = () => {
    const testData = [
        { id: 1, name: "Test User", email: "test@example.com", password: "password", role: "user" }
    ];
    fs.writeFileSync(usersFilePath, JSON.stringify(testData, null, 2), 'utf8');
};

describe('register', () => {
    beforeEach(() => {
        resetTestData();
    });

    afterAll(() => {
        resetTestData(); // Clean up test data
    });

    test('successfully registers a new user', async () => {
        const newUser = { name: "New User", email: "newuser@example.com", password: "newpassword", role: "user" };
        const response = await register(newUser.name, newUser.email, newUser.password, newUser.role);
        expect(response.success).toBe(true);
        expect(response.message).toBe('User registered successfully');
    });

    test('fails to register a user with an existing email', async () => {
        const existingUser = { name: "Test User", email: "test@example.com", password: "newpassword", role: "user" };
        const response = await register(existingUser.name, existingUser.email, existingUser.password, existingUser.role);
        expect(response.success).toBe(false);
        expect(response.message).toBe('Email already exists');
    });
});


----

const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, 'users.json'); 
async function register(newUser) {
  // Validate input data: Check if newUser is not null, all required fields are present, and no field is empty
  if (!newUser || Object.keys(newUser).length === 0 || !newUser.email || !newUser.password || !newUser.name || !newUser.role || newUser.email.trim() === '' || newUser.password.trim() === '' || newUser.name.trim() === '' || newUser.role.trim() === '') {
      return { success: false, message: 'Invalid data' };
  }

  try {
      // Read the existing users data
      const data = await fs.promises.readFile(usersFilePath, 'utf-8');
      const users = JSON.parse(data);

      // Check if the user already exists
      const userExists = users.some(user => user.email === newUser.email);
      if (userExists) {
          return { success: false, message: 'User already exists' };
      }

      // Add the new user
      users.push(newUser);

      // Write the updated users back to the file
      await fs.promises.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

      return { success: true, message: 'User registered successfully' };
  } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: 'An error occurred during registration' };
  }
}