import React, { useState, useEffect, useRef } from 'react';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableBook = ({ book, index, removeBook }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: book.isbn, index });

    const style = {
        transform: transform ? `translate3d(${transform?.x}px, ${transform?.y}px, 0)` : undefined,
        transition,
    };

    const [isOverButton, setIsOverButton] = useState(false);

    const handleButtonClick = () => {
        console.log('Botón eliminar pulsado para ISBN:', book.isbn);
        removeBook(book.isbn);
    };

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '15px',
                margin: '10px',
                backgroundColor: 'white',
                cursor: isOverButton ? 'pointer' : 'grab',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            {...(!isOverButton ? attributes : {})}
            {...(!isOverButton ? listeners : {})}
        >
            {book.cover && (
                <img
                    src={book.cover}
                    alt="Portada del libro"
                    style={{ width: '80px', height: '120px', objectFit: 'cover', marginBottom: '10px', borderRadius: '4px' }}
                />
            )}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '1.1em' }}>{book.title}</strong>
                <p style={{ fontSize: '0.9em', color: '#757575' }}>ISBN: {book.isbn}</p>
            </div>
            <button
                draggable="false"
                onClick={handleButtonClick}
                onMouseEnter={() => setIsOverButton(true)}
                onMouseLeave={() => setIsOverButton(false)}
                style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 15px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                }}
            >
                Eliminar
            </button>
        </div>
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

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = myBooks.findIndex(book => book.isbn === active.id);
            const newIndex = myBooks.findIndex(book => book.isbn === over?.id);

            setMyBooks((items) => arrayMove(items, oldIndex, newIndex));
        }
    };

    const removeBook = (isbn) => {
        console.log('Eliminar libro con ISBN (función MyBooksScreen):', isbn);
        const updatedBooks = myBooks.filter(book => book.isbn !== isbn);
        setMyBooks(updatedBooks);
    };

    return (
        <div>
            <h2>Mis Libros</h2>
            {myBooks.length === 0 ? (
                <p>No has agregado ningún libro aún.</p>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={myBooks.map(book => book.isbn)} id="books">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px', padding: '20px' }}>
                            {myBooks.map((book, index) => (
                                <SortableBook
                                    key={book.isbn}
                                    book={book}
                                    index={index}
                                    removeBook={removeBook}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

export default MyBooksScreen;