import React from 'react';
import NavigationMenu from '../components/NavigationMenu';
import MyReadings from '../components/MyReadings/MyReadings';
import Footer from '../components/Footer/Footer';

const MyBooksPage = () => {
    return (
        <div>
            <NavigationMenu />
            <MyReadings />
            <Footer />
        </div>
    );
};

export default MyBooksPage;