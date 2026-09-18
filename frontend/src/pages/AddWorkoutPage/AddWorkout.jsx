import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './AddWorkout.css'

const TIME_BASED_CATEGORIES = ['Conditioning', 'Cardio', 'Endurance', 'Recovery'];

const AddWorkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [workoutForm, setWorkoutForm] = useState({
        title: "",
        duration: 0,
        description: ""
    });
    const [addedExercises, setAddedExercises] = useState([{
        exerciseId: "",
        sets: "",
        reps: "",
        duration: "",
        assigned_place: ""
    }]);
    const [l1, setL1] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchExercises = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/workouts/exercises", { withCredentials: true });
            setExercises(result.data.exercises);
        } catch (error) {
            console.log("Could not fetch exercises:::" + error);
            setExercises([]);
        } finally {
            setL1(false);
        }
    }

    useEffect(() => {
        fetchExercises();
    }, []);

    const handleWorkoutFormChange = (field, value) => {
        setWorkoutForm({ ...workoutForm, [field]: value });
    }

    // проверка дали избраната вежба спаѓа во категориите каде се внесува само времетраење
    const isTimeBased = (exerciseId) => {
        const exercise = exercises.find((ex) => String(ex.id) === String(exerciseId));
        if (!exercise) return false;
        return TIME_BASED_CATEGORIES.includes(exercise.category);
    }

    const handleExerciseRowChange = (index, field, value) => {
        const updated = addedExercises.map((row, i) => {
            if (i !== index) return row;

            const newRow = { ...row, [field]: value };

            // ако се менува exerciseId, исчисти ги полињата кои не се релевантни за новата категорија
            if (field === 'exerciseId') {
                if (isTimeBased(value)) {
                    newRow.sets = "";
                    newRow.reps = "";
                } else {
                    newRow.duration = "";
                }
            }

            return newRow;
        });
        setAddedExercises(updated);
    }

    const addExerciseRow = () => {
        setAddedExercises([...addedExercises, {
            exerciseId: "",
            sets: "",
            reps: "",
            duration: "",
            assigned_place: ""
        }]);
    }

    const removeExerciseRow = (index) => {
        if (addedExercises.length === 1) return;
        setAddedExercises(addedExercises.filter((_, i) => i !== index));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!workoutForm.title.trim()) {
            setError("Please enter a workout title.");
            return;
        }

        const validExercises = addedExercises.filter((row) => row.exerciseId);

        if (validExercises.length === 0) {
            setError("Please select at least one exercise.");
            return;
        }

        const payload = {
            title: workoutForm.title,
            duration: Number(workoutForm.duration) || 0,
            description: workoutForm.description,
            exercises: validExercises.map((row, index) => ({
                exerciseId: Number(row.exerciseId),
                sets: row.sets === "" ? null : Number(row.sets),
                reps: row.reps === "" ? null : Number(row.reps),
                duration: row.duration === "" ? null : Number(row.duration),
                assigned_place: index + 1
            }))
        };

        setSubmitting(true);
        try {
            await axios.post("http://localhost:5000/api/workouts/add", payload, { withCredentials: true });
            navigate('/workouts');
        } catch (error) {
            console.log("Could not create workout:::" + error);
            setError("Something went wrong while creating the workout. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (l1) {
        return <div>Loading...</div>
    }

    return (
        <main>
            <form onSubmit={handleSubmit}>
                <div id='addWorkoutHeader'>
                    <input
                        type='text'
                        placeholder='Enter workout title'
                        value={workoutForm.title}
                        onChange={(e) => handleWorkoutFormChange('title', e.target.value)}
                    />
                    <input
                        type='number'
                        placeholder='Duration (min)'
                        value={workoutForm.duration}
                        onChange={(e) => handleWorkoutFormChange('duration', e.target.value)}
                    />
                    <textarea
                        placeholder='Workout description'
                        value={workoutForm.description}
                        onChange={(e) => handleWorkoutFormChange('description', e.target.value)}
                    />
                </div>

                <fieldset className='exercisesFieldset'>
                    <legend>Add exercises</legend>
                    <div>
                        <span>Select exercise</span>
                        <span>Sets / Reps</span>
                        <span>Time /min</span>
                    </div>
                    {addedExercises.map((row, index) => {
                        const timeBased = isTimeBased(row.exerciseId);

                        return (
                            <div className='exercisesFieldsetItem' key={index}>
                                <select
                                    className='exercisesSelect'
                                    value={row.exerciseId}
                                    onChange={(e) => handleExerciseRowChange(index, 'exerciseId', e.target.value)}
                                >
                                    <option value="">-- Select --</option>
                                    {exercises.map((exercise) => (
                                        <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                                    ))}
                                </select>

                                {row.exerciseId === "" ? (
                                    <>
                                        <input type='number' disabled placeholder='sets' />
                                        <span> / </span>
                                        <input type='number' disabled placeholder='reps' />
                                        <input type='number' disabled placeholder='time' />
                                    </>
                                ) : timeBased ? (
                                    <>
                                        <input type='number' disabled placeholder='-' />
                                        <span> / </span>
                                        <input type='number' disabled placeholder='-' />
                                        <input
                                            type='number'
                                            min="0"
                                            placeholder='min'
                                            value={row.duration}
                                            onChange={(e) => handleExerciseRowChange(index, 'duration', e.target.value)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type='number'
                                            min="0"
                                            placeholder='sets'
                                            value={row.sets}
                                            onChange={(e) => handleExerciseRowChange(index, 'sets', e.target.value)}
                                        />
                                        <span> / </span>
                                        <input
                                            type='number'
                                            min="0"
                                            placeholder='reps'
                                            value={row.reps}
                                            onChange={(e) => handleExerciseRowChange(index, 'reps', e.target.value)}
                                        />
                                        <input type='number' disabled placeholder='-' />
                                    </>
                                )}

                                <button
                                    type='button'
                                    onClick={() => removeExerciseRow(index)}
                                    disabled={addedExercises.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        );
                    })}

                    <button type='button' onClick={addExerciseRow}>+</button>
                </fieldset>

                {error && <div className='formError'>{error}</div>}

                <button type='submit' disabled={submitting}>
                    {submitting ? 'Saving...' : 'Create workout'}
                </button>
            </form>
        </main>
    )
}

export default AddWorkout