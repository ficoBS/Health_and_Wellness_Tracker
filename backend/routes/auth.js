import pool from '../config/db.js';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import protect from '../middleware/auth.js';

const router = express.Router();

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '10d',
    });
};

router.post('/register', async (req, res) => {
    const { email, password, password2, firstName, lastName, dateOfBirth, phone, gender, country, city, image, weight, height } = req.body;

    if (!email || !password || !password2 || !firstName || !lastName || !dateOfBirth || !phone || !country || !city || !weight || !height) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== password2) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const hasUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (hasUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, weight, height) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, email, role, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, weight, height, goal_steps, goal_cal_intake, goal_cal_burned, goal_water_intake, goal_sleep_time, goal_weight, created_at',
            [email, hashedPassword, firstName, lastName, dateOfBirth, phone, gender, country, city, image, weight, height])

        const token = generateToken(newUser.rows[0].id);
        res.cookie('token', token, cookieOptions);

        return res.status(201).json({ user: newUser.rows[0] });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await pool.query('SELECT id, password_hash FROM users WHERE email = $1;', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const userData = await pool.query('SELECT id, email, role, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, weight, height, goal_steps, goal_cal_intake, goal_cal_burned, goal_water_intake, goal_sleep_time, goal_weight, created_at FROM users WHERE id = $1', [user.rows[0].id]);

        const token = generateToken(userData.rows[0].id);
        res.cookie('token', token, cookieOptions);

        return res.status(200).json({ user: userData.rows[0] });
    } catch (error) {
        console.error('Error logging in user:', error);
        return es.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json(req.user);
})

router.post('/logout', (req, res) => {
    res.clearCookie('token', { ...cookieOptions, maxAge: 1 });
    res.json({ message: 'User logged out successfully' });
});

router.post('/changeInfo', protect, async (req, res) => {
    const {userId, firstName, lastName, phone, country, city, weight, height, password, password2} = req.body;

    if (password === password2 && password === '') {
        try {
            const result = await pool.query("UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, country = $4, city = $5, weight = $6, height = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING id, email, role, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, weight, height, goal_steps, goal_cal_intake, goal_cal_burned, goal_water_intake, goal_sleep_time, goal_weight, created_at", [firstName, lastName, phone, country, city, weight, height, userId]);
            return res.status(200).json({ user: result.rows[0] });
        } catch {
            return res.status(500).json({message: "Can't change user info1"});
        }
    }
    else {
        if (password !== password2) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        try {
            const result = await pool.query("UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, country = $4, city = $5, weight = $6, height = $7, updated_at = CURRENT_TIMESTAMP, password_hash = $9 WHERE id = $8 RETURNING id, email, role, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, weight, height, goal_steps, goal_cal_intake, goal_cal_burned, goal_water_intake, goal_sleep_time, goal_weight, created_at;", [firstName, lastName, phone, country, city, weight, height, userId, passwordHash]);

            return res.status(200).json({ user: result.rows[0] });
        } catch {
            return res.status(500).json({message: "Can't change user info2"});
        }
    }
})

router.post('/changeImage', protect, async (req, res) => {
    const {userId, image} = req.body;

    try {
        const result = await pool.query("UPDATE users SET image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, role, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, weight, height, goal_steps, goal_cal_intake, goal_cal_burned, goal_water_intake, goal_sleep_time, goal_weight, created_at;", [image, userId]);

        return res.status(200).json({ user: result.rows[0] });
    } catch {
            return res.status(500).json({message: "Can't change user info2"});
    }
})

export default router;