import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

import './Train.css'

const Train = () => {
    const {user} = useAuth();
    const [workouts, setWorkouts] = useState([])
    const [l1, setL1] = useState(true);

    const navigate = useNavigate();

    const fetchWorkouts = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/workouts/getAll", {withCredentials: true});

            setWorkouts(result.data.workouts);
        } catch (error) {
            setWorkouts([]);
            console.log("Could not fetch workouts:::" + error);
        } finally {
            setL1(false);
        }
    }

    useEffect(() => {
        fetchWorkouts();
    }, [])

    if (l1) {
        return <div>Loading...</div>
    }

    console.log(workouts)
    return (
        <main>
            <div className='trainHeader'>
                <button onClick={() => navigate("/addWorkout")}>Add workout</button>
            </div>

            <div className='trainBody'>
                {!workouts ? <div>No workouts</div> : 
                workouts.map((workout) => (
                    <Link to={"/workouts/" + workout.id}>
                        <div className='trainBodyItem'>
                            <h3>{workout.title}</h3>
                            <p>Duration: {Math.floor(workout.duration / 60)}:{Math.floor(workout.duration % 60)}</p>
                            <p>{workout.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    )
}

export default Train