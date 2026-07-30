import React from 'react';
import { NovelCard } from './NovelCard';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

export const NovelList = ({
  novels = [],
  onRead,
  onEdit,
  onDelete,
  emptyTitle = 'No novels found',
  emptyMessage = 'Start writing your first novel today!',
  onEmptyAction,
  emptyActionLabel = 'Create Your First Novel',
}) => {
  if (!novels || novels.length === 0) {
    return (
      <div className="empty-state">
        <Icon name="library" size={64} className="empty-icon" />
        <h2>{emptyTitle}</h2>
        <p>{emptyMessage}</p>
        {onEmptyAction && (
          <Button
            variant="primary"
            icon={<Icon name="plus" size={20} />}
            onClick={onEmptyAction}
          >
            {emptyActionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="novel-grid">
      {novels.map((novel) => (
        <NovelCard
          key={novel.id}
          novel={novel}
          onRead={onRead}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default NovelList;
