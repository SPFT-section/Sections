// Pure validation rules for the local account system. Kept separate from
// authStore.js (which needs React + localStorage) so the actual rules can
// be unit tested directly with Node's test runner, no browser needed.

export const validateRegistration = ({
  username,
  password,
  securityQuestion,
  securityAnswer,
  usernameTaken,
}) => {
  const cleanUsername = (username || '').trim();

  if (cleanUsername.length < 3) {
    return { valid: false, error: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' };
  }
  if (!password || password.length < 6) {
    return { valid: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
  }
  if (!securityQuestion || !securityAnswer || !securityAnswer.trim()) {
    return { valid: false, error: 'กรุณาตั้งคำถามและคำตอบกู้คืนรหัสผ่าน' };
  }
  if (usernameTaken) {
    return { valid: false, error: 'มีชื่อผู้ใช้นี้อยู่แล้ว' };
  }

  return { valid: true, cleanUsername };
};

export const validateNewPassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
  }
  return { valid: true };
};
