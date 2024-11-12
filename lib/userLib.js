const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser(email, username, password, name) {
    try {
        const user = await prisma.user.create({
            data: {
                email: email,
                username: username,
                hashedPassword: password,
                name: name,
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
            where: { [field]: value }, // Dynamically use the field parameter
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
