import express from 'express'
import protect from '../middleware/auth.js'
import pool from '../config/db.js';

const router = express.Router();

router.get("/:userId", async (req, res) => {
    try {
        const {userId} = req.params;

        const user = await pool.query("SELECT id, email, role, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, weight, height, goal_steps, goal_cal_intake, goal_cal_burned, goal_water_intake, goal_sleep_time, goal_weight, created_at FROM users WHERE id = $1", [userId]);

        if (user.rows.length <= 0) {
            return res.status(500).json({message: "User does not exist!"});
        }

        return res.status(200).json({user: user.rows[0]});
    } catch (error) {
        return res.status(500).json({message: "Could not fetch other user by id!"});
    }
})

router.get("/coaches", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, email, role, first_name, last_name, date_of_birth, phone_number, gender, country, city, image, created_at FROM users WHERE role = 'coach'");

        if (result.rows.length <= 0) {
            return res.status(200).json({coaches: []});
        }

        return res.status(200).json({coaches: result.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not fetch coaches!"});
    }
})

router.get("/chats/:coachId", protect, async (req, res) => {
    try {
        const {coachId} = req.params;
        const result = await pool.query("SELECT DISTINCT ON (c.user_id) u.id, u.first_name, u.last_name, u.image AS last_message_at FROM chats c JOIN users u ON u.id = c.user_id WHERE c.coach_id = $1 ORDER BY c.user_id, c.created_at DESC;", [coachId]);

        if (result.rows.length <= 0) {
            return res.status(200).json({users: []});
        }

        return res.status(200).json({users: result.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not fetch users!"});
    }
})


export default router