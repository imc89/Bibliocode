import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import { BiSolidMessageAltError } from "react-icons/bi";
import { FcLikePlaceholder, FcLike } from "react-icons/fc"; // Importa los iconos de "me gusta"

import "./BarcodeScannerScreen.css"; // Archivo CSS dedicado para esta pantalla

const convertImageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const base64String = canvas.toDataURL();
      resolve(base64String);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = url;
  });
};

const fetchFromGoogleBooks = async (isbn, convertImageToBase64, setScannedBookData, setScanError) => {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const data = await res.json();

    if (!data.items || data.totalItems === 0) {
      throw new Error("Libro no encontrado en Google Books.");
    }

    const volume = data.items[0].volumeInfo;
    let coverBase64 = "";
    const coverUrl = volume.imageLinks?.thumbnail;

    if (coverUrl) {
      try {
        coverBase64 = await convertImageToBase64(coverUrl);
      } catch (error) {
        console.warn("Error al convertir la portada de Google Books a Base64:", error);
        coverBase64 = ""; // O puedes usar una imagen por defecto en Base64
      }
    }

    const bookData = {
      title: volume.title || "Título desconocido",
      author: volume.authors?.[0] || "Autor desconocido",
      isbn,
      cover: coverBase64,
      description: volume.description || "",
      publishers: volume.publisher ? [volume.publisher] : [],
      numberOfPages: volume.pageCount || null,
    };

    setScannedBookData(bookData);
    setScanError(null);
  } catch (err) {
    setScanError("No se pudo obtener información del libro en ninguna fuente.");
    console.error("Fallo también en Google Books:", err);
  }
};

