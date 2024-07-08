const express = require('express');
const app = express();
const users = require('./users.json');

function login(email, password){
    const user = users.find(user => user.email === email && user.password === users.password);
    if(user){
        return {
            success: true,
            message: 'Login successful'
        }
    }else{
        return {
            success: false,
            message: 'Invalid credentials'
        }
    }
}

module.exports = {login};