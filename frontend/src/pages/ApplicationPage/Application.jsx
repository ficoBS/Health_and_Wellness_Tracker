import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const Application = () => {
    const [application, setApplication] = useState(null);
    const {applicationId} = useParams();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchApplication = async () => {
        setLoading(true);
        try {
            const result = await axios.get("http://localhost:5000/api/coach/application/" + applicationId, {withCredentials: true});
            setApplication(result.data.application);
            setImages(result.data.images);
        } catch (error) {
            console.log("Could not fetch application:::" + error);
            setApplication(null);
            setImages([]);
        } finally {
            setLoading(false);
        }
    }

    const showImages = () => {
        const div = document.getElementById("applicationImages");
        console.log(images)
        for (let i = 0; i < images.length; i++) {
            div.innerHTML += "<img src=" + images[i].image + " alt='appImage' />";
        }
    }

    useEffect(() => {
        fetchApplication();
    }, []);

    useEffect(() => {
        showImages();
    }, [images]);

    if (loading) {
        return <div>loading...</div>
    }

    console.log(application);
    console.log(applicationId);
    return (
        <main>
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
            </div>
        </main>
    )
}

export default Application;