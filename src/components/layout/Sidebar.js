import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Logo } from '../common/Logo';
import './Sidebar.css';

const navLinks = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/library', icon: 'library', label: 'Library' },
  { href: '/history', icon: 'history', label: 'History' },
  { href: '/profile', icon: 'user', label: 'Profile' },
];

export const Sidebar = ({ currentPath = '/' }) => {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo">
        <Logo size={28} />
        <span>SECTiON</span>
      </Link>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`sidebar-link ${currentPath === link.href ? 'active' : ''}`}
          >
            <Icon name={link.icon} size={20} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/editor/new" className="sidebar-link">
          <Icon name="plus" size={20} />
          <span>New Novel</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
