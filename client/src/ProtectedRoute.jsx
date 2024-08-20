import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ requiredEmail }) {
    const { loading, isAuthenticated, user } = useAuth();

    if (loading) return <h1>Loading...</h1>;

    if (!isAuthenticated || (requiredEmail && user.email !== requiredEmail)) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;