import { createContext, useContext, useEffect, useState } from 'react';
import { changePasswordRequest, loginRequest, logoutRequest, verityTokenRequet } from '../api/auth';
import { getApiErrors } from '../api/errors';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within the AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const signin = async (credentials) => {
        setErrors([]);
        try {
            const response = await loginRequest(credentials);
            setIsAuthenticated(true);
            setUser(response.data);
            return true;
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo iniciar sesión'));
            return false;
        }
    };

    const logout = async () => {
        try {
            await logoutRequest();
        } catch {
            // La sesión local también debe finalizar si la cookie ya expiró.
        }
        setIsAuthenticated(false);
        setUser(null);
    };

    const changePassword = async (passwords) => {
        setErrors([]);
        try {
            const response = await changePasswordRequest(passwords);
            setUser(response.data);
            return true;
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo cambiar la contraseña'));
            return false;
        }
    };

    useEffect(() => {
        if (!errors.length) return undefined;
        const timer = setTimeout(() => setErrors([]), 5000);
        return () => clearTimeout(timer);
    }, [errors]);

    useEffect(() => {
        const handleUnauthorized = () => {
            setIsAuthenticated(false);
            setUser(null);
        };
        const handlePasswordRequired = () => {
            setUser((current) => current ? { ...current, passwordChangeRequired: true } : current);
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        window.addEventListener('auth:password-change-required', handlePasswordRequired);
        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
            window.removeEventListener('auth:password-change-required', handlePasswordRequired);
        };
    }, []);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const response = await verityTokenRequet();
                setIsAuthenticated(true);
                setUser(response.data);
            } catch {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLogin();
    }, []);

    return (
        <AuthContext.Provider value={{ signin, logout, changePassword, loading, user, isAuthenticated, errors, clearErrors: () => setErrors([]) }}>
            {children}
        </AuthContext.Provider>
    );
};
