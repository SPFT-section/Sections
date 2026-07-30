import React from 'react';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { format } from '../../utils/formatter';

export const ChapterEditor = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  onPreview,
  onDelete,
  isNew = true,
}) => {
  return (
    <div className="chapter-editor">
      <div className="chapter-editor-header">
        <h3>{isNew ? 'New Chapter' : 'Edit Chapter'}</h3>
        {!isNew && (
          <div className="chapter-actions">
            {onPreview && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Icon name="eye" size={16} />}
                onClick={onPreview}
              >
                Preview
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                icon={<Icon name="trash" size={16} />}
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Chapter Title *</label>
        <input
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => onTitleChange && onTitleChange(e.target.value)}
          placeholder="Enter chapter title"
          maxLength={100}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Content *</label>
        <textarea
          className="form-textarea chapter-content"
          value={content}
          onChange={(e) => onContentChange && onContentChange(e.target.value)}
          placeholder="Write your chapter content here..."
          rows={15}
        />
        <div className="chapter-stats">
          <span>{format.wordCount(content)} words</span>
          <span>•</span>
          <span>{format.readingTime(content)}</span>
        </div>
      </div>

      <div className="chapter-actions-bottom">
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!title?.trim() || !content?.trim()}
        >
          <Icon name={isNew ? 'plus' : 'save'} size={20} />
          {isNew ? 'Add Chapter' : 'Update Chapter'}
        </Button>
      </div>
    </div>
  );
};

export default ChapterEditor;
