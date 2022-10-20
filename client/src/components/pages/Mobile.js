import React from 'react';
import { Link } from 'react-router-dom';

const Mobile = () => {
  return (
    <div className="container">
      <div className="home-buttons">
        <Link to="/">Home</Link>
        <Link to="signin">Sign In</Link>
        <Link to="signin">Sign Up</Link>
      </div>
      <div className="help-header">
        <h1>Exploring the Space Mobile App</h1>
      </div>
      <div className="mobile">
        <a
          className="mobile-btn"
          href="https://apps.apple.com/app/exploring-the-space/id1642123102"
        >
          Get the Apple App
        </a>
        <a
          className="mobile-btn"
          href="https://play.google.com/store/apps/details?id=com.etsmob"
        >
          Get the Android App
        </a>
      </div>
    </div>
  );
};

export default Mobile;
