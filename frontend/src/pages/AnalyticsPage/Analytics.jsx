import axios from 'axios'
import { useState, useEffect } from 'react'
import './Analytics.css'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const Analytics = () => {
    const [logs, setLogs] = useState(null);
    const [loading2, setLoading2] = useState(true);
    const [period, setPeriod] = useState("week");
    const [offset, setOffset] = useState(0);

    const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
    ];
  
    const chartData = logs?.chart?.map(log => ({
        ...log,
        calories_burned:
            log.calories_burned === null
                ? null
                : Number(log.calories_burned),

        calories_intake:
            log.calories_intake === null
                ? null
                : Number(log.calories_intake),
        
        sleep_time:
            log.sleep_time === null
                ? null
                : Number(log.sleep_time)
    })) || [];

    const nextPeriod = () => {
        if (offset + 1 <= 0) {
            setOffset(offset + 1);
        }
    }

    const previousPeriod = () => {
        setOffset(offset - 1);
    }

    const fetchLogs = async () => {
        try {
            const result = await axios.get(`http://localhost:5000/api/logs/stats?period=${period}&offset=${offset}`, {withCredentials: true});
            setLogs(result.data);
        } catch (error) {
            console.log("Can't get logs: " + error);
        } finally {
            setLoading2(false);
        }
    }

    useEffect(() => {
        fetchLogs();
    }, [period, offset])

    useEffect(() => {
        if (!logs?.chart?.length) return;

        let text = "";

        if (period === "week") {
            const start = logs.chart[0].date.substring(0, 10).split("-");
            const end = logs.chart[logs.chart.length - 1].date.substring(0, 10).split("-");

            text = `${start[2]}/${start[1]}/${start[0]} - ${end[2]}/${end[1]}/${end[0]}`;
        } 
        else if (period === "month") {
            const month = logs.chart[1].date.substring(5, 7);
            text = months[Number(month) - 1];
        } 
        else {
            text = logs.chart[1].date.substring(0, 4);
        }

        document.querySelector("#dateInfo").innerHTML = text;
    }, [logs, period]);

    console.log(logs);

    if (loading2) {
        return <div>Loading your stats</div>
    }

 
    return (
        <main>
            <div>
                <button onClick={() => {setPeriod("week"); setOffset(0);}}>Week</button>
                <button onClick={() => {setPeriod("month"); setOffset(0);}}>Month</button>
                <button onClick={() => {setPeriod("year"); setOffset(0);}}>Year</button>
            </div>

            <div>
                <button onClick={() => previousPeriod()}>Left</button>
                <span id='dateInfo'></span>
                <button onClick={() => nextPeriod()}>Next</button>
            </div>

            <div id='cards'>
                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Steps</span>
                        </div>
                        <div>
                            OO
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{logs.totals.total_steps}</span>
                    </div>
                    <div className='smallText'>
                        Total steps this {period}
                    </div>
                </div>

                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Cal burned</span>
                        </div>
                        <div>
                            OO
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{logs.totals.total_calories_burned}</span>
                    </div>
                    <div className='smallText'>
                        Total Kcal burned this {period}
                    </div>
                </div>

                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Water intake</span>
                        </div>
                        <div>
                            OO
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{logs.totals.total_water_intake}</span>
                    </div>
                    <div className='smallText'>
                        Total water drinked this {period}
                    </div>
                </div>

                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Sleep time</span>
                        </div>
                        <div>
                            OO
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{logs.totals.total_sleep_time}</span>
                    </div>
                    <div className='smallText'>
                        Total sleep time this {period}
                    </div>
                </div>

                <div className="chartContainer">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 20,
                                left: 0,
                                bottom: 10
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="label"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="calories_burned"
                                name="Calories burned"
                                stroke="#ff6b6b"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                connectNulls={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="calories_intake"
                                name="Calories intake"
                                stroke="#4dabf7"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                connectNulls={false}
                            />

                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chartContainer sleepChart">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 20,
                                left: 10,
                                bottom: 10
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="label" />

                            <YAxis
                                domain={[0, 12]}
                                label={{
                                    value: "Hours",
                                    angle: -90,
                                    position: "insideLeft"
                                }}
                            />

                            <Tooltip />

                            <Bar
                                dataKey="sleep_time"
                                name="Sleep"
                                fill="#8b5cf6"
                                radius={[5, 5, 0, 0]}
                            />

                        </BarChart>
                    </ResponsiveContainer>
                </div>
                            
            </div>
        </main>
    )
}

export default Analytics