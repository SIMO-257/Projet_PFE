import React from 'react';
import styles from '../../styles/HomeScreen.module.css';

const Header = ({ title = "Home" }) => {
    return (
        <div className="px-6 pt-8 pb-6">
            <h1 className="text-white/60 text-base font-light mb-1">{title}</h1>
        </div>
    );
};

export default Header;