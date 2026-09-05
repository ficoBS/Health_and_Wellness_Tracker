import express from 'express'
import protect from '../middleware/auth.js'
import pool from '../config/db.js';
import coachUpload from '../middleware/coachUpload.js'

const router = express.Router();

router.post("/apply", protect, coachUpload.array("documents", 10), async (req, res) => {
    try {
        const {biography, experienceYears, title, specializations} = req.body;
        const userId = req.user.id;

        const applicationResult = await pool.query("INSERT INTO coach_applications (user_id, biography, experience_years, title, specializations, reviewed_at) VALUES ($1, $2, $3, $4, $5, NULL) RETURNING id", [userId, biography, experienceYears, title, specializations]);

        const applicationId = applicationResult.rows[0].id;

        for (const file of req.files) {
            await pool.query("INSERT INTO coach_images (image, coach_application_id) VALUES ($1, $2)", [file.path, applicationId]);
        }

        res.status(201).json({applicationId: applicationId})
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

router.post("/cancelApply", protect, async (req, res) => {
    try {
        const {appId} = req.body;

        const resultImages = await pool.query("DELETE FROM coach_images WHERE coach_application_id = $1", [appId]);
        const result = await pool.query("DELETE FROM coach_applications WHERE id = $1;", [appId]);

        return res.status(200).json({message: "Delete succesfull"});
    } catch (error) {
        return res.status(500).json({message: "Could not delete coach_application"});
    }
})

router.get("/apply/me", protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const activeApp = await pool.query("SELECT * FROM coach_applications WHERE user_id = $1 AND status = $2;", [userId, "pending"]);

        if (activeApp.rows.length === 0) {
            return res.status(500).json({application: null});
        }

        const images = await pool.query("SELECT * FROM coach_images WHERE coach_application_id = $1", [activeApp.rows[0].id]);

        if (images.rows.length === 0) {
            return res.status(500).json({message: "Could not get images for application"});
        }

        return res.status(200).json({application: activeApp.rows[0], images: images.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not get application"});
    }
})

router.get("/getAll", protect, async (req, res) => {
    try {
        const result = await pool.query("SELECT id, image, first_name, last_name FROM users WHERE role = $1", ["coach"]);

        return res.status(200).json({coaches: result.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not get coaches"});
    }
})

router.get("/applications", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM coach_applications WHERE status = $1", ["pending"]);

        return res.status(200).json({applications: result.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not get applications"});
    }
})

router.get("/application/:applicationId", protect, async (req, res) => {
    try {
        const {applicationId} = req.params;
        const result = await pool.query("SELECT * FROM coach_applications WHERE id = $1", [applicationId]);

        if (result.rows.length === 0) {
            return res.status(500).json({message: "Application does not exist"});
        }

        const images = await pool.query("SELECT * FROM coach_images WHERE coach_application_id = $1", [result.rows[0].id]);

        return res.status(200).json({application: result.rows[0], images: images.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not get application"});
    }
})

router.post("/hire", protect, async (req, res) => {
    const {userId, biography, experienceYears, title, specializations} = req.body;

    try {
        const result = await pool.query("UPDATE users SET role = $1 WHERE id = $2", ["coach", userId]);
        const result2 = await pool.query("UPDATE coach_applications SET status = $1, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = $2", ["approved", userId]);
        const result3 = await pool.query("INSERT INTO coaches (user_id, biography, experience_years, title, specializations) VALUES ($1, $2, $3, $4, $5)", [userId, biography, experienceYears, title, specializations]);

        return res.status(200).json({message: "Coach hired successfully"});
    } catch (error) {
        return res.status(500).json({message: "Could not hire coach"});
    }
})

router.post("/reject", protect, async (req, res) => {
    const {userId} = req.body;
    
    try {
        const result = await pool.query("UPDATE coach_applications SET status = $1, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = $2", ["rejected", userId]);

        return res.status(200).json({message: "Coach rejected successfully"});
    } catch (error) {
        return res.status(500).json({message: "Could not reject coach"});
    }
})

router.post("/fire", protect, async (req, res) => {
    const {userId} = req.body;

    try {
        const result = await pool.query("UPDATE users SET role = $1 WHERE id = $2", ["user", userId]);
        const result2 = await pool.query("DELETE FROM coaches WHERE user_id = $1", [userId]);

        return res.status(200).json({message: "Coach fired successfully"});
    } catch (error) {
        return res.status(500).json({message: "Could not fire coach"});
    }
})


export default router