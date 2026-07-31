import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Logo } from '../common/Logo';
import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Logo size={24} />
            <span>SECTiON</span>
          </div>
          <p className="footer-tagline">
            SECTiON — พื้นที่เขียนและอ่านนิยายในแบบของคุณ
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-links-group">
            <h4>Navigation</h4>
            <Link to="/">Home</Link>
            <Link to="/library">Library</Link>
            <Link to="/history">History</Link>
            <Link to="/profile">Profile</Link>
          </div>

          <div className="footer-links-group">
            <h4>Features</h4>
            <Link to="/editor/new">Write Novel</Link>
            <Link to="/library">Browse Novels</Link>
            <Link to="/profile">Reading Settings</Link>
          </div>

          <div className="footer-links-group">
            <h4>About</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <span>
            © {currentYear} SECTiON. All rights reserved.
          </span>
          <span className="footer-version">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
