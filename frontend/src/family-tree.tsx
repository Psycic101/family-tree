import CytoscapeComponent from 'react-cytoscapejs';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FamilyTree() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const elements = [
        { data: { id: 'Mother' } },
        { data: { id: 'Child1' } },
        { data: { id: 'Child2' } },
        { data: { source: 'Mother', target: 'Child1' } },
        { data: { source: 'Mother', target: 'Child2' } }
    ];

    const stylesheet = [
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                'label': 'data(id)'
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle'
            }
        }
    ];

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
        <div className="family-tree">
            <h1>Family Tree</h1>
            <p>Welcome! Your user ID is: {userData?.userId}</p>
            <button onClick={handleLogout}>Logout</button>
            <CytoscapeComponent
                elements={elements}
                style={{ width: '100%', height: '400px', textAlign: 'initial' }}
                stylesheet={stylesheet}
                layout={{ name: 'breadthfirst' }}
            />
        </div>
    );
}