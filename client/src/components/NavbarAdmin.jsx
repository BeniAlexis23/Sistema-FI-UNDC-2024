import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();

    return (
        <nav className="bg-zinc-700 flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 px-10">
            <div className="flex flex-col sm:flex-row sm:items-center w-full sm:w-auto">
                <Link to={isAuthenticated ? "/dashboard" : "/"}>
                    <h1 className="text-2xl text-white font-bold">Administración del Sistema</h1>
                </Link>
                <div className="mt-4 sm:mt-0 sm:ml-5 flex flex-col sm:flex-row gap-y-2 sm:gap-y-0 gap-x-4">
                    {isAuthenticated && location.pathname === "/notices" && (
                        <Link to='/add-notice' className="bg-indigo-500 text-white px-4 py-1 rounded-sm">Añadir noticia</Link>
                    )}
                    {isAuthenticated && location.pathname === "/rcfs" && (
                        <Link to='/add-rcf' className="bg-indigo-500 text-white px-4 py-1 rounded-sm">Añadir RCF</Link>
                    )}
                </div>
            </div>
            <ul className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-y-0 sm:gap-x-2 mt-4 sm:mt-0">
                {isAuthenticated ? (
                    <>
                        <li className="text-white font-extrabold">
                            Bienvenido {user.username}
                        </li>
                        <li>
                            <Link to='/' className="bg-indigo-500 text-white px-4 py-1 rounded-sm" onClick={() => { logout() }}>Logout</Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to='/login' className="bg-indigo-500 text-white px-4 py-1 rounded-sm">Login</Link>
                        </li>
                        <li>
                            <Link to='/register' className="bg-indigo-500 text-white px-4 py-1 rounded-sm">Register</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;