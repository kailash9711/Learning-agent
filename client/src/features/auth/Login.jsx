import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] =useState("");


    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Perform login or registration logic here
        // After successful login or registration, navigate to the dashboard
        navigate('/dashboard');
    };

    return (
       < div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white">
            <p className="text-2xl font-medium m-auto">
                <span className="text-indigo-500">User</span> Login
            </p>
            <div className="w-full ">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="email" required />
            </div>
            <div className="w-full ">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="password" required />
            </div>
            <button className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer">
                Login
            </button>
            <p>
                Create an account? <Link to="/register" className="text-indigo-500 cursor-pointer">click here</Link>
            </p>
        </form>
        </div>
    );
}

export default Login
