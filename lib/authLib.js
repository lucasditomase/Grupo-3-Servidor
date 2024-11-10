const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const userRepository = require("./userRepository");
dotenv.config({ path: __dirname + "../.env" });
const key = process.env.JWS_SECRET;

if (!key) {
  console.error("Error: JWS_SECRET no está definido en el archivo .env");
}

function generateToken(user) {
  try {
    console.log("Generando token...");
    if (!key) throw new Error("La clave secreta no está definida");

    const token = jwt.sign(user, key, {
      expiresIn: "2h",
    });

    return token;
  } catch (error) {
    console.error("Error en generateToken:", error.message);
    throw new Error("Error al generar el token");
  }
}

const validateAuthorization = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throwError(401);
    }
    const token = req.headers.authorization.split("Bearer ")[1];
    const decoded = jwt.verify(token, key);
    req.userData = decoded;
    next();
  } catch (err) {
    res.status(403).json("Forbidden.");
  }
};

const loginUser = async (email, password) => {
  const user = await userRepository.getUserByEmail(email);
  const valid = bcrypt.compare(password, user.hashedPassword);
  if (!user) {
    return false;
  }
  if (!valid) {
    return false;
  }
  return generateToken(user);
};

const registerUser = async (email, username, password, name) => {
  const existingUser = await userRepository.getUserByEmail(email);
  if (existingUser) {
    throw new Error("Email already in use"); // Este mensaje será capturado en el frontend
  }
  const hashedPass = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser(
    email,
    username,
    hashedPass,
    name
  );
  if (!user) {
    throw new Error("Error al registrar usuario");
  }
  console.log("User has successfully registered!");
  return generateToken(user); // Devuelve el token si el registro es exitoso
};

module.exports = {
  generateToken,
  validateAuthorization,
  loginUser,
  registerUser,
};
