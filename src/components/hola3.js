import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import "./spinner.css"; // Asegúrate de tener este archivo CSS

const BarcodeScannerScreen = ({ onBookAdded }) => {
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState(null);
    const [result, setResult] = useState(null);
    const [scannedBookData, setScannedBookData] = useState(null);
    const [loadingBookData, setLoadingBookData] = useState(false);
    const videoRef = useRef(null);
    const codeReader = useRef(new BrowserMultiFormatReader());
    const scanTimeout = useRef(null);
    const [manualIsbn, setManualIsbn] = useState("");
    const [isManualIsbnValid, setIsManualIsbnValid] = useState(false);

    useEffect(() => {
        if (scanning && videoRef.current) {
            startScanning();
            scanTimeout.current = setTimeout(() => {
                setScanning(false);
                setScanError("No se pudo detectar ningún código de barras. Intenta de nuevo o ingresa el ISBN manualmente.");
            }, 10000);
        } else {
            stopScanning();
            clearTimeout(scanTimeout.current);
            setScanError(null);
        }
        return () => stopScanning();
    }, [scanning, videoRef.current]);

    useEffect(() => {
        // Validar el ISBN manual cuando cambia
        const isValid = /^\d+$/.test(manualIsbn) && manualIsbn.length <= 13 && manualIsbn.length > 0;
        setIsManualIsbnValid(isValid);
    }, [manualIsbn]);

    const startScanning = () => {
        codeReader.current.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (decodedResult, err) => {
                if (decodedResult) {
                    const isbn = decodedResult.getText();
                    setResult(isbn);
                    setScanning(false);
                    clearTimeout(scanTimeout.current);
                    fetchBookData(isbn);
                }
                if (err && !(err.name === "NotFoundException")) {
                    console.error("Decoding error:", err);
                    setScanError("Error al decodificar el código de barras.");
                    setScanning(false);
                    clearTimeout(scanTimeout.current);
                }
            }
        );
    };

    const stopScanning = () => {
        codeReader.current.reset();
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const fetchBookData = async (isbn) => {
        setLoadingBookData(true);
        setScannedBookData(null); // Limpiar datos previos
        let bookData = null;
        let errorFromOpenLibrary = false;

        try {
            const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
            if (!response.ok) {
                errorFromOpenLibrary = true;
                console.warn(`Open Library API error (${response.status}):`, response);
            } else {
                const data = await response.json();
                const coverUrl = data.covers
                    ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
                    : null;
                bookData = {
                    title: data.title,
                    isbn,
                    cover: coverUrl,
                };
            }
        } catch (error) {
            errorFromOpenLibrary = true;
            console.error("Error fetching book data from Open Library:", error);
        }

        if (errorFromOpenLibrary || !bookData) {
            console.log("Trying Google Books API...");
            try {
                const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
                if (!response.ok) {
                    throw new Error(`Google Books API error (${response.status}): ${response.statusText}`);
                }
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    const bookInfo = data.items[0].volumeInfo;
                    const coverUrl = bookInfo.imageLinks?.large || bookInfo.imageLinks?.thumbnail || null;
                    bookData = {
                        title: bookInfo.title,
                        isbn,
                        author: bookInfo.authors ? bookInfo.authors.join(", ") : undefined,
                        description: bookInfo.description,
                        cover: coverUrl?.replace(/^http:/, 'https:'), // Ensure HTTPS
                    };
                } else {
                    console.log("Book not found on Google Books either.");
                }
            } catch (error) {
                console.error("Error fetching book data from Google Books:", error);
            }
        }

        setScannedBookData(bookData);
        setLoadingBookData(false);
        setScanning(false);
    };

    const handleClickScan = () => {
        setResult(null);
        setScannedBookData(null);
        setScanning(true);
        setScanError(null);
    };

    const handleAddBook = () => {
        if (scannedBookData && onBookAdded) {
            onBookAdded(scannedBookData);
            setScannedBookData(null);
        }
    };

    const handleManualIsbnChange = (event) => {
        const value = event.target.value;
        // Solo permitir números y hasta 13 caracteres
        if (/^\d*$/.test(value) && value.length <= 13) {
            setManualIsbn(value);
        }
    };

    const handleSearchManualIsbn = () => {
        if (isManualIsbnValid) {
            fetchBookData(manualIsbn);
        }
    };

    return (
        <div>
            <h2>Escanear ISBN</h2>
            <button onClick={handleClickScan}>Escanear ISBN</button>

            {scanning && (
                <div>
                    <video
                        ref={videoRef}
                        width="300"
                        height="200"
                        style={{ border: "1px solid black" }}
                        autoPlay
                    />
                    <p>Apunta la cámara al código de barras del ISBN.</p>
                </div>
            )}

            {scanError && <p style={{ color: 'red' }}>{scanError}</p>}

            {loadingBookData && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Buscando información del libro...</p>
                </div>
            )}

            {scannedBookData && !scanning && !loadingBookData && (
                <div style={{ border: "1px solid gray", padding: "10px", marginTop: "20px" }}>
                    {scannedBookData.cover && (
                        <img src={scannedBookData.cover} alt="Book Cover" style={{ width: "150px" }} />
                    )}
                    <h3>{scannedBookData.title}</h3>
                    {scannedBookData.author && <p><strong>Autor:</strong> {scannedBookData.author}</p>}
                    <p><strong>ISBN:</strong> {scannedBookData.isbn}</p>
                    {scannedBookData.description && <p><strong>Descripción:</strong> {scannedBookData.description.substring(0, 150)}...</p>}
                    <button onClick={handleAddBook} style={{ marginTop: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>Agregar a Mis Libros</button>
                </div>
            )}

            <div>
                <h3>¿No puedes escanear?</h3>
                <p>Ingresa el ISBN manualmente:</p>
                <input
                    type="text"
                    placeholder="Ingresar ISBN"
                    value={manualIsbn}
                    onChange={handleManualIsbnChange}
                />
                <button
                    style={{ marginTop: '10px' }}
                    onClick={handleSearchManualIsbn}
                    disabled={!isManualIsbnValid}
                >
                    Buscar por ISBN
                </button>
            </div>
        </div>
    );
};

export default BarcodeScannerScreen;