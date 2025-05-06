import React from 'react';
import SortableBook from '../SortableBook/SortableBook';
import styles from './BookGrid.css';

const BookGrid = ({ books, removeBook }) => {
    return (
        <div className={styles.grid}>
            {books.map((book, index) => (
                <SortableBook
                    key={book.isbn}
                    book={book}
                    index={index}
                    removeBook={removeBook}
                />
            ))}
        </div>
    );
};

export default BookGrid;