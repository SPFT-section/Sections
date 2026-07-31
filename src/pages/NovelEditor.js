import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { ShareModal } from '../components/novel/ShareModal';
import { useNovel } from '../hooks/useNovel';
import { GENRES, NOVEL_STATUS } from '../config/constants';
import { format } from '../utils/formatter';
import { compressImage, validateImageFile } from '../utils/image';
import './Pages.css';

export const NovelEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getNovel, 
    createNovel, 
    updateNovel, 
    addChapter, 
    updateChapter, 
    deleteChapter,
    getChapters 
  } = useNovel();

  const [novel, setNovel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Novel info state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState([]);
  const [status, setStatus] = useState('draft');
  const [coverImage, setCoverImage] = useState('');
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState('');
  const coverInputRef = useRef(null);

  // Chapter state
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [isNewChapter, setIsNewChapter] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
      const existing = getNovel(id);
      if (existing) {
        if (existing.isShared) {
          // Shared novels are read-only; send them to the reader instead.
          navigate(`/reader/${existing.id}`, { replace: true });
          return;
        }
        setNovel(existing);
        setTitle(existing.title);
        setAuthor(existing.author);
        setSynopsis(existing.synopsis || '');
        setGenre(existing.genre || []);
        setStatus(existing.status || 'draft');
        setCoverImage(existing.coverImage || '');
        setIsLoading(false);
      } else {
        navigate('/library');
      }
    } else {
      setIsLoading(false);
    }
  }, [id, getNovel, navigate]);

  const chapters = novel ? getChapters(novel.id) : [];

  const handleSaveNovel = () => {
    setIsSaving(true);
    if (id && id !== 'new') {
      updateNovel(id, { title, author, synopsis, genre, status, coverImage });
    } else {
      const newNovel = createNovel({ title, author, synopsis, genre, status, coverImage });
      navigate(`/editor/${newNovel.id}`);
    }
    setIsSaving(false);
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setCoverError(validationError);
      return;
    }

    setCoverError('');
    setIsCoverUploading(true);
    try {
      const { dataUrl } = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 800,
        quality: 0.82,
      });
      setCoverImage(dataUrl);
    } catch (error) {
      setCoverError('Could not process image. Please try a different file.');
    } finally {
      setIsCoverUploading(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
    }
  };

  const handleRemoveCover = () => {
    setCoverImage('');
    setCoverError('');
  };

  const handleAddChapter = () => {
    if (!novel) return;
    const chapter = addChapter(novel.id, { title: chapterTitle, content: chapterContent });
    if (chapter) {
      setSelectedChapterId(chapter.id);
      setIsNewChapter(false);
      setChapterTitle('');
      setChapterContent('');
      // Refresh novel
      setNovel(getNovel(novel.id));
    }
  };

  const handleUpdateChapter = () => {
    if (!novel || !selectedChapterId) return;
    updateChapter(novel.id, selectedChapterId, { title: chapterTitle, content: chapterContent });
    setNovel(getNovel(novel.id));
  };

  const handleDeleteChapter = (chapterId) => {
    if (!novel) return;
    if (deleteChapter(novel.id, chapterId)) {
      setNovel(getNovel(novel.id));
      if (selectedChapterId === chapterId) {
        setSelectedChapterId(null);
        setChapterTitle('');
        setChapterContent('');
        setIsNewChapter(true);
      }
    }
  };

  const handleSelectChapter = (chapterId) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setSelectedChapterId(chapterId);
      setChapterTitle(chapter.title);
      setChapterContent(chapter.content);
      setIsNewChapter(false);
    }
  };

  const handleNewChapter = () => {
    setSelectedChapterId(null);
    setChapterTitle('');
    setChapterContent('');
    setIsNewChapter(true);
    setActiveTab('chapters');
  };

  const handleGenreToggle = (genreName) => {
    setGenre(prev => 
      prev.includes(genreName) 
        ? prev.filter(g => g !== genreName)
        : [...prev, genreName]
    );
  };

  if (isLoading) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="page-editor">
      <div className="editor-header">
        <div className="editor-header-left">
          <Button
            variant="ghost"
            size="sm"
            icon={<Icon name="arrowLeft" size={20} />}
            onClick={() => navigate('/library')}
          >
            Back
          </Button>
          <h1 className="editor-title">
            {id && id !== 'new' ? novel?.title || 'Edit Novel' : 'New Novel'}
          </h1>
          {novel && (
            <span className={`novel-status-badge ${novel.status}`}>
              {novel.status}
            </span>
          )}
        </div>
        <div className="editor-header-right">
          <Button
            variant="primary"
            icon={<Icon name="save" size={20} />}
            onClick={handleSaveNovel}
            loading={isSaving}
          >
            Save
          </Button>
          {novel && (
            <Button
              variant="secondary"
              icon={<Icon name="bookOpen" size={20} />}
              onClick={() => navigate(`/reader/${novel.id}`)}
            >
              Preview
            </Button>
          )}
          {novel && (
            <Button
              variant="secondary"
              icon={<Icon name="share" size={20} />}
              onClick={() => setIsShareOpen(true)}
            >
              Share
            </Button>
          )}
        </div>
      </div>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        novel={novel ? { ...novel, title, author, synopsis, genre, coverImage, chapters } : null}
        authorName={author}
      />

      <div className="editor-tabs">
        <button
          className={`editor-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Icon name="info" size={16} />
          Novel Info
        </button>
        <button
          className={`editor-tab ${activeTab === 'chapters' ? 'active' : ''}`}
          onClick={() => setActiveTab('chapters')}
        >
          <Icon name="list" size={16} />
          Chapters ({chapters.length})
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'info' && (
          <div className="editor-info">
            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <div className="cover-upload">
                <div className="cover-upload-preview">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover preview" />
                  ) : (
                    <div className="cover-upload-placeholder">
                      <Icon name="bookOpen" size={32} />
                      <span>No cover yet</span>
                    </div>
                  )}
                </div>
                <div className="cover-upload-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Icon name="upload" size={16} />}
                    onClick={() => coverInputRef.current?.click()}
                    loading={isCoverUploading}
                  >
                    {coverImage ? 'Change Cover' : 'Upload Cover'}
                  </Button>
                  {coverImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Icon name="trash" size={16} />}
                      onClick={handleRemoveCover}
                    >
                      Remove
                    </Button>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    style={{ display: 'none' }}
                  />
                  <span className="cover-upload-hint">JPG or PNG, up to 10MB</span>
                  {coverError && <span className="cover-upload-error">{coverError}</span>}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter novel title"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Author *</label>
              <input
                type="text"
                className="form-input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Enter author name"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Genre</label>
              <div className="genre-tags">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    className={`genre-tag ${genre.includes(g) ? 'active' : ''}`}
                    onClick={() => handleGenreToggle(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="status-options">
                {Object.entries(NOVEL_STATUS).map(([key, value]) => (
                  <button
                    key={value}
                    className={`status-option ${status === value ? 'active' : ''}`}
                    onClick={() => setStatus(value)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Synopsis</label>
              <textarea
                className="form-textarea"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Write a brief synopsis of your novel..."
                rows={5}
                maxLength={500}
              />
              <span className="form-char-count">{synopsis.length}/500</span>
            </div>
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="editor-chapters">
            <div className="chapter-sidebar">
              <div className="chapter-sidebar-header">
                <h3>Table of Contents</h3>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Icon name="plus" size={16} />}
                  onClick={handleNewChapter}
                >
                  New Chapter
                </Button>
              </div>
              <div className="chapter-list">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={`chapter-item ${selectedChapterId === chapter.id ? 'active' : ''}`}
                    onClick={() => handleSelectChapter(chapter.id)}
                  >
                    <span className="chapter-number">{chapter.order}.</span>
                    <span className="chapter-title">{chapter.title}</span>
                    <button
                      className="chapter-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter.id);
                      }}
                      aria-label="Delete chapter"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
                {chapters.length === 0 && (
                  <div className="chapter-empty">
                    <p>No chapters yet</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleNewChapter}
                    >
                      Create First Chapter
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="chapter-editor">
              <div className="chapter-editor-header">
                <h3>{isNewChapter ? 'New Chapter' : 'Edit Chapter'}</h3>
                {!isNewChapter && selectedChapterId && (
                  <div className="chapter-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Icon name="eye" size={16} />}
                      onClick={() => navigate(`/reader/${novel.id}/${selectedChapterId}`)}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Icon name="trash" size={16} />}
                      onClick={() => handleDeleteChapter(selectedChapterId)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Chapter Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Enter chapter title"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="form-textarea chapter-content"
                  value={chapterContent}
                  onChange={(e) => setChapterContent(e.target.value)}
                  placeholder="Write your chapter content here..."
                  rows={15}
                />
                <div className="chapter-stats">
                  <span>{format.wordCount(chapterContent)} words</span>
                  <span>•</span>
                  <span>{format.readingTime(chapterContent)}</span>
                </div>
              </div>

              <div className="chapter-actions-bottom">
                {isNewChapter ? (
                  <Button
                    variant="primary"
                    onClick={handleAddChapter}
                    disabled={!chapterTitle.trim() || !chapterContent.trim()}
                  >
                    <Icon name="plus" size={20} />
                    Add Chapter
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleUpdateChapter}
                    disabled={!chapterTitle.trim() || !chapterContent.trim()}
                  >
                    <Icon name="save" size={20} />
                    Update Chapter
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NovelEditor;
