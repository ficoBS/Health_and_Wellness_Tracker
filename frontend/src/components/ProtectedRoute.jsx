import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
    const { user, setUser, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute