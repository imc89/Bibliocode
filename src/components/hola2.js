import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import "./spinner.css"; // Asegúrate de tener este archivo CSS en el mismo directorio

const BarcodeScanner = () => {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [bookData, setBookData] = useState(null);
    const [loadingBookData, setLoadingBookData] = useState(false);
    const videoRef = useRef(null);
    const codeReader = useRef(new BrowserMultiFormatReader());

    useEffect(() => {
        if (scanning && videoRef.current) {
            startScanning();
        } else {
            stopScanning();
        }
        return () => stopScanning();
    }, [scanning, videoRef.current]);

    const startScanning = () => {
        codeReader.current.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (decodedResult, err) => {
                if (decodedResult) {
                    const isbn = decodedResult.getText();
                    setResult(isbn);
                    setScanning(false);
                    fetchBookData(isbn);
                }
                if (err && !(err.name === "NotFoundException")) {
                    console.error("Decoding error:", err);
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
        try {
            const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
            if (!response.ok) {
                throw new Error("Book not found");
            }
            const data = await response.json();

            const coverUrl = data.covers
                ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
                : null;

            setBookData({
                title: data.title,
                isbn,
                cover: coverUrl,
            });
        } catch (error) {
            console.error("Error fetching book data:", error);
            setBookData(null);
        } finally {
            setLoadingBookData(false);
        }
    };

    const handleClick = () => {
        setResult(null);
        setBookData(null);
        setScanning(true);
    };

    return (
        <div>
            <button onClick={handleClick}>Start Scanning</button>

            {scanning && (
                <div>
                    <video
                        ref={videoRef}
                        width="300"
                        height="200"
                        style={{ border: "1px solid black" }}
                        autoPlay
                    />
                </div>
            )}

            {loadingBookData && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                    <p>Buscando información del libro...</p>
                </div>
            )}

            {bookData && (
                <div style={{ border: "1px solid gray", padding: "10px", marginTop: "20px" }}>
                    {bookData.cover && (
                        <img src={bookData.cover} alt="Book Cover" style={{ width: "150px" }} />
                    )}
                    <h3>{bookData.title}</h3>
                    <p><strong>ISBN:</strong> {bookData.isbn}</p>
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner;