import express, { json } from 'express'
import pool from '../config/db.js'
import protect from '../middleware/auth.js'

const router = express.Router();

router.get("/getAll", protect, async (req,  res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query("SELECT * FROM workouts WHERE user_id = $1;", [userId]);

        return res.status(200).json({workouts: result.rows})
    } catch (error) {
        console.log("Workouts error::::" + error)
        return res.status(500).json({message: "Could not fetch workouts"})
    }
})

router.get('/exercises', protect, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM exercises;");

        return res.status(200).json({exercises: result.rows});
    } catch (error) {
        return res.status(500).json({message: "Could not fetch exercises"});
        console.log("Exercises fetch error:::" + error);
    }
})

router.post("/add", protect, async (req, res) => {
    const { title, duration, description, exercises } = req.body;
    const userId = req.user.id;

    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Title is required' });
    }

    if (duration === undefined || isNaN(Number(duration))) {
        return res.status(400).json({ message: 'Duration must be a number' });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
        return res.status(400).json({ message: 'At least one exercise is required' });
    }

    for (const ex of exercises) {
        if (!ex.exerciseId || isNaN(Number(ex.exerciseId))) {
            return res.status(400).json({ message: 'Each exercise must have a valid exerciseId' });
        }
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const workoutResult = await client.query(
            `INSERT INTO workouts (title, user_id, duration, description)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [title.trim(), userId, Number(duration), description || null]
        );

        const workoutId = workoutResult.rows[0].id;

        const values = [];
        const placeholders = exercises.map((ex, i) => {
            const offset = i * 6; // <-- поправено: 6 колони по ред
            values.push(
                workoutId,
                Number(ex.exerciseId),
                ex.sets === null || ex.sets === undefined || ex.sets === '' ? null : Number(ex.sets),
                ex.reps === null || ex.reps === undefined || ex.reps === '' ? null : Number(ex.reps),
                ex.duration === null || ex.duration === undefined || ex.duration === '' ? null : Number(ex.duration),
                ex.assigned_place !== undefined ? Number(ex.assigned_place) : i + 1
            );
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
        }).join(', ');

        await client.query(
            `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, duration, assigned_place)
             VALUES ${placeholders}`,
            values
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Workout created successfully',
            workoutId
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating workout:', error);
        res.status(500).json({ message: 'Could not create workout' });
    } finally {
        client.release();
    }
})

router.get('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    if (isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid workout id' });
    }

    try {
        const workoutResult = await pool.query(
            `SELECT id, title, user_id, duration, description
             FROM workouts
             WHERE id = $1`,
            [id]
        );

        if (workoutResult.rows.length === 0) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        const workout = workoutResult.rows[0];

        if (workout.user_id !== userId) {
            return res.status(403).json({ message: 'You are not allowed to view this workout' });
        }

        const exercisesResult = await pool.query(
            `SELECT we.id, we.sets, we.reps, we.duration, we.assigned_place,
                    e.id AS exercise_id, e.name, e.category, e.exercise_type, e.equipment_needed, e.description
             FROM workout_exercises we
             JOIN exercises e ON e.id = we.exercise_id
             WHERE we.workout_id = $1
             ORDER BY we.assigned_place ASC`,
            [id]
        );

        res.json({
            workout,
            exercises: exercisesResult.rows
        });

    } catch (error) {
        console.error('Error fetching workout:', error);
        res.status(500).json({ message: 'Could not fetch workout' });
    }
});

export default router