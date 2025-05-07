import React from 'react';
import NavigationMenu from '../components/NavigationMenu';
import MyBooksScreen from '../components/MyBooksScreen/MyBooksScreen';
import Footer from '../components/Footer/Footer';

const MyBooksPage = () => {
    return (
        <div>
            <NavigationMenu />
            <MyBooksScreen />
            <Footer />
        </div>
    );
};

export default MyBooksPage;