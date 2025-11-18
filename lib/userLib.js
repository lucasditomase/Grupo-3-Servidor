const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser(
    username,
    email,
    password,
    nacimientoDia,
    nacimientoMes,
    nacimientoAnio
) {
    try {
        // Log input values to check what is being passed in
        console.log('Input values: ', {
            nacimientoDia,
            nacimientoMes,
            nacimientoAnio,
        });

        // Convert inputs to integers
        const dia = parseInt(nacimientoDia, 10);
        const mes = parseInt(nacimientoMes, 10) - 1; // Months are 0-indexed in JS
        const anio = parseInt(nacimientoAnio, 10);

        // Log the parsed values
        console.log('Parsed values: ', { dia, mes, anio });

        // Validate the parsed values
        if (isNaN(dia) || isNaN(mes) || isNaN(anio)) {
            console.log('Invalid date values provided');
            throw new Error('Invalid date values');
        }

        // Create a new Date object
        const dateOfBirth = new Date(anio, mes, dia);

        // Check if the created date is valid
        if (isNaN(dateOfBirth.getTime())) {
            console.log('Invalid date of birth');
            throw new Error('Invalid date of birth');
        }

        // Create user data object
        const data = {
            username: username,
            email: email,
            hashedPassword: password,
            dateOfBirth: dateOfBirth,
        };

        // Log the user data object (omit sensitive fields)
        console.log('User data to be created: ', {
            username: data.username,
            email: data.email,
            dateOfBirth: data.dateOfBirth
        });

        // Create the user in the database
        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                hashedPassword: password,
                dateOfBirth: dateOfBirth,
            },
        });

        return user;
    } catch (error) {
        // Log the error and return null in case of failure
        console.log('Error creating user:', error);
        return null;
    }
}

async function getUserByField(field, value) {
    try {
        const user = await prisma.user.findUnique({
            where: { [field]: value },
        });

        console.log(field, value);

        if (!user) {
            console.log('No user found with the provided field.');
            return null;
        }

        return user;
    } catch (error) {
        console.error('Error while fetching user:', error);
        return null;
    }
}

module.exports = {
    createUser,
    getUserByField,
};
