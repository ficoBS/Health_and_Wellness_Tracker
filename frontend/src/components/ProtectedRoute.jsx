import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/useAuth";

const ProtectedRoute = () => {
    const { user, setUser, loading } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute