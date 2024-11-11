const express = require('express');
const cors = require('cors');
const authLib = require('./lib/authLib');

const app = express();
const port = 3000;

app.use(express.json());
app.use(
    cors({
        origin: 'http://localhost:8081',
        credentials: true,
    })
);

// Middleware to validate request body
const validateRequestBody = (requiredFields) => (req, res, next) => {
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({
                message: `Please provide ${requiredFields.join(', ')}`,
            });
        }
    }
    next();
};

// Root route
app.get('/', authLib.validateAuthorization, (req, res) => {
    const message = `Welcome to the secret backend ${req.userData.username}`;
    res.send(message);
});

// Login user
app.post(
    '/login',
    validateRequestBody(['email', 'password']),
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const token = await authLib.loginUser(email, password);
            res.status(200).json({ message: 'Login successful!', token });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

// Register user
app.post(
    '/register',
    validateRequestBody(['username', 'email', 'password']),
    async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const token = await authLib.registerUser(email, username, password);
            res.status(200).json({ message: 'Register successful!', token });
            console.log('User has successfully registered!');
        } catch (err) {
            if (err.message === 'Email already in use') {
                console.log('Error registering user: Email already in use');
                res.status(400).json({ message: err.message });
            } else {
                console.log('Error registering user');
                res.status(500).json({ message: 'Server error' });
            }
        }
    }
);

// Get user data
app.get('/user/:id?', authLib.validateAuthorization, (req, res) => {
    if (req.params.id) {
        res.json({ message: 'Functionality not yet implemented!' });
    } else {
        const { hashedPassword, ...userData } = req.userData;
        res.json(userData);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;
