import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    arrayMove,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { HiOutlineBookmarkAlt } from "react-icons/hi";
import { MdEditDocument } from "react-icons/md";
import { FiFileText } from "react-icons/fi";
import { FcBookmark } from "react-icons/fc";

import './MyReadings.css'; // Reusing the same styles

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

// ✅ Componente de libro en lectura (Sortable)
const SortableReadingBook = ({ book, index, removeBook, onShowDescription, toggleReadingStatus }) => {
    const navigate = useNavigate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: book.isbn });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes}>
            <div className="bookmark-container leyendo" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleReadingStatus(book.isbn);
            }}>
                <FcBookmark size={34} style={{ stroke: 'black', strokeWidth: 2.5 }} className="active-bookmark" />
            </div>
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
                <div className="bk-front" {...listeners}>
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

// ✅ Pantalla de Libros en Lectura (MyReadings)
const MyReadings = () => {
    const [readingList, setReadingList] = useState(() => {
        const storedReading = localStorage.getItem('readingList');
        return storedReading ? JSON.parse(storedReading) : [];
    });
    const [myBooks, setMyBooks] = useState(() => {
        const storedBooks = localStorage.getItem('myBooks');
        return storedBooks ? JSON.parse(storedBooks) : [];
    });

    useEffect(() => {
        localStorage.setItem('readingList', JSON.stringify(readingList));
    }, [readingList]);

    useEffect(() => {
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }, [myBooks]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = readingList.findIndex(book => book.isbn === active.id);
            const newIndex = readingList.findIndex(book => book.isbn === over.id);
            setReadingList((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    const removeBookFromReadingList = (isbn) => {
        setReadingList(prevList => prevList.filter(book => book.isbn !== isbn));
        setMyBooks(prevBooks => prevBooks.map(book =>
            book.isbn === isbn ? { ...book, status: 'Para leer' } : book
        ));
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');

    const toggleReadingStatus = (isbn) => {
        const bookInReadingList = readingList.find(book => book.isbn === isbn);
        setReadingList(prevList => prevList.filter(book => book.isbn !== isbn));
        setMyBooks(prevBooks => prevBooks.map(book =>
            book.isbn === isbn ? { ...book, status: 'Para leer' } : book
        ));
    };

    return (
        <div className="container">
            <main className="main">
                {readingList.length === 0 ? (
                    <div className='no-books-message'>
                        <HiOutlineBookmarkAlt size={80} />
                        No hay libros en tu lista de lectura.
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={readingList.map(book => book.isbn)} strategy={verticalListSortingStrategy}>
                            <ul id="bk-list">
                                {readingList.map((book, index) => (
                                    <SortableReadingBook
                                        key={book.isbn}
                                        book={book}
                                        index={index}
                                        removeBook={removeBookFromReadingList}
                                        onShowDescription={(desc) => {
                                            setSelectedDescription(desc);
                                            setModalOpen(true);
                                        }}
                                        toggleReadingStatus={toggleReadingStatus}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
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

export default MyReadings;