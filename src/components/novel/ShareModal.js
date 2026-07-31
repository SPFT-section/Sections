import React, { useMemo, useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { createShareLink } from '../../utils/shareLink';
import './ShareModal.css';

// Lets the author of a novel generate a link that lets anyone who opens it
// add a READ-ONLY copy of the novel to their own library — they can read
// it, but never edit or delete the original, and the app hides all editing
// controls for the imported copy too (see useNovel's isShared handling).
export const ShareModal = ({ isOpen, onClose, novel, authorName }) => {
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    if (!isOpen || !novel) return '';
    return createShareLink(novel, authorName);
  }, [isOpen, novel, authorName]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back to
      // a manual select so the person can still copy with Ctrl/Cmd+C.
      const input = document.getElementById('share-link-input');
      input?.select();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!novel) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="แชร์นิยาย" size="sm">
      <div className="share-modal-body">
        <div className="share-modal-notice">
          <Icon name="lock" size={16} />
          <span>
            คนที่เปิดลิงก์นี้จะ<strong>อ่านได้อย่างเดียว</strong> แก้ไขหรือลบต้นฉบับของคุณไม่ได้
          </span>
        </div>

        <label className="form-label" htmlFor="share-link-input">
          ลิงก์สำหรับแชร์ &ldquo;{novel.title}&rdquo;
        </label>
        <div className="share-link-row">
          <input
            id="share-link-input"
            className="form-input share-link-input"
            type="text"
            value={link}
            readOnly
            onFocus={(e) => e.target.select()}
          />
          <Button
            variant="primary"
            onClick={handleCopy}
            icon={<Icon name={copied ? 'check' : 'copy'} size={16} />}
          >
            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
          </Button>
        </div>

        <p className="share-modal-hint">
          ลิงก์นี้มีเนื้อหานิยายทั้งหมดฝังอยู่ในตัวเอง ไม่ต้องมีเซิร์ฟเวอร์ — ส่งให้ใครก็เปิดอ่านได้ทันที
          แต่ถ้าคุณแก้ไขนิยายภายหลัง ต้องส่งลิงก์ใหม่ให้อีกครั้งเพื่ออัปเดต
        </p>
      </div>
    </Modal>
  );
};

export default ShareModal;
