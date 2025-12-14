import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('api/protected', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            } else {
                navigate('/login');
            }
        } catch (err) {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            navigate('/login');
        } catch (err) {
            // What do we do here?
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            <p>Welcome! Your user ID is: {userData?.userId}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}