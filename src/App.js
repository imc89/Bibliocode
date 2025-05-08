import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MyBooksPage from './pages/MyBooksPage';
import MyReadingsPage from './pages/MyReadingsPage';
import ScanPage from './pages/ScanPage';
import EditBookPage from './pages/EditBookPage';

function App() {
    const [myBooks, setMyBooks] = useState(() => {
        const storedBooks = localStorage.getItem('myBooks');
        return storedBooks ? JSON.parse(storedBooks) : [];
    });

    useEffect(() => {
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }, [myBooks]);


    return (
        <Router> {/* Usamos el Router renombrado (que es HashRouter) */}
            <div>
                <Routes>
                    <Route path="/" element={<MyBooksPage />} />
                    <Route path="/scanner" element={<ScanPage />} />
                    <Route path="/editar/:isbn" element={<EditBookPage />} />
                    <Route path="/reading" element={<MyReadingsPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;