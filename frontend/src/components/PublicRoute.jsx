import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicRoute = () => {
    const { user, setUser, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default PublicRoute