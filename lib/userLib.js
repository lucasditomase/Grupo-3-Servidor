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
        const dateOfBirth = new Date(
            parseInt(nacimientoAnio),
            parseInt(nacimientoMes) - 1,
            parseInt(nacimientoDia)
        );
        const data = {
            username: username,
            email: email,
            hashedPassword: password,
            dateOfBirth: dateOfBirth,
        };
        console.log(data);
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
        console.log(error);
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
