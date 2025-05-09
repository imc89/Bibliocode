import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearchSharp, IoCloseSharp } from 'react-icons/io5';
import { MdFilterList } from 'react-icons/md';

import './Searcher.css'; // Dedicated CSS for Searcher

// ✅ Component to display a search result (reusing book styling)
const SearchResultItem = ({ book }) => {
    const navigate = useNavigate();

    return (
        <li>
            <div className="bk-info">
                <b className="book-title">{book.title || 'Título desconocido'}</b>
                {book.author && <p className="book-author"><strong>Autor:</strong> {book.author}</p>}
                {book.publishers && <p className="book-publishers"><strong>Editorial:</strong> {Array.isArray(book.publishers) ? book.publishers.join(', ') : book.publishers}</p>}
                <div className="bk-buttons">
                    <button
                        className="bk-view-button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/editar/${book.isbn}`); // Or a dedicated view page
                        }}
                    >
                        Ver Detalles
                    </button>
                </div>
            </div>
            <div className="bk-book">
                <div className="bk-front">
                    <div className="bk-cover-back" style={{
                        backgroundImage: book.cover ? `url(${book.cover})` : 'none',
                        backgroundSize: '1000%',
                        zIndex: -1,
                        filter: 'blur(1px)',
                    }}></div>
                    <div
                        className="bk-cover"
                        style={{
                            backgroundImage: book.cover
                                ? `url(${book.cover}), url(${book.cover})`
                                : 'none',
                        }}
                    ></div>
                </div>
            </div>
        </li>
    );
};

// ✅ Search Page Component
const Searcher = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const [activeFilters, setActiveFilters] = useState({
        myBooks: true,
        wishlist: true,
        readingList: true,
    });

    useEffect(() => {
        const myBooksData = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const wishlistData = JSON.parse(localStorage.getItem('wishList') || '[]');
        const readingListData = JSON.parse(localStorage.getItem('readingList') || '[]');

        let combinedBooks = [];
        if (activeFilters.myBooks) combinedBooks = [...combinedBooks, ...myBooksData];
        if (activeFilters.wishlist) combinedBooks = [...combinedBooks, ...wishlistData];
        if (activeFilters.readingList) combinedBooks = [...combinedBooks, ...readingListData];

        // Remove duplicates based on ISBN (assuming ISBN is unique)
        const uniqueBooksMap = new Map(combinedBooks.map(book => [book.isbn, book]));
        setAllBooks([...uniqueBooksMap.values()]);

    }, [activeFilters]);

    const handleSearchInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filterBooks = useCallback(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        const results = allBooks.filter(book => {
            return (
                (book.title && book.title.toLowerCase().includes(lowercasedTerm)) ||
                (book.author && book.author.toLowerCase().includes(lowercasedTerm)) ||
                (book.isbn && book.isbn.includes(lowercasedTerm)) ||
                (book.publishers && book.publishers.some(publisher => publisher.toLowerCase().includes(lowercasedTerm)))
                // Add more fields to search as needed
            );
        });
        setSearchResults(results);
    }, [searchTerm, allBooks]);

    useEffect(() => {
        filterBooks();
    }, [searchTerm, filterBooks]);

    const toggleFilter = (filterName) => {
        setActiveFilters(prevFilters => ({
            ...prevFilters,
            [filterName]: !prevFilters[filterName],
        }));
    };

    return (
        <div className="search-page-container container">
            <div className="search-input-area">
                <div className="search-bar">
                    <IoSearchSharp className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por título, autor, ISBN, editorial..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                    />
                    {searchTerm && (
                        <IoCloseSharp
                            className="clear-icon"
                            onClick={() => setSearchTerm('')}
                        />
                    )}
                </div>
                <div className="filter-section">
                    <MdFilterList className="filter-icon" />
                    <label>
                        <input
                            type="checkbox"
                            checked={activeFilters.myBooks}
                            onChange={() => toggleFilter('myBooks')}
                        />
                        Mis Libros
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={activeFilters.wishlist}
                            onChange={() => toggleFilter('wishlist')}
                        />
                        Lista de Deseos
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={activeFilters.readingList}
                            onChange={() => toggleFilter('readingList')}
                        />
                        Leyendo
                    </label>
                    {/* Add more filter options if needed (e.g., status) */}
                </div>
            </div>

            <main className="main">
                {searchTerm.trim() && searchResults.length === 0 ? (
                    <div className='no-books-message-search'>
                        <IoSearchSharp size={80} />
                        No se encontraron libros con "{searchTerm}".
                    </div>
                ) : (
                    <ul id="bk-list">
                        {searchResults.map(book => (
                            <SearchResultItem
                                key={book.isbn}
                                book={book}
                            />
                        ))}
                    </ul>
                )}
            </main>

        </div>
    );
};

export default Searcher;