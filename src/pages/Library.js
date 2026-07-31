import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { ShareModal } from '../components/novel/ShareModal';
import { useNovel } from '../hooks/useNovel';
import { useUserStore } from '../store/userStore';
import { format } from '../utils/formatter';
import { NOVEL_STATUS, NOVEL_STATUS_LABELS, GENRES } from '../config/constants';
import './Pages.css';

export const Library = () => {
  const navigate = useNavigate();
  const { novels, deleteNovel, getAllNovels } = useNovel();
  const { profile } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [shareTarget, setShareTarget] = useState(null);

  const filteredNovels = useMemo(() => {
    let result = getAllNovels(sortBy, sortOrder);

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (novel) =>
          novel.title.toLowerCase().includes(term) ||
          novel.author.toLowerCase().includes(term) ||
          novel.synopsis?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter((novel) => novel.status === filterStatus);
    }

    // Genre filter
    if (filterGenre !== 'all') {
      result = result.filter((novel) => novel.genre?.includes(filterGenre));
    }

    return result;
  }, [novels, searchTerm, filterStatus, filterGenre, sortBy, sortOrder, getAllNovels]);

  const handleDelete = (id) => {
    if (deleteNovel(id)) {
      // Refresh or show toast
    }
  };

  const getStatusCount = (status) => {
    return novels.filter((n) => n.status === status).length;
  };

  return (
    <div className="page-library">
      <div className="page-header">
        <div>
          <h1 className="page-title">Library</h1>
          <p className="page-subtitle">
            {novels.length} novels in your collection
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Icon name="plus" size={20} />}
          onClick={() => navigate('/editor/new')}
        >
          New Novel
        </Button>
      </div>

      {/* Filters */}
      <div className="library-filters">
        <div className="search-box">
          <Icon name="search" size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search novels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft ({getStatusCount('draft')})</option>
            <option value="published">Published ({getStatusCount('published')})</option>
            <option value="completed">Completed ({getStatusCount('completed')})</option>
          </select>

          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Genres</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="filter-select"
          >
            <option value="updatedAt-desc">Latest Updated</option>
            <option value="updatedAt-asc">Oldest Updated</option>
            <option value="createdAt-desc">Newest Created</option>
            <option value="createdAt-asc">Oldest Created</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>
      </div>

      {/* Status Quick Filters */}
      <div className="status-pills">
        <button
          className={`status-pill ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({novels.length})
        </button>
        <button
          className={`status-pill draft ${filterStatus === 'draft' ? 'active' : ''}`}
          onClick={() => setFilterStatus('draft')}
        >
          Draft ({getStatusCount('draft')})
        </button>
        <button
          className={`status-pill published ${filterStatus === 'published' ? 'active' : ''}`}
          onClick={() => setFilterStatus('published')}
        >
          Published ({getStatusCount('published')})
        </button>
        <button
          className={`status-pill completed ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed ({getStatusCount('completed')})
        </button>
      </div>

      {/* Novel Grid */}
      {filteredNovels.length > 0 ? (
        <div className="novel-grid">
          {filteredNovels.map((novel) => (
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
                {novel.genre && novel.genre.length > 0 && (
                  <div className="novel-genres">
                    {novel.genre.slice(0, 2).map((g) => (
                      <span key={g} className="novel-genre-tag">{g}</span>
                    ))}
                    {novel.genre.length > 2 && (
                      <span className="novel-genre-tag">+{novel.genre.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="novel-card-body">
                <h3 className="novel-card-title">{novel.title}</h3>
                <p className="novel-card-author">
                  by {novel.author}
                  {novel.isShared && <span className="novel-shared-by"> • shared by {novel.sharedBy}</span>}
                </p>
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
                    icon={<Icon name="bookOpen" size={16} />}
                    onClick={() => navigate(`/reader/${novel.id}`)}
                  >
                    Read
                  </Button>
                  {novel.isShared ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Icon name="lock" size={16} />}
                      disabled
                      title="นิยายที่แชร์มาแก้ไขไม่ได้"
                    >
                      Read-only
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Icon name="pencil" size={16} />}
                        onClick={() => navigate(`/editor/${novel.id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Icon name="share" size={16} />}
                        onClick={() => setShareTarget(novel)}
                        title="แชร์นิยายเรื่องนี้ (อ่านอย่างเดียว)"
                      />
                    </>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Icon name="trash" size={16} />}
                    onClick={() => handleDelete(novel.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="library" size={64} className="empty-icon" />
          <h2>No novels found</h2>
          <p>
            {searchTerm || filterStatus !== 'all' || filterGenre !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Start writing your first novel today!'}
          </p>
          {(searchTerm || filterStatus !== 'all' || filterGenre !== 'all') && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterGenre('all');
              }}
            >
              Clear Filters
            </Button>
          )}
          {!searchTerm && filterStatus === 'all' && filterGenre === 'all' && (
            <Button
              variant="primary"
              icon={<Icon name="plus" size={20} />}
              onClick={() => navigate('/editor/new')}
            >
              Create Your First Novel
            </Button>
          )}
        </div>
      )}

      <ShareModal
        isOpen={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        novel={shareTarget}
        authorName={profile?.displayName}
      />
    </div>
  );
};

export default Library;
