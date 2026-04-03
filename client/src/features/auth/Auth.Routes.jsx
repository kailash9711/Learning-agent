import React from 'react'
import Login from './Login'
import SignUp from './SignUp'

const AuthRoutes =[
    {path:'/login', element: <Login />},
    {path:'/register', element: <SignUp />}
]

export default AuthRoutes