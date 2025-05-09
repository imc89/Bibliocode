import React from 'react';
import NavigationMenu from '../components/NavigationMenu';
import Searcher from '../components/Searcher/Searcher';
import Footer from '../components/Footer/Footer';

const SearchPage = () => {
    return (
        <div>
            <NavigationMenu />
            <Searcher />
            <Footer />
        </div>
    );
};

export default SearchPage;