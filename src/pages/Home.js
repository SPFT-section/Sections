import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { useNovel } from '../hooks/useNovel';
import { useHistoryStore } from '../store/historyStore';
import { format } from '../utils/formatter';
import './Pages.css';

export const Home = () => {
  const navigate = useNavigate();
  const { getAllNovels } = useNovel();
  const { getLatestHistory } = useHistoryStore();
  
  const novels = getAllNovels();
  const recentHistory = getLatestHistory().slice(0, 5);
  
  // Get continue reading novels
  const continueReading = recentHistory
    .map((item) => {
      const novel = novels.find((n) => n.id === item.novelId);
      if (!novel) return null;
      const chapter = novel.chapters.find((c) => c.id === item.chapterId);
      return {
        ...item,
        novel,
        chapter,
      };
    })
    .filter(Boolean);

  return (
    <div className="page-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Icon name="bookOpen" size={16} />
            <span>Writing Platform</span>
          </div>
          <h1 className="hero-title">
            Standard To <span className="highlight">Quality</span>
          </h1>
          <p className="hero-subtitle">
            ยกระดับมาตรฐานสู่คุณภาพของผลงาน เขียนและอ่านนิยายได้ทุกที่ทุกเวลา
          </p>
          <div className="hero-actions">
            <Button
              variant="primary"
              size="lg"
              icon={<Icon name="plus" size={20} />}
              onClick={() => navigate('/editor/new')}
            >
              Start Writing
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<Icon name="library" size={20} />}
              onClick={() => navigate('/library')}
            >
              Browse Library
            </Button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">{novels.length}</span>
            <span className="stat-label">Novels</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">
              {novels.reduce((sum, n) => sum + (n.chapters?.length || 0), 0)}
            </span>
            <span className="stat-label">Chapters</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">
              {novels.reduce((sum, n) => 
                sum + n.chapters?.reduce((s, c) => 
                  s + (c.content?.split(/\s+/).filter(Boolean).length || 0), 0
                ) || 0, 0
              ).toLocaleString()}
            </span>
            <span className="stat-label">Words</span>
          </div>
        </div>
      </section>

      {/* Continue Reading */}
      {continueReading.length > 0 && (
        <section className="continue-section">
          <div className="section-header">
            <h2>Continue Reading</h2>
            {continueReading.length > 3 && (
              <Link to="/history" className="view-all">
                View All <Icon name="arrowRight" size={16} />
              </Link>
            )}
          </div>
          <div className="novel-grid">
            {continueReading.slice(0, 3).map(({ novel, chapter, progress }) => (
              <div key={novel.id} className="novel-card continue-card">
                <div className="novel-card-header">
                  <h3>{novel.title}</h3>
                  <span className="novel-status">{novel.status}</span>
                </div>
                <p className="novel-chapter">Chapter: {chapter?.title || 'Unknown'}</p>
                <div className="novel-progress">
                  <div 
                    className="novel-progress-bar" 
                    style={{ width: `${progress || 0}%` }}
                  />
                </div>
                <div className="novel-card-footer">
                  <span className="novel-progress-text">{progress || 0}% read</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/reader/${novel.id}/${chapter?.id}`)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Novels */}
      {novels.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2>Your Library</h2>
            <Link to="/library" className="view-all">
              View All <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          <div className="novel-grid">
            {novels.slice(0, 6).map((novel) => (
              <div key={novel.id} className="novel-card">
                <div className="novel-card-cover">
                  {novel.coverImage ? (
                    <img src={novel.coverImage} alt={novel.title} />
                  ) : (
                    <div className="novel-cover-placeholder">
                      <Icon name="book" size={32} />
                    </div>
                  )}
                  {novel.isShared ? (
                    <span className="novel-status-badge shared">
                      <Icon name="lock" size={12} /> Shared
                    </span>
                  ) : (
                    <span className={`novel-status-badge ${novel.status}`}>
                      {novel.status}
                    </span>
                  )}
                </div>
                <div className="novel-card-body">
                  <h3 className="novel-card-title">{novel.title}</h3>
                  <p className="novel-card-author">by {novel.author}</p>
                  <p className="novel-card-synopsis">
                    {format.truncate(novel.synopsis || 'No synopsis', 80)}
                  </p>
                  <div className="novel-card-meta">
                    <span>{novel.chapters?.length || 0} chapters</span>
                    <span>•</span>
                    <span>{format.relativeTime(novel.updatedAt)}</span>
                  </div>
                  <div className="novel-card-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => navigate(`/reader/${novel.id}`)}
                    >
                      Read
                    </Button>
                    {!novel.isShared && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/editor/${novel.id}`)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {novels.length === 0 && (
        <section className="empty-state">
          <Icon name="bookOpen" size={64} className="empty-icon" />
          <h2>Welcome to SECTiON!</h2>
          <p>Start your writing journey today. Create your first novel and share your story.</p>
          <Button
            variant="primary"
            size="lg"
            icon={<Icon name="plus" size={20} />}
            onClick={() => navigate('/editor/new')}
          >
            Create Your First Novel
          </Button>
        </section>
      )}
    </div>
  );
};

export default Home;
