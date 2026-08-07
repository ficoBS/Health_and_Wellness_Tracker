import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
    
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await pool.query('SELECT id, email, role, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, weight, height, goal_steps, goal_cal_intake, goal_cal_burned, goal_water_intake, goal_sleep_time, goal_weight, created_at FROM users WHERE id = $1', [decoded.id]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.user = user.rows[0];
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(401).json({ message: 'Not authorized' });
    }
}

export default protect;