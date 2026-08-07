import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PublicRoute = () => {
    const { user, setUser, loading } = useAuth();
    

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default PublicRoute