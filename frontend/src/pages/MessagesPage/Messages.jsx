import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import './Messages.css'
import userProfile from '../../assets/user_profile.svg'

const Messages = () => {
    const {user} = useAuth();
    const {chatId} = useParams();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [other, setOther] = useState(null);
    const [l1, setL1] = useState(true);
    const [form, setForm] = useState({content: "", senderId: user.id, chatId: chatId});
    
    
    const fetchChat = async () => {
        try {
             const result = await axios.get("http://localhost:5000/api/chats/get/" + chatId, {withCredentials: true});
             setChat(result.data.chat);
        } catch (error) {
            console.log("CHATT:::" + error);
            setChat([]);
        }
    }

    const fetchOther = async (id) => {
        try {
             const result = await axios.get("http://localhost:5000/api/users/" + id, {withCredentials: true});
             setOther(result.data.user);
        } catch (error) {
            console.log("USERR:::" + error);
            setOther(null);
        } finally {
            setL1(false);
        }
    }

    const fetchMessages = async () => {
        try {
             const result = await axios.get("http://localhost:5000/api/chats/messages/get/" + chatId, {withCredentials: true});
             setMessages(result.data.messages);
        } catch (error) {
            console.log("MESSAGES:::" + error);
            setMessages([]);
        }
    }

    useEffect(() => {
        fetchChat();
        fetchMessages();
    }, [])

    useEffect(() => {
        if (chat) {
            if (user.role === "coach") {
                fetchOther(chat.user_id);
            } else {
                fetchOther(chat.coach_id)
            }
        }
    }, [chat])

    const handleSubmit = async () => {
        if (form.content.length > 0) {
            try {
                const message = await axios.post("http://localhost:5000/api/chats/messages/send", form, {withCredentials: true});

                let m = messages;
                m.push(message.data.message);
                setMessages(m);
            } catch (error) {
                console.log("SEND MESSAGE:::" + error);
            } finally {
                setForm({...form, content: ""});
            }
        }
    }

    if (l1) {
        return <div>Loading...</div>
    }

    console.log(messages)
    return (
        <main>
            <div className='chatHeader'>
                {other.image ? <img src={other.image} alt="other_user_image" /> : <img src={userProfile} alt='other_user_image' />}
                <span>{other.first_name} {other.last_name}</span>
            </div>

            <div className='chatBody'>
                {messages.length <= 0 ? "No messages" :
                messages.map((message) => (
                    message.sender_id === user.id ?
                        <div className="sentMe">{message.content}</div>
                        :
                        <div className="sentOther">{message.content}</div>
                ))}
            </div>

            <div className='chatBottom'>
                <input type='text' placeholder='Write message' value={form.content} onChange={(e) => setForm({...form, content: e.target.value})}/>
                <button onClick={handleSubmit}>Send</button>
            </div>
        </main>
    )
}

export default Messages