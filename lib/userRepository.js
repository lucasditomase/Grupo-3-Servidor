const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createUser(email, username, password,name) {
  try {
    const user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        hashedPassword: password,
        name: name
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  createUser,
  getUserByEmail,
};