const BarcodeScannerScreen = ({ onBookAdded }) => {
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [result, setResult] = useState(null);
  const [scannedBookData, setScannedBookData] = useState(null);
  const [loadingBookData, setLoadingBookData] = useState(false);
  const [manualIsbn, setManualIsbn] = useState("");
  const [isManualIsbnValid, setIsManualIsbnValid] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false); // Estado local para el icono de "me gusta"

  const videoRef = useRef(null);
  const scanTimeout = useRef(null);
  const scanAttempt = useRef(0);

  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
  const codeReader = useRef(new BrowserMultiFormatReader(hints));

  useEffect(() => {
    if (scanning && videoRef.current) {
      startScanning();

      scanTimeout.current = setTimeout(() => {
        setScanning(false);
        setScanError(
          `No se pudo detectar ningún código de barras después de varios intentos.\n
Asegúrate de que el código de barras esté bien iluminado, enfocado y cerca de la cámara.\n
Intenta de nuevo o ingresa el ISBN manualmente.`
        );
      }, 15000);
    } else {
      stopScanning();
      clearTimeout(scanTimeout.current);
      setScanError(null);
      scanAttempt.current = 0;
    }

    return () => {
      stopScanning();
      clearTimeout(scanTimeout.current);
    };
  }, [scanning]);

  useEffect(() => {
    // Comprobar si el libro actual está en la wishlist al cargar los datos
    if (scannedBookData) {
      const wishlist = localStorage.getItem('wishList');
      const wishlistedBooks = wishlist ? JSON.parse(wishlist) : [];
      setIsWishlisted(wishlistedBooks.some(book => book.isbn === scannedBookData.isbn));
    }
  }, [scannedBookData]);

  const startScanning = () => {
    scanAttempt.current++;

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

        if (
          err &&
          !(err.name === "NotFoundException" || err.message.includes("No MultiFormat Readers"))
        ) {
          console.warn(`Intento ${scanAttempt.current} fallido:`, err);
        }
      }
    );
  };

  const stopScanning = () => {
    codeReader.current.reset();
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const fetchBookData = useCallback(async (isbn) => {
    setLoadingBookData(true);
    setScannedBookData(null);
    setIsWishlisted(false); // Resetear el estado de wishlist al buscar un nuevo libro

    try {
      // Intentar con OpenLibrary (primera llamada por ISBN)
      const resIsbn = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      if (!resIsbn.ok) throw new Error("No encontrado en OpenLibrary (ISBN)");
      const dataIsbn = await resIsbn.json();

      let title = dataIsbn.title || "Título desconocido";
      let description = "";
      let author = "Autor desconocido";
      let worksKey = dataIsbn.works?.[0]?.key;
      let publishers = dataIsbn.publishers || [];
      let numberOfPages = dataIsbn.number_of_pages || null;
      let coverBase64 = "";

      // Buscar descripción más detallada y author key desde la 'obra' (segunda llamada)
      if (worksKey) {
        const resWorks = await fetch(`https://openlibrary.org${worksKey}.json`);
        if (resWorks.ok) {
          const dataWorks = await resWorks.json();

          if (typeof dataWorks.description === "string") {
            description = dataWorks.description;
          } else if (dataWorks.description?.value) {
            description = dataWorks.description.value;
          }

          if (dataWorks.authors?.[0]?.author?.key) {
            const authorKey = dataWorks.authors[0].author.key;
            const authorId = authorKey.split('/').pop();
            const resAuthor = await fetch(`https://openlibrary.org/authors/${authorId}.json`);
            if (resAuthor.ok) {
              const authorData = await resAuthor.json();
              author = authorData.name || author;
            } else {
              console.warn("Error fetching author data:", resAuthor.status);
            }
          }
        } else {
          console.warn("Error fetching works data:", resWorks.status);
        }
      }

      const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
      try {
        coverBase64 = await convertImageToBase64(coverUrl);
      } catch (error) {
        console.warn("Error al convertir la portada a Base64:", error);
        coverBase64 = ""; // O puedes usar una imagen por defecto en Base64
      }

      setScannedBookData({
        title,
        author,
        isbn,
        cover: coverBase64,
        description,
        publishers,
        numberOfPages,
      });

      setScanError(null);
    } catch (err) {
      console.warn("Fallo en OpenLibrary, intentando Google Books...", err);
      await fetchFromGoogleBooks(isbn, convertImageToBase64, setScannedBookData, setScanError);
    }

    setLoadingBookData(false);
    setScanning(false);
  }, [convertImageToBase64, setScannedBookData, setScanError]);

  const handleClickScan = () => {
    setResult(null);
    setScannedBookData(null);
    setScanError(null);
    setScanning(true);
    setIsWishlisted(false); // Resetear el estado de wishlist al iniciar un nuevo escaneo
  };

  const handleAddBook = () => {
    if (scannedBookData && onBookAdded) {
      onBookAdded(scannedBookData);
      setScannedBookData(null);
      setIsWishlisted(false); // Resetear el estado de wishlist después de agregar
    }
  };

  const handleManualIsbnChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value) && value.length <= 13) {
      setManualIsbn(value);
      setIsManualIsbnValid(value.length === 13);
    }
  };

  const handleSearchManualIsbn = () => {
    if (isManualIsbnValid) {
      fetchBookData(manualIsbn);
      setManualIsbn(""); // Limpiar el input después de la búsqueda
      setIsManualIsbnValid(false); // Resetear la validez
      setIsWishlisted(false); // Resetear el estado de wishlist al buscar manualmente
    }
  };

  const toggleWishlist = () => {
    if (scannedBookData) {
      const wishlist = localStorage.getItem('wishList');
      const wishlistedBooks = wishlist ? JSON.parse(wishlist) : [];
      const isAlreadyInWishlist = wishlistedBooks.some(book => book.isbn === scannedBookData.isbn);

      let updatedWishlist;
      if (isAlreadyInWishlist) {
        updatedWishlist = wishlistedBooks.filter(book => book.isbn !== scannedBookData.isbn);
        setIsWishlisted(false);
      } else {
        updatedWishlist = [...wishlistedBooks, scannedBookData];
        setIsWishlisted(true);
      }

      localStorage.setItem('wishList', JSON.stringify(updatedWishlist));
    }
  };

  return (
    <div className="barcode-scanner-container">
      <h2 className="scanner-title">Escanear ISBN</h2>
      <button className="scan-button" onClick={handleClickScan}>
        Escanear ISBN
      </button>

      {scanning && (
        <div className="scanning-area">
          <video ref={videoRef} className="scanner-video" autoPlay />
          <p className="scanner-instruction">
            Apunta la cámara al código de barras del ISBN.
          </p>
          <p className="scanner-instruction">
            Asegúrate de que esté bien iluminado y enfocado.
          </p>
        </div>
      )}

      {scanError && (
        <div className="warning">
          <BiSolidMessageAltError size={24} />
          {scanError}
        </div>
      )}

      {loadingBookData && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Buscando información del libro...</p>
        </div>
      )}

      {scannedBookData && !scanning && !loadingBookData && (
        <div className="book-info-container">
          <button className="wishlist-button" onClick={toggleWishlist}>
            {isWishlisted ? <FcLike size={35} style={{ stroke: 'black', strokeWidth: 1 }}  /> : <FcLikePlaceholder size={35} style={{ stroke: 'black', strokeWidth: 1 }} />}
          </button>
          {scannedBookData.cover && (
            <img
              src={scannedBookData.cover}
              alt="Portada del libro"
              className="book-cover"
            />
          )}
          <h3 className="book-title">{scannedBookData.title}</h3>
          {scannedBookData.author && (
            <p className="book-author">
              <strong>Autor:</strong> {scannedBookData.author}
            </p>
          )}
          <p className="book-isbn">
            <strong>ISBN:</strong> {scannedBookData.isbn}
          </p>
          {scannedBookData.publishers && scannedBookData.publishers.length > 0 && (
            <p className="book-publishers">
              <strong>Editorial:</strong> {scannedBookData.publishers.join(', ')}
            </p>
          )}
          {scannedBookData.numberOfPages !== null && (
            <p className="book-pages">
              <strong>Páginas:</strong> {scannedBookData.numberOfPages}
            </p>
          )}
          {scannedBookData.description && (
            <p className="book-description">
              <strong>Descripción:</strong>{" "}
              {scannedBookData.description.substring(0, 150)}...
            </p>
          )}
          <button className="add-book-button" onClick={handleAddBook}>
            Agregar a Mis Libros
          </button>
        </div>
      )}

      <div className="manual-input-container">
        <h3 className="manual-title">¿No puedes escanear?</h3>
        <p className="manual-instruction">Ingresa el ISBN manualmente:</p>
        <input
          type="text"
          className="manual-input"
          placeholder="Ingresar ISBN (13 dígitos)"
          value={manualIsbn}
          onChange={handleManualIsbnChange}
        />
        <button
          className="manual-search-button"
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