import React from 'react';
import { Link } from 'react-router-dom';

const NavigationMenu = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Mis Libros</Link>
                </li>
                <li>
                    <Link to="/scanner">Escanear ISBN</Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavigationMenu;