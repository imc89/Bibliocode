import React from 'react';
import { Link } from 'react-router-dom';
import { HiBookmark } from "react-icons/hi";
import { GoHeartFill } from "react-icons/go";
import { IoLibrarySharp } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";

import './Footer.css'; // Importa el archivo CSS para estilos

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <Link to="/reading" className="footer-button">
                    <HiBookmark size={24} />
                    <span>Leyendo</span>
                </Link>
                <Link to="/wishlist" className="footer-button">
                    <GoHeartFill size={24} />
                    <span>Deseados</span>
                </Link>
                <Link to="/" className="footer-button">
                    <IoLibrarySharp size={24}/>
                    <span>Biblioteca</span>
                </Link>
                <Link to="/search" className="footer-button">
                    <IoSearch size={24} />
                    <span>Buscar</span>
                </Link>
            </div>
        </footer>
    );
};

export default Footer;