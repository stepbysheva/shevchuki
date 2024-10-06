import React from 'react';
import './Home.css';
import { AuthContext } from '../components/AuthContext'; // Import your CSS file

const Home = () => {
  return (
    <div className="home">
      <div className="product-container">
        <a href="/gallery" style={{ textDecoration: 'none' }}>
          <div className="product-card">
            <img
              src="/shevchukiphoto.jpg"
              alt="customer image"
              className="product-image"
            />
            <h3 className="product-name">Pictures</h3>
          </div>
        </a>
        <a href="/scrabble" style={{ textDecoration: 'none' }}>
          <div className="product-card">
            <img
              src="/scrabble.png"
              alt="provider image"
              className="product-image"
            />
            <h3 className="product-name">Scrabble</h3>
          </div>
        </a>
        <a href="/videos" style={{ textDecoration: 'none' }}>
          <div className="product-card">
            <img
              src="/video.png"
              alt="video image"
              className="product-image"
            />
            <h3 className="product-name">Video</h3>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;