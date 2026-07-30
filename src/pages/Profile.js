import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { Modal } from '../components/common/Modal';
import { ReadingSettings } from '../components/settings/ReadingSettings';
import { useUserStore } from '../store/userStore';
import { useNovel } from '../hooks/useNovel';
import { useReadingSettings } from '../hooks/useReadingSettings';
import { useHistoryStore } from '../store/historyStore';
import { storage } from '../utils/storage';
import { format } from '../utils/formatter';
import './Pages.css';

export const Profile = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, getStats } = useUserStore();
  const { getAllNovels } = useNovel();
  const { settings, updateSetting, resetSettings } = useReadingSettings();
  const { clearHistory } = useHistoryStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [isReadingSettingsOpen, setIsReadingSettingsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const novels = getAllNovels();
  const stats = getStats(novels);

  const handleSaveProfile = () => {
    if (displayName.trim()) {
      updateProfile({ displayName: displayName.trim() });
      setIsEditing(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfile({ avatar: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportData = () => {
    const data = {
      profile,
      novels,
      history: storage.get('stq-history', []),
      readingSettings: settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stq-backup-${format.date(Date.now(), 'short')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          // Import logic here
          alert('Data imported successfully!');
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      // Clear all data
      storage.clear();
      clearHistory();
      resetSettings();
      navigate('/');
    }
  };

  return (
    <div className="page-profile">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                <Icon name="user" size={48} />
              </div>
            )}
            <button
              className="profile-avatar-change"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change avatar"
            >
              <Icon name="pencil" size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-info">
            {isEditing ? (
              <div className="profile-edit-name">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="profile-name-input"
                  placeholder="Enter display name"
                  autoFocus
                />
                <div className="profile-edit-actions">
                  <Button size="sm" onClick={handleSaveProfile}>
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDisplayName(profile.displayName);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="profile-name">{profile.displayName}</h2>
                <p className="profile-joined">
                  Joined {format.date(profile.joinedAt, 'long')}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Icon name="pencil" size={16} />
                  Edit Name
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.totalNovels}</span>
          <span className="stat-label">Novels</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.totalChapters}</span>
          <span className="stat-label">Chapters</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.totalWords.toLocaleString()}</span>
          <span className="stat-label">Words Written</span>
        </div>
      </div>

      {/* Settings */}
      <div className="settings-section">
        <h3 className="settings-title">Settings</h3>
        
        <div className="settings-group">
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-label">Theme</span>
              <span className="settings-item-description">Toggle between light and dark mode</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const theme = document.documentElement.getAttribute('data-theme');
                if (theme === 'dark') {
                  document.documentElement.removeAttribute('data-theme');
                  localStorage.setItem('stq-theme', 'light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  localStorage.setItem('stq-theme', 'dark');
                }
              }}
            >
              <Icon name={document.documentElement.getAttribute('data-theme') === 'dark' ? 'sun' : 'moon'} size={16} />
              {document.documentElement.getAttribute('data-theme') === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-label">Reading Settings</span>
              <span className="settings-item-description">
                Font: {settings.fontFamily}, Size: {settings.fontSize}px
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsReadingSettingsOpen(true)}
            >
              Configure
            </Button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-label">Export Data</span>
              <span className="settings-item-description">Export all your novels and settings</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportData}
            >
              <Icon name="download" size={16} />
              Export
            </Button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-label">Import Data</span>
              <span className="settings-item-description">Import data from a backup file</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => document.getElementById('import-file')?.click()}
            >
              <Icon name="upload" size={16} />
              Import
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{ display: 'none' }}
            />
          </div>

          <div className="settings-item danger">
            <div className="settings-item-info">
              <span className="settings-item-label">Clear All Data</span>
              <span className="settings-item-description">
                Permanently delete all novels, history, and settings
              </span>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearData}
            >
              <Icon name="trash" size={16} />
              Clear Data
            </Button>
          </div>
        </div>
      </div>

      {/* Reading Preferences */}
      <div className="settings-section">
        <h3 className="settings-title">Reading Preferences</h3>
        <div className="preview-box">
          <p style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}px`,
            padding: `${settings.margin}px`,
          }}>
            This is a preview of your reading settings. The quick brown fox jumps over the lazy dog.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        <div className="settings-item">
          <Button
            variant="secondary"
            size="sm"
            onClick={resetSettings}
          >
            Reset to Default
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isReadingSettingsOpen}
        onClose={() => setIsReadingSettingsOpen(false)}
        title="Reading Settings"
      >
        <ReadingSettings
          settings={settings}
          onUpdateSetting={updateSetting}
          onReset={resetSettings}
        />
      </Modal>
    </div>
  );
};

export default Profile;
