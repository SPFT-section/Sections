import React, { useState, useRef } from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { format } from '../../utils/formatter';

export const ProfileSettings = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const fileInputRef = useRef(null);

  const handleSave = () => {
    if (displayName.trim()) {
      onUpdateProfile?.({ displayName: displayName.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.displayName || '');
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateProfile?.({ avatar: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) return null;

  return (
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
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
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
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                <Icon name="pencil" size={16} />
                Edit Name
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
