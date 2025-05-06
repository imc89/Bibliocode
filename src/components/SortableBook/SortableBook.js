import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import BookCard from '../BookCard/BookCard';
import styles from './SortableBook.css';

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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={styles.container}
        >
            <BookCard book={book} onRemove={removeBook} />
        </div>
    );
};

export default SortableBook;