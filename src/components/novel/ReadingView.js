import React from 'react';
import { useContentProtection } from '../../utils/contentProtection';
import { splitIntoParagraphs } from '../../utils/textUtils';

// Single source of truth for rendering chapter content in the reader.
// Accepts a forwarded ref so a parent (e.g. NovelReader) can track scroll
// position on the same DOM node that content-protection is attached to.
export const ReadingView = React.forwardRef(({ chapter, styles, protect = true }, ref) => {
  useContentProtection(ref, protect);

  if (!chapter) return null;

  const paragraphs = splitIntoParagraphs(chapter.content);

  return (
    <div className="reader-content no-copy" style={styles} ref={ref}>
      <h1 className="reader-chapter-title">{chapter.title}</h1>
      <div className="reader-chapter-content">
        {paragraphs.map((line, index) => (
          // Rendered as React children (not dangerouslySetInnerHTML), so
          // React escapes the text itself — chapter content, including
          // imported share-link content, can never be interpreted as HTML.
          // data-paragraph-index gives useMusicPlayer's IntersectionObserver
          // a stable position to key music cues (startParagraph/
          // endParagraph) off of, without needing a second parse of the
          // chapter text.
          <p key={index} data-paragraph-index={index}>{line}</p>
        ))}
      </div>
    </div>
  );
});

ReadingView.displayName = 'ReadingView';

export default ReadingView;
