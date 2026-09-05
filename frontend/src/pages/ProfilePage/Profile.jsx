import { useAuth } from '../../hooks/useAuth'
import { use, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import userLogo from '../../assets/user_profile.svg'
import './Profile.css'
import axios from 'axios'
import { useEffect } from 'react'

const Profile = () => {
    const {user, setUser, logout} = useAuth();
    const { userId } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [showModalImage, setShowModalImage] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingImage, setLoadingImage] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId || userId === String(user.id)) {
                setSelectedUser(user);
                setLoading(false);
                return;
            }

            try {
                const getUser = await axios.get(`http://localhost:5000/api/users/${userId}`);
                setSelectedUser(getUser.data.user);
            } catch (error) {
                console.log("Could not fetch other user by id");
                setSelectedUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [user])

    const [userImage, setUserImage] = useState({
        userId: user.id,
        image: user.image,
    })

    const resetImage = () => {
        setUserImage({
            userId: user.id,
            image: user.image,
        })
    }

    const [form, setForm] = useState({
            userId: user.id,
            password: '',
            password2: '',
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone_number,
            country: user.country,
            city: user.city,
            weight: user.weight,
            height: user.height,
        })

    const resetForm = () => {
        setForm({
            userId: user.id,
            password: '',
            password2: '',
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone_number,
            country: user.country,
            city: user.city,
            weight: user.weight,
            height: user.height,
        })
    }
    

    const isPersonal = !userId || userId === String(user.id);

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);

        let age = today.getFullYear() - birth.getFullYear();

        const month = today.getMonth() - birth.getMonth();

        if (
            month < 0 ||
            (month === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }

        return age;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post("http://localhost:5000/api/auth/changeInfo", form,
                {withCredentials: true}
            );
            setUser(result.data.user);
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong. Try again.")
            console.log("Can't change users info ::: " + error)
        } finally {
            setShowModal(false);
        }
    }

    const uploadImage = async (e) => {
        setLoadingImage(true);
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append("image", file)
        try {
            const result = await axios.post("http://localhost:5000/api/upload/profile_image", formData, 
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            )

            setUserImage({...userImage, image: result.data.url});
        } catch (error) {
            console.log("Failed uploading image: " + error);
        } finally {
            setLoadingImage(false);
        }
    }

    const handleSubmitImage = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post("http://localhost:5000/api/auth/changeImage", userImage,
                {withCredentials: true}
            );
            setUser(result.data.user);
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong. Try again.")
            console.log("Can't change users image ::: " + error)
        } finally {
            setShowModalImage(false);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    console.log(selectedUser);
    return (
        <main>
            <div id='profileHeader'>
                <div>
                    {!selectedUser.image ?
                    <img src={userLogo} alt='userLogo' /> :
                    <img src={selectedUser.image} alt='userLogo' />}
                </div>
                <div>
                    <span>{selectedUser.first_name} {selectedUser.last_name}</span>
                    <p>Member since {selectedUser.created_at.substr(0,10)}</p>
                    {isPersonal ? <button onClick={() => setShowModalImage(true)}>Edit profile</button> : ""}
                </div>
            </div>

            <div className='card'>
                <div>
                    <h4>
                        Personal Info
                    </h4>
                    {isPersonal ? <button onClick={() => setShowModal(true)}>Edit</button> : ""}
                </div>

                <div>
                    <p>Full Name</p>
                    <p>{selectedUser.first_name} {selectedUser.last_name}</p>
                </div>

                <div>
                    <p>Email</p>
                    <p>{selectedUser.email}</p>
                </div>

                <div>
                    <p>Age</p>
                    <p>{calculateAge(selectedUser.date_of_birth.substr(0,10))}</p>
                </div>

                <div>
                    <p>Phone Number</p>
                    <p>{selectedUser.phone_number}</p>
                </div>

                <div>
                    <p>gender</p>
                    <p>{selectedUser.gender === "male" ? "Male" : "Female"}</p>
                </div>

                <div>
                    <p>Country</p>
                    <p>{selectedUser.country}</p>
                </div>

                <div>
                    <p>City</p>
                    <p>{selectedUser.city}</p>
                </div>

                <div>
                    <p>Weight</p>
                    <p>{selectedUser.weight}</p>
                </div>

                <div>
                    <p>Height</p>
                    <p>{selectedUser.height}</p>
                </div>
            </div>

            {selectedUser.role === "coach" ?
                <div className='card'>
                    <div>
                        <h4>
                            Coach Info
                        </h4>
                    </div>
                    
                    {/* COACH INFO */}
                    <div>
                        <p>Full Name</p>
                        <p>{selectedUser.first_name} {selectedUser.last_name}</p>
                    </div>

                
                </div>
            : ""}

            {isPersonal && selectedUser.role === "user" && calculateAge(user.date_of_birth.substr(0,10)) >= 18 ?
                <div className='coachCard'>
                    <p>Become a coach</p>
                    <button onClick={() => navigate("/coachApply")}>Apply to be a coach</button>
                </div> :
                ""
            }

            <div className='settingCards'>
                {isPersonal && selectedUser.role === "admin" ? 
                <div>
                    <p>[ADMIN] See admin dashboard</p>
                    <button onClick={() => navigate("/adminDashboard")}>Admin Dashboard</button>
                </div> : ""}
                {isPersonal ?
                <>
                <div>
                    <p>Want to logout?</p>
                    <button onClick={logout}>Logout</button>
                </div>

                <div>
                    <p>Want to delete account permanently?</p>
                    <button>Delete account</button>
                </div>
                </> : ""}
            </div>






            {showModal && (
                <div
                    className="modalOverlay"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="modalPanel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="closeButton"
                            onClick={() => setShowModal(false)}
                        >
                            ×
                        </button>

                        <h2>Edit my personal info</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" onChange={(e) => setForm({...form, password: e.target.value})} />
                            </div>

                            <div>
                                <label htmlFor="password2">Confirm Password</label>
                                <input type="password" id="password2" onChange={(e) => setForm({...form, password2: e.target.value})} />
                            </div>

                            <div>
                                <label htmlFor="FirstName">First Name</label>
                                <input type="text" id="FirstName" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} />
                            </div>

                            <div>
                                <label htmlFor="LastName">Last Name</label>
                                <input type="text" id="LastName" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} />
                            </div>

                            <div>
                                <label htmlFor="phone">Phone Number</label>
                                <input type="tel" id="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                            </div>

                            <div>
                                <label htmlFor="country">Country</label>
                                <input type="text" id="country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} />
                            </div>

                            <div>
                                <label htmlFor="city">City</label>
                                <input type="text" id="city" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
                            </div>

                            <div>
                                <label htmlFor="weight">Weight (kg)</label>
                                <input type="number" id="weight" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} />
                            </div>

                            <div>
                                <label htmlFor="height">Height (cm)</label>
                                <input type="number" id="height" value={form.height} onChange={(e) => setForm({...form, height: e.target.value})} />
                            </div>

                            <button type='submit'>Apply</button>
                            <button onClick={() => {setShowModal(false); resetForm();}}>Cancel</button>  
                        </form>
                    </div>
                </div>
            )}

            {showModalImage && (
                <div
                    className="modalOverlay"
                    onClick={() => setShowModalImage(false)}
                >
                    <div
                        className="modalPanel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="closeButton"
                            onClick={() => setShowModalImage(false)}
                        >
                            ×
                        </button>

                        <h2>Edit my personal info</h2>
                        <form onSubmit={handleSubmitImage}>
                            <input type="file" id="image" accept="image/*" onChange={uploadImage} />

                            {loadingImage ?
                            <p>WAIT FOR IMAGE</p> : ""}
                            <button type='submit'>Apply</button>
                            <button onClick={() => {setShowModalImage(false); resetImage();}}>Cancel</button>  
                        </form>
                    </div>
                </div>
            )}
        </main>

    )
}

export default Profile