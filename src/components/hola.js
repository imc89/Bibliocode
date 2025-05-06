import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const BarcodeScanner = () => {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
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
            undefined, // Use default camera if null
            videoRef.current,
            (decodedResult, err) => {
                if (decodedResult) {
                    setResult(decodedResult.getText());
                    setScanning(false);
                }
                if (err && !(err.name === "NotFoundException")) {
                    console.error("Decoding error:", err);
                }
            }
        );
    };

    const stopScanning = () => {
        codeReader.current.reset();
        // Also stop the video stream
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const handleClick = () => {
        setResult(null);
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
            {result && (
                <div>
                    <h3>Scanned Result:</h3>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner;