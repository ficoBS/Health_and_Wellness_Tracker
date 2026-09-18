import express from "express";
import protect from "../middleware/auth.js";
import deepseek from "../config/deepseek.js"
import pool from "../config/db.js"

const router = express.Router();

router.post("/coach", protect, async (req, res) => {
    try {
        const {message, aiChatId} = req.body;

        if (!message || !aiChatId) {
            return res.status(500).json({message: "Missing content or aiChatId"});
        }

        const userMessage = await pool.query("INSERT INTO ai_messages (ai_chat_id, content, role) VALUES ($1, $2, $3) RETURNING *;", [aiChatId, message, "user"]);

        const response = await deepseek.chat.completions.create({
            model: "gemini-3.6-flash",

            messages: [
                {
                    role: "system",
                    content: `
You are an AI health and wellness coach.

Your job is to help users with:
- fitness
- exercise
- nutrition
- hydration
- healthy habits
- sleep
- general wellness

Give practical and easy-to-understand advice.

Do not diagnose diseases or replace a doctor.
If a user describes a serious medical problem, recommend
consulting a qualified healthcare professional.

Keep answers concise and friendly.
`
                },
                {
                    role: "user",
                    content: message
                }
            ],

            stream: false
        });

        const answer = response.choices[0].message.content;

        const aiAnswer = await pool.query("INSERT INTO ai_messages (ai_chat_id, content, role) VALUES ($1, $2, $3) RETURNING *;", [aiChatId, answer, "ai"]);

        return res.status(200).json({answer: aiAnswer.rows[0], message: userMessage.rows[0]});
    } catch (error) {
        console.error("AI COACH ERROR:::", error?.response?.data || error?.message || error);
        return res.status(500).json({message: "Could not get answer from ai"});
        // return res.status(500).json({message: "Could not get answer from ai"});
    }
})

export default router