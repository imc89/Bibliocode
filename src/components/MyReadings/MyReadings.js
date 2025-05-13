import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    DragOverlay, // Import DragOverlay
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
import { BiSolidBookmark } from "react-icons/bi";

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
const SortableReadingBook = ({ book, index, onShowDescription, toggleReadingStatus }) => {
    const navigate = useNavigate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging, // Get isDragging
    } = useSortable({ id: book.isbn });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1, // Add opacity feedback
    };

    const frontStyle = {
        touchAction: 'none',
        cursor: 'grab',
    };

    return (
        <li ref={setNodeRef} style={style} {...attributes}>
            <div className="bookmark-container leyendo" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleReadingStatus(book.isbn);
            }}>
                <BiSolidBookmark size={32} style={{ fill: 'red', stroke: 'black', strokeWidth: 1.5 }} className="active-bookmark" />
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

            <div className="bk-book" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}> {/* Apply cursor */}
                <div className="bk-front" {...listeners} style={frontStyle}> {/* Apply listeners and style */}
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
    const [activeId, setActiveId] = useState(null);
    const [isDraggingAny, setIsDraggingAny] = useState(false); // Track dragging state

    useEffect(() => {
        localStorage.setItem('readingList', JSON.stringify(readingList));
    }, [readingList]);

    useEffect(() => {
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }, [myBooks]);

    useEffect(() => {
        document.body.style.cursor = isDraggingAny ? 'grabbing' : 'default'; // Apply cursor to body
    }, [isDraggingAny]);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            delay: 100,
            tolerance: 5,
        },
    }));

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        setIsDraggingAny(true); // Set dragging state
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        setIsDraggingAny(false); // Reset dragging state
        if (active.id !== over?.id) {
            const oldIndex = readingList.findIndex(book => book.isbn === active.id);
            const newIndex = readingList.findIndex(book => book.isbn === over.id);
            setReadingList((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const activeBook = readingList.find(book => book.isbn === activeId); // Get active book for DragOverlay

    const toggleReadingStatus = (isbn) => {
        const bookToToggle = readingList.find(book => book.isbn === isbn);
        if (!bookToToggle) {
            const bookToAdd = myBooks.find(book => book.isbn === isbn);
            if (bookToAdd) {
                setReadingList(prevList => [...prevList, { ...bookToAdd, status: 'Leyendo' }]);
                setMyBooks(prevBooks => prevBooks.map(b =>
                    b.isbn === isbn ? { ...b, status: 'Leyendo' } : b
                ));
            }
        } else {
            setReadingList(prevList => prevList.filter(book => book.isbn !== isbn));
            setMyBooks(prevBooks => prevBooks.map(b =>
                b.isbn === isbn ? { ...b, status: 'Para leer' } : b
            ));
        }
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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart} // Add onDragStart
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={readingList.map(book => book.isbn)} strategy={verticalListSortingStrategy}>
                            <ul id="bk-list">
                                {readingList.map((book, index) => (
                                    <SortableReadingBook
                                        key={book.isbn}
                                        book={book}
                                        index={index}
                                        onShowDescription={(desc) => {
                                            setSelectedDescription(desc);
                                            setModalOpen(true);
                                        }}
                                        toggleReadingStatus={toggleReadingStatus}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                        <DragOverlay> {/* Add DragOverlay */}
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

export default MyReadings;