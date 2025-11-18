const express = require('express');
const cors = require('cors');
const authLib = require('./lib/authLib');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const app = express();
const prisma = new PrismaClient();
const port = 3000;
const multer = require('multer');

// Rate limiter: 100 requests per 15 minutes per IP on sensitive endpoints
const uploadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in response headers
  legacyHeaders: false,  // Disable the X-RateLimit headers
});
const schedule = require('node-schedule');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname); // Extract file extension
        cb(null, req.userData.userId + '.jpg');
    },
});

const upload = multer({ storage: storage });

// Increase payload limit
app.use(express.json({ limit: '50mb' })); // Set the limit to 10MB or as required
app.use(express.urlencoded({ limit: '10mb', extended: true }));
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

// Login user
app.post(
    '/login',
    validateRequestBody(['email', 'password']),
    async (req, res) => {
        try {
            console.log('Login request received');
            const { email, password } = req.body;
            console.log(email, password);
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
                    .json({ message: 'Hubo un error al crear el usuario' });
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

app.get('/uploads/:filename', uploadsLimiter, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
});

app.post(
    '/upload-image',
    validateRequestBody(['image']),
    authLib.validateAuthorization,
    async (req, res) => {
        try {
            const { image } = req.body;
            const userId = req.userData.userId;
            const imageBuffer = Buffer.from(image, 'base64'); // Decode the base64 string

            // Ensure the 'uploads' directory exists
            const uploadsDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir);
            }

            const imagePath = path.join(uploadsDir, `${userId}.png`); // Save as a unique file
            fs.writeFileSync(imagePath, imageBuffer); // Save the image file

            // Update the user's profile image path in the database
            const relativePath = `uploads/${userId}.png`;
            await prisma.user.update({
                where: { userId: userId },
                data: { profileImage: relativePath },
            });

            res.status(200).json({
                message: 'Image uploaded successfully',
                path: relativePath,
            });
        } catch (err) {
            console.error('Error saving image:', err.message);
            res.status(500).json({ message: 'Error uploading image' });
        }
    }
);

app.post(
    '/upload-profile-picture',
    authLib.validateAuthorization,
    upload.single('profile_picture'),
    async (req, res) => {
        try {
            res.json({ message: 'Profile picture uploaded successfully' });
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            res.status(500).json({
                message: 'Error uploading profile picture',
            });
        }
    }
);

app.use('/uploads', express.static('uploads'));

app.post(
    '/crear-habito',
    authLib.validateAuthorization,
    validateRequestBody(['nombre', 'frequencia', 'categoria']),
    async (req, res) => {
        try {
            const { nombre, frequencia, categoria, prioridad = 'MEDIA', progreso = 0, objetivo = 1 } = req.body;
            const userId = req.userData.userId;

            const validPriorities = ['ALTA', 'MEDIA', 'BAJA'];
            const validFrequencies = ['DIARIA', 'SEMANAL', 'MENSUAL'];
            const validCategories = ['SALUD', 'DEPORTE', 'ESTUDIO', 'TRABAJO', 'OCIO', 'OTROS'];

            if (!validFrequencies.includes(frequencia)) {
                return res.status(400).json({ message: 'Invalid frequency value' });
            }
            if (!validCategories.includes(categoria)) {
                return res.status(400).json({ message: 'Invalid category value' });
            }
            if (!validPriorities.includes(prioridad)) {
                return res.status(400).json({ message: 'Invalid priority value' });
            }

            const newHabito = await prisma.habito.create({
                data: {
                    nombre,
                    frequencia,
                    categoria,
                    prioridad,
                    progreso,
                    objetivo,
                    userId,
                },
            });

            res.status(201).json({
                message: 'Habit created successfully',
                habito: newHabito,
            });
        } catch (err) {
            console.error('Error creating habit:', err.message);
            res.status(500).json({ message: 'Error creating habit' });
        }
    }
);

app.get(
    '/get-habitos',
    authLib.validateAuthorization,
    async (req, res) => {
        try {
            console.log('Fetching habits');
            const userId = req.userData.userId;

            const userHabits = await prisma.habito.findMany({
                where: { userId },
                select: {
                    habitoId: true,
                    nombre: true,
                    frequencia: true,
                    categoria: true,
                    completado: true,
                    prioridad: true,
                    progreso: true,
                    objetivo: true,
                    lastCompletionDate: true,
                },
            });

            res.status(200).json({
                message: 'Habits fetched successfully',
                habitos: userHabits,
            });
        } catch (err) {
            console.error('Error fetching habits:', err.message);
            res.status(500).json({
                message: 'Error fetching habits. Please try again later.',
            });
        }
    }
);

app.delete(
    '/delete-habito/:id',
    authLib.validateAuthorization,
    async (req, res) => {
        try {
            const habitId = parseInt(req.params.id, 10); // Get habit ID from the route params
            console.log(habitId);
            const userId = req.userData.userId; // Get user ID from the authorization middleware
            console.log(userId);

            const habit = await prisma.habito.findFirst({
                where: {
                    habitoId: habitId,
                    userId: userId,
                },
            });
            console.log('Deleting habit:', habit);
            if (!habit) {
                return res.status(404).json({
                    message:
                        'Habit not found or you do not have permission to delete it.',
                });
            }

            // Delete the habit
            await prisma.habito.delete({
                where: {
                    habitoId: habitId,
                },
            });

            res.status(200).json({ message: 'Habit deleted successfully' });
        } catch (error) {
            console.error('Error deleting habit:', error.message);
            res.status(500).json({ message: 'Error deleting habit' });
        }
    }
);

app.put(
    '/update-habito-completado/:id',
    authLib.validateAuthorization,
    async (req, res) => {
        try {
            const habitId = parseInt(req.params.id, 10);
            const { completado, progreso, objetivo } = req.body;
            const userId = req.userData.userId;

            const habit = await prisma.habito.findFirst({
                where: { habitoId: habitId, userId },
            });

            if (!habit) {
                return res.status(404).json({ message: 'Habit not found or unauthorized' });
            }

            const updatedHabit = await prisma.habito.update({
                where: { habitoId: habitId },
                data: {
                    completado,
                    progreso,
                    objetivo,
                    lastCompletionDate: completado ? new Date() : null,
                },
            });

            res.status(200).json({ message: 'Habit updated', habito: updatedHabit });
        } catch (err) {
            console.error('Error updating habit:', err.message);
            res.status(500).json({ message: 'Error updating habit' });
        }
    }
);

// Function to update 'completado' value to false based on frequency
const updateHabitosCompletado = async (frequencia) => {
    try {
        const result = await prisma.habito.updateMany({
            where: { frequencia },
            data: { completado: false },
        });
        console.log(
            `✅ ${result.count} hábitos de frecuencia "${frequencia}" fueron marcados como incompletos.`
        );
    } catch (err) {
        console.error(`❌ Error actualizando hábitos ${frequencia}:`, err.message);
    }
};

// Schedule jobs
schedule.scheduleJob('0 0 * * *', () => updateHabitosCompletado('DIARIA')); // Daily at midnight
schedule.scheduleJob('0 0 * * 0', () => updateHabitosCompletado('SEMANAL')); // Weekly on Sunday at midnight
schedule.scheduleJob('0 0 1 * *', () => updateHabitosCompletado('MENSUAL')); // Monthly on the 1st at midnight

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;
