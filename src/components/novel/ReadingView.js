import React, { useRef } from 'react';
import { useContentProtection } from '../../utils/contentProtection';

export const ReadingView = ({ chapter, styles }) => {
  const contentRef = useRef(null);
  useContentProtection(contentRef, true);

  if (!chapter) return null;

  const paragraphsHtml = (chapter.content || '')
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `<p>${line}</p>`)
    .join('');

  return (
    <div className="reader-content no-copy" style={styles} ref={contentRef}>
      <h1 className="reader-chapter-title">{chapter.title}</h1>
      <div
        className="reader-chapter-content"
        dangerouslySetInnerHTML={{ __html: paragraphsHtml }}
      />
    </div>
  );
};

export default ReadingView;
