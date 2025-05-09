import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { IoLibrarySharp } from "react-icons/io5";
import { MdEditDocument } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { BiSolidBookmark } from "react-icons/bi";
import { FcBookmark } from "react-icons/fc";

import './MyBooksScreen.css';

// ✅ Modal de descripción
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

// ✅ Componente de libro ordenable
const SortableBook = ({ book, index, removeBook, onShowDescription, toggleReadingStatus }) => {
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
            {book.status === 'Leyendo' ? (
                <div className="bookmark-container leyendo" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleReadingStatus(book.isbn);
                }}>
                    <FcBookmark size={34} style={{ stroke: 'black', strokeWidth: 2.5 }} className="active-bookmark" />
                </div>
            ) : (
                <div className="bookmark-container no-leyendo" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleReadingStatus(book.isbn);
                }}>
                    <BiSolidBookmark size={32} style={{ stroke: 'black', strokeWidth: 1.5 }} className="inactive-bookmark" />
                </div>
            )}
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
                <div className="bk-buttons">
                    <button
                        className="bk-remove-button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeBook(book.isbn);
                        }}
                    >
                        Eliminar
                    </button>
                    <button
                        className="bk-edit-button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/editar/${book.isbn}`);
                        }}
                    >
                        <MdEditDocument size={20} />
                    </button>
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

// ✅ Pantalla principal
const MyBooksScreen = () => {
    const [myBooks, setMyBooks] = useState(() => {
        const storedBooks = localStorage.getItem('myBooks');
        return storedBooks ? JSON.parse(storedBooks) : [];
    });
    const [readingList, setReadingList] = useState(() => {
        const storedReading = localStorage.getItem('readingList');
        return storedReading ? JSON.parse(storedReading) : [];
    });
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }, [myBooks]);

    useEffect(() => {
        localStorage.setItem('readingList', JSON.stringify(readingList));
    }, [readingList]);

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
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (active.id !== over?.id) {
            const oldIndex = myBooks.findIndex(book => book.isbn === active.id);
            const newIndex = myBooks.findIndex(book => book.isbn === over.id);
            setMyBooks((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    const removeBook = (isbn) => {
        setMyBooks((prev) => prev.filter(book => book.isbn !== isbn));
        setReadingList((prevList) => prevList.filter(book => book.isbn !== isbn));
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');

    const toggleReadingStatus = (isbn) => {
        const bookToToggle = myBooks.find(book => book.isbn === isbn);
        if (!bookToToggle) return;

        const isCurrentlyReading = readingList.some(book => book.isbn === isbn);

        if (isCurrentlyReading) {
            setReadingList(prevList => prevList.filter(book => book.isbn !== isbn));
            setMyBooks(prevBooks => prevBooks.map(book =>
                book.isbn === isbn ? { ...book, status: 'Para leer' } : book
            ));
        } else {
            setReadingList(prevList => [...prevList, bookToToggle]);
            setMyBooks(prevBooks => prevBooks.map(book =>
                book.isbn === isbn ? { ...book, status: 'Leyendo' } : book
            ));
        }
    };

    const activeBook = myBooks.find(book => book.isbn === activeId);

    return (
        <div className="container">
            <main className="main">
                {myBooks.length === 0 ? (
                    <div className='no-books-message'>
                        <IoLibrarySharp size={80} />
                        No hay libros guardados.
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={myBooks.map(book => book.isbn)} strategy={verticalListSortingStrategy}>
                            <ul id="bk-list">
                                {myBooks.map((book, index) => (
                                    <SortableBook
                                        key={book.isbn}
                                        book={book}
                                        index={index}
                                        removeBook={removeBook}
                                        onShowDescription={(desc) => {
                                            setSelectedDescription(desc);
                                            setModalOpen(true);
                                        }}
                                        toggleReadingStatus={toggleReadingStatus}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                        <DragOverlay>
                            {activeId && activeBook && (
                                <div className="drag-overlay-item">
                                    <div className="bk-book">
                                        <div className="bk-front">
                                            <div className="bk-cover" style={{ backgroundImage: activeBook.cover ? `url(${activeBook.cover}), url(${activeBook.cover})` : 'none' }}></div>
                                        </div>
                                    </div>
                                    <div className="bk-info">
                                        <b className="book-title">{activeBook.title || 'Autor'}</b>
                                        {activeBook.author && <p className="book-author"><strong>Autor:</strong> {activeBook.author}</p>}
                                    </div>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
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

export default MyBooksScreen;