import React, { useState, useEffect } from 'react';
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
import './MyBooksScreen.css';

const SortableBook = ({ book, index, removeBook }) => {
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
            <div className="bk-info">
                <h3>
                    <span>{book.author || 'Autor'}</span>
                    <span>{book.title || 'Título'}</span>
                </h3>
                <p>{book.shortDescription || 'Sin descripción corta.'}</p>
                <button
                    className="bk-remove-button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // ya incluido, está bien
                        removeBook(book.isbn);
                    }}
                >
                    Eliminar
                </button>
            </div>

            <div className="bk-book">
                <div className="bk-front" {...listeners}> {/* Drag handle aquí */}
                    <div className="bk-cover-back"></div>
                    <div
                        className="bk-cover"
                        style={{
                            backgroundImage: book.cover ? `url(${book.cover})` : 'none',
                        }}
                    ></div>
                </div>
            </div>
        </li>
    );
};

const MyBooksScreen = () => {
    const [myBooks, setMyBooks] = useState(() => {
        const storedBooks = localStorage.getItem('myBooks');
        return storedBooks ? JSON.parse(storedBooks) : [];
    });

    useEffect(() => {
        localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }, [myBooks]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = myBooks.findIndex(book => book.isbn === active.id);
            const newIndex = myBooks.findIndex(book => book.isbn === over.id);
            setMyBooks((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    const removeBook = (isbn) => {
        setMyBooks((prev) => prev.filter(book => book.isbn !== isbn));
    };

    return (
        <div className="container">
            <main className="main">
                {myBooks.length === 0 ? (
                    <p>No hay libros guardados.</p>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={myBooks.map(book => book.isbn)} strategy={verticalListSortingStrategy}>
                            <ul id="bk-list">
                                {myBooks.map((book, index) => (
                                    <SortableBook
                                        key={book.isbn}
                                        book={book}
                                        index={index}
                                        removeBook={removeBook}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
            </main>
        </div>
    );
};

export default MyBooksScreen;
