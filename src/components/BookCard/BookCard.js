import React from 'react';
import './BookCard.css'; // Importa el archivo CSS global

const BookCard = ({ book, onRemove }) => {
    const handleRemove = () => {
        console.log('Botón eliminar pulsado para ISBN (BookCard):', book.isbn);
        onRemove(book.isbn);
    };

    // Determina la clase del libro basada en el índice o alguna propiedad del libro
    const bookClass = `book-${book.id}`; // Asumiendo que cada libro tiene un 'id' para la clase
    const frontStyle = {
        backgroundImage: book.cover ? `url(${book.cover})` : 'none',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '10px 40px', // Ajusta según sea necesario
    };

    return (
        <div className={`bk-book ${bookClass} bk-bookdefault`}>
            <div className="bk-front">
                <div className="bk-cover-back"></div>
                <div className="bk-cover" style={frontStyle}>
                    <h2>
                        <span>{book.author}</span>
                        <span>{book.title}</span>
                    </h2>
                </div>
            </div>
            {/* Por ahora, no incluiremos la funcionalidad de "ver dentro" */}
            {/* <div className="bk-page">
                <div className="bk-content bk-content-current">
                    <p>Contenido de la página 1...</p>
                </div>
                <div className="bk-content">
                    <p>Contenido de la página 2...</p>
                </div>
                <div className="bk-content">
                    <p>Contenido de la página 3...</p>
                </div>
            </div> */}
            <div className="bk-back">
                <p>{book.description}</p> {/* Asumiendo que tienes una descripción */}
            </div>
            <div className="bk-right"></div>
            <div className="bk-left">
                <h2>
                    <span>{book.author}</span>
                    <span>{book.title}</span>
                </h2>
            </div>
            <div className="bk-top"></div>
            <div className="bk-bottom"></div>
            <div className="bk-info">
                {/* <button className="bk-bookback">Flip</button>
                <button className="bk-bookview">View inside</button> */}
                <h3>
                    <span>{book.author}</span>
                    <span>{book.title}</span>
                </h3>
                <p>{book.shortDescription}</p> {/* Asumiendo una descripción corta */}
                <button className="bk-remove-button" onClick={handleRemove}>
                    Eliminar
                </button>
            </div>
        </div>
    );
};

export default BookCard;