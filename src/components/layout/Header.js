import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { ThemeToggle } from '../settings/ThemeToggle';
import { AuthModal } from '../auth/AuthModal';
import { useAuthStore } from '../../store/authStore';
import './Header.css';

export const Header = ({ onMenuToggle, isMenuOpen }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { currentAccount, isGuest, logout } = useAuthStore();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button
            className="header-menu-btn"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Icon name="menu" size={24} />
          </button>

          <Link to="/" className="header-logo">
            <img
              src="logo-icon.png"
              alt="SECTiON Logo"
              className="header-logo-icon"
              width="32"
              height="32"
            />
            <span className="header-logo-text">SECTiON</span>
            <span className="header-logo-sub">Write. Read. Repeat.</span>
          </Link>
        </div>

        <nav className="header-nav" aria-label="Main navigation">
          <Link to="/" className="header-nav-link active">
            <Icon name="home" size={20} />
            <span>Home</span>
          </Link>
          <Link to="/library" className="header-nav-link">
            <Icon name="library" size={20} />
            <span>Library</span>
          </Link>
          <Link to="/history" className="header-nav-link">
            <Icon name="history" size={20} />
            <span>History</span>
          </Link>
          <Link to="/profile" className="header-nav-link">
            <Icon name="user" size={20} />
            <span>Profile</span>
          </Link>
        </nav>

        <div className="header-right">
          <button
            className="header-search-btn"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            <Icon name="search" size={20} />
          </button>

          <ThemeToggle />

          {isGuest ? (
            <button
              className="header-auth-btn"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <Icon name="user" size={18} />
              <span>เข้าสู่ระบบ</span>
            </button>
          ) : (
            <button
              className="header-auth-btn header-auth-btn-active"
              onClick={logout}
              title="ออกจากระบบ"
            >
              <Icon name="user" size={18} />
              <span>{currentAccount.username}</span>
              <Icon name="close" size={14} />
            </button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={<Icon name="plus" size={16} />}
            onClick={() => navigate('/editor/new')}
          >
            New Novel
          </Button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {isSearchOpen && (
        <div className="header-search-overlay">
          <div className="header-search-container">
            <Icon name="search" size={20} className="header-search-icon" />
            <input
              type="text"
              className="header-search-input"
              placeholder="Search novels..."
              autoFocus
            />
            <button
              className="header-search-close"
              onClick={() => setIsSearchOpen(false)}
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
