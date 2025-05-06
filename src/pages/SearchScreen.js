import React, { useState } from 'react';
import SearchResults from '../components/SearchResults';
import BookForm from '../components/BookForm';
import useLocalStorage from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';

function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [myBooks, setMyBooks] = useLocalStorage('myBooks', []);
  const navigate = useNavigate();

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.docs);
      } else {
        alert("Error al realizar la búsqueda.");
        setSearchResults(null);
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      alert("Error al realizar la búsqueda.");
      setSearchResults(null);
    }
  };

  const handleSelectSearchResult = async (book) => {
    const isbn = book.isbn ? book.isbn[0] : null;
    if (isbn) {
      try {
        const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
        if (response.ok) {
          const data = await response.json();
          setSelectedBook({
            isbn: isbn,
            title: data.title || '',
            author: data.authors ? data.authors[0]?.name || '' : '',
          });
          setIsEditing(true);
        } else {
          alert(`No se encontró información detallada para el ISBN: ${isbn}`);
          setSelectedBook(null);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
        alert("Error al obtener detalles del libro.");
        setSelectedBook(null);
      }
    } else {
      alert("Este resultado no tiene un ISBN válido.");
      setSelectedBook(null);
    }
    setSearchResults(null);
    setSearchQuery('');
  };

  const handleSaveSearchedBook = (bookToSave) => {
    setMyBooks(prevBooks => {
      const isDuplicate = prevBooks.some(book => book.isbn === bookToSave.isbn);
      if (!isDuplicate) {
        return [...prevBooks, bookToSave];
      }
      alert('Este libro ya está en tu biblioteca.');
      return prevBooks;
    });
    setIsEditing(false);
    setSelectedBook(null);
    navigate('/mis-libros'); // Redirigir después de guardar
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedBook(null);
  };

  return (
    <div>
      <h2>Buscar Libro</h2>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Título o ISBN"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
        <button type="submit">Buscar</button>
      </form>
      {searchResults && <SearchResults results={searchResults} onSelect={handleSelectSearchResult} />}

      {isEditing && selectedBook && (
        <BookForm
          initialBook={selectedBook}
          onSave={handleSaveSearchedBook}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

export default SearchScreen;