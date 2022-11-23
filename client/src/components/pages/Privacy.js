import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="container">
      <div className="home-buttons">
        <Link to="/">Home</Link>
        <Link to="signin">Sign In</Link>
        <Link to="signin">Sign Up</Link>
      </div>
      <div className="help-header">
        <h1>Privacy Policy</h1>
      </div>
      <p>
        Exploring the Space does not collect any personal data whatsoever about
        users or visitors. The only data we keep is the music you upload to the
        site and associated metadata.
      </p>
    </div>
  );
};

export default Privacy;
