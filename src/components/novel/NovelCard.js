import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { format } from '../../utils/formatter';

export const NovelCard = ({ novel, onRead, onEdit, onDelete }) => {
  const navigate = useNavigate();
  if (!novel) return null;

  return (
    <div className="novel-card">
      <div className="novel-card-cover">
        {novel.coverImage ? (
          <img src={novel.coverImage} alt={novel.title} />
        ) : (
          <div className="novel-cover-placeholder">
            <Icon name="book" size={32} />
          </div>
        )}
        <span className={`novel-status-badge ${novel.status}`}>
          {novel.status}
        </span>
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
            icon={<Icon name="bookOpen" size={16} />}
            onClick={() => (onRead ? onRead(novel) : navigate(`/reader/${novel.id}`))}
          >
            Read
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon name="pencil" size={16} />}
            onClick={() => (onEdit ? onEdit(novel) : navigate(`/editor/${novel.id}`))}
          >
            Edit
          </Button>
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              icon={<Icon name="trash" size={16} />}
              onClick={() => onDelete(novel.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NovelCard;
