import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBookHeart } from "react-icons/lu";
import { FiFileText } from "react-icons/fi";
import { BiBookAdd } from "react-icons/bi";
import { FcLike } from "react-icons/fc";
import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import './WishList.css';

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

// ✅ Componente de libro deseado ordenable
const SortableWishlistItem = ({ book, removeWishlistItem, onShowDescription, moveToMyBooks }) => {
    const navigate = useNavigate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: book.isbn });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const frontStyle = {
        touchAction: 'none',
        cursor: 'grab',
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes}>
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
                    <button
                        className="bk-acquire-button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            moveToMyBooks(book);
                        }}
                    >
                        <BiBookAdd size={35}/>

                    </button>
                    <div
                        className="bookmark-container wished"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeWishlistItem(book.isbn);
                        }}
                    >
                        <FcLike size={35} style={{ stroke: 'black', strokeWidth: 1 }} />
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
            <div className="bk-book" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
                <div className="bk-front" {...listeners} style={frontStyle}>
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

// ✅ Pantalla de Lista de Deseos (WishList) con Drag and Drop
const WishList = () => {
    const [wishlist, setWishlist] = useState(() => {
        const storedWishes = localStorage.getItem('wishList');
        return storedWishes ? JSON.parse(storedWishes) : [];
    });
    const [myBooks, setMyBooks] = useState(() => {
        const storedBooks = localStorage.getItem('myBooks');
        return storedBooks ? JSON.parse(storedBooks) : [];
    });
    const [activeId, setActiveId] = useState(null);
    const [isDraggingAny, setIsDraggingAny] = useState(false);

    useEffect(() => {
        localStorage.setItem('wishList', JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }, [myBooks]);

    useEffect(() => {
        document.body.style.cursor = isDraggingAny ? 'grabbing' : 'default';
    }, [isDraggingAny]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        setIsDraggingAny(true);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        setIsDraggingAny(false);
        if (active.id !== over?.id) {
            const oldIndex = wishlist.findIndex(item => item.isbn === active.id);
            const newIndex = wishlist.findIndex(item => item.isbn === over.id);
            setWishlist(items => arrayMove(items, oldIndex, newIndex));
        }
    };

    const removeWishlistItem = (isbn) => {
        setWishlist(prevList => prevList.filter(book => book.isbn !== isbn));
    };

    const moveToMyBooks = (bookToAdd) => {
        setMyBooks(prevBooks => {
            if (prevBooks.some(book => book.isbn === bookToAdd.isbn)) {
                // Book already exists in MyBooks, you might want to handle this case
                return prevBooks;
            }
            return [...prevBooks, { ...bookToAdd, status: 'Para leer' }];
        });
        removeWishlistItem(bookToAdd.isbn);
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const activeWishlistItem = wishlist.find(item => item.isbn === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="container">
                <main className="main">
                    {wishlist.length === 0 ? (
                        <div className='no-books-message'>
                            <LuBookHeart size={80} />
                            No hay libros en tu lista de deseos.
                        </div>
                    ) : (
                        <SortableContext items={wishlist.map(item => item.isbn)} strategy={verticalListSortingStrategy}>
                            <ul id="bk-list">
                                {wishlist.map((book, index) => (
                                    <SortableWishlistItem
                                        key={book.isbn}
                                        book={book}
                                        removeWishlistItem={removeWishlistItem}
                                        onShowDescription={(desc) => {
                                            setSelectedDescription(desc);
                                            setModalOpen(true);
                                        }}
                                        moveToMyBooks={moveToMyBooks}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    )}
                </main>

                <DragOverlay>
                    {activeId && activeWishlistItem && (
                        <div className="drag-overlay-item">
                            <div className="bk-book">
                                <div className="bk-front">
                                    <div className="bk-cover" style={{ backgroundImage: activeWishlistItem.cover ? `url(${activeWishlistItem.cover}), url(${activeWishlistItem.cover})` : 'none' }}></div>
                                </div>
                            </div>
                            <div className="bk-info">
                                <b className="book-title">{activeWishlistItem.title || 'Autor'}</b>
                                {activeWishlistItem.author && <p className="book-author"><strong>Autor:</strong> {activeWishlistItem.author}</p>}
                            </div>
                        </div>
                    )}
                </DragOverlay>

                {/* Modal */}
                <DescriptionModal
                    isOpen={modalOpen}
                    description={selectedDescription}
                    onClose={() => setModalOpen(false)}
                />
            </div>
        </DndContext>
    );
};

export default WishList;