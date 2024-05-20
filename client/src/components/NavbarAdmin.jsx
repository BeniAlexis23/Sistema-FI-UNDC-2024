import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {

    const { isAuthenticated, logout, user } = useAuth();

    return (
        <nav className="bg-zinc-700 flex justify-between py-2 px-10">
            <div>
                <Link to={
                    isAuthenticated ? "/notices" : "/"
                }>
                    <h1 className="text-2xl text-white font-bold">Administración del Sistema</h1>
                </Link>
                <div className="flex gap-x-2 my-2">
                    <Link to='/add-notice' className="bg-indigo-500 text-white px-4 py-1 rounded-sm">Añadir noticia</Link>
                    <Link to='/add-rcf' className="bg-indigo-500 text-white px-4 py-1 rounded-sm">Añadir RCF</Link>
                </div>
            </div>
            <ul className="flex gap-x-2 py-7">
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
            </ul >
        </nav >
    )
}

export default Navbar