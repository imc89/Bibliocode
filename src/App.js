import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationMenu from './components/NavigationMenu';
import Footer from './components/Footer/Footer';
import MyBooksScreen from './pages/MyBooksScreen';
import BarcodeScannerScreen from './components/hola3';

function App() {
    const [myBooks, setMyBooks] = useState(() => {
        const storedBooks = localStorage.getItem('myBooks');
        return storedBooks ? JSON.parse(storedBooks) : [];
    });

    useEffect(() => {
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }, [myBooks]);

    const addBookToMyBooks = (newBook) => {
        setMyBooks(prevBooks => {
            const isBookAlreadyAdded = prevBooks.some(book => book.isbn === newBook.isbn);
            if (!isBookAlreadyAdded) {
                return [...prevBooks, newBook];
            }
            return prevBooks;
        });
    };
    return (
        <Router> {/* Usamos el Router renombrado (que es HashRouter) */}
            <div>
                <NavigationMenu />
                <Routes>
                    <Route path="/" element={<MyBooksScreen />} />
                    <Route path="/scanner" element={<BarcodeScannerScreen onBookAdded={addBookToMyBooks} />} />
                </Routes>
                <Footer/>
            </div>
        </Router>
    );
}

export default App;