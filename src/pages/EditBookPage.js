import React from 'react';
import NavigationMenu from '../components/NavigationMenu';
import EditBookScreen from '../components/EditBookScreen/EditBookScreen';
import Footer from '../components/Footer/Footer';

const EditBookPage = () => {
    return (
        <div>
            <NavigationMenu />
            <EditBookScreen />
            <Footer />
        </div>
    );
};

export default EditBookPage;