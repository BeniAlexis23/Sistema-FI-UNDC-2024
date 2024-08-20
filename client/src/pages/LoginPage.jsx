import { useForm } from "react-hook-form"
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import banner2 from '../assets/banner2.png';

const LoginPage = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { signin, errors: signinErros, isAuthenticated } = useAuth();
  const navigate = useNavigate()

  console.log(signinErros)
  const onSubmit = handleSubmit((data) => {
    signin(data);
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated])

  return (
    <>

      <div class="bg-gray-100 flex justify-center items-center h-screen">

        <div class="w-1/2 h-screen hidden lg:block">
          <img src={banner2} alt="Placeholder Image" class="object-cover w-full h-full" />
        </div>

        <div class="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
          {
            signinErros.map((error, i) => (
              <div className='bg-red-500 p-2 text-white text-center my-2' key={i}>
                {error}
              </div>
            ))
          }
          <h1 className="text-4xl font-bold my-2">CMS - FI UNDC</h1>
          <form onSubmit={onSubmit}>

            <div class="mb-4">
              <label for="username" class="block text-gray-600">Email</label>
              <input type="email" {...register("email", { required: true })} placeholder='ejm@gmail.com' className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" />
              {errors.email && <p className='text-red-500'>Email is required</p>}
            </div>

            <div class="mb-4">
              <label for="password" class="block text-gray-600">Password</label>
              <input type="password" {...register("password", { required: true })} placeholder='******' className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" />
              {errors.password && <p className='text-red-500'>Password is required</p>}
            </div>

            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full">Login</button>
          </form>
        </div>
      </div>
    </>
  )
}

export default LoginPage;