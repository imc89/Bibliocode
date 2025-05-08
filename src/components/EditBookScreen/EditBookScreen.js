// EditBookScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditBookScreen.css';
import { GiBookCover } from "react-icons/gi";
import { LuSave } from "react-icons/lu"; // Importa el icono de guardar

const estados = ['Para leer', 'Leyendo', 'Leído'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const EditBookScreen = () => {
    const { isbn } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState({
        title: '',
        author: '',
        cover: null,
        status: 'Para leer',
        publishers: '',
        numberOfPages: '',
    });
    const [dragOver, setDragOver] = useState(false);
    const [allPublishers, setAllPublishers] = useState([]);
    const [allAuthors, setAllAuthors] = useState([]);
    const [originalCover, setOriginalCover] = useState(null);

    useEffect(() => {
        const storedBooks = JSON.parse(localStorage.getItem('myBooks')) || [];
        const bookToEdit = storedBooks.find(b => b.isbn === isbn);
        if (bookToEdit) {
            const { title, author, publishers, status, numberOfPages, cover } = bookToEdit;
            setBook({
                title: title || '',
                author: author || '',
                publishers: publishers || '',
                status: status || 'Para leer',
                numberOfPages: numberOfPages !== undefined ? String(numberOfPages) : '',
                cover: null, // No mostrar imagen precargada
            });
            setOriginalCover(cover); // Guardar imagen previa para el guardado
        }

        const publishers = new Set();
        const authors = new Set();
        storedBooks.forEach(b => {
            if (b.publishers) {
                if (Array.isArray(b.publishers)) {
                    b.publishers.forEach(p => publishers.add(p));
                } else {
                    publishers.add(b.publishers);
                }
            }
            if (b.author) {
                authors.add(b.author);
            }
        });
        setAllPublishers(Array.from(publishers).sort());
        setAllAuthors(Array.from(authors).sort());
    }, [isbn]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'numberOfPages' && value && !/^[0-9]*$/.test(value)) {
            return;
        }
        setBook(prev => ({ ...prev, [name]: value }));
    };

    const handleFile = useCallback((file) => {
        if (file && ALLOWED_IMAGE_TYPES.includes(file.type)) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBook(prev => ({ ...prev, cover: reader.result }));
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert('Por favor, selecciona un formato de imagen válido (JPEG, PNG, GIF).');
        }
    }, []);

    const handleImageDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleImageClick = () => {
        document.getElementById('coverInput').click();
    };

    const handleImageSelect = useCallback((e) => {
        const file = e.target.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleSave = () => {
        const storedBooks = JSON.parse(localStorage.getItem('myBooks')) || [];
        const updatedBooks = storedBooks.map(b => {
            if (b.isbn === isbn) {
                return {
                    ...b,
                    ...book,
                    numberOfPages: book.numberOfPages ? parseInt(book.numberOfPages, 10) : (book.numberOfPages === '' ? null : b.numberOfPages),
                    cover: book.cover !== null ? book.cover : originalCover,
                };
            }
            return b;
        });

        localStorage.setItem('myBooks', JSON.stringify(updatedBooks));
        navigate('/');
    };

    return (
        <div className="edit-book-screen">
            <main className="edit-book-content">

                <div className="save-button-container"> {/* Contenedor para centrar el botón */}
                    <button onClick={handleSave} className="save-button">
                        <LuSave size={20} className="save-icon" />
                        <span>Guardar Cambios</span>
                    </button>
                </div>

                <section className="section">
                    <label className="section-label">PORTADA</label>
                    <div
                        className={`cover-drop-zone ${dragOver ? 'drag-over' : ''}`}
                        onDrop={handleImageDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={handleImageClick}
                    >
                        {book.cover ? (
                            <img src={book.cover} alt="Portada" className="cover-preview" />
                        ) : (
                            <div className="cover-message">
                                <GiBookCover size={80} />
                                <span>AÑADE UNA NUEVA PORTADA</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/gif"
                            id="coverInput"
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                    </div>
                </section>

                <section className="section">
                    <label className="section-label">TÍTULO</label>
                    <input
                        type="text"
                        name="title"
                        value={book.title}
                        onChange={handleChange}
                        placeholder="Título"
                        className="text-input"
                    />
                </section>

                <section className="section">
                    <label className="section-label">AUTOR</label>
                    <input
                        type="text"
                        name="author"
                        value={book.author}
                        onChange={handleChange}
                        placeholder="Autor"
                        list="author-list"
                        className="text-input"
                    />
                    <datalist id="author-list">
                        {allAuthors.map(author => (
                            <option key={author} value={author} />
                        ))}
                    </datalist>
                </section>

                <section className="section">
                    <label className="section-label">EDITORIAL</label>
                    <input
                        type="text"
                        name="publishers"
                        value={book.publishers}
                        onChange={handleChange}
                        placeholder="Editorial"
                        list="publisher-list"
                        className="text-input"
                    />
                    <datalist id="publisher-list">
                        {allPublishers.map(publisher => (
                            <option key={publisher} value={publisher} />
                        ))}
                    </datalist>
                </section>

                <section className="section">
                    <label className="section-label">PÁGINAS</label>
                    <input
                        type="text"
                        name="numberOfPages"
                        value={book.numberOfPages}
                        onChange={handleChange}
                        placeholder="Número de páginas"
                        className="text-input"
                        maxLength="5"
                    />
                </section>
            </main>
        </div>
    );
};

export default EditBookScreen;
