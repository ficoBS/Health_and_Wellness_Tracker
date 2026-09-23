import express from 'express'
import protect from '../middleware/auth.js'
import pool from '../config/db.js';

const router = express.Router();

router.get("/getAll", protect, async (req, res) => {
    try {
        const userId = req.user.id;

        if (req.user.role === "coach") {
            const result = await pool.query("SELECT * FROM chats WHERE coach_id = $1", [userId]);
            return res.status(200).json({chats: result.rows});
        }

        const result = await pool.query("SELECT * FROM chats WHERE user_id = $1", [userId]);
        return res.status(200).json({chats: result.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not get chats"});
    }
})

router.post("/start", protect, async (req, res) => {
    try {
        const {user_id, coach_id} = req.body;

        const result = await pool.query("INSERT INTO chats (user_id, coach_id) VALUES ($1, $2) RETURNING *", [user_id, coach_id]);
        return res.status(201).json({chat: result.rows[0]});
    } catch (error) {
        return res.status(500).json({message: "Could not start chat"});
    }
})

router.get("/get/:chatId", protect, async (req, res) => {
    try {
        const {chatId} = req.params;

        const result = await pool.query("SELECT * FROM chats WHERE id = $1;", [chatId]);
        return res.status(200).json({chat: result.rows[0]});
    } catch (error) {
        return res.status(500).json({message: "Could not get chat"});
    }
})

router.get("/messages/get/:chatId", protect, async (req, res) => {
    try {
        const {chatId} = req.params;

        const result = await pool.query("SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC;", [chatId]);
        return res.status(200).json({messages: result.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not get messages"});
    }
})

router.post("/messages/send", protect, async (req, res) => {
    try {
        const {chatId, senderId, content} = req.body;

        const result = await pool.query("INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *;", [chatId, senderId, content]);
        return res.status(200).json({message: result.rows[0]});
    } catch (error) {
        return res.status(500).json({message: "Could not send message"});
    }
})

router.get("/ai/getAll", protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query("SELECT * FROM ai_chats WHERE user_id = $1;", [userId]);

        if (result.rows.length === 0) {
            const result2 = await pool.query("INSERT INTO ai_chats (user_id, title) VALUES ($1, $2) RETURNING *;", [userId, "ai message"]);
            return res.status(200).json({chat: result2.rows[0]});
        }

        return res.status(200).json({chat: result.rows[0]});
    } catch (error) {
        return res.status(500).json({message: "Could not get or create chat"});
    }
})

router.get("/ai/messages/:chatId", protect, async (req, res) => {
    try {
        const {chatId} = req.params;

        const result = await pool.query("SELECT * FROM ai_messages WHERE ai_chat_id = $1 ORDER BY created_at ASC;", [chatId]);
        if (result.rows.length === 0) {
            return res.status(200).json({messages: []});
        }

        return res.status(200).json({messages: result.rows});
    } catch (error) {
        console.error("Message ERROR:::", error?.response?.data || error?.message || error);
        return res.status(500).json({message: "Could not fetch ai messages"});
    }
})

export default router