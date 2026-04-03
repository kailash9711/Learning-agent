import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";

const login = async (email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
        return response.data;
    }   catch (error) { 
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

const register = async (name, email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, { name, email, password });  
        return response.data;
    }   catch (error) {
        throw error.response ? error.response.data : new Error('Network Error');
    }
};

const authServices = {
    login,
    register
};

export default authServices;