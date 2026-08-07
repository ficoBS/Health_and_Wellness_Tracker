import React from 'react'
import { useAuth } from '../../context/useAuth'

const Dashboard = () => {
    const {user, loading} = useAuth();

    if (loading) {
        return <div>Loading...</div>
    }

    console.log(user);
    return (
        <div>
            Dashboarddd
        </div>
    )
}

export default Dashboard