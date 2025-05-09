import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBookHeart } from "react-icons/lu";
import { FiFileText } from "react-icons/fi";
import { FcLike } from "react-icons/fc"; // Using the filled like icon

import './WishList.css'; // Reusing styles for consistency

// ✅ Modal de descripción (reusing the existing one)
const DescriptionModal = ({ isOpen, onClose, description }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Descripción</h2>
                <p className="modal-description">{description || 'Sin descripción corta.'}</p>
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

// ✅ Componente de libro deseado
const WishlistItem = ({ book, removeWishlistItem, onShowDescription }) => {
    const navigate = useNavigate();

    return (
        <li>
            <div className="bk-info">
                <b className="book-title">{book.title || 'Autor'}</b>

                {book.author && book.author.length > 0 && (
                    <p className="book-author"><strong>Autor:</strong> {book.author}</p>
                )}
                {book.publishers && book.publishers.length > 0 && (
                    <p className="book-publishers"><strong>Editorial:</strong> {Array.isArray(book.publishers) ? book.publishers.join(', ') : book.publishers}</p>
                )}
                {book.numberOfPages !== null && (
                    <p className="book-pages"><strong>Páginas:</strong> {book.numberOfPages}</p>
                )}
                <div className="bk-buttons-wish">
                <div
                        className="bookmark-container wished"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeWishlistItem(book.isbn);
                        }}
                    >
                        <FcLike size={35} style={{ stroke: 'black', strokeWidth: 1 }}  /> 
                    </div>
                    {book.description && (
                        <button
                            className="bk-desc-button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onShowDescription(book.description);
                            }}
                        >
                            <FiFileText size={20} />
                        </button>
                    )}
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

// ✅ Pantalla de Lista de Deseos (WishList)
const WishList = () => {
    const [wishlist, setWishlist] = useState(() => {
        const storedWishes = localStorage.getItem('wishList');
        return storedWishes ? JSON.parse(storedWishes) : [];
    });

    useEffect(() => {
        localStorage.setItem('wishList', JSON.stringify(wishlist));
    }, [wishlist]);

    const removeWishlistItem = (isbn) => {
        setWishlist(prevList => prevList.filter(book => book.isbn !== isbn));
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');

    return (
        <div className="container">
            <main className="main">
                {wishlist.length === 0 ? (
                    <div className='no-books-message'>
                        <LuBookHeart size={80} />
                        No hay libros en tu lista de deseos.
                    </div>
                ) : (
                    <ul id="bk-list">
                        {wishlist.map((book, index) => (
                            <WishlistItem
                                key={book.isbn}
                                book={book}
                                removeWishlistItem={removeWishlistItem}
                                onShowDescription={(desc) => {
                                    setSelectedDescription(desc);
                                    setModalOpen(true);
                                }}
                            />
                        ))}
                    </ul>
                )}
            </main>

            {/* Modal */}
            <DescriptionModal
                isOpen={modalOpen}
                description={selectedDescription}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
};

export default WishList;