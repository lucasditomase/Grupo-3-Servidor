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

            if (!token) {
                return res
                    .status(401)
                    .json({ message: 'Invalid email or password' });
            }

            res.status(200).json({ message: 'Login successful!', token });
        } catch (err) {
            console.error('Error during login:', err.message);
            res.status(500).json({
                message: 'Server error. Please try again later.',
            });
        }
    }
);

// Register user
app.post(
    '/register',
    validateRequestBody([
        'username',
        'email',
        'password',
        'nacimientoDia',
        'nacimientoMes',
        'nacimientoAnio',
    ]),
    async (req, res) => {
        try {
            const {
                username,
                email,
                password,
                nacimientoDia,
                nacimientoMes,
                nacimientoAnio,
            } = req.body;
            console.log(
                username,
                email,
                password,
                nacimientoDia,
                nacimientoMes,
                nacimientoAnio
            );
            const result = await authLib.registerUser(
                username,
                email,
                password,
                nacimientoDia,
                nacimientoMes,
                nacimientoAnio
            );

            if (result.status === 'user_exists') {
                return res.status(400).json({
                    message: 'Ya hay hay un usuario con estos datos.',
                });
            }

            if (result.status === 'email_exists') {
                return res
                    .status(400)
                    .json({ message: 'Ya hay una persona con este email. ' });
            }

            if (result.status === 'username_exists') {
                return res.status(400).json({
                    message: 'Ya hay una persona con este nombre de usuario. ',
                });
            }

            if (result.status === 'creation_failed') {
                return res
                    .status(400)
                    .json({ message: 'User creation failed' });
            }

            res.status(200).json({
                message: 'Register successful!',
                token: result.token,
            });
            console.log('User has successfully registered!');
        } catch (err) {
            console.error('Error during registration:', err.message);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;
