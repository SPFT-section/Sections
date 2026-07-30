import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { useAuthStore } from '../../store/authStore';
import { SECURITY_QUESTIONS } from '../../config/constants';
import './AuthModal.css';

// One modal, three views: 'login' | 'register' | 'forgot'.
// Keeping them together makes the "I don't have an account" / "forgot
// password" / "back to login" links trivial to wire up in one place.
export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, getSecurityQuestion, resetPassword } = useAuthStore();
  const [view, setView] = useState('login');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shared field state (simplest for a small form set like this).
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Forgot-password flow has its own two steps.
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const resetAllFields = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setSecurityQuestion(SECURITY_QUESTIONS[0]);
    setSecurityAnswer('');
    setForgotStep(1);
    setForgotQuestion('');
    setForgotAnswer('');
    setNewPassword('');
    setResetDone(false);
    setError('');
  };

  const switchView = (nextView) => {
    resetAllFields();
    setView(nextView);
  };

  const handleClose = () => {
    resetAllFields();
    setView('login');
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login({ username, password });
    setIsSubmitting(false);
    if (result.success) {
      handleClose();
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }
    setIsSubmitting(true);
    const result = await register({
      username,
      password,
      securityQuestion,
      securityAnswer,
    });
    setIsSubmitting(false);
    if (result.success) {
      handleClose();
    } else {
      setError(result.error);
    }
  };

  const handleForgotLookup = (e) => {
    e.preventDefault();
    setError('');
    const question = getSecurityQuestion(username);
    if (!question) {
      setError('ไม่พบชื่อผู้ใช้นี้');
      return;
    }
    setForgotQuestion(question);
    setForgotStep(2);
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await resetPassword({
      username,
      securityAnswer: forgotAnswer,
      newPassword,
    });
    setIsSubmitting(false);
    if (result.success) {
      setResetDone(true);
    } else {
      setError(result.error);
    }
  };

  const titles = {
    login: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    forgot: 'ลืมรหัสผ่าน',
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titles[view]} size="sm">
      {error && (
        <div className="auth-error">
          <Icon name="close" size={16} />
          <span>{error}</span>
        </div>
      )}

      {view === 'login' && (
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">ชื่อผู้ใช้</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
            เข้าสู่ระบบ
          </Button>

          <div className="auth-links">
            <button type="button" className="auth-link" onClick={() => switchView('forgot')}>
              ลืมรหัสผ่าน?
            </button>
            <button type="button" className="auth-link" onClick={() => switchView('register')}>
              ยังไม่มีบัญชี? สมัครสมาชิก
            </button>
          </div>

          <div className="auth-guest-divider">
            <span>หรือ</span>
          </div>
          <Button type="button" variant="secondary" fullWidth onClick={handleClose}>
            ใช้งานแบบไม่ต้องเข้าสู่ระบบ (Guest)
          </Button>
        </form>
      )}

      {view === 'register' && (
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">ชื่อผู้ใช้</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">ยืนยันรหัสผ่าน</label>
            <input
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">คำถามกู้คืนรหัสผ่าน</label>
            <select
              className="form-input"
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
            >
              {SECURITY_QUESTIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
            <p className="form-hint">
              ใช้สำหรับตั้งรหัสผ่านใหม่ในกรณีที่คุณลืมรหัสผ่าน กรุณาจำคำตอบให้แม่นยำ
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">คำตอบ</label>
            <input
              className="form-input"
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
            สมัครสมาชิก
          </Button>

          <div className="auth-links">
            <button type="button" className="auth-link" onClick={() => switchView('login')}>
              มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
            </button>
          </div>
        </form>
      )}

      {view === 'forgot' && (
        <div className="auth-form">
          {resetDone ? (
            <div className="auth-success">
              <Icon name="checkCircle" size={32} />
              <p>ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว</p>
              <Button variant="primary" fullWidth onClick={() => switchView('login')}>
                กลับไปเข้าสู่ระบบ
              </Button>
            </div>
          ) : forgotStep === 1 ? (
            <form onSubmit={handleForgotLookup}>
              <p className="form-hint">กรอกชื่อผู้ใช้ของคุณเพื่อดูคำถามกู้คืนรหัสผ่าน</p>
              <div className="form-group">
                <label className="form-label">ชื่อผู้ใช้</label>
                <input
                  className="form-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" variant="primary" fullWidth>
                ถัดไป
              </Button>
              <div className="auth-links">
                <button type="button" className="auth-link" onClick={() => switchView('login')}>
                  กลับไปเข้าสู่ระบบ
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotReset}>
              <div className="form-group">
                <label className="form-label">{forgotQuestion}</label>
                <input
                  className="form-input"
                  type="text"
                  value={forgotAnswer}
                  onChange={(e) => setForgotAnswer(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
                <input
                  className="form-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
                ตั้งรหัสผ่านใหม่
              </Button>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AuthModal;
