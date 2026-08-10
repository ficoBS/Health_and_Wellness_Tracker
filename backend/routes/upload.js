import upload from '../middleware/upload.js'
import express from 'express'

const router = express.Router();

router.post("/profile_image", upload.single("image"), async (req, res) => {
    res.json({ url: req.file.path })
})


export default router