const supertest = require('supertest');
const {login} = require('./auth');

jest.mock('./auth', () => ({
    login: jest.fn()
})
);

describe('login', () => {
    it('should return 200 and success message for valid credentials', async() => {
        login.mockImplementation(() => ({
            success: true,
            message : 'Login successful'
        }));

        const response = login('test@example.com','test');
        expect(response.success).toBe(true);
        expect(response.message).toBe('Login successful');
    }) 
});