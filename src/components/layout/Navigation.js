import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import './Navigation.css';

export const Navigation = ({ isOpen, onClose }) => {
  const navLinks = [
    { href: '/', icon: 'home', label: 'Home' },
    { href: '/library', icon: 'library', label: 'Library' },
    { href: '/history', icon: 'history', label: 'History' },
    { href: '/profile', icon: 'user', label: 'Profile' },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      <nav className={`navigation ${isOpen ? 'open' : ''}`}>
        <div className="navigation-header">
          <div className="navigation-logo">
            <img
              src="logo-icon.png"
              alt="SECTiON Logo"
              width="32"
              height="32"
            />
            <span>SECTiON</span>
          </div>
          <button
            className="navigation-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        <ul className="navigation-list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className="navigation-link"
                onClick={handleLinkClick}
              >
                <Icon name={link.icon} size={20} />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="navigation-divider" />

        <div className="navigation-actions">
          <Link to="/editor/new" className="navigation-action-btn primary">
            <Icon name="plus" size={20} />
            New Novel
          </Link>
          <Link to="/profile" className="navigation-action-btn">
            <Icon name="settings" size={20} />
            Settings
          </Link>
        </div>
      </nav>

      {isOpen && (
        <div
          className="navigation-overlay"
          onClick={onClose}
          role="button"
          tabIndex={0}
        />
      )}
    </>
  );
};
