import React, { useState, useRef, useEffect } from "react";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import { BiSolidMessageAltError } from "react-icons/bi";

import "./BarcodeScannerScreen.css"; // Archivo CSS dedicado para esta pantalla

const BarcodeScannerScreen = ({ onBookAdded }) => {
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [result, setResult] = useState(null);
  const [scannedBookData, setScannedBookData] = useState(null);
  const [loadingBookData, setLoadingBookData] = useState(false);
  const [manualIsbn, setManualIsbn] = useState("");
  const [isManualIsbnValid, setIsManualIsbnValid] = useState(false);

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

  const fetchBookData = async (isbn) => {
    setLoadingBookData(true);
    setScannedBookData(null);
  
    try {
      const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      if (!response.ok) throw new Error("Libro no encontrado");
      const data = await response.json();
  
      // ✅ Limpiar error si llega un libro correctamente
      setScanError(null);
  
      const bookData = {
        title: data.title || "Título desconocido",
        author: data.authors ? data.authors[0]?.name || "Autor desconocido" : null,
        isbn,
        cover: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
        description: typeof data.description === "string"
          ? data.description
          : data.description?.value || "",
      };
  
      setScannedBookData(bookData);
    } catch (err) {
      setScanError("No se pudo obtener la información del libro.");
      console.error(err);
    }
  
    setLoadingBookData(false);
    setScanning(false);
  };
  

  const handleClickScan = () => {
    setResult(null);
    setScannedBookData(null);
    setScanError(null);
    setScanning(true);
  };

  const handleAddBook = () => {
    if (scannedBookData && onBookAdded) {
      onBookAdded(scannedBookData);
      setScannedBookData(null);
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
          <video
            ref={videoRef}
            className="scanner-video"
            autoPlay
          />
          <p className="scanner-instruction">
            Apunta la cámara al código de barras del ISBN.
          </p>
          <p className="scanner-instruction">
            Asegúrate de que esté bien iluminado y enfocado.
          </p>
        </div>
      )}


      {scanError && <div className="warning">
          <BiSolidMessageAltError  size={24} />
          {scanError}
        </div>}

      {loadingBookData && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Buscando información del libro...</p>
        </div>
      )}

      {scannedBookData && !scanning && !loadingBookData && (
        <div className="book-info-container">
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