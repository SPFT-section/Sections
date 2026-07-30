import React from 'react';
import { Button } from '../common/Button';

const FONT_FAMILIES = ['Inter', 'Georgia', 'JetBrains Mono'];

export const ReadingSettings = ({ settings, onUpdateSetting, onReset }) => {
  if (!settings) return null;

  return (
    <div className="reader-settings-body">
      {/* Font Family */}
      <div className="settings-group">
        <label className="settings-label">Font Family</label>
        <div className="settings-options">
          {FONT_FAMILIES.map((font) => (
            <button
              key={font}
              className={`settings-option ${settings.fontFamily === font ? 'active' : ''}`}
              onClick={() => onUpdateSetting?.('fontFamily', font)}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="settings-group">
        <label className="settings-label">Font Size: {settings.fontSize}px</label>
        <input
          type="range"
          min="12"
          max="32"
          value={settings.fontSize}
          onChange={(e) => onUpdateSetting?.('fontSize', parseInt(e.target.value, 10))}
          className="settings-range"
        />
      </div>

      {/* Line Height */}
      <div className="settings-group">
        <label className="settings-label">Line Height: {settings.lineHeight}</label>
        <input
          type="range"
          min="1.2"
          max="2.4"
          step="0.1"
          value={settings.lineHeight}
          onChange={(e) => onUpdateSetting?.('lineHeight', parseFloat(e.target.value))}
          className="settings-range"
        />
      </div>

      {/* Letter Spacing */}
      <div className="settings-group">
        <label className="settings-label">Letter Spacing: {settings.letterSpacing}px</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={settings.letterSpacing}
          onChange={(e) => onUpdateSetting?.('letterSpacing', parseFloat(e.target.value))}
          className="settings-range"
        />
      </div>

      {/* Margin */}
      <div className="settings-group">
        <label className="settings-label">Margin: {settings.margin}px</label>
        <input
          type="range"
          min="0"
          max="80"
          value={settings.margin}
          onChange={(e) => onUpdateSetting?.('margin', parseInt(e.target.value, 10))}
          className="settings-range"
        />
      </div>

      {onReset && (
        <div className="settings-item">
          <Button variant="secondary" size="sm" onClick={onReset}>
            Reset to Default
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReadingSettings;
