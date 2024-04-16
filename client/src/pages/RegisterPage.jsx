import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {

    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signup, isAuthenticated, errors: registerErros } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) navigate('/notices');
    }, [isAuthenticated]);

    const onSubmit = handleSubmit(async (values) => {
        signup(values);
    })

    return (
        <>
            <div className='flex h-[calc(100vh-100px)] items-center justify-center'>
                <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
                    <h1 className="text-2xl text-white font-bold">REGISTER</h1>
                    {
                        registerErros.map((error, i) => (
                            <div className='bg-red-500 p-2 text-white' key={i}>
                                {error}
                            </div>
                        ))
                    }
                    <form onSubmit={onSubmit}>
                        <input type="text" {...register("username", { required: true })} placeholder='Username' className="w-full bg-zinc-700 text-white px-4 py-2 my-2 rounded-md" />
                        {errors.username && <p className='text-red-500'>Username is required</p>}
                        <input type="email" {...register("email", { required: true })} placeholder='Email' className="w-full bg-zinc-700 text-white px-4 py-2 my-2 rounded-md" />
                        {errors.email && <p className='text-red-500'>Email is required</p>}
                        <input type="password" {...register("password", { required: true })} placeholder='Password' className="w-full bg-zinc-700 text-white px-4 py-2 my-2 rounded-md" />
                        {errors.password && <p className='text-red-500'>Password is required</p>}
                        <button className="bg-sky-500 text-white px-4 py-1 my-2 rounded-sm" type="submit">Register</button>
                    </form>
                    <p className="flex gap-x-2 text-white justify-between">
                        Already have an account? <Link to="/login" className="text-sky-500">Sing In</Link>
                    </p>
                </div>
            </div>
        </>
    )
}

export default RegisterPage
