import React from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

export const ChapterList = ({
  chapters = [],
  selectedChapterId,
  onSelect,
  onDelete,
  onNew,
}) => {
  return (
    <div className="chapter-sidebar">
      <div className="chapter-sidebar-header">
        <h3>Table of Contents</h3>
        {onNew && (
          <Button
            variant="primary"
            size="sm"
            icon={<Icon name="plus" size={16} />}
            onClick={onNew}
          >
            New Chapter
          </Button>
        )}
      </div>
      <div className="chapter-list">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className={`chapter-item ${selectedChapterId === chapter.id ? 'active' : ''}`}
            onClick={() => onSelect && onSelect(chapter.id)}
          >
            <span className="chapter-number">{chapter.order}.</span>
            <span className="chapter-title">{chapter.title}</span>
            {onDelete && (
              <button
                className="chapter-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chapter.id);
                }}
                aria-label="Delete chapter"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        ))}
        {chapters.length === 0 && (
          <div className="chapter-empty">
            <p>No chapters yet</p>
            {onNew && (
              <Button variant="secondary" size="sm" onClick={onNew}>
                Create First Chapter
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterList;
