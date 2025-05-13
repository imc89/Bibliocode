import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import ScanPage from './pages/ScanPage';
import MyReadingsPage from './pages/MyReadingsPage';
import WishListPage from './pages/WishListPage';

import MyBooksPage from './pages/MyBooksPage';
import EditBookPage from './pages/EditBookPage';
import SearchPage from './pages//SearchPage';

import SplashScreen from './components/SplashScreen/SplashScreen';


function App() {

    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    const [myBooks, setMyBooks] = useState(() => {
        const storedBooks = localStorage.getItem('myBooks');
        return storedBooks ? JSON.parse(storedBooks) : [];
    });

    useEffect(() => {
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }, [myBooks]);



    return (
        // <Router basename="/Bibliocode">
        <Router>
            {showSplash ? (
                <SplashScreen onFinish={handleSplashFinish} />
            ) : (
                <>
                    <Routes>
                        <Route path="/" element={<MyBooksPage />} />
                        <Route path="/scanner" element={<ScanPage />} />
                        <Route path="/reading" element={<MyReadingsPage />} />
                        <Route path="/wishlist" element={<WishListPage />} />
                        <Route path="/editar/:isbn" element={<EditBookPage />} />
                        <Route path="/search" element={<SearchPage />} />

                    </Routes>
                </>
            )}
        </Router>
    );
}

export default App;