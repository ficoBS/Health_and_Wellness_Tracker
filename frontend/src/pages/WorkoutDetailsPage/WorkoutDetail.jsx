import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './WorkoutDetail.css'

const WorkoutDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workout, setWorkout] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWorkout = async () => {
        try {
            const result = await axios.get(`http://localhost:5000/api/workouts/${id}`, { withCredentials: true });
            setWorkout(result.data.workout);
            setExercises(result.data.exercises);
        } catch (error) {
            console.log("Could not fetch workout:::" + error);
            setError("Could not load this workout.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWorkout();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return (
            <main>
                <div className='errorMessage'>{error}</div>
                <button onClick={() => navigate('/workouts')}>Back to workouts</button>
            </main>
        )
    }

    if (!workout) {
        return (
            <main>
                <div className='errorMessage'>Workout not found.</div>
                <button onClick={() => navigate('/workouts')}>Back to workouts</button>
            </main>
        )
    }

    return (
        <main>
            <div id='workoutDetailHeader'>
                <h1>{workout.title}</h1>
                <p className='workoutDuration'>{workout.duration} min</p>
                {workout.description && <p className='workoutDescription'>{workout.description}</p>}
            </div>

            <section className='workoutExercisesList'>
                <h2>Exercises</h2>

                {exercises.length === 0 ? (
                    <p>No exercises added to this workout.</p>
                ) : (
                    <table className='exercisesTable'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Equipment</th>
                                <th>Sets / Reps</th>
                                <th>Time /min</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exercises
                                .slice()
                                .sort((a, b) => a.assigned_place - b.assigned_place)
                                .map((exercise) => (
                                    <tr key={exercise.id}>
                                        <td>{exercise.assigned_place}</td>
                                        <td>{exercise.name}</td>
                                        <td>{exercise.category}</td>
                                        <td>{exercise.exercise_type}</td>
                                        <td>{exercise.equipment_needed || '-'}</td>
                                        <td>
                                            {exercise.sets !== null && exercise.reps !== null
                                                ? `${exercise.sets} / ${exercise.reps}`
                                                : '-'}
                                        </td>
                                        <td>
                                            {exercise.duration !== null ? exercise.duration : '-'}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    )
}

export default WorkoutDetail