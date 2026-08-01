import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { ReadingView } from '../components/novel/ReadingView';
import { useNovel } from '../hooks/useNovel';
import { useReadingSettings } from '../hooks/useReadingSettings';
import { useHistoryStore } from '../store/historyStore';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { format } from '../utils/formatter';
import './Pages.css';

export const NovelReader = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { getNovel, getChapters } = useNovel();
  const { settings, getReadingStyles, updateSetting } = useReadingSettings();
  const { addHistory } = useHistoryStore();
  
  const contentRef = useRef(null);
  const progressRef = useRef(0);
  const [novel, setNovel] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);

  const { isPlaying, isMuted, toggleMute } = useMusicPlayer({
    containerRef: contentRef,
    cues: currentChapter?.musicCues || [],
    enabled: musicEnabled,
  });

  useEffect(() => {
    const novelData = getNovel(novelId);
    if (!novelData) {
      navigate('/library');
      return;
    }

    setNovel(novelData);
    const chapterList = getChapters(novelId);
    setChapters(chapterList);

    let targetChapter = null;
    let index = 0;

    if (chapterId) {
      targetChapter = chapterList.find(c => c.id === chapterId);
      index = chapterList.findIndex(c => c.id === chapterId);
    } else if (chapterList.length > 0) {
      targetChapter = chapterList[0];
      index = 0;
    }

    if (targetChapter) {
      setCurrentChapter(targetChapter);
      setCurrentIndex(index);
      // Add to history
      addHistory(novelId, targetChapter.id, progress, contentRef.current?.scrollTop || 0);
    }

    setIsLoading(false);
  }, [novelId, chapterId, getNovel, getChapters, navigate, addHistory]);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const pct = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setProgress(Math.min(Math.round(pct), 100));
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [currentChapter]);

  // Keep a ref of the latest progress so the effect below doesn't need
  // to depend on `progress` (which changes on every scroll tick).
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Save progress when leaving the chapter/novel (or unmounting) —
  // only re-fires when the chapter actually changes, not on every scroll.
  useEffect(() => {
    return () => {
      if (novel && currentChapter) {
        addHistory(novel.id, currentChapter.id, progressRef.current, contentRef.current?.scrollTop || 0);
      }
    };
  }, [novel, currentChapter, addHistory]);

  const handlePrevChapter = () => {
    if (currentIndex > 0) {
      const prev = chapters[currentIndex - 1];
      setCurrentChapter(prev);
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      navigate(`/reader/${novelId}/${prev.id}`);
    }
  };

  const handleNextChapter = () => {
    if (currentIndex < chapters.length - 1) {
      const next = chapters[currentIndex + 1];
      setCurrentChapter(next);
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      navigate(`/reader/${novelId}/${next.id}`);
    }
  };

  const handleChapterSelect = (chapter) => {
    const index = chapters.findIndex(c => c.id === chapter.id);
    setCurrentChapter(chapter);
    setCurrentIndex(index);
    setProgress(0);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    navigate(`/reader/${novelId}/${chapter.id}`);
    setIsTocOpen(false);
  };

  if (isLoading) {
    return <div className="loading-state">Loading...</div>;
  }

  if (!novel || !currentChapter) {
    return (
      <div className="empty-state">
        <Icon name="bookOpen" size={64} className="empty-icon" />
        <h2>No chapters available</h2>
        <p>This novel doesn't have any chapters yet.</p>
        <Button
          variant="primary"
          onClick={() => navigate('/library')}
        >
          Back to Library
        </Button>
      </div>
    );
  }

  const readingStyles = getReadingStyles();

  return (
    <div className="page-reader">
      {/* Reader Header */}
      <div className="reader-header">
        <div className="reader-header-left">
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon name="arrowLeft" size={20} />}
            onClick={() => navigate('/library')}
          >
            Library
          </Button>
          <span className="reader-header-divider">|</span>
          <span className="reader-header-title">{novel.title}</span>
        </div>
        <div className="reader-header-right">
          {currentChapter?.musicCues?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Icon name={isMuted ? 'volumeMute' : 'volume'} size={20} />}
              onClick={() => {
                if (!musicEnabled) {
                  setMusicEnabled(true);
                } else {
                  toggleMute();
                }
              }}
              aria-label={isMuted ? 'เปิดเสียงเพลงประกอบ' : 'ปิดเสียงเพลงประกอบ'}
              className={isPlaying && !isMuted ? 'reader-music-active' : ''}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon name="list" size={20} />}
            onClick={() => setIsTocOpen(!isTocOpen)}
          >
            TOC
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon name="settings" size={20} />}
            onClick={() => setShowSettings(!showSettings)}
          />
        </div>
      </div>

      <div className="reader-body">
        {/* Reading Content */}
        <div className="reader-content-wrapper">
          <ReadingView ref={contentRef} chapter={currentChapter} styles={readingStyles} />

          {/* Progress Bar */}
          <div className="reader-progress-bar">
            <div 
              className="reader-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="reader-nav">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentIndex === 0}
            onClick={handlePrevChapter}
          >
            <Icon name="arrowLeft" size={16} />
            Previous
          </Button>
          <span className="reader-nav-info">
            {currentIndex + 1} / {chapters.length}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentIndex === chapters.length - 1}
            onClick={handleNextChapter}
          >
            Next
            <Icon name="arrowRight" size={16} />
          </Button>
        </div>
      </div>

      {/* Table of Contents Sidebar */}
      {isTocOpen && (
        <>
          <div className="reader-overlay" onClick={() => setIsTocOpen(false)} />
          <div className="reader-toc">
            <div className="reader-toc-header">
              <h3>Table of Contents</h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<Icon name="close" size={20} />}
                onClick={() => setIsTocOpen(false)}
              />
            </div>
            <div className="reader-toc-list">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  className={`reader-toc-item ${currentChapter.id === chapter.id ? 'active' : ''}`}
                  onClick={() => handleChapterSelect(chapter)}
                >
                  <span className="toc-number">{index + 1}.</span>
                  <span className="toc-title">{chapter.title}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Reading Settings */}
      {showSettings && (
        <>
          <div className="reader-overlay" onClick={() => setShowSettings(false)} />
          <div className="reader-settings">
            <div className="reader-settings-header">
              <h3>Reading Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                icon={<Icon name="close" size={20} />}
                onClick={() => setShowSettings(false)}
              />
            </div>
            <div className="reader-settings-body">
              {/* Font Family */}
              <div className="settings-group">
                <label className="settings-label">Font Family</label>
                <div className="settings-options">
                  {['Inter', 'Georgia', 'JetBrains Mono'].map((font) => (
                    <button
                      key={font}
                      className={`settings-option ${settings.fontFamily === font ? 'active' : ''}`}
                      onClick={() => updateSetting('fontFamily', font)}
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
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
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
                  onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
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
                  onChange={(e) => updateSetting('letterSpacing', parseFloat(e.target.value))}
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
                  onChange={(e) => updateSetting('margin', parseInt(e.target.value))}
                  className="settings-range"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NovelReader;
