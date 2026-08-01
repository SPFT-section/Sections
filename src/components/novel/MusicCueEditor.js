import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { splitIntoParagraphs } from '../../utils/textUtils';
import { saveAudioFile, validateAudioFile } from '../../utils/audioStorage';
import './MusicCueEditor.css';

// Lets the writer attach background music to a chapter: pick a source
// (upload a file, or paste a streaming URL), then choose which paragraph
// range the track should play across. Paragraph indices are shown as
// a preview list built from the same splitIntoParagraphs() the reader
// uses, so "paragraph 5" here is exactly "paragraph 5" during playback.
export const MusicCueEditor = ({
  isOpen,
  onClose,
  content,
  cues,
  onAddCue,
  onUpdateCue,
  onRemoveCue,
}) => {
  const paragraphs = splitIntoParagraphs(content);
  const fileInputRef = useRef(null);

  const [source, setSource] = useState('upload');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [startParagraph, setStartParagraph] = useState(0);
  const [endParagraph, setEndParagraph] = useState(Math.max(paragraphs.length - 1, 0));
  const [volume, setVolume] = useState(0.6);
  const [loop, setLoop] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setSource('upload');
    setLabel('');
    setUrl('');
    setPendingFile(null);
    setFileError('');
    setStartParagraph(0);
    setEndParagraph(Math.max(paragraphs.length - 1, 0));
    setVolume(0.6);
    setLoop(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const error = validateAudioFile(file);
    if (error) {
      setFileError(error);
      setPendingFile(null);
      return;
    }
    setFileError('');
    setPendingFile(file);
    if (!label) setLabel(file.name.replace(/\.[^/.]+$/, ''));
  };

  const canSave =
    startParagraph <= endParagraph &&
    ((source === 'upload' && pendingFile) || (source === 'url' && url.trim()));

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      if (source === 'upload') {
        const audioId = uuidv4();
        await saveAudioFile(audioId, pendingFile);
        onAddCue({
          source: 'upload',
          audioId,
          label: label.trim() || pendingFile.name,
          startParagraph,
          endParagraph,
          volume,
          loop,
        });
      } else {
        onAddCue({
          source: 'url',
          url: url.trim(),
          label: label.trim() || 'เพลงจากลิงก์',
          startParagraph,
          endParagraph,
          volume,
          loop,
        });
      }
      resetForm();
    } catch (err) {
      setFileError('บันทึกไฟล์เสียงไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const previewText = (index) => {
    const text = paragraphs[index] || '';
    return text.length > 60 ? `${text.slice(0, 60)}…` : text;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="เพลงประกอบตอนนี้"
      size="lg"
    >
      <div className="music-cue-editor">
        <p className="music-cue-hint">
          เลือกช่วงย่อหน้าที่อยากให้เพลงเล่น เพลงจะเริ่มและหยุด (พร้อม fade)
          ตามตำแหน่งที่ผู้อ่านเลื่อนอ่านถึง
        </p>

        {cues.length > 0 && (
          <div className="music-cue-list">
            {cues.map((cue) => (
              <div key={cue.id} className="music-cue-item">
                <div className="music-cue-item-icon">
                  <Icon name="music" size={18} />
                </div>
                <div className="music-cue-item-info">
                  <span className="music-cue-item-label">{cue.label}</span>
                  <span className="music-cue-item-range">
                    ย่อหน้า {cue.startParagraph + 1}–{cue.endParagraph + 1}
                    {cue.source === 'url' ? ' · ลิงก์' : ' · ไฟล์อัปโหลด'}
                  </span>
                </div>
                <button
                  className="music-cue-item-remove"
                  onClick={() => onRemoveCue(cue.id)}
                  aria-label="ลบเพลงนี้"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="music-cue-form">
          <h4 className="music-cue-form-title">เพิ่มเพลงใหม่</h4>

          <div className="music-cue-source-toggle">
            <button
              className={`music-cue-source-btn ${source === 'upload' ? 'active' : ''}`}
              onClick={() => setSource('upload')}
              type="button"
            >
              <Icon name="upload" size={16} />
              อัปโหลดไฟล์
            </button>
            <button
              className={`music-cue-source-btn ${source === 'url' ? 'active' : ''}`}
              onClick={() => setSource('url')}
              type="button"
            >
              <Icon name="link" size={16} />
              ใส่ลิงก์
            </button>
          </div>

          {source === 'upload' ? (
            <div className="form-group">
              <label className="form-label">ไฟล์เสียง (MP3, WAV, OGG ฯลฯ)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="form-input"
              />
              {pendingFile && (
                <span className="music-cue-file-name">
                  เลือกแล้ว: {pendingFile.name} ({(pendingFile.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
              )}
              {fileError && <span className="music-cue-error">{fileError}</span>}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">ลิงก์เพลง (URL ไฟล์เสียงโดยตรง)</label>
              <input
                type="url"
                className="form-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/song.mp3"
              />
              <span className="form-hint">
                รองรับลิงก์ไฟล์เสียงโดยตรงเท่านั้น (ไม่ใช่หน้าเพจของ YouTube/Spotify)
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">ชื่อเพลง (สำหรับจดจำ)</label>
            <input
              type="text"
              className="form-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="เช่น ธีมฉากต่อสู้"
              maxLength={80}
            />
          </div>

          <div className="music-cue-range-group">
            <div className="form-group">
              <label className="form-label">เริ่มที่ย่อหน้า</label>
              <select
                className="form-input"
                value={startParagraph}
                onChange={(e) => setStartParagraph(Number(e.target.value))}
              >
                {paragraphs.map((_, index) => (
                  <option key={index} value={index}>
                    {index + 1}. {previewText(index)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">หยุดที่ย่อหน้า</label>
              <select
                className="form-input"
                value={endParagraph}
                onChange={(e) => setEndParagraph(Number(e.target.value))}
              >
                {paragraphs.map((_, index) => (
                  <option key={index} value={index}>
                    {index + 1}. {previewText(index)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {startParagraph > endParagraph && (
            <span className="music-cue-error">
              ย่อหน้าเริ่มต้องมาก่อนหรือเท่ากับย่อหน้าหยุด
            </span>
          )}

          <div className="form-group">
            <label className="form-label">ระดับเสียง: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="settings-range"
            />
          </div>

          <label className="music-cue-checkbox">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />
            วนเพลงซ้ำถ้าอ่านช่วงนี้นานกว่าความยาวเพลง
          </label>

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!canSave || isSaving}
            loading={isSaving}
            fullWidth
          >
            <Icon name="plus" size={18} />
            เพิ่มเพลงนี้
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MusicCueEditor;
