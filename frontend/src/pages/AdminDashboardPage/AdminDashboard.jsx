import { useAuth } from '../../hooks/useAuth'
import { use, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'
import './AdminDashboard.css'


const AdminDashboard = () => {
    const {user} = useAuth();
    const [applications, setApplications] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    if (user.role !== "admin") {
        navigate("/");
    }

    const fetchCoaches = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/coach/getAll", {withCredentials: true});
            setCoaches(result.data.coaches)
        } catch (error) {
            console.log("Could not fetch coaches:::" + error);
            setCoaches([]);
        }

    }

    // const fetchUsers = async () => {
    //     let sum = []
    //     applications.forEach(async (app) => {
    //         try {
    //             const result = await axios.get("http://localhost:5000/api/users/" + app.user_id, {withCredentials: true});
    //             sum.push(result.data.user);
    //         } catch (error) {
    //             console.log("Could not fetch application-user:::" + error);
    //         }
    //     })
    //     setUsers(sum);
    // }

    const fetchApplications = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/coach/applications", {withCredentials: true});
            setApplications(result.data.applications)
        } catch (error) {
            console.log("Could not fetch applications:::" + error);
            setApplications([]);
        }
    }

    const seeProfile = (id) => {
        navigate("/profile/" + id);
    }

    useEffect(() => {
        fetchCoaches();
        fetchApplications();
    }, [])

    // useEffect(() => {
    //     fetchUsers();
    // }, [applications])

    // useEffect(() => {
    //     const updateCoaches = () => {
    //         const list = document.getElementById("coachList");
    //         list.innerHTML = "";

    //         if (coaches.length === 0) {
    //             return;
    //         }

    //         for (let i=0; i < coaches.length; i++) {
    //             list.innerHTML += "<div className='coachListItem' name=" + coaches[i].id + "><img className='coachImage' src='"+coaches[i].image+"' alt='"+coaches[i].first_name+" "+coaches[i].last_name+"' />"+coaches[i].first_name+" "+coaches[i].last_name+"<div><a href='/profile/" + coaches[i].id + "'>View profile</a></div><div><button onClick="+ {() => Fire(coaches[i].id)} +">Fire</button></div></div>";
    //         }
    //     }

    //     updateCoaches();
    //     console.log(coaches);
    //     console.log(applications);
    //     console.log("Users: " + users);
    // }, [coaches])


    const Hire = async (id) => {
        const app = applications.find((app) => app.id === id);
        const form = {
            userId: app.user_id,
            biography: app.biography,
            experienceYears: app.experience_years,
            title: app.title,
            specializations: app.specializations,
        }

        try {
            const result = await axios.post("http://localhost:5000/api/coach/hire", form, {withCredentials: true});
        } catch (error) {
            console.log("Could not hire coach:::" + error);
        } finally {
            await fetchCoaches();
            await fetchApplications();
        }

    }

    const Reject = async (id) => {
        const app = applications.find((app) => app.id === id);

        try {
            const result = await axios.post("http://localhost:5000/api/coach/reject", { userId: app.user_id }, {withCredentials: true});
        } catch (error) {
            console.log("Could not reject coach:::" + error);
        } finally {
            await fetchApplications();
        }
    }

    const Fire = async (id) => {
        try {
            const result = await axios.post("http://localhost:5000/api/coach/fire", { userId: id }, {withCredentials: true});
        } catch (error) {
            console.log("Could not fire coach:::" + error);
        } finally {
            await fetchCoaches();
        }
    }
    
console.log(applications);
    return (
        <main>
            <div id='coachList'>
                {coaches.map((coach) => (
                <div key={coach.id} className="coachListItem" name={coach.id}>
                    <img className='coachImage' src={coach.image} alt={coach.first_name + " " + coach.last_name} />
                    <span>{coach.first_name + " " + coach.last_name}</span>
                    <div><a href={'/profile/' + coach.id}>View profile</a></div>
                    <div><button onClick={() => Fire(coach.id)}>Fire</button></div>
                </div>
                ))}
            </div>

            <div id="applicationsList">
                {applications.map((app) => (
                <div key={app.id} className="coachListItem" name={app.id}>
                    <span>Application ID: {app.id}</span>
                    <a href={`/profile/${app.user_id}`}>View user profile</a>
                    <a href={`/application/${app.id}`}>View application</a>
                    <span>Application status: {app.status}</span>
                    <button onClick={() => Hire(app.id)}>Hire</button>
                    <button onClick={() => Reject(app.id)}>Reject</button>
                </div>
                ))}
            </div>
        </main>
    )
}

export default AdminDashboard