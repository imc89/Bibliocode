import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoSearchSharp, IoCloseSharp } from 'react-icons/io5';
import { MdFilterList } from 'react-icons/md';
import './Searcher.css'; // Dedicated CSS for Searcher

// ✅ Component to display a search result (reusing book styling)
const SearchResultItem = ({ book }) => {
    const navigate = useNavigate();
    return (
        <li className="book-item"> {/* Use a class that might align with MyBooksScreen */}
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
        </li>
    );
};

// ✅ Search Page Component
const Searcher = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        myBooks: true,
        wishlist: true,
        readingList: true,
    });
    const [showFiltersMobile, setShowFiltersMobile] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const myBooksData = JSON.parse(localStorage.getItem('myBooks') || '[]');
        const wishlistData = JSON.parse(localStorage.getItem('wishList') || '[]');
        const readingListData = JSON.parse(localStorage.getItem('readingList') || '[]');
        let combinedBooks = [];
        if (activeFilters.myBooks) combinedBooks = [...combinedBooks, ...myBooksData];
        if (activeFilters.wishlist) combinedBooks = [...combinedBooks, ...wishlistData];
        if (activeFilters.readingList) combinedBooks = [...combinedBooks, ...readingListData];
        const uniqueBooksMap = new Map(combinedBooks.map(book => [book.isbn, book]));
        setAllBooks([...uniqueBooksMap.values()]);
        setInitialLoad(false);
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
        const results = allBooks.filter(book =>
            (book.title && book.title.toLowerCase().includes(lowercasedTerm)) ||
            (book.author && book.author.toLowerCase().includes(lowercasedTerm)) ||
            (book.isbn && book.isbn.includes(lowercasedTerm)) ||
            (book.publishers && book.publishers.some(publisher => publisher.toLowerCase().includes(lowercasedTerm)))
        );
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

    const toggleFiltersMobile = () => {
        setShowFiltersMobile(prev => {
            console.log(!prev); // For debugging
            return !prev;
        });
    };

    const shouldShowNoBooksMessage = !initialLoad && allBooks.length === 0 && !searchTerm.trim();
    const shouldShowInitialSearchMessage = !initialLoad && searchTerm.trim() === '';
    const shouldShowNoResultsMessage = !initialLoad && searchTerm.trim() !== '' && searchResults.length === 0;

    return (
        <div className="search-page-container">
            <div className="search-header">
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
                <button className="filter-button-mobile" onClick={toggleFiltersMobile}>
                    <MdFilterList size={15} className="filter-icon" /> Filtros
                </button>
            </div>
            <div className={`filter-section ${showFiltersMobile ? 'open-mobile' : ''}`}>
                <MdFilterList size={25} className="filter-icon-desktop" />
                <h3 className="filter-title-desktop">Filtrar por colección:</h3>
                <label className='label-filter'>
                    <input
                        type="checkbox"
                        className='check-filter'
                        checked={activeFilters.myBooks}
                        onChange={() => toggleFilter('myBooks')}
                    />
                    Mis Libros
                </label>
                <label className='label-filter'>
                    <input
                        type="checkbox"
                        className='check-filter'
                        checked={activeFilters.readingList}
                        onChange={() => toggleFilter('readingList')}
                    />
                    Leyendo
                </label>
                <label className='label-filter'>
                    <input
                        type="checkbox"
                        className='check-filter'
                        checked={activeFilters.wishlist}
                        onChange={() => toggleFilter('wishlist')}
                    />
                    Lista de Deseos
                </label>
                {/* Add more filter options if needed */}
            </div>
            <main className="main-search">
                {shouldShowNoBooksMessage ? (
                    <div className='no-books-message-search'>
                        <IoSearchSharp size={80} />
                        No hay libros en ninguna de tus colecciones.
                    </div>
                ) : shouldShowInitialSearchMessage ? (
                    <div className='no-books-message-search'>
                        <IoSearchSharp size={80} />
                        Introduzca datos a buscar.
                    </div>
                ) : shouldShowNoResultsMessage ? (
                    <div className='no-books-message-search'>
                        <IoSearchSharp size={80} />
                        No se encontraron libros con el dato: "{searchTerm}".
                    </div>
                ) : (
                    <ul id="bk-lists"> {/* Use the container class from MyBooksScreen */}
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