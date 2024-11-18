const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const userLib = require('./userLib');
dotenv.config({ path: __dirname + '../.env' });
const key = process.env.JWS_SECRET;

if (!key) {
    console.error('Error: JWS_SECRET no está definido en el archivo .env');
}

function generateToken(user) {
    try {
        console.log('Generando token...');
        const tokenPayload = {
            userId: user.userId,
            email: user.email,
            username: user.username,
            dateOfBirth: user.dateOfBirth,
            profileImage: user.profileImage,
        };
        if (!key) throw new Error('La clave secreta no está definida');

        const token = jwt.sign(tokenPayload, key, {
            expiresIn: '2h',
        });

        return token;
    } catch (error) {
        console.error('Error en generateToken:', error.message);
        throw new Error('Error al generar el token');
    }
}

const validateAuthorization = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            throwError(401);
        } // Bearer wsexdrctfvgybhujnimklpm hgvhbj [,wsexdrctfvgybhujnimklpm hgvhbj]
        const token = req.headers.authorization.split('Bearer ')[1];
        const decoded = jwt.verify(token, key);
        req.userData = decoded;
        next();
    } catch (err) {
        res.status(403).json('Forbidden.');
    }
};

const loginUser = async (email, password) => {
    const user = await userLib.getUserByField('email', email);

    if (!user) {
        // No user found with the provided email
        return null;
    }

    const valid = await bcrypt.compare(password, user.hashedPassword);

    if (!valid) {
        // Password is incorrect
        return null;
    }

    return generateToken(user);
};

const registerUser = async (
    username,
    email,
    password,
    nacimientoDia,
    nacimientoMes,
    nacimientoAnio
) => {
    const existingUsername = await userLib.getUserByField('username', username);
    const existingEmail = await userLib.getUserByField('email', email);

    if (existingUsername && existingEmail) {
        return { status: 'user_exists' };
    }
    if (existingUsername) {
        return { status: 'username_exists' }; // Return a status indicating username already exists
    }
    if (existingEmail) {
        return { status: 'email_exists' }; // Return a status indicating email already exists
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const user = await userLib.createUser(
        username,
        email,
        hashedPass,
        nacimientoDia,
        nacimientoMes,
        nacimientoAnio
    );

    if (!user) {
        return { status: 'creation_failed' }; // Return a status indicating user creation failed
    }

    console.log('User has successfully registered!');
    return { status: 'success', token: generateToken(user) }; // Return success with a token
};

module.exports = {
    generateToken,
    validateAuthorization,
    loginUser,
    registerUser,
};
