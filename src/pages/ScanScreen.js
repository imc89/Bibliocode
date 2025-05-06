import React, { useState } from 'react';
import Scanner from '../components/Scanner';
import BookForm from '../components/BookForm';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';

function ScanScreen() {
  const [scannedISBN, setScannedISBN] = useState(null);
  const [bookData, setBookData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [myBooks, setMyBooks] = useLocalStorage('myBooks', []);

  const handleScanSuccess = async (isbn) => {
    setScannedISBN(isbn);
    try {
      const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      if (response.ok) {
        const data = await response.json();
        setBookData({
          isbn: isbn,
          title: data.title || '',
          author: data.authors ? data.authors[0]?.name || '' : '',
        });
        setIsEditing(true);
      } else {
        alert(`No se encontró información para el ISBN: ${isbn}`);
        setScannedISBN(null);
      }
    } catch (error) {
      console.error("Error fetching book info:", error);
      alert("Error al obtener información del libro.");
      setScannedISBN(null);
    }
  };

  const handleSaveScannedBook = (bookToSave) => {
    setMyBooks(prevBooks => {
      const isDuplicate = prevBooks.some(book => book.isbn === bookToSave.isbn);
      if (!isDuplicate) {
        return [...prevBooks, bookToSave];
      }
      alert('Este libro ya está en tu biblioteca.');
      return prevBooks;
    });
    setIsEditing(false);
    setScannedISBN(null);
    setBookData(null);
    navigate('/mis-libros'); // Redirigir a la lista de libros después de guardar
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setScannedISBN(null);
    setBookData(null);
  };

  return (
    <div>
      <h2>Escanear Libro</h2>
      <Scanner onScan={handleScanSuccess} />

      {isEditing && bookData && (
        <BookForm
          initialBook={bookData}
          onSave={handleSaveScannedBook}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

export default ScanScreen;