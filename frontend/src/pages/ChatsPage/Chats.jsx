import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Chats.css'
import userProfile from '../../assets/user_profile.svg'

const Chats = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState(true);
    const [chats, setChats] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [activeCoaches, setActiveCoaches] = useState([]);
    const [activeCoachesIds, setActiveCoachesIds] = useState([]);
    const [users, setUsers] = useState([]);


    const fetchChats = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/chats/getAll", {withCredentials: true});
            setChats(result.data.chats);
            let activeCoachesList = [];
            for (const chat of result.data.chats) {
                activeCoachesList.push(chat.coach_id);
            }
            setActiveCoachesIds(activeCoachesList);
        } catch (error) {
            console.error("Error fetching chats:", error);
            setChats([]);
            setActiveCoachesIds([]);
        }
    }

    if (user.role !== "coach") {
        useEffect(() => {
            fetchChats();
        }, [])

        useEffect(() => {
            fetchCoaches();
        }, [activeCoachesIds])
    }
    else {
        useEffect(() => {
            fetchChatsCoach()
        }, [])

        useEffect(() => {
            fetchUsers();
        }, [])
    }

    const fetchCoaches = async () => {
        try {
            let active = [];
            const result = await axios.get("http://localhost:5000/api/coach/getAll", {withCredentials: true});

            for (let i = result.data.coaches.length - 1; i >= 0; i--) {
                if (activeCoachesIds.includes(result.data.coaches[i].id)) {
                    active.push(result.data.coaches[i]);
                    result.data.coaches.splice(i, 1);
                }
            }

            setActiveCoaches(active);
            setCoaches(result.data.coaches);
            console.log("Coaches fetched:", result.data.coaches);
        } catch (error) {
            console.error("Error fetching coaches:", error);
            setCoaches([]);
        }
    }

    const startChat = async (coachId) => {
        const form = {
            user_id: user.id,
            coach_id: coachId,
        }

        let chatId = null;
        try {
            const result = await axios.post("http://localhost:5000/api/chats/start", form, {withCredentials: true});
            console.log("Chat started:", result.data.chat);
            chatId = result.data.chat.id;
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            if (chatId) {
                navigate(`/chat/${chatId}`);
            }
        }
    }

    const fetchChatsCoach = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/chats/getAll", {withCredentials: true});
            setChats(result.data.chats);
        } catch (error) {
            console.error("Error fetching chats:", error);
            setChats([]);
        }
    }

    const fetchUsers = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/users/chats/" + user.id, {withCredentials: true});
            setUsers(result.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        }
    }


    return (
        <main> 
            {user.role === "coach" ? (
                <div className="chatsNav">
                    My Chats
                </div>
            ) : (
                <div className='chatsNav'>
                    <button onClick={() => setView(true)}>My Chats</button>
                    <button onClick={() => {fetchCoaches(); setView(false);}}>Find Coach</button>
                </div>
            )}

            {view && user.role !== "coach" ? (
                <div className='chatsContainer'>
                    <div className='chatsList'>
                        <div className='chatItem'>
                            <Link to={`/chat/ai`} className='coachInfo'>
                                {/* <img src={coach.image} alt={`${coach.first_name} ${coach.last_name}`} /> */}
                                <span>AI Coach</span>
                            </Link>
                        </div>

                        {activeCoaches.map((coach) => {
                            const coachChat = chats.find(chat => chat.coach_id === coach.id);

                            return (
                                <div className='chatItem'>
                                    <Link to={`/chat/${coachChat.id}`} className='coachInfo'>
                                        {coach.image ? <img src={coach.image} alt={`${coach.first_name} ${coach.last_name}`} /> : <img src={userProfile} alt='user_image' />}
                                        <span>{coach.first_name} {coach.last_name}</span>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : ""}

            {!view && user.role !== "coach" ? (
                <div className='findCoachContainer'>
                    {coaches.map((coach) => (
                        <div className='findCoachItem' key={coach.id}>
                            <Link to={`/profile/${coach.id}`} className='coachInfo'>
                                {coach.image ? <img src={coach.image} alt={`${coach.first_name} ${coach.last_name}`} /> : <img src={userProfile} alt='user_image' />}
                                <span>{coach.first_name} {coach.last_name}</span>
                            </Link>
                            <button onClick={() => startChat(coach.id)}>Start Chat</button>
                        </div>
                    ))}
                </div>
            ) : ""}

            {user.role === "coach" ? (
                <div className='chatsContainer'>
                    <div className='chatsList'>

                        {users.map((user) => {
                            const userChat = chats.find(chat => chat.user_id === user.id);

                            return (
                                <div className='chatItem'>
                                    <Link to={`/chat/${userChat.id}`} className='coachInfo'>
                                        {user.image ? <img src={user.image} alt={`${user.first_name} ${user.last_name}`} /> : <img src={userProfile} alt='user_image' />}
                                        <span>{user.first_name} {user.last_name}</span>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : ""}
        </main>
    )
}

export default Chats