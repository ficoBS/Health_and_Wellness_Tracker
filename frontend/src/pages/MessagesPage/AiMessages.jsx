import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import './Messages.css'

const AiMessages = () => {
    const {user} = useAuth();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [l1, setL1] = useState(true)
    const [form, setForm] = useState({message: "", aiChatId: null});
    const [loadingMessage, setLoadingMessage] = useState(false);
    
    const fetchChat = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/chats/ai/getAll", {withCredentials: true});

            setChat(result.data.chat);
        } catch (error) {
            console.log("Could not fetch chat:::" + error);
            setChat(null);
        }
    }

    const fetchMessages = async () => {
        try {
            const result = await axios.get("http://localhost:5000/api/chats/ai/messages/" + chat.id, {withCredentials: true});

            setMessages(result.data.messages);
        } catch (error) {
            console.log("Could not fetch messages:::" + error);
            setMessages([]);
        } finally {
            setL1(false);
        }
    }

    useEffect(() => {
        fetchChat();
    }, []);

    useEffect(() => {
        if (chat === null) {
            return;
        }
        setForm({...form, aiChatId: chat.id});
        fetchMessages();
    }, [chat]);

    if (l1) {
        return <div>Loading...</div>
    }

    const handleSubmit = async () => {
        if (form.message.length > 0) {
            try {
                setLoadingMessage(true);
                console.log(form.aiChatId)
                const result = await axios.post("http://localhost:5000/api/ai/coach", form, {withCredentials: true});

                let m = messages;
                m.push(result.data.message.content);
                m.push(result.data.answer.content)
                setMessages(m);
            } catch (error) {
                console.log("SEND MESSAGE:::" + error);
            } finally {
                setForm({...form, message: ""});
                setLoadingMessage(false);
            }
        }
    }

    return (
        <main>
                    <div className='chatHeader'>
                        {/* <img src={} alt='ai_image' /> */}
                        <span>AI Coach</span>
                    </div>
        
                    <div className='chatBody'>
                        {messages.length <= 0 ? "No messages" :
                        messages.map((message) => (
                            message.role === "user" ?
                                <div className="sentMe">{message.content}</div>
                                :
                                <div className="sentOther">{message.content}</div>
                        ))}
                    </div>
        
                    <div className='chatBottom'>
                        <input type='text' placeholder='Write message' value={form.message} onChange={(e) => setForm({...form, message: e.target.value})}/>
                        <button onClick={handleSubmit} disabled={loadingMessage}>Send</button>
                    </div>
                </main>
    )
}

export default AiMessages