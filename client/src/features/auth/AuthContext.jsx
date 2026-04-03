import React, { use, useState } from 'react'

const AuthContext = React.createContext();

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    useEffect(() => {
    }
    , []);

    const checkAuth = async () => {
        try {
            // Implement logic to check if user is authenticated
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (token && userStr) {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (err) {
                console.error('Error checking authentication:', err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, token) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    }

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    const value = {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
export default AuthContext
