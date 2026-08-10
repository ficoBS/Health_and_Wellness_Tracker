import express from 'express'
import protect from '../middleware/auth.js'
import pool from '../config/db.js';

const router = express.Router();

router.get("/today", protect, async (req, res) => {
    try {
        const log = await pool.query('SELECT * FROM logs WHERE user_id = $1 AND log_date = CURRENT_DATE', [req.user.id]);
        if (log.rows.length === 0) {
            console.log("USER: " + req.user.id);
            const newLog = await pool.query('INSERT INTO logs (user_id) VALUES ($1) RETURNING *', [req.user.id]);
            return res.status(200).json({data: newLog.rows[0]});
        }
        return res.status(201).json({data: log.rows[0]});
    } catch (error) {
        return res.status(500).json({message: "Could not get or create log"});
    }
})

router.post("/steps", protect, async (req, res) => {
    try {
        const {steps} = req.body;

        const log = await pool.query("UPDATE logs SET steps = $1 WHERE user_id = $2 AND log_date = CURRENT_DATE RETURNING *", [steps, req.user.id]);

        if (log.rows.length === 0) {
            return res.status(404).json({message: "Log does not exist."});
        }

        return res.status(201).json({data: log.rows[0]});

    } catch (error) {
        console.log("Could not update log" + error);
        return res.status(500).json({message: "Could not update log"});
    }
})

router.post("/water", protect, async (req, res) => {
    try {
        const {water_intake} = req.body;

        const log = await pool.query("UPDATE logs SET water_intake = $1 WHERE user_id = $2 AND log_date = CURRENT_DATE RETURNING *", [water_intake, req.user.id]);

        if (log.rows.length === 0) {
            return res.status(404).json({message: "Log does not exist."});
        }

        return res.status(201).json({data: log.rows[0]});

    } catch (error) {
        console.log("Could not update log" + error);
        return res.status(500).json({message: "Could not update log"});
    }
})

router.post("/calIntake", protect, async (req, res) => {
    try {
        const {cal_intake} = req.body;

        const log = await pool.query("UPDATE logs SET cal_intake = $1 WHERE user_id = $2 AND log_date = CURRENT_DATE RETURNING *", [cal_intake, req.user.id]);

        if (log.rows.length === 0) {
            return res.status(404).json({message: "Log does not exist."});
        }

        return res.status(201).json({data: log.rows[0]});

    } catch (error) {
        console.log("Could not update log" + error);
        return res.status(500).json({message: "Could not update log"});
    }
})

router.post("/calBurned", protect, async (req, res) => {
    try {
        const {cal_burned} = req.body;

        const log = await pool.query("UPDATE logs SET cal_burned = $1 WHERE user_id = $2 AND log_date = CURRENT_DATE RETURNING *", [cal_burned, req.user.id]);

        if (log.rows.length === 0) {
            return res.status(404).json({message: "Log does not exist."});
        }

        return res.status(201).json({data: log.rows[0]});

    } catch (error) {
        console.log("Could not update log" + error);
        return res.status(500).json({message: "Could not update log"});
    }
})

router.post("/sleep", protect, async (req, res) => {
    try {
        const {sleep_time} = req.body;

        const log = await pool.query("UPDATE logs SET sleep_time = $1 WHERE user_id = $2 AND log_date = CURRENT_DATE RETURNING *", [sleep_time, req.user.id]);

        if (log.rows.length === 0) {
            return res.status(404).json({message: "Log does not exist."});
        }

        return res.status(201).json({data: log.rows[0]});

    } catch (error) {
        console.log("Could not update log" + error);
        return res.status(500).json({message: "Could not update log"});
    }
})

router.post("/weight", protect, async (req, res) => {
    try {
        const {weight} = req.body;

        const log = await pool.query("UPDATE logs SET weight = $1 WHERE user_id = $2 AND log_date = CURRENT_DATE RETURNING *", [weight, req.user.id]);

        if (log.rows.length === 0) {
            return res.status(404).json({message: "Log does not exist."});
        }

        return res.status(201).json({data: log.rows[0]});

    } catch (error) {
        console.log("Could not update log" + error);
        return res.status(500).json({message: "Could not update log"});
    }
})

router.get("/stats", protect, async (req, res) => {
    const { period = "week", offset = 0 } = req.query;

    let startExpression;
    let endExpression;
    let chartQuery;

    if (period === "week") {

        startExpression = `
            DATE_TRUNC('week', CURRENT_DATE)
            + ($2 * INTERVAL '1 week')
        `;

        endExpression = `
            DATE_TRUNC('week', CURRENT_DATE)
            + (($2 + 1) * INTERVAL '1 week')
        `;

        chartQuery = `
            WITH days AS (
                SELECT generate_series(
                    ${startExpression},
                    ${endExpression} - INTERVAL '1 day',
                    INTERVAL '1 day'
                )::date AS date
            )

            SELECT
                TO_CHAR(days.date, 'FMDay') AS label,
                days.date,

                SUM(logs.cal_burned) AS calories_burned,
                SUM(logs.cal_intake) AS calories_intake,
                SUM(logs.sleep_time) / 60.0 AS sleep_time

            FROM days

            LEFT JOIN logs
                ON logs.log_date = days.date
                AND logs.user_id = $1

            GROUP BY days.date
            ORDER BY days.date;
        `;
    }

    else if (period === "month") {

        startExpression = `
            DATE_TRUNC('month', CURRENT_DATE)
            + ($2 * INTERVAL '1 month')
        `;

        endExpression = `
            DATE_TRUNC('month', CURRENT_DATE)
            + (($2 + 1) * INTERVAL '1 month')
        `;

        chartQuery = `
            WITH weeks AS (
                SELECT
                    generate_series(
                        ${startExpression},
                        ${endExpression} - INTERVAL '1 week',
                        INTERVAL '1 week'
                    )::date AS week_start
            )

            SELECT
                'Week ' ||
                ROW_NUMBER() OVER (ORDER BY weeks.week_start) AS label,

                weeks.week_start AS date,

                SUM(logs.cal_burned) AS calories_burned,
                SUM(logs.cal_intake) AS calories_intake,
                SUM(logs.sleep_time) / 60.0 AS sleep_time

            FROM weeks

            LEFT JOIN logs
                ON logs.log_date >= weeks.week_start
                AND logs.log_date < weeks.week_start + INTERVAL '1 week'
                AND logs.log_date >= ${startExpression}
                AND logs.log_date < ${endExpression}
                AND logs.user_id = $1

            GROUP BY weeks.week_start
            ORDER BY weeks.week_start;
        `;
    }

    else if (period === "year") {

        startExpression = `
            DATE_TRUNC('year', CURRENT_DATE)
            + ($2 * INTERVAL '1 year')
        `;

        endExpression = `
            DATE_TRUNC('year', CURRENT_DATE)
            + (($2 + 1) * INTERVAL '1 year')
        `;

        chartQuery = `
            WITH months AS (
                SELECT
                    generate_series(
                        ${startExpression},
                        ${endExpression} - INTERVAL '1 month',
                        INTERVAL '1 month'
                    )::date AS month_start
            )

            SELECT
                TO_CHAR(months.month_start, 'FMMonth') AS label,
                months.month_start AS date,

                SUM(logs.cal_burned) AS calories_burned,
                SUM(logs.cal_intake) AS calories_intake,
                SUM(logs.sleep_time) / 60.0 AS sleep_time

            FROM months

            LEFT JOIN logs
                ON logs.log_date >= months.month_start
                AND logs.log_date < months.month_start + INTERVAL '1 month'
                AND logs.user_id = $1

            GROUP BY months.month_start
            ORDER BY months.month_start;
        `;
    }

    else {
        return res.status(400).json({
            message: "Invalid period"
        });
    }

    try {

        // =========================
        // TOTALS
        // =========================

        const totals = await pool.query(
            `
            SELECT
                COALESCE(SUM(steps), 0) AS total_steps,
                COALESCE(SUM(water_intake), 0) AS total_water,
                COALESCE(SUM(cal_burned), 0) AS total_calories_burned,
                COALESCE(SUM(cal_intake), 0) AS total_calories_intake,
                COALESCE(SUM(sleep_time), 0) AS total_sleep_time

            FROM logs

            WHERE user_id = $1
              AND log_date >= ${startExpression}
              AND log_date < ${endExpression};
            `,
            [req.user.id, Number(offset)]
        );


        // =========================
        // CHART DATA
        // =========================

        const chart = await pool.query(
            chartQuery,
            [req.user.id, Number(offset)]
        );


        // =========================
        // RESPONSE
        // =========================

        return res.status(200).json({
            totals: totals.rows[0],
            chart: chart.rows
        });

    } catch (error) {

        console.error("STATS ERROR:", error);

        return res.status(500).json({
            message: "Can't get stats",
            error: error.message
        });
    }
});

export default router