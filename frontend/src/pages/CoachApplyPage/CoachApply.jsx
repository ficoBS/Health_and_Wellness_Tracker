import { useAuth } from '../../hooks/useAuth'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import userLogo from '../../assets/user_profile.svg'
import './CoachApply.css'
import axios from 'axios'

const CoachApply = () => {
    const {user} = useAuth();
    const [files, setFiles] = useState([]);
    const [application, setApplication] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        biography: '',
        experienceYears: 0,
        title: '',
        specializations: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("biography", form.biography);
            formData.append("experienceYears", form.experienceYears);
            formData.append("title", form.title);
            formData.append("specializations", form.specializations);

            files.forEach((file) => {
                formData.append("documents", file);
            });

            const result = await axios.post("http://localhost:5000/api/coach/apply", formData, {withCredentials: true});

            fetchApplication();

        } catch (error) {
            console.log("ERROR::: " + error.message);
        }
    }

    const showImages = () => {
        const div = document.getElementById("applicationImages");
        console.log(images)
        for (let i = 0; i < images.length; i++) {
            div.innerHTML += "<img src=" + images[i].image + " alt='appImage' />";
        }
    }

    const fetchApplication = async () => {
            setLoading(true);
            try {
                const result = await axios.get("http://localhost:5000/api/coach/apply/me", {withCredentials: true});
                const app = result.data.application;
                if (app === null) {
                    setApplication(null);
                    setImages([]);
                    return;
                }

                setApplication(app);
                setImages(result.data.images);
            } catch (error) {
                console.log("Could not get application:::" + error);
                setApplication(null);
                setImages([]);
            } finally {
                setLoading(false);
            }
        } 

    useEffect(() => {
        fetchApplication();
    }, [])

    useEffect(() => {
        showImages();
    }, [images])

    const cancelApplication = async () => {
        try {
            const result = await axios.post("http://localhost:5000/api/coach/cancelApply", {appId: application.id}, {withCredentials: true});
            
            if (result.status === 200) {
                setApplication(null);
                setImages([]);
            }
        } catch (error) {
            console.log("Could not delete application:::" + error.response.data.message);
        } finally {
            navigate("/coachApply");
        }
    }

    if (loading) {
        return <div>loading...</div>
    }

    return (
        <main>
            {application === null ?
            <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="biography">Biography</label>
                    <textarea id="biography" value={form.biography} onChange={(e) => setForm({...form, biography: e.target.value})}>
                    </textarea>
                </div>

                <div>
                    <label htmlFor="expYears">Experience Years</label>
                    <input type="number" id="expYears" value={form.experienceYears} onChange={(e) => setForm({...form, experienceYears: e.target.value})} />
                </div>

                <div>
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                </div>

                <div>
                    <label htmlFor="spec">Specializations</label>
                    <input type="text" id="spec" value={form.specializations} onChange={(e) => setForm({...form, specializations: e.target.value})} />
                </div>

                <div>
                    <input type='file' multiple accept='image/*,.pdf' onChange={(e) => setFiles(Array.from(e.target.files))} />
                </div>
                <input type='submit' value='Apply' />
            </form>
            <button onClick={() => navigate("/profile")}>Cancel</button> 
            </>
            :
            <div>
                <div>
                    <h5>Biography</h5>
                    <div>{application.biography}</div>
                </div>
                <div>
                    <h5>Experience years</h5>
                    <div>{application.experience_years}</div>
                </div>
                <div>
                    <h5>title</h5>
                    <div>{application.title}</div>
                </div>
                <div>
                    <h5>Specializations</h5>
                    <div>{application.specializations}</div>
                </div>

                <div id='applicationImages'></div>

                <div>
                    <span>Status: </span><span>{application.status}</span><span>Submitted: </span><span>{application.submitted_at.substr(0, 10)}</span>
                </div>
                <button onClick={() => cancelApplication()}>Cancel Application</button>
            </div>
            }
        </main>
    )
}

export default CoachApply