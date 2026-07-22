import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute({ requiredRole, allowPasswordChange = false }) {
    const { loading, isAuthenticated, user } = useAuth();

    if (loading) return <h1>Loading...</h1>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    if (user.passwordChangeRequired && !allowPasswordChange) {
        return <Navigate to="/change-password" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
