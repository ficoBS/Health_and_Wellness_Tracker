import React from 'react'
import { useAuth } from '../../context/useAuth'

const Dashboard = () => {
    const {user, loading, logout} = useAuth();

    if (loading) {
        return <div>Loading...</div>
    }

    console.log(user);
    return (
        <div>
            Hello to dashboard {user.first_name} <button onClick={logout}>Logout</button>
        </div>
    )
}

export default Dashboard