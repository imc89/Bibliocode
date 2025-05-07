import React, { useState, useEffect } from 'react';
import NavigationMenu from '../components/NavigationMenu';
import BarcodeScannerScreen from '../components/BarcodeScannerScreen/BarcodeScannerScreen';
import Footer from '../components/Footer/Footer';

const ScanPage = () => {

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
        <div>
            <NavigationMenu />
            <BarcodeScannerScreen onBookAdded={addBookToMyBooks} />
            <Footer />
        </div>
    );
};

export default ScanPage;