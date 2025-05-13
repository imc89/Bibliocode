import React from 'react';
import { Link } from 'react-router-dom';
import { SlSettings } from "react-icons/sl";
import { CiBarcode } from "react-icons/ci";
import './NavigationMenu.css'; // Importa el archivo CSS para estilos

const NavigationMenu = () => {
    return (
        <nav className="responsive-nav">
            <div className="nav-header">
                <Link to="/" className="nav-button nav-left">
                    <SlSettings size={24} />
                </Link>
                <Link to="/" className="nav-button nav-center">
                    <img src={`${process.env.PUBLIC_URL}/icon.png`} />
                    <span>Bibliocode</span>
                </Link>
                <Link to="/scanner" className="nav-button nav-right">
                    <CiBarcode size={24} />
                </Link>
            </div>
        </nav>
    );
};

export default NavigationMenu;