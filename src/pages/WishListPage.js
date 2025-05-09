import React from 'react';
import NavigationMenu from '../components/NavigationMenu';
import WishList from '../components/WishList/WishList';
import Footer from '../components/Footer/Footer';

const MyBooksPage = () => {
    return (
        <div>
            <NavigationMenu />
            <WishList />
            <Footer />
        </div>
    );
};

export default MyBooksPage;