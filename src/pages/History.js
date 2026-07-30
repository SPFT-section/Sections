import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Icon } from '../components/common/Icon';
import { useHistoryStore } from '../store/historyStore';
import { useNovel } from '../hooks/useNovel';
import { format } from '../utils/formatter';
import './Pages.css';

export const History = () => {
  const navigate = useNavigate();
  const { history, clearHistory, removeHistory } = useHistoryStore();
  const { getNovel, getChapter } = useNovel();
  const [filter, setFilter] = useState('all');

  const groupedHistory = useMemo(() => {
    const grouped = {};
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const yesterday = new Date(now - 86400000).setHours(0, 0, 0, 0);
    const weekAgo = new Date(now - 604800000).setHours(0, 0, 0, 0);

    const filtered = history.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'today') return item.lastRead >= today;
      if (filter === 'week') return item.lastRead >= weekAgo;
      return true;
    });

    filtered.forEach((item) => {
      const novel = getNovel(item.novelId);
      if (!novel) return;

      const chapter = getChapter(item.novelId, item.chapterId);
      
      let group;
      if (item.lastRead >= today) group = 'Today';
      else if (item.lastRead >= yesterday) group = 'Yesterday';
      else if (item.lastRead >= weekAgo) group = 'This Week';
      else group = 'Older';

      if (!grouped[group]) grouped[group] = [];
      grouped[group].push({ ...item, novel, chapter });
    });

    return grouped;
  }, [history, filter, getNovel, getChapter]);

  const getTotalHistory = () => history.length;
  const getTodayHistory = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return history.filter((item) => item.lastRead >= today).length;
  };
  const getWeekHistory = () => {
    const weekAgo = new Date(Date.now() - 604800000).setHours(0, 0, 0, 0);
    return history.filter((item) => item.lastRead >= weekAgo).length;
  };

  const handleClearHistory = () => {
    if (clearHistory()) {
      // Show toast
    }
  };

  const handleRemoveItem = (id) => {
    removeHistory(id);
  };

  if (history.length === 0) {
    return (
      <div className="page-history">
        <div className="page-header">
          <h1 className="page-title">Reading History</h1>
        </div>
        <div className="empty-state">
          <Icon name="history" size={64} className="empty-icon" />
          <h2>No reading history</h2>
          <p>Start reading a novel to track your progress here.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/library')}
          >
            Browse Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-history">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reading History</h1>
          <p className="page-subtitle">
            {getTotalHistory()} reads tracked
          </p>
        </div>
        <Button
          variant="danger"
          onClick={handleClearHistory}
        >
          Clear All
        </Button>
      </div>

      {/* Stats */}
      <div className="history-stats">
        <div className="stat-card">
          <span className="stat-number">{getTotalHistory()}</span>
          <span className="stat-label">Total Reads</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{getTodayHistory()}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{getWeekHistory()}</span>
          <span className="stat-label">This Week</span>
        </div>
      </div>

      {/* Filter */}
      <div className="history-filters">
        <button
          className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-pill ${filter === 'today' ? 'active' : ''}`}
          onClick={() => setFilter('today')}
        >
          Today
        </button>
        <button
          className={`filter-pill ${filter === 'week' ? 'active' : ''}`}
          onClick={() => setFilter('week')}
        >
          This Week
        </button>
      </div>

      {/* History List */}
      <div className="history-list">
        {Object.entries(groupedHistory).map(([group, items]) => (
          <div key={group} className="history-group">
            <h3 className="history-group-title">{group}</h3>
            {items.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-item-content">
                  <div className="history-item-info">
                    <h4 className="history-item-title">{item.novel?.title || 'Unknown Novel'}</h4>
                    <p className="history-item-chapter">
                      Chapter: {item.chapter?.title || 'Unknown Chapter'}
                    </p>
                    <div className="history-item-meta">
                      <span className="history-item-time">
                        {format.relativeTime(item.lastRead)}
                      </span>
                      {item.progress > 0 && (
                        <>
                          <span className="history-item-divider">•</span>
                          <span className="history-item-progress">
                            {item.progress}% read
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="history-item-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Icon name="arrowRight" size={16} />}
                      onClick={() => navigate(`/reader/${item.novelId}/${item.chapterId}`)}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Icon name="close" size={16} />}
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="Remove from history"
                    />
                  </div>
                </div>
                {item.progress > 0 && (
                  <div className="history-item-progress-bar">
                    <div 
                      className="history-item-progress-fill"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
