import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import axios from 'axios'
import './Dashboard.css'

const Dashboard = () => {
    const {user} = useAuth();
    const [userLog, setUserLog] = useState(null);
    const [loading2, setLoading2] = useState(true);

    const fetchLog = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/logs/today", {withCredentials: true});
            setUserLog(result.data.data);
        } catch (error) { 
            console.log("Could not fetch log: " + error);
            setUserLog(null);
        } finally {
            setLoading2(false);
        }
    }



    useEffect(() => {
        fetchLog();
    }, [])

    if (loading2) {
        return <div className="loading-state">Loading your Dashboard...</div>
    }

    const changeSteps = async (mode) => {
        const value = Number(document.getElementById("stepsNumber").value);
        let sum;

        if (mode === "add") {
            sum = userLog.steps + value;
        }
        else {
            if (userLog.steps - value < 0) {
                sum = 0;
            }
            else {
                sum = userLog.steps - value;
            }
        }

        try {
            const result = await axios.post('http://localhost:5000/api/logs/steps', {steps: sum}, {withCredentials: true});
            fetchLog();
        } catch (error) {
            console.log("Could not change steps!  " + error);
        }
    }

    const changeWater = async (value) => {
        const sum = userLog.water_intake + value;

        try {
            const result = await axios.post('http://localhost:5000/api/logs/water', {water_intake: sum}, {withCredentials: true});
            fetchLog();
        } catch (error) {
            console.log("Could not change steps!  " + error);
        }
    }

    const changeCalories = async (mode) => {
        if (mode === "intake") {
            const value = Number(document.getElementById("calIntakeNumber").value);
            const sum = userLog.cal_intake + value;
            try {
                const result = await axios.post("http://localhost:5000/api/logs/calIntake", {cal_intake: sum}, {withCredentials: true});
                fetchLog();
            } catch (error) {
                console.log("Could not change calories intake.");
            }
        }
        else {
            const value = Number(document.getElementById("calBurnedNumber").value);
            const sum = userLog.cal_burned + value;
            try {
                const result = await axios.post("http://localhost:5000/api/logs/calBurned", {cal_burned: sum}, {withCredentials: true});
                fetchLog();
            } catch (error) {
                console.log("Could not change calories burned.");
            }
        }

    }

    const changeSleep = async () => {
        const value = (Number(document.getElementById("hourInput").value) * 60)  + Number(document.getElementById("minuteInput").value);
        const sum = userLog.sleep_time + value;

        try {
                const result = await axios.post("http://localhost:5000/api/logs/sleep", {sleep_time: sum}, {withCredentials: true});
                fetchLog();
            } catch (error) {
                console.log("Could not change sleep time.");
            }
    }

    const changeWeight = async () => {
        const value = Number(document.getElementById("weightInput").value);

        try {
                const result = await axios.post("http://localhost:5000/api/logs/weight", {weight: value}, {withCredentials: true});
                fetchLog();
            } catch (error) {
                console.log("Could not change weight.");
            }
    }

    return (
        <main className="page dashboard-page">
            <div id='cards' className="metric-grid">
                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Steps</span>
                        </div>
                        <div>
                            {(userLog.steps / user.goal_steps) * 100 >= 100 ? 100 : (userLog.steps / user.goal_steps) * 100}%
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{userLog.steps}</span>
                        <span>/{user.goal_steps}</span>
                    </div>
                    <div className='progressBar'>
                        <div className='progressFill' style={{width: `${Math.min(Math.floor((userLog.steps / user.goal_steps) * 100), 100)}%`}} />
                    </div>
                    <div id='dataInputSteps'>
                        <div id='removeSteps' className="btn-icon danger" onClick={() => changeSteps("remove")}>-</div>
                        <input id='stepsNumber' type='number' placeholder='Enter steps' />
                        <div id='addSteps' className="btn-icon success" onClick={() => changeSteps("add")}>+</div>
                    </div>
                </div>

                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Water Intake</span>
                        </div>
                        <div>
                            {(userLog.water_intake / user.goal_water_intake) * 100 >= 100 ? 100 : (userLog.water_intake / user.goal_water_intake) * 100}%
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{userLog.water_intake / 1000}L</span>
                        <span>/{user.goal_water_intake / 1000}L</span>
                    </div>
                    <div className='progressBar'>
                        <div className='progressFill' style={{width: `${Math.min(Math.floor((userLog.water_intake / user.goal_water_intake) * 100), 100)}%`}} />
                    </div>
                    <div id='dataInputWater'>
                        <button id='addWaterGlass' className="btn btn-secondary" onClick={() => changeWater(250)}>+250ml</button>
                        <button id='addWaterBottle' className="btn btn-secondary" onClick={() => changeWater(500)}>+500ml</button>
                    </div>
                </div>

                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Calories Intake</span>
                        </div>
                        <div>
                            {(userLog.cal_intake / user.goal_cal_intake) * 100 >= 100 ? 100 : (userLog.cal_intake / user.goal_cal_intake) * 100}%
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{userLog.cal_intake}</span>
                        <span>/{user.goal_cal_intake}</span>
                    </div>
                    <div className='progressBar'>
                        <div className='progressFill' style={{width: `${Math.min(Math.floor((userLog.cal_intake / user.goal_cal_intake) * 100), 100)}%`}} />
                    </div>
                    <div id='dataInputCalories'>
                        <input type='number' id='calIntakeNumber' />
                        <button id='addCalories' className="btn btn-primary btn-sm" onClick={() => changeCalories("intake")}>Add</button>
                    </div>
                </div>

                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Calories Burned</span>
                        </div>
                        <div>
                            {(userLog.cal_burned / user.goal_cal_burned) * 100 >= 100 ? 100 : (userLog.cal_burned/ user.goal_cal_burned) * 100}%
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{userLog.cal_burned}</span>
                        <span>/{user.goal_cal_burned}</span>
                    </div>
                    <div className='progressBar'>
                        <div className='progressFill' style={{width: `${Math.min(Math.floor((userLog.cal_burned / user.goal_cal_burned) * 100), 100)}%`}} />
                    </div>
                    <div id='dataInputCalories'>
                        <input type='number' id='calBurnedNumber' />
                        <button id='addCalories' className="btn btn-primary btn-sm" onClick={() => changeCalories("burned")}>Add</button>
                    </div>
                </div>

                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Sleep</span>
                        </div>
                        <div>
                            {(userLog.sleep_time / user.goal_sleep_time) * 100 >= 100 ? 100 : (userLog.sleep_time/ user.goal_sleep_time) * 100}%
                        </div>
                    </div>
                    <div className='cardNumbers'>
                        <span>{userLog.sleep_time / 60 < 1 ? "" : Math.floor(userLog.sleep_time / 60) + "h"} {userLog.sleep_time % 60 < 1 ? "" : userLog.sleep_time % 60 + "m"} {userLog.sleep_time % 60 < 1 && userLog.sleep_time / 60 < 1 ? "0m" : ""}</span>
                        <span>/{user.goal_sleep_time / 60 < 1 ? "" : Math.floor(user.goal_sleep_time) / 60 + "h"} {user.goal_sleep_time % 60 < 1 ? "" : user.goal_sleep_time % 60 + "m"} {user.goal_sleep_time % 60 < 1 && user.goal_sleep_time / 60 < 1 ? "0m" : ""}</span>
                    </div>
                    <div className='progressBar'>
                        <div className='progressFill' style={{width: `${Math.min(Math.floor((userLog.sleep_time / user.goal_sleep_time) * 100), 100)}%`}} />
                    </div>
                    <div id='dataInputSleep'>
                        <input type='number' id='hourInput' placeholder='Hour' />
                        <input type='number' id='minuteInput' placeholder='Monute' />
                        <button className="btn btn-primary btn-sm" onClick={() => changeSleep()}>Add</button>
                    </div>
                </div>

                <div className='card'>
                    <div className='cardHeader'>
                        <div>
                            <span>Enter todays weight</span>
                        </div>
                    </div>
                    <div className="cardNumbers">
                        {userLog.weight}
                    </div>
                    <div id='dataInputWeight'>
                        <input type='number' id='weightInput' />
                        <button className="btn btn-primary btn-sm" onClick={() => changeWeight()}>{userLog.weight == 0 ? "Add" : "Change"}</button>
                    </div>
                </div>

            </div>

            <div id='chatBox' className="card">
                <span>Want to talk to your ai coach</span>
                <button className="btn btn-primary">Chat now</button>
            </div>

            



        </main>
    )
}

export default Dashboard